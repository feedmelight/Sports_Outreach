"use client";

import { useState, useMemo, useCallback } from "react";

// ─── Design tokens ──────────────────────────────────────────
const RED = "#E31837";
const GOLD = "#FFB81C";
const DARK = "#0a0a0a";
const MID = "#1a1a1a";
const MUTED = "#2a2a2a";
const WHITE = "#f5f4f0";
const GREY = "#888";
const GREEN = "#22c55e";

const FML_LOGO = "https://fml-craft.files.svdcdn.com/production/FeedMeLight_Logo.svg?dm=1768940260";
const CHIEFS_LOGO = "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png";

// ─── Calculation logic (matching ref exactly) ───────────────
const BASELINE = 1950;
type EngMode = "day" | "hourly";
type TravMode = "london" | "local";

const DAY_TIERS = [
  { max: 12, discount: 0, label: "Tier 1", range: "1–12 days/yr" },
  { max: 24, discount: 0.15, label: "Tier 2", range: "13–24 days/yr" },
  { max: 9999, discount: 0.28, label: "Tier 3", range: "25+ days/yr" },
];
const HR_TIERS = [
  { max: 10, discount: 0, label: "Tier 1", range: "0–10 hrs/mo" },
  { max: 25, discount: 0.167, label: "Tier 2", range: "10–25 hrs/mo" },
  { max: 9999, discount: 0.292, label: "Tier 3", range: "25+ hrs/mo" },
];

function perDiemDays(t: number): number {
  return Math.floor(t) * 50 + (t % 1 >= 0.5 ? 25 : 0);
}
function perDiemHours(h: number): number {
  return h >= 5 ? 50 : h >= 2 ? 25 : 0;
}

const SCENARIO_DEFS = [
  { id: "ld", label: "London · Day", trav: "london" as TravMode, eng: "day" as EngMode },
  { id: "lh", label: "London · Hourly", trav: "london" as TravMode, eng: "hourly" as EngMode },
  { id: "od", label: "Local · Day", trav: "local" as TravMode, eng: "day" as EngMode },
  { id: "oh", label: "Local · Hourly", trav: "local" as TravMode, eng: "hourly" as EngMode },
];

const OVERRIDE_FIELDS = [
  { key: "perf", label: "Performer rate" },
  { key: "handler", label: "Handler rate" },
  { key: "actUnits", label: "Activation days/hrs" },
  { key: "travUnits", label: "Travel days/hrs" },
  { key: "travRate", label: "Travel rate/person" },
  { key: "flights", label: "Flights/person" },
  { key: "hotel", label: "Hotel/room/night" },
  { key: "taxis", label: "Taxis" },
];

function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

interface ScenarioResult {
  talentTotal: number;
  totalPerdiem: number;
  travelTotal: number;
  accomTotal: number;
  grandTotal: number;
  annualTotal: number;
  savingPerEvent: number;
  annualSaving: number;
  effPerf: number;
  discount: number;
  tierIdx: number;
  people: number;
  nights: number;
}

// ─── Component ──────────────────────────────────────────────
export default function BudgetCalculator() {
  const mono = "var(--font-dm-mono), 'DM Mono', monospace";
  const bebas = "var(--font-bebas), 'Bebas Neue', sans-serif";

  // Section 1: Toggles
  const [engMode, setEngMode] = useState<EngMode>("day");
  const [travMode, setTravMode] = useState<TravMode>("london");

  // Section 2: Day rate inputs
  const [perfDay, setPerfDay] = useState(1250);
  const [handlerDay, setHandlerDay] = useState(600);
  const [actDays, setActDays] = useState(1);
  const [travDays, setTravDays] = useState(1);
  const [travDayRate, setTravDayRate] = useState(250);

  // Hourly rate inputs
  const [perfHourly, setPerfHourly] = useState(120);
  const [handlerHourly, setHandlerHourly] = useState(75);
  const [actHours, setActHours] = useState(4);
  const [travHours, setTravHours] = useState(3);
  const [travHourRate, setTravHourRate] = useState(40);

  // Section 3: Volume
  const [daysYear, setDaysYear] = useState(8);
  const [hoursMonth, setHoursMonth] = useState(8);

  // Section 4: Travel
  const [flights, setFlights] = useState(300);
  const [localTransport, setLocalTransport] = useState(80);
  const [hotelRate, setHotelRate] = useState(150);
  const [taxis, setTaxis] = useState(60);

  // Overrides
  const [overrides, setOverrides] = useState<Record<string, Record<string, number | undefined>>>({
    ld: {}, lh: {}, od: {}, oh: {},
  });

  const setOv = useCallback((scId: string, key: string, val: number | undefined) => {
    setOverrides((prev) => ({ ...prev, [scId]: { ...prev[scId], [key]: val } }));
  }, []);
  const resetOv = useCallback((scId: string) => {
    setOverrides((prev) => ({ ...prev, [scId]: {} }));
  }, []);

  // ─── Current-mode derived values ─────────────────────────
  const basePerf = engMode === "day" ? perfDay : perfHourly;
  const handlerRateVal = engMode === "day" ? handlerDay : handlerHourly;
  const hasHandler = handlerRateVal > 0;
  const people = hasHandler ? 2 : 1;
  const volUnit = engMode === "day" ? daysYear : hoursMonth;
  const tiers = engMode === "day" ? DAY_TIERS : HR_TIERS;
  const tierIdx = tiers.findIndex((t) => volUnit <= t.max);
  const tier = tiers[tierIdx >= 0 ? tierIdx : 2];
  const effPerf = basePerf * (1 - tier.discount);

  // Main calc
  const calc = useMemo(() => {
    let perfCost: number, handlerCost: number, travCost: number, pdPerPerson: number, nights: number;
    if (engMode === "day") {
      perfCost = effPerf * actDays;
      handlerCost = handlerDay * actDays;
      travCost = travDayRate * people * travDays;
      pdPerPerson = perDiemDays(actDays + travDays);
      nights = Math.ceil(travDays + Math.max(actDays - 1, 0));
    } else {
      perfCost = effPerf * actHours;
      handlerCost = handlerHourly * actHours;
      travCost = travHourRate * people * travHours;
      pdPerPerson = perDiemHours(actHours + travHours);
      nights = Math.ceil((travHours + actHours) / 8);
    }

    const totalPerdiem = pdPerPerson * people;
    const rooms = people;
    const hotelCost = hotelRate * rooms * Math.max(nights, 0);
    const taxiCost = taxis;
    let flightCost = 0, localCost = 0;
    if (travMode === "london") flightCost = flights * people;
    else localCost = localTransport;

    const talentTotal = perfCost + handlerCost;
    const travelTotal = travCost + flightCost + localCost;
    const accomTotal = hotelCost + taxiCost;
    const grandTotal = talentTotal + totalPerdiem + travelTotal + accomTotal;

    const actUnits = engMode === "day" ? actDays : actHours;
    const volMult = engMode === "day" ? daysYear : Math.round(hoursMonth * 12 / Math.max(actUnits, 1));
    const annualTotal = grandTotal * Math.max(Math.round(volMult), 1);
    const savingPerEvent = BASELINE - (talentTotal + totalPerdiem);
    const annualSaving = savingPerEvent * Math.max(Math.round(volMult), 1);

    // Talent-only saving (discount vs full rate)
    const fullRateTalent = basePerf * actUnits + handlerRateVal * actUnits;
    const talentSaving = fullRateTalent - talentTotal;
    const annualTalentSpend = (talentTotal + totalPerdiem) * Math.max(Math.round(volMult), 1);

    return {
      perfCost, handlerCost, travCost, pdPerPerson, totalPerdiem, nights, rooms,
      flightCost, localCost, hotelCost, taxiCost,
      talentTotal, travelTotal, accomTotal, grandTotal,
      annualTotal, savingPerEvent, annualSaving, talentSaving, annualTalentSpend,
    };
  }, [engMode, effPerf, actDays, actHours, handlerDay, handlerHourly, travDayRate, travHourRate, travDays, travHours, people, hotelRate, taxis, flights, localTransport, travMode, daysYear, hoursMonth, basePerf, handlerRateVal]);

  // ─── Scenario calculations ────────────────────────────────
  function getBaseForEng(eng: EngMode) {
    return {
      perf: eng === "day" ? perfDay : perfHourly,
      handler: eng === "day" ? handlerDay : handlerHourly,
      actUnits: eng === "day" ? actDays : actHours,
      travUnits: eng === "day" ? travDays : travHours,
      travRate: eng === "day" ? travDayRate : travHourRate,
      flights,
      localTransport,
      hotel: hotelRate,
      taxis,
      volUnit: eng === "day" ? daysYear : hoursMonth,
    };
  }

  const scenarioResults = useMemo(() => {
    return SCENARIO_DEFS.map((sc) => {
      const base = getBaseForEng(sc.eng);
      const ov = overrides[sc.id];
      const perf = ov.perf ?? base.perf;
      const handler = ov.handler ?? base.handler;
      const actUnits = ov.actUnits ?? base.actUnits;
      const travUnits = ov.travUnits ?? base.travUnits;
      const travRate = ov.travRate ?? base.travRate;
      const flightsRaw = ov.flights ?? base.flights;
      const hotel = ov.hotel ?? base.hotel;
      const taxisVal = ov.taxis ?? base.taxis;

      const scTiers = sc.eng === "day" ? DAY_TIERS : HR_TIERS;
      const scTierIdx = scTiers.findIndex((t) => base.volUnit <= t.max);
      const scDiscount = scTiers[scTierIdx >= 0 ? scTierIdx : 2].discount;
      const scEffPerf = perf * (1 - scDiscount);

      const hasH = handler > 0;
      const ppl = hasH ? 2 : 1;

      let perfCost: number, handlerCost: number, travCost: number, pdPerPerson: number, scNights: number;
      if (sc.eng === "day") {
        perfCost = scEffPerf * actUnits;
        handlerCost = handler * actUnits;
        travCost = travRate * ppl * travUnits;
        pdPerPerson = perDiemDays(actUnits + travUnits);
        scNights = Math.ceil(travUnits + Math.max(actUnits - 1, 0));
      } else {
        perfCost = scEffPerf * actUnits;
        handlerCost = handler * actUnits;
        travCost = travRate * ppl * travUnits;
        pdPerPerson = perDiemHours(actUnits + travUnits);
        scNights = Math.ceil((travUnits + actUnits) / 8);
      }

      const totalPerdiem = pdPerPerson * ppl;
      const rooms = ppl;
      const hotelCost = hotel * rooms * Math.max(scNights, 0);
      const taxiCost = taxisVal;
      let flightCost = 0, localCost = 0;
      if (sc.trav === "london") flightCost = flightsRaw * ppl;
      else localCost = ov.flights ?? base.localTransport;

      const talentTotal = perfCost + handlerCost;
      const travelTotal = travCost + flightCost + localCost;
      const accomTotal = hotelCost + taxiCost;
      const grandTotal = talentTotal + totalPerdiem + travelTotal + accomTotal;

      const volMult = sc.eng === "day" ? base.volUnit : Math.round(base.volUnit * 12 / Math.max(actUnits, 1));
      const annualTotal = grandTotal * Math.max(Math.round(volMult), 1);
      const savingPerEvent = BASELINE - (talentTotal + totalPerdiem);
      const annualSaving = savingPerEvent * Math.max(Math.round(volMult), 1);

      return {
        talentTotal, totalPerdiem, travelTotal, accomTotal, grandTotal,
        annualTotal, savingPerEvent, annualSaving,
        effPerf: scEffPerf, discount: scDiscount, tierIdx: scTierIdx, people: ppl, nights: scNights,
      } as ScenarioResult;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrides, perfDay, perfHourly, handlerDay, handlerHourly, actDays, actHours, travDays, travHours, travDayRate, travHourRate, flights, localTransport, hotelRate, taxis, daysYear, hoursMonth]);

  const cheapestIdx = scenarioResults.reduce((best, s, i) => (s.grandTotal < scenarioResults[best].grandTotal ? i : best), 0);

  // ─── Reusable UI helpers ──────────────────────────────────
  const sectionHeader = (label: string) => (
    <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 16 }}>{label}</div>
  );

  const row = (label: string, value: number | string, onChange: (v: number) => void, opts?: { note?: string; step?: number; prefix?: boolean }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
      <label style={{ flex: 1, minWidth: 180, fontSize: 14, color: WHITE }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {opts?.prefix !== false && <span style={{ fontSize: 14, color: GREY }}>$</span>}
        <input
          type="number"
          value={value}
          step={opts?.step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={{ width: 82, fontSize: 14, padding: "4px 8px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2, background: MUTED, color: WHITE, fontFamily: mono, outline: "none" }}
          onFocus={(e) => { e.target.style.borderColor = GOLD; }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
        />
      </div>
      {opts?.note && <span style={{ fontSize: 12, color: GREY }}>{opts.note}</span>}
    </div>
  );

  const autoField = (label: string, value: string, note?: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <label style={{ flex: 1, minWidth: 180, fontSize: 14, color: WHITE }}>{label}</label>
      <span style={{ fontSize: 14, fontWeight: 500, color: GOLD, fontFamily: mono }}>{value}</span>
      {note && <span style={{ fontSize: 12, color: GREY, fontStyle: "italic" }}>{note}</span>}
    </div>
  );

  const toggleBtn = (label: string, active: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        fontSize: 13, padding: "4px 14px", border: "1px solid",
        borderColor: active ? GOLD : "rgba(255,255,255,0.12)",
        borderRadius: 2, background: active ? "rgba(255,184,28,0.15)" : "transparent",
        color: active ? GOLD : GREY, cursor: "pointer", fontFamily: mono, transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  const summaryCard = (label: string, value: string, variant?: "total" | "saving") => (
    <div style={{ background: MID, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2, padding: "10px" }}>
      <div style={{ fontSize: 11, color: GREY, marginBottom: 4, fontFamily: mono }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 500, fontFamily: mono, color: variant === "total" ? GOLD : variant === "saving" ? GREEN : WHITE }}>{value}</div>
    </div>
  );

  const brow = (label: string, value: string, opts?: { bold?: boolean; sub?: boolean; note?: string }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", fontSize: 13, color: opts?.bold ? WHITE : GREY,
      padding: opts?.sub ? "3px 0 3px 12px" : "3px 0", fontWeight: opts?.bold ? 500 : 400,
      borderTop: opts?.bold ? `1px solid rgba(255,255,255,0.08)` : "none",
      marginTop: opts?.bold ? 4 : 0, paddingTop: opts?.bold ? 6 : undefined,
      fontFamily: mono,
    }}>
      <span>{label}{opts?.note && <span style={{ fontSize: 12, color: GREY, marginLeft: 8 }}>{opts.note}</span>}</span>
      <span>{value}</span>
    </div>
  );

  // ─── Comparison table rows ────────────────────────────────
  const CMP_ROWS: { label: string; key: keyof ScenarioResult; section?: string; bold?: boolean; best?: boolean; saving?: boolean }[] = [
    { label: "Talent fees", key: "talentTotal" },
    { label: "Per diems", key: "totalPerdiem" },
    { label: "Travel", key: "travelTotal" },
    { label: "Accommodation", key: "accomTotal" },
    { label: "Total per event", key: "grandTotal", section: "Per event", bold: true, best: true },
    { label: "Annual total", key: "annualTotal", section: "Annual", bold: true },
    { label: `Saving vs. ${fmt(BASELINE)} (per event)`, key: "savingPerEvent", section: "vs. baseline", saving: true },
    { label: "Annual saving", key: "annualSaving", saving: true, bold: true },
  ];

  const modelTag = `${travMode === "london" ? "London" : "Local"} · ${engMode === "day" ? "Day rate" : "Hourly"}`;
  const tierRateDisplay = engMode === "hourly" ? `${fmt(Math.round(effPerf))}/hr` : fmt(Math.round(effPerf));
  const perfNote = tier.discount > 0
    ? `${tierRateDisplay} (tier ${tierIdx + 1}, ${Math.round(tier.discount * 100)}% off)`
    : "base rate";

  return (
    <div style={{ background: DARK, color: WHITE, minHeight: "100vh", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}>
      {/* HEADER */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "24px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={CHIEFS_LOGO} alt="Chiefs" style={{ height: 40 }} />
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.15)" }} />
          <div>
            <div style={{ fontFamily: bebas, fontSize: 20, letterSpacing: "0.04em" }}>Content Partnership</div>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: GREY }}>Budget Scenarios</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textAlign: "right" }}>Confidential<br />Prepared by Feed Me Light</div>
          <img src={FML_LOGO} alt="FeedMeLight" style={{ height: 24, filter: "brightness(0) invert(1)", opacity: 0.6 }} />
        </div>
      </header>

      <div style={{ padding: "48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: bebas, fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "0.02em" }}>
            <span style={{ color: RED }}>Kansas City Chiefs</span><br /><span style={{ color: GOLD }}>Budget Calculator</span>
          </h1>
          <p style={{ fontFamily: mono, fontSize: 11, color: GREY, marginTop: 12, letterSpacing: "0.1em" }}>All calculations update instantly. Adjust any input to explore scenarios.</p>
        </div>

        {/* ─── 1. ENGAGEMENT TYPE ─────────────────────────────── */}
        <div style={{ background: MID, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "16px 20px", marginBottom: 12 }}>
          {sectionHeader("Engagement type")}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <label style={{ fontSize: 13, color: GREY, marginRight: 4 }}>Engagement</label>
              {toggleBtn("Day rate", engMode === "day", () => setEngMode("day"))}
              {toggleBtn("Hourly", engMode === "hourly", () => setEngMode("hourly"))}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <label style={{ fontSize: 13, color: GREY, marginRight: 4 }}>Talent</label>
              {toggleBtn("London-based", travMode === "london", () => setTravMode("london"))}
              {toggleBtn("Local talent", travMode === "local", () => setTravMode("local"))}
            </div>
          </div>
        </div>

        {/* ─── 2. BASE RATES ──────────────────────────────────── */}
        <div style={{ background: MID, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "16px 20px", marginBottom: 12 }}>
          {sectionHeader("Base rates")}
          <div style={{ fontSize: 12, color: GREY, marginBottom: 10, marginTop: -6 }}>Number of people auto-calculated: 2 unless handler rate is 0</div>

          {engMode === "day" ? (
            <>
              {row("Performer day rate", perfDay, setPerfDay)}
              {row("Handler day rate", handlerDay, setHandlerDay, { note: "set 0 to remove" })}
              {row("Activation days per event", actDays, setActDays, { prefix: false, step: 0.5, note: "0.5 = half day" })}
              {row("Travel days per event", travDays, setTravDays, { prefix: false, step: 0.5 })}
              {row("Travel day rate (per person)", travDayRate, setTravDayRate)}
            </>
          ) : (
            <>
              {row("Performer base hourly rate", perfHourly, setPerfHourly, { note: "at lowest tier" })}
              {row("Handler hourly rate", handlerHourly, setHandlerHourly, { note: "set 0 to remove" })}
              {row("Activation hours per event", actHours, setActHours, { prefix: false, step: 0.5 })}
              {row("Travel hours per event", travHours, setTravHours, { prefix: false, step: 0.5 })}
              {row("Travel hour rate (per person)", travHourRate, setTravHourRate)}
            </>
          )}

          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "10px 0" }} />
          {autoField("Number of people", String(people), "auto")}
          {autoField("Per diem (per person, auto)", fmt(calc.pdPerPerson) + " / person", "$50 full / $25 half")}
        </div>

        {/* ─── 3. VOLUME ──────────────────────────────────────── */}
        <div style={{ background: MID, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "16px 20px", marginBottom: 12 }}>
          {sectionHeader("Volume")}
          <div style={{ fontSize: 12, color: GREY, marginBottom: 10, marginTop: -6 }}>
            {engMode === "day" ? "Days per year — discount on performer day rate" : "Hours per month — discount on performer hourly rate"}
          </div>

          {engMode === "day"
            ? row("Days per year", daysYear, setDaysYear, { prefix: false })
            : row("Hours per month", hoursMonth, setHoursMonth, { prefix: false })
          }

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, margin: "12px 0 8px" }}>
            {tiers.map((t, i) => {
              const active = i === tierIdx;
              const rate = Math.round(basePerf * (1 - t.discount));
              return (
                <div key={t.label} style={{
                  border: active ? `2px solid ${GOLD}` : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 2, padding: "10px", textAlign: "center",
                  background: active ? "rgba(255,184,28,0.08)" : "transparent",
                }}>
                  <div style={{ fontSize: 11, color: active ? GOLD : GREY, marginBottom: 3 }}>{t.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 500, fontFamily: mono, color: active ? GOLD : WHITE }}>
                    {engMode === "hourly" ? fmt(rate) + "/hr" : fmt(rate)}
                  </div>
                  <div style={{ fontSize: 11, color: active ? GOLD : GREY, marginTop: 2 }}>{t.range}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginTop: 4 }}>
            {summaryCard("Effective performer rate", engMode === "hourly" ? fmt(Math.round(effPerf)) + "/hr" : fmt(Math.round(effPerf)))}
            {summaryCard("Talent cost per event", fmt(calc.talentTotal))}
            {summaryCard("Saving vs. baseline", calc.talentSaving > 0 ? fmt(calc.talentSaving) : "—", "saving")}
            {summaryCard("Annual talent spend", fmt(calc.annualTalentSpend), "total")}
          </div>

          {calc.annualSaving > 0 && (
            <div style={{
              background: "rgba(34,197,94,0.08)", border: `1px solid ${GREEN}`, borderRadius: 2,
              padding: "10px 14px", marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 13, color: GREEN }}>Annual saving vs. {fmt(BASELINE)} baseline</span>
              <span style={{ fontSize: 17, fontWeight: 500, color: GREEN, fontFamily: mono }}>{fmt(calc.annualSaving)} / year</span>
            </div>
          )}
        </div>

        {/* ─── 4. TRAVEL & ACCOMMODATION ──────────────────────── */}
        <div style={{ background: MID, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "16px 20px", marginBottom: 12 }}>
          {sectionHeader("Travel & accommodation")}

          {travMode === "london"
            ? row("Flights (return, per person)", flights, setFlights)
            : row("Local transport (total)", localTransport, setLocalTransport)
          }
          {row("Hotel (per room / night)", hotelRate, setHotelRate)}
          <div style={{ paddingLeft: 14, borderLeft: "1px solid rgba(255,255,255,0.06)", marginLeft: 4, marginBottom: 4 }}>
            {autoField("Rooms (auto)", calc.rooms + (calc.rooms === 1 ? " room" : " rooms"), "1 per person")}
            {autoField("Nights (auto)", calc.nights + (calc.nights === 1 ? " night" : " nights"), "based on travel + activation")}
          </div>
          {row("Taxis / transfers (total)", taxis, setTaxis)}
        </div>

        {/* ─── 5. FULL COST SUMMARY ──────────────────────────── */}
        <div style={{ background: MUTED, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "16px 20px", marginBottom: 12 }}>
          {sectionHeader("Full cost summary — per event")}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 12 }}>
            {summaryCard("Talent (at volume rate)", fmt(calc.talentTotal))}
            {summaryCard("Per diems", fmt(calc.totalPerdiem))}
            {summaryCard("Travel costs", fmt(calc.travelTotal))}
            {summaryCard("Accommodation", fmt(calc.accomTotal))}
            {summaryCard("Total per event", fmt(calc.grandTotal), "total")}
            {summaryCard("Saving vs. " + fmt(BASELINE), calc.savingPerEvent > 0 ? fmt(calc.savingPerEvent) : "—", "saving")}
          </div>

          {brow("Performer", fmt(calc.perfCost))}
          {tier.discount > 0 && <div style={{ padding: "3px 0 3px 12px", fontSize: 12, color: GREY, fontFamily: mono }}>{perfNote}</div>}
          {brow("Handler", calc.handlerCost > 0 ? fmt(calc.handlerCost) : "—")}
          {brow("Travel day / hour costs", fmt(calc.travCost))}
          {brow("Per diems", fmt(calc.totalPerdiem))}
          {brow("Flights", travMode === "london" ? fmt(calc.flightCost) : "—")}
          {travMode === "local" && brow("Local transport", fmt(calc.localCost))}
          {brow("Hotel", `${fmt(calc.hotelCost)} (${calc.rooms}r × ${calc.nights}n)`)}
          {brow("Taxis", fmt(calc.taxiCost))}
          {brow("Total", fmt(calc.grandTotal), {
            bold: true,
            note: undefined,
          })}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid rgba(255,255,255,0.08)`, marginTop: 4, paddingTop: 6 }}>
            <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 500, color: WHITE }}>
              Total
              <span style={{
                fontSize: 11, padding: "2px 8px", borderRadius: 2, marginLeft: 6, fontWeight: 400,
                background: travMode === "local" ? "rgba(34,197,94,0.15)" : "rgba(255,184,28,0.15)",
                color: travMode === "local" ? GREEN : GOLD,
              }}>
                {modelTag}
              </span>
            </span>
            <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 500, color: GOLD }}>{fmt(calc.grandTotal)}</span>
          </div>
        </div>

        {/* ─── 6. SCENARIO COMPARISON ─────────────────────────── */}
        <div style={{ background: MID, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "16px 20px", marginBottom: 12 }}>
          {sectionHeader("Scenario comparison")}
          <div style={{ fontSize: 12, color: GREY, marginBottom: 10, marginTop: -6 }}>All 4 scenarios use your current inputs. Override individual fields per scenario below the table.</div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px 10px", borderBottom: `1px solid rgba(255,255,255,0.08)`, fontSize: 12, fontWeight: 500, color: GREY, minWidth: 130 }} />
                  {SCENARIO_DEFS.map((sc, i) => {
                    const isLocal = sc.trav === "local";
                    return (
                      <th key={sc.id} style={{ textAlign: "center", padding: "8px 6px 4px", borderBottom: `1px solid rgba(255,255,255,0.08)`, fontSize: 11, fontWeight: 500 }}>
                        <span style={{
                          display: "inline-block", fontSize: 10, padding: "2px 6px", borderRadius: 2, marginBottom: 3,
                          background: isLocal ? "rgba(34,197,94,0.12)" : "rgba(255,184,28,0.12)",
                          color: isLocal ? GREEN : GOLD,
                        }}>
                          {sc.label}
                        </span>
                        <div style={{ fontSize: 12, marginTop: 2, color: GREY }}>
                          {sc.eng === "hourly"
                            ? fmt(Math.round(scenarioResults[i].effPerf)) + "/hr"
                            : fmt(Math.round(scenarioResults[i].effPerf)) + "/day"
                          }
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let lastSection: string | null = null;
                  return CMP_ROWS.map((r) => {
                    const sectionRow = r.section && r.section !== lastSection;
                    if (r.section) lastSection = r.section;
                    const vals = scenarioResults.map((s) => s[r.key] as number);
                    const bestVal = r.best ? Math.min(...vals) : null;

                    return [
                      sectionRow && (
                        <tr key={`section-${r.section}`}>
                          <td colSpan={5} style={{ fontSize: 11, fontWeight: 500, color: GREY, textTransform: "uppercase", letterSpacing: "0.04em", padding: "10px 10px 4px", background: MUTED, borderBottom: "none" }}>
                            {r.section}
                          </td>
                        </tr>
                      ),
                      <tr key={r.key} style={r.bold ? { fontWeight: 500 } : undefined}>
                        <td style={{ padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: r.bold ? WHITE : GREY, fontWeight: r.bold ? 500 : 400 }}>
                          {r.label}
                        </td>
                        {vals.map((val, i) => {
                          const isBest = r.best && val === bestVal;
                          const isSaving = r.saving;
                          const isNeg = isSaving && val < 0;
                          let color = WHITE;
                          if (isBest) color = GREEN;
                          if (isSaving && val > 0) color = GREEN;
                          if (isNeg) color = RED;
                          const display = isSaving
                            ? (val > 0 ? fmt(val) : val < 0 ? "−" + fmt(Math.abs(val)) : "—")
                            : fmt(val);
                          return (
                            <td key={i} style={{
                              textAlign: "center", padding: "6px 10px",
                              borderBottom: "1px solid rgba(255,255,255,0.04)",
                              color, fontWeight: r.bold ? 500 : 400,
                              fontSize: r.bold ? 16 : 13,
                            }}>
                              {display}{isBest && " ✓"}
                            </td>
                          );
                        })}
                      </tr>,
                    ];
                  });
                })()}
              </tbody>
            </table>
          </div>

          {/* Override panels */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: GREY, marginBottom: 8 }}>Override fields per scenario</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              {SCENARIO_DEFS.map((sc) => {
                const ov = overrides[sc.id];
                const hasOv = Object.values(ov).some((v) => v !== undefined);
                return (
                  <div key={sc.id} style={{ background: MUTED, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2, padding: "10px 12px" }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: WHITE, marginBottom: 8 }}>{sc.label}</div>
                    {OVERRIDE_FIELDS.map((f) => (
                      <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <label style={{ fontSize: 12, color: GREY, flex: 1 }}>{f.label}</label>
                        {f.key !== "actUnits" && f.key !== "travUnits" && <span style={{ fontSize: 13, color: GREY }}>$</span>}
                        <input
                          type="number"
                          placeholder="auto"
                          step="any"
                          value={ov[f.key] ?? ""}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setOv(sc.id, f.key, val === "" ? undefined : parseFloat(val));
                          }}
                          style={{
                            width: 70, fontSize: 13, padding: "4px 8px",
                            border: `1px solid ${ov[f.key] !== undefined ? GOLD : "rgba(255,255,255,0.08)"}`,
                            borderRadius: 2, background: MID,
                            color: ov[f.key] !== undefined ? GOLD : "rgba(255,255,255,0.4)",
                            fontFamily: mono, outline: "none",
                          }}
                        />
                      </div>
                    ))}
                    {hasOv && (
                      <button
                        onClick={() => resetOv(sc.id)}
                        style={{
                          fontSize: 11, padding: "2px 8px", border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 2, background: "transparent", color: GREY, cursor: "pointer", marginTop: 4,
                        }}
                      >
                        Reset to auto
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={FML_LOGO} alt="FeedMeLight" style={{ height: 18, filter: "brightness(0) invert(1)", opacity: 0.3 }} />
            <span style={{ color: "rgba(255,255,255,0.15)", fontFamily: mono, fontSize: 10 }}>×</span>
            <img src={CHIEFS_LOGO} alt="Chiefs" style={{ height: 24, opacity: 0.4 }} />
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)" }}>Confidential · April 2026 · feedmelight.com</div>
        </footer>
      </div>
    </div>
  );
}
