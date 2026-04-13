import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, or, isNull, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const notificationsRouter = Router();

notificationsRouter.get("/notifications", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(
        or(isNull(notificationsTable.userId), eq(notificationsTable.userId, userId)),
      )
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);

    return res.json({
      notifications: notifications.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

notificationsRouter.patch(
  "/notifications/:id/read",
  requireAuth,
  async (req, res) => {
    try {
      await db
        .update(notificationsTable)
        .set({ isRead: true })
        .where(eq(notificationsTable.id, req.params.id));
      return res.json({ ok: true });
    } catch (err) {
      req.log.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  },
);

notificationsRouter.post(
  "/notifications/mark-all-read",
  requireAuth,
  async (req, res) => {
    try {
      await db
        .update(notificationsTable)
        .set({ isRead: true })
        .where(
          or(
            isNull(notificationsTable.userId),
            eq(notificationsTable.userId, req.userId!),
          ),
        );
      return res.json({ ok: true });
    } catch (err) {
      req.log.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  },
);

export default notificationsRouter;
