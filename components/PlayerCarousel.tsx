import Link from "next/link";
import Image from "next/image";
import PlayerPhoto from "./PlayerPhoto";
import { playerPhotoUrl, playerCost } from "@/lib/fpl";
import type { Player, FPLTeam } from "@/types/fpl";

const POS_COLOR: Record<number, string> = {
  1: "#f59e0b",
  2: "#38bdf8",
  3: "#10b981",
  4: "#f43f5e",
};
const POS_LABEL: Record<number, string> = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };
const RANK_COLOR = ["#f59e0b", "#94a3b8", "#b07030", "rgba(255,255,255,0.22)", "rgba(255,255,255,0.22)"];

interface Props {
  title: string;
  sub?: string;
  dot?: string;
  players: Player[];
  teamMap: Map<number, FPLTeam>;
  getStat: (p: Player) => { label: string; value: string | number };
}

// ─── #1 — Broadcast hero card ────────────────────────────────────────────────
// Landscape card: info on left, photo bleeds in from right with gradient mask.
function HeroCard({ player, team, stat, dot }: {
  player: Player;
  team?: FPLTeam;
  stat: { label: string; value: string | number };
  dot?: string;
}) {
  const pc = POS_COLOR[player.element_type] ?? "#fff";

  return (
    <Link
      href={`/players/${player.id}`}
      className="group relative flex overflow-hidden rounded-2xl"
      style={{
        height: 132,
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Top accent stripe — position colour */}
      <div
        className="absolute top-0 left-0 right-0 z-10"
        style={{ height: 2, background: `linear-gradient(to right, ${pc}, transparent 60%)` }}
      />

      {/* Giant watermark rank */}
      <span
        className="absolute select-none pointer-events-none font-black num"
        style={{
          fontSize: 120,
          lineHeight: 1,
          right: 148,
          bottom: -16,
          color: "white",
          opacity: 0.035,
          letterSpacing: -6,
        }}
      >
        1
      </span>

      {/* Left: info block */}
      <div className="relative z-10 flex flex-col justify-between py-4 pl-5 pr-3 flex-1 min-w-0">
        {/* Top row: badge + rank pill */}
        <div className="flex items-center gap-2">
          <span
            className="px-1.5 py-[2px] rounded text-[8px] font-black uppercase tracking-widest"
            style={{ background: `${pc}20`, color: pc, border: `1px solid ${pc}35` }}
          >
            {POS_LABEL[player.element_type]}
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: RANK_COLOR[0] }}>
            #1
          </span>
          {team && (
            <Image
              src={`/${team.id}.png`}
              alt={team.short_name}
              width={14}
              height={14}
              unoptimized
              style={{ opacity: 0.6, marginLeft: "auto" }}
            />
          )}
        </div>

        {/* Name + team */}
        <div className="min-w-0">
          <p
            className="text-[19px] font-black leading-tight truncate transition-opacity duration-200 group-hover:opacity-75"
            style={{ color: "var(--t1)", letterSpacing: -0.5 }}
          >
            {player.web_name}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--t3)" }}>
            {team?.short_name ?? "—"}
          </p>
        </div>

        {/* Stat + price */}
        <div className="flex items-end gap-3">
          <div>
            <span className="text-[26px] font-black num leading-none" style={{ color: "var(--t1)" }}>
              {stat.value}
            </span>
            <span className="text-[9px] uppercase tracking-widest ml-1.5" style={{ color: "var(--t3)" }}>
              {stat.label}
            </span>
          </div>
          <span
            className="px-2 py-[3px] rounded-md text-[11px] font-bold num mb-0.5"
            style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            {playerCost(player.now_cost)}
          </span>
        </div>
      </div>

      {/* Right: photo bleeding in with gradient mask */}
      <div className="relative shrink-0" style={{ width: 140 }}>
        <PlayerPhoto
          src={playerPhotoUrl(player.photo)}
          alt={player.web_name}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        {/* Fade mask: left edge dissolves into the card bg */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, var(--card) 0%, rgba(16,16,32,0.3) 40%, transparent 65%)",
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)",
          }}
        />
      </div>
    </Link>
  );
}

// ─── #2–5 — Compact ranked rows inside a unified panel ───────────────────────
function RankRow({ player, team, stat, rank, isLast }: {
  player: Player;
  team?: FPLTeam;
  stat: { label: string; value: string | number };
  rank: number;
  isLast: boolean;
}) {
  const pc = POS_COLOR[player.element_type] ?? "#fff";

  return (
    <Link
      href={`/players/${player.id}`}
      className="group relative flex items-center gap-3 px-4 py-2.5 overflow-hidden"
      style={{ borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)" }}
    >
      {/* Rank watermark */}
      <span
        className="absolute right-3 font-black num select-none pointer-events-none"
        style={{
          fontSize: 52,
          lineHeight: 1,
          bottom: -6,
          color: "white",
          opacity: 0.03,
          letterSpacing: -2,
        }}
      >
        {rank}
      </span>

      {/* Rank number */}
      <span
        className="text-[11px] font-black num w-3.5 text-right shrink-0"
        style={{ color: RANK_COLOR[rank - 1] ?? "var(--t4)" }}
      >
        {rank}
      </span>

      {/* Photo */}
      <div
        className="relative rounded-lg overflow-hidden shrink-0"
        style={{ width: 32, height: 42, background: "var(--raised)" }}
      >
        <PlayerPhoto src={playerPhotoUrl(player.photo)} alt={player.web_name} fill className="object-cover object-top" />
        {/* left pos stripe */}
        <div className="absolute inset-y-0 left-0 w-[2px]" style={{ background: pc }} />
      </div>

      {/* Name + team */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-bold truncate leading-tight transition-opacity duration-150 group-hover:opacity-70"
          style={{ color: "var(--t1)" }}
        >
          {player.web_name}
        </p>
        <p className="text-[10px] mt-[1px] flex items-center gap-1" style={{ color: "var(--t3)" }}>
          {team?.short_name ?? "—"}
          <span style={{ color: "var(--t4)" }}>·</span>
          <span style={{ color: pc }}>{POS_LABEL[player.element_type]}</span>
        </p>
      </div>

      {/* Stat badge + price */}
      <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
        <span
          className="px-2 py-[2px] rounded-md text-[12px] font-black num"
          style={{ background: "rgba(255,255,255,0.06)", color: "var(--t1)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {stat.value}
        </span>
        <span className="text-[10px] font-semibold num" style={{ color: "#a78bfa" }}>
          {playerCost(player.now_cost)}
        </span>
      </div>
    </Link>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────
export default function PlayerCarousel({ title, sub, dot, players, teamMap, getStat }: Props) {
  if (!players.length) return null;

  const top5   = players.slice(0, 5);
  const [hero] = top5;
  const rest   = top5.slice(1);

  return (
    <div className="flex flex-col gap-2">
      {/* Section header */}
      <div className="flex items-center gap-2.5">
        {dot && <span className="w-[3px] h-[16px] rounded-full shrink-0" style={{ background: dot }} />}
        <span className="text-[15px] font-semibold" style={{ color: "var(--t1)" }}>{title}</span>
        {sub && <span className="text-[12px]" style={{ color: "var(--t3)" }}>{sub}</span>}
      </div>

      {/* Hero card */}
      <HeroCard player={hero} team={teamMap.get(hero.team)} stat={getStat(hero)} dot={dot} />

      {/* Ranked panel */}
      {rest.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          {rest.map((player, i) => (
            <RankRow
              key={player.id}
              player={player}
              team={teamMap.get(player.team)}
              stat={getStat(player)}
              rank={i + 2}
              isLast={i === rest.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
