"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conceptSquads } from "@/lib/schema";
import type { ConceptPick } from "@/lib/schema";

// ─── Validation ──────────────────────────────────────────────────────────────

interface ValidationInput {
  picks: ConceptPick[];
  playerMap: Map<number, { element_type: number; team: number }>;
}

function validatePicks({ picks, playerMap }: ValidationInput): string | null {
  if (picks.length !== 11) return "Squad must have exactly 11 players.";

  const captains = picks.filter((p) => p.isCaptain);
  if (captains.length !== 1) return "Select exactly 1 captain.";

  const counts = { pos: { 1: 0, 2: 0, 3: 0, 4: 0 }, team: new Map<number, number>() };

  for (const pick of picks) {
    const p = playerMap.get(pick.playerId);
    if (!p) return "Unknown player in squad.";
    counts.pos[p.element_type as 1 | 2 | 3 | 4]++;
    counts.team.set(p.team, (counts.team.get(p.team) ?? 0) + 1);
  }

  if (counts.pos[1] !== 1) return "Must have exactly 1 goalkeeper.";
  if (counts.pos[2] < 2 || counts.pos[2] > 5) return "Defenders: 2–5 required.";
  if (counts.pos[3] < 2 || counts.pos[3] > 5) return "Midfielders: 2–5 required.";
  if (counts.pos[4] < 1 || counts.pos[4] > 3) return "Forwards: 1–3 required.";

  for (const [, n] of counts.team) {
    if (n > 3) return "Max 3 players from any one club.";
  }

  return null;
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createConceptSquad(formData: FormData): Promise<void> {
  const name    = (formData.get("name") as string | null)?.trim() || null;
  const gw      = parseInt(formData.get("gameweek") as string, 10);
  const rawJson = formData.get("picks") as string;

  let picks: ConceptPick[];
  try {
    picks = JSON.parse(rawJson);
  } catch {
    throw new Error("Invalid picks data.");
  }

  // Server-side re-validation using FPL bootstrap
  const { getBootstrap, getCurrentEvent } = await import("@/lib/fpl");
  const [bootstrap, currentEvent] = await Promise.all([getBootstrap(), getCurrentEvent()]);
  const playerMap = new Map(bootstrap.elements.map((p) => ({ id: p.id, et: p.element_type, t: p.team })).map((x) => [x.id, { element_type: x.et, team: x.t }]));

  const error = validatePicks({ picks, playerMap });
  if (error) throw new Error(error);

  const gameweek = !isNaN(gw) ? gw : (currentEvent?.id ?? 1);

  const [row] = await db
    .insert(conceptSquads)
    .values({ name, picks, gameweek })
    .returning({ id: conceptSquads.id });

  redirect(`/concept/${row.id}`);
}

// ─── Get ─────────────────────────────────────────────────────────────────────

export async function getConceptSquad(id: string) {
  const rows = await db
    .select()
    .from(conceptSquads)
    .where(eq(conceptSquads.id, id))
    .limit(1);
  return rows[0] ?? null;
}
