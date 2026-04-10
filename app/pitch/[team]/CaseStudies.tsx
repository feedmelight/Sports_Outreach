"use client";

import { useState } from "react";
import { CaseStudy } from "@/lib/caseStudies";
import FadeUp from "./FadeUp";

interface Props {
  studies: CaseStudy[];
}

function getEmbedUrl(videoUrl: string, videoType?: string): string {
  if (videoType === "vimeo") {
    // Extract Vimeo ID from various URL formats
    const match = videoUrl.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1&title=0&byline=0&portrait=0` : "";
  }
  // YouTube
  const match = videoUrl.match(/(?:watch\?v=|embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : "";
}

function VideoModal({
  videoUrl,
  videoType,
  onClose,
}: {
  videoUrl: string;
  videoType?: string;
  onClose: () => void;
}) {
  const embedUrl = getEmbedUrl(videoUrl, videoType);
  if (!embedUrl) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(90vw, 1100px)",
          aspectRatio: "16/9",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={embedUrl}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: -40,
            right: 0,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Close ×
        </button>
      </div>
    </div>
  );
}

export default function CaseStudies({ studies }: Props) {
  const [activeVideo, setActiveVideo] = useState<{
    url: string;
    type?: string;
  } | null>(null);

  return (
    <>
      {activeVideo && (
        <VideoModal
          videoUrl={activeVideo.url}
          videoType={activeVideo.type}
          onClose={() => setActiveVideo(null)}
        />
      )}
      <div className="cs-grid">
        <style>{`
          .cs-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2px;
            margin-top: 20px;
          }
          .cs-card {
            background: var(--team-mid);
            position: relative;
            overflow: hidden;
            transition: all 0.3s;
            cursor: default;
          }
          .cs-card:hover {
            background: #1e1e1e;
          }
          .cs-thumb-wrap {
            position: relative;
            width: 100%;
            aspect-ratio: 16/9;
            overflow: hidden;
            background: var(--team-muted);
          }
          .cs-thumb {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.5s ease, filter 0.3s ease;
          }
          .cs-card:hover .cs-thumb {
            transform: scale(1.04);
          }
          .cs-play-btn {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: rgba(0,0,0,0.6);
            border: 2px solid rgba(255,255,255,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            opacity: 0.8;
          }
          .cs-card:hover .cs-play-btn {
            opacity: 1;
            background: var(--team-accent);
            border-color: var(--team-accent);
          }
          .cs-play-icon {
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 10px 0 10px 18px;
            border-color: transparent transparent transparent white;
            margin-left: 3px;
          }
          .cs-content {
            padding: 28px 32px 32px;
          }
          .cs-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
          }
          .cs-tag {
            font-family: var(--font-dm-mono), 'DM Mono', monospace;
            font-size: 9px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--team-accent);
          }
          .cs-year {
            font-family: var(--font-dm-mono), 'DM Mono', monospace;
            font-size: 9px;
            letter-spacing: 0.15em;
            color: var(--fml-grey);
          }
          .cs-title {
            font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
            font-size: 24px;
            letter-spacing: 0.04em;
            margin-bottom: 4px;
            line-height: 1.1;
            color: var(--team-accent);
          }
          .cs-client {
            font-family: var(--font-dm-mono), 'DM Mono', monospace;
            font-size: 10px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--fml-grey);
            margin-bottom: 12px;
          }
          .cs-body {
            font-size: 13px;
            font-weight: 300;
            line-height: 1.65;
            color: rgba(245,244,240,0.5);
          }
          .cs-stats {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            padding-top: 16px;
            margin-top: 16px;
            border-top: 1px solid rgba(255,255,255,0.06);
          }
          .cs-stat-label {
            font-family: var(--font-dm-mono), 'DM Mono', monospace;
            font-size: 9px;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--fml-grey);
          }
          .cs-stat-value {
            font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
            font-size: 18px;
            letter-spacing: 0.04em;
            color: var(--team-accent);
            line-height: 1;
            margin-top: 2px;
          }
          @media (max-width: 900px) {
            .cs-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        {studies.map((cs) => (
          <FadeUp key={cs.id} className="cs-card">
            {cs.thumbnail && (
              <div className="cs-thumb-wrap">
                <img
                  className="cs-thumb"
                  src={cs.thumbnail}
                  alt={cs.title}
                  loading="lazy"
                />
                {cs.videoUrl && (
                  <div
                    className="cs-play-btn"
                    onClick={() =>
                      setActiveVideo({
                        url: cs.videoUrl!,
                        type: cs.videoType,
                      })
                    }
                  >
                    <div className="cs-play-icon" />
                  </div>
                )}
              </div>
            )}
            <div className="cs-content">
              <div className="cs-meta">
                <span className="cs-tag">{cs.categories[0]}</span>
                <span className="cs-year">{cs.year}</span>
              </div>
              <div className="cs-title">{cs.title}</div>
              <div className="cs-client">{cs.client}</div>
              <div className="cs-body">{cs.description}</div>
              {cs.stats && cs.stats.length > 0 && (
                <div className="cs-stats">
                  {cs.stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="cs-stat-label">{stat.label}</div>
                      <div className="cs-stat-value">{stat.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeUp>
        ))}
      </div>
    </>
  );
}
