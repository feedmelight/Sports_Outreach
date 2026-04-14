"use client";

import { PROOF_CARDS } from "@/lib/proofCards";

interface ProofCardsProps {
  primaryColor: string;
  secondaryColor: string;
}

export default function ProofCards({ primaryColor }: ProofCardsProps) {
  const mono = "var(--font-dm-mono), 'DM Mono', monospace";
  const sans = "var(--font-dm-sans), 'DM Sans', sans-serif";

  return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
        What we&apos;ve built for events like yours
      </div>
      <div style={{ fontSize: 22, fontWeight: 500, color: "#f5f4f0", fontFamily: sans, marginBottom: 32 }}>
        From the biggest stages in world football to your stadium.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {PROOF_CARDS.map((card) => (
          <div
            key={card.id}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              overflow: "hidden",
              transition: "border-color 0.2s, transform 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Image / gradient area */}
            <div style={{ position: "relative", height: 200, width: "100%" }}>
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: card.imageFallbackGradient }} />
              )}
              <div style={{
                position: "absolute", top: 10, right: 10,
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
                padding: "3px 8px", borderRadius: 3,
                fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.7)",
              }}>
                {card.year}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "16px 18px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
                {card.client}
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: "#f5f4f0", marginBottom: 8, fontFamily: sans }}>
                {card.title}
              </div>
              <div style={{
                fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 14,
                overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const,
              }}>
                {card.description}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: mono, fontSize: 10, letterSpacing: "0.04em",
                      padding: "3px 9px", borderRadius: 3,
                      background: `${primaryColor}26`,
                      color: primaryColor,
                      border: `1px solid ${primaryColor}40`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
