import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const eventRegistrationsTable = pgTable(
  "event_registrations",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.eventId, t.userId)],
);

export type DbEventRegistration =
  typeof eventRegistrationsTable.$inferSelect;
