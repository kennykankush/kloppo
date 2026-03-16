# Gaffer Embassy

FPL analytics app — player stats, fixtures, difficulty ratings, dream team, and manager lookup.
Migrated from Spring Boot + Thymeleaf to **Next.js 15 · TypeScript · Tailwind CSS**.

---

## Pages

| Route | Page | What it shows |
|-------|------|---------------|
| `/` | Home | GW countdown, dream team, trending transfers, form kings, hidden gems, FDR mini-table, notable managers |
| `/players` | Players | Full player table — cost, points, form, ICT, net transfers |
| `/players/:id` | Player Detail | Full stat breakdown, ICT bars, season profile |
| `/fixtures/:gw` | Fixtures | Match scores/times, prev/next GW nav, live badge |
| `/fdr` | FDR Matrix | Full 20-team × 38-GW fixture difficulty grid |
| `/teams` | Teams | All 20 clubs with strength ratings |
| `/gaffers/:id` | Manager Lookup | Squad, live points, GW history, rank badges |

---

## FPL API — Data Flow

Base URL: `https://fantasy.premierleague.com/api`
No API key required. All endpoints are public.

---

### `GET /bootstrap-static/`
> **The main data dump.** Called on almost every page. One request, everything.

```
FPL API → /bootstrap-static/
         └── Retrieved
              ├── elements[]         ~700 Premier League players + full season stats
              ├── teams[]            All 20 clubs (name, short_name, strength ratings)
              ├── events[]           All 38 gameweeks (deadlines, averages, top performers, chip plays)
              ├── element_types[]    Position definitions (GK / DEF / MID / FWD)
              └── total_players      Total number of FPL managers this season
```

**Cache:** `revalidate: 300` (5 min)
**Used by:** Home, Players, Player Detail, FDR, Teams, Fixtures, Gaffers

---

### `GET /fixtures/`  &  `GET /fixtures/?event={gw}`
> **All 380 fixtures, or just one gameweek's worth.**

```
FPL API → /fixtures/
         └── Retrieved
              ├── team_h / team_a              Home and away team IDs
              ├── team_h_score / team_a_score  Final scores (null if not played)
              ├── kickoff_time                 ISO datetime string
              ├── finished / started           Match state flags
              └── team_h_difficulty / team_a_difficulty   FDR value 1–5

FPL API → /fixtures/?event={gw}
         └── Same fields, scoped to a single gameweek
```

**Cache:** `revalidate: 300`
**Used by:** Fixtures page, FDR matrix, Home (FDR mini-table)

---

### `GET /event/{gw}/live/`
> **Live in-gameweek player stats.** Refreshes during matches.

```
FPL API → /event/{gw}/live/
         └── Retrieved
              ├── elements[].id                Player ID
              ├── elements[].stats
              │    ├── total_points            Points scored this GW
              │    ├── minutes / goals_scored / assists / clean_sheets
              │    ├── bonus / bps             Bonus points + BPS score
              │    ├── influence / creativity / threat / ict_index
              │    ├── expected_goals / expected_assists / expected_goal_involvements
              │    └── in_dreamteam            ✅ Used to build GW Dream Team (not the /dream-team/ endpoint)
              └── explain[]                    Point-by-point breakdown per player
```

**Cache:** `revalidate: 120` (2 min — refreshes during live matches)
**Used by:** Home (dream team), Gaffers page (live squad points)

---

### `GET /entry/{manager_id}/`
> **Public profile for any FPL manager.**

```
FPL API → /entry/{manager_id}/
         └── Retrieved
              ├── name                         Squad name
              ├── player_first_name / player_last_name
              ├── summary_overall_points       Total season points
              ├── summary_overall_rank         Season rank
              ├── summary_event_points         Latest GW points
              └── summary_event_rank           Latest GW rank
```

**Cache:** `revalidate: 60`
**Used by:** Gaffers page

---

### `GET /entry/{manager_id}/history/`
> **Full season GW-by-GW history for a manager.**

```
FPL API → /entry/{manager_id}/history/
         └── Retrieved
              └── current[]
                   ├── event                  Gameweek number
                   ├── points                 GW points scored
                   ├── rank                   GW rank
                   ├── overall_rank           Cumulative season rank
                   ├── event_transfers        Transfers made
                   ├── event_transfers_cost   Points hit taken
                   ├── value                  Team value (÷10 = £m)
                   └── points_on_bench        Points left on bench
```

**Cache:** `revalidate: 60`
**Used by:** Gaffers page (sparkline chart + history table)

---

### `GET /entry/{manager_id}/event/{gw}/picks/`
> **The squad a manager selected for a specific gameweek.**

```
FPL API → /entry/{manager_id}/event/{gw}/picks/
         └── Retrieved
              ├── picks[]
              │    ├── element                Player ID
              │    ├── position               1–15 (1–11 starters, 12–15 bench)
              │    ├── multiplier             1 = normal, 2 = captain, 3 = triple captain
              │    ├── is_captain / is_vice_captain
              │    └── element_type           Position type (1–4)
              ├── active_chip                 Chip played this GW (or null)
              └── entry_history
                   ├── points / rank          GW performance
                   ├── overall_rank           Season rank at this GW
                   ├── percentile_rank        Percentile (used for rank badge)
                   ├── value / bank           Team value + remaining budget
                   └── event_transfers / event_transfers_cost
```

**Cache:** `revalidate: 60`
**Used by:** Gaffers page (squad pitch, captain, chip display)

---

## Rank Badge System

Two badges on every manager profile — one for weekly percentile, one for season rank:

| Badge | Weekly (percentile) | Season (overall rank) |
|-------|--------------------|-----------------------|
| Challenger | Top 5% | < 100k |
| Platinum | Top 20% | < 1M |
| Gold | Top 40% | < 2.5M |
| Silver | Top 65% | < 6.5M |
| Bronze | Top 80% | < 9M |
| Iron | Bottom 20% | 9M+ |

The `percentile_rank` field is read directly from `entry_history` in the picks response — not calculated manually.
Dream team membership comes from `in_dreamteam` in the live data — not from the `/dream-team/` endpoint.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Data | FPL Public API (no key needed) |
| Caching | Next.js fetch cache (`revalidate`) |
| Images | `next/image` — FPL CDN + transparent PNG fallback |
| Fonts | Poppins (Google Fonts, 400–900) |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables needed.

---

## Coming Soon

- **Concept Squad** — pick any 11, get live combined points + shareable UUID link *(needs Postgres — Neon/Supabase/Railway)*
- **Player comparison** — side-by-side stat breakdown for 2+ players
- **Transfer planner** — target a player, see optimal sell candidates

---

## Origin

Rebuilt from [`gaffer-embassy`](../gaffer-embassy) — a Spring Boot 3 + Thymeleaf + Redis university project. Redis caching replaced by Next.js fetch revalidation. Thymeleaf templates replaced by React server components.
