import { pgTable, uuid, text, jsonb, timestamp, integer } from "drizzle-orm/pg-core";

export interface ConceptPick {
  playerId: number;
  isCaptain: boolean;
}

export const conceptSquads = pgTable("concept_squads", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      text("name"),
  picks:     jsonb("picks").notNull().$type<ConceptPick[]>(),
  gameweek:  integer("gameweek").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ConceptSquad    = typeof conceptSquads.$inferSelect;
export type NewConceptSquad = typeof conceptSquads.$inferInsert;
