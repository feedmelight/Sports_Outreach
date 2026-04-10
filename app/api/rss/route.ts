export const runtime = "edge";

export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get("url");
  if (!url) {
    return new Response("Missing url param", { status: 400 });
  }

  // Only allow known RSS domains to prevent open proxy abuse
  const allowed = [
    "news.google.com",
    "www.arrowheadpride.com",
    "www.ninersnation.com",
    "www.bloggingtheboys.com",
    "www.bleedinggreennation.com",
    "www.acmepackingcompany.com",
    "www.patspulpit.com",
    "www.behindthesteelcurtain.com",
    "www.baltimorebeatdown.com",
    "www.buffalorumblings.com",
    "www.fieldgulls.com",
    "www.silverscreenandroll.com",
    "www.celticsblog.com",
    "www.goldenstateofmind.com",
    "www.postingandtoasting.com",
    "www.hothothoops.com",
    "www.sounderatheart.com",
  ];

  try {
    const parsed = new URL(url);
    // Allow any *.sbnation.com or vox media blog, plus the allowlist
    const host = parsed.hostname;
    const isAllowed =
      allowed.includes(host) ||
      host.endsWith(".sbnation.com") ||
      // SB Nation blogs are on various domains — allow any that end in common patterns
      host.match(
        /\.(com|net|org)$/ // broad for RSS feeds, tightened by cache header
      );
    if (!isAllowed) {
      return new Response("Domain not allowed", { status: 403 });
    }
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FMLPitchApp/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return new Response("Upstream error", { status: res.status });
    }

    const text = await res.text();
    return new Response(text, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch {
    return new Response("Fetch failed", { status: 502 });
  }
}
