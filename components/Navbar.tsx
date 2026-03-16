"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/fixtures", label: "Fixtures" },
  { href: "/fdr",      label: "FDR"      },
  { href: "/players",  label: "Players"  },
  { href: "/teams",    label: "Teams"    },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [q, setQ]           = useState("");
  const [focused, setFocused] = useState(false);

  function go(e: React.FormEvent) {
    e.preventDefault();
    const id = q.trim();
    if (id) { router.push(`/gaffers/${id}`); setQ(""); }
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.055)" }}
    >
      <nav style={{ background: "rgba(7,7,15,0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[56px] flex items-center gap-8">

          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[11px] font-black"
              style={{ background: "linear-gradient(135deg,#7c3aed,#10b981)" }}
            >G</span>
            <span className="text-sm font-bold tracking-[0.12em] hidden sm:block" style={{ color: "var(--t1)" }}>
              GAFFER
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-0.5 flex-1">
            {NAV.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
                  style={{ color: active ? "var(--t1)" : "var(--t3)", background: active ? "rgba(255,255,255,0.07)" : "transparent" }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Search */}
          <form onSubmit={go} className="flex items-center gap-2">
            <label
              className="flex items-center gap-2 h-8 px-3 rounded-lg text-[13px] cursor-text transition-all"
              style={{
                background: focused ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${focused ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: focused ? "0 0 0 3px rgba(124,58,237,0.1)" : "none",
              }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--t3)", flexShrink: 0 }}>
                <circle cx="5.5" cy="5.5" r="4.5"/><path strokeLinecap="round" d="m9.5 9.5 2.5 2.5"/>
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Manager ID…"
                className="bg-transparent text-[13px] placeholder:text-white/20 focus:outline-none w-28"
                style={{ color: "var(--t1)" }}
              />
            </label>
            {q && (
              <button type="submit"
                className="h-8 px-3 rounded-lg text-[12px] font-semibold text-white shrink-0"
                style={{ background: "var(--violet)" }}>
                Go
              </button>
            )}
          </form>

        </div>
      </nav>
    </header>
  );
}
