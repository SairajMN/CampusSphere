import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  endTime: text("end_time"),
  venue: text("venue").notNull(),
  organizer: text("organizer").notNull(),
  organizerId: text("organizer_id").notNull(),
  department: text("department").notNull(),
  status: text("status").notNull().default("draft"),
  priority: text("priority").notNull().default("regular"),
  category: text("category").notNull(),
  maxCapacity: integer("max_capacity"),
  registeredCount: integer("registered_count").notNull().default(0),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  target: jsonb("target")
    .$type<{
      departments: string[];
      years: number[];
      sections: string[];
      includeAll: boolean;
    }>()
    .notNull()
    .default({ departments: [], years: [], sections: [], includeAll: true }),
  registrationUrl: text("registration_url"),
  registrationDeadline: text("registration_deadline"),
  fee: integer("fee").default(0),
  imageUri: text("image_uri"),
  viewCount: integer("view_count").notNull().default(0),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type DbEvent = typeof eventsTable.$inferSelect;
