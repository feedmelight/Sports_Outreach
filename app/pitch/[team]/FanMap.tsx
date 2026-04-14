"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface FanClub {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  member_count: number;
}

interface FanMapProps {
  teamId: string;
  primaryColor: string;
  secondaryColor: string;
  fanClubs: FanClub[];
  teamName: string;
}

// Country code → flag emoji
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...upper.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

export default function FanMap({
  primaryColor,
  secondaryColor,
  fanClubs,
  teamName,
}: FanMapProps) {
  const globeRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [visitedClubs, setVisitedClubs] = useState<FanClub[]>([]);
  const [paused, setPaused] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });

  const countries = useMemo(
    () => new Set(fanClubs.map((fc) => fc.country)).size,
    [fanClubs]
  );

  // Resize observer
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

  // Fly to a fan club
  const flyTo = useCallback(
    (idx: number) => {
      if (!globeRef.current || !fanClubs[idx]) return;
      const fc = fanClubs[idx];
      globeRef.current.pointOfView(
        { lat: fc.lat, lng: fc.lng, altitude: 1.8 },
        1200
      );
      setActiveIndex(idx);
      indexRef.current = idx;
      setVisitedClubs((prev) => {
        const next = [fc, ...prev.filter((c) => c.id !== fc.id)];
        return next.slice(0, 8);
      });
    },
    [fanClubs]
  );

  // Auto-advance timer
  useEffect(() => {
    if (!ready || paused || fanClubs.length === 0) return;

    // Initial fly
    if (indexRef.current === -1) {
      setTimeout(() => flyTo(0), 800);
    }

    timerRef.current = setInterval(() => {
      const next = (indexRef.current + 1) % fanClubs.length;
      flyTo(next);
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ready, paused, fanClubs, flyTo]);

  // Globe setup
  useEffect(() => {
    if (!globeRef.current || !ready) return;
    const globe = globeRef.current;

    // Disable auto-rotate (we control camera)
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = false;
      controls.enableZoom = true;
      controls.minDistance = 120;
      controls.maxDistance = 500;
    }

    // Initial view
    globe.pointOfView({ lat: 30, lng: 0, altitude: 2.5 }, 0);
  }, [ready]);

  // Point rendering
  const pointColor = useCallback(
    (d: object) => {
      const fc = d as FanClub;
      if (fc.id === fanClubs[activeIndex]?.id) return primaryColor;
      if (hoveredId === fc.id) return "#ffffff";
      return `${primaryColor}88`;
    },
    [activeIndex, hoveredId, fanClubs, primaryColor]
  );

  const pointAlt = useCallback(
    (d: object) => {
      const fc = d as FanClub;
      if (fc.id === fanClubs[activeIndex]?.id) return 0.08;
      return 0.01;
    },
    [activeIndex, fanClubs]
  );

  const pointRadius = useCallback(
    (d: object) => {
      const fc = d as FanClub;
      const base = Math.min(0.6, 0.15 + (fc.member_count / 3000) * 0.45);
      if (fc.id === fanClubs[activeIndex]?.id) return base * 2;
      return base;
    },
    [activeIndex, fanClubs]
  );

  // Ring data for active point
  const ringsData = useMemo(() => {
    const active = fanClubs[activeIndex];
    if (!active) return [];
    return [{ lat: active.lat, lng: active.lng }];
  }, [activeIndex, fanClubs]);

  return (
    <div>
      <style>{`
        .fanmap-wrap {
          position: relative;
          width: 100%;
          height: 620px;
          overflow: hidden;
          background: radial-gradient(ellipse at 60% 50%, rgba(15, 8, 12, 1) 0%, #060308 100%);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .fanmap-panel {
          position: absolute;
          top: 16px;
          right: 16px;
          bottom: 16px;
          width: 320px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          background: rgba(10, 6, 8, 0.88);
          backdrop-filter: blur(12px);
          border: 1px solid ${primaryColor}33;
          overflow: hidden;
        }
        .fanmap-panel-header {
          padding: 16px 20px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--fml-grey);
          flex-shrink: 0;
        }
        .fanmap-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: fanmapPulse 2s ease-in-out infinite;
        }
        @keyframes fanmapPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 4px #22c55e; }
          50% { opacity: 0.3; box-shadow: none; }
        }
        .fanmap-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
          scrollbar-width: none;
        }
        .fanmap-list::-webkit-scrollbar { display: none; }
        .fanmap-card {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          animation: fanmapSlideIn 0.3s ease-out;
          transition: background 0.2s;
          cursor: pointer;
        }
        .fanmap-card:hover {
          background: rgba(255,255,255,0.04);
        }
        .fanmap-card.active {
          background: ${primaryColor}15;
          border-left: 2px solid ${primaryColor};
        }
        @keyframes fanmapSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fanmap-card-name {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 0.04em;
          line-height: 1.1;
          color: var(--fml-white);
        }
        .fanmap-card-loc {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--fml-grey);
          margin-top: 4px;
        }
        .fanmap-card-members {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 16px;
          color: ${primaryColor};
          margin-top: 4px;
        }
        .fanmap-stats {
          position: absolute;
          bottom: 20px;
          left: 20px;
          z-index: 10;
          display: flex;
          gap: 32px;
        }
        .fanmap-stat-val {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 40px;
          line-height: 1;
          color: ${secondaryColor};
        }
        .fanmap-stat-label {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--fml-grey);
          margin-top: 2px;
        }
        @media (max-width: 900px) {
          .fanmap-wrap { height: 500px; }
          .fanmap-panel {
            position: absolute;
            top: auto;
            right: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 120px;
            flex-direction: row;
            overflow-x: auto;
          }
          .fanmap-panel-header { display: none; }
          .fanmap-list {
            display: flex;
            flex-direction: row;
            padding: 8px;
            gap: 8px;
          }
          .fanmap-card {
            min-width: 200px;
            flex-shrink: 0;
            border-bottom: none;
            border-right: 1px solid rgba(255,255,255,0.04);
          }
          .fanmap-stats { bottom: 136px; }
        }
      `}</style>

      <div className="fanmap-wrap" ref={containerRef}>
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl=""
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor={primaryColor}
          atmosphereAltitude={0.12}
          pointsData={fanClubs}
          pointLat={(d: object) => (d as FanClub).lat}
          pointLng={(d: object) => (d as FanClub).lng}
          pointColor={pointColor}
          pointAltitude={pointAlt}
          pointRadius={pointRadius}
          pointsMerge={false}
          ringsData={ringsData}
          ringLat={(d: object) => (d as { lat: number }).lat}
          ringLng={(d: object) => (d as { lng: number }).lng}
          ringColor={() => primaryColor}
          ringMaxRadius={3}
          ringPropagationSpeed={2}
          ringRepeatPeriod={1200}
          onPointHover={(d: object | null) => {
            if (d) {
              setPaused(true);
              const fc = d as FanClub;
              setHoveredId(fc.id);
              const idx = fanClubs.findIndex((f) => f.id === fc.id);
              if (idx >= 0) flyTo(idx);
            } else {
              setHoveredId(null);
              setPaused(false);
            }
          }}
          onGlobeReady={() => setReady(true)}
          width={dims.width}
          height={dims.height}
        />

        {/* Stats overlay */}
        <div className="fanmap-stats">
          <div>
            <div className="fanmap-stat-val">{fanClubs.length}</div>
            <div className="fanmap-stat-label">Fan Clubs</div>
          </div>
          <div>
            <div className="fanmap-stat-val">{countries}</div>
            <div className="fanmap-stat-label">Countries</div>
          </div>
          <div>
            <div className="fanmap-stat-val">
              {fanClubs.reduce((s, fc) => s + (fc.member_count || 0), 0) > 1000
                ? `${Math.round(fanClubs.reduce((s, fc) => s + (fc.member_count || 0), 0) / 1000)}k`
                : fanClubs.reduce((s, fc) => s + (fc.member_count || 0), 0)}
            </div>
            <div className="fanmap-stat-label">Members</div>
          </div>
        </div>

        {/* Right panel */}
        <div className="fanmap-panel">
          <div className="fanmap-panel-header">
            <div className="fanmap-live-dot" />
            Fan Network: Live
          </div>
          <div className="fanmap-list">
            {visitedClubs.map((fc) => (
              <div
                key={fc.id}
                className={`fanmap-card ${fc.id === fanClubs[activeIndex]?.id ? "active" : ""}`}
                onMouseEnter={() => {
                  setPaused(true);
                  const idx = fanClubs.findIndex((f) => f.id === fc.id);
                  if (idx >= 0) flyTo(idx);
                }}
                onMouseLeave={() => setPaused(false)}
              >
                <div className="fanmap-card-name">{fc.name}</div>
                <div className="fanmap-card-loc">
                  {countryFlag(fc.country)} {fc.city}, {fc.country}
                </div>
                {fc.member_count > 0 && (
                  <div className="fanmap-card-members">
                    {fc.member_count.toLocaleString()} members
                  </div>
                )}
              </div>
            ))}
            {visitedClubs.length === 0 && (
              <div
                style={{
                  padding: "20px",
                  fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
                  fontSize: 10,
                  color: "var(--fml-grey)",
                  letterSpacing: "0.1em",
                }}
              >
                Scanning {teamName} fan network...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
