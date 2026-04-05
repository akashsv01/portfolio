"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import FadeIn from "@/components/ui/FadeIn";
import GlowOrb from "@/components/ui/GlowOrb";
import { personal } from "@/lib/data";

const TechSphere = dynamic(() => import("@/components/3d/TechSphere"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: "2px solid rgba(0,212,255,0.15)",
          borderTop: "2px solid #00d4ff",
          borderRadius: "50%",
          animation: "spin-slow 1s linear infinite",
        }}
      />
    </div>
  ),
});

const socialLinks = [
  {
    href: personal.linkedin,
    label: "LinkedIn",
    path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zm2-5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  },
  {
    href: personal.github,
    label: "GitHub",
    path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
  },
  {
    href: `mailto:${personal.email}`,
    label: "Email",
    path: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 3l-8 5-8-5",
  },
];

export default function Hero() {
  const [typedText, setTypedText] = useState("");
  const roleRef = useRef(0);
  const charRef = useRef(0);
  const deletingRef = useRef(false);
  const { roles } = personal;

  useEffect(() => {
    const tick = () => {
      const current = roles[roleRef.current];
      if (!deletingRef.current) {
        charRef.current++;
        setTypedText(current.substring(0, charRef.current));
        if (charRef.current === current.length) {
          setTimeout(() => { deletingRef.current = true; }, 2200);
        }
      } else {
        charRef.current--;
        setTypedText(current.substring(0, charRef.current));
        if (charRef.current === 0) {
          deletingRef.current = false;
          roleRef.current = (roleRef.current + 1) % roles.length;
        }
      }
    };
    const interval = setInterval(tick, deletingRef.current ? 38 : 75);
    return () => clearInterval(interval);
  });

  return (
    <section id="home" className="hero-section">
      {/* Immersive 3D: orbital tech constellation + infinite grid — full viewport */}
      <div
        aria-hidden
        className="hero-techsphere-host"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "auto",
        }}
      >
        <TechSphere variant="hero" />
      </div>

      {/* Desktop: diagonal scrim (hidden on small screens — see .hero-mobile-scrim) */}
      <div
        aria-hidden
        className="hero-scrim-desktop"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: `
            linear-gradient(
              105deg,
              rgba(5, 13, 26, 0.92) 0%,
              rgba(5, 13, 26, 0.72) 28%,
              rgba(5, 13, 26, 0.28) 52%,
              rgba(5, 13, 26, 0.06) 72%,
              transparent 100%
            ),
            linear-gradient(180deg, rgba(5, 13, 26, 0.35) 0%, transparent 30%)
          `,
        }}
      />
      <div
        aria-hidden
        className="hero-mobile-scrim"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          display: "none",
        }}
      />
      <GlowOrb top="-5%" left="-8%" color="rgba(0,212,255,0.035)" size={600} zIndex={-1} />

      <div
        className="hero-layout"
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          width: "100%",
          position: "relative",
          zIndex: 2,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div className="hero-inner">
          {/* Status badge */}
          <FadeIn>
            <div
              className="hero-status-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                borderRadius: 100,
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.2)",
                marginBottom: 40,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 10px #22c55e",
                  animation: "pulse-glow 2s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  color: "#86efac",
                  letterSpacing: "0.5px",
                }}
              >
                {personal.status}
              </span>
            </div>
          </FadeIn>

          {/* Name */}
          <FadeIn delay={0.1}>
            <h1
              className="hero-headline"
              style={{
                fontFamily: "var(--font-syne), sans-serif",
                fontWeight: 800,
                fontSize: "clamp(40px, 5.8vw, 72px)",
                lineHeight: 1.08,
                color: "var(--text)",
                letterSpacing: "-2px",
                margin: "0 0 24px",
              }}
            >
              Hi, I&apos;m{" "}
              <span className="gradient-text">{personal.name}</span>
            </h1>
          </FadeIn>

          {/* Typewriter */}
          <FadeIn delay={0.18}>
            <div
              className="hero-row"
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: "clamp(14px, 1.7vw, 18px)",
                color: "var(--accent)",
                marginBottom: 16,
                minHeight: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 4,
              }}
            >
              <span style={{ color: "var(--muted)" }}>&gt;&nbsp;</span>
              <span>{typedText}</span>
              <span
                style={{
                  animation: "blink 1s step-end infinite",
                  color: "var(--accent)",
                }}
              >
                |
              </span>
            </div>
          </FadeIn>

          {/* Tagline — extra top margin so it clears the 3D scene */}
          <FadeIn delay={0.26}>
            <p
              className="hero-tagline"
              style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "clamp(15px, 1.65vw, 18px)",
                color: "var(--text-muted)",
                lineHeight: 1.85,
                maxWidth: "100%",
              }}
            >
              {personal.tagline}
              <br />
              <span
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: 14,
                  color: "var(--muted)",
                }}
              >
                {personal.subTagline}
              </span>
            </p>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={0.34}>
            <div
              className="hero-row"
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginBottom: 44,
                justifyContent: "flex-start",
              }}
            >
              <a
                href="#projects"
                style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "13px 32px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #0ea5e9, #00d4ff)",
                  color: "#050d1a",
                  textDecoration: "none",
                  boxShadow: "0 4px 24px rgba(0,212,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  letterSpacing: "0.3px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 8px 36px rgba(0,212,255,0.45), inset 0 1px 0 rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 4px 24px rgba(0,212,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)";
                }}
              >
                View My Work
              </a>
              <a
                href="#contact"
                style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "13px 32px",
                  borderRadius: 10,
                  background: "rgba(0,212,255,0.04)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  transition: "all 0.25s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.5)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.2)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.04)";
                }}
              >
                Get In Touch
              </a>
            </div>
          </FadeIn>

          {/* Social links */}
          <FadeIn delay={0.42}>
            <div
              className="hero-row"
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-start",
                marginBottom: 8,
              }}
            >
              {socialLinks.map(({ href, label, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,212,255,0.03)",
                    border: "1px solid rgba(0,212,255,0.12)",
                    color: "var(--muted)",
                    textDecoration: "none",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "var(--accent)";
                    el.style.borderColor = "rgba(0,212,255,0.35)";
                    el.style.background = "rgba(0,212,255,0.08)";
                    el.style.transform = "translateY(-2px)";
                    el.style.boxShadow = "0 4px 16px rgba(0,212,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "var(--muted)";
                    el.style.borderColor = "rgba(0,212,255,0.12)";
                    el.style.background = "rgba(0,212,255,0.03)";
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="hero-scroll-hint"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          zIndex: 3,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            fontSize: 9,
            color: "var(--muted)",
            letterSpacing: "4px",
            textTransform: "uppercase",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: 22,
            height: 36,
            borderRadius: 11,
            border: "1px solid rgba(0,212,255,0.15)",
            display: "flex",
            justifyContent: "center",
            paddingTop: 6,
          }}
        >
          <div
            style={{
              width: 3,
              height: 7,
              borderRadius: 2,
              background: "var(--accent)",
              animation: "scroll-bounce 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </section>
  );
}
