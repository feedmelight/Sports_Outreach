import { franc } from 'franc-min'
import { teamTranslations, languageMeta, languageColors } from './teamTranslations'
import { resolveLocation, type ResolvedLocation } from './geoResolver'
import { SUBREDDIT_MAP } from './subredditMap'
import { sbNationFeeds, espnTeamIds } from './rssFeeds'

export interface ChatterPost {
  id: string
  platform: 'reddit' | 'bluesky' | 'bilibili' | 'blog' | 'news' | 'espn'
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

// Edge proxy base URL — production alias (no deployment protection) or localhost
function getProxyBase(): string {
  if (typeof window !== 'undefined') return ''
  const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (prodUrl) return `https://${prodUrl}`
  return `http://localhost:${process.env.PORT || 3000}`
}

async function fetchSubreddit(subreddit: string): Promise<any> {
  const base = getProxyBase()
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

// Helper: extract text content from an XML tag (server-side, no DOMParser)
function xmlTag(xml: string, tag: string): string {
  // Handle both <tag>text</tag> and CDATA
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`)
  const m = xml.match(re)
  return m ? m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim() : ''
}

// FAN BLOGS (SB Nation RSS)
async function fetchFanBlogs(teamSlug: string): Promise<ChatterPost[]> {
  const feedUrl = sbNationFeeds[teamSlug.toLowerCase()]
  if (!feedUrl) return []

  const base = getProxyBase()
  // Try primary URL, then /rss/ fallback
  const urls = [feedUrl, feedUrl.replace('/rss/index.xml', '/rss/')]
  let text = ''
  for (const url of urls) {
    try {
      const res = await fetch(
        `${base}/api/rss?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(8000) }
      )
      if (res.ok) {
        text = await res.text()
        if (text.includes('<item>') || text.includes('<entry>')) break
        text = ''
      }
    } catch {}
  }
  if (!text) return []

  try {

    // Handle both RSS (<item>) and Atom (<entry>) feeds
    const isAtom = text.includes('<entry>')
    const splitTag = isAtom ? '<entry>' : '<item>'
    const items = text.split(splitTag).slice(1, 11)
    return items.map((item) => {
      const title = xmlTag(item, 'title')
      // Atom uses <link href="..."/>, RSS uses <link>url</link>
      const link = isAtom
        ? (item.match(/<link[^>]*href="([^"]*)"/) || [])[1] || ''
        : xmlTag(item, 'link')
      const pubDate = isAtom ? xmlTag(item, 'updated') || xmlTag(item, 'published') : xmlTag(item, 'pubDate')
      const author = xmlTag(item, 'name') || xmlTag(item, 'dc:creator') || xmlTag(item, 'author') || 'Fan Blog'
      const guid = xmlTag(item, isAtom ? 'id' : 'guid') || link || `${Date.now()}-${Math.random()}`
      const lang = franc(title, { minLength: 5 }) === 'und' ? 'en' : franc(title, { minLength: 5 }).slice(0, 2)

      return {
        id: `blog-${Buffer.from(guid).toString('base64url').slice(0, 24)}`,
        platform: 'blog' as const,
        text: title,
        author,
        timestamp: pubDate ? new Date(pubDate) : new Date(),
        language: lang,
        languageFlag: languageMeta[lang]?.flag ?? '🌐',
        languageName: languageMeta[lang]?.name ?? lang,
        languageColor: languageColors[lang] ?? languageColors.other,
        location: null,
        coords: null,
        engagement: 0,
        url: link,
        isRTL: languageMeta[lang]?.rtl ?? false,
      }
    })
  } catch {
    return []
  }
}

// GOOGLE NEWS RSS
async function fetchGoogleNews(teamName: string): Promise<ChatterPost[]> {
  const query = encodeURIComponent(teamName)
  const feedUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`

  const base = getProxyBase()
  try {
    const res = await fetch(
      `${base}/api/rss?url=${encodeURIComponent(feedUrl)}`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) return []
    const text = await res.text()

    const items = text.split('<item>').slice(1, 11)
    return items.map((item) => {
      const title = xmlTag(item, 'title')
      const link = xmlTag(item, 'link')
      const pubDate = xmlTag(item, 'pubDate')
      const source = xmlTag(item, 'source') || 'News'
      const guid = xmlTag(item, 'guid') || link || `${Date.now()}-${Math.random()}`
      const lang = franc(title, { minLength: 5 }) === 'und' ? 'en' : franc(title, { minLength: 5 }).slice(0, 2)

      return {
        id: `news-${Buffer.from(guid).toString('base64url').slice(0, 24)}`,
        platform: 'news' as const,
        text: title,
        author: source,
        timestamp: pubDate ? new Date(pubDate) : new Date(),
        language: lang,
        languageFlag: languageMeta[lang]?.flag ?? '🌐',
        languageName: languageMeta[lang]?.name ?? lang,
        languageColor: languageColors[lang] ?? languageColors.other,
        location: null,
        coords: null,
        engagement: 0,
        url: link,
        isRTL: languageMeta[lang]?.rtl ?? false,
      }
    })
  } catch {
    return []
  }
}

// ESPN NEWS (free JSON API, team-specific)
async function fetchESPN(teamSlug: string): Promise<ChatterPost[]> {
  const team = espnTeamIds[teamSlug.toLowerCase()]
  if (!team) return []

  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${team.sport}/${team.league}/news?team=${team.id}`,
      {
        headers: { 'Accept': 'application/json', 'User-Agent': 'FeedMeLight-FanIntelligence/1.0' },
        signal: AbortSignal.timeout(8000),
      }
    )
    if (!res.ok) return []
    const data = await res.json()

    return (data?.articles || []).slice(0, 10).map((article: any) => {
      const lang = franc(article.headline || '', { minLength: 5 }) === 'und' ? 'en' : franc(article.headline || '', { minLength: 5 }).slice(0, 2)
      return {
        id: `espn-${article.id || Math.random()}`,
        platform: 'espn' as const,
        text: article.headline || article.description || '',
        author: article.byline || 'ESPN',
        timestamp: new Date(article.published || Date.now()),
        language: lang,
        languageFlag: languageMeta[lang]?.flag ?? '🌐',
        languageName: languageMeta[lang]?.name ?? lang,
        languageColor: languageColors[lang] ?? languageColors.other,
        location: null,
        coords: null,
        engagement: 0,
        url: article.links?.web?.href || article.links?.api?.news?.href || '',
        isRTL: languageMeta[lang]?.rtl ?? false,
      }
    })
  } catch {
    return []
  }
}

// MAIN EXPORT
export async function fetchGlobalChatter(
  teamSlug: string,
  teamName: string
): Promise<ChatterPost[]> {
  const translations = teamTranslations[teamSlug.toLowerCase()] || {}
  const [r, b, bil, blogs, news, espn] = await Promise.allSettled([
    fetchReddit(teamSlug, translations),
    fetchBluesky(teamName, translations),
    fetchBilibili(translations),
    fetchFanBlogs(teamSlug),
    fetchGoogleNews(teamName),
    fetchESPN(teamSlug),
  ])
  const seen = new Set<string>()
  return [
    ...(r.status === 'fulfilled' ? r.value : []),
    ...(b.status === 'fulfilled' ? b.value : []),
    ...(bil.status === 'fulfilled' ? bil.value : []),
    ...(blogs.status === 'fulfilled' ? blogs.value : []),
    ...(news.status === 'fulfilled' ? news.value : []),
    ...(espn.status === 'fulfilled' ? espn.value : []),
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
