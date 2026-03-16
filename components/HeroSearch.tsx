"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  function go(e: React.FormEvent) {
    e.preventDefault();
    const id = q.trim();
    if (id) { router.push(`/gaffers/${id}`); setQ(""); }
  }

  return (
    <form onSubmit={go}>
      <div
        className="flex items-center gap-0"
        style={{
          background: focused ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.045)",
          border: `1px solid ${focused ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.09)"}`,
          borderRadius: 999,
          boxShadow: focused ? "0 0 0 3px rgba(124,58,237,0.1), 0 0 24px rgba(124,58,237,0.15)" : "none",
          transition: "all 0.2s ease",
          padding: "5px 5px 5px 18px",
        }}
      >
        {/* Icon */}
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"
             style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, marginRight: 10 }}>
          <circle cx="5.5" cy="5.5" r="4.5" />
          <path strokeLinecap="round" d="m9.5 9.5 2 2" />
        </svg>

        {/* Input */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Enter manager ID…"
          className="bg-transparent text-[13px] focus:outline-none placeholder:text-white/25"
          style={{ color: "var(--t1)", width: 180 }}
        />

        {/* Submit arrow — always visible, activates on input */}
        <button
          type="submit"
          disabled={!q.trim()}
          className="flex items-center justify-center rounded-full transition-all"
          style={{
            width: 30, height: 30, flexShrink: 0,
            background: q.trim() ? "var(--violet)" : "rgba(255,255,255,0.06)",
            opacity: q.trim() ? 1 : 0.5,
          }}
        >
          <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6h8M6 2l4 4-4 4" />
          </svg>
        </button>
      </div>
    </form>
  );
}
