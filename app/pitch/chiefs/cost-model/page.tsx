"use client";

import { useState } from "react";

// ─── Design tokens (Chiefs branding) ────────────────────────
const RED = "#E31837";
const GOLD = "#FFB81C";
const DARK = "#0a0a0a";
const MID = "#141414";
const MUTED = "#1e1e1e";
const BORDER = "#2a2a2a";
const WHITE = "#f5f4f0";
const GREY = "#888";
const GREEN = "#22c55e";

const FML_LOGO =
  "https://fml-craft.files.svdcdn.com/production/FeedMeLight_Logo.svg?dm=1768940260";
const CHIEFS_LOGO = "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png";

// ─── Data ───────────────────────────────────────────────────

interface LineItem {
  label: string;
  days?: string;
  unit?: string;
  rate?: number;
  total?: number;
  note?: string;
}

interface CostSection {
  heading: string;
  columns?: string[];
  items: LineItem[];
}

interface TravelItem {
  label: string;
  value: string;
}

interface Scenario {
  id: string;
  tab: string;
  title: string;
  subtitle: string;
  sections: CostSection[];
  travel: TravelItem[];
  payment: string;
  caveats: string;
}

const scenarios: Scenario[] = [
  {
    id: "a",
    tab: "A",
    title: "Scenario A - Current Setup",
    subtitle:
      "Mikey/Jason fly out as well as handler with the costume. Full-day rates as they currently are.",
    sections: [
      {
        heading: "Phase 3: Promo Day",
        columns: ["days", "unit", "rate", "total"],
        items: [
          { label: "Daily Fee (Artists)", days: "1", unit: "1", rate: 1250, total: 1250 },
          { label: "Daily Fee (Handler)", days: "1", unit: "1", rate: 600, total: 600 },
          { label: "Per Diem (Per Day)", days: "1", unit: "2", rate: 50, total: 100 },
        ],
      },
      {
        heading: "Phase 3: Travel Day",
        columns: ["days", "unit", "rate", "total"],
        items: [
          { label: "Travel Day (Artists)", days: "1", unit: "1", rate: 250, total: 250 },
          { label: "Travel Day (Handler)", days: "1", unit: "1", rate: 250, total: 250 },
          { label: "Per Diem (Per Day)", days: "1", unit: "2", rate: 50, total: 100 },
        ],
      },
    ],
    travel: [
      {
        label: "Return Travel to Events",
        value: "Charged at cost",
      },
      {
        label: "Accommodation Costs",
        value: "Charged at cost",
      },
      {
        label: "Taxi Costs",
        value: "Charged at cost",
      },
    ],
    payment:
      "Disbursement costs to be invoiced at the end of the month of which the event takes place. Strict 30 day payment terms.",
    caveats: "",
  },
  {
    id: "b",
    tab: "B",
    title: "Scenario B - Current Setup, Cost Reduced",
    subtitle:
      "Same structure as A, but renegotiate with Mikey/Jason (half-day travel rates, negotiate a lower rate). Tighter flight logic. Immediately actionable.",
    sections: [
      {
        heading: "Phase 3: Promo Day (Full)",
        columns: ["days", "unit", "rate", "total"],
        items: [
          { label: "Daily Fee (Artists)", days: "1", unit: "1", rate: 1000, total: 1000, note: "Renegotiated rate" },
          { label: "Daily Fee (Handler)", days: "1", unit: "1", rate: 600, total: 600 },
          { label: "Per Diem (Per Day)", days: "1", unit: "2", rate: 50, total: 100 },
        ],
      },
      {
        heading: "Phase 3: Half Promo Day",
        columns: ["days", "unit", "rate", "total"],
        items: [
          { label: "Daily Fee (Artists)", days: ".5", unit: "1", rate: 1000, total: 500 },
          { label: "Daily Fee (Handler)", days: ".5", unit: "1", rate: 600, total: 300 },
          { label: "Per Diem (Per Day)", days: "1", unit: "2", rate: 50, total: 100 },
        ],
      },
      {
        heading: "Phase 3: Travel Day (Full)",
        columns: ["days", "unit", "rate", "total"],
        items: [
          { label: "Travel Day (Artists)", days: "1", unit: "1", rate: 250, total: 250 },
          { label: "Travel Day (Handler)", days: "1", unit: "1", rate: 250, total: 250 },
          { label: "Per Diem (Per Day)", days: "1", unit: "2", rate: 50, total: 100 },
        ],
      },
      {
        heading: "Phase 3: Travel Day (Half)",
        columns: ["days", "unit", "rate", "total"],
        items: [
          { label: "Travel Day (Artists)", days: ".5", unit: "1", rate: 250, total: 125 },
          { label: "Travel Day (Handler)", days: ".5", unit: "1", rate: 250, total: 125 },
          { label: "Per Diem (Per Day)", days: "1", unit: "2", rate: 50, total: 100 },
        ],
      },
    ],
    travel: [
      { label: "Return Travel to Events", value: "Charged at cost" },
      { label: "Accommodation Costs", value: "Charged at cost" },
      { label: "Taxi Costs", value: "Charged at cost" },
    ],
    payment:
      "Disbursement costs to be invoiced at the end of the month of which the event takes place. Strict 30 day payment terms.",
    caveats:
      "Rates reflect a renegotiated position and are subject to agreement with Mikey/Jason. Half-day travel rates apply where tighter flight scheduling allows. Flight scheduling will be optimised to minimise overnight stays where practical, though not guaranteed for all territories. All travel remains at cost. This scenario is immediately actionable but is dependent on talent agreeing to revised terms.",
  },
  {
    id: "c",
    tab: "C",
    title: "Scenario C - Recast, Handler Still Flies with Costume",
    subtitle:
      "New talent sourced per region. Handler still flies out to bring the costume and coordinate. Builds a database of performers focusing on capital cities in each region.",
    sections: [
      {
        heading: "Upfront Costs: Casting & Training",
        columns: ["task", "unit", "rate", "total"],
        items: [
          { label: "Casting", days: "1", unit: "1", rate: 3000, total: 3000, note: "Posting ads, research, self-tapes" },
          { label: "Management Structure (Database)", days: "1", unit: "1", rate: 200, total: 200, note: "One-off setup fee" },
          { label: "Building Acting Bible / Training", days: "4", unit: "1", rate: 200, total: 800 },
        ],
      },
      {
        heading: "Hourly Rate for Activation",
        items: [
          { label: "Artist Hourly Rate", total: 120 },
          { label: "Handler Hourly Rate", total: 75 },
        ],
      },
      {
        heading: "Handler Travelling Rate (Hourly)",
        items: [
          { label: "Handler Hourly Rate", total: 40 },
          { label: "Per Diem (Broken Down)", total: 7 },
        ],
      },
    ],
    travel: [
      { label: "Return Travel to Events", value: "Charged at cost" },
      { label: "Accommodation Costs", value: "Charged at cost" },
      { label: "Taxi Costs", value: "Charged at cost" },
    ],
    payment:
      "Disbursement costs to be invoiced at the end of the month of which the event takes place. Strict 30 day payment terms.",
    caveats:
      "Performer consistency and availability cannot be guaranteed at the same level as Scenario A/B. The handler remains the key operational constant, responsible for costume transport, coordination, and on-the-ground quality control. Training and quality control needed to assure mascots all know the dos and don'ts of KC Wolf. Currently the performer will be paid their flat rate as soon as they are travelling until they reach their home/hotel. Handler travel is at cost; local talent is not expected to travel internationally. Viable before the August season start but requires lead time for casting and training.",
  },
  {
    id: "d",
    tab: "D",
    title: 'Scenario D - Recast, Local Main Contact, One Costume Per Region',
    subtitle:
      'All local talent with one main mascot per region. Find a "Riley" per location - someone who owns the costume, coordinates activations, and manages local talent. Lowest long-term cost but big upfront investment.',
    sections: [
      {
        heading: "Upfront Costs: Mascot Build",
        columns: ["task", "unit", "rate", "total"],
        items: [
          { label: "Mascot Costume Build", days: "2", unit: "1", rate: 5000, total: 10000 },
          { label: "Mascot Outfit Build", days: "0", unit: "1", rate: 300, total: 0 },
        ],
      },
      {
        heading: "Upfront Costs: Casting & Training",
        columns: ["task", "unit", "rate", "total"],
        items: [
          { label: "Casting Director", days: "5", unit: "1", rate: 600, total: 3000 },
          { label: "Management Structure (Database)", days: "1", unit: "1", rate: 200, total: 200 },
          { label: "Building Acting Bible / Training", days: "2", unit: "1", rate: 200, total: 400 },
        ],
      },
      {
        heading: "Monthly Per-Market Costs",
        columns: ["task", "unit", "rate", "total"],
        items: [
          { label: '"Riley" Per Country', days: "1", unit: "4", rate: 250, total: 1000 },
          { label: "Storage p/m (Per Market)", days: "1", unit: "3", rate: 150, total: 450, note: "One already in retainer" },
        ],
      },
      {
        heading: "Hourly Rate for Activation",
        items: [
          { label: "Artist Hourly Rate", total: 120 },
          { label: "Handler Hourly Rate", total: 75 },
        ],
      },
    ],
    travel: [
      { label: "Return Travel to Events", value: "Charged at cost" },
      { label: "Accommodation Costs", value: "Charged at cost" },
      { label: "Taxi Costs", value: "Charged at cost" },
    ],
    payment:
      "Disbursement costs to be invoiced at the end of the month of which the event takes place. Strict 30 day payment terms.",
    caveats:
      "Costume manufacturing is a one-time capital cost and is not included in per-event pricing. Each regional lead is responsible for their costume, local talent coordination, and activation management. No international travel assumed; any exceptions costed separately at cost. Centralised calendar and admin is an ongoing FML overhead not included in per-event rates. Performer quality and consistency will vary by territory and is the responsibility of the regional lead. Highest upfront investment of all four scenarios; lowest projected per-event cost at scale. Insurance and liability implications across multiple jurisdictions must be reviewed before implementation.",
  },
];

// ─── Helpers ────────────────────────────────────────────────

function fmtGBP(n: number): string {
  return "\u00A3" + Math.round(n).toLocaleString("en-GB");
}

function sectionTotal(s: CostSection): number {
  return s.items.reduce((acc, i) => acc + (i.total ?? 0), 0);
}

// ─── Component ──────────────────────────────────────────────

export default function CostModelPage() {
  const [active, setActive] = useState(0);
  const sc = scenarios[active];

  const mono = "var(--font-dm-mono), 'DM Mono', monospace";
  const bebas = "var(--font-bebas), 'Bebas Neue', sans-serif";

  return (
    <div
      style={{
        background: DARK,
        color: WHITE,
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        .cm-tab {
          padding: 12px 24px;
          background: transparent;
          border: 1px solid ${BORDER};
          color: ${GREY};
          cursor: pointer;
          font-family: ${mono};
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          transition: all 0.2s;
          border-radius: 0;
        }
        .cm-tab:first-child { border-radius: 6px 0 0 6px; }
        .cm-tab:last-child { border-radius: 0 6px 6px 0; }
        .cm-tab:hover { background: ${MUTED}; color: ${WHITE}; }
        .cm-tab.active { background: ${RED}; border-color: ${RED}; color: #fff; }
        .cm-table { width: 100%; border-collapse: collapse; }
        .cm-table th {
          text-align: left;
          font-family: ${mono};
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${GREY};
          padding: 10px 12px;
          border-bottom: 1px solid ${BORDER};
        }
        .cm-table th:last-child { text-align: right; }
        .cm-table td {
          padding: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 14px;
        }
        .cm-table td:last-child { text-align: right; font-family: ${mono}; font-weight: 600; }
        .cm-table tr:last-child td { border-bottom: none; }
        .cm-table .total-row td {
          border-top: 1px solid ${BORDER};
          font-weight: 700;
          color: ${GOLD};
          font-family: ${mono};
        }
        .cm-note {
          font-size: 11px;
          color: ${GREY};
          font-style: italic;
          margin-top: 2px;
        }
        @media (max-width: 700px) {
          .cm-header-row { flex-direction: column !important; gap: 16px !important; }
          .cm-tabs { flex-wrap: wrap !important; }
          .cm-tab { flex: 1; min-width: 60px; text-align: center; }
          .cm-content { padding: 24px 16px !important; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "40px 48px 32px",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div
          className="cm-header-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img
              src={FML_LOGO}
              alt="FeedMeLight"
              style={{ height: 18, filter: "brightness(0) invert(1)", opacity: 0.5 }}
            />
            <span style={{ color: "rgba(255,255,255,0.15)", fontFamily: mono, fontSize: 10 }}>
              x
            </span>
            <img
              src={CHIEFS_LOGO}
              alt="Kansas City Chiefs"
              style={{ height: 32, opacity: 0.7 }}
            />
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: GREY,
            }}
          >
            Confidential - Wolf Pack Cost Model
          </div>
        </div>

        <h1
          style={{
            fontFamily: bebas,
            fontSize: "clamp(36px, 5vw, 56px)",
            letterSpacing: "0.04em",
            lineHeight: 1,
            color: RED,
            marginBottom: 8,
          }}
        >
          Four Scenarios Cost Model
        </h1>
        <p
          style={{
            fontFamily: mono,
            fontSize: 12,
            color: GREY,
            letterSpacing: "0.08em",
          }}
        >
          Wolf Pack Europe - Activation Cost Structures
        </p>
      </div>

      {/* Tabs */}
      <div style={{ padding: "24px 48px", borderBottom: `1px solid ${BORDER}` }}>
        <div className="cm-tabs" style={{ display: "flex", gap: 0 }}>
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              className={`cm-tab${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
            >
              {s.tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="cm-content" style={{ padding: "40px 48px", maxWidth: 1000 }}>
        {/* Scenario header */}
        <h2
          style={{
            fontFamily: bebas,
            fontSize: 32,
            letterSpacing: "0.04em",
            color: WHITE,
            marginBottom: 8,
          }}
        >
          {sc.title}
        </h2>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: GREY,
            marginBottom: 40,
            maxWidth: 700,
          }}
        >
          {sc.subtitle}
        </p>

        {/* Cost sections */}
        {sc.sections.map((section, si) => {
          const total = sectionTotal(section);
          const hasCols = section.columns && section.columns.length > 0;

          return (
            <div
              key={si}
              style={{
                background: MID,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                marginBottom: 20,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: `1px solid ${BORDER}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: WHITE,
                  }}
                >
                  {section.heading}
                </span>
                {total > 0 && (
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 14,
                      fontWeight: 700,
                      color: GOLD,
                    }}
                  >
                    {fmtGBP(total)}
                  </span>
                )}
              </div>
              <div style={{ padding: "0 8px" }}>
                <table className="cm-table">
                  {hasCols && (
                    <thead>
                      <tr>
                        <th style={{ width: "45%" }}>Item</th>
                        {section.columns!.map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {section.items.map((item, ii) => (
                      <tr key={ii}>
                        <td>
                          {item.label}
                          {item.note && <div className="cm-note">{item.note}</div>}
                        </td>
                        {hasCols && (
                          <>
                            <td style={{ color: GREY, fontFamily: mono, fontSize: 13 }}>
                              {item.days ?? "-"}
                            </td>
                            <td style={{ color: GREY, fontFamily: mono, fontSize: 13 }}>
                              {item.unit ?? "-"}
                            </td>
                            <td style={{ color: GREY, fontFamily: mono, fontSize: 13 }}>
                              {item.rate != null ? fmtGBP(item.rate) : "-"}
                            </td>
                          </>
                        )}
                        <td>{item.total != null ? fmtGBP(item.total) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* Travel costs */}
        <div
          style={{
            background: MID,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: WHITE,
              }}
            >
              Travel Costs
            </span>
          </div>
          <div style={{ padding: "12px 20px" }}>
            {sc.travel.map((t, ti) => (
              <div
                key={ti}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom:
                    ti < sc.travel.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  fontSize: 14,
                }}
              >
                <span>{t.label}</span>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 12,
                    color: GREY,
                    fontStyle: "italic",
                  }}
                >
                  {t.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment schedule */}
        <div
          style={{
            background: MID,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "20px 24px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: GREY,
              marginBottom: 10,
            }}
          >
            Payment Schedule
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
            {sc.payment}
          </p>
        </div>

        {/* Caveats */}
        {sc.caveats && (
          <div
            style={{
              background: MID,
              border: `1px solid ${BORDER}`,
              borderLeft: `3px solid ${RED}`,
              borderRadius: 8,
              padding: "20px 24px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: RED,
                marginBottom: 10,
              }}
            >
              Assumptions, Contingencies & Caveats
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.7,
              }}
            >
              {sc.caveats}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "32px 48px",
          borderTop: `1px solid ${BORDER}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src={FML_LOGO}
            alt="FeedMeLight"
            style={{ height: 16, filter: "brightness(0) invert(1)", opacity: 0.3 }}
          />
          <span style={{ color: "rgba(255,255,255,0.15)", fontFamily: mono, fontSize: 10 }}>
            x
          </span>
          <img
            src={CHIEFS_LOGO}
            alt="Kansas City Chiefs"
            style={{ height: 24, opacity: 0.3 }}
          />
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          Confidential - April 2026 - feedmelight.com
        </div>
      </div>
    </div>
  );
}
