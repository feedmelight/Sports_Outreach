"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { type ChatterPost } from "@/lib/socialAggregator";
import { languageMeta } from "@/lib/teamTranslations";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const WORLD_GEOJSON =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

interface FanClub {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  member_count: number;
}

interface LiveArc {
  id: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
}

interface HomeMarker {
  lat: number;
  lng: number;
  label: string;
  logoUrl: string;
}

interface GlobalChatterMapProps {
  teamId: string;
  teamSlug: string;
  teamName: string;
  primaryColor: string;
  secondaryColor: string;
  fanClubs: FanClub[];
  stadiumLat?: number;
  stadiumLng?: number;
  teamLogoUrl?: string;
}

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

// ─── Canvas-generated globe texture ────────────────────────────────
let cachedGeoJSON: any = null;

async function buildGlobeTexture(primaryColor: string): Promise<string> {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // White ocean
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, width, height);

  // Load GeoJSON (cache it)
  if (!cachedGeoJSON) {
    const res = await fetch(WORLD_GEOJSON);
    cachedGeoJSON = await res.json();
  }
  const world = cachedGeoJSON;

  // Equirectangular projection
  function project(lng: number, lat: number): [number, number] {
    return [(lng + 180) / 360 * width, (90 - lat) / 180 * height];
  }

  function tracePath(coordinates: number[][][]) {
    coordinates.forEach((ring) => {
      ring.forEach(([lng, lat], i) => {
        const [x, y] = project(lng, lat);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
    });
  }

  // Hex to HSL for tonal variation
  function hexToHSL(hex: string): [number, number, number] {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [h * 360, s * 100, l * 100];
  }

  const [baseH, baseS, baseL] = hexToHSL(primaryColor);

  // 1. Fill each country with tonal variation
  for (const feature of world.features) {
    const geom = feature.geometry;
    if (!geom) continue;

    // Deterministic variation from country name
    const name: string = feature.properties?.ADMIN || feature.properties?.NAME || feature.properties?.name || "";
    const seed = name.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const variation = (seed % 7) - 3; // range -3 to +3

    const l = Math.min(75, Math.max(25, baseL + variation * 4));
    const s = Math.min(100, Math.max(20, baseS - Math.abs(variation) * 2));
    ctx.fillStyle = `hsl(${baseH}, ${s}%, ${l}%)`;

    ctx.beginPath();
    if (geom.type === "Polygon") {
      tracePath(geom.coordinates);
    } else if (geom.type === "MultiPolygon") {
      geom.coordinates.forEach((poly: number[][][]) => tracePath(poly));
    }
    ctx.fill();
  }

  // 2. Graticule — faint minor lines every 10° (two between each 30° major)
  ctx.strokeStyle = "rgba(140,140,140,0.12)";
  ctx.lineWidth = 0.5;
  for (let lat = -90; lat <= 90; lat += 10) {
    if (lat % 30 === 0) continue; // skip major lines
    const [x1, y] = project(-180, lat);
    const [x2] = project(180, lat);
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  }
  for (let lng = -180; lng <= 180; lng += 10) {
    if (lng % 30 === 0) continue;
    ctx.beginPath();
    for (let lat = -90; lat <= 90; lat += 2) {
      const [x, y] = project(lng, lat);
      if (lat === -90) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Major lines every 30°
  ctx.strokeStyle = "rgba(120,120,120,0.2)";
  ctx.lineWidth = 0.6;
  for (let lat = -90; lat <= 90; lat += 30) {
    if (lat === 0) continue; // equator drawn separately
    const [x1, y] = project(-180, lat);
    const [x2] = project(180, lat);
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  }
  for (let lng = -180; lng <= 180; lng += 30) {
    ctx.beginPath();
    for (let lat = -90; lat <= 90; lat += 2) {
      const [x, y] = project(lng, lat);
      if (lat === -90) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Equator — slightly bolder
  ctx.strokeStyle = "rgba(120,120,120,0.35)";
  ctx.lineWidth = 0.9;
  const [ex1, ey] = project(-180, 0);
  const [ex2] = project(180, 0);
  ctx.beginPath(); ctx.moveTo(ex1, ey); ctx.lineTo(ex2, ey); ctx.stroke();

  // 3. Country borders LAST — white, on top of everything
  for (const feature of world.features) {
    const geom = feature.geometry;
    if (!geom) continue;
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 0.8;

    ctx.beginPath();
    if (geom.type === "Polygon") {
      tracePath(geom.coordinates);
    } else if (geom.type === "MultiPolygon") {
      geom.coordinates.forEach((poly: number[][][]) => tracePath(poly));
    }
    ctx.stroke();
  }

  return canvas.toDataURL();
}

// ─── Component ─────────────────────────────────────────────────────
export default function GlobalChatterMap({
  teamSlug,
  teamName,
  primaryColor,
  secondaryColor,
  fanClubs,
  stadiumLat,
  stadiumLng,
  teamLogoUrl,
}: GlobalChatterMapProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 620 });
  const [ready, setReady] = useState(false);
  const [textureUrl, setTextureUrl] = useState<string>("");

  const [posts, setPosts] = useState<ChatterPost[]>([]);
  const [liveArcs, setLiveArcs] = useState<LiveArc[]>([]);
  const [stats, setStats] = useState({
    languageCount: 0, countryCount: 0, postCount: 0,
    languageBreakdown: {} as Record<string, number>,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [altitude, setAltitude] = useState(1.2);
  const MIN_ALT = 0.7;
  const MAX_ALT = 2.5;
  const STEP = 0.25;
  const [activeTab, setActiveTab] = useState<"chatter" | "clubs">("chatter");
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const arcTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const PANEL_WIDTH = 340;
  const homeLat = stadiumLat ?? 39.1;
  const homeLng = stadiumLng ?? -94.6;

  // Build texture when primary color changes
  useEffect(() => {
    buildGlobeTexture(primaryColor).then(setTextureUrl);
  }, [primaryColor]);

  // Also update globe directly if it's already rendered
  useEffect(() => {
    if (globeRef.current && textureUrl) {
      globeRef.current.globeImageUrl(textureUrl);
    }
  }, [textureUrl]);

  // Team home marker
  const homeMarkers: HomeMarker[] = useMemo(() => {
    if (!stadiumLat || !stadiumLng) return [];
    return [{ lat: stadiumLat, lng: stadiumLng, label: teamName, logoUrl: teamLogoUrl || "" }];
  }, [stadiumLat, stadiumLng, teamName, teamLogoUrl]);

  // Resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setDims({ width, height });
    });
    ro.observe(el);
    setDims({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // Globe setup
  useEffect(() => {
    if (!globeRef.current || !ready) return;
    const globe = globeRef.current;
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableZoom = false;
    }
    globe.pointOfView({ lat: 35, lng: -95, altitude: 1.2 }, 0);
  }, [ready]);

  // Pause rotation on hover
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !globeRef.current) return;
    const pause = () => { if (globeRef.current?.controls()) globeRef.current.controls().autoRotate = false; };
    const resume = () => { if (globeRef.current?.controls()) globeRef.current.controls().autoRotate = true; };
    el.addEventListener("mouseover", pause);
    el.addEventListener("mouseout", resume);
    return () => { el.removeEventListener("mouseover", pause); el.removeEventListener("mouseout", resume); };
  }, [ready]);

  const flyTo = useCallback((lat: number, lng: number) => {
    if (!globeRef.current) return;
    globeRef.current.controls().autoRotate = false;
    globeRef.current.pointOfView({ lat, lng, altitude: 1.2 }, 1200);
    setTimeout(() => { if (globeRef.current?.controls()) globeRef.current.controls().autoRotate = true; }, 6000);
  }, []);

  const zoomIn = useCallback(() => {
    const next = Math.max(MIN_ALT, altitude - STEP);
    setAltitude(next);
    if (globeRef.current) {
      const pov = globeRef.current.pointOfView();
      globeRef.current.pointOfView({ lat: pov.lat, lng: pov.lng, altitude: next }, 350);
    }
  }, [altitude]);

  const zoomOut = useCallback(() => {
    const next = Math.min(MAX_ALT, altitude + STEP);
    setAltitude(next);
    if (globeRef.current) {
      const pov = globeRef.current.pointOfView();
      globeRef.current.pointOfView({ lat: pov.lat, lng: pov.lng, altitude: next }, 350);
    }
  }, [altitude]);

  // 24h cache
  const cacheKey = `fml-chatter-${teamSlug}`;
  const CACHE_TTL = 24 * 60 * 60 * 1000;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const cached = JSON.parse(raw);
        if (Date.now() - cached.ts < CACHE_TTL && cached.posts?.length > 0) {
          const restored = cached.posts.map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) }));
          setPosts(restored);
          const langs = new Map<string, number>();
          const locs = new Set<string>();
          for (const p of restored) { langs.set(p.language, (langs.get(p.language) || 0) + 1); if (p.location) locs.add(p.location); }
          setStats({ languageCount: langs.size, countryCount: locs.size, postCount: restored.length, languageBreakdown: Object.fromEntries([...langs.entries()].sort((a, b) => b[1] - a[1])) });
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadChatter = useCallback(async () => {
    try {
      const res = await fetch(`/api/chatter?slug=${encodeURIComponent(teamSlug)}&name=${encodeURIComponent(teamName)}`);
      const json = await res.json();
      const data: ChatterPost[] = (json.posts || []).map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) }));
      if (json.stats) setStats(json.stats);

      setPosts((prev) => {
        const cutoff = Date.now() - CACHE_TTL;
        const merged = new Map<string, ChatterPost>();
        for (const p of prev) { if (p.timestamp.getTime() > cutoff) merged.set(p.id, p); }
        for (const p of data) merged.set(p.id, p);
        const allPosts = [...merged.values()].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        try { localStorage.setItem(cacheKey, JSON.stringify({ posts: allPosts.slice(0, 100), ts: Date.now() })); } catch {}
        return allPosts;
      });

      const geolocated = data.filter((p) => p.coords);
      geolocated.slice(0, 12).forEach((post, i) => {
        setTimeout(() => {
          const arc: LiveArc = {
            id: `arc-${post.id}-${Date.now()}`,
            startLat: post.coords!.lat, startLng: post.coords!.lng,
            endLat: homeLat, endLng: homeLng, color: post.languageColor,
          };
          setLiveArcs((prev) => [...prev.slice(-15), arc]);
          const timer = setTimeout(() => { setLiveArcs((prev) => prev.filter((a) => a.id !== arc.id)); arcTimersRef.current.delete(arc.id); }, 5000);
          arcTimersRef.current.set(arc.id, timer);
        }, i * 800);
      });

      fetch("/api/log-chatter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: teamSlug, languageBreakdown: json.stats?.languageBreakdown || {}, platformBreakdown: { reddit: data.filter(p => p.platform === "reddit").length, bluesky: data.filter(p => p.platform === "bluesky").length, bilibili: data.filter(p => p.platform === "bilibili").length, blog: data.filter(p => p.platform === "blog").length, news: data.filter(p => p.platform === "news").length, espn: data.filter(p => p.platform === "espn").length }, postCount: json.stats?.postCount || 0, geolocatedCount: geolocated.length }),
      }).catch(() => {});
    } catch (e) { console.error("Chatter fetch failed:", e); } finally { setIsLoading(false); }
  }, [teamSlug, teamName, cacheKey, homeLat, homeLng]);

  useEffect(() => {
    loadChatter();
    intervalRef.current = setInterval(loadChatter, 45000);
    return () => { clearInterval(intervalRef.current); arcTimersRef.current.forEach((t) => clearTimeout(t)); };
  }, [loadChatter]);

  // Fan club point data
  const pointsData = useMemo(() =>
    fanClubs.map((fc) => ({
      lat: fc.lat, lng: fc.lng, name: fc.name, city: fc.city, country: fc.country, member_count: fc.member_count,
    })),
    [fanClubs]
  );

  // Platform → colour for pulsing rings on the globe
  const PLATFORM_COLORS: Record<string, string> = {
    reddit: '#FF4500',
    bluesky: '#0085FF',
    bilibili: '#00A1D6',
    blog: '#FF6719',
    news: '#4285F4',
    espn: '#D00000',
  };

  // Geolocated posts as pulsing rings
  const ringsData = useMemo(() =>
    posts
      .filter((p) => p.coords)
      .slice(0, 30)
      .map((p) => ({
        lat: p.coords!.lat,
        lng: p.coords!.lng,
        color: PLATFORM_COLORS[p.platform] || p.languageColor,
        id: p.id,
        platform: p.platform,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [posts]
  );

  const filteredPosts = activeLanguage ? posts.filter((p) => p.language === activeLanguage) : posts;
  const topLanguages = Object.entries(stats.languageBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // HTML element for team logo marker
  const createLogoElement = useCallback(
    (d: object) => {
      const marker = d as HomeMarker;
      const el = document.createElement("div");
      el.style.cssText = "position:relative;width:48px;height:48px;cursor:pointer;";

      const ring = document.createElement("div");
      ring.style.cssText = `position:absolute;top:-14px;left:-14px;width:76px;height:76px;border-radius:50%;border:2px solid ${primaryColor};opacity:0.6;animation:pulseRing 2s ease-out infinite;pointer-events:none;`;
      el.appendChild(ring);

      const circle = document.createElement("div");
      circle.style.cssText = `width:48px;height:48px;border-radius:50%;background:white;border:3px solid ${primaryColor};box-shadow:0 0 16px ${primaryColor}80,0 0 4px rgba(0,0,0,0.3);overflow:hidden;display:flex;align-items:center;justify-content:center;transition:transform 0.2s;`;
      if (marker.logoUrl) {
        circle.innerHTML = `<img src="${marker.logoUrl}" style="width:36px;height:36px;object-fit:contain;" />`;
      }
      circle.addEventListener("mouseover", () => { circle.style.transform = "scale(1.2)"; });
      circle.addEventListener("mouseout", () => { circle.style.transform = "scale(1)"; });
      circle.title = marker.label;
      el.appendChild(circle);
      return el;
    },
    [primaryColor]
  );

  return (
    <section style={{ background: "#f5f5f3", padding: "80px 60px", margin: "0 -60px", position: "relative" }}>
      <style>{`
        @keyframes chatterPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes chatterSlideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseRing { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.8); opacity: 0; } }
        .chatter-card { transition: background 0.2s, box-shadow 0.2s; }
        .chatter-card:hover { background: rgba(0,0,0,0.04) !important; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .chatter-tab:hover { background: rgba(0,0,0,0.04); }
        .chatter-lang-btn:hover { border-color: rgba(0,0,0,0.25) !important; }
        .chatter-scroll::-webkit-scrollbar { display: none; }
        .chatter-scroll { scrollbar-width: none; }
      `}</style>

      {/* Header — dark text on light bg */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: primaryColor, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "chatterPulse 2s infinite" }} />
          Live Fan Intelligence
        </div>
        <h2 style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: "clamp(48px, 6vw, 90px)", lineHeight: 0.92, color: "#1a1a1a", marginBottom: 16 }}>
          The World Is<br /><span style={{ color: primaryColor }}>Watching</span>
        </h2>
        <p style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "#888" }}>
          {isLoading ? "Scanning global fan channels..." : `Live signal in ${stats.languageCount} languages · ${stats.countryCount} locations · ${stats.postCount} fan posts`}
        </p>
      </div>

      {/* Map + Panel */}
      <div style={{ position: "relative", height: 620, overflow: "hidden", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

        {/* Globe */}
        <div ref={containerRef} style={{ position: "absolute", inset: 0, background: "#f0f0f0", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: -(PANEL_WIDTH / 2), width: dims.width, height: dims.height }}>
            {textureUrl && (
              <Globe
                ref={globeRef}
                globeImageUrl={textureUrl}
                backgroundImageUrl=""
                backgroundColor="rgba(0,0,0,0)"
                atmosphereColor="#cccccc"
                atmosphereAltitude={0.08}
                showGraticules={false}
                // Fan club points — white dots
                pointsData={pointsData}
                pointLat={(d: object) => (d as any).lat}
                pointLng={(d: object) => (d as any).lng}
                pointColor={() => "#ffffff"}
                pointAltitude={() => 0.015}
                pointRadius={() => 0.3}
                pointsMerge={false}
                pointLabel={(d: object) => {
                  const p = d as any;
                  return `<div style="font-family:'DM Mono',monospace;font-size:11px;background:rgba(0,0,0,0.85);color:white;padding:6px 10px;border-left:3px solid ${primaryColor};border-radius:2px;">${p.name}<br/><span style="opacity:0.6">${p.city}, ${p.country}</span></div>`;
                }}
                // Live arcs
                arcsData={liveArcs}
                arcStartLat={(d: object) => (d as LiveArc).startLat}
                arcStartLng={(d: object) => (d as LiveArc).startLng}
                arcEndLat={() => homeLat}
                arcEndLng={() => homeLng}
                arcColor={(d: object) => (d as LiveArc).color}
                arcAltitude={0.3}
                arcStroke={0.5}
                arcDashLength={0.4}
                arcDashGap={0.2}
                arcDashAnimateTime={2000}
                // Team logo at home city
                htmlElementsData={homeMarkers}
                htmlLat={(d: object) => (d as HomeMarker).lat}
                htmlLng={(d: object) => (d as HomeMarker).lng}
                htmlElement={createLogoElement}
                htmlAltitude={0.05}
                // Pulsing rings for geolocated chatter posts
                ringsData={ringsData}
                ringLat={(d: object) => (d as any).lat}
                ringLng={(d: object) => (d as any).lng}
                ringColor={(d: object) => [(d as any).color]}
                ringMaxRadius={3}
                ringPropagationSpeed={2}
                ringRepeatPeriod={1400}
                ringAltitude={0.01}
                onGlobeReady={() => setReady(true)}
                width={dims.width}
                height={dims.height}
              />
            )}
          </div>
        </div>

        {/* Right panel — white frosted glass */}
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: PANEL_WIDTH, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderLeft: `2px solid ${primaryColor}20`, display: "flex", flexDirection: "column", zIndex: 10 }}>
          <div style={{ padding: "16px 16px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
              {(["chatter", "clubs"] as const).map((tab) => (
                <button key={tab} className="chatter-tab" onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: 8, background: activeTab === tab ? primaryColor : "transparent", color: activeTab === tab ? "#fff" : "#888", border: "none", fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s", borderRadius: 3 }}>
                  {tab === "chatter" ? "Live Chatter" : `Fan Clubs (${fanClubs.length})`}
                </button>
              ))}
            </div>
            {activeTab === "chatter" && topLanguages.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingBottom: 12 }}>
                {topLanguages.map(([lang, count]) => (
                  <button key={lang} className="chatter-lang-btn" onClick={() => setActiveLanguage(activeLanguage === lang ? null : lang)} style={{ padding: "3px 8px", background: activeLanguage === lang ? primaryColor : "rgba(0,0,0,0.04)", border: `1px solid ${activeLanguage === lang ? primaryColor : "rgba(0,0,0,0.1)"}`, borderRadius: 3, color: activeLanguage === lang ? "#fff" : "#555", fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    {languageMeta[lang]?.flag} {count}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="chatter-scroll" style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {isLoading && <div style={{ color: "#999", fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 11, textAlign: "center", padding: "40px 0" }}>Scanning global fan channels...</div>}

            {activeTab === "chatter" && filteredPosts.slice(0, 20).map((post, i) => (
              <div key={post.id} className="chatter-card" onClick={() => { if (post.coords) flyTo(post.coords.lat, post.coords.lng); }} style={{ display: "block", padding: 12, marginBottom: 8, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", borderLeft: `3px solid ${post.languageColor}`, cursor: post.coords ? "pointer" : "default", borderRadius: 3, direction: post.isRTL ? "rtl" : "ltr", animation: `chatterSlideDown 0.3s ease ${i * 0.05}s both` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{post.languageFlag}</span>
                  <span style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 9, color: PLATFORM_COLORS[post.platform] || post.languageColor, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{post.platform}</span>
                  {post.location && <span style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 9, color: "#999", marginLeft: "auto" }}>{post.location.split(",")[0]}</span>}
                </div>
                <div style={{ fontSize: 12, color: "#1a1a1a", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{post.text.slice(0, 100)}{post.text.length > 100 ? "..." : ""}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 9, color: "#aaa" }}>{post.author}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 9, color: "#aaa" }}>{post.engagement > 0 ? `+${post.engagement}` : ""}</span>
                    <a href={post.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 9, color: post.languageColor, textDecoration: "none" }}>↗</a>
                  </span>
                </div>
              </div>
            ))}

            {activeTab === "clubs" && fanClubs.map((club) => (
              <div key={club.id} className="chatter-card" onClick={() => flyTo(club.lat, club.lng)} style={{ padding: 12, marginBottom: 8, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", borderLeft: `3px solid ${primaryColor}`, cursor: "pointer", borderRadius: 3 }}>
                <div style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: 16, color: "#1a1a1a", letterSpacing: "0.04em", marginBottom: 4 }}>{club.name}</div>
                <div style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 10, color: "#888" }}>{countryFlag(club.country)} {club.city}, {club.country}{club.member_count ? ` · ${club.member_count.toLocaleString()} members` : ""}</div>
              </div>
            ))}

            {!isLoading && activeTab === "chatter" && filteredPosts.length === 0 && (
              <div style={{ color: "#999", fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 11, textAlign: "center", padding: "40px 0" }}>No chatter found yet. Channels scanning...</div>
            )}
          </div>

          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(0,0,0,0.06)", fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 9, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "chatterPulse 2s infinite" }} />
            FML Fan Intelligence · Live
          </div>
        </div>

        {/* Zoom buttons */}
        <div style={{ position: "absolute", bottom: 80, left: 24, display: "flex", flexDirection: "column", gap: 2, zIndex: 10 }}>
          {[
            { label: "+", fn: zoomIn, disabled: altitude <= MIN_ALT },
            { label: "−", fn: zoomOut, disabled: altitude >= MAX_ALT },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.fn}
              disabled={btn.disabled}
              style={{
                width: 36, height: 36,
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 2,
                color: btn.disabled ? "rgba(0,0,0,0.2)" : primaryColor,
                fontSize: 20, fontWeight: 300, lineHeight: 1,
                cursor: btn.disabled ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Stats pill */}
        <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 10, display: "flex", gap: 24, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", padding: "12px 20px", borderRadius: 4, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          {[{ val: fanClubs.length, label: "Fan Clubs" }, { val: new Set(fanClubs.map((fc) => fc.country)).size, label: "Countries" }, { val: stats.languageCount || "—", label: "Languages" }].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: 28, lineHeight: 1, color: primaryColor }}>{s.val}</div>
              <div style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#888" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tag */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <p style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: primaryColor }}>We Know Where Your Fans Are</p>
      </div>
    </section>
  );
}
