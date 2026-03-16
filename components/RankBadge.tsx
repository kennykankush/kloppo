import Image from "next/image";
import type { RankTier } from "@/types/fpl";

const TIER_COLOR: Record<RankTier, string> = {
  Challenger: "#fde68a",
  Platinum:   "#67e8f9",
  Gold:       "#fbbf24",
  Silver:     "#d1d5db",
  Bronze:     "#fb923c",
  Iron:       "#6b7280",
};

interface Props { tier: RankTier; label: string; sub: string; }

export default function RankBadge({ tier, label, sub }: Props) {
  const color = TIER_COLOR[tier];
  return (
    <div
      className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl text-center"
      style={{ background: "var(--raised)", border: "1px solid var(--border)", minWidth: 100 }}
    >
      <Image src={`/${tier}.png`} alt={tier} width={56} height={56} unoptimized className="drop-shadow-lg" />
      <div className="text-[11px] font-bold tracking-wide" style={{ color }}>{tier.toUpperCase()}</div>
      <div className="text-[13px] font-bold" style={{ color: "var(--t1)" }}>{label}</div>
      <div className="text-[10px]" style={{ color: "var(--t3)" }}>{sub}</div>
    </div>
  );
}
