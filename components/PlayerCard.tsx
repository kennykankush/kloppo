import Link from "next/link";
import PlayerPhoto from "./PlayerPhoto";
import { playerPhotoUrl, positionShort, playerCost } from "@/lib/fpl";
import type { Player, FPLTeam } from "@/types/fpl";

const POS_COLOR: Record<number, string> = {
  1: "var(--amber)",
  2: "var(--sky)",
  3: "var(--emerald)",
  4: "var(--rose)",
};

interface Props {
  player: Player;
  team?: FPLTeam;
  stat: { label: string; value: string | number };
  rank?: number;
}

export default function PlayerCard({ player, team, stat, rank }: Props) {
  const posColor = POS_COLOR[player.element_type] ?? "var(--t3)";
  const injured = player.status === "d" || player.status === "u" || player.status === "s";
  const injuryColor = player.status === "d" ? "var(--amber)" : "var(--rose)";

  return (
    <Link
      href={`/players/${player.id}`}
      className="flex shrink-0 hover-lift"
      style={{
        width: 192,
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Left: photo strip */}
      <div className="relative shrink-0" style={{ width: 64, background: "var(--raised)" }}>
        <PlayerPhoto
          src={playerPhotoUrl(player.photo)}
          alt={player.web_name}
          fill
          className="object-cover object-top"
        />
        {/* bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* pos accent line on left edge */}
        <div className="absolute inset-y-0 left-0 w-[3px]" style={{ background: posColor }} />

        {/* injury dot */}
        {injured && (
          <div
            className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: injuryColor, boxShadow: `0 0 4px ${injuryColor}` }}
          />
        )}
      </div>

      {/* Right: info */}
      <div className="flex flex-col justify-between flex-1 px-2.5 py-2.5" style={{ minWidth: 0 }}>
        {/* Top: name + team + pos */}
        <div>
          <div className="flex items-center gap-1 mb-[2px]">
            <span
              className="text-[9px] font-bold uppercase tracking-wide"
              style={{ color: posColor }}
            >
              {positionShort(player.element_type)}
            </span>
            {rank && (
              <span className="text-[9px] font-bold num ml-auto" style={{ color: "var(--t4)" }}>
                #{rank}
              </span>
            )}
          </div>
          <p
            className="text-[12px] font-bold truncate leading-tight"
            style={{ color: "var(--t1)" }}
          >
            {player.web_name}
          </p>
          <p className="text-[10px] truncate" style={{ color: "var(--t3)" }}>
            {team?.short_name ?? "—"}
          </p>
        </div>

        {/* Bottom: stat + price */}
        <div className="flex items-end justify-between mt-2">
          <div>
            <p
              className="text-[18px] font-black num leading-none"
              style={{ color: "var(--t1)" }}
            >
              {stat.value}
            </p>
            <p className="text-[9px] mt-[2px] uppercase tracking-wide" style={{ color: "var(--t3)" }}>
              {stat.label}
            </p>
          </div>
          <p className="text-[11px] font-bold num" style={{ color: "var(--violet-hi)" }}>
            {playerCost(player.now_cost)}
          </p>
        </div>
      </div>
    </Link>
  );
}
