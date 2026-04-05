"use client";

import { useState, useEffect } from "react";
import { navSections } from "@/lib/data";

interface NavbarProps {
  active: string;
}

export default function Navbar({ active }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: scrolled
          ? "max(12px, env(safe-area-inset-top, 0px))"
          : "max(16px, env(safe-area-inset-top, 0px))",
        paddingBottom: scrolled ? 12 : 16,
        paddingLeft: "max(16px, env(safe-area-inset-left, 0px))",
        paddingRight: "max(16px, env(safe-area-inset-right, 0px))",
        background: scrolled ? "rgba(5, 13, 26, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(1.5)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(0, 212, 255, 0.08)"
          : "1px solid transparent",
        transition: "all 0.4s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 clamp(16px, 4vw, 32px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <a
          href="#home"
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 800,
            fontSize: 24,
            color: "var(--text)",
            textDecoration: "none",
            letterSpacing: "-0.5px",
            position: "relative",
          }}
        >
          A<span style={{ color: "var(--accent)" }}>.</span>S<span style={{ color: "var(--accent)" }}>.</span>V
          <span
            style={{
              position: "absolute",
              bottom: -2,
              left: 0,
              right: 0,
              height: 2,
              background: "linear-gradient(90deg, var(--accent), transparent)",
              borderRadius: 1,
            }}
          />
        </a>

        {/* Desktop nav */}
        <div
          className="hide-mobile"
          style={{ display: "flex", gap: 32, alignItems: "center" }}
        >
          {navSections.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: active === s ? "var(--accent)" : "var(--muted)",
                textDecoration: "none",
                transition: "color 0.3s",
                position: "relative",
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {active === s && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    boxShadow: "0 0 8px var(--accent)",
                  }}
                />
              )}
            </a>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid rgba(0, 212, 255, 0.3)",
              color: "var(--accent)",
              textDecoration: "none",
              transition: "all 0.3s",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(0, 212, 255, 0.08)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0, 212, 255, 0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            Resume
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="hide-desktop"
          style={{
            background: "rgba(0, 212, 255, 0.06)",
            border: "1px solid rgba(0, 212, 255, 0.12)",
            borderRadius: 10,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            minWidth: 44,
            minHeight: 44,
            padding: "10px 12px",
          }}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 24,
                height: 2,
                background: "var(--text)",
                borderRadius: 2,
                transition: "all 0.3s",
                transform:
                  i === 0 && mobileOpen
                    ? "rotate(45deg) translateY(7px)"
                    : i === 2 && mobileOpen
                    ? "rotate(-45deg) translateY(-7px)"
                    : "none",
                opacity: i === 1 && mobileOpen ? 0 : 1,
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(5, 13, 26, 0.97)",
            backdropFilter: "blur(20px)",
            padding: "20px max(20px, env(safe-area-inset-left, 0px)) 24px max(20px, env(safe-area-inset-right, 0px))",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            borderBottom: "1px solid rgba(0, 212, 255, 0.08)",
          }}
        >
          {navSections.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 14,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: active === s ? "var(--accent)" : "var(--text-muted)",
                textDecoration: "none",
                padding: "12px 4px",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </a>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            Resume ↗
          </a>
        </div>
      )}
    </nav>
  );
}
