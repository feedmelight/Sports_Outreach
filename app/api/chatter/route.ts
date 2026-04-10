import { NextRequest, NextResponse } from "next/server";
import { fetchGlobalChatter, getChatterStats } from "@/lib/socialAggregator";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "";
  const name = req.nextUrl.searchParams.get("name") || "";

  if (!slug) {
    return NextResponse.json({ posts: [], stats: null }, { status: 400 });
  }

  try {
    const posts = await fetchGlobalChatter(slug, name);
    const stats = getChatterStats(posts);

    // Count by platform for debugging
    const platforms: Record<string, number> = {};
    for (const p of posts) platforms[p.platform] = (platforms[p.platform] || 0) + 1;
    console.log(`[chatter] ${slug}: ${posts.length} posts`, platforms);

    // Serialize dates for JSON transport
    const serialized = posts.map((p) => ({
      ...p,
      timestamp: p.timestamp.toISOString(),
      coords: p.coords || null,
    }));

    return NextResponse.json({ posts: serialized, stats, _debug: { platforms } });
  } catch (e) {
    console.error("Chatter API error:", e);
    return NextResponse.json({ posts: [], stats: null }, { status: 500 });
  }
}
