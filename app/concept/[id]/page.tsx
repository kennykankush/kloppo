import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getConceptSquad } from "@/app/actions/concept";
import { getBootstrap, getCurrentEvent, getLiveData, playerPhotoUrl, playerCost } from "@/lib/fpl";

export const revalidate = 120;

const POS_LABEL: Record<number, string> = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };
const POS_COLOR: Record<number, string> = { 1: "#f59e0b", 2: "#38bdf8", 3: "#10b981", 4: "#f43f5e" };

export default async function ConceptViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const squad = await getConceptSquad(id);
  if (!squad) notFound();

  const [bootstrap, currentEvent] = await Promise.all([getBootstrap(), getCurrentEvent()]);
  const gw = currentEvent?.id ?? squad.gameweek;

  let liveData;
  try {
    liveData = await getLiveData(gw);
  } catch {
    liveData = null;
  }

  const playerMap = new Map(bootstrap.elements.map((p) => [p.id, p]));
  const teamMap   = new Map(bootstrap.teams.map((t) => [t.id, t]));
  const liveMap   = new Map(liveData?.elements.map((e) => [e.id, e.stats.total_points]) ?? []);

  const picks = squad.picks;

  // Score — captain doubles
  const totalScore = picks.reduce((sum, pick) => {
    const pts = liveMap.get(pick.playerId) ?? 0;
    return sum + (pick.isCaptain ? pts * 2 : pts);
  }, 0);

  // Group by position for pitch (FWD → GK, top to bottom)
  const byPos: Record<number, typeof picks> = { 1: [], 2: [], 3: [], 4: [] };
  for (const pick of picks) {
    const p = playerMap.get(pick.playerId);
    if (p) byPos[p.element_type].push(pick);
  }
  const pitchRows = [byPos[4], byPos[3], byPos[2], byPos[1]];

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/concept/${id}`;

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

      {/* ── Header ── */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{ border: "1px solid var(--border)" }}
      >
        <div
          className="px-6 py-6"
          style={{ background: "linear-gradient(135deg,#120a26 0%,var(--card) 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: "radial-gradient(ellipse at top left,rgba(124,58,237,0.18) 0%,transparent 60%)" }} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="label mb-1" style={{ color: "var(--violet-hi)", opacity: 0.9 }}>
                GW{gw} Concept Squad
              </p>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--t1)" }}>
                {squad.name ?? "Untitled Squad"}
              </h1>
              <p className="text-[12px] mt-1" style={{ color: "var(--t3)" }}>
                Saved {new Date(squad.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>

            {/* Score */}
            <div className="flex flex-col items-end shrink-0">
              <p className="text-[11px] uppercase tracking-widest font-bold" style={{ color: "var(--t3)" }}>Live Points</p>
              <p className="text-[48px] font-black num leading-none" style={{ color: "var(--t1)" }}>{totalScore}</p>
            </div>
          </div>

          {/* Share */}
          <div className="relative mt-4 flex items-center gap-2">
            <code
              className="text-[11px] px-3 py-1.5 rounded-lg flex-1 truncate"
              style={{ background: "rgba(255,255,255,0.06)", color: "var(--t3)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {shareUrl}
            </code>
            <Link
              href="/concept"
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
              style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}
            >
              Build your own
            </Link>
          </div>
        </div>
      </div>

      {/* ── Pitch ── */}
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
          {pitchRows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-4 sm:gap-8 w-full">
              {row.map((pick) => {
                const player = playerMap.get(pick.playerId);
                if (!player) return null;
                const rawPts = liveMap.get(pick.playerId) ?? 0;
                const pts = pick.isCaptain ? rawPts * 2 : rawPts;
                return (
                  <ViewToken
                    key={pick.playerId}
                    id={pick.playerId}
                    name={player.web_name}
                    photo={player.photo}
                    pts={pts}
                    isCaptain={pick.isCaptain}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Player breakdown table ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-[14px] font-semibold" style={{ color: "var(--t1)" }}>Player breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Player", "Pos", "Club", "Cost", "GW Pts", "Season", "Form"].map((h) => (
                  <th
                    key={h}
                    className={`py-2.5 font-semibold label ${h === "Player" ? "text-left pl-5 pr-3" : "text-right px-3 last:pr-5"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {picks.map((pick) => {
                const p = playerMap.get(pick.playerId);
                if (!p) return null;
                const team = teamMap.get(p.team);
                const rawPts = liveMap.get(pick.playerId) ?? 0;
                const pts = pick.isCaptain ? rawPts * 2 : rawPts;
                const pc = POS_COLOR[p.element_type] ?? "#fff";

                return (
                  <tr key={pick.playerId} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="pl-5 pr-3 py-2.5">
                      <Link
                        href={`/players/${p.id}`}
                        className="flex items-center gap-2.5 transition-opacity hover:opacity-75"
                      >
                        <div className="relative rounded-lg overflow-hidden shrink-0" style={{ width: 28, height: 36 }}>
                          <Image src={playerPhotoUrl(p.photo)} alt={p.web_name} fill className="object-cover object-top" unoptimized />
                        </div>
                        <span className="font-semibold" style={{ color: "var(--t1)" }}>
                          {p.web_name}
                          {pick.isCaptain && (
                            <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: "var(--amber)", color: "#000" }}>C</span>
                          )}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[10px] font-black px-1.5 py-[2px] rounded" style={{ background: `${pc}20`, color: pc, border: `1px solid ${pc}35` }}>
                        {POS_LABEL[p.element_type]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium" style={{ color: "var(--t3)" }}>
                      {team?.short_name ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right num font-semibold" style={{ color: "#a78bfa" }}>
                      {playerCost(p.now_cost)}
                    </td>
                    <td className="px-3 py-2.5 text-right num font-bold" style={{ color: pts > 0 ? "var(--emerald)" : "var(--t3)" }}>
                      {pts}
                      {pick.isCaptain && rawPts > 0 && (
                        <span className="text-[9px] ml-1" style={{ color: "var(--amber)" }}>2×</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right num" style={{ color: "var(--t2)" }}>{p.total_points}</td>
                    <td className="px-3 pr-5 py-2.5 text-right num" style={{ color: "var(--t3)" }}>{p.form}</td>
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

function ViewToken({
  id, name, photo, pts, isCaptain,
}: {
  id: number; name: string; photo: string; pts: number; isCaptain: boolean;
}) {
  const border = isCaptain ? "2px solid var(--amber)" : "1px solid rgba(255,255,255,0.2)";

  return (
    <Link href={`/players/${id}`} className="flex flex-col items-center gap-1 group">
      <div
        className="relative rounded-xl overflow-hidden shadow-xl transition-transform duration-150 group-hover:-translate-y-1"
        style={{ width: 52, height: 66, border, flexShrink: 0 }}
      >
        <Image src={playerPhotoUrl(photo)} alt={name} fill className="object-cover object-top" unoptimized />
        {isCaptain && (
          <div
            className="absolute top-0.5 right-0.5 w-[14px] h-[14px] rounded flex items-center justify-center text-[8px] font-black"
            style={{ background: "var(--amber)", color: "#000" }}
          >C</div>
        )}
      </div>
      <div className="text-center rounded-lg px-1.5 py-1" style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}>
        <p className="text-[10px] font-semibold truncate max-w-[54px]" style={{ color: "var(--t1)" }}>{name}</p>
        <p className="text-[10px] font-bold num" style={{ color: isCaptain ? "var(--amber)" : "var(--t3)" }}>{pts}</p>
      </div>
    </Link>
  );
}
