import Image from "next/image";
import { getAllTeams } from "@/lib/fpl";

export const revalidate = 300;

function StrengthBar({ value, max = 1400 }: { value: number; max?: number }) {
  const pct = Math.max(5, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--violet)", opacity: 0.7 }} />
    </div>
  );
}

export default async function TeamsPage() {
  const teams  = await getAllTeams();
  const sorted = [...teams].sort((a, b) => b.strength - a.strength);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--t1)" }}>Teams</h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--t3)" }}>All 20 Premier League clubs · FPL strength ratings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sorted.map((team, i) => {
          const atkAvg = Math.round((team.strength_attack_home + team.strength_attack_away) / 2);
          const defAvg = Math.round((team.strength_defence_home + team.strength_defence_away) / 2);
          const maxStr = sorted[0].strength;
          return (
            <div key={team.id} className="rounded-xl p-4 hover-lift"
                 style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3 mb-4">
                <Image src={`/${team.id}.png`} alt={team.short_name}
                       width={44} height={44} unoptimized className="shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-[14px] truncate" style={{ color: "var(--t1)" }}>{team.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--t3)" }}>{team.short_name}</p>
                </div>
                <span className="ml-auto text-[11px] font-bold num px-2 py-1 rounded-lg"
                      style={{ background: "var(--raised)", color: "var(--t2)" }}>
                  #{i + 1}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Overall", value: team.strength, max: maxStr + 50 },
                  { label: "Attack",  value: atkAvg,         max: 1400 },
                  { label: "Defence", value: defAvg,          max: 1400 },
                ].map(({ label, value, max }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px]" style={{ color: "var(--t3)" }}>{label}</span>
                      <span className="text-[10px] font-bold num" style={{ color: "var(--t2)" }}>{value}</span>
                    </div>
                    <StrengthBar value={value} max={max} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
