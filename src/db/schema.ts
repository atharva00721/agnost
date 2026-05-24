import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  framework: text("framework").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("active"),
});

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  framework: text("framework").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  payload: jsonb("payload").notNull(),
});

export const sessionRelations = relations(sessions, ({ many }) => ({
  events: many(events),
}));
