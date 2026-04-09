"use client";

import type { CSSProperties } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  navPrimaryDesktop,
  navMoreDropdown,
  navSections,
} from "@/lib/data";

interface NavbarProps {
  active: string;
}

function sectionLabel(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        marginLeft: 5,
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.25s ease",
        opacity: 0.85,
      }}
    >
      <path
        d="M2.5 4.25L6 7.75L9.5 4.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar({ active }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const openMore = useCallback(() => {
    clearLeaveTimer();
    setMoreOpen(true);
  }, [clearLeaveTimer]);

  const scheduleCloseMore = useCallback(() => {
    clearLeaveTimer();
    leaveTimerRef.current = setTimeout(() => {
      setMoreOpen(false);
      leaveTimerRef.current = null;
    }, 200);
  }, [clearLeaveTimer]);

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

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent) => {
      const el = moreWrapRef.current;
      if (el && !el.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [moreOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const moreActive = navMoreDropdown.some((id) => active === id);

  const desktopLinkStyle = (isActive: boolean): CSSProperties => ({
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontSize: 12,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color: isActive ? "var(--accent)" : "var(--muted)",
    textDecoration: "none",
    transition: "color 0.3s",
    position: "relative",
  });

  const activeDot = (
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
  );

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
        overflow: "visible",
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
          overflow: "visible",
        }}
      >
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

        <div
          className="hide-mobile"
          style={{ display: "flex", gap: 28, alignItems: "center", overflow: "visible" }}
        >
          {navPrimaryDesktop.map((s) => (
            <a key={s} href={`#${s}`} style={desktopLinkStyle(active === s)}>
              {sectionLabel(s)}
              {active === s && activeDot}
            </a>
          ))}

          <div
            ref={moreWrapRef}
            style={{ position: "relative", overflow: "visible" }}
            onMouseEnter={openMore}
            onMouseLeave={scheduleCloseMore}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              aria-controls="nav-more-menu"
              onClick={() => setMoreOpen((v) => !v)}
              suppressHydrationWarning
              style={{
                ...desktopLinkStyle(moreActive || moreOpen),
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12,
                fontWeight: 500,
                fontStyle: "normal",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
              }}
            >
              More
              <ChevronDown open={moreOpen} />
              {(moreActive || moreOpen) && activeDot}
            </button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  id="nav-more-menu"
                  role="menu"
                  aria-orientation="vertical"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    minWidth: 220,
                    padding: "10px 0 8px",
                    borderRadius: 12,
                    border: "1px solid rgba(0, 212, 255, 0.14)",
                    background: "rgba(8, 18, 32, 0.92)",
                    backdropFilter: "blur(16px) saturate(1.4)",
                    WebkitBackdropFilter: "blur(16px) saturate(1.4)",
                    boxShadow:
                      "0 16px 48px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
                    zIndex: 200,
                  }}
                >
                  {navMoreDropdown.map((s) => (
                    <a
                      key={s}
                      role="menuitem"
                      href={`#${s}`}
                      onClick={() => setMoreOpen(false)}
                      style={{
                        display: "block",
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        color: active === s ? "var(--accent)" : "var(--muted)",
                        textDecoration: "none",
                        padding: "11px 20px",
                        transition: "color 0.2s ease, background 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--accent)";
                        e.currentTarget.style.background = "rgba(0, 212, 255, 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color =
                          active === s ? "var(--accent)" : "var(--muted)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {sectionLabel(s)}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="hide-desktop"
          suppressHydrationWarning
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
              {sectionLabel(s)}
            </a>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
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
