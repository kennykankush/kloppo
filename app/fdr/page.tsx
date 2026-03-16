import Image from "next/image";
import { getBootstrap, getAllFixtures, buildFDRRows } from "@/lib/fpl";

export const revalidate = 300;

export default async function FDRPage() {
  const [bootstrap, fixtures] = await Promise.all([getBootstrap(), getAllFixtures()]);
  const { teams, events } = bootstrap;

  const current = events.find((e) => e.is_current) ?? events.find((e) => e.is_next);
  const fromGW  = current?.id ?? 1;
  const rows    = buildFDRRows(teams, fixtures, fromGW, 38);
  const cols    = 38 - fromGW + 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--t1)" }}>Fixture Difficulty</h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--t3)" }}>
          GW{fromGW}–GW38 · Difficulty rated 1 (easy) → 5 (very hard)
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {[
          { c: "fdr-1", l: "1 · Very Easy" },
          { c: "fdr-2", l: "2 · Easy" },
          { c: "fdr-3", l: "3 · Medium" },
          { c: "fdr-4", l: "4 · Hard" },
          { c: "fdr-5", l: "5 · Very Hard" },
        ].map(({ c, l }) => (
          <span key={c} className={`${c} px-3 py-1 rounded-lg text-[11px] font-semibold`}>{l}</span>
        ))}
      </div>

      {/* Matrix */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="overflow-x-auto no-scrollbar">
          <table style={{ borderCollapse: "collapse", fontSize: 11, width: "100%" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th
                  className="sticky left-0 z-10 py-3 pl-4 pr-3 text-left font-semibold label"
                  style={{ background: "var(--card)", minWidth: 112 }}
                >
                  Team
                </th>
                {Array.from({ length: cols }, (_, i) => (
                  <th key={i} className="py-3 px-0.5 text-center font-medium label"
                      style={{ minWidth: 40, color: "var(--t4)" }}>
                    {fromGW + i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ team, fixtures: fxs }, ri) => (
                <tr key={team.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td
                    className="sticky left-0 z-10 py-1.5 pl-4 pr-3"
                    style={{ background: "var(--card)" }}
                  >
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Image src={`/${team.id}.png`} alt={team.short_name}
                             width={18} height={18} unoptimized style={{ opacity: 0.8 }} />
                      <span className="font-semibold" style={{ color: "var(--t1)" }}>{team.short_name}</span>
                    </div>
                  </td>
                  {fxs.map((fx, ci) => (
                    <td key={ci} className="py-1 px-0.5">
                      <div className={`fdr-${fx.difficulty} rounded-lg text-center py-[6px] font-bold leading-none`}>
                        {fx.opponent === "-"
                          ? <span style={{ opacity: 0.12 }}>—</span>
                          : (
                            <>
                              {fx.opponent}
                              <span style={{ opacity: 0.4, fontSize: 8 }} className="ml-[2px]">
                                {fx.isHome ? "H" : "A"}
                              </span>
                            </>
                          )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
