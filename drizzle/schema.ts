import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  trialCredits: int("trialCredits").default(50).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Server-only daily relationship analysis. Its payload is never placed in GameState. */
export const relationshipDailySummaries = mysqlTable("relationshipDailySummaries", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  campaignId: varchar("campaignId", { length: 120 }).notNull(),
  contactId: varchar("contactId", { length: 32 }).notNull(),
  inGameDay: int("inGameDay").notNull(),
  sourceHash: varchar("sourceHash", { length: 64 }).notNull(),
  analysisVersion: varchar("analysisVersion", { length: 40 }).notNull(),
  evidenceJson: text("evidenceJson").notNull(),
  publicSummaryJson: text("publicSummaryJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceUnique: uniqueIndex("relationship_summary_source_unique").on(table.ownerId, table.campaignId, table.contactId, table.inGameDay, table.sourceHash),
}));

export type RelationshipDailySummary = typeof relationshipDailySummaries.$inferSelect;
export type InsertRelationshipDailySummary = typeof relationshipDailySummaries.$inferInsert;
