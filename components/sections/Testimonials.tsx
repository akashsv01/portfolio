"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import SectionLabel from "@/components/ui/SectionLabel";
import GlowOrb from "@/components/ui/GlowOrb";

type Testimonial = {
  id: string;
  name: string;
  title: string;
  company: string;
  linkedin: string;
  date: string;
  relationship: string;
  text: string;
  image: string | null;
};

const AUTOPLAY_MS = 6000;
const DRAG_THRESHOLD = 56;
const LONG_TEXT = 320;

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function initials(name: string): string {
  const p = name.split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return (p[0]![0]! + p[p.length - 1]![0]!).toUpperCase();
}

export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">("loading");
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [carouselHovered, setCarouselHovered] = useState(false);
  /** Profile image failed to load for these testimonial ids (fallback to initials). */
  const [avatarFailedIds, setAvatarFailedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    fetch("/data/testimonials.json")
      .then((r) => r.json())
      .then((data: { testimonials: Testimonial[] }) => {
        if (cancelled) return;
        if (data.testimonials?.length) {
          setItems(data.testimonials);
          setLoadState("ok");
        } else {
          setLoadState("error");
        }
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const n = items.length;
  const current = n > 0 ? items[Math.min(index, n - 1)]! : null;
  const autoplayPaused = carouselHovered || expanded;

  useEffect(() => {
    if (loadState !== "ok" || n <= 1 || autoplayPaused) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
      setExpanded(false);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [loadState, n, autoplayPaused]);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (n <= 0) return;
      setIndex((i) => (i + dir + n) % n);
      setExpanded(false);
    },
    [n]
  );

  const textBaseStyle = {
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontSize: 15,
    color: "var(--text-muted)",
    lineHeight: 1.75,
    margin: 0,
  } as const;

  return (
    <section
      id="testimonials"
      style={{
        padding: "140px clamp(20px, 4vw, 40px) 120px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GlowOrb bottom="10%" left="-8%" color="rgba(14, 165, 233, 0.07)" size={520} />

      <div style={{ maxWidth: 880, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <FadeIn>
          <SectionLabel text="Testimonials" />
          <p
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 15,
              fontStyle: "italic",
              color: "var(--muted)",
              margin: "10px 0 0",
              lineHeight: 1.5,
              letterSpacing: "0.02em",
            }}
          >
            What people say about working with me
          </p>
        </FadeIn>

        <FadeIn delay={0.08}>
          {loadState === "loading" && (
            <p style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans), sans-serif", marginTop: 28 }}>
              Loading recommendations…
            </p>
          )}
          {loadState === "error" && (
            <p style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans), sans-serif", marginTop: 28 }}>
              Recommendations could not be loaded.
            </p>
          )}
          {current && loadState === "ok" && (
            <div
              className="testimonial-carousel-row"
              onMouseEnter={() => setCarouselHovered(true)}
              onMouseLeave={() => setCarouselHovered(false)}
              style={{
                marginTop: 36,
              }}
            >
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
                className="testimonial-nav-arrow testimonial-nav-arrow--prev"
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  margin: 0,
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  color: "var(--accent)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }} aria-hidden>
                  ‹
                </span>
              </button>

              <div className="testimonial-carousel-stage" style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 18,
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: 88,
                    lineHeight: 0.85,
                    color: "rgba(200, 235, 255, 0.1)",
                    pointerEvents: "none",
                    userSelect: "none",
                    zIndex: 1,
                  }}
                >
                  &ldquo;
                </span>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    drag="x"
                    dragConstraints={{ left: -88, right: 88 }}
                    dragElastic={0.12}
                    dragSnapToOrigin
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -DRAG_THRESHOLD) go(1);
                      else if (info.offset.x > DRAG_THRESHOLD) go(-1);
                    }}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.28 }}
                    className="testimonial-card-glass"
                    whileHover={{
                      boxShadow: "0 16px 48px rgba(0, 212, 255, 0.12)",
                      border: "1px solid rgba(0, 212, 255, 0.32)",
                    }}
                    style={{
                      position: "relative",
                      padding: "28px 28px 24px",
                      borderRadius: 20,
                      border: "1px solid rgba(0, 212, 255, 0.15)",
                      background: "rgba(10, 22, 40, 0.55)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 8px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
                      cursor: "grab",
                    }}
                    whileTap={{ cursor: "grabbing" }}
                  >
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          flexShrink: 0,
                          overflow: "hidden",
                          border: "2px solid rgba(0, 212, 255, 0.25)",
                          background:
                            "linear-gradient(135deg, rgba(0, 212, 255, 0.25), rgba(14, 165, 233, 0.12))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-syne), sans-serif",
                          fontWeight: 700,
                          fontSize: 22,
                          color: "var(--text)",
                        }}
                      >
                        {current.image && !avatarFailedIds[current.id] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={current.image}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={() =>
                              setAvatarFailedIds((prev) => ({ ...prev, [current.id]: true }))
                            }
                          />
                        ) : (
                          initials(current.name)
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-syne), sans-serif",
                              fontWeight: 700,
                              fontSize: 18,
                              color: "var(--text)",
                            }}
                          >
                            {current.name}
                          </span>
                          <a
                            href={current.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${current.name} on LinkedIn`}
                            style={{ color: "var(--accent)", display: "flex", alignItems: "center" }}
                          >
                            <LinkedInIcon />
                          </a>
                        </div>
                        <p
                          style={{
                            fontFamily: "var(--font-dm-sans), sans-serif",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--accent)",
                            margin: "0 0 8px",
                            lineHeight: 1.45,
                          }}
                        >
                          {current.title}
                          {current.company ? ` · ${current.company}` : ""}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-dm-sans), sans-serif",
                            fontSize: 12,
                            color: "var(--muted)",
                            margin: "0 0 16px",
                            lineHeight: 1.5,
                          }}
                        >
                          {current.date} · {current.relationship}
                        </p>
                        {current.text.length > LONG_TEXT ? (
                          <>
                            <p
                              className={`testimonial-text-outer ${expanded ? "is-expanded" : "is-collapsed"}`}
                              style={textBaseStyle}
                            >
                              {current.text}
                            </p>
                            <button
                              type="button"
                              onClick={() => setExpanded((e) => !e)}
                              style={{
                                marginTop: 12,
                                background: "none",
                                border: "none",
                                padding: 0,
                                fontFamily: "var(--font-dm-sans), sans-serif",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--accent)",
                                cursor: "pointer",
                              }}
                            >
                              {expanded ? "Show less" : "Show more"}
                            </button>
                          </>
                        ) : (
                          <p style={textBaseStyle}>{current.text}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 18,
                  }}
                >
                  {items.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={`Go to testimonial ${i + 1}`}
                      aria-current={i === index ? true : undefined}
                      onClick={() => {
                        setIndex(i);
                        setExpanded(false);
                      }}
                      style={{
                        height: 6,
                        width: i === index ? 28 : 8,
                        borderRadius: 999,
                        border: "none",
                        padding: 0,
                        background:
                          i === index ? "var(--accent)" : "rgba(148, 163, 184, 0.35)",
                        cursor: "pointer",
                        transition: "width 0.3s ease, background 0.25s ease, opacity 0.2s",
                        opacity: i === index ? 1 : 0.85,
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next testimonial"
                className="testimonial-nav-arrow testimonial-nav-arrow--next"
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  margin: 0,
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  color: "var(--accent)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }} aria-hidden>
                  ›
                </span>
              </button>
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
