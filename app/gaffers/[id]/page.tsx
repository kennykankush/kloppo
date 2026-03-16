import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getGafferEntry, getGafferHistory, getGafferPicks,
  getBootstrap, getLiveData,
  mapRankBadge, mapOverallBadge,
  playerPhotoUrl, positionShort,
} from "@/lib/fpl";
import RankBadge from "@/components/RankBadge";

export const revalidate = 60;

export default async function GafferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let entry: Awaited<ReturnType<typeof getGafferEntry>>;
  let history: Awaited<ReturnType<typeof getGafferHistory>>;
  let bootstrap: Awaited<ReturnType<typeof getBootstrap>>;

  try {
    [entry, history, bootstrap] = await Promise.all([
      getGafferEntry(id),
      getGafferHistory(id),
      getBootstrap(),
    ]);
  } catch { notFound(); }

  const { elements: players, events } = bootstrap!;
  const playerMap = new Map(players.map((p) => [p.id, p]));
  const prevGW    = Math.max(1, (events.find((e) => e.is_current)?.id ?? 1) - 1);

  let picks: Awaited<ReturnType<typeof getGafferPicks>>;
  let liveData: Awaited<ReturnType<typeof getLiveData>>;

  try {
    [picks, liveData] = await Promise.all([
      getGafferPicks(id, prevGW),
      getLiveData(prevGW),
    ]);
  } catch { notFound(); }

  const liveMap  = new Map(liveData!.elements.map((e) => [e.id, e.stats.total_points]));
  const pct      = picks!.entry_history.percentile_rank;
  const overall  = entry!.summary_overall_rank;
  const weekTier = mapRankBadge(pct);
  const allTier  = mapOverallBadge(overall);

  const starters = picks!.picks.slice(0, 11);
  const bench    = picks!.picks.slice(11);

  const gwPts    = starters.reduce((s, p) => s + (liveMap.get(p.element) ?? 0) * p.multiplier, 0);
  const benchPts = bench.reduce((s, p)    => s + (liveMap.get(p.element) ?? 0), 0);

  // For the sparkline
  const hist    = history!.current;
  const maxPts  = Math.max(...hist.map((g) => g.points), 1);

  // Group starters by row (FWD → MID → DEF → GK for top-to-bottom on pitch)
  const rows = [4, 3, 2, 1].map((et) => starters.filter((p) => p.element_type === et));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 760, margin: "0 auto" }}>

      {/* ── Profile header ── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="px-6 py-6 relative"
             style={{ background: "linear-gradient(135deg,#120a26 0%,var(--card) 100%)" }}>
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: "radial-gradient(ellipse at top left,rgba(124,58,237,0.18) 0%,transparent 60%)" }} />

          <div className="relative flex flex-col sm:flex-row gap-6 justify-between">
            <div>
              <p className="label mb-2" style={{ color: "var(--violet-hi)", opacity: 0.9 }}>
                {entry!.player_first_name} {entry!.player_last_name}
              </p>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--t1)" }}>
                {entry!.name}
              </h1>

              {/* Chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {picks!.active_chip && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        style={{ background: "var(--violet-lo)", color: "var(--violet-hi)" }}>
                    {picks!.active_chip} active
                  </span>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
                {[
                  { l: "GW Points",  v: picks!.entry_history.points,                         hi: true },
                  { l: "Total Pts",  v: entry!.summary_overall_points },
                  { l: "GW Rank",    v: picks!.entry_history.rank?.toLocaleString() },
                  { l: "Overall",    v: overall?.toLocaleString() },
                  { l: "Value",      v: `£${(picks!.entry_history.value / 10).toFixed(1)}m` },
                  { l: "Bank",       v: `£${(picks!.entry_history.bank / 10).toFixed(1)}m` },
                  { l: "Transfers",  v: picks!.entry_history.event_transfers },
                  {
                    l: "Transfer Hit",
                    v: picks!.entry_history.event_transfers_cost > 0 ? `-${picks!.entry_history.event_transfers_cost}` : "—",
                    neg: picks!.entry_history.event_transfers_cost > 0,
                  },
                ].map(({ l, v, hi, neg }) => (
                  <div key={l} className="rounded-xl px-3 py-2.5"
                       style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="label mb-1">{l}</p>
                    <p className="text-[15px] font-bold num"
                       style={{ color: hi ? "var(--violet-hi)" : neg ? "var(--rose)" : "var(--t1)" }}>
                      {v ?? "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rank badges */}
            <div className="flex gap-2.5 shrink-0 self-start">
              <RankBadge tier={weekTier}  label={`Top ${pct.toFixed(1)}%`} sub="Weekly rank" />
              <RankBadge tier={allTier}   label={`#${overall?.toLocaleString()}`} sub="Season rank" />
            </div>
          </div>
        </div>

        {/* Bench points wasted strip */}
        {benchPts > 0 && (
          <div className="px-6 py-2.5 flex items-center justify-between"
               style={{ background: "var(--amber-lo)", borderTop: "1px solid rgba(245,158,11,0.15)" }}>
            <span className="text-[12px] font-medium" style={{ color: "var(--amber)" }}>
              {benchPts} points left on bench
            </span>
            <span className="text-[11px]" style={{ color: "rgba(245,158,11,0.6)" }}>GW{prevGW}</span>
          </div>
        )}
      </div>

      {/* ── Pitch ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[15px] font-semibold" style={{ color: "var(--t1)" }}>GW{prevGW} Squad</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px]" style={{ color: "var(--t3)" }}>Points</span>
            <span className="text-[18px] font-black num" style={{ color: "var(--t1)" }}>{gwPts}</span>
          </div>
        </div>

        {/* Starting XI on pitch */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            minHeight: 400,
            background: "linear-gradient(180deg,#0b2e10 0%,#092509 55%,#0b2e10 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 400"
               preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.09 }}>
            <rect x="1" y="1" width="498" height="398" fill="none" stroke="white" strokeWidth="1.5" />
            <line x1="0" y1="200" x2="500" y2="200" stroke="white" strokeWidth="1" />
            <circle cx="250" cy="200" r="52" fill="none" stroke="white" strokeWidth="1" />
            <rect x="165" y="0" width="170" height="70" fill="none" stroke="white" strokeWidth="1" />
            <rect x="200" y="0" width="100" height="38" fill="none" stroke="white" strokeWidth="1" />
            <rect x="165" y="330" width="170" height="70" fill="none" stroke="white" strokeWidth="1" />
            <rect x="200" y="362" width="100" height="38" fill="none" stroke="white" strokeWidth="1" />
          </svg>

          <div className="relative flex flex-col justify-around items-center h-full min-h-[400px] py-5 gap-1">
            {rows.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-4 sm:gap-8 w-full">
                {row.map((pick) => {
                  const player = playerMap.get(pick.element);
                  if (!player) return null;
                  const pts = (liveMap.get(pick.element) ?? 0) * pick.multiplier;
                  return (
                    <PitchToken
                      key={pick.element}
                      id={pick.element}
                      name={player.web_name}
                      photo={player.photo}
                      pts={pts}
                      isCaptain={pick.is_captain}
                      isVice={pick.is_vice_captain}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bench */}
        <div className="mt-3 rounded-xl px-4 py-3 flex justify-around items-center"
             style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] font-semibold label self-start pt-1">Bench</p>
          {bench.map((pick) => {
            const player = playerMap.get(pick.element);
            if (!player) return null;
            return (
              <PitchToken
                key={pick.element}
                id={pick.element}
                name={player.web_name}
                photo={player.photo}
                pts={liveMap.get(pick.element) ?? 0}
                isCaptain={false}
                isVice={false}
                small
              />
            );
          })}
        </div>
      </div>

      {/* ── Season History ── */}
      {hist.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {/* Sparkline */}
          <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="text-[15px] font-semibold mb-3" style={{ color: "var(--t1)" }}>Season History</p>
            <div className="flex items-end gap-[3px]" style={{ height: 52 }}>
              {hist.map((g) => {
                const pct = (g.points / maxPts) * 100;
                const isGood = g.points > (hist.reduce((s, x) => s + x.points, 0) / hist.length);
                return (
                  <div key={g.event} className="flex-1 flex flex-col justify-end" title={`GW${g.event}: ${g.points}pts`}>
                    <div
                      className="rounded-t-sm transition-all"
                      style={{
                        height: `${Math.max(4, pct)}%`,
                        background: isGood ? "var(--violet)" : "rgba(255,255,255,0.12)",
                        opacity: 0.8,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px]" style={{ color: "var(--t4)" }}>GW1</span>
              <span className="text-[10px]" style={{ color: "var(--t4)" }}>GW{hist[hist.length-1]?.event}</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["GW","Points","Rank","Transfers","Hit","Bench","Value"].map((h) => (
                    <th key={h} className={`py-2.5 font-semibold label ${h === "GW" ? "text-left pl-5 pr-3" : "text-right px-3 last:pr-5"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...hist].reverse().map((g) => (
                  <tr key={g.event} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="pl-5 pr-3 py-2.5">
                      <Link href={`/fixtures/${g.event}`}
                            className="font-semibold transition-colors hover:text-violet-400"
                            style={{ color: "var(--t2)" }}>
                        GW{g.event}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold num" style={{ color: "var(--t1)" }}>{g.points}</td>
                    <td className="px-3 py-2.5 text-right num" style={{ color: "var(--t3)" }}>{g.rank?.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right num" style={{ color: "var(--t3)" }}>{g.event_transfers}</td>
                    <td className="px-3 py-2.5 text-right num">
                      {g.event_transfers_cost > 0
                        ? <span className="font-semibold" style={{ color: "var(--rose)" }}>-{g.event_transfers_cost}</span>
                        : <span style={{ color: "var(--t4)" }}>—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right num" style={{ color: "var(--t4)" }}>{g.points_on_bench}</td>
                    <td className="px-3 pr-5 py-2.5 text-right num" style={{ color: "var(--t3)" }}>
                      £{(g.value / 10).toFixed(1)}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PitchToken({
  id, name, photo, pts, isCaptain, isVice, small,
}: {
  id: number; name: string; photo: string; pts: number;
  isCaptain: boolean; isVice: boolean; small?: boolean;
}) {
  const w = small ? 42 : 52;
  const h = small ? 52 : 66;
  const border = isCaptain ? "2px solid var(--amber)" : isVice ? "2px solid var(--emerald)" : "1px solid rgba(255,255,255,0.2)";

  return (
    <Link href={`/players/${id}`} className="flex flex-col items-center gap-1 group">
      <div className="relative rounded-xl overflow-hidden shadow-xl transition-transform duration-150 group-hover:-translate-y-1"
           style={{ width: w, height: h, border, flexShrink: 0 }}>
        <Image src={playerPhotoUrl(photo)} alt={name} fill className="object-cover object-top" unoptimized />
        {isCaptain && (
          <div className="absolute top-0.5 right-0.5 w-[14px] h-[14px] rounded flex items-center justify-center text-[8px] font-black"
               style={{ background: "var(--amber)", color: "#000" }}>C</div>
        )}
        {isVice && (
          <div className="absolute top-0.5 right-0.5 w-[14px] h-[14px] rounded flex items-center justify-center text-[8px] font-black"
               style={{ background: "var(--emerald)", color: "#000" }}>V</div>
        )}
      </div>
      <div className="text-center rounded-lg px-1.5 py-1" style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}>
        <p className={`font-semibold truncate ${small ? "text-[9px] max-w-[42px]" : "text-[10px] max-w-[54px]"}`}
           style={{ color: "var(--t1)" }}>{name}</p>
        <p className={`font-bold num ${small ? "text-[9px]" : "text-[10px]"}`}
           style={{ color: isCaptain ? "var(--amber)" : isVice ? "var(--emerald)" : "var(--t3)" }}>
          {pts}
        </p>
      </div>
    </Link>
  );
}
