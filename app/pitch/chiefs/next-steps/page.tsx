import Link from "next/link";

const RED = "#E31837";
const AMBER = "#FFB81C";
const BG = "#0a0a0a";
const CARD = "#1a1a1a";
const CARD2 = "#222222";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT = "#f5f4f0";
const MUTED = "#888";

const BEBAS = "var(--font-bebas), 'Bebas Neue', sans-serif";
const SANS = "var(--font-dm-sans), 'DM Sans', sans-serif";
const MONO = "var(--font-dm-mono), 'DM Mono', monospace";

const CHIEFS_LOGO = "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png";
const FML_LOGO = "https://fml-craft.files.svdcdn.com/production/FeedMeLight_Logo.svg?dm=1768940260";

const MARKETS = [
  {
    flag: "\u{1F1EC}\u{1F1E7}", name: "United Kingdom", mascot: "KC Wolf \u00B7 London-based costume",
    color: AMBER, key: "uk",
    body: "Biggest NFL market outside the US. Three London games annually at Tottenham Hotspur Stadium and Wembley. The Chiefs added UK rights in 2025 and immediately identified the 12\u201324 demographic as the primary target. Strong crossover with Premier League fandom and music culture. Super Bowl watch parties, NFL game weeks, brand partnerships, and sports crossover events all viable.",
    tags: [{ t: "Game weeks", v: "hot" }, { t: "Super Bowl parties", v: "hot" }, { t: "NFL Draft watches", v: "" }, { t: "Brand activations", v: "" }, { t: "FLAG football", v: "" }],
  },
  {
    flag: "\u{1F1EE}\u{1F1EA}", name: "Ireland", mascot: "KC O\u2019Wolf \u00B7 Irish mascot introduced 2025",
    color: "#16a34a", key: "ireland",
    body: "First ever NFL game at Croke Park in 2025. The Chiefs ran Chiefs House at Murray\u2019s Bar in Dublin for a full game weekend, featuring KC O\u2019Wolf with alumni appearances. The Irish market is small but extraordinarily engaged \u2014 the NFL described it as a \u201Ctrue city takeover.\u201D Year-round activation is currently underdeveloped, which is the opportunity. Dublin is 1hr 20min from London.",
    tags: [{ t: "Croke Park history", v: "new" }, { t: "High fan density", v: "hot" }, { t: "Pub culture activation", v: "" }, { t: "Watch parties", v: "" }],
  },
  {
    flag: "\u{1F1E9}\u{1F1EA}", name: "Germany", mascot: "KC Wolf \u00B7 Frankfurt 2023 \u00B7 Berlin 2025",
    color: "#dc2626", key: "germany",
    body: "The Chiefs hold DACH rights \u2014 Germany, Austria, and Switzerland. Eleven NFL teams have German market rights, making it the most competitive but also most developed European fanbase. KC Wolf was in Frankfurt in 2023 when the Chiefs beat the Dolphins. Berlin hosted a game in 2025. Munich\u2019s Allianz Arena returns in 2026, Berlin again in 2027. The game calendar gives natural activation anchors across two consecutive years.",
    tags: [{ t: "Allianz Arena 2026", v: "hot" }, { t: "DACH region rights", v: "" }, { t: "Proven fanbase", v: "" }, { t: "Bundesliga crossover", v: "" }],
  },
  {
    flag: "\u{1F1EA}\u{1F1F8}", name: "Spain", mascot: "KC Lobazo \u00B7 Madrid \u00B7 La Liga opportunity",
    color: "#ea580c", key: "spain",
    body: "The highest-upside market. KC Lobazo activated at Chiefs House in the Pestana CR7 Gran V\u00EDa during the 2025 Madrid game. The Chiefs are aggressively pushing for a 2026 regular season game at the Bernab\u00E9u. La Liga\u2019s mascot ecosystem \u2014 with 20 club characters across Spain \u2014 presents a unique cross-sport collaboration opportunity that no other NFL team could credibly pursue.",
    tags: [{ t: "Bernab\u00E9u 2026?", v: "hot" }, { t: "La Liga crossover", v: "hot" }, { t: "Multi-year Madrid deal confirmed", v: "new" }, { t: "KC Lobazo live", v: "" }],
  },
];

const CALENDAR = [
  { month: "Apr", market: "UK \u00B7 Ireland", event: "NFL Draft watch parties", desc: " \u2014 pub takeovers in London and Dublin, KC Wolf appearances, live stream", type: "Watch", cls: "watch" },
  { month: "May", market: "Spain", event: "La Liga season run-in", desc: " \u2014 KC Lobazo \u00D7 La Liga mascot crossover, El Cl\u00E1sico activation, social content", type: "Crossover", cls: "sport" },
  { month: "Aug", market: "All markets", event: "NFL season kickoff", desc: " \u2014 launch events in all four markets, FLAG football clinics, brand partner activations", type: "Season launch", cls: "watch" },
  { month: "Sep\u2013Oct", market: "Germany", event: "Munich game week", desc: " \u2014 Chiefs House at Allianz Arena, KC Wolf on ground, multi-day fan activation", type: "Game week", cls: "gamewk" },
  { month: "Oct", market: "UK", event: "London game weeks", desc: " \u2014 Tottenham Hotspur Stadium / Wembley, Chiefs House, KC Wolf fan zone", type: "Game week", cls: "gamewk" },
  { month: "TBC", market: "Spain", event: "Bernab\u00E9u game week (if confirmed)", desc: " \u2014 full Chiefs House operation, KC Lobazo + La Liga mascot collab, stadium content", type: "Game week", cls: "gamewk", highlight: true },
  { month: "Nov", market: "Ireland", event: "Dublin activation", desc: " \u2014 KC O\u2019Wolf at Chiefs partner venue, Chiefs Kingdom fan night, social content shoot", type: "Brand", cls: "brand" },
  { month: "Feb", market: "All markets", event: "Super Bowl LXI watch parties", desc: " \u2014 coordinated multi-market events, KC Wolf in London, local hosts in each territory", type: "Watch", cls: "watch" },
];

const LALIGA_METRICS = [
  { label: "La Liga clubs with mascots", value: "20" },
  { label: "La Liga global broadcast reach", value: "180+ countries" },
  { label: "NFL Spain marketing teams", value: "Chiefs \u00B7 Dolphins \u00B7 Bears" },
  { label: "Chiefs\u2019 advantage in Spain", value: "KC Lobazo \u00B7 existing rights" },
  { label: "Content type", value: "Social \u00B7 Stadium \u00B7 PR" },
];

const PROPOSITIONS = [
  { num: "01", title: "Mascot Operations", body: "We manage KC Wolf. We hold the costume, the talent relationships, and the operational knowledge across multiple countries already. We are not pitching a new idea \u2014 we are proposing a coordinated calendar for what we already do." },
  { num: "02", title: "Content at Every Activation", body: "Every appearance generates content. We shoot at every event \u2014 social cuts, BTS, fan moments \u2014 and deliver directly to the Chiefs\u2019 international social channels. This is the add-on value the Chiefs have been explicit about wanting from their European partners." },
  { num: "03", title: "Third-Party Partnerships", body: "La Liga, Bundesliga clubs, Premier League fan events \u2014 we can broker the introductions and produce the cross-sport moments. These are the culturally resonant activations that standard sports marketing agencies can\u2019t credibly walk into." },
];

const typeColors: Record<string, { bg: string; color: string; border: string }> = {
  gamewk: { bg: "rgba(227,24,55,0.1)", color: "#f87171", border: "rgba(227,24,55,0.2)" },
  watch: { bg: "rgba(255,184,28,0.1)", color: AMBER, border: "rgba(255,184,28,0.2)" },
  brand: { bg: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "rgba(99,102,241,0.2)" },
  sport: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.2)" },
};

export default function NextStepsPage() {
  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: SANS, fontSize: 15, lineHeight: 1.6 }}>

      {/* HEADER */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 48px", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,10,0.96)", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={CHIEFS_LOGO} alt="Chiefs" style={{ height: 38 }} />
          <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.15)" }} />
          <div>
            <div style={{ fontFamily: BEBAS, fontSize: 18, letterSpacing: "0.04em" }}>KC Wolf European Activation</div>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, marginTop: 1 }}>2026 Strategy &middot; Feed Me Light</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/pitch/chiefs/budget" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "transparent", color: AMBER, border: `1px solid ${AMBER}`, fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, borderRadius: 2, textDecoration: "none", transition: "all 0.15s" }}>
            &larr; Budget
          </Link>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textAlign: "right", lineHeight: 1.6 }}>Confidential<br />Prepared by Feed Me Light</div>
          <img src={FML_LOGO} alt="Feed Me Light" style={{ height: 22, filter: "brightness(0) invert(1)", opacity: 0.5 }} />
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 48px 80px" }}>

        {/* HERO */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: AMBER, marginBottom: 16 }}>KC Wolf &middot; European Markets &middot; Contract to 2027</div>
          <h1 style={{ fontFamily: BEBAS, fontSize: "clamp(52px, 7vw, 88px)", lineHeight: 0.92, letterSpacing: "0.02em", marginBottom: 20 }}>
            <span style={{ color: RED }}>KC Wolf</span><br />
            <span style={{ color: AMBER }}>Goes</span><br />
            European
          </h1>
          <p style={{ maxWidth: 600, fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 36 }}>
            The Chiefs have marketing rights across six European countries. They&apos;ve committed publicly to deploying KC Wolf more frequently across those markets. We operate the mascot. We have the contract until 2027. This is the plan.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: "Target markets", value: "4", sub: "UK \u00B7 Ireland \u00B7 Germany \u00B7 Spain" },
              { label: "Contract runs to", value: "2027", sub: "FML exclusive management" },
              { label: "NFL int\u2019l games 2025", value: "7", sub: "Most ever in one season" },
              { label: "Chiefs\u2019 global rank", value: "#1", sub: "Fan base in 6 of 9 NFL int\u2019l markets" },
            ].map((s) => (
              <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 3, padding: "14px 16px" }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 500, color: AMBER }}>{s.value}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginTop: 3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, margin: "0 0 40px" }} />

        {/* WHY NOW */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: AMBER, marginBottom: 8 }}>Why now</div>
            <div style={{ fontFamily: BEBAS, fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: "0.02em", lineHeight: 1 }}>The Chiefs <span style={{ color: RED }}>Said This Out Loud</span></div>
          </div>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${AMBER}`, borderRadius: 3, padding: "20px 24px", marginBottom: 24 }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.75 }}>
              <strong style={{ color: TEXT, fontWeight: 500 }}>&ldquo;We know mascots do really well in the markets, it becomes an ambassador.&rdquo;</strong>{" "}
              KC Wolf was in Frankfurt when the Chiefs played there in 2023. The team&apos;s CMO confirmed they were actively looking for <strong style={{ color: TEXT, fontWeight: 500 }}>multiple European-based mascots</strong> to show up in markets more frequently &mdash; and in 2025 they unveiled four European mascots, one per market. In Dublin, KC O&apos;Wolf ran fan activations at Murray&apos;s Bar for an entire weekend. In Madrid, KC Lobazo held court at Chiefs House in the Pestana CR7. The infrastructure is there. The appetite is there. What&apos;s missing is a coordinated activation calendar and a production partner who can execute it consistently across all four markets.
            </p>
          </div>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${RED}`, borderRadius: 3, padding: "20px 24px" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.75 }}>
              The Chiefs are <strong style={{ color: TEXT, fontWeight: 500 }}>pushing hard for a 2026 game in Madrid at the Bernab&eacute;u</strong>. If that&apos;s confirmed, it becomes the biggest single activation opportunity in the current contract period &mdash; and every European market activates around it. We need to be on the calendar before that announcement drops.
            </p>
          </div>
        </section>

        {/* MARKETS */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: AMBER, marginBottom: 8 }}>Market overview</div>
            <div style={{ fontFamily: BEBAS, fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: "0.02em", lineHeight: 1 }}>Four Markets, <span style={{ color: RED }}>One Strategy</span></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {MARKETS.map((m) => (
              <div key={m.key} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 3, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: m.color }} />
                <div style={{ fontSize: 28, marginBottom: 10 }}>{m.flag}</div>
                <div style={{ fontFamily: BEBAS, fontSize: 28, letterSpacing: "0.04em", marginBottom: 4 }}>{m.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: AMBER, marginBottom: 14 }}>{m.mascot}</div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: 16 }}>{m.body}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {m.tags.map((tag) => (
                    <span key={tag.t} style={{
                      fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 2,
                      ...(tag.v === "hot" ? { background: "rgba(255,184,28,0.1)", color: AMBER, border: "1px solid rgba(255,184,28,0.2)" }
                        : tag.v === "new" ? { background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }
                        : { background: "rgba(255,255,255,0.06)", color: MUTED, border: "1px solid rgba(255,255,255,0.08)" }),
                    }}>{tag.t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LA LIGA */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: AMBER, marginBottom: 8 }}>Signature opportunity</div>
            <div style={{ fontFamily: BEBAS, fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: "0.02em", lineHeight: 1 }}>The <span style={{ color: RED }}>La Liga</span> Angle</div>
          </div>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 3, padding: "32px 36px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
            <div>
              <h3 style={{ fontFamily: BEBAS, fontSize: 32, letterSpacing: "0.03em", marginBottom: 14, lineHeight: 1 }}>KC Lobazo meets <span style={{ color: RED }}>La Liga</span></h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, marginBottom: 14 }}>
                Henry visited La Liga&apos;s official mascot gallery. What he was looking at was an ecosystem of 20 club mascots with established fan relationships, stadium access, and social media reach &mdash; all in the Chiefs&apos; primary Spanish market.
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, marginBottom: 14 }}>
                A KC Lobazo appearance alongside Real Madrid&apos;s Marceline, Atl&eacute;tico&apos;s &Iacute;ndio, or Sevilla&apos;s Cachito at a high-profile fixture would be genuinely unprecedented cross-sport content. NFL wolf meets Spanish football. It is the kind of cultural moment that the Chiefs are explicitly chasing with their 12&ndash;24 European demographic &mdash; and it requires a production partner on the ground to make it happen.
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.75 }}>
                La Liga has a global broadcast footprint and its own international expansion push. The shared agenda is obvious.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LALIGA_METRICS.map((m) => (
                <div key={m.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 2, padding: "12px 16px" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>{m.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500, color: TEXT }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CALENDAR */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: AMBER, marginBottom: 8 }}>2026 Season</div>
            <div style={{ fontFamily: BEBAS, fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: "0.02em", lineHeight: 1 }}>Activation <span style={{ color: RED }}>Calendar</span></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 120px 1fr auto", alignItems: "center", gap: 16, padding: "0 18px 4px" }}>
              {["When", "Market", "Activation", "Type"].map((h) => (
                <span key={h} style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED }}>{h}</span>
              ))}
            </div>
            {CALENDAR.map((c, i) => {
              const tc = typeColors[c.cls];
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 120px 1fr auto", alignItems: "center", gap: 16, background: CARD, border: `1px solid ${c.highlight ? "rgba(255,184,28,0.2)" : BORDER}`, borderRadius: 3, padding: "12px 18px" }}>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: c.highlight ? RED : AMBER, fontWeight: 500 }}>{c.month}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>{c.market}</span>
                  <span style={{ fontSize: 13, color: TEXT }}><strong style={{ fontWeight: 500 }}>{c.event}</strong>{c.desc}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 2, whiteSpace: "nowrap", background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{c.type}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* FML PROPOSITION */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: AMBER, marginBottom: 8 }}>Our role</div>
            <div style={{ fontFamily: BEBAS, fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: "0.02em", lineHeight: 1 }}>What <span style={{ color: RED }}>FML Brings</span></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {PROPOSITIONS.map((p) => (
              <div key={p.num} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 3, padding: 22 }}>
                <div style={{ fontFamily: BEBAS, fontSize: 48, color: "rgba(255,184,28,0.15)", lineHeight: 1, marginBottom: 10 }}>{p.num}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: TEXT, marginBottom: 10 }}>{p.title}</div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SUMMARY */}
        <div style={{ background: CARD, border: "1px solid rgba(255,184,28,0.2)", borderRadius: 3, padding: "32px 36px", display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}>
          <div>
            <h2 style={{ fontFamily: BEBAS, fontSize: 36, letterSpacing: "0.03em", lineHeight: 1, marginBottom: 12 }}>
              One contract. Four markets.<br /><span style={{ color: AMBER }}>2026 calendar &mdash; now.</span>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 520 }}>
              The Chiefs are publicly committed to more mascot appearances in Europe. We have the contract, the operational infrastructure, and relationships in all four target markets. The Bernab&eacute;u game announcement &mdash; if it comes &mdash; changes the scale overnight. The time to get on the calendar is before that conversation happens.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>Prepared by</div>
            <div style={{ fontFamily: BEBAS, fontSize: 24, letterSpacing: "0.04em" }}>Ben Leyland</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: MUTED, marginTop: 3 }}>EP & Technology Director &middot; Feed Me Light</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: AMBER, marginTop: 4 }}>ben.leyland@feedmelight.com</div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 48px", borderTop: `1px solid ${BORDER}`, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={FML_LOGO} alt="Feed Me Light" style={{ height: 16, filter: "brightness(0) invert(1)", opacity: 0.25 }} />
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>&times;</span>
          <img src={CHIEFS_LOGO} alt="Kansas City Chiefs" style={{ height: 22, opacity: 0.3 }} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)" }}>Confidential &middot; April 2026 &middot; feedmelight.com</div>
      </footer>
    </div>
  );
}
