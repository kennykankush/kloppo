"use client";

import { useEffect, useState } from "react";

function getLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1_000),
  };
}

export default function CountdownTimer({ deadline }: { deadline: string }) {
  const [t, setT] = useState(getLeft(deadline));
  useEffect(() => {
    const id = setInterval(() => setT(getLeft(deadline)), 1_000);
    return () => clearInterval(id);
  }, [deadline]);

  if (!t) return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--emerald)" }}>
      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--emerald)" }} />
      Gameweek Live
    </span>
  );

  const blocks = [
    { v: t.h,  u: "h" },
    { v: t.m,  u: "m" },
    { v: t.s,  u: "s" },
  ];

  return (
    <span className="inline-flex items-baseline gap-1">
      {blocks.map(({ v, u }) => (
        <span key={u} className="inline-flex items-baseline gap-0.5">
          <span className="text-sm font-bold num" style={{ color: "var(--t1)" }}>
            {String(v).padStart(2, "0")}
          </span>
          <span className="text-xs font-medium" style={{ color: "var(--t3)" }}>{u}</span>
        </span>
      ))}
      <span className="text-xs ml-1" style={{ color: "var(--t3)" }}>to deadline</span>
    </span>
  );
}
