import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPlayers, getAllTeams, playerPhotoUrl, positionName, positionShort, playerCost, playerStatus } from "@/lib/fpl";

export const revalidate = 300;

const POS_CLS: Record<number, string> = { 1:"badge-gk", 2:"badge-def", 3:"badge-mid", 4:"badge-fwd" };

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }       = await params;
  const [allPlayers, teams] = await Promise.all([getAllPlayers(), getAllTeams()]);
  const player = allPlayers.find((p) => p.id === parseInt(id));
  if (!player) notFound();

  const team     = teams.find((t) => t.id === player.team);
  const status   = playerStatus(player.status);
  const ictMax   = Math.max(...allPlayers.map((p) => parseFloat(p.ict_index)));
  const ptsMax   = Math.max(...allPlayers.map((p) => p.total_points));

  // ICT three bars
  const ict = [
    { label: "Influence",  value: parseFloat(player.influence),  max: 1000 },
    { label: "Creativity", value: parseFloat(player.creativity), max: 1000 },
    { label: "Threat",     value: parseFloat(player.threat),     max: 1000 },
  ];

  const sections = [
    {
      title: "Season Output",
      rows: [
        ["Total Points",  player.total_points],
        ["Points / Game", player.points_per_game],
        ["GW Points",     player.event_points],
        ["Form",          player.form],
        ["EP This GW",    player.ep_this],
        ["EP Next GW",    player.ep_next],
      ],
    },
    {
      title: "Stats",
      rows: [
        ["Minutes",        player.minutes],
        ["Goals",          player.goals_scored],
        ["Assists",        player.assists],
        ["Clean Sheets",   player.clean_sheets],
        ["Goals Conceded", player.goals_conceded],
        ["Yellow Cards",   player.yellow_cards],
        ["Red Cards",      player.red_cards],
        ["Bonus",          player.bonus],
        ["BPS",            player.bps],
      ],
    },
    {
      title: "Ownership",
      rows: [
        ["Selected By",   `${player.selected_by_percent}%`],
        ["Cost",          playerCost(player.now_cost)],
        ["Δ This GW",     `${player.cost_change_event > 0 ? "+" : ""}${(player.cost_change_event/10).toFixed(1)}`],
        ["Δ Season",      `${player.cost_change_start > 0 ? "+" : ""}${(player.cost_change_start/10).toFixed(1)}`],
        ["In This GW",    `+${player.transfers_in_event.toLocaleString()}`],
        ["Out This GW",   `-${player.transfers_out_event.toLocaleString()}`],
      ],
    },
  ];

  return (
    <div className="max-w-xl" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Back */}
      <Link href="/players" className="inline-flex items-center gap-1.5 text-[13px] w-fit transition-opacity hover:opacity-70"
            style={{ color: "var(--t3)" }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3l-5 5 5 5"/>
        </svg>
        Players
      </Link>

      {/* Profile hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex">
          {/* Photo */}
          <div className="relative w-36 shrink-0" style={{ background: "var(--raised)", minHeight: 180 }}>
            <Image src={playerPhotoUrl(player.photo)} alt={player.web_name}
                   fill className="object-cover object-top" unoptimized />
          </div>
          {/* Info */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className={`${POS_CLS[player.element_type] ?? ""} text-[10px] font-bold px-2 py-[3px] rounded-md`}>
                  {positionName(player.element_type)}
                </span>
                {team && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-[3px] rounded-md"
                        style={{ background: "var(--raised)", color: "var(--t2)" }}>
                    <Image src={`/${team.id}.png`} alt={team.short_name} width={11} height={11} unoptimized />
                    {team.name}
                  </span>
                )}
                <span className="text-[10px] font-semibold px-2 py-[3px] rounded-md"
                      style={{
                        background: player.status === "a" ? "var(--emerald-lo)" : "var(--rose-lo)",
                        color: player.status === "a" ? "var(--emerald)" : "var(--rose)",
                      }}>
                  {status.label}
                </span>
              </div>

              <h1 className="text-xl font-bold leading-tight" style={{ color: "var(--t1)" }}>
                {player.first_name}{" "}
                <span style={{ color: "var(--t2)" }}>{player.second_name}</span>
              </h1>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--t3)" }}>"{player.web_name}"</p>
            </div>

            {/* Hero stats */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { l: "Pts",  v: player.total_points },
                { l: "PPG",  v: player.points_per_game },
                { l: "Cost", v: playerCost(player.now_cost) },
              ].map(({ l, v }) => (
                <div key={l} className="rounded-xl p-2.5 text-center"
                     style={{ background: "var(--raised)", border: "1px solid var(--border)" }}>
                  <p className="text-[15px] font-black num leading-none" style={{ color: "var(--t1)" }}>{v}</p>
                  <p className="label mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* News banner */}
        {player.news && (
          <div className="px-5 py-3 flex items-start gap-2"
               style={{ background: "var(--amber-lo)", borderTop: "1px solid rgba(245,158,11,0.18)" }}>
            <span style={{ color: "var(--amber)" }}>⚠</span>
            <p className="text-[12px] font-medium" style={{ color: "var(--amber)" }}>{player.news}</p>
          </div>
        )}
      </div>

      {/* ICT breakdown */}
      <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <p className="label mb-4">ICT Index · {player.ict_index}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ict.map(({ label, value, max }) => {
            const pct = Math.min(100, (value / max) * 100);
            const color = label === "Influence" ? "var(--violet)" : label === "Creativity" ? "var(--sky)" : "var(--emerald)";
            return (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] font-medium" style={{ color: "var(--t2)" }}>{label}</span>
                  <span className="text-[12px] font-bold num" style={{ color }}>{value.toFixed(1)}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all"
                       style={{ width: `${pct}%`, background: color, opacity: 0.85 }} />
                </div>
              </div>
            );
          })}
          <div className="pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex justify-between mb-1.5">
              <span className="text-[12px] font-medium" style={{ color: "var(--t2)" }}>ICT Total</span>
              <span className="text-[12px] font-bold num" style={{ color: "var(--violet-hi)" }}>{player.ict_index}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full"
                   style={{
                     width: `${(parseFloat(player.ict_index) / ictMax) * 100}%`,
                     background: "linear-gradient(90deg,#7c3aed,#10b981)",
                   }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stat sections */}
      {sections.map(({ title, rows }) => (
        <div key={title} className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="label">{title}</p>
          </div>
          {rows.map(([label, value], i) => (
            <div key={String(label)} className="flex items-center justify-between px-5 py-2.5"
                 style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <span className="text-[13px]" style={{ color: "var(--t2)" }}>{label}</span>
              <span className="text-[13px] font-semibold num" style={{ color: "var(--t1)" }}>{value}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
