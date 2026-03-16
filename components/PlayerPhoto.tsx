"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

function Silhouette() {
  return (
    <div
      className="absolute inset-0 flex items-end justify-center overflow-hidden"
      style={{ background: "var(--raised)" }}
    >
      <svg viewBox="0 0 64 80" width="80%" fill="rgba(241,241,249,0.15)">
        <circle cx="32" cy="22" r="14" />
        <path d="M4 80c0-15.464 12.536-28 28-28s28 12.536 28 28H4z" />
      </svg>
    </div>
  );
}

export default function PlayerPhoto({ src, alt, fill, width, height, className, style }: Props) {
  const [error, setError] = useState(false);

  if (error) {
    // For non-fill usage, wrap in a positioned container of the right size
    if (!fill) {
      return (
        <div style={{ width, height, position: "relative", overflow: "hidden", ...style }}>
          <Silhouette />
        </div>
      );
    }
    return <Silhouette />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      style={style}
      unoptimized
      onError={() => setError(true)}
    />
  );
}
