import Image from "next/image";
import Link from "next/link";
import { playerPhotoUrl, positionShort, playerCost, playerStatus } from "@/lib/fpl";
import type { Player, FPLTeam } from "@/types/fpl";

interface Props {
  player: Player;
  team?: FPLTeam;
  rank?: number;
  statLabel?: string;
  statValue?: string | number;
}

export default function PlayerRow({ player, team, rank, statLabel, statValue }: Props) {
  const status = playerStatus(player.status);

  return (
    <Link
      href={`/players/${player.id}`}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/6 transition-colors group"
    >
      {rank && (
        <span className="text-xs text-white/30 w-4 text-right shrink-0">{rank}</span>
      )}
      <div className="relative w-10 h-12 shrink-0">
        <Image
          src={playerPhotoUrl(player.photo)}
          alt={player.web_name}
          fill
          className="object-cover rounded"
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
          {player.web_name}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-white/40">{positionShort(player.element_type)}</span>
          {team && <span className="text-xs text-white/40">· {team.short_name}</span>}
          <span className={`text-xs ${status.color}`}>· {status.label}</span>
        </div>
      </div>
      {statValue !== undefined && (
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold text-white">{statValue}</div>
          {statLabel && <div className="text-xs text-white/40">{statLabel}</div>}
        </div>
      )}
      {statValue === undefined && (
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold text-white">{playerCost(player.now_cost)}</div>
        </div>
      )}
    </Link>
  );
}
