"use client";

import FadeIn from "@/components/ui/FadeIn";
import SectionLabel from "@/components/ui/SectionLabel";
import GlowOrb from "@/components/ui/GlowOrb";
import SkillsNetwork from "@/components/sections/SkillsNetwork";
import { certifications } from "@/lib/data";

export default function Skills() {
  return (
    <section
      id="skills"
      style={{ padding: "120px 32px", position: "relative", overflow: "hidden" }}
    >
      <GlowOrb top="50%" left="90%" color="rgba(0,212,255,0.04)" size={450} />

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        <FadeIn>
          <SectionLabel text="Skills Network" />
        </FadeIn>

        <FadeIn delay={0.08}>
          <SkillsNetwork />
        </FadeIn>

        <FadeIn delay={0.18}>
          <div
            style={{
              marginTop: 40,
              padding: "24px 28px",
              borderRadius: 16,
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
                marginBottom: 20,
              }}
            >
              <span style={{ color: "var(--muted)" }}>~/</span>certifications
            </h4>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {certifications.map((cert) => (
                <div
                  key={cert}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    borderRadius: 10,
                    background: "rgba(0,212,255,0.04)",
                    border: "1px solid rgba(0,212,255,0.1)",
                    transition: "all 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.08)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.25)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(0,212,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.1)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <span style={{ color: "var(--accent)", fontSize: 12 }}>✦</span>
                  <span
                    style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 13,
                      color: "var(--text-muted)",
                    }}
                  >
                    {cert}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
