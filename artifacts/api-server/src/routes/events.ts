import { Router } from "express";
import { db } from "@workspace/db";
import {
  eventsTable,
  eventRegistrationsTable,
  notificationsTable,
} from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middlewares/auth";
import { randomUUID } from "crypto";

const eventsRouter = Router();

eventsRouter.get("/events", optionalAuth, async (req, res) => {
  try {
    const events = await db
      .select()
      .from(eventsTable)
      .orderBy(desc(eventsTable.createdAt));

    const userId = req.userId;
    let registeredEventIds = new Set<string>();
    if (userId) {
      const regs = await db
        .select({ eventId: eventRegistrationsTable.eventId })
        .from(eventRegistrationsTable)
        .where(eq(eventRegistrationsTable.userId, userId));
      registeredEventIds = new Set(regs.map((r) => r.eventId));
    }

    const result = events.map((e) => ({
      ...e,
      tags: (e.tags as string[]) ?? [],
      target: e.target ?? {
        departments: [],
        years: [],
        sections: [],
        includeAll: true,
      },
      isRegistered: registeredEventIds.has(e.id),
      approvedAt: e.approvedAt?.toISOString() ?? undefined,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));

    return res.json({ events: result });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

eventsRouter.get("/events/:id", optionalAuth, async (req, res) => {
  try {
    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, req.params.id))
      .limit(1);

    if (!event) return res.status(404).json({ error: "Event not found" });

    await db
      .update(eventsTable)
      .set({ viewCount: event.viewCount + 1 })
      .where(eq(eventsTable.id, event.id));

    const userId = req.userId;
    let isRegistered = false;
    if (userId) {
      const [reg] = await db
        .select()
        .from(eventRegistrationsTable)
        .where(
          and(
            eq(eventRegistrationsTable.eventId, event.id),
            eq(eventRegistrationsTable.userId, userId),
          ),
        )
        .limit(1);
      isRegistered = !!reg;
    }

    return res.json({
      event: {
        ...event,
        viewCount: event.viewCount + 1,
        tags: (event.tags as string[]) ?? [],
        target: event.target,
        isRegistered,
        approvedAt: event.approvedAt?.toISOString() ?? undefined,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

eventsRouter.post("/events", requireAuth, async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const id = randomUUID();
    const now = new Date();

    await db.insert(eventsTable).values({
      id,
      title: String(body.title),
      description: String(body.description),
      date: String(body.date),
      time: String(body.time),
      endTime: body.endTime ? String(body.endTime) : null,
      venue: String(body.venue),
      organizer: String(body.organizer),
      organizerId: req.userId!,
      department: String(body.department),
      status: "draft",
      priority: String(body.priority ?? "regular"),
      category: String(body.category),
      maxCapacity: body.maxCapacity ? Number(body.maxCapacity) : null,
      registeredCount: 0,
      tags: (body.tags as string[]) ?? [],
      target: (body.target as object) ?? {
        departments: [],
        years: [],
        sections: [],
        includeAll: true,
      },
      registrationUrl: body.registrationUrl ? String(body.registrationUrl) : null,
      registrationDeadline: body.registrationDeadline
        ? String(body.registrationDeadline)
        : null,
      fee: body.fee ? Number(body.fee) : 0,
      viewCount: 0,
    });

    const [created] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, id))
      .limit(1);

    await db.insert(notificationsTable).values({
      id: randomUUID(),
      title: "New Event Submitted",
      body: `"${created.title}" has been submitted for approval`,
      priority: "high",
      type: "event_created",
      eventId: id,
    });

    return res.status(201).json({
      event: {
        ...created,
        tags: (created.tags as string[]) ?? [],
        target: created.target,
        isRegistered: false,
        approvedAt: undefined,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

eventsRouter.patch("/events/:id/status", requireAuth, async (req, res) => {
  try {
    const { status, comment } = req.body as {
      status: string;
      comment?: string;
    };
    const now = new Date();

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: now,
    };

    if (status === "approved" || status === "published") {
      updateData.approvedBy = req.userId;
      updateData.approvedAt = now;
    }

    await db
      .update(eventsTable)
      .set(updateData)
      .where(eq(eventsTable.id, req.params.id));

    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, req.params.id))
      .limit(1);

    if (!event) return res.status(404).json({ error: "Event not found" });

    await db.insert(notificationsTable).values({
      id: randomUUID(),
      title:
        status === "published"
          ? "Event Published!"
          : status === "approved"
            ? "Event Approved!"
            : "Event Updated",
      body: `"${event.title}" is now ${status}${comment ? `: ${comment}` : ""}`,
      priority: status === "published" || status === "approved" ? "high" : "medium",
      type: status === "approved" ? "event_approved" : "update",
      eventId: event.id,
    });

    return res.json({
      event: {
        ...event,
        tags: (event.tags as string[]) ?? [],
        target: event.target,
        isRegistered: false,
        approvedAt: event.approvedAt?.toISOString() ?? undefined,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

eventsRouter.post("/events/:id/register", requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.userId!;

    const [existing] = await db
      .select()
      .from(eventRegistrationsTable)
      .where(
        and(
          eq(eventRegistrationsTable.eventId, eventId),
          eq(eventRegistrationsTable.userId, userId),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .delete(eventRegistrationsTable)
        .where(eq(eventRegistrationsTable.id, existing.id));
      await db
        .update(eventsTable)
        .set({ registeredCount: db.$count(eventRegistrationsTable, eq(eventRegistrationsTable.eventId, eventId)) })
        .where(eq(eventsTable.id, eventId));

      const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
      await db.update(eventsTable).set({ registeredCount: Math.max(0, (event?.registeredCount ?? 1) - 1) }).where(eq(eventsTable.id, eventId));

      return res.json({ isRegistered: false });
    } else {
      await db.insert(eventRegistrationsTable).values({
        id: randomUUID(),
        eventId,
        userId,
      });
      const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
      await db.update(eventsTable).set({ registeredCount: (event?.registeredCount ?? 0) + 1 }).where(eq(eventsTable.id, eventId));

      return res.json({ isRegistered: true });
    }
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default eventsRouter;
