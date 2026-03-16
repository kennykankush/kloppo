import Link from "next/link";
import Image from "next/image";
import { getAllPlayers, getAllTeams, playerPhotoUrl, positionShort, playerCost, playerStatus } from "@/lib/fpl";

export const revalidate = 300;

const POS_CLS: Record<number, string> = { 1:"badge-gk", 2:"badge-def", 3:"badge-mid", 4:"badge-fwd" };
const POS_TABS = [
  { label: "All",        val: "0" },
  { label: "GK",         val: "1" },
  { label: "Defenders",  val: "2" },
  { label: "Midfielders",val: "3" },
  { label: "Forwards",   val: "4" },
];

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ pos?: string }>;
}) {
  const { pos } = await searchParams;
  const posFilter = pos ? parseInt(pos) : 0;

  const [allPlayers, teams] = await Promise.all([getAllPlayers(), getAllTeams()]);
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const players = posFilter ? allPlayers.filter((p) => p.element_type === posFilter) : allPlayers;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--t1)" }}>Players</h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--t3)" }}>
            {players.length} {posFilter ? POS_TABS.find(t => t.val === String(posFilter))?.label : "Premier League"} players
          </p>
        </div>

        {/* Position filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--surface)" }}>
          {POS_TABS.map(({ label, val }) => {
            const active = val === (posFilter ? String(posFilter) : "0");
            return (
              <Link
                key={val}
                href={val === "0" ? "/players" : `/players?pos=${val}`}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                style={{
                  background: active ? "var(--card)" : "transparent",
                  color: active ? "var(--t1)" : "var(--t3)",
                  border: active ? "1px solid var(--border)" : "1px solid transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="text-left px-4 py-3 font-semibold label">Player</th>
                <th className="text-center px-3 py-3 font-semibold label">Pos</th>
                <th className="text-right px-3 py-3 font-semibold label">Cost</th>
                <th className="text-right px-3 py-3 font-semibold label">Pts</th>
                <th className="text-right px-3 py-3 font-semibold label">PPG</th>
                <th className="text-right px-3 py-3 font-semibold label">Form</th>
                <th className="text-right px-3 py-3 font-semibold label">ICT</th>
                <th className="text-right px-3 py-3 font-semibold label">Sel%</th>
                <th className="text-right px-4 py-3 font-semibold label">xfer</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => {
                const team   = teamMap.get(p.team);
                const status = playerStatus(p.status);
                const netXfer = p.transfers_in_event - p.transfers_out_event;
                return (
                  <tr key={p.id} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-4 py-2.5">
                      <Link href={`/players/${p.id}`} className="flex items-center gap-3 group">
                        <div className="relative w-8 h-10 rounded-lg overflow-hidden shrink-0"
                             style={{ background: "var(--raised)" }}>
                          <Image src={playerPhotoUrl(p.photo)} alt={p.web_name}
                                 fill className="object-cover object-top" unoptimized />
                        </div>
                        <div>
                          <p className="font-semibold transition-colors group-hover:text-violet-400" style={{ color: "var(--t1)" }}>
                            {p.web_name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {team && (
                              <Image src={`/${p.team}.png`} alt={team.short_name} width={10} height={10} unoptimized style={{ opacity: 0.6 }} />
                            )}
                            <span className="text-[11px]" style={{ color: "var(--t3)" }}>{team?.short_name}</span>
                            {p.status !== "a" && (
                              <span className="text-[10px] font-medium"
                                    style={{ color: p.status === "d" ? "var(--amber)" : "var(--rose)" }}>
                                · {status.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      <span className={`${POS_CLS[p.element_type] ?? ""} text-[10px] font-bold px-1.5 py-[3px] rounded-md`}>
                        {positionShort(p.element_type)}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-right font-semibold num" style={{ color: "var(--violet-hi)" }}>
                      {playerCost(p.now_cost)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold num" style={{ color: "var(--t1)" }}>
                      {p.total_points}
                    </td>
                    <td className="px-3 py-2.5 text-right num" style={{ color: "var(--t2)" }}>{p.points_per_game}</td>
                    <td className="px-3 py-2.5 text-right num" style={{ color: "var(--t2)" }}>{p.form}</td>
                    <td className="px-3 py-2.5 text-right num" style={{ color: "var(--t3)" }}>{p.ict_index}</td>
                    <td className="px-3 py-2.5 text-right num" style={{ color: "var(--t3)" }}>{p.selected_by_percent}%</td>
                    <td className="px-4 py-2.5 text-right num text-[12px] font-semibold"
                        style={{ color: netXfer > 0 ? "var(--emerald)" : netXfer < 0 ? "var(--rose)" : "var(--t4)" }}>
                      {netXfer > 0 ? `+${(netXfer/1000).toFixed(0)}k` : netXfer < 0 ? `${(netXfer/1000).toFixed(0)}k` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
