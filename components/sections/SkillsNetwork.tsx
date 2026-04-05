"use client";

import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useId,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import dynamic from "next/dynamic";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import {
  skillsNetworkGroups,
  skillsNetworkEdges,
  skillsNetworkEdgeGlowsForSelection,
} from "@/lib/data";

const SkillsNetworkParticles = dynamic(
  () => import("@/components/sections/SkillsNetworkParticles"),
  { ssr: false }
);

const CX = 200;
const CY = 200;
/** Orbit radius — keep `RING + NODE_R + outer ring` ≤ ~192 so nodes stay inside the 400×400 viewBox. */
const RING = 148;
/** Satellite nodes — smaller than {@link CENTER_R} so the hub reads as the primary focal point. */
const NODE_R = 32;
/** Hit target only — no filter; slightly inset so adjacent nodes never share a hover (SVG filters can enlarge hit boxes). */
const NODE_HIT_R = 29;
const CENTER_R = 54;
const ORBIT_SPEED = 0.0001;
const N = skillsNetworkGroups.length;

/** Stable rounding so SSR and browser serialize identical SVG attribute values (avoids hydration mismatches). */
function snap(n: number): number {
  return Math.round(n * 10000) / 10000;
}

const STARFIELD = (() => {
  const stars: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < 52; i++) {
    const t = i * 2.39996322972865332;
    const rr = 28 + (i % 19) * 11;
    const x = CX + Math.cos(t) * rr * 1.15 + ((i * 13) % 31) - 15;
    const y = CY + Math.sin(t) * rr * 1.1 + ((i * 7) % 29) - 14;
    stars.push({
      x: snap(Math.min(392, Math.max(8, x))),
      y: snap(Math.min(388, Math.max(8, y))),
      r: snap(0.35 + (i % 5) * 0.32),
      o: snap(0.08 + (i % 6) * 0.045),
    });
  }
  const lines: { i: number; j: number; o: number }[] = [];
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dx = stars[i].x - stars[j].x;
      const dy = stars[i].y - stars[j].y;
      const d = Math.hypot(dx, dy);
      if (d > 18 && d < 48) {
        lines.push({ i, j, o: snap((1 - d / 48) * 0.14) });
      }
    }
  }
  return { stars, lines: lines.slice(0, 72) };
})();

function nodeWorldPosition(index: number, orbitRad: number) {
  const base = -Math.PI / 2 + (index * 2 * Math.PI) / N;
  const a = base + orbitRad;
  return {
    x: snap(CX + RING * Math.cos(a)),
    y: snap(CY + RING * Math.sin(a)),
  };
}

function lineLen(x1: number, y1: number, x2: number, y2: number) {
  return snap(Math.hypot(x2 - x1, y2 - y1));
}

/** Wrap node labels so multi-line text fits inside the circle. */
function labelLines(label: string): string[] {
  const t = label.trim();
  if (t.length <= 14) return [t];
  const words = t.split(/\s+/);
  if (words.length <= 2) return [t];
  if (t.length <= 22 || words.length <= 4) {
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  }
  const n = Math.ceil(words.length / 3);
  return [
    words.slice(0, n).join(" "),
    words.slice(n, n * 2).join(" "),
    words.slice(n * 2).join(" "),
  ];
}

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function SkillsNetwork() {
  const [selected, setSelected] = useState<string | null>(null);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredSkillName, setHoveredSkillName] = useState<string | null>(null);
  const hoverPauseRef = useRef(false);
  const uid = useId();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    hoverPauseRef.current = hoveredNodeId !== null;
  }, [hoveredNodeId]);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      if (!hoverPauseRef.current) {
        setOrbitAngle((a) => a + ORBIT_SPEED * dt);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const positions = useMemo(() => {
    const rad = reducedMotion ? 0 : orbitAngle;
    return skillsNetworkGroups.map((_, i) => nodeWorldPosition(i, rad));
  }, [orbitAngle, reducedMotion]);

  const posById = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    skillsNetworkGroups.forEach((g, i) => m.set(g.id, positions[i]!));
    return m;
  }, [positions]);

  const active = skillsNetworkGroups.find((g) => g.id === selected);

  return (
    <div className="skills-network-layout">
      <div className="skills-network-graph-wrap">
        <div className="skills-network-particles-host" aria-hidden>
          <SkillsNetworkParticles />
        </div>

        <MotionConfig reducedMotion="user">
          <svg
            className="skills-network-svg"
            viewBox="0 0 400 400"
            role="img"
            aria-label="Skills network: orbiting domain nodes around a central hub"
          >
            <defs>
              <radialGradient id={`${uid}-hub`} cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#1a4a62" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#0a1e30" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#050d14" stopOpacity="1" />
              </radialGradient>
              <radialGradient id={`${uid}-hubGlow`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.35" />
                <stop offset="55%" stopColor="#00d4ff" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`${uid}-line`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id={`${uid}-ray`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0" />
                <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
              </linearGradient>
              <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id={`${uid}-glowStrong`} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="4.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id={`${uid}-nodeDepth`} x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.55" />
              </filter>
            </defs>

            <g className="skills-network-stars" aria-hidden>
              {STARFIELD.lines.map((L, k) => {
                const a = STARFIELD.stars[L.i];
                const b = STARFIELD.stars[L.j];
                return (
                  <line
                    key={`c-${k}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="rgba(0, 212, 255, 0.12)"
                    strokeOpacity={L.o}
                    strokeWidth={0.6}
                  />
                );
              })}
              {STARFIELD.stars.map((s, i) => (
                <circle key={`s-${i}`} cx={s.x} cy={s.y} r={s.r} fill="#a5f3fc" fillOpacity={s.o} />
              ))}
            </g>

            <ellipse cx={CX} cy={CY} rx={175} ry={165} fill={`url(#${uid}-hubGlow)`} opacity={0.5} />

            {/* Light rays + rotating grid (subtle) */}
            <g className="skills-network-rays" style={{ transformOrigin: `${CX}px ${CY}px` }}>
              {Array.from({ length: 10 }, (_, i) => {
                const rot = i * 36;
                const rad = (rot * Math.PI) / 180;
                const rad2 = ((rot + 4) * Math.PI) / 180;
                const x1 = snap(CX + 220 * Math.cos(rad));
                const y1 = snap(CY + 220 * Math.sin(rad));
                const x2 = snap(CX + 40 * Math.cos(rad2));
                const y2 = snap(CY + 40 * Math.sin(rad2));
                return (
                  <path
                    key={`ray-${i}`}
                    d={`M ${snap(CX)} ${snap(CY)} L ${x1} ${y1} L ${x2} ${y2} Z`}
                    fill={`url(#${uid}-ray)`}
                    opacity={0.35}
                  />
                );
              })}
            </g>

            <g className="skills-network-grid-rotate" style={{ transformOrigin: `${CX}px ${CY}px` }}>
              {[72, 108, 144, 180].map((r) => (
                <circle
                  key={`grid-${r}`}
                  cx={CX}
                  cy={CY}
                  r={r}
                  fill="none"
                  stroke="rgba(0, 212, 255, 0.05)"
                  strokeWidth="0.6"
                  strokeDasharray="3 14"
                />
              ))}
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i * Math.PI) / 6;
                return (
                  <line
                    key={`rad-${i}`}
                    x1={CX}
                    y1={CY}
                    x2={snap(CX + 190 * Math.cos(a))}
                    y2={snap(CY + 190 * Math.sin(a))}
                    stroke="rgba(0, 212, 255, 0.04)"
                    strokeWidth={0.5}
                  />
                );
              })}
            </g>

            {/* Network graph edges — glow follows selected category */}
            {skillsNetworkEdges.map((edge, ei) => {
              const pa = posById.get(edge.from);
              const pb = posById.get(edge.to);
              if (!pa || !pb) return null;
              const len = lineLen(pa.x, pa.y, pb.x, pb.y);
              const glow = skillsNetworkEdgeGlowsForSelection(selected, edge.from, edge.to);
              const op = selected ? (glow ? 0.9 : 0.1) : 0.24;
              const strokeW = glow ? 2.5 : 1.05;
              const filterG = glow ? `url(#${uid}-glowStrong)` : undefined;
              return (
                <g key={`edge-${edge.from}-${edge.to}`}>
                  <motion.line
                    x1={pa.x}
                    y1={pa.y}
                    x2={pb.x}
                    y2={pb.y}
                    stroke={glow ? "#38bdf8" : "rgba(56, 189, 248, 0.38)"}
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                    filter={filterG}
                    className="skills-network-edge-line"
                    initial={false}
                    animate={{ opacity: op }}
                    transition={{ duration: 0.45, delay: ei * 0.02 }}
                    style={{
                      pointerEvents: "none",
                      strokeDasharray: `${snap(Math.max(6, len * 0.04))} ${snap(Math.max(10, len * 0.12))}`,
                    }}
                  />
                </g>
              );
            })}

            {/* Hub ↔ node spokes */}
            {skillsNetworkGroups.map((g, i) => {
              const n = positions[i]!;
              const len = lineLen(CX, CY, n.x, n.y);
              const isSel = selected === g.id;
              const op = isSel ? 0.55 : 0.2;
              return (
                <g key={`spoke-${g.id}`}>
                  <motion.line
                    x1={CX}
                    y1={CY}
                    x2={n.x}
                    y2={n.y}
                    stroke={`url(#${uid}-line)`}
                    strokeWidth={isSel ? 2.2 : 1}
                    strokeLinecap="round"
                    filter={isSel ? `url(#${uid}-glow)` : undefined}
                    initial={false}
                    animate={{ opacity: op, strokeDashoffset: 0 }}
                    transition={{ duration: 0.55, delay: i * 0.03 }}
                    style={{
                      pointerEvents: "none",
                      strokeDasharray: `${snap(Math.max(4, len * 0.03))} ${snap(Math.max(8, len * 0.1))}`,
                    }}
                  />
                </g>
              );
            })}

            <g className="skills-network-orbit" style={{ transformOrigin: `${CX}px ${CY}px` }}>
              <circle
                cx={CX}
                cy={CY}
                r={RING + 18}
                fill="none"
                stroke="rgba(0, 212, 255, 0.07)"
                strokeWidth="1"
                strokeDasharray="4 10"
              />
            </g>

            {/* Center hub — pulse scale */}
            <motion.g
              style={{ transformOrigin: `${CX}px ${CY}px` }}
              initial={false}
              animate={!reducedMotion ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={
                !reducedMotion
                  ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.2 }
              }
            >
              <circle cx={CX} cy={CY} r={CENTER_R + 18} fill="none" stroke="rgba(0, 212, 255, 0.08)" strokeWidth="1" />
              <circle cx={CX} cy={CY} r={CENTER_R + 10} fill="none" stroke="rgba(0, 212, 255, 0.12)" strokeWidth="1.5" />
              <circle
                cx={CX}
                cy={CY}
                r={CENTER_R + 2}
                fill="none"
                stroke="rgba(0, 212, 255, 0.18)"
                strokeWidth="2"
                className="skills-network-hub-pulse-ring"
              />
              <circle cx={CX} cy={CY} r={CENTER_R} fill={`url(#${uid}-hub)`} stroke="rgba(0, 212, 255, 0.55)" strokeWidth="2.2" />
              <circle cx={CX} cy={CY} r={CENTER_R - 5} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text
                x={CX}
                y={CY + 6}
                textAnchor="middle"
                fill="#e8f8ff"
                fontFamily="var(--font-syne), system-ui, sans-serif"
                fontSize="18"
                fontWeight="700"
                letterSpacing="-0.02em"
                className="skills-network-hub-label"
                style={{ userSelect: "none" }}
              >
                Skills
              </text>
            </motion.g>

            {skillsNetworkGroups.map((g, i) => {
              const n = positions[i]!;
              const isSel = selected === g.id;
              const isHover = hoveredNodeId === g.id;
              const lines = labelLines(g.label);
              const labelFs =
                lines.length >= 3 ? 6.2 : lines.length === 2 ? 7 : g.label.length > 18 ? 6.6 : 7.4;
              const lineGap = labelFs * 1.1;
              const iconFs = 11;
              const blockH = iconFs + 4 + lines.length * lineGap;
              const startY = n.y - blockH / 2 + iconFs * 0.35;
              const toggle = () => setSelected((s) => (s === g.id ? null : g.id));
              const panelPulse = isSel && hoveredSkillName !== null;

              return (
                <g
                  key={`node-${g.id}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSel}
                  aria-label={`${g.label} — show skills`}
                  onKeyDown={(e: KeyboardEvent<SVGGElement>) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle();
                    }
                  }}
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={NODE_R + 3}
                    fill="none"
                    stroke={g.color}
                    strokeOpacity={0.22}
                    strokeWidth={1}
                    style={{ pointerEvents: "none" }}
                  />
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    r={NODE_R}
                    fill={isSel ? `${g.color}40` : "rgba(6, 18, 32, 0.92)"}
                    stroke={g.color}
                    strokeWidth={isSel || isHover || panelPulse ? 2.6 : 1.45}
                    filter={
                      isHover || isSel || panelPulse
                        ? `url(#${uid}-glow)`
                        : `url(#${uid}-nodeDepth)`
                    }
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{ pointerEvents: "none" }}
                  />
                  <text
                    x={n.x}
                    y={startY}
                    textAnchor="middle"
                    fill={isSel || isHover ? "#f0f9ff" : "#94a3b8"}
                    fontFamily="system-ui, 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    <tspan x={n.x} dy={0} fontSize={iconFs}>
                      {g.icon}
                    </tspan>
                    {lines.map((line, lineIdx) => (
                      <tspan
                        key={lineIdx}
                        x={n.x}
                        dy={lineIdx === 0 ? iconFs * 0.55 + 2 : lineGap}
                        fontFamily="var(--font-dm-sans), system-ui, sans-serif"
                        fontSize={labelFs}
                        fontWeight="600"
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                  {/* Single unfiltered hit target — avoids neighbor hovers from filter/blur hit regions */}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={NODE_HIT_R}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onPointerEnter={() => {
                      setHoveredNodeId(g.id);
                      setHoveredSkillName(null);
                    }}
                    onPointerLeave={() => setHoveredNodeId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle();
                    }}
                  />
                </g>
              );
            })}
          </svg>
        </MotionConfig>
      </div>

      <aside className="skills-network-panel" aria-live="polite">
        {active ? (
          <div key={active.id} className="skills-network-panel-inner skills-network-panel-inner--active">
            <p className="skills-network-panel__eyebrow" style={{ color: active.color }}>
              {active.icon} {active.label}
            </p>
            <p className="skills-network-panel__desc">{active.description}</p>
            <motion.ul
              className="skills-network-panel__list"
              variants={listVariants}
              initial="hidden"
              animate="show"
              key={active.id}
            >
              {active.items.map((item) => (
                <motion.li key={item} variants={itemVariants}>
                  <button
                    type="button"
                    className={`skills-network-skill-row ${hoveredSkillName === item ? "skills-network-skill-row--hot" : ""}`}
                    style={
                      {
                        "--accent-soft": active.color,
                        "--chip-border": `${active.color}40`,
                        "--chip-bg": `${active.color}12`,
                      } as CSSProperties
                    }
                    onMouseEnter={() => setHoveredSkillName(item)}
                    onMouseLeave={() => setHoveredSkillName(null)}
                  >
                    {item}
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        ) : (
          <div key="empty" className="skills-network-panel-inner skills-network-panel-inner--empty">
            <p className="skills-network-panel__hint">
              Nodes orbit the hub — hover to pause. Select a domain to light up its connection lines
              and browse skills in this panel.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
