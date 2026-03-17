"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import { createConceptSquad } from "@/app/actions/concept";
import { playerPhotoUrl, playerCost, positionShort } from "@/lib/fpl";
import type { Player, FPLTeam } from "@/types/fpl";

interface Pick { playerId: number; isCaptain: boolean }

const POS_LABEL: Record<number, string> = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };
const POS_COLOR: Record<number, string> = { 1: "#f59e0b", 2: "#38bdf8", 3: "#10b981", 4: "#f43f5e" };

// ─── Validation ──────────────────────────────────────────────────────────────

function validate(picks: Pick[], players: Player[]): string[] {
  const errors: string[] = [];
  const playerMap = new Map(players.map((p) => [p.id, p]));

  if (picks.length < 11) errors.push(`Need ${11 - picks.length} more player${11 - picks.length !== 1 ? "s" : ""}.`);

  const pos  = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const team = new Map<number, number>();

  for (const pick of picks) {
    const p = playerMap.get(pick.playerId);
    if (!p) continue;
    pos[p.element_type as 1|2|3|4]++;
    team.set(p.team, (team.get(p.team) ?? 0) + 1);
  }

  if (picks.length === 11) {
    if (pos[1] !== 1) errors.push("Need exactly 1 goalkeeper.");
    if (pos[2] < 2 || pos[2] > 5) errors.push("Defenders: 2–5.");
    if (pos[3] < 2 || pos[3] > 5) errors.push("Midfielders: 2–5.");
    if (pos[4] < 1 || pos[4] > 3) errors.push("Forwards: 1–3.");
    for (const [, n] of team) if (n > 3) errors.push("Max 3 players from one club.");
  }

  const caps = picks.filter((p) => p.isCaptain);
  if (picks.length === 11 && caps.length !== 1) errors.push("Select a captain.");

  return errors;
}

function canAdd(player: Player, picks: Pick[], allPlayers: Player[]): boolean {
  if (picks.length >= 11) return false;
  if (picks.some((p) => p.playerId === player.id)) return false;

  const playerMap = new Map(allPlayers.map((p) => [p.id, p]));
  const pos  = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const team = new Map<number, number>();

  for (const pick of picks) {
    const p = playerMap.get(pick.playerId);
    if (!p) continue;
    pos[p.element_type as 1|2|3|4]++;
    team.set(p.team, (team.get(p.team) ?? 0) + 1);
  }

  // Team cap
  if ((team.get(player.team) ?? 0) >= 3) return false;

  // Position caps (prevent impossible squad)
  const remaining = 11 - picks.length - 1; // slots left after this pick
  const et = player.element_type as 1|2|3|4;

  // Simulate adding
  pos[et]++;

  // Check we can still fill required positions
  const needGK  = Math.max(0, 1  - pos[1]);
  const needDEF = Math.max(0, 2  - pos[2]);
  const needMID = Math.max(0, 2  - pos[3]);
  const needFWD = Math.max(0, 1  - pos[4]);

  const maxGK  = 1  - pos[1];
  const maxDEF = 5  - pos[2];
  const maxMID = 5  - pos[3];
  const maxFWD = 3  - pos[4];

  const minRequired = needGK + needDEF + needMID + needFWD;
  if (remaining < minRequired) return false;
  if (maxGK < 0 || maxDEF < 0 || maxMID < 0 || maxFWD < 0) return false;

  return true;
}

// ─── Pitch slot (selected player) ────────────────────────────────────────────

function PitchSlot({
  player, isCaptain, onToggleCaptain, onRemove,
}: {
  player: Player; isCaptain: boolean;
  onToggleCaptain: () => void; onRemove: () => void;
}) {
  const pc = POS_COLOR[player.element_type] ?? "#fff";

  return (
    <div className="flex flex-col items-center gap-1 group" style={{ width: 56 }}>
      {/* Photo */}
      <div
        className="relative rounded-xl overflow-hidden shadow-lg"
        style={{
          width: 52, height: 66, flexShrink: 0,
          border: isCaptain ? "2px solid var(--amber)" : `1px solid ${pc}55`,
        }}
      >
        <Image src={playerPhotoUrl(player.photo)} alt={player.web_name} fill className="object-cover object-top" unoptimized />
        {isCaptain && (
          <div
            className="absolute top-0.5 right-0.5 w-[14px] h-[14px] rounded flex items-center justify-center text-[8px] font-black"
            style={{ background: "var(--amber)", color: "#000" }}
          >C</div>
        )}
        {/* Action overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3px] opacity-0 group-hover:opacity-100 transition-opacity"
             style={{ background: "rgba(0,0,0,0.75)" }}>
          <button
            type="button"
            onClick={onToggleCaptain}
            className="text-[8px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: isCaptain ? "var(--amber)" : "rgba(245,158,11,0.25)", color: isCaptain ? "#000" : "var(--amber)" }}
          >
            {isCaptain ? "★ C" : "★ Cap"}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-[8px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: "rgba(244,63,94,0.25)", color: "#f43f5e" }}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Name label */}
      <div className="text-center rounded-md px-1 py-0.5" style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}>
        <p className="text-[9px] font-semibold truncate max-w-[52px]" style={{ color: "var(--t1)" }}>
          {player.web_name}
        </p>
        <p className="text-[8px] num font-bold" style={{ color: pc }}>
          {POS_LABEL[player.element_type]}
        </p>
      </div>
    </div>
  );
}

// ─── Empty slot placeholder ───────────────────────────────────────────────────

function EmptySlot({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1" style={{ width: 56 }}>
      <div
        className="rounded-xl flex items-center justify-center"
        style={{
          width: 52, height: 66,
          border: "1px dashed rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.15)" }}>
          {label}
        </span>
      </div>
      <div style={{ height: 28 }} />
    </div>
  );
}

// ─── Player row in the picker list ────────────────────────────────────────────

function PlayerRow({
  player, team, added, disabled, onAdd,
}: {
  player: Player; team?: FPLTeam; added: boolean; disabled: boolean; onAdd: () => void;
}) {
  const pc = POS_COLOR[player.element_type] ?? "#fff";

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={added || disabled}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        opacity: disabled && !added ? 0.4 : 1,
        background: added ? "rgba(124,58,237,0.08)" : "transparent",
        cursor: added || disabled ? "default" : "pointer",
      }}
    >
      {/* Photo */}
      <div className="relative rounded-lg overflow-hidden shrink-0" style={{ width: 30, height: 40, background: "var(--raised)" }}>
        <Image src={playerPhotoUrl(player.photo)} alt={player.web_name} fill className="object-cover object-top" unoptimized />
        <div className="absolute inset-y-0 left-0 w-[2px]" style={{ background: pc }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate" style={{ color: "var(--t1)" }}>
          {player.web_name}
        </p>
        <p className="text-[10px] mt-[1px]" style={{ color: "var(--t3)" }}>
          {team?.short_name ?? "—"} · <span style={{ color: pc }}>{POS_LABEL[player.element_type]}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="text-right shrink-0">
        <p className="text-[11px] font-bold num" style={{ color: "var(--t1)" }}>{playerCost(player.now_cost)}</p>
        <p className="text-[10px]" style={{ color: "var(--t3)" }}>{player.total_points}pts</p>
      </div>

      {/* Added badge */}
      {added && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0" style={{ background: "rgba(124,58,237,0.25)", color: "#a78bfa" }}>
          ✓
        </span>
      )}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props {
  players: Player[];
  teams: FPLTeam[];
  gameweek: number;
}

export default function ConceptBuilder({ players, teams, gameweek }: Props) {
  const [picks, setPicks]       = useState<Pick[]>([]);
  const [squadName, setName]    = useState("");
  const [search, setSearch]     = useState("");
  const [posFilter, setPosFilter] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  // Sorted & filtered player list
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return players
      .filter((p) => {
        if (posFilter !== null && p.element_type !== posFilter) return false;
        if (q) {
          const team = teamMap.get(p.team);
          return (
            p.web_name.toLowerCase().includes(q) ||
            p.first_name.toLowerCase().includes(q) ||
            p.second_name.toLowerCase().includes(q) ||
            team?.short_name.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, 80);
  }, [players, teamMap, posFilter, search]);

  const addedIds = useMemo(() => new Set(picks.map((p) => p.playerId)), [picks]);

  // Group picks by position for pitch layout
  const playerMap = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const byPos = useMemo(() => {
    const groups: Record<number, Pick[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const pick of picks) {
      const p = playerMap.get(pick.playerId);
      if (p) groups[p.element_type].push(pick);
    }
    return groups;
  }, [picks, playerMap]);

  const errors = validate(picks, players);
  const isReady = errors.length === 0;

  function addPlayer(player: Player) {
    if (!canAdd(player, picks, players)) return;
    setPicks((prev) => [...prev, { playerId: player.id, isCaptain: false }]);
  }

  function removePlayer(playerId: number) {
    setPicks((prev) => prev.filter((p) => p.playerId !== playerId));
  }

  function toggleCaptain(playerId: number) {
    setPicks((prev) =>
      prev.map((p) => ({
        ...p,
        isCaptain: p.playerId === playerId ? !p.isCaptain : false,
      }))
    );
  }

  function handleSubmit() {
    if (!isReady) return;
    const fd = new FormData();
    fd.append("picks", JSON.stringify(picks));
    fd.append("gameweek", String(gameweek));
    if (squadName.trim()) fd.append("name", squadName.trim());
    startTransition(() => createConceptSquad(fd));
  }

  // Pitch rows: FWD top → GK bottom (from attacker to goalkeeper)
  const pitchRows: Array<{ et: number; count: number }> = [
    { et: 4, count: byPos[4].length || 1 },
    { et: 3, count: byPos[3].length || 2 },
    { et: 2, count: byPos[2].length || 2 },
    { et: 1, count: byPos[1].length || 1 },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-5" style={{ alignItems: "flex-start" }}>

      {/* ── LEFT: Pitch + Squad Header ── */}
      <div className="flex flex-col gap-4 w-full lg:w-[420px] shrink-0">

        {/* Squad name + submit */}
        <div className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <input
            value={squadName}
            onChange={(e) => setName(e.target.value)}
            placeholder="Squad name (optional)"
            maxLength={48}
            className="bg-transparent text-[14px] font-semibold focus:outline-none placeholder:text-white/20 w-full"
            style={{ color: "var(--t1)" }}
          />

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(picks.length / 11) * 100}%`,
                  background: isReady ? "var(--emerald)" : "var(--violet)",
                }}
              />
            </div>
            <span className="text-[12px] font-bold num shrink-0" style={{ color: isReady ? "var(--emerald)" : "var(--t3)" }}>
              {picks.length}/11
            </span>
          </div>

          {/* Error / success */}
          {picks.length > 0 && errors.length > 0 && (
            <p className="text-[11px]" style={{ color: "var(--rose)" }}>{errors[0]}</p>
          )}
          {isReady && (
            <p className="text-[11px]" style={{ color: "var(--emerald)" }}>Squad complete — tap Save to share.</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isReady || isPending}
            className="w-full py-2.5 rounded-xl text-[13px] font-bold transition-all"
            style={{
              background: isReady ? "var(--violet)" : "rgba(255,255,255,0.06)",
              color: isReady ? "white" : "var(--t4)",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "Saving…" : "Save & Share"}
          </button>
        </div>

        {/* Pitch */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            minHeight: 360,
            background: "linear-gradient(180deg,#0b2e10 0%,#092509 55%,#0b2e10 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* SVG pitch lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 420 360"
               preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.08 }}>
            <rect x="1" y="1" width="418" height="358" fill="none" stroke="white" strokeWidth="1.5" />
            <line x1="0" y1="180" x2="420" y2="180" stroke="white" strokeWidth="1" />
            <circle cx="210" cy="180" r="48" fill="none" stroke="white" strokeWidth="1" />
            <rect x="140" y="0"   width="140" height="60"  fill="none" stroke="white" strokeWidth="1" />
            <rect x="170" y="0"   width="80"  height="32"  fill="none" stroke="white" strokeWidth="1" />
            <rect x="140" y="300" width="140" height="60"  fill="none" stroke="white" strokeWidth="1" />
            <rect x="170" y="328" width="80"  height="32"  fill="none" stroke="white" strokeWidth="1" />
          </svg>

          <div className="relative flex flex-col justify-around items-center h-full min-h-[360px] py-5 gap-1">
            {pitchRows.map(({ et }) => {
              const possPicks = byPos[et];
              const minCount = et === 1 ? 1 : et === 4 ? 1 : 2;
              const displayCount = Math.max(possPicks.length, minCount);

              return (
                <div key={et} className="flex justify-center gap-3 sm:gap-5 w-full px-2">
                  {Array.from({ length: displayCount }).map((_, i) => {
                    const pick = possPicks[i];
                    if (pick) {
                      const player = playerMap.get(pick.playerId);
                      if (!player) return null;
                      return (
                        <PitchSlot
                          key={pick.playerId}
                          player={player}
                          isCaptain={pick.isCaptain}
                          onToggleCaptain={() => toggleCaptain(pick.playerId)}
                          onRemove={() => removePlayer(pick.playerId)}
                        />
                      );
                    }
                    return <EmptySlot key={i} label={POS_LABEL[et]} />;
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Position count pills */}
        <div className="flex gap-2 flex-wrap">
          {([1, 2, 3, 4] as const).map((et) => {
            const count = byPos[et].length;
            const ok = et === 1 ? count === 1 : et === 4 ? count >= 1 && count <= 3 : count >= 2 && count <= 5;
            return (
              <div
                key={et}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5"
                style={{
                  background: count > 0 ? `${POS_COLOR[et]}15` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${count > 0 ? (ok ? POS_COLOR[et] + "40" : "rgba(244,63,94,0.4)") : "rgba(255,255,255,0.07)"}`,
                  color: count > 0 ? (ok ? POS_COLOR[et] : "#f43f5e") : "var(--t4)",
                }}
              >
                <span>{POS_LABEL[et]}</span>
                <span className="num">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Player Picker ── */}
      <div
        className="flex-1 rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "var(--card)", border: "1px solid var(--border)", maxHeight: "calc(100vh - 120px)", minHeight: 500 }}
      >
        {/* Search + filter */}
        <div className="px-4 pt-4 pb-3 flex flex-col gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players or clubs…"
            className="w-full bg-transparent text-[13px] focus:outline-none placeholder:text-white/20 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--t1)",
            }}
          />
          {/* Position filters */}
          <div className="flex gap-1.5 flex-wrap">
            {[null, 1, 2, 3, 4].map((pos) => {
              const active = posFilter === pos;
              const label = pos === null ? "All" : POS_LABEL[pos];
              const color = pos !== null ? POS_COLOR[pos] : "var(--violet)";
              return (
                <button
                  key={pos ?? "all"}
                  type="button"
                  onClick={() => setPosFilter(pos)}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold transition-all"
                  style={{
                    background: active ? (pos !== null ? `${color}25` : "rgba(124,58,237,0.2)") : "rgba(255,255,255,0.04)",
                    color: active ? color : "var(--t3)",
                    border: `1px solid ${active ? color + "50" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Player list */}
        <div className="overflow-y-auto flex-1">
          {filtered.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              team={teamMap.get(player.team)}
              added={addedIds.has(player.id)}
              disabled={!addedIds.has(player.id) && !canAdd(player, picks, players)}
              onAdd={() => addPlayer(player)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-[13px] py-12" style={{ color: "var(--t4)" }}>
              No players found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
