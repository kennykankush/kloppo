import { getBootstrap, getCurrentEvent } from "@/lib/fpl";
import ConceptBuilder from "./ConceptBuilder";

export const metadata = { title: "Concept Squad · Gaffer Embassy" };

export default async function ConceptPage() {
  const [bootstrap, currentEvent] = await Promise.all([getBootstrap(), getCurrentEvent()]);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--t1)" }}>
          Concept Squad
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--t3)" }}>
          Build your what-if XI, pick a captain, then share the link.
        </p>
      </div>

      <ConceptBuilder
        players={bootstrap.elements}
        teams={bootstrap.teams}
        gameweek={currentEvent?.id ?? 1}
      />
    </div>
  );
}
