import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const LEAGUE_CONFIG: Record<string, { text: string; bg: string; fg: string }> = {
  nfl: { text: "NFL", bg: "#013369", fg: "#FFFFFF" },
  nba: { text: "NBA", bg: "#1D428A", fg: "#FFFFFF" },
  mls: { text: "MLS", bg: "#231F20", fg: "#FFFFFF" },
  wnba: { text: "WNBA", bg: "#FF6A00", fg: "#FFFFFF" },
};

export async function GET(request: NextRequest) {
  const league = request.nextUrl.searchParams.get("league") || "nfl";
  const config = LEAGUE_CONFIG[league] || LEAGUE_CONFIG.nfl;

  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: config.bg,
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontSize: league === "wnba" ? 8 : 10,
            fontWeight: 700,
            color: config.fg,
            letterSpacing: "-0.5px",
          }}
        >
          {config.text}
        </span>
      </div>
    ),
    { width: 32, height: 32 }
  );
}
