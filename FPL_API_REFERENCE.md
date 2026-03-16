# FPL API — Complete Reference

> **Base URL:** `https://fantasy.premierleague.com/api`
> No API key required. All endpoints are public (read-only).
> Recommended: add `User-Agent` header to avoid rate limiting.

---

## Quick Search Index

| I want to get... | Endpoint |
|------------------|----------|
| All players + stats | [`/bootstrap-static/`](#1-bootstrap-static) |
| All 20 teams | [`/bootstrap-static/`](#1-bootstrap-static) → `teams[]` |
| All gameweeks + deadlines | [`/bootstrap-static/`](#1-bootstrap-static) → `events[]` |
| Player's upcoming fixtures | [`/element-summary/{id}/`](#5-element-summary) → `fixtures[]` |
| Player's GW-by-GW history | [`/element-summary/{id}/`](#5-element-summary) → `history[]` |
| Player's previous seasons | [`/element-summary/{id}/`](#5-element-summary) → `history_past[]` |
| All 380 fixtures | [`/fixtures/`](#2-fixtures) |
| Fixtures for one gameweek | [`/fixtures/?event={gw}`](#2-fixtures) |
| Live points during a GW | [`/event/{gw}/live/`](#4-live-gameweek-data) |
| Official GW dream team | [`/dream-team/{gw}/`](#6-dream-team) |
| Manager profile | [`/entry/{id}/`](#7-manager-entry) |
| Manager full GW history | [`/entry/{id}/history/`](#8-manager-history) |
| Manager's squad for a GW | [`/entry/{id}/event/{gw}/picks/`](#9-manager-gw-picks) |
| Manager's transfer history | [`/entry/{id}/transfers/`](#10-manager-transfers) |
| Classic league standings | [`/leagues-classic/{id}/standings/`](#11-classic-league-standings) |
| H2H league standings | [`/leagues-h2h/{id}/standings/`](#12-h2h-league-standings) |
| H2H match results | [`/leagues-h2h-matches/league/{id}/`](#13-h2h-matches) |
| Current event status | [`/event-status/`](#14-event-status) |

---

## 1. Bootstrap Static

> **The main data dump.** One call returns almost everything you need about the current season.

```
GET /bootstrap-static/
```

**No parameters.**

**Response shape:**

```jsonc
{
  "events": [ /* all 38 gameweeks */ ],
  "game_settings": { /* season config */ },
  "phases": [ /* month groupings for mini-leagues */ ],
  "teams": [ /* all 20 PL clubs */ ],
  "total_players": 11482156,       // total FPL managers this season
  "elements": [ /* all ~700 players */ ],
  "element_stats": [ /* stat definitions with display labels */ ],
  "element_types": [ /* GK / DEF / MID / FWD definitions */ ]
}
```

---

### `events[]` — Gameweeks

```jsonc
{
  "id": 29,
  "name": "Gameweek 29",
  "deadline_time": "2024-03-16T11:00:00Z",
  "deadline_time_epoch": 1710586800,
  "release_time": null,
  "average_entry_score": 52,          // GW average points
  "finished": true,
  "data_checked": true,
  "highest_scoring_entry": 4820934,   // manager ID of top GW scorer
  "highest_score": 142,
  "is_previous": false,
  "is_current": true,
  "is_next": false,
  "cup_leagues_created": false,
  "h2h_ko_matches_created": false,
  "ranked_count": 0,
  "chip_plays": [
    { "chip_name": "bboost",  "num_played": 142831 },  // bench boost
    { "chip_name": "3xc",     "num_played": 89233 },   // triple captain
    { "chip_name": "freehit", "num_played": 301122 },  // free hit
    { "chip_name": "wildcard","num_played": 451022 }
  ],
  "most_selected": 328,               // player ID most selected overall
  "most_transferred_in": 351,         // player ID most transferred in
  "most_captained": 328,              // player ID most captained
  "most_vice_captained": 351,
  "top_element": 328,                 // player ID with most GW points
  "top_element_info": {
    "id": 328,
    "points": 22
  },
  "transfers_made": 3214882,          // total transfers made this GW
  "can_enter": false,
  "can_manage": false,
  "released": null
}
```

---

### `teams[]` — Clubs

```jsonc
{
  "code": 3,                          // used for badge URLs
  "draw": 4,
  "form": null,
  "id": 1,                            // FPL team ID (used everywhere)
  "loss": 5,
  "name": "Arsenal",
  "played": 28,
  "points": 58,
  "position": 2,
  "short_name": "ARS",
  "strength": 4,                      // overall strength 1–5
  "team_division": null,
  "unavailable": false,
  "win": 19,
  "strength_overall_home": 1300,      // used for FDR calculations
  "strength_overall_away": 1280,
  "strength_attack_home": 1320,
  "strength_attack_away": 1300,
  "strength_defence_home": 1280,
  "strength_defence_away": 1260,
  "pulse_id": 1
}
```

---

### `elements[]` — Players

```jsonc
{
  // Identity
  "id": 328,
  "code": 69140,                      // used in photo URL: p69140.png
  "first_name": "Mohamed",
  "second_name": "Salah",
  "web_name": "Salah",                // display name used in FPL
  "team": 11,                         // FPL team ID
  "team_code": 14,                    // team badge code
  "element_type": 3,                  // 1=GK 2=DEF 3=MID 4=FWD
  "photo": "69140.jpg",               // → p69140.png on CDN

  // Status
  "status": "a",                      // a=available d=doubtful u=unavailable s=suspended n=not in squad
  "news": "",                         // injury news string
  "news_added": null,
  "chance_of_playing_this_round": 100,
  "chance_of_playing_next_round": 100,

  // Cost
  "now_cost": 129,                    // divide by 10 → £12.9m
  "cost_change_start": 4,             // change since season start (÷10)
  "cost_change_event": 1,             // change since last GW (÷10)
  "cost_change_start_fall": -4,
  "cost_change_event_fall": -1,

  // Ownership
  "selected_by_percent": "46.2",      // % of managers who own this player
  "transfers_in": 4821033,            // season total transfers in
  "transfers_out": 2103044,
  "transfers_in_event": 312044,       // this GW transfers in
  "transfers_out_event": 88021,

  // Points
  "total_points": 178,
  "event_points": 22,                 // points scored in latest GW
  "points_per_game": "7.1",
  "form": "9.2",                      // rolling average over last 5 GWs

  // Season stats
  "minutes": 2340,
  "goals_scored": 17,
  "assists": 9,
  "clean_sheets": 7,
  "goals_conceded": 24,
  "own_goals": 0,
  "penalties_saved": 0,
  "penalties_missed": 1,
  "yellow_cards": 1,
  "red_cards": 0,
  "saves": 0,
  "bonus": 28,
  "bps": 512,                         // bonus point system score

  // ICT Index
  "influence": "841.2",
  "creativity": "622.4",
  "threat": "934.0",
  "ict_index": "240.1",
  "influence_rank": 3,
  "influence_rank_type": 1,           // rank within position
  "creativity_rank": 12,
  "creativity_rank_type": 4,
  "threat_rank": 2,
  "threat_rank_type": 1,
  "ict_index_rank": 2,
  "ict_index_rank_type": 1,

  // Expected stats (xG model)
  "expected_goals": "12.34",
  "expected_assists": "6.22",
  "expected_goal_involvements": "18.56",
  "expected_goals_conceded": "18.40",
  "expected_goals_per_90": "0.47",
  "saves_per_90": "0.00",
  "expected_assists_per_90": "0.24",
  "expected_goal_involvements_per_90": "0.71",
  "expected_goals_conceded_per_90": "0.71",
  "goals_conceded_per_90": "0.92",
  "clean_sheets_per_90": "0.27",

  // Predicted points
  "ep_this": "9.2",                   // expected points this GW
  "ep_next": "7.8",                   // expected points next GW

  "in_dreamteam": false,              // in current GW dream team
  "dreamteam_count": 4,               // times appeared in dream team this season
  "value_form": "0.7",                // form ÷ cost ratio
  "value_season": "1.4",             // season points ÷ cost
  "squad_number": null,
  "special": false
}
```

---

### `element_types[]` — Positions

```jsonc
{
  "id": 1,                            // 1=GK 2=DEF 3=MID 4=FWD
  "plural_name": "Goalkeepers",
  "plural_name_short": "GKP",
  "singular_name": "Goalkeeper",
  "singular_name_short": "GKP",
  "squad_select": 2,                  // how many in a squad
  "squad_min_play": 1,                // min starters
  "squad_max_play": 1,                // max starters
  "ui_shirt_specific": true,
  "sub_positions_locked": [12],       // bench slot locked for this type
  "element_count": 83                 // total players of this type
}
```

---

## 2. Fixtures

### All fixtures

```
GET /fixtures/
```

### Fixtures for a single gameweek

```
GET /fixtures/?event={gameweek_number}
```

**Example:** `/fixtures/?event=29`

**Response** — array of fixture objects:

```jsonc
{
  "id": 300,
  "code": 2374298,                    // unique fixture code
  "event": 29,                        // gameweek number (null = BGW)
  "finished": true,
  "finished_provisional": true,
  "kickoff_time": "2024-03-16T12:30:00Z",
  "minutes": 90,
  "provisional_start_time": false,
  "started": true,
  "team_a": 11,                       // away team FPL ID
  "team_h": 6,                        // home team FPL ID
  "team_a_score": 0,
  "team_h_score": 2,
  "team_h_difficulty": 3,             // FDR 1–5 for home team
  "team_a_difficulty": 4,             // FDR 1–5 for away team
  "pulse_id": 112233,

  // Only present after match is played:
  "stats": [
    {
      "identifier": "goals_scored",
      "a": [{ "value": 1, "element": 233 }],   // element = player ID
      "h": [{ "value": 2, "element": 328 }, { "value": 1, "element": 421 }]
    },
    { "identifier": "assists",        "a": [], "h": [{ "value": 1, "element": 302 }] },
    { "identifier": "own_goals",      "a": [], "h": [] },
    { "identifier": "penalties_saved","a": [], "h": [] },
    { "identifier": "penalties_missed","a":[], "h": [] },
    { "identifier": "yellow_cards",   "a": [], "h": [] },
    { "identifier": "red_cards",      "a": [], "h": [] },
    { "identifier": "saves",          "a": [], "h": [] },
    { "identifier": "bonus",          "a": [], "h": [] },
    { "identifier": "bps",            "a": [], "h": [] }
  ]
}
```

---

## 3. Element Summary (Player Detail)

> Per-player fixture list, GW history, and previous season history.

```
GET /element-summary/{element_id}/
```

**Example:** `/element-summary/328/`

**Response:**

```jsonc
{
  // Upcoming fixtures for this player
  "fixtures": [
    {
      "id": 350,
      "code": 2374350,
      "team_h": 11,
      "team_a": 3,
      "event": 30,
      "finished": false,
      "minutes": 0,
      "provisional_start_time": false,
      "kickoff_time": "2024-03-30T14:00:00Z",
      "event_name": "Gameweek 30",
      "is_home": true,
      "difficulty": 4                  // FDR for this player's team
    }
  ],

  // This season, GW-by-GW history
  "history": [
    {
      "element": 328,
      "fixture": 300,
      "opponent_team": 6,
      "total_points": 22,
      "was_home": false,
      "kickoff_time": "2024-03-16T12:30:00Z",
      "team_h_score": 2,
      "team_a_score": 0,
      "round": 29,                     // gameweek number
      "minutes": 90,
      "goals_scored": 2,
      "assists": 1,
      "clean_sheets": 0,
      "goals_conceded": 2,
      "own_goals": 0,
      "penalties_saved": 0,
      "penalties_missed": 0,
      "yellow_cards": 0,
      "red_cards": 0,
      "saves": 0,
      "bonus": 3,
      "bps": 44,
      "influence": "78.4",
      "creativity": "31.2",
      "threat": "94.0",
      "ict_index": "20.3",
      "starts": 1,
      "expected_goals": "0.94",
      "expected_assists": "0.31",
      "expected_goal_involvements": "1.25",
      "expected_goals_conceded": "0.88",
      "value": 129,                    // cost at time of match (÷10 = £m)
      "transfers_balance": 223011,     // net transfers (in - out) this GW
      "selected": 5421033,             // total owners at time of match
      "transfers_in": 255501,
      "transfers_out": 32490
    }
  ],

  // Previous seasons summary
  "history_past": [
    {
      "season_name": "2022/23",
      "element_code": 69140,
      "start_cost": 130,
      "end_cost": 128,
      "total_points": 212,
      "minutes": 2650,
      "goals_scored": 19,
      "assists": 12,
      "clean_sheets": 8,
      "goals_conceded": 28,
      "own_goals": 0,
      "penalties_saved": 0,
      "penalties_missed": 0,
      "yellow_cards": 2,
      "red_cards": 0,
      "saves": 0,
      "bonus": 31,
      "bps": 601,
      "influence": "943.4",
      "creativity": "712.2",
      "threat": "1122.0",
      "ict_index": "277.1",
      "starts": 28,
      "expected_goals": "13.44",
      "expected_assists": "8.12",
      "expected_goal_involvements": "21.56",
      "expected_goals_conceded": "20.10"
    }
  ]
}
```

---

## 4. Live Gameweek Data

> Per-player live stats during/after a gameweek. Updates every ~2 min during matches.

```
GET /event/{gameweek}/live/
```

**Example:** `/event/29/live/`

**Response:**

```jsonc
{
  "elements": [
    {
      "id": 328,                       // player ID
      "stats": {
        "minutes": 90,
        "goals_scored": 2,
        "assists": 1,
        "clean_sheets": 0,
        "goals_conceded": 2,
        "own_goals": 0,
        "penalties_saved": 0,
        "penalties_missed": 0,
        "yellow_cards": 0,
        "red_cards": 0,
        "saves": 0,
        "bonus": 3,
        "bps": 44,
        "influence": "78.4",
        "creativity": "31.2",
        "threat": "94.0",
        "ict_index": "20.3",
        "total_points": 22,
        "in_dreamteam": true,          // ✅ source of truth for Team of the Week
        "expected_goals": "0.94",
        "expected_assists": "0.31",
        "expected_goal_involvements": "1.25",
        "expected_goals_conceded": "0.88"
      },
      // Per-fixture point breakdown
      "explain": [
        {
          "fixture": 300,
          "stats": [
            { "identifier": "minutes",       "points": 2,  "value": 90 },
            { "identifier": "goals_scored",  "points": 10, "value": 2 },
            { "identifier": "assists",       "points": 3,  "value": 1 },
            { "identifier": "bonus",         "points": 3,  "value": 3 },
            { "identifier": "clean_sheets",  "points": 0,  "value": 0 }
          ]
        }
      ]
    }
  ]
}
```

---

## 5. Dream Team

> Official FPL Team of the Week for a completed gameweek.
> ⚠️ Note: `in_dreamteam` from `/event/{gw}/live/` is the more reliable source — use that.

```
GET /dream-team/{gameweek}/
```

**Example:** `/dream-team/29/`

**Response:**

```jsonc
{
  "top_players": [
    { "id": 328, "points": 22 },
    { "id": 233, "points": 18 },
    { "id": 421, "points": 17 },
    // ... 11 players total
  ]
}
```

---

## 6. Event Status

> Status of bonus points processing and league updates across all gameweeks.

```
GET /event-status/
```

**Response:**

```jsonc
{
  "status": [
    {
      "bonus_added": true,
      "date": "2024-03-16",
      "event": 29,
      "points": "r"                    // "r" = ready, "p" = processing
    }
  ],
  "leagues": "Updated"                 // or "Updating"
}
```

---

## 7. Manager Entry

> Public profile for any FPL manager.

```
GET /entry/{manager_id}/
```

**Example:** `/entry/1234567/`

**Response:**

```jsonc
{
  "id": 1234567,
  "joined_time": "2023-08-03T14:22:11.123456Z",
  "started_event": 1,                  // GW they joined
  "favourite_team": 11,                // supported club ID

  // Manager identity
  "player_first_name": "John",
  "player_last_name": "Smith",
  "player_region_id": 1,
  "player_region_name": "England",
  "player_region_iso_code_short": "EN",
  "player_region_iso_code_long": "ENG",

  // Squad
  "name": "The Galacticos",            // squad name
  "name_change_blocked": false,

  // Current season summary
  "summary_overall_points": 1834,
  "summary_overall_rank": 482031,
  "summary_event_points": 52,          // latest GW points
  "summary_event_rank": 2104331,       // latest GW rank

  // Kit
  "kit": { "kit_shirt_type": "plain", "kit_shirt_base": "..." },

  // Leagues this manager is in
  "leagues": {
    "classic": [
      {
        "id": 314,
        "name": "Overall",
        "short_name": "overall",
        "created": "2023-07-14T11:00:00Z",
        "closed": false,
        "rank": null,
        "max_entries": null,
        "league_type": "s",
        "scoring": "c",
        "admin_entry": null,
        "start_event": 1,
        "entry_rank": 482031,
        "entry_last_rank": 522001,
        "entry_can_leave": false,
        "entry_can_admin": false,
        "entry_can_invite": false
      }
    ],
    "h2h": [],
    "cup": { "matches": [], "status": {}, "cup_league": null }
  }
}
```

---

## 8. Manager History

> Full season GW-by-GW history + previous seasons + chips used.

```
GET /entry/{manager_id}/history/
```

**Response:**

```jsonc
{
  // This season, one entry per completed GW
  "current": [
    {
      "event": 1,
      "points": 68,
      "total_points": 68,
      "rank": 82031,
      "rank_sort": 82031,
      "overall_rank": 82031,
      "percentile_rank": 1,            // top 1% this GW
      "bank": 5,                       // remaining budget in tenths (÷10 = £m)
      "value": 1005,                   // team value in tenths
      "event_transfers": 0,
      "event_transfers_cost": 0,
      "points_on_bench": 8
    }
  ],

  // Previous seasons (summary only)
  "past": [
    {
      "season_name": "2022/23",
      "total_points": 2241,
      "rank": 188022
    }
  ],

  // Chips used this season
  "chips": [
    {
      "name": "wildcard",             // wildcard / freehit / bboost / 3xc
      "time": "2023-10-14T09:22:44Z",
      "event": 9
    }
  ]
}
```

---

## 9. Manager GW Picks

> The 15-player squad a manager selected for a specific gameweek.

```
GET /entry/{manager_id}/event/{gameweek}/picks/
```

**Example:** `/entry/1234567/event/29/picks/`

**Response:**

```jsonc
{
  "active_chip": null,                 // "wildcard" / "freehit" / "bboost" / "3xc" / null

  // Auto-subs that happened this GW
  "automatic_subs": [
    {
      "entry": 1234567,
      "element_in": 302,               // player brought on
      "element_out": 421,              // player subbed off (0 mins)
      "event": 29
    }
  ],

  // GW performance snapshot
  "entry_history": {
    "event": 29,
    "points": 52,
    "total_points": 1834,
    "rank": 2104331,
    "rank_sort": 2104331,
    "overall_rank": 482031,
    "percentile_rank": 5,              // ✅ use this for rank badge calculation
    "bank": 5,
    "value": 1038,
    "event_transfers": 1,
    "event_transfers_cost": 0,
    "points_on_bench": 6
  },

  // The 15-player squad
  "picks": [
    {
      "element": 328,                  // player ID
      "position": 1,                   // 1–11 = starters, 12–15 = bench
      "multiplier": 2,                 // 1=normal 2=captain 3=triple captain
      "is_captain": true,
      "is_vice_captain": false,
      "element_type": 3                // 1=GK 2=DEF 3=MID 4=FWD
    },
    {
      "element": 233,
      "position": 2,
      "multiplier": 1,
      "is_captain": false,
      "is_vice_captain": true,
      "element_type": 4
    }
    // ... 15 picks total
  ]
}
```

---

## 10. Manager Transfers

> Full transfer history for a manager across the entire season.

```
GET /entry/{manager_id}/transfers/
```

**Response** — array, most recent first:

```jsonc
[
  {
    "element_in": 351,                 // player transferred in (player ID)
    "element_in_cost": 85,            // cost at time of transfer (÷10 = £m)
    "element_out": 302,               // player transferred out
    "element_out_cost": 72,
    "entry": 1234567,
    "event": 29,                      // gameweek of transfer
    "time": "2024-03-14T18:33:21Z"
  }
]
```

---

## 11. Classic League Standings

> Standings for a public or private classic scoring league.

```
GET /leagues-classic/{league_id}/standings/
```

**Query params:**

| Param | Description | Default |
|-------|-------------|---------|
| `page_standings` | Page number (50 entries per page) | 1 |
| `phase` | Phase ID (1 = overall, 2–7 = monthly) | 1 |

**Example:** `/leagues-classic/314/standings/?page_standings=1`

**Response:**

```jsonc
{
  "league": {
    "id": 314,
    "name": "Overall",
    "created": "2023-07-14T11:00:00Z",
    "closed": false,
    "max_entries": null,
    "league_type": "s",               // "s" = system / "x" = private / "p" = public
    "scoring": "c",                   // "c" = classic
    "admin_entry": null,
    "start_event": 1,
    "code_privacy": "p",
    "has_cup": false,
    "cup_league": null,
    "rank": null
  },
  "new_entries": {
    "has_next": false,
    "page": 1,
    "results": []
  },
  "standings": {
    "has_next": true,                  // more pages available
    "page": 1,
    "results": [
      {
        "id": 8821033,
        "event_total": 142,            // points scored this GW
        "player_name": "Jane Doe",
        "rank": 1,
        "rank_sort": 1,
        "last_rank": 3,
        "total": 2441,                 // total season points
        "entry": 9912233,              // manager ID
        "entry_name": "World Beaters"
      }
    ]
  }
}
```

---

## 12. H2H League Standings

> Standings for a head-to-head league.

```
GET /leagues-h2h/{league_id}/standings/
```

**Query params:** same as classic (`page_standings`, `phase`)

**Response shape** — same as classic but standings include:

```jsonc
{
  "standings": {
    "results": [
      {
        "id": 44521,
        "division": 1,
        "entry": 9912233,
        "player_name": "Jane Doe",
        "rank": 1,
        "last_rank": 2,
        "rank_sort": 1,
        "total": 52,                   // H2H points (2 per win, 1 per draw)
        "entry_name": "World Beaters",
        "matches_played": 29,
        "matches_won": 20,
        "matches_drawn": 5,
        "matches_lost": 4,
        "points_for": 1634             // total FPL points scored across all H2H matches
      }
    ]
  }
}
```

---

## 13. H2H Matches

> Individual match results in a H2H league.

```
GET /leagues-h2h-matches/league/{league_id}/
```

**Query params:**

| Param | Description |
|-------|-------------|
| `page` | Page number |
| `event` | Filter by gameweek number |

**Response:**

```jsonc
{
  "has_next": false,
  "page": 1,
  "results": [
    {
      "id": 88221,
      "draw": 0,
      "entry_1_draw": 0,
      "entry_1_entry": 9912233,        // manager ID
      "entry_1_name": "World Beaters",
      "entry_1_player_name": "Jane Doe",
      "entry_1_points": 82,            // FPL points scored
      "entry_1_total": 52,             // H2H points total
      "entry_1_win": 1,
      "entry_2_draw": 0,
      "entry_2_entry": 1234567,
      "entry_2_name": "The Galacticos",
      "entry_2_player_name": "John Smith",
      "entry_2_points": 61,
      "entry_2_total": 44,
      "entry_2_win": 0,
      "event": 29,
      "is_knockout": false,
      "league": 88200,
      "winner": 9912233,               // manager ID of winner (null if draw)
      "seed_value": null,
      "started": true,
      "finished": true,
      "knockout_name": ""
    }
  ]
}
```

---

## 14. Player Photo URL

> Not an API endpoint — a CDN pattern for player images.

```
https://resources.premierleague.com/premierleague/photos/players/110x140/p{code}.png
```

The `code` comes from `elements[].code` in bootstrap-static.

**Sizes available:**

| Size | URL pattern |
|------|-------------|
| 110×140 | `/110x140/p{code}.png` |
| 250×250 | `/250x250/p{code}.png` |

**Notes:**
- Images are transparent PNGs (player cut out, no background)
- New signings may not have a photo yet — handle 404s with a fallback
- `elements[].photo` gives `"{code}.jpg"` — strip `.jpg` and prepend `p` for the CDN URL

---

## 15. Team Badge URL

> CDN pattern for club badge images.

```
https://resources.premierleague.com/premierleague/badges/70/t{team_code}.png
```

The `team_code` comes from `teams[].code` in bootstrap-static.

**Sizes:**

| Size | URL pattern |
|------|-------------|
| 40px | `/40/t{code}.png` |
| 70px | `/70/t{code}.png` |
| 100px | `/100/t{code}.png` |

---

## Caching Recommendations

| Endpoint | How often it changes | Suggested `revalidate` |
|----------|---------------------|------------------------|
| `/bootstrap-static/` | Once per GW (weekly) | `300` (5 min) |
| `/fixtures/` | Once per GW | `300` (5 min) |
| `/fixtures/?event={gw}` | Once per GW | `300` (5 min) |
| `/event/{gw}/live/` | Every 2 min during matches | `120` (2 min) |
| `/element-summary/{id}/` | Once per GW | `300` (5 min) |
| `/dream-team/{gw}/` | Once after GW finalised | `600` (10 min) |
| `/entry/{id}/` | After each GW | `60` (1 min) |
| `/entry/{id}/history/` | After each GW | `60` (1 min) |
| `/entry/{id}/event/{gw}/picks/` | After deadline | `60` (1 min) |
| `/entry/{id}/transfers/` | After each transfer window | `60` (1 min) |
| `/leagues-classic/{id}/standings/` | After each GW | `300` (5 min) |

---

## Rate Limiting

The FPL API has no official rate limit documented, but:
- Always set a `User-Agent` header (e.g. `"my-fpl-app/1.0"`) — bare requests can get 429s
- `/bootstrap-static/` is ~2.5MB — don't call it on every request, cache aggressively
- During live GWs, `/event/{gw}/live/` can be polled every 2 minutes safely
- Don't hammer manager endpoints — space out calls if fetching multiple managers

```ts
fetch(`https://fantasy.premierleague.com/api/bootstrap-static/`, {
  headers: { "User-Agent": "my-fpl-app/1.0" },
  next: { revalidate: 300 }
})
```
