"use client";

import { useState, useCallback } from "react";

const durLabels = ["1 month", "3 months", "6 months", "12 months"];
const durMult = [1, 1.8, 2.8, 4.2];
const volLabels = ["Light", "Medium", "Full Production"];
const volMult = [0.6, 1, 1.5];
const terLabels = ["US Only", "EU + US", "Global"];
const terMult = [0.7, 1, 1.35];

const baseCosts: Record<string, number> = {
  "fan-portal": 28000,
  content: 22000,
  dooh: 35000,
  social: 14000,
  activation: 45000,
};

const deliverableLabels: Record<string, string> = {
  "fan-portal": "Fan Portal",
  content: "Content Package",
  dooh: "DOOH / Screens",
  social: "Social Intelligence",
  activation: "Live Activation",
};

const lineLabels: Record<string, string> = {
  "fan-portal": "Fan Intelligence Portal",
  content: "Content Package",
  dooh: "DOOH / Screen Content",
  social: "Social Intelligence Layer",
  activation: "Live Activation Design",
};

function fmt(n: number): string {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return "$" + Math.round(n / 1000) + "k";
  return "$" + n;
}

export default function Calculator() {
  const [dur, setDur] = useState(2);
  const [vol, setVol] = useState(2);
  const [ter, setTer] = useState(2);
  const [active, setActive] = useState<Set<string>>(
    new Set(["fan-portal", "content"])
  );

  const toggle = useCallback((key: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const costs: Record<string, number> = {};
  let total = 0;
  for (const [key, base] of Object.entries(baseCosts)) {
    if (active.has(key)) {
      const cost = Math.round(
        base * durMult[dur - 1] * volMult[vol - 1] * terMult[ter - 1]
      );
      costs[key] = cost;
      total += cost;
    }
  }

  return (
    <div className="calc-wrap" style={{ background: "var(--team-mid)", padding: 60, marginTop: 20 }}>
      <div className="calc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {/* Duration */}
          <div>
            <label style={labelStyle}>
              Campaign Duration{" "}
              <span style={valStyle}>{durLabels[dur - 1]}</span>
            </label>
            <input
              type="range"
              min={1}
              max={4}
              value={dur}
              step={1}
              onChange={(e) => setDur(Number(e.target.value))}
              style={rangeStyle}
            />
          </div>
          {/* Volume */}
          <div>
            <label style={labelStyle}>
              Content Volume{" "}
              <span style={valStyle}>{volLabels[vol - 1]}</span>
            </label>
            <input
              type="range"
              min={1}
              max={3}
              value={vol}
              step={1}
              onChange={(e) => setVol(Number(e.target.value))}
              style={rangeStyle}
            />
          </div>
          {/* Territories */}
          <div>
            <label style={labelStyle}>
              Territories{" "}
              <span style={valStyle}>{terLabels[ter - 1]}</span>
            </label>
            <input
              type="range"
              min={1}
              max={3}
              value={ter}
              step={1}
              onChange={(e) => setTer(Number(e.target.value))}
              style={rangeStyle}
            />
          </div>
          {/* Toggles */}
          <div>
            <label style={{ ...labelStyle, display: "block", marginBottom: 12 }}>
              Deliverables
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {Object.keys(baseCosts).map((key) => (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  style={{
                    fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "8px 14px",
                    border: active.has(key)
                      ? "1px solid var(--team-accent)"
                      : "1px solid rgba(255,255,255,0.12)",
                    background: active.has(key) ? "var(--team-accent)" : "transparent",
                    color: active.has(key) ? "white" : "var(--fml-grey)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {deliverableLabels[key]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="calc-output" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 60 }}>
          <div style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--fml-grey)", marginBottom: 8 }}>
            Estimated Investment
          </div>
          <div style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: 80, lineHeight: 1, color: "var(--fml-white)", marginBottom: 4 }}>
            {fmt(total)}
          </div>
          <div style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "var(--fml-grey)", marginBottom: 40 }}>
            USD · indicative range · final scope on brief
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(baseCosts).map(([key]) =>
              active.has(key) ? (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 16,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: "rgba(245,244,240,0.5)" }}>
                    {lineLabels[key]}
                  </span>
                  <span style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: 20, color: "var(--team-accent)", letterSpacing: "0.04em" }}>
                    {fmt(costs[key])}
                  </span>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--fml-grey)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

const valStyle: React.CSSProperties = {
  fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
  fontSize: 22,
  color: "var(--team-accent)",
  letterSpacing: "0.04em",
};

const rangeStyle: React.CSSProperties = {
  width: "100%",
  height: 2,
  appearance: "none",
  background: "rgba(255,255,255,0.1)",
  outline: "none",
  cursor: "pointer",
};
