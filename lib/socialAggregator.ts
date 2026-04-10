import { franc } from 'franc-min'
import { teamTranslations, languageMeta, languageColors } from './teamTranslations'
import { resolveLocation, type ResolvedLocation } from './geoResolver'
import { SUBREDDIT_MAP } from './subredditMap'

export interface ChatterPost {
  id: string
  platform: 'reddit' | 'bluesky' | 'bilibili'
  text: string
  author: string
  timestamp: Date
  language: string
  languageFlag: string
  languageName: string
  languageColor: string
  location: string | null
  coords: ResolvedLocation | null
  engagement: number
  url: string
  isRTL: boolean
}

// Fetch Reddit via the edge proxy route (edge IPs aren't blocked by Reddit)
// In production, use the public alias; locally, use localhost
function getRedditProxyBase(): string {
  if (typeof window !== 'undefined') return ''
  // VERCEL_PROJECT_PRODUCTION_URL is the stable production alias (e.g. fml-pitch.vercel.app)
  // Unlike VERCEL_URL it has no deployment protection
  const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (prodUrl) return `https://${prodUrl}`
  return `http://localhost:${process.env.PORT || 3000}`
}

async function fetchSubreddit(subreddit: string): Promise<any> {
  const base = getRedditProxyBase()
  try {
    const res = await fetch(
      `${base}/api/reddit/${encodeURIComponent(subreddit)}`,
      { signal: AbortSignal.timeout(12000) }
    )
    if (res.ok) return res.json()
  } catch {}
  return { data: { children: [] } }
}

function parseRedditChildren(
  children: any[],
  seen: Set<string>,
  langOverride?: string
): Promise<ChatterPost>[] {
  return children
    .filter((child) => !seen.has(child.data?.id))
    .map(async (child) => {
      const p = child.data
      seen.add(p.id)
      const langRaw = langOverride ?? (franc(p.title, { minLength: 5 }) === 'und' ? 'en' : franc(p.title, { minLength: 5 }).slice(0, 2))
      const coords = await resolveLocation(p.author_flair_text, langRaw)
      return {
        id: `reddit-${p.id}`,
        platform: 'reddit' as const,
        text: p.title,
        author: `u/${p.author}`,
        timestamp: new Date(p.created_utc * 1000),
        language: langRaw,
        languageFlag: languageMeta[langRaw]?.flag ?? '🌐',
        languageName: languageMeta[langRaw]?.name ?? langRaw,
        languageColor: languageColors[langRaw] ?? languageColors.other,
        location: p.author_flair_text || null,
        coords,
        engagement: p.score,
        url: `https://reddit.com${p.permalink}`,
        isRTL: languageMeta[langRaw]?.rtl ?? false,
      }
    })
}

// REDDIT
async function fetchReddit(teamSlug: string, translations: Record<string, string[]>): Promise<ChatterPost[]> {
  const posts: ChatterPost[] = []
  const seen = new Set<string>()

  // Main subreddit(s) via proxy
  const subs = SUBREDDIT_MAP[teamSlug.toLowerCase()] || [teamSlug]
  const subResults = await Promise.allSettled(
    subs.map((sub) => fetchSubreddit(sub))
  )
  for (const result of subResults) {
    if (result.status !== 'fulfilled') continue
    const children = result.value?.data?.children?.slice(0, 15) || []
    const parsed = await Promise.allSettled(parseRedditChildren(children, seen))
    for (const p of parsed) if (p.status === 'fulfilled') posts.push(p.value)
  }

  // International subreddits via proxy
  const intlSubs = ['nflespanol', 'nflalemanha', 'nfl_france', 'nflbrasil', 'nfljapan', 'nba_es']
  const intlResults = await Promise.allSettled(
    intlSubs.map((sub) => fetchSubreddit(sub))
  )
  for (const result of intlResults) {
    if (result.status !== 'fulfilled') continue
    const children = result.value?.data?.children?.slice(0, 3) || []
    const parsed = await Promise.allSettled(parseRedditChildren(children, seen))
    for (const p of parsed) if (p.status === 'fulfilled') posts.push(p.value)
  }

  // Multilingual search terms — still use proxy for main sub, filter client-side
  // (Reddit search is not proxied since it uses /search.json, not /r/sub)
  // We get enough signal from subreddit posts + intl subs above

  return posts
}

// BLUESKY
async function fetchBluesky(teamName: string, translations: Record<string, string[]>): Promise<ChatterPost[]> {
  const posts: ChatterPost[] = []
  const seen = new Set<string>()

  const searches = [
    { lang: 'en', term: teamName },
    ...Object.entries(translations).map(([lang, terms]) => ({ lang, term: terms[0] }))
  ]

  await Promise.allSettled(
    searches.map(async ({ lang, term }) => {
      try {
        const data = await fetch(
          `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(term)}&limit=5`,
          { headers: { 'Accept': 'application/json', 'User-Agent': 'FeedMeLight-FanIntelligence/1.0' } }
        ).then(r => r.ok ? r.json() : { posts: [] })

        for (const post of data?.posts || []) {
          if (seen.has(post.uri)) continue
          seen.add(post.uri)

          let location: string | null = null
          try {
            const profile = await fetch(
              `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${post.author.did}`,
              { headers: { 'Accept': 'application/json' } }
            ).then(r => r.ok ? r.json() : null)
            location = profile?.location || null
          } catch {}

          const coords = await resolveLocation(location, lang)
          const detectedLang = franc(post.record?.text || '', { minLength: 5 })
          const finalLang = detectedLang === 'und' ? lang : detectedLang.slice(0, 2)

          posts.push({
            id: `bsky-${post.uri}`,
            platform: 'bluesky',
            text: post.record?.text || '',
            author: `@${post.author?.handle}`,
            timestamp: new Date(post.indexedAt),
            language: finalLang,
            languageFlag: languageMeta[finalLang]?.flag ?? '🌐',
            languageName: languageMeta[finalLang]?.name ?? finalLang,
            languageColor: languageColors[finalLang] ?? languageColors.other,
            location,
            coords,
            engagement: (post.likeCount || 0) + (post.repostCount || 0),
            url: `https://bsky.app/profile/${post.author?.handle}`,
            isRTL: languageMeta[finalLang]?.rtl ?? false,
          })
        }
      } catch {}
    })
  )
  return posts
}

// BILIBILI
async function fetchBilibili(translations: Record<string, string[]>): Promise<ChatterPost[]> {
  const posts: ChatterPost[] = []
  const searches = [
    { lang: 'zh', term: translations.zh?.[0] },
    { lang: 'ja', term: translations.ja?.[0] },
  ].filter(s => !!s.term) as { lang: string, term: string }[]

  for (const { lang, term } of searches) {
    try {
      const data = await fetch(
        `https://api.bilibili.com/x/web-interface/search/all/v2?keyword=${encodeURIComponent(term)}&search_type=video`
      ).then(r => r.json())

      const videos = data?.data?.result?.find((r: any) => r.result_type === 'video')?.data?.slice(0, 5) || []

      for (const item of videos) {
        let location: string | null = null
        let coords = null
        try {
          const userInfo = await fetch(
            `https://api.bilibili.com/x/space/acc/info?mid=${item.mid}`
          ).then(r => r.json())
          location = userInfo?.data?.location || null
          coords = await resolveLocation(location, lang)
        } catch {}

        posts.push({
          id: `bili-${item.bvid}`,
          platform: 'bilibili',
          text: item.title?.replace(/<[^>]+>/g, '') || '',
          author: item.author || '',
          timestamp: new Date(item.pubdate * 1000),
          language: lang,
          languageFlag: languageMeta[lang]?.flag ?? '🇨🇳',
          languageName: languageMeta[lang]?.name ?? lang,
          languageColor: languageColors[lang] ?? languageColors.other,
          location,
          coords,
          engagement: item.play || 0,
          url: `https://www.bilibili.com/video/${item.bvid}`,
          isRTL: false,
        })
      }
    } catch {}
  }
  return posts
}

// MAIN EXPORT
export async function fetchGlobalChatter(
  teamSlug: string,
  teamName: string
): Promise<ChatterPost[]> {
  const translations = teamTranslations[teamSlug.toLowerCase()] || {}
  const [r, b, bil] = await Promise.allSettled([
    fetchReddit(teamSlug, translations),
    fetchBluesky(teamName, translations),
    fetchBilibili(translations),
  ])
  const seen = new Set<string>()
  return [
    ...(r.status === 'fulfilled' ? r.value : []),
    ...(b.status === 'fulfilled' ? b.value : []),
    ...(bil.status === 'fulfilled' ? bil.value : []),
  ]
  .filter(p => p.text?.length > 5 && !seen.has(p.id) && seen.add(p.id))
  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Language and country counts for display
export function getChatterStats(posts: ChatterPost[]) {
  const languages = new Map<string, number>()
  const countries = new Set<string>()
  for (const p of posts) {
    languages.set(p.language, (languages.get(p.language) || 0) + 1)
    if (p.location) countries.add(p.location)
  }
  return {
    languageCount: languages.size,
    countryCount: countries.size,
    postCount: posts.length,
    languageBreakdown: Object.fromEntries(
      [...languages.entries()].sort((a, b) => b[1] - a[1])
    )
  }
}
