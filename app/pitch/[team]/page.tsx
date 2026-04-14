import { supabase, Team } from "@/lib/supabase";
import { getTeamColors, getTeamLogoUrl, getFullTeamName } from "@/lib/teamColors";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Calculator from "./Calculator";
import FadeUp from "./FadeUp";
import TeamLogo from "./TeamLogo";
import CaseStudies from "./CaseStudies";
import { getRelevantCaseStudies } from "@/lib/caseStudies";
import GlobalChatterMap from "./GlobalChatterMap";

interface Props {
  params: Promise<{ team: string }>;
}

async function getTeam(slug: string): Promise<Team | null> {
  // DB stores short names like "Chiefs", "Eagles", "Lakers"
  // Slugs come in as "chiefs", "49ers", "inter-miami" etc.
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, league, metadata");

  if (!teams) return null;

  const normalized = slug.toLowerCase().replace(/-/g, " ");

  // Direct match: slug "chiefs" === name "Chiefs"
  const match = teams.find(
    (t: Team) => t.name.toLowerCase() === normalized
  );
  if (match) return match as Team;

  // Hyphenated match: slug "inter-miami" === name "Inter Miami"
  const hyphenated = teams.find((t: Team) => {
    const teamSlug = t.name.toLowerCase().replace(/\s+/g, "-");
    return teamSlug === slug.toLowerCase();
  });
  if (hyphenated) return hyphenated as Team;

  // Partial match: slug contains team name or vice versa
  const partial = teams.find(
    (t: Team) =>
      t.name.toLowerCase().includes(normalized) ||
      normalized.includes(t.name.toLowerCase())
  );
  return (partial as Team) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { team: slug } = await params;
  const team = await getTeam(slug);
  if (!team) return { title: "Team Not Found" };
  return {
    title: `FeedMeLight × ${getFullTeamName(team.name, team.metadata.city)}`,
    description: `A personalised FeedMeLight pitch for the ${getFullTeamName(team.name, team.metadata.city)}.`,
  };
}

export default async function TeamPitch({ params }: Props) {
  const { team: slug } = await params;
  const team = await getTeam(slug);
  if (!team) notFound();

  const { primary, secondary, accent, textOnPrimary, textOnSecondary } = getTeamColors(team.name);
  const m = team.metadata;
  const logoUrl = getTeamLogoUrl(team.league, team.name);
  const fullName = getFullTeamName(team.name, m.city);
  const fmlLogo =
    "https://fml-craft.files.svdcdn.com/production/FeedMeLight_Logo.svg?dm=1768940260";

  const capacity = m.capacity
    ? Number(m.capacity).toLocaleString("en-US")
    : "—";

  const cssVars = {
    "--team-primary": primary,
    "--team-secondary": secondary,
    "--team-dark": "#0a0a0a",
    "--team-mid": "#1a1a1a",
    "--team-muted": "#2a2a2a",
    "--fml-white": "#f5f4f0",
    "--fml-grey": "#888",
    "--team-accent": accent,
    "--text-on-primary": textOnPrimary,
    "--text-on-secondary": textOnSecondary,
  } as React.CSSProperties;

  const tickerItems = [
    "Fan Intelligence. Real Time.",
    `FeedMeLight × ${fullName}`,
    "Lighting the Flame of Fandom",
    "WC22 · Arab Cup · AFC Asian Cup",
    "The Soft Fan is the Growth Market",
    "Operating Both Sides of the Atlantic",
    `${m.city} · ${m.stadium} · ${team.league}`,
    "Content is the Output of the Intelligence",
  ];

  // Fetch fan clubs for map
  const { data: fanClubsRaw } = await supabase
    .from("fan_clubs")
    .select("id, name, city, country, lat, lng, member_count")
    .eq("team_id", team.id)
    .not("lat", "is", null)
    .order("member_count", { ascending: false });
  const fanClubs = (fanClubsRaw ?? []).map((fc: any) => ({
    id: fc.id,
    name: fc.name,
    city: fc.city || "",
    country: fc.country || "",
    lat: fc.lat,
    lng: fc.lng,
    member_count: fc.member_count || 0,
  }));

  const painPoints = [
    {
      num: "01",
      title: `Your European fanbase is invisible`,
      body: `The ${fullName} have fans in Dublin, London, Berlin, and beyond. You know they exist. You don't know who they are, where they gather, what they feel, or how to speak to them in a way that deepens allegiance rather than just broadcasting at them.`,
    },
    {
      num: "02",
      title: "The soft fan is becoming real",
      body: `The fastest growing segment isn't the hardcore. It's the collector, someone with a portfolio of allegiances at different temperatures. They discovered the ${fullName} through a moment, a player, a feeling. The flame is lit. Most teams have no idea how to serve them.`,
    },
    {
      num: "03",
      title: "Content doesn't keep up with the signal",
      body: `Your fans are generating real-time sentiment, conversation, and energy across every platform. Your content team is on a production cycle. There's a gap between what your fans are feeling now and what you're able to say to them.`,
    },
    {
      num: "04",
      title: `${m.city} activations are one-and-done`,
      body: `${team.league.toUpperCase()} games. Sponsor activations. A fan event in ${m.city}. They land well and then disappear. There's no system that converts a one-night experience into a permanent deepening of the relationship. The flame lights, then goes out.`,
    },
  ];

  return (
    <div style={cssVars}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          background: var(--team-dark) !important;
          color: var(--fml-white) !important;
          font-family: var(--font-dm-sans), 'DM Sans', sans-serif !important;
          overflow-x: hidden;
        }

        .ticker-wrap {
          background: var(--team-primary);
          padding: 10px 0;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
        }
        .ticker-wrap::before, .ticker-wrap::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 60px;
          z-index: 2;
        }
        .ticker-wrap::before { left: 0; background: linear-gradient(to right, var(--team-primary), transparent); }
        .ticker-wrap::after { right: 0; background: linear-gradient(to left, var(--team-primary), transparent); }
        .ticker-track {
          display: inline-block;
          animation: ticker 40s linear infinite;
        }
        .ticker-track span {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-on-primary);
          padding: 0 40px;
        }
        .ticker-track span::before {
          content: '◆';
          margin-right: 16px;
          color: var(--team-secondary);
          opacity: 0.8;
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .pitch-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 60px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10,10,10,0.95);
          backdrop-filter: blur(12px);
        }
        .nav-logos {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .nav-logo-fml img {
          height: 32px;
          width: auto;
          filter: brightness(0) invert(1);
          display: block;
        }
        .nav-divider {
          width: 1px;
          height: 36px;
          background: rgba(255,255,255,0.2);
        }
        .nav-logo-team img {
          height: 44px;
          width: auto;
          display: block;
        }
        .nav-cta {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-on-secondary);
          background: var(--team-secondary);
          padding: 10px 22px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .nav-cta:hover { background: var(--fml-white); color: var(--team-dark); }

        .hero {
          min-height: 90vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 60px;
          position: relative;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 80% 50%, color-mix(in srgb, var(--team-primary) 12%, transparent) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 20% 80%, color-mix(in srgb, var(--team-secondary) 6%, transparent) 0%, transparent 70%);
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .hero-label {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--team-accent);
          margin-bottom: 28px;
          position: relative;
          z-index: 2;
        }
        .hero-label::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: var(--team-accent);
          margin-right: 12px;
          vertical-align: middle;
        }
        .hero-headline {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: clamp(64px, 9vw, 130px);
          line-height: 0.92;
          letter-spacing: 0.02em;
          position: relative;
          z-index: 2;
          max-width: 900px;
        }
        .hero-headline .primary-text { color: var(--team-primary); }
        .hero-headline .secondary-text { color: var(--team-accent); }
        .hero-sub {
          font-size: 18px;
          font-weight: 300;
          line-height: 1.6;
          color: rgba(245,244,240,0.65);
          max-width: 560px;
          margin-top: 32px;
          position: relative;
          z-index: 2;
        }
        .hero-stats {
          display: flex;
          gap: 60px;
          margin-top: 60px;
          position: relative;
          z-index: 2;
        }
        .hero-stat-num {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 52px;
          line-height: 1;
          color: var(--team-accent);
        }
        .hero-stat-label {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--fml-grey);
          margin-top: 6px;
        }
        .hero-logos {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 40px;
          position: relative;
          z-index: 2;
        }
        .hero-logo-fml img {
          height: 28px;
          width: auto;
          filter: brightness(0) invert(1);
          opacity: 0.7;
        }
        .hero-logo-sep {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.1em;
        }
        .hero-logo-team img {
          height: 156px;
          width: auto;
        }
        .hero-scroll {
          position: absolute;
          bottom: 40px;
          right: 60px;
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--fml-grey);
          writing-mode: vertical-rl;
          z-index: 2;
        }

        .pitch-section {
          padding: 100px 60px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .section-label {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--team-accent);
          margin-bottom: 20px;
        }
        .section-title {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 5vw, 72px);
          line-height: 1;
          letter-spacing: 0.02em;
          margin-bottom: 40px;
        }

        .pain-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
          margin-top: 20px;
        }
        .pain-card {
          background: var(--team-mid);
          padding: 40px;
          position: relative;
          overflow: hidden;
          transition: background 0.3s;
        }
        .pain-card:hover { background: #222; }
        .pain-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 3px;
          height: 0;
          background: var(--team-primary);
          transition: height 0.4s;
        }
        .pain-card:hover::before { height: 100%; }
        .pain-num {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 64px;
          color: color-mix(in srgb, var(--team-accent) 40%, transparent);
          line-height: 1;
          margin-bottom: 16px;
        }
        .pain-title {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 26px;
          letter-spacing: 0.04em;
          margin-bottom: 12px;
          color: var(--team-accent);
        }
        .pain-body {
          font-size: 14px;
          font-weight: 300;
          line-height: 1.7;
          color: rgba(245,244,240,0.55);
        }

        .insight-strip {
          background: var(--team-primary);
          padding: 60px;
        }
        .insight-strip blockquote {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: clamp(28px, 4vw, 52px);
          line-height: 1.15;
          letter-spacing: 0.02em;
          max-width: 900px;
        }
        .insight-strip cite {
          display: block;
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-top: 24px;
          font-style: normal;
        }

        .proof-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          margin-top: 20px;
        }
        .proof-card {
          background: var(--team-mid);
          padding: 36px 32px;
          border-top: 3px solid transparent;
          transition: all 0.3s;
          cursor: default;
        }
        .proof-card:hover { border-top-color: var(--team-accent); background: #1e1e1e; }
        .proof-tag {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--team-accent);
          margin-bottom: 20px;
        }
        .proof-title {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 0.04em;
          margin-bottom: 12px;
          line-height: 1.1;
          color: var(--team-accent);
        }
        .proof-body {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.65;
          color: rgba(245,244,240,0.5);
        }

        .cta-section {
          background: var(--team-primary);
          padding: 100px 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 60px;
        }
        .cta-left h2 {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: clamp(44px, 6vw, 90px);
          line-height: 0.95;
          letter-spacing: 0.02em;
          max-width: 600px;
        }
        .cta-left p {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.65;
          color: rgba(255,255,255,0.7);
          max-width: 480px;
          margin-top: 24px;
        }
        .cta-right { flex-shrink: 0; }
        .cta-btn {
          display: block;
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 0.1em;
          padding: 22px 48px;
          background: var(--team-dark);
          color: var(--team-accent);
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          text-align: center;
        }
        .cta-btn:hover { background: var(--team-accent); color: var(--team-dark); }
        .cta-contact {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.5);
          margin-top: 14px;
          text-align: center;
        }

        .pitch-footer {
          padding: 30px 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .f-note {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.2);
        }

        .fade-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .client-logo:hover { opacity: 0.85 !important; }

        @media (max-width: 900px) {
          .pitch-nav, .hero, .pitch-section, .insight-strip, .cta-section, .pitch-footer { padding-left: 24px !important; padding-right: 24px !important; }
          .pain-grid, .proof-grid { grid-template-columns: 1fr !important; }
          .calc-grid { grid-template-columns: 1fr !important; }
          .calc-output { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 40px; }
          .cta-section { flex-direction: column !important; }
          .hero-stats { flex-wrap: wrap; gap: 32px !important; }
        }
      `}</style>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav className="pitch-nav">
        <div className="nav-logos">
          <div className="nav-logo-fml">
            <img src={fmlLogo} alt="FeedMeLight" />
          </div>
          <div className="nav-divider" />
          <div className="nav-logo-team">
            <TeamLogo src={logoUrl} alt={fullName} height={44} />
          </div>
        </div>
        <a href="mailto:ben.leyland@feedmelight.com" className="nav-cta">
          Book a Conversation
        </a>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-logos">
          <div className="hero-logo-fml">
            <img src={fmlLogo} alt="FeedMeLight" />
          </div>
          <div className="hero-logo-sep">×</div>
          <div className="hero-logo-team">
            <TeamLogo src={logoUrl} alt={fullName} height={156} />
          </div>
        </div>
        <div className="hero-label">
          A Proposal for the {fullName} · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        <h1 className="hero-headline">
          We Know
          <br />
          <span className="primary-text">Where Your</span>
          <br />
          <span className="secondary-text">Fans Are.</span>
        </h1>
        <p className="hero-sub">
          We built a real-time fan intelligence system for your franchise. Here
          is what that looks like when deployed at full scale, globally, across
          Europe, MENA, APAC, and everywhere the {fullName} are growing.
        </p>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">{capacity}</div>
            <div className="hero-stat-label">
              {m.stadium}
              <br />
              capacity
            </div>
          </div>
          <div>
            <div className="hero-stat-num">{m.founded}</div>
            <div className="hero-stat-label">
              Year founded
              <br />
              in {m.city}
            </div>
          </div>
          <div>
            <div className="hero-stat-num">{m.conference}</div>
            <div className="hero-stat-label">
              Conference
              <br />
              {m.division} Division
            </div>
          </div>
        </div>
        <div className="hero-scroll">Scroll to explore</div>
      </div>

      {/* GLOBAL CHATTER MAP */}
      <section className="pitch-section">
        <GlobalChatterMap
          teamId={team.id}
          teamSlug={slug}
          teamName={team.name}
          primaryColor={primary}
          secondaryColor={accent}
          fanClubs={fanClubs}
          stadiumLat={m.lat}
          stadiumLng={m.lng}
          teamLogoUrl={logoUrl}
        />
      </section>

      {/* PAIN POINTS */}
      <section className="pitch-section">
        <div className="section-label">What we know about your world</div>
        <h2 className="section-title">
          The Problems
          <br />
          You&apos;re Solving Right Now
        </h2>
        <div className="pain-grid">
          {painPoints.map((p) => (
            <FadeUp key={p.num} className="pain-card">
              <div className="pain-num">{p.num}</div>
              <div className="pain-title">{p.title}</div>
              <div className="pain-body">{p.body}</div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* INSIGHT STRIP */}
      <FadeUp className="insight-strip">
        <blockquote>
          &ldquo;The moment a fan becomes a real one isn&apos;t accidental.
          It&apos;s created, shared and nurtured. Watching your team in a bar
          far from home at 6am, with a bunch of strangers who are also family.
          A full stadium that crackles. A piece of content that makes someone
          feel like they belong. Feed Me Light was built for those moments,
          because we&apos;ve lived them on both sides.&rdquo;
        </blockquote>
        <cite>
          Kiri Haggart, Co-Founder, Feed Me Light
        </cite>
      </FadeUp>

      {/* PROOF */}
      <section className="pitch-section">
        <div className="section-label">What we&apos;ve already built</div>
        <h2 className="section-title">
          Proof at the
          <br />
          Biggest Scale on Earth
        </h2>
        <div className="proof-grid">
          <FadeUp className="proof-card">
            <div className="proof-tag">Event · 2022</div>
            <div className="proof-title">FIFA World Cup Qatar</div>
            <div className="proof-body">
              Full creative content portfolio across the entire tournament.
              Ceremonies, activations, stadium screens, broadcast. Not a
              supplier. The team running it.
            </div>
          </FadeUp>
          <FadeUp className="proof-card">
            <div className="proof-tag">Event · 2023</div>
            <div className="proof-title">AFC Asian Cup &amp; Arab Cup</div>
            <div className="proof-body">
              Mascot creation, ceremony design, broadcast packages and social
              content for two consecutive major FIFA-sanctioned tournaments
              across the Middle East and Asia.
            </div>
          </FadeUp>
          <FadeUp className="proof-card">
            <div className="proof-tag">Live · Ongoing</div>
            <div className="proof-title">
              {fullName} Fan Intelligence Portal
            </div>
            <div className="proof-body">
              Real-time fan map, global signal tracking, live stats, regional
              filters across EU, US, APAC, MENA, LATAM. Built on your existing
              relationship. Already running.
            </div>
          </FadeUp>
          <FadeUp className="proof-card">
            <div className="proof-tag">DOOH · Landmark</div>
            <div className="proof-title">
              Piccadilly Lights &amp; Global OOH
            </div>
            <div className="proof-body">
              3D anamorphic and large-format screen content at landmark locations
              globally. We understand how to make a moment feel enormous. On the
              biggest screens in the world.
            </div>
          </FadeUp>
        </div>
      </section>

      {/* CLIENT LOGOS */}
      <div style={{
        padding: "60px 60px 0",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--fml-grey)",
          marginBottom: 32,
          textAlign: "center",
        }}>
          Trusted by
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          flexWrap: "wrap",
        }}>
          {[
            { src: "/FML Tournament & Partner Logos/FIFA_WC_02.webp", alt: "FIFA World Cup 2022" },
            { src: "/FML Tournament & Partner Logos/FIFA_WC_26.webp.png", alt: "FIFA World Cup 2026" },
            { src: "/FML Tournament & Partner Logos/AFC_2024.webp", alt: "AFC Asian Cup 2024" },
            { src: "/FML Tournament & Partner Logos/KCC_Logo.webp", alt: "Kansas City Chiefs" },
            { src: "/FML Tournament & Partner Logos/SAFF.webp", alt: "SAFF" },
            { src: "/FML Tournament & Partner Logos/Saudi2034.webp", alt: "Saudi 2034" },
          ].map((logo) => (
            <img
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              className="client-logo"
              style={{
                height: 132,
                width: "auto",
                opacity: 0.6,
                filter: "grayscale(1) invert(1)",
                transition: "opacity 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* CASE STUDIES */}
      <section className="pitch-section">
        <div className="section-label">Selected work</div>
        <h2 className="section-title">
          What We&apos;ve Built
          <br />
          For Brands Like Yours
        </h2>
        <CaseStudies studies={getRelevantCaseStudies(team.league, 4)} />
      </section>

      {/* CALCULATOR */}
      <section className="pitch-section">
        <div className="section-label">Commercial overview</div>
        <h2 className="section-title">
          What Does This
          <br />
          Actually Cost?
        </h2>
        <Calculator />
      </section>

      {/* CTA */}
      <div className="cta-section">
        <div className="cta-left">
          <h2>
            Let&apos;s Show You What This Looks Like For Your Franchise.
          </h2>
          <p>
            We&apos;re not asking for a brief. We&apos;re asking for 30 minutes.
            We&apos;ll show you the portal, talk through the European fan data
            we&apos;ve already mapped, and explain what a full deployment looks
            like.
          </p>
        </div>
        <div className="cta-right">
          <a
            href={`mailto:ben.leyland@feedmelight.com?subject=${encodeURIComponent(fullName + " × FeedMeLight — Let's Talk")}`}
            className="cta-btn"
          >
            Book a Conversation
          </a>
          <div className="cta-contact">ben.leyland@feedmelight.com</div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="pitch-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src={fmlLogo}
            alt="FeedMeLight"
            style={{
              height: 20,
              filter: "brightness(0) invert(1)",
              opacity: 0.3,
            }}
          />
          <span
            style={{
              color: "rgba(255,255,255,0.15)",
              fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
              fontSize: 10,
            }}
          >
            ×
          </span>
          <TeamLogo
            src={logoUrl}
            alt={fullName}
            height={28}
            style={{ opacity: 0.3 }}
          />
        </div>
        <div className="f-note">
          Confidential · March 2026 · feedmelight.com
        </div>
      </footer>
    </div>
  );
}
