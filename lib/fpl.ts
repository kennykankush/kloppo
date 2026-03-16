import type {
  FPLBootstrap,
  FPLLive,
  GafferEntry,
  GafferHistory,
  GafferPicks,
  Player,
  FPLEvent,
  FPLTeam,
  Fixture,
  RankTier,
  TeamFDRRow,
} from "@/types/fpl";

const FPL_BASE = "https://fantasy.premierleague.com/api";

// ─── Cache helpers ────────────────────────────────────────────────────────────
// Bootstrap data changes ~once per GW, so revalidate every 5 minutes.
// Live data updates every ~2 minutes during matches.

async function fplFetch<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${FPL_BASE}${path}`, {
    next: { revalidate },
    headers: { "User-Agent": "gaffer-embassy/1.0" },
  });
  if (!res.ok) throw new Error(`FPL API error ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

export async function getBootstrap(): Promise<FPLBootstrap> {
  return fplFetch<FPLBootstrap>("/bootstrap-static/", 300);
}

// ─── Players ──────────────────────────────────────────────────────────────────

export async function getAllPlayers(): Promise<Player[]> {
  const data = await getBootstrap();
  return data.elements;
}

export async function getPlayerById(id: number): Promise<Player | undefined> {
  const players = await getAllPlayers();
  return players.find((p) => p.id === id);
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function getAllTeams(): Promise<FPLTeam[]> {
  const data = await getBootstrap();
  return data.teams;
}

export function getTeamById(teams: FPLTeam[], id: number): FPLTeam | undefined {
  return teams.find((t) => t.id === id);
}

// ─── Events / Gameweeks ───────────────────────────────────────────────────────

export async function getAllEvents(): Promise<FPLEvent[]> {
  const data = await getBootstrap();
  return data.events;
}

export async function getCurrentEvent(): Promise<FPLEvent | undefined> {
  const events = await getAllEvents();
  return events.find((e) => e.is_current) ?? events.find((e) => e.is_next);
}

export async function getNextEvent(): Promise<FPLEvent | undefined> {
  const events = await getAllEvents();
  return events.find((e) => e.is_next);
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

export async function getAllFixtures(): Promise<Fixture[]> {
  return fplFetch<Fixture[]>("/fixtures/", 300);
}

export async function getFixturesByGameweek(gw: number): Promise<Fixture[]> {
  return fplFetch<Fixture[]>(`/fixtures/?event=${gw}`, 300);
}

// ─── Live Data ────────────────────────────────────────────────────────────────

export async function getLiveData(gw: number): Promise<FPLLive> {
  // Live data: revalidate every 2 minutes
  return fplFetch<FPLLive>(`/event/${gw}/live/`, 120);
}


// ─── Manager / Gaffer ─────────────────────────────────────────────────────────

export async function getGafferEntry(managerId: string): Promise<GafferEntry> {
  return fplFetch<GafferEntry>(`/entry/${managerId}/`, 60);
}

export async function getGafferHistory(managerId: string): Promise<GafferHistory> {
  return fplFetch<GafferHistory>(`/entry/${managerId}/history/`, 60);
}

export async function getGafferPicks(managerId: string, gw: number): Promise<GafferPicks> {
  return fplFetch<GafferPicks>(`/entry/${managerId}/event/${gw}/picks/`, 60);
}

// ─── Rank Badge Logic (ported from TeamProcessor.java) ───────────────────────

export function mapRankBadge(percentileRank: number): RankTier {
  if (percentileRank < 5) return "Challenger";
  if (percentileRank < 20) return "Platinum";
  if (percentileRank < 40) return "Gold";
  if (percentileRank < 65) return "Silver";
  if (percentileRank < 80) return "Bronze";
  return "Iron";
}

export function mapOverallBadge(overallRank: number): RankTier {
  if (overallRank < 100_000) return "Challenger";
  if (overallRank < 1_000_000) return "Platinum";
  if (overallRank < 2_500_000) return "Gold";
  if (overallRank < 6_500_000) return "Silver";
  if (overallRank < 9_000_000) return "Bronze";
  return "Iron";
}

// ─── Percentile Rank ─────────────────────────────────────────────────────────
// FPL doesn't expose total manager count directly; ~11M is a reasonable estimate.

const TOTAL_MANAGERS = 11_000_000;

export function calcPercentileRank(overallRank: number): number {
  return parseFloat(((overallRank / TOTAL_MANAGERS) * 100).toFixed(1));
}

// ─── Player Helpers ───────────────────────────────────────────────────────────

export function positionName(elementType: number): string {
  switch (elementType) {
    case 1: return "Goalkeeper";
    case 2: return "Defender";
    case 3: return "Midfielder";
    case 4: return "Forward";
    default: return "Unknown";
  }
}

export function positionShort(elementType: number): string {
  switch (elementType) {
    case 1: return "GK";
    case 2: return "DEF";
    case 3: return "MID";
    case 4: return "FWD";
    default: return "?";
  }
}

export function playerCost(nowCost: number): string {
  return `£${(nowCost / 10).toFixed(1)}m`;
}

export function playerPhotoUrl(photo: string): string {
  // FPL photo field is like "100123.jpg" — replace .jpg with .png for the CDN
  const code = photo.replace(".jpg", "");
  return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${code}.png`;
}

export function playerStatus(status: string): { label: string; color: string } {
  switch (status) {
    case "a": return { label: "Available", color: "text-green-400" };
    case "d": return { label: "Doubtful", color: "text-yellow-400" };
    case "u": return { label: "Unavailable", color: "text-red-400" };
    case "s": return { label: "Suspended", color: "text-red-400" };
    default:  return { label: "Unknown", color: "text-gray-400" };
  }
}

// ─── FDR Helpers ─────────────────────────────────────────────────────────────

export function fdrColor(difficulty: number): string {
  switch (difficulty) {
    case 1: return "bg-[#375523] text-white";
    case 2: return "bg-[#01FC7A] text-black";
    case 3: return "bg-[#E7E7E7] text-black";
    case 4: return "bg-[#FF1751] text-white";
    case 5: return "bg-[#80072D] text-white";
    default: return "bg-gray-700 text-white";
  }
}

export function buildFDRRows(
  teams: FPLTeam[],
  fixtures: Fixture[],
  fromGW: number,
  toGW: number
): TeamFDRRow[] {
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  return teams.map((team) => {
    const fixturesByGW: TeamFDRRow["fixtures"] = [];

    for (let gw = fromGW; gw <= toGW; gw++) {
      const match = fixtures.find(
        (f) => f.event === gw && (f.team_h === team.id || f.team_a === team.id)
      );

      if (!match) {
        fixturesByGW.push({ opponent: "-", difficulty: 3, isHome: false });
        continue;
      }

      const isHome = match.team_h === team.id;
      const opponentId = isHome ? match.team_a : match.team_h;
      const opponent = teamMap.get(opponentId);
      const difficulty = isHome ? match.team_h_difficulty : match.team_a_difficulty;

      fixturesByGW.push({
        opponent: opponent?.short_name ?? "?",
        difficulty,
        isHome,
      });
    }

    return { team, fixtures: fixturesByGW };
  });
}

// ─── Home Page Analytics ─────────────────────────────────────────────────────

export function getTopTransfersIn(players: Player[], limit = 10): Player[] {
  return [...players].sort((a, b) => b.transfers_in_event - a.transfers_in_event).slice(0, limit);
}

export function getTopTransfersOut(players: Player[], limit = 10): Player[] {
  return [...players].sort((a, b) => b.transfers_out_event - a.transfers_out_event).slice(0, limit);
}

export function getFormKings(players: Player[], limit = 10): Player[] {
  return [...players].sort((a, b) => parseFloat(b.form) - parseFloat(a.form)).slice(0, limit);
}

export function getPremiumPlayers(players: Player[], limit = 10): Player[] {
  return [...players]
    .filter((p) => p.now_cost > 80)
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, limit);
}

export function getHiddenGems(players: Player[], limit = 10): Player[] {
  return [...players]
    .filter((p) => parseFloat(p.selected_by_percent) < 10)
    .sort((a, b) => parseFloat(b.points_per_game) - parseFloat(a.points_per_game))
    .slice(0, limit);
}

// ─── All Star Gaffers (hardcoded famous FPL managers) ────────────────────────

export const ALL_STAR_GAFFERS = [
  { name: "Mo Salah", id: "8206546" },
  { name: "Magnus Carlsen", id: "5977880" },
  { name: "Diogo Jota", id: "3529194" },
  { name: "Alexander-Arnold", id: "3622273" },
  { name: "James Maddison", id: "4038250" },
  { name: "Ben Foster", id: "2676063" },
  { name: "Kieran Trippier", id: "3533898" },
  { name: "Ibou Konaté", id: "4156744" },
  { name: "Mason Mount", id: "4025998" },
  { name: "Patrick van Aanholt", id: "1194816" },
];
