import Link from "next/link";
import Image from "next/image";
import {
  getBootstrap, getAllFixtures, getLiveData,
  getTopTransfersIn, getTopTransfersOut, getFormKings,
  getHiddenGems, buildFDRRows, playerPhotoUrl,
  ALL_STAR_GAFFERS,
} from "@/lib/fpl";
import CountdownTimer from "@/components/CountdownTimer";
import PlayerCarousel from "@/components/PlayerCarousel";
import HeroSearch from "@/components/HeroSearch";
import PlayerPhoto from "@/components/PlayerPhoto";

export const revalidate = 300;

export default async function HomePage() {
  const [bootstrap, fixtures] = await Promise.all([getBootstrap(), getAllFixtures()]);
  const { elements: players, teams, events } = bootstrap;

  const current = events.find((e) => e.is_current);
  const next    = events.find((e) => e.is_next);
  const gw      = current ?? next;
  const prevGW  = gw ? Math.max(1, gw.id - 1) : 1;

  let dreamTeam: { player: typeof players[0]; pts: number }[] = [];
  try {
    const live    = await getLiveData(prevGW);
    const liveMap = new Map(live.elements.map((e) => [e.id, e.stats.total_points]));
    dreamTeam = live.elements
      .filter((e) => e.stats.in_dreamteam)
      .map((e) => ({ player: players.find((p) => p.id === e.id)!, pts: liveMap.get(e.id) ?? 0 }))
      .filter((x) => x.player)
      .sort((a, b) => a.player.element_type - b.player.element_type);
  } catch { /* not yet available */ }

  const teamMap   = new Map(teams.map((t) => [t.id, t]));
  const playerMap = new Map(players.map((p) => [p.id, p]));

  const ins   = getTopTransfersIn(players);
  const outs  = getTopTransfersOut(players);
  const form  = getFormKings(players);
  const gems  = getHiddenGems(players);

  const fromGW  = gw?.id ?? 1;
  const fdrRows = buildFDRRows(teams, fixtures, fromGW, Math.min(38, fromGW + 5));
  const deadline = next?.deadline_time ?? gw?.deadline_time;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 48, paddingTop: 0 }}>

      {/* ── EMBASSY HEADER + STATS — unified hero zone ───────────────────── */}
      <div className="relative">

        {/* Glows — overflow visible, bleed freely beyond section */}
        <div className="absolute inset-0 pointer-events-none" style={{ overflow: "visible" }}>
          {/* Primary violet bloom — top center */}
          <div className="absolute blur-3xl" style={{
            width: 800, height: 560,
            top: -80, left: "50%", transform: "translateX(-50%)",
            background: "radial-gradient(ellipse, rgba(109,40,217,0.5) 0%, rgba(124,58,237,0.15) 45%, transparent 70%)",
          }} />
          {/* Indigo — upper left */}
          <div className="absolute blur-3xl" style={{
            width: 500, height: 500,
            top: 0, left: -160,
            background: "radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 65%)",
          }} />
          {/* Emerald — lower right */}
          <div className="absolute blur-2xl" style={{
            width: 380, height: 380,
            top: 340, right: -80,
            background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 65%)",
          }} />
          {/* Sky — lower left */}
          <div className="absolute blur-3xl" style={{
            width: 300, height: 300,
            top: 360, left: -40,
            background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 65%)",
          }} />
        </div>

        {/* ── Hero content ── */}
        <section className="relative z-10 text-center pt-12 sm:pt-16 pb-20 sm:pb-28">
          <div className="flex flex-col items-center" style={{ gap: 20 }}>

            {/* Eyebrow */}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.25)",
                color: "var(--violet-hi)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--violet-hi)", boxShadow: "0 0 5px var(--violet-hi)" }} />
              Fantasy Premier League
            </span>

            {/* Title — tightly locked, logo-like */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0, lineHeight: 1 }}>
              <h1
                className="font-black block"
                style={{
                  fontSize: "clamp(58px, 11vw, 100px)",
                  letterSpacing: "clamp(-3px, -0.04em, -6px)",
                  lineHeight: 0.87,
                  color: "var(--t1)",
                }}
              >
                GAFFER&apos;S
              </h1>
              <h1
                className="font-black gradient-text block"
                style={{
                  fontSize: "clamp(58px, 11vw, 100px)",
                  letterSpacing: "clamp(-3px, -0.04em, -6px)",
                  lineHeight: 0.87,
                }}
              >
                EMBASSY
              </h1>
              {/* closing rule under the title */}
              <div style={{ marginTop: 14, height: 2, background: "linear-gradient(to right, transparent, rgba(124,58,237,0.5) 30%, rgba(124,58,237,0.5) 70%, transparent)", borderRadius: 999 }} />
            </div>

            {/* Subtitle */}
            <p style={{ color: "var(--t3)", fontSize: 13, lineHeight: 1.75, maxWidth: 280, marginTop: 4 }}>
              Stats, fixtures &amp; squad intelligence for every FPL manager.
            </p>

            {/* Search */}
            <HeroSearch />

            {/* Countdown — extra breathing room before stats */}
            {deadline && (
              <div style={{ marginTop: 8 }}>
                <CountdownTimer deadline={deadline} />
              </div>
            )}
          </div>
        </section>

        {/* ── GW Stats strip — no boxes, just dividers ── */}
        {gw && (
          <div
            className="relative z-10 overflow-x-auto no-scrollbar"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex min-w-max mx-auto" style={{ maxWidth: 900 }}>
              {[
                { label: "GW Average",     value: gw.average_entry_score > 0 ? String(gw.average_entry_score) : "—" },
                { label: "GW Highest",     value: gw.highest_score > 0 ? String(gw.highest_score) : "—" },
                { label: "Top Scorer",     value: gw.top_element_info ? `${playerMap.get(gw.top_element_info.id)?.web_name ?? "—"}` : "—", sub: gw.top_element_info ? `${gw.top_element_info.points} pts` : undefined },
                { label: "Most Captained", value: playerMap.get(gw.most_captained)?.web_name ?? "—" },
                { label: "GW Transfers",   value: gw.transfers_made > 0 ? `${(gw.transfers_made / 1_000_000).toFixed(1)}M` : "—" },
                { label: "Total Managers", value: bootstrap.total_players > 0 ? `${(bootstrap.total_players / 1_000_000).toFixed(1)}M` : "—" },
              ].map(({ label, value, sub }, i) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center text-center px-8 py-5 flex-1"
                  style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none", minWidth: 120 }}
                >
                  <p className="text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--t4)" }}>{label}</p>
                  <p className="text-[15px] font-black truncate" style={{ color: "var(--t1)", maxWidth: 140 }}>{value}</p>
                  {sub && <p className="text-[10px] font-semibold mt-0.5" style={{ color: "var(--emerald)" }}>{sub}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── DREAM TEAM ───────────────────────────────────────────────────── */}
      {dreamTeam.length > 0 && (() => {
        const DT_POS_COLOR: Record<number, string> = { 1: "#f59e0b", 2: "#38bdf8", 3: "#10b981", 4: "#f43f5e" };
        const DT_POS_LABEL: Record<number, string> = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };
        const DT_RANK_COLOR = ["#f59e0b", "#94a3b8", "#b07030", "rgba(255,255,255,0.22)"];
        const sorted = [...dreamTeam].sort((a, b) => b.pts - a.pts);
        const [top, ...rest] = sorted;
        const topTeam = teamMap.get(top.player.team);
        const topPc = DT_POS_COLOR[top.player.element_type] ?? "#fff";
        const maxPts = top.pts;

        return (
          <section className="flex flex-col gap-2">
            <Heading label="GW Dream Team" sub={`Gameweek ${prevGW} · Team of the Week`} dot="var(--amber)" />

            {/* Hero card — identical structure to PlayerCarousel HeroCard */}
            <Link
              href={`/players/${top.player.id}`}
              className="group relative flex overflow-hidden rounded-2xl"
              style={{ height: 132, background: "var(--card)", border: "1px solid var(--border)" }}
            >
              {/* pos accent stripe */}
              <div className="absolute top-0 left-0 right-0 z-10"
                   style={{ height: 2, background: `linear-gradient(to right, ${topPc}, transparent 60%)` }} />

              {/* watermark */}
              <span className="absolute select-none pointer-events-none font-black num"
                    style={{ fontSize: 120, lineHeight: 1, right: 148, bottom: -16, color: "white", opacity: 0.035, letterSpacing: -6 }}>
                1
              </span>

              {/* left: info */}
              <div className="relative z-10 flex flex-col justify-between py-4 pl-5 pr-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-[2px] rounded text-[8px] font-black uppercase tracking-widest"
                        style={{ background: `${topPc}20`, color: topPc, border: `1px solid ${topPc}35` }}>
                    {DT_POS_LABEL[top.player.element_type]}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#f59e0b" }}>
                    ★ top scorer
                  </span>
                  {topTeam && (
                    <Image src={`/${topTeam.id}.png`} alt={topTeam.short_name} width={14} height={14} unoptimized
                           style={{ opacity: 0.6, marginLeft: "auto" }} />
                  )}
                </div>
                <div>
                  <p className="text-[19px] font-black leading-tight truncate group-hover:opacity-80 transition-opacity"
                     style={{ color: "var(--t1)", letterSpacing: -0.5 }}>
                    {top.player.web_name}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--t3)" }}>{topTeam?.short_name ?? "—"}</p>
                </div>
                <div>
                  <span className="text-[26px] font-black num leading-none" style={{ color: "#f59e0b" }}>{top.pts}</span>
                  <span className="text-[9px] uppercase tracking-widest ml-1.5" style={{ color: "var(--t3)" }}>pts</span>
                </div>
              </div>

              {/* right: photo bleeding in */}
              <div className="relative shrink-0" style={{ width: 140 }}>
                <PlayerPhoto src={playerPhotoUrl(top.player.photo)} alt={top.player.web_name}
                             fill className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0"
                     style={{ background: "linear-gradient(to right, var(--card) 0%, rgba(16,16,32,0.3) 40%, transparent 65%)" }} />
                <div className="absolute inset-0"
                     style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)" }} />
              </div>
            </Link>

            {/* Ranked rows panel — same as PlayerCarousel */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              {rest.map(({ player, pts }, i) => {
                const team = teamMap.get(player.team);
                const pc = DT_POS_COLOR[player.element_type] ?? "#fff";
                const barPct = Math.max(4, (pts / maxPts) * 100);
                const isLast = i === rest.length - 1;

                return (
                  <Link key={player.id} href={`/players/${player.id}`}
                        className="group relative flex items-center gap-3 px-4 py-2.5 overflow-hidden"
                        style={{ borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)" }}>

                    {/* bar bg */}
                    <div className="absolute inset-y-0 left-0 pointer-events-none"
                         style={{ width: `${barPct}%`, background: "rgba(245,158,11,0.05)" }} />

                    {/* rank */}
                    <span className="text-[11px] font-black num w-3.5 text-right shrink-0 relative"
                          style={{ color: DT_RANK_COLOR[i] ?? "rgba(255,255,255,0.22)" }}>
                      {i + 2}
                    </span>

                    {/* photo */}
                    <div className="relative rounded-lg overflow-hidden shrink-0"
                         style={{ width: 32, height: 42, background: "var(--raised)" }}>
                      <PlayerPhoto src={playerPhotoUrl(player.photo)} alt={player.web_name}
                                   fill className="object-cover object-top" />
                      <div className="absolute inset-y-0 left-0 w-[2px]" style={{ background: pc }} />
                    </div>

                    {/* name + team·pos */}
                    <div className="flex-1 min-w-0 relative">
                      <p className="text-[13px] font-bold truncate leading-tight group-hover:opacity-70 transition-opacity"
                         style={{ color: "var(--t1)" }}>
                        {player.web_name}
                      </p>
                      <p className="text-[10px] mt-[1px] flex items-center gap-1" style={{ color: "var(--t3)" }}>
                        {team?.short_name ?? "—"}
                        <span style={{ color: "var(--t4)" }}>·</span>
                        <span style={{ color: pc }}>{DT_POS_LABEL[player.element_type]}</span>
                      </p>
                    </div>

                    {/* pts */}
                    <div className="text-right shrink-0 relative flex flex-col items-end gap-0.5">
                      <span className="text-[13px] font-black num px-2 py-[2px] rounded-md"
                            style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                        {pts}
                      </span>
                      <span className="text-[9px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.2)" }}>pts</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* ── TRANSFERS ────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <PlayerCarousel title="Trending In" sub="most transferred in this GW" dot="var(--emerald)"
          players={ins} teamMap={teamMap}
          getStat={(p) => ({ label: "transfers in", value: p.transfers_in_event.toLocaleString() })} />
        <PlayerCarousel title="Being Sold" sub="most transferred out this GW" dot="var(--rose)"
          players={outs} teamMap={teamMap}
          getStat={(p) => ({ label: "transfers out", value: p.transfers_out_event.toLocaleString() })} />
      </section>

      {/* ── INTELLIGENCE ─────────────────────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 36 }}>
        <PlayerCarousel title="In Form" sub="ranked by recent form score" dot="var(--violet)"
          players={form} teamMap={teamMap}
          getStat={(p) => ({ label: "form", value: p.form })} />
        <PlayerCarousel title="Hidden Gems" sub="under 10% owned · ranked by PPG" dot="var(--emerald)"
          players={gems} teamMap={teamMap}
          getStat={(p) => ({ label: "pts / game", value: p.points_per_game })} />
      </section>

      {/* ── FDR + MANAGERS ───────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* FDR mini */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <Heading label="Fixture Difficulty" dot="var(--sky)" />
              <p className="text-[12px] mt-1" style={{ color: "var(--t3)" }}>Next 6 gameweeks · all teams</p>
            </div>
            <Link href="/fdr" className="text-[12px] font-medium transition-opacity hover:opacity-70 mt-0.5"
                  style={{ color: "var(--violet-hi)" }}>
              Full view →
            </Link>
          </div>
          {/* legend */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {[["fdr-2","Easy"],["fdr-3","Medium"],["fdr-4","Hard"],["fdr-5","Very Hard"]].map(([c,l]) => (
              <span key={c} className={`${c} px-2 py-0.5 rounded-md text-[10px] font-semibold`}>{l}</span>
            ))}
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>
                  <th className="text-left pr-3 pb-2 font-medium" style={{ color: "var(--t3)", minWidth: 76 }}>Team</th>
                  {Array.from({ length: 6 }, (_, i) => (
                    <th key={i} className="text-center px-0.5 pb-2 font-medium" style={{ color: "var(--t3)", minWidth: 42 }}>
                      GW{fromGW + i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fdrRows.map(({ team, fixtures: fxs }) => (
                  <tr key={team.id}>
                    <td className="py-0.5 pr-3">
                      <div className="flex items-center gap-1.5">
                        <Image src={`/${team.id}.png`} alt={team.short_name} width={14} height={14} unoptimized style={{ opacity: 0.75 }} />
                        <span className="font-semibold" style={{ color: "var(--t2)" }}>{team.short_name}</span>
                      </div>
                    </td>
                    {fxs.map((fx, i) => (
                      <td key={i} className="py-0.5 px-0.5">
                        <div className={`fdr-${fx.difficulty} text-center rounded-md py-[5px] font-semibold leading-none`}>
                          {fx.opponent === "-"
                            ? <span style={{ opacity: 0.15 }}>—</span>
                            : <>{fx.opponent}<span style={{ opacity: 0.45, fontSize: 9 }} className="ml-0.5">{fx.isHome ? "H" : "A"}</span></>}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notable managers */}
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <Heading label="Notable Managers" dot="var(--amber)" />
          <p className="text-[12px] mt-1 mb-5" style={{ color: "var(--t3)" }}>Famous people playing FPL</p>
          <div>
            {ALL_STAR_GAFFERS.map((g, i) => (
              <Link key={g.id} href={`/gaffers/${g.id}`}
                    className="row-hover flex items-center gap-3 px-2 py-2.5 rounded-lg -mx-2">
                <span className="text-[11px] w-4 text-right num shrink-0" style={{ color: "var(--t4)" }}>
                  {i + 1}
                </span>
                <span className="flex-1 text-[13px] font-medium" style={{ color: "var(--t2)" }}>
                  {g.name}
                </span>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--t4)", flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l4 4-4 4"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}

function Heading({ label, sub, dot }: { label: string; sub?: string; dot?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {dot && <span className="w-[3px] h-[18px] rounded-full shrink-0" style={{ background: dot }} />}
      <span className="text-[15px] font-semibold" style={{ color: "var(--t1)" }}>{label}</span>
      {sub && <span className="text-[12px]" style={{ color: "var(--t3)" }}>{sub}</span>}
    </div>
  );
}
