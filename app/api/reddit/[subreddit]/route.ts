import { NextRequest, NextResponse } from "next/server";

const REDDIT_UA =
  "web:FeedMeLight-FanIntel:v1.0 (by /u/feedmelight, contact ben.leyland@feedmelight.com)";

let redditToken: string | null = null;
let redditTokenExpiry = 0;

async function getRedditToken(): Promise<string | null> {
  if (redditToken && Date.now() < redditTokenExpiry) return redditToken;
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  try {
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": REDDIT_UA,
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) return null;
    const data = await res.json();
    redditToken = data.access_token;
    redditTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return redditToken;
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ subreddit: string }> }
) {
  const { subreddit } = await params;

  // Sanitise — only allow alphanumeric + underscore
  if (!/^[A-Za-z0-9_]+$/.test(subreddit)) {
    return NextResponse.json({ data: { children: [] } }, { status: 400 });
  }

  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=25`;

  // Try OAuth first
  const token = await getRedditToken();
  if (token) {
    try {
      const oauthUrl = url.replace(
        "https://www.reddit.com",
        "https://oauth.reddit.com"
      );
      const res = await fetch(oauthUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": REDDIT_UA,
        },
        next: { revalidate: 120 },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.children?.length > 0) {
          return NextResponse.json(data, {
            headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=60" },
          });
        }
      }
    } catch {}
  }

  // Fallback to public JSON API
  for (const domain of ["old.reddit.com", "www.reddit.com"]) {
    try {
      const tryUrl = url.replace("https://www.reddit.com", `https://${domain}`);
      const res = await fetch(tryUrl, {
        headers: { "User-Agent": REDDIT_UA, Accept: "application/json" },
        next: { revalidate: 120 },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.children?.length > 0) {
          return NextResponse.json(data, {
            headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=60" },
          });
        }
      }
    } catch {}
  }

  return NextResponse.json({ data: { children: [] } });
}
