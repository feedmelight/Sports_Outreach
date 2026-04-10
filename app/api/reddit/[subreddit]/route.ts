export const runtime = "edge";

const REDDIT_UA =
  "web:FeedMeLight-FanIntel:v1.0 (by /u/feedmelight, contact ben.leyland@feedmelight.com)";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ subreddit: string }> }
) {
  const { subreddit } = await params;

  if (!/^[A-Za-z0-9_]+$/.test(subreddit)) {
    return Response.json({ data: { children: [] } }, { status: 400 });
  }

  // Try JSON API with Reddit-compliant bot user-agent
  for (const domain of ["old.reddit.com", "www.reddit.com"]) {
    try {
      const res = await fetch(
        `https://${domain}/r/${subreddit}/new.json?limit=25&raw_json=1`,
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
        // Reddit sometimes returns HTML "Blocked" page even with 200
        if (text.startsWith("{")) {
          const data = JSON.parse(text);
          if (data?.data?.children?.length > 0) {
            return Response.json(data, {
              headers: {
                "Cache-Control": "s-maxage=120, stale-while-revalidate=60",
              },
            });
          }
        }
      }
    } catch {}
  }

  // Fallback: RSS feed (sometimes less restricted), parse to JSON-like shape
  try {
    const rssRes = await fetch(
      `https://www.reddit.com/r/${subreddit}/new.rss?limit=25`,
      {
        headers: { "User-Agent": REDDIT_UA, Accept: "application/xml" },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (rssRes.ok) {
      const xml = await rssRes.text();
      if (xml.includes("<entry>")) {
        const entries = xml.split("<entry>").slice(1);
        const children = entries.map((entry) => {
          const get = (tag: string) => {
            const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
            return m ? m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"') : "";
          };
          const id = (entry.match(/<id[^>]*>([^<]*)<\/id>/) || [])[1] || "";
          const link = (entry.match(/<link[^>]*href="([^"]*)"/) || [])[1] || "";
          const author = (entry.match(/<name>\/u\/([^<]*)<\/name>/) || [])[1] || "";
          const updated = get("updated");
          return {
            kind: "t3",
            data: {
              id: id.split("/").pop() || id,
              title: get("title"),
              author,
              created_utc: updated ? new Date(updated).getTime() / 1000 : Date.now() / 1000,
              score: 0,
              permalink: link.replace("https://www.reddit.com", ""),
              author_flair_text: null,
            },
          };
        });
        if (children.length > 0) {
          return Response.json(
            { data: { children } },
            {
              headers: {
                "Cache-Control": "s-maxage=120, stale-while-revalidate=60",
              },
            }
          );
        }
      }
    }
  } catch {}

  return Response.json({ data: { children: [] } });
}
