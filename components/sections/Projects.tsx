"use client";

import { useState, useEffect, useRef } from "react";
import VanillaTilt from "vanilla-tilt";
import FadeIn from "@/components/ui/FadeIn";
import SectionLabel from "@/components/ui/SectionLabel";
import GlowOrb from "@/components/ui/GlowOrb";
import { githubProjects } from "@/lib/data";

type Project = (typeof githubProjects)[number];

function ProjectCard({
  p,
  i,
  hov,
  setHov,
}: {
  p: Project;
  i: number;
  hov: number;
  setHov: (n: number) => void;
}) {
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;
    VanillaTilt.init(el, {
      max: 12,
      speed: 450,
      glare: true,
      "max-glare": 0.22,
      scale: 1.02,
      gyroscope: false,
    });
    return () => {
      const vt = (el as HTMLElement & { vanillaTilt?: { destroy?: () => void } }).vanillaTilt;
      vt?.destroy?.();
    };
  }, []);

  return (
    <FadeIn delay={i * 0.06}>
      <div ref={tiltRef} style={{ height: "100%", transformStyle: "preserve-3d" }}>
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(-1)}
          style={{
            display: "block",
            height: "100%",
            padding: "26px 24px",
            borderRadius: 16,
            textDecoration: "none",
            color: "inherit",
            background:
              hov === i
                ? `linear-gradient(135deg, ${p.accent}10, rgba(0,212,255,0.02))`
                : "rgba(0,212,255,0.02)",
            border: `1px solid ${hov === i ? p.accent + "35" : "rgba(0,212,255,0.08)"}`,
            transition: "border-color 0.35s ease, box-shadow 0.35s ease",
            boxShadow: hov === i ? `0 12px 40px ${p.accent}12` : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 28 }} aria-hidden>
              {p.icon}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={hov === i ? p.accent : "var(--muted)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: hov === i ? 1 : 0.45, transition: "opacity 0.2s" }}
              aria-hidden
            >
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </div>

          <h3
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: "var(--text)",
              margin: "0 0 10px",
              letterSpacing: "-0.2px",
              lineHeight: 1.35,
            }}
          >
            {p.title}
          </h3>

          <p
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.75,
              margin: "0 0 16px",
            }}
          >
            {p.desc}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {p.skills.map((skill) => (
              <span
                key={skill}
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: 10,
                  color: p.accent,
                  padding: "5px 10px",
                  borderRadius: 6,
                  background: `${p.accent}10`,
                  border: `1px solid ${p.accent}22`,
                  lineHeight: 1.3,
                }}
              >
                {skill}
              </span>
            ))}
          </div>

          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-dm-mono), monospace",
              fontSize: 10,
              color: p.accent,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            View on GitHub
          </span>
        </a>
      </div>
    </FadeIn>
  );
}

export default function Projects() {
  const [hov, setHov] = useState(-1);

  return (
    <section
      id="projects"
      style={{ padding: "120px 32px", position: "relative", overflow: "hidden" }}
    >
      <GlowOrb top="30%" left="-5%" color="rgba(0,212,255,0.04)" size={500} />
      <GlowOrb top="60%" left="85%" color="rgba(129,140,248,0.04)" size={400} />

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        <FadeIn>
          <SectionLabel text="Projects" />
        </FadeIn>

        <div
          className="projects-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {githubProjects.map((p, i) => (
            <ProjectCard key={p.url} p={p} i={i} hov={hov} setHov={setHov} />
          ))}
        </div>
      </div>
    </section>
  );
}
