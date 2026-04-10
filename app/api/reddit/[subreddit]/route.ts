export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ subreddit: string }> }
) {
  const { subreddit } = await params;

  // Sanitise — only allow alphanumeric + underscore
  if (!/^[A-Za-z0-9_]+$/.test(subreddit)) {
    return Response.json({ data: { children: [] } }, { status: 400 });
  }

  // Try public JSON API from edge (distributed IPs, less likely to be blocked)
  for (const domain of ["old.reddit.com", "www.reddit.com"]) {
    try {
      const res = await fetch(
        `https://${domain}/r/${subreddit}/new.json?limit=25`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; FMLPitchApp/1.0)",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(8000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.children?.length > 0) {
          return Response.json(data, {
            headers: {
              "Cache-Control": "s-maxage=120, stale-while-revalidate=60",
            },
          });
        }
      }
    } catch {}
  }

  return Response.json({ data: { children: [] } });
}
