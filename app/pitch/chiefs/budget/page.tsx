"use client";

import { useState, useMemo, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────
const RED = "#E31837";
const GOLD = "#FFB81C";
const DARK = "#0a0a0a";
const MID = "#1a1a1a";
const MUTED = "#2a2a2a";
const WHITE = "#f5f4f0";
const GREY = "#888";

const FML_LOGO = "https://fml-craft.files.svdcdn.com/production/FeedMeLight_Logo.svg?dm=1768940260";
const CHIEFS_LOGO = "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png";

type EngagementType = "day" | "hourly" | "talent" | "london" | "local";

const ENGAGEMENT_LABELS: Record<EngagementType, string> = {
  day: "Day Rate",
  hourly: "Hourly",
  talent: "Talent",
  london: "London-based",
  local: "Local Talent",
};

// Tier thresholds & discount multipliers
const TIERS = [
  { label: "Tier 1", range: "1–12 days/yr", max: 12, discount: 1.0 },
  { label: "Tier 2", range: "13–24 days/yr", max: 24, discount: 0.85 },
  { label: "Tier 3", range: "25+ days/yr", max: Infinity, discount: 0.72 },
];

// Scenario definitions
const SCENARIOS = ["London Day", "London Hourly", "Local Day", "Local Hourly"] as const;
type Scenario = (typeof SCENARIOS)[number];

const SCENARIO_DEFAULTS: Record<Scenario, { performerRate: number; handlerRate: number; flights: number; hotel: number }> = {
  "London Day": { performerRate: 1250, handlerRate: 600, flights: 300, hotel: 150 },
  "London Hourly": { performerRate: 200, handlerRate: 100, flights: 300, hotel: 150 },
  "Local Day": { performerRate: 800, handlerRate: 400, flights: 0, hotel: 0 },
  "Local Hourly": { performerRate: 150, handlerRate: 75, flights: 0, hotel: 0 },
};

// ─── Helpers ────────────────────────────────────────────────
function fmt(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getTier(daysPerYear: number) {
  return TIERS.find((t) => daysPerYear <= t.max) || TIERS[2];
}

// ─── Component ──────────────────────────────────────────────
export default function BudgetCalculator() {
  // Section 1: Engagement type
  const [engagement, setEngagement] = useState<EngagementType>("day");

  // Section 2: Base rates
  const [performerRate, setPerformerRate] = useState(1250);
  const [handlerRate, setHandlerRate] = useState(600);
  const [activationDays, setActivationDays] = useState(1);
  const [travelDays, setTravelDays] = useState(1);
  const [travelDayRate, setTravelDayRate] = useState(250);
  const [perDiem, setPerDiem] = useState(100);

  // Section 3: Volume
  const [daysPerYear, setDaysPerYear] = useState(12);

  // Section 4: Travel
  const [flightsPerPerson, setFlightsPerPerson] = useState(300);
  const [hotelPerNight, setHotelPerNight] = useState(150);
  const [taxis, setTaxis] = useState(60);

  // Scenario overrides: null = auto
  const [overrides, setOverrides] = useState<Record<Scenario, Record<string, number | null>>>({
    "London Day": {},
    "London Hourly": {},
    "Local Day": {},
    "Local Hourly": {},
  });

  const people = handlerRate > 0 ? 2 : 1;
  const tier = getTier(daysPerYear);
  const totalEventDays = activationDays + travelDays;
  const nights = totalEventDays;
  const rooms = people;

  // Per-event calculation for current inputs
  const calc = useMemo(() => {
    const effectiveRate = performerRate * tier.discount;
    const talentCost = effectiveRate * activationDays + handlerRate * activationDays + travelDayRate * travelDays * people;
    const perDiemCost = perDiem * people * totalEventDays;
    const travelCost = flightsPerPerson * people + taxis;
    const accommCost = hotelPerNight * rooms * nights;
    const total = talentCost + perDiemCost + travelCost + accommCost;
    const baseline = performerRate * activationDays + handlerRate * activationDays + travelDayRate * travelDays * people + perDiemCost + travelCost + accommCost;
    const saving = baseline - total;
    const annual = total * daysPerYear;
    return { effectiveRate, talentCost, perDiemCost, travelCost, accommCost, total, saving, annual, baseline };
  }, [performerRate, handlerRate, activationDays, travelDays, travelDayRate, perDiem, flightsPerPerson, hotelPerNight, taxis, tier, people, totalEventDays, nights, rooms, daysPerYear]);

  // Scenario calculations
  const scenarioCalcs = useMemo(() => {
    return SCENARIOS.map((name) => {
      const defaults = SCENARIO_DEFAULTS[name];
      const ov = overrides[name];
      const pr = ov.performerRate ?? defaults.performerRate;
      const hr = ov.handlerRate ?? defaults.handlerRate;
      const fl = ov.flights ?? defaults.flights;
      const ht = ov.hotel ?? defaults.hotel;
      const ppl = hr > 0 ? 2 : 1;
      const effectiveRate = pr * tier.discount;
      const talentFees = effectiveRate * activationDays + hr * activationDays + travelDayRate * travelDays * ppl;
      const perDiems = perDiem * ppl * totalEventDays;
      const travel = fl * ppl + taxis;
      const accomm = ht * ppl * nights;
      const totalPerEvent = talentFees + perDiems + travel + accomm;
      const annualTotal = totalPerEvent * daysPerYear;
      const baselineTalent = pr * activationDays + hr * activationDays + travelDayRate * travelDays * ppl;
      const baselineTotal = baselineTalent + perDiems + travel + accomm;
      const savingPerEvent = baselineTotal - totalPerEvent;
      const annualSaving = savingPerEvent * daysPerYear;
      return { name, talentFees, perDiems, travel, accomm, totalPerEvent, annualTotal, savingPerEvent, annualSaving };
    });
  }, [overrides, tier, activationDays, travelDays, travelDayRate, perDiem, taxis, nights, totalEventDays, daysPerYear]);

  const cheapest = scenarioCalcs.reduce((min, s) => (s.totalPerEvent < min.totalPerEvent ? s : min), scenarioCalcs[0]);

  const setOverride = useCallback((scenario: Scenario, field: string, value: number | null) => {
    setOverrides((prev) => ({
      ...prev,
      [scenario]: { ...prev[scenario], [field]: value },
    }));
  }, []);

  const resetOverrides = useCallback((scenario: Scenario) => {
    setOverrides((prev) => ({ ...prev, [scenario]: {} }));
  }, []);

  // ─── Styles ────────────────────────────────────────────────
  const mono = "var(--font-dm-mono), 'DM Mono', monospace";
  const bebas = "var(--font-bebas), 'Bebas Neue', sans-serif";

  const sectionHeader = (label: string) => (
    <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 20 }}>
      {label}
    </div>
  );

  const inputGroup = (label: string, value: number, onChange: (v: number) => void, note?: string) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: GREY, marginBottom: 6 }}>
        {label}
        {note && <span style={{ color: "rgba(255,255,255,0.25)", marginLeft: 8, textTransform: "none", letterSpacing: 0 }}>{note}</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={{
          width: "100%",
          padding: "10px 12px",
          background: MUTED,
          border: `1px solid rgba(255,255,255,0.08)`,
          color: WHITE,
          fontFamily: mono,
          fontSize: 14,
          borderRadius: 2,
          outline: "none",
        }}
        onFocus={(e) => { e.target.style.borderColor = GOLD; }}
        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
      />
    </div>
  );

  const summaryCard = (label: string, value: string, highlight?: boolean) => (
    <div style={{
      background: highlight ? RED : MID,
      padding: "20px 16px",
      borderRadius: 2,
      borderLeft: highlight ? `3px solid ${GOLD}` : `3px solid rgba(255,255,255,0.06)`,
    }}>
      <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: highlight ? "rgba(255,255,255,0.7)" : GREY, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: bebas, fontSize: highlight ? 32 : 24, color: highlight ? GOLD : WHITE }}>{value}</div>
    </div>
  );

  return (
    <div style={{ background: DARK, color: WHITE, minHeight: "100vh", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}>
      {/* HEADER */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 48px",
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10,10,10,0.95)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={CHIEFS_LOGO} alt="Chiefs" style={{ height: 40 }} />
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.15)" }} />
          <div>
            <div style={{ fontFamily: bebas, fontSize: 20, letterSpacing: "0.04em", color: WHITE }}>Content Partnership</div>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: GREY }}>Budget Scenarios</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textAlign: "right" }}>
            Confidential<br />Prepared by Feed Me Light
          </div>
          <img src={FML_LOGO} alt="FeedMeLight" style={{ height: 24, filter: "brightness(0) invert(1)", opacity: 0.6 }} />
        </div>
      </header>

      <div style={{ padding: "48px", maxWidth: 1200, margin: "0 auto" }}>
        {/* TITLE */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontFamily: bebas, fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "0.02em" }}>
            <span style={{ color: RED }}>Kansas City Chiefs</span>
            <br />
            <span style={{ color: GOLD }}>Budget Calculator</span>
          </h1>
          <p style={{ fontFamily: mono, fontSize: 11, color: GREY, marginTop: 12, letterSpacing: "0.1em" }}>
            All calculations update instantly. Adjust any input to explore scenarios.
          </p>
        </div>

        {/* ─── 1. ENGAGEMENT TYPE ──────────────────────────────── */}
        {sectionHeader("01 — Engagement Type")}
        <div style={{ display: "flex", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
          {(Object.keys(ENGAGEMENT_LABELS) as EngagementType[]).map((key) => (
            <button
              key={key}
              onClick={() => setEngagement(key)}
              style={{
                padding: "10px 20px",
                background: engagement === key ? GOLD : MUTED,
                color: engagement === key ? DARK : GREY,
                border: "none",
                fontFamily: mono,
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                borderRadius: 2,
                fontWeight: engagement === key ? 700 : 400,
                transition: "all 0.15s",
              }}
            >
              {ENGAGEMENT_LABELS[key]}
            </button>
          ))}
        </div>

        {/* ─── 2. BASE RATES ───────────────────────────────────── */}
        {sectionHeader("02 — Base Rates")}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
          {inputGroup("Performer day rate ($)", performerRate, setPerformerRate)}
          {inputGroup("Handler day rate ($)", handlerRate, setHandlerRate, "set 0 to remove")}
          {inputGroup("Activation days / event", activationDays, setActivationDays, "0.5 = half day")}
          {inputGroup("Travel days / event", travelDays, setTravelDays)}
          {inputGroup("Travel day rate / person ($)", travelDayRate, setTravelDayRate)}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: GREY, marginBottom: 6 }}>Number of people</label>
            <div style={{ padding: "10px 12px", background: MUTED, border: "1px solid rgba(255,255,255,0.08)", color: GOLD, fontFamily: mono, fontSize: 14, borderRadius: 2 }}>{people} <span style={{ color: GREY, fontSize: 10 }}>(auto)</span></div>
          </div>
          {inputGroup("Per diem / person ($)", perDiem, setPerDiem, "$50 full / $25 half")}
        </div>

        {/* ─── 3. VOLUME ───────────────────────────────────────── */}
        {sectionHeader("03 — Volume")}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 32, marginBottom: 16, alignItems: "start" }}>
          {inputGroup("Days per year", daysPerYear, setDaysPerYear)}
          <div style={{ display: "flex", gap: 8 }}>
            {TIERS.map((t) => {
              const active = t === tier;
              return (
                <div key={t.label} style={{
                  flex: 1,
                  padding: "16px",
                  background: active ? "rgba(255,184,28,0.1)" : MID,
                  border: active ? `2px solid ${GOLD}` : "2px solid transparent",
                  borderRadius: 2,
                }}>
                  <div style={{ fontFamily: bebas, fontSize: 18, color: active ? GOLD : WHITE }}>{t.label}</div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: GREY }}>{t.range}</div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: active ? GOLD : GREY, marginTop: 4 }}>
                    {t.discount === 1 ? "Full rate" : `${Math.round((1 - t.discount) * 100)}% discount`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }}>
          {summaryCard("Effective performer rate", fmt(calc.effectiveRate))}
          {summaryCard("Talent cost / event", fmt(calc.talentCost))}
          {summaryCard("Saving vs baseline", fmt(calc.saving), calc.saving > 0)}
          {summaryCard("Annual talent spend", fmt(calc.talentCost * daysPerYear))}
        </div>

        {/* ─── 4. TRAVEL & ACCOMMODATION ──────────────────────── */}
        {sectionHeader("04 — Travel & Accommodation")}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
          {inputGroup("Flights return / person ($)", flightsPerPerson, setFlightsPerPerson)}
          {inputGroup("Hotel / room / night ($)", hotelPerNight, setHotelPerNight)}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: GREY, marginBottom: 6 }}>Rooms</label>
            <div style={{ padding: "10px 12px", background: MUTED, border: "1px solid rgba(255,255,255,0.08)", color: GOLD, fontFamily: mono, fontSize: 14, borderRadius: 2 }}>{rooms} <span style={{ color: GREY, fontSize: 10 }}>(1/person)</span></div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: GREY, marginBottom: 6 }}>Nights</label>
            <div style={{ padding: "10px 12px", background: MUTED, border: "1px solid rgba(255,255,255,0.08)", color: GOLD, fontFamily: mono, fontSize: 14, borderRadius: 2 }}>{nights} <span style={{ color: GREY, fontSize: 10 }}>(travel + activation)</span></div>
          </div>
          {inputGroup("Taxis / transfers total ($)", taxis, setTaxis)}
        </div>

        {/* ─── 5. FULL COST SUMMARY — PER EVENT ──────────────── */}
        {sectionHeader("05 — Full Cost Summary — Per Event")}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {summaryCard("Talent at volume rate", fmt(calc.talentCost))}
          {summaryCard("Per diems", fmt(calc.perDiemCost))}
          {summaryCard("Travel costs", fmt(calc.travelCost))}
          {summaryCard("Accommodation", fmt(calc.accommCost))}
          {summaryCard("Total per event", fmt(calc.total), true)}
          {summaryCard("Saving vs baseline", fmt(calc.saving))}
        </div>

        {/* Line-item breakdown */}
        <div style={{ background: MID, borderRadius: 2, padding: 24, marginBottom: 40 }}>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: GREY, marginBottom: 16 }}>Line-item Breakdown</div>
          {[
            ["Performer fee", calc.effectiveRate * activationDays],
            ["Handler fee", handlerRate * activationDays],
            ["Travel day fees", travelDayRate * travelDays * people],
            ["Per diems", calc.perDiemCost],
            ["Flights", flightsPerPerson * people],
            ["Hotel", hotelPerNight * rooms * nights],
            ["Taxis / transfers", taxis],
          ].map(([label, value]) => (
            <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontFamily: mono, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{label as string}</span>
              <span style={{ fontFamily: mono, fontSize: 12, color: WHITE }}>{fmt(value as number)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", marginTop: 8, borderTop: `2px solid ${RED}` }}>
            <span style={{ fontFamily: bebas, fontSize: 18, color: WHITE }}>Total per event</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: RED,
                color: WHITE,
                padding: "4px 10px",
                borderRadius: 2,
              }}>
                {ENGAGEMENT_LABELS[engagement]}
              </span>
              <span style={{ fontFamily: bebas, fontSize: 24, color: GOLD }}>{fmt(calc.total)}</span>
            </div>
          </div>
        </div>

        {/* ─── 6. SCENARIO COMPARISON TABLE ───────────────────── */}
        {sectionHeader("06 — Scenario Comparison")}
        <div style={{ overflowX: "auto", marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 16px", borderBottom: `2px solid ${RED}`, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: GREY }}>
                  Metric
                </th>
                {scenarioCalcs.map((s) => (
                  <th key={s.name} style={{
                    textAlign: "right",
                    padding: "12px 16px",
                    borderBottom: `2px solid ${RED}`,
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: s.name === cheapest.name ? GOLD : GREY,
                  }}>
                    {s.name} {s.name === cheapest.name && "✓"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([
                ["Talent fees", "talentFees"],
                ["Per diems", "perDiems"],
                ["Travel", "travel"],
                ["Accommodation", "accomm"],
                ["Total per event", "totalPerEvent"],
                ["Annual total", "annualTotal"],
                ["Saving vs baseline", "savingPerEvent"],
                ["Annual saving", "annualSaving"],
              ] as const).map(([label, key]) => {
                const isTotal = key === "totalPerEvent";
                const isSaving = key === "savingPerEvent" || key === "annualSaving";
                return (
                  <tr key={key} style={{ background: isTotal ? "rgba(227,24,55,0.08)" : "transparent" }}>
                    <td style={{
                      padding: "10px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      color: isTotal ? WHITE : "rgba(255,255,255,0.6)",
                      fontWeight: isTotal ? 700 : 400,
                    }}>
                      {label}
                    </td>
                    {scenarioCalcs.map((s) => (
                      <td key={s.name} style={{
                        textAlign: "right",
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        color: isTotal ? GOLD : isSaving ? (s[key] > 0 ? GOLD : "rgba(255,255,255,0.4)") : WHITE,
                        fontWeight: isTotal ? 700 : 400,
                        fontSize: isTotal ? 14 : 12,
                      }}>
                        {fmt(s[key])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Scenario override panels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 48 }}>
          {SCENARIOS.map((name) => {
            const defaults = SCENARIO_DEFAULTS[name];
            const ov = overrides[name];
            const hasOverrides = Object.values(ov).some((v) => v !== null && v !== undefined);
            return (
              <div key={name} style={{ background: MID, padding: 20, borderRadius: 2, borderTop: `3px solid ${RED}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontFamily: bebas, fontSize: 16, color: WHITE, letterSpacing: "0.04em" }}>{name}</div>
                  {hasOverrides && (
                    <button
                      onClick={() => resetOverrides(name)}
                      style={{
                        fontFamily: mono,
                        fontSize: 9,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        background: "rgba(255,255,255,0.06)",
                        color: GOLD,
                        border: "none",
                        padding: "4px 10px",
                        cursor: "pointer",
                        borderRadius: 2,
                      }}
                    >
                      Reset to auto
                    </button>
                  )}
                </div>
                {([
                  ["Performer rate", "performerRate", defaults.performerRate],
                  ["Handler rate", "handlerRate", defaults.handlerRate],
                  ["Flights", "flights", defaults.flights],
                  ["Hotel", "hotel", defaults.hotel],
                ] as const).map(([label, field, defaultVal]) => (
                  <div key={field} style={{ marginBottom: 10 }}>
                    <label style={{ fontFamily: mono, fontSize: 9, color: GREY, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</label>
                    <input
                      type="number"
                      placeholder="auto"
                      value={ov[field] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : Number(e.target.value);
                        setOverride(name, field, val);
                      }}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        background: MUTED,
                        border: `1px solid ${ov[field] != null ? GOLD : "rgba(255,255,255,0.06)"}`,
                        color: ov[field] != null ? GOLD : "rgba(255,255,255,0.4)",
                        fontFamily: mono,
                        fontSize: 12,
                        borderRadius: 2,
                        outline: "none",
                        marginTop: 4,
                      }}
                    />
                    <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
                      default: {fmt(defaultVal)}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={FML_LOGO} alt="FeedMeLight" style={{ height: 18, filter: "brightness(0) invert(1)", opacity: 0.3 }} />
            <span style={{ color: "rgba(255,255,255,0.15)", fontFamily: mono, fontSize: 10 }}>×</span>
            <img src={CHIEFS_LOGO} alt="Chiefs" style={{ height: 24, opacity: 0.4 }} />
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)" }}>
            Confidential · April 2026 · feedmelight.com
          </div>
        </footer>
      </div>
    </div>
  );
}
