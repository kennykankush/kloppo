import Link from "next/link";
import Image from "next/image";
import { getFixturesByGameweek, getBootstrap } from "@/lib/fpl";

export const revalidate = 300;

export default async function FixturesPage({ params }: { params: Promise<{ gameweek: string }> }) {
  const { gameweek } = await params;
  const gw = parseInt(gameweek);

  const [fixtures, bootstrap] = await Promise.all([
    getFixturesByGameweek(gw),
    getBootstrap(),
  ]);
  const teamMap = new Map(bootstrap.teams.map((t) => [t.id, t]));

  const sorted = [...fixtures].sort((a, b) => {
    if (!a.kickoff_time) return 1;
    if (!b.kickoff_time) return -1;
    return new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime();
  });

  // Group by calendar date
  const grouped = new Map<string, typeof sorted>();
  for (const fx of sorted) {
    const key = fx.kickoff_time
      ? new Date(fx.kickoff_time).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long" })
      : "Date TBC";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(fx);
  }

  const totalFinished = sorted.filter((f) => f.finished).length;
  const totalLive     = sorted.filter((f) => f.started && !f.finished).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 640, margin: "0 auto" }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={gw > 1 ? `/fixtures/${gw - 1}` : "#"}
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:brightness-125"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--t3)", pointerEvents: gw <= 1 ? "none" : "auto", opacity: gw <= 1 ? 0.3 : 1 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3l-5 5 5 5"/>
          </svg>
        </Link>

        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold" style={{ color: "var(--t1)" }}>Gameweek {gw}</h1>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--t3)" }}>
            {totalFinished > 0 && `${totalFinished} played`}
            {totalLive > 0 && ` · ${totalLive} live`}
            {totalFinished === 0 && totalLive === 0 && `${sorted.length} fixtures`}
          </p>
        </div>

        <Link href={gw < 38 ? `/fixtures/${gw + 1}` : "#"}
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:brightness-125"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--t3)", pointerEvents: gw >= 38 ? "none" : "auto", opacity: gw >= 38 ? 0.3 : 1 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l5 5-5 5"/>
          </svg>
        </Link>
      </div>

      {/* Grouped fixtures */}
      {Array.from(grouped.entries()).map(([date, dayFx]) => (
        <div key={date} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest px-1" style={{ color: "var(--t3)" }}>
            {date}
          </p>

          {dayFx.map((fx) => {
            const home = teamMap.get(fx.team_h);
            const away = teamMap.get(fx.team_a);
            const time = fx.kickoff_time
              ? new Date(fx.kickoff_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
              : "TBC";

            const isLive     = fx.started && !fx.finished;
            const isFinished = fx.finished;

            return (
              <div key={fx.id} className="rounded-2xl px-5 py-4"
                   style={{ background: "var(--card)", border: `1px solid ${isLive ? "rgba(245,158,11,0.3)" : "var(--border)"}` }}>
                <div className="grid items-center gap-3"
                     style={{ gridTemplateColumns: "1fr 90px 1fr" }}>

                  {/* Home */}
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-semibold text-[14px] text-right hidden sm:block" style={{ color: "var(--t1)" }}>
                      {home?.name}
                    </span>
                    <span className="font-semibold text-[14px] text-right sm:hidden" style={{ color: "var(--t1)" }}>
                      {home?.short_name}
                    </span>
                    {home && (
                      <Image src={`/${home.id}.png`} alt={home.short_name} width={38} height={38} unoptimized className="shrink-0" />
                    )}
                  </div>

                  {/* Centre */}
                  <div className="text-center">
                    {isFinished ? (
                      <div>
                        <p className="text-[22px] font-black num leading-none" style={{ color: "var(--t1)" }}>
                          {fx.team_h_score}
                          <span className="mx-1.5 text-[16px] font-normal" style={{ color: "var(--t3)" }}>–</span>
                          {fx.team_a_score}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "var(--emerald)" }}>FT</p>
                      </div>
                    ) : isLive ? (
                      <div>
                        <p className="text-[22px] font-black num leading-none" style={{ color: "var(--t1)" }}>
                          {fx.team_h_score ?? 0}
                          <span className="mx-1.5 text-[16px] font-normal" style={{ color: "var(--t3)" }}>–</span>
                          {fx.team_a_score ?? 0}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1 animate-pulse" style={{ color: "var(--amber)" }}>
                          ● Live
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[16px] font-bold num" style={{ color: "var(--t2)" }}>{time}</p>
                      </div>
                    )}
                  </div>

                  {/* Away */}
                  <div className="flex items-center gap-3">
                    {away && (
                      <Image src={`/${away.id}.png`} alt={away.short_name} width={38} height={38} unoptimized className="shrink-0" />
                    )}
                    <span className="font-semibold text-[14px] hidden sm:block" style={{ color: "var(--t1)" }}>
                      {away?.name}
                    </span>
                    <span className="font-semibold text-[14px] sm:hidden" style={{ color: "var(--t1)" }}>
                      {away?.short_name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
