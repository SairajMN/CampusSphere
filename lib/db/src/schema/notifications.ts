import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  priority: text("priority").notNull().default("medium"),
  type: text("type").notNull(),
  eventId: text("event_id"),
  userId: text("user_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(
  notificationsTable,
).omit({ createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type DbNotification = typeof notificationsTable.$inferSelect;
