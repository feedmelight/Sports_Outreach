import { supabase, Team } from "@/lib/supabase";
import { getTeamLogoUrl, getFullTeamName } from "@/lib/teamColors";
import Link from "next/link";

export const metadata = {
  title: "FeedMeLight — Pitch Index",
};

export default async function PitchIndex() {
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, league, metadata")
    .order("league")
    .order("name");

  // Filter out sponsors/colleges, group by league
  const sportLeagues = ["nfl", "nba", "mls", "wnba"];
  const grouped: Record<string, Team[]> = {};
  for (const t of teams ?? []) {
    const league = t.league || "other";
    if (!sportLeagues.includes(league)) continue;
    if (!grouped[league]) grouped[league] = [];
    grouped[league].push(t as Team);
  }

  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "#f5f4f0",
        minHeight: "100vh",
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        padding: "60px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <img
          src="https://fml-craft.files.svdcdn.com/production/FeedMeLight_Logo.svg?dm=1768940260"
          alt="FeedMeLight"
          style={{ height: 32, filter: "brightness(0) invert(1)", marginBottom: 48 }}
        />
        <h1
          style={{
            fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
            fontSize: "clamp(40px, 6vw, 72px)",
            lineHeight: 1,
            letterSpacing: "0.02em",
            marginBottom: 12,
          }}
        >
          Pitch Pages
        </h1>
        <p
          style={{
            fontSize: 16,
            fontWeight: 300,
            color: "rgba(245,244,240,0.55)",
            marginBottom: 60,
          }}
        >
          Select a team to view their personalised FeedMeLight pitch.
        </p>

        {Object.entries(grouped).map(([league, leagueTeams]) => (
          <div key={league} style={{ marginBottom: 48 }}>
            <div
              style={{
                fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                color: "#888",
                marginBottom: 16,
              }}
            >
              {league.toUpperCase()}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 2,
              }}
            >
              {leagueTeams.map((team) => {
                const slug = team.name
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                const logoUrl = getTeamLogoUrl(team.league, team.name);
                const displayName = getFullTeamName(
                  team.name,
                  team.metadata?.city ?? ""
                );
                return (
                  <Link
                    key={team.id}
                    href={`/pitch/${slug}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "18px 20px",
                      background: "#1a1a1a",
                      textDecoration: "none",
                      color: "#f5f4f0",
                      transition: "background 0.2s",
                    }}
                  >
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt={displayName}
                        style={{ height: 32, width: 32, objectFit: "contain" }}
                      />
                    )}
                    <span style={{ fontSize: 14, fontWeight: 400 }}>
                      {displayName}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
