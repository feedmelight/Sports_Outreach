export const runtime = "edge";

const REDDIT_UA =
  "web:FeedMeLight-FanIntel:v1.0 (by /u/feedmelight, contact ben.leyland@feedmelight.com)";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  if (!q) {
    return Response.json({ data: { children: [] } }, { status: 400 });
  }

  for (const domain of ["old.reddit.com", "www.reddit.com"]) {
    try {
      const res = await fetch(
        `https://${domain}/search.json?q=${encodeURIComponent(q)}&sort=relevance&t=year&limit=25&raw_json=1`,
        {
          headers: {
            "User-Agent": REDDIT_UA,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(8000),
        }
      );
      if (res.ok) {
        const text = await res.text();
        if (text.startsWith("{")) {
          const data = JSON.parse(text);
          if (data?.data?.children?.length > 0) {
            return Response.json(data, {
              headers: {
                "Cache-Control": "s-maxage=300, stale-while-revalidate=120",
              },
            });
          }
        }
      }
    } catch {}
  }

  return Response.json({ data: { children: [] } });
}
