"use client";

import { useState } from "react";

interface TeamLogoProps {
  src: string;
  alt: string;
  height: number;
  fallbackColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function TeamLogo({
  src,
  alt,
  height,
  fallbackColor = "var(--team-secondary)",
  className,
  style,
}: TeamLogoProps) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <span
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
          fontSize: Math.round(height * 0.45),
          letterSpacing: "0.08em",
          color: fallbackColor,
          height,
          whiteSpace: "nowrap",
          ...style,
        }}
      >
        {alt}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ height, width: "auto", display: "block", ...style }}
      onError={() => setFailed(true)}
    />
  );
}
