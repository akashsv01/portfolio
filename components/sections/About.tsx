"use client";

import FadeIn from "@/components/ui/FadeIn";
import SectionLabel from "@/components/ui/SectionLabel";
import GlowOrb from "@/components/ui/GlowOrb";
import { aboutHighlights, quickFacts, aboutParagraphs } from "@/lib/data";

export default function About() {
  return (
    <section
      id="about"
      style={{ padding: "120px 32px", position: "relative", overflow: "hidden" }}
    >
      <GlowOrb top="20%" left="-8%" color="rgba(0,212,255,0.05)" size={600} />

      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        <FadeIn>
          <SectionLabel text="About Me" />
        </FadeIn>

        <div
          className="about-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 56,
            alignItems: "start",
          }}
        >
          <FadeIn delay={0.1}>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(24px, 3vw, 32px)",
                  color: "var(--text)",
                  marginBottom: 28,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.3,
                }}
              >
                Building intelligent software
                <br />
                <span className="gradient-text">that makes a difference.</span>
              </h2>

              {aboutParagraphs.map((text, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 15,
                    color: "var(--text-muted)",
                    lineHeight: 1.85,
                    marginBottom: i < aboutParagraphs.length - 1 ? 20 : 0,
                  }}
                >
                  {text}
                </p>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {aboutHighlights.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "18px 14px",
                      borderRadius: 14,
                      background: "rgba(0,212,255,0.03)",
                      border: "1px solid rgba(0,212,255,0.1)",
                      textAlign: "left",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.25)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,212,255,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.1)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-dm-mono), monospace",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--accent)",
                        textTransform: "uppercase",
                        letterSpacing: "1.2px",
                        marginBottom: 8,
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        fontSize: 13,
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: 22,
                  borderRadius: 14,
                  background: "rgba(0,212,255,0.02)",
                  border: "1px solid rgba(0,212,255,0.08)",
                }}
              >
                <h4
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                    fontSize: 10,
                    fontWeight: 500,
                    color: "var(--accent)",
                    textTransform: "uppercase",
                    letterSpacing: "2.5px",
                    marginBottom: 16,
                  }}
                >
                  <span style={{ color: "var(--muted)" }}>~/</span>quick-facts
                </h4>
                {quickFacts.map(({ emoji, text }, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: i < quickFacts.length - 1
                        ? "1px solid rgba(0,212,255,0.05)"
                        : "none",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{emoji}</span>
                    <span
                      style={{
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        fontSize: 13,
                        color: "var(--text-muted)",
                      }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
