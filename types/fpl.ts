// ─── Player ──────────────────────────────────────────────────────────────────

export interface Player {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number; // FPL team ID
  element_type: 1 | 2 | 3 | 4; // 1=GK, 2=DEF, 3=MID, 4=FWD
  status: "a" | "d" | "u" | "s" | "n"; // available, doubtful, unavailable, suspended, not in squad
  photo: string; // e.g. "100123.jpg"
  now_cost: number; // in tenths (e.g. 80 = £8.0m)
  cost_change_event: number;
  cost_change_start: number;
  total_points: number;
  points_per_game: string;
  event_points: number;
  form: string;
  selected_by_percent: string;
  transfers_in: number;
  transfers_out: number;
  transfers_in_event: number;
  transfers_out_event: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  yellow_cards: number;
  red_cards: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  ep_this: string;
  ep_next: string;
  chance_of_playing_next_round: number | null;
  news: string;
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
  code: number;
  strength: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

// ─── Fixture ──────────────────────────────────────────────────────────────────

export interface Fixture {
  id: number;
  code: number;
  event: number; // gameweek
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  kickoff_time: string | null;
  finished: boolean;
  started: boolean;
  team_h_difficulty: number;
  team_a_difficulty: number;
}

// ─── Event (Gameweek) ─────────────────────────────────────────────────────────

export interface FPLEvent {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
  average_entry_score: number;
  highest_score: number;
  most_selected: number;
  most_transferred_in: number;
  most_captained: number;
  most_vice_captained: number;
  top_element: number;
  top_element_info: { id: number; points: number } | null;
  chip_plays: { chip_name: string; num_played: number }[];
  transfers_made: number;
}

// ─── Bootstrap (main FPL endpoint) ───────────────────────────────────────────

export interface FPLBootstrap {
  events: FPLEvent[];
  teams: FPLTeam[];
  elements: Player[];
  element_types: { id: number; singular_name: string; singular_name_short: string; plural_name: string }[];
  total_players: number;
}

// ─── Live Gameweek ────────────────────────────────────────────────────────────

export interface LivePlayerStats {
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  total_points: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  in_dreamteam: boolean; // used to build Team of the Week
}

export interface LivePlayer {
  id: number;
  stats: LivePlayerStats;
  explain: unknown[];
}

export interface FPLLive {
  elements: LivePlayer[];
}

// ─── Dream Team ───────────────────────────────────────────────────────────────

export interface DreamTeamPlayer {
  id: number;
  points: number;
}

export interface FPLDreamTeam {
  top_players: DreamTeamPlayer[];
}

// ─── Manager / Gaffer ─────────────────────────────────────────────────────────

export interface GafferPick {
  element: number; // player id
  position: number; // 1-15
  multiplier: number; // 1 or 2 (captain)
  is_captain: boolean;
  is_vice_captain: boolean;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD (included per pick by FPL API)
}

export interface GafferEntry {
  id: number;
  player_first_name: string;
  player_last_name: string;
  name: string; // squad name
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
}

export interface GafferHistory {
  current: { event: number; points: number; rank: number; event_transfers: number; event_transfers_cost: number; value: number; bank: number; points_on_bench: number }[];
}

export interface GafferPicks {
  active_chip: string | null;
  picks: GafferPick[];
  entry_history: {
    event: number;
    points: number;
    rank: number;
    overall_rank: number;
    percentile_rank: number; // weekly percentile rank, provided directly by FPL API
    event_transfers: number;
    event_transfers_cost: number;
    value: number;
    bank: number;
    points_on_bench: number;
    total_points: number;
  };
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────

export type RankTier = "Challenger" | "Platinum" | "Gold" | "Silver" | "Bronze" | "Iron";

// ─── FDR helpers ─────────────────────────────────────────────────────────────

export interface TeamFDRRow {
  team: FPLTeam;
  fixtures: { opponent: string; difficulty: number; isHome: boolean }[];
}
