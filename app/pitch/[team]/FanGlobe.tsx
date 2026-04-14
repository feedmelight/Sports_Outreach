"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import type { FanMarker } from "@/lib/fanData";
import { getArcColor } from "@/lib/arcColors";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface Props {
  markers: FanMarker[];
  primaryColor: string;
  accentColor: string;
  teamName: string;
  stadiumLat?: number;
  stadiumLng?: number;
}

const KIND_COLORS: Record<string, string> = {
  fan_club: "#ff6b6b",
  sports_bar: "#ff9900",
  mascot: "#22d3ee",
};

export default function FanGlobe({
  markers,
  primaryColor,
  accentColor,
  teamName,
  stadiumLat,
  stadiumLng,
}: Props) {
  const globeRef = useRef<any>(null);
  const [hovered, setHovered] = useState<FanMarker | null>(null);
  const [ready, setReady] = useState(false);

  // Set initial view and start rotating on globe ready
  const hasInitialised = useRef(false);
  const onGlobeReady = useCallback(() => {
    setReady(true);
    if (!globeRef.current || hasInitialised.current) return;
    hasInitialised.current = true;
    const globe = globeRef.current;

    // Start centred on UK, rotating immediately
    globe.pointOfView({ lat: 52, lng: -1, altitude: 2.5 }, 0);

    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
      controls.enableZoom = true;
      controls.minDistance = 120;
      controls.maxDistance = 500;
    }
  }, []);

  const pointColor = useCallback(
    (d: object) => {
      const m = d as FanMarker;
      if (m.kind === "fan_club") return primaryColor;
      return KIND_COLORS[m.kind] || accentColor;
    },
    [primaryColor, accentColor]
  );

  const pointAltitude = useCallback((d: object) => {
    const m = d as FanMarker;
    if (m.kind === "fan_club") {
      const members = m.memberCount || 100;
      return Math.min(0.12, 0.02 + (members / 5000) * 0.1);
    }
    return 0.01;
  }, []);

  const pointRadius = useCallback((d: object) => {
    const m = d as FanMarker;
    if (m.kind === "fan_club") {
      const members = m.memberCount || 100;
      return Math.min(0.8, 0.2 + (members / 3000) * 0.6);
    }
    return 0.15;
  }, []);

  // Stats
  const fanClubCount = useMemo(
    () => markers.filter((m) => m.kind === "fan_club").length,
    [markers]
  );
  const countries = useMemo(
    () =>
      new Set(
        markers.filter((m) => m.kind === "fan_club").map((m) => m.country)
      ).size,
    [markers]
  );
  const totalMembers = useMemo(
    () =>
      markers
        .filter((m) => m.kind === "fan_club")
        .reduce((sum, m) => sum + (m.memberCount || 0), 0),
    [markers]
  );

  // Build arcs from stadium to each fan club
  interface ArcPoint {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    idx: number;
  }

  const allArcs = useMemo(() => {
    if (!stadiumLat || !stadiumLng) return [];
    return markers
      .filter((m) => m.kind === "fan_club")
      .map((m, i) => ({
        startLat: stadiumLat,
        startLng: stadiumLng,
        endLat: m.lat,
        endLng: m.lng,
        idx: i,
      }));
  }, [markers, stadiumLat, stadiumLng]);

  // Staggered accumulation: add arcs one at a time over ~8 seconds
  const [visibleArcs, setVisibleArcs] = useState<ArcPoint[]>([]);

  useEffect(() => {
    if (!allArcs.length) return;
    setVisibleArcs([]);
    let i = 0;
    const interval = setInterval(() => {
      setVisibleArcs((prev) => [...prev, allArcs[i]]);
      i++;
      if (i >= allArcs.length) clearInterval(interval);
    }, Math.min(180, 8000 / allArcs.length));
    return () => clearInterval(interval);
  }, [allArcs]);

  // Arc color callback using team palette
  const arcColor = useCallback(
    (d: object) => {
      const arc = d as ArcPoint;
      return getArcColor(primaryColor, accentColor, arc.idx, 0.75);
    },
    [primaryColor, accentColor]
  );

  // Per-arc dash offset for visual stagger
  const arcDashOffset = useCallback((d: object) => {
    const arc = d as ArcPoint;
    return (arc.idx % 8) * 0.12;
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        .globe-container {
          width: 100%;
          height: 600px;
          position: relative;
          overflow: hidden;
          background: radial-gradient(ellipse at center, #0f0810 0%, #060308 100%);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .globe-container canvas {
          cursor: grab;
        }
        .globe-container canvas:active {
          cursor: grabbing;
        }
        .globe-stats {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .globe-stat {
          display: flex;
          flex-direction: column;
        }
        .globe-stat-val {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 36px;
          line-height: 1;
          letter-spacing: 0.04em;
        }
        .globe-stat-label {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--fml-grey);
          margin-top: 2px;
        }
        .globe-legend {
          position: absolute;
          bottom: 24px;
          left: 24px;
          z-index: 10;
          display: flex;
          gap: 16px;
        }
        .globe-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--fml-grey);
        }
        .globe-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .globe-tooltip {
          position: absolute;
          z-index: 20;
          top: 24px;
          right: 24px;
          max-width: 280px;
          background: rgba(10, 8, 6, 0.92);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 16px;
          backdrop-filter: blur(8px);
          pointer-events: none;
        }
        .globe-tooltip-name {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }
        .globe-tooltip-city {
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--fml-grey);
          margin-bottom: 8px;
        }
        .globe-tooltip-desc {
          font-size: 12px;
          font-weight: 300;
          line-height: 1.5;
          color: rgba(245,244,240,0.55);
        }
        .globe-tooltip-members {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 24px;
          margin-top: 8px;
        }
        .globe-live {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .globe-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: livePulse 2s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @media (max-width: 900px) {
          .globe-container { height: 400px; }
          .globe-stats { top: 16px; left: 16px; }
          .globe-legend { bottom: 16px; left: 16px; }
        }
      `}</style>

      <div className="globe-container">
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl=""
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor={primaryColor}
          atmosphereAltitude={0.15}
          pointsData={markers}
          pointLat={(d: object) => (d as FanMarker).lat}
          pointLng={(d: object) => (d as FanMarker).lng}
          pointColor={pointColor}
          pointAltitude={pointAltitude}
          pointRadius={pointRadius}
          pointsMerge={false}
          onPointHover={(d: object | null) =>
            setHovered(d ? (d as FanMarker) : null)
          }
          arcsData={visibleArcs}
          arcStartLat={(d: object) => (d as ArcPoint).startLat}
          arcStartLng={(d: object) => (d as ArcPoint).startLng}
          arcEndLat={(d: object) => (d as ArcPoint).endLat}
          arcEndLng={(d: object) => (d as ArcPoint).endLng}
          arcColor={arcColor}
          arcDashLength={0.35}
          arcDashGap={0.65}
          arcDashAnimateTime={1800}
          arcStroke={0.5}
          arcAltitude={0.18}
          arcAltitudeAutoScale={0.4}
          arcDashInitialGap={arcDashOffset}
          onGlobeReady={onGlobeReady}
          width={typeof window !== "undefined" ? Math.min(window.innerWidth - 120, 1200) : 1200}
          height={600}
        />

        {/* Stats overlay */}
        <div className="globe-stats">
          <div className="globe-stat">
            <div className="globe-stat-val" style={{ color: accentColor }}>
              {fanClubCount}
            </div>
            <div className="globe-stat-label">Fan Clubs</div>
          </div>
          <div className="globe-stat">
            <div className="globe-stat-val" style={{ color: accentColor }}>
              {countries}
            </div>
            <div className="globe-stat-label">Countries</div>
          </div>
          <div className="globe-stat">
            <div className="globe-stat-val" style={{ color: accentColor }}>
              {totalMembers > 1000
                ? `${(totalMembers / 1000).toFixed(0)}k`
                : totalMembers}
            </div>
            <div className="globe-stat-label">Total Members</div>
          </div>
        </div>

        {/* Live indicator (only when no tooltip) */}
        {!hovered && (
          <div className="globe-live">
            <div
              className="globe-live-dot"
              style={{ background: primaryColor }}
            />
            <span style={{ color: primaryColor }}>Live Fan Map</span>
          </div>
        )}

        {/* Tooltip */}
        {hovered && (
          <div className="globe-tooltip">
            <div
              className="globe-tooltip-name"
              style={{ color: accentColor }}
            >
              {hovered.name}
            </div>
            <div className="globe-tooltip-city">
              {hovered.city}
              {hovered.country ? `, ${hovered.country}` : ""}
            </div>
            {hovered.description && (
              <div className="globe-tooltip-desc">{hovered.description}</div>
            )}
            {hovered.memberCount && (
              <div
                className="globe-tooltip-members"
                style={{ color: accentColor }}
              >
                {hovered.memberCount.toLocaleString()} members
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="globe-legend">
          <div className="globe-legend-item">
            <div
              className="globe-legend-dot"
              style={{ background: primaryColor }}
            />
            {teamName} Fans
          </div>
          <div className="globe-legend-item">
            <div
              className="globe-legend-dot"
              style={{ background: "#ff9900" }}
            />
            Sports Bars
          </div>
          <div className="globe-legend-item">
            <div
              className="globe-legend-dot"
              style={{ background: "#22d3ee" }}
            />
            Mascots
          </div>
        </div>
      </div>
    </div>
  );
}
