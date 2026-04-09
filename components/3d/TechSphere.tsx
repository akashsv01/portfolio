"use client";

import {
  memo,
  useRef,
  useState,
  useMemo,
  useEffect,
  Suspense,
  type Dispatch,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from "react";
import { Canvas, useFrame, invalidate, type ThreeEvent } from "@react-three/fiber";
import { Stars, Grid, MeshDistortMaterial, Sparkles, Html } from "@react-three/drei";
import * as THREE from "three";
import { personal } from "@/lib/data";
import { useClientOnly } from "@/lib/useClientOnly";
import WebGLContextSafety from "@/components/3d/WebGLContextSafety";
import { canCreateWebGLContext } from "@/lib/webglSupport";

/** Nudge R3F to draw again when switching frameloop back from "never" to "always". */
function ResumeRenderWhenVisible({ active }: { active: boolean }) {
  useEffect(() => {
    if (active) invalidate();
  }, [active]);
  return null;
}

function nav(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

type ArtifactAction =
  | { kind: "section"; id: string }
  | { kind: "external"; url: string };

function runArtifactAction(action: ArtifactAction) {
  if (action.kind === "section") nav(action.id);
  else window.open(action.url, "_blank", "noopener,noreferrer");
}

// ── Nucleus ─────────────────────────────────────────────────────────────────
function NucleusCore() {
  const icoRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (icoRef.current) {
      icoRef.current.rotation.y = t * 0.38;
      icoRef.current.rotation.x = t * 0.22;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.48;
    if (ring2Ref.current) ring2Ref.current.rotation.x = t * 0.33;
    if (ring3Ref.current) ring3Ref.current.rotation.y = t * 0.26;
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = 0.72 + Math.sin(t * 2.6) * 0.18;
    }
    if (pulseRef.current) {
      const m = pulseRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.045 + Math.sin(t * 1.8) * 0.025;
    }
  });

  return (
    <group>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.58, 20, 20]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.05} depthWrite={false} />
      </mesh>

      <mesh ref={coreRef}>
        <sphereGeometry args={[0.2, 48, 48]} />
        <MeshDistortMaterial
          color="#0ea5e9"
          emissive="#00d4ff"
          emissiveIntensity={0.75}
          roughness={0.12}
          metalness={0.92}
          clearcoat={0.85}
          clearcoatRoughness={0.15}
          distort={0.28}
          speed={2.2}
          radius={0.95}
        />
      </mesh>

      <mesh ref={icoRef}>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshBasicMaterial color="#7dd3fc" wireframe transparent opacity={0.26} />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.5, 14, 14]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.06} depthWrite={false} />
      </mesh>

      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.58, 0.009, 12, 96]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.55} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[0.72, 0.35, 0.2]}>
        <torusGeometry args={[0.72, 0.006, 10, 80]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.32} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[0.25, 0.9, 0.45]}>
        <torusGeometry args={[0.86, 0.004, 8, 64]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function OrbitalPath({ radius, tilt = 0 }: { radius: number; tilt?: number }) {
  return (
    <mesh rotation={[Math.PI / 2 + tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.005, 10, 128]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.11} />
    </mesh>
  );
}

// ── Single orbital ring: secondary nav (labels on hover / 2nd tap on touch) ─
const TAU = Math.PI * 2;
const INNER_ORBIT_DECOR_R = 1.52;
const ORBIT_R = 2.62;

type OrbitFigure = "torusKnot" | "lattice" | "stack" | "beacon" | "fork" | "prism";

const ORBIT_NAV_ITEMS = [
  {
    key: "orbit-experience",
    label: "Experience",
    action: { kind: "section" as const, id: "experience" },
    color: "#7dd3fc",
    y: 0.38,
    figure: "stack" as const,
    angle: (TAU * 0) / 9 + 0.08,
  },
  {
    key: "orbit-projects",
    label: "Projects",
    action: { kind: "section" as const, id: "projects" },
    color: "#00d4ff",
    y: -0.32,
    figure: "torusKnot" as const,
    angle: (TAU * 1) / 9 + 0.08,
  },
  {
    key: "orbit-skills",
    label: "Skills",
    action: { kind: "section" as const, id: "skills" },
    color: "#38bdf8",
    y: 0.44,
    figure: "lattice" as const,
    angle: (TAU * 2) / 9 + 0.08,
  },
  {
    key: "orbit-terminal",
    label: "Terminal",
    action: { kind: "section" as const, id: "terminal" },
    color: "#a78bfa",
    y: -0.4,
    figure: "beacon" as const,
    angle: (TAU * 3) / 9 + 0.08,
  },
  {
    key: "orbit-certifications",
    label: "Certifications",
    action: { kind: "section" as const, id: "certifications" },
    color: "#22d3ee",
    y: 0.36,
    figure: "prism" as const,
    angle: (TAU * 4) / 9 + 0.08,
  },
  {
    key: "orbit-testimonials",
    label: "Testimonials",
    action: { kind: "section" as const, id: "testimonials" },
    color: "#67e8f9",
    y: -0.36,
    figure: "stack" as const,
    angle: (TAU * 5) / 9 + 0.08,
  },
  {
    key: "orbit-honors",
    label: "Honors",
    action: { kind: "section" as const, id: "honors" },
    color: "#c4b5fd",
    y: 0.4,
    figure: "torusKnot" as const,
    angle: (TAU * 6) / 9 + 0.08,
  },
  {
    key: "orbit-github",
    label: "GitHub",
    action: { kind: "external" as const, url: personal.github },
    color: "#94a3b8",
    y: -0.38,
    figure: "fork" as const,
    angle: (TAU * 7) / 9 + 0.08,
  },
  {
    key: "orbit-linkedin",
    label: "LinkedIn",
    action: { kind: "external" as const, url: personal.linkedin },
    color: "#60a5fa",
    y: 0.34,
    figure: "prism" as const,
    angle: (TAU * 8) / 9 + 0.08,
  },
] as const;

function ArtifactFigureVisual({
  figure,
  color,
  spinRef,
}: {
  figure: OrbitFigure;
  color: string;
  spinRef: RefObject<THREE.Group | null>;
}) {
  const emissive = color;
  const mat = (intensity: number, metal = 0.88) => ({
    color,
    emissive,
    emissiveIntensity: intensity,
    roughness: 0.2,
    metalness: metal,
  });

  useFrame(({ clock }) => {
    if (spinRef.current) {
      spinRef.current.rotation.y = clock.getElapsedTime() * 0.65;
    }
  });

  switch (figure) {
    case "torusKnot":
      return (
        <group ref={spinRef}>
          <mesh>
            <torusKnotGeometry args={[0.09, 0.022, 96, 12]} />
            <meshStandardMaterial {...mat(0.75)} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.004, 8, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.35} />
          </mesh>
        </group>
      );
    case "lattice":
      return (
        <group ref={spinRef}>
          {[-0.11, 0, 0.11].map((x, i) => (
            <mesh key={i} position={[x, Math.sin(i) * 0.04, 0]}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshBasicMaterial color={color} wireframe transparent opacity={0.85} />
            </mesh>
          ))}
          <mesh>
            <octahedronGeometry args={[0.06, 0]} />
            <meshStandardMaterial {...mat(0.55)} flatShading />
          </mesh>
        </group>
      );
    case "stack":
      return (
        <group ref={spinRef}>
          {[0, 0.07, 0.14].map((dy, i) => (
            <mesh key={i} position={[0, dy - 0.07, 0]}>
              <cylinderGeometry args={[0.065 - i * 0.008, 0.055 - i * 0.008, 0.05, 16]} />
              <meshStandardMaterial {...mat(0.5 + i * 0.08)} />
            </mesh>
          ))}
        </group>
      );
    case "beacon":
      return (
        <group ref={spinRef}>
          <mesh position={[0, 0.06, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.09, 0.16, 8]} />
            <meshStandardMaterial {...mat(0.7)} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.006, 8, 32]} />
            <meshBasicMaterial color="#7dd3fc" transparent opacity={0.5} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.05, 12]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.4} metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      );
    case "fork":
      return (
        <group ref={spinRef}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.045, 0.22, 0.045]} />
            <meshStandardMaterial {...mat(0.65)} />
          </mesh>
          <mesh position={[-0.09, 0.06, 0]}>
            <boxGeometry args={[0.12, 0.04, 0.04]} />
            <meshStandardMaterial {...mat(0.55)} />
          </mesh>
          <mesh position={[-0.09, -0.02, 0]}>
            <boxGeometry args={[0.12, 0.04, 0.04]} />
            <meshStandardMaterial {...mat(0.55)} />
          </mesh>
          <mesh position={[0.1, 0.02, 0]} rotation={[0, 0, -0.5]}>
            <boxGeometry args={[0.1, 0.035, 0.035]} />
            <meshStandardMaterial {...mat(0.45)} />
          </mesh>
        </group>
      );
    case "prism":
      return (
        <group ref={spinRef}>
          <mesh rotation={[0.35, 0.2, 0]}>
            <octahedronGeometry args={[0.11, 0]} />
            <meshStandardMaterial {...mat(0.62)} flatShading />
          </mesh>
          <mesh rotation={[-0.35, -0.3, 0.4]}>
            <tetrahedronGeometry args={[0.08, 0]} />
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.7} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

function OrbitNavMarker({
  position,
  hoverLabel,
  action,
  color,
  figure,
  hoverKey,
  orbitHover,
  setOrbitHover,
  touchPrimedRef,
}: {
  position: [number, number, number];
  hoverLabel: string;
  action: ArtifactAction;
  color: string;
  figure: OrbitFigure;
  hoverKey: string;
  orbitHover: string | null;
  setOrbitHover: Dispatch<SetStateAction<string | null>>;
  touchPrimedRef: MutableRefObject<string | null>;
}) {
  const hovered = orbitHover === hoverKey;
  const pulseRef = useRef(0);
  const spinRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const visualRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pulseRef.current > 0) {
      pulseRef.current = Math.max(0, pulseRef.current - 0.06);
    }
    if (groupRef.current) {
      const p = pulseRef.current;
      const s = 1 + p * 0.2 + Math.sin(t * 4) * 0.015 * p;
      groupRef.current.scale.setScalar(THREE.MathUtils.clamp(s, 1, 1.25));
    }
    if (visualRef.current) {
      const target = hovered ? 1.1 : 1;
      const cur = visualRef.current.scale.x;
      const next = cur + (target - cur) * 0.14;
      visualRef.current.scale.setScalar(next);
    }
  });

  const onActivate = () => {
    pulseRef.current = 1;
    runArtifactAction(action);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const pe = e.nativeEvent as PointerEvent;
    const isTouch = pe.pointerType === "touch" || pe.pointerType === "pen";
    if (isTouch) {
      setOrbitHover(hoverKey);
      if (touchPrimedRef.current === hoverKey) {
        touchPrimedRef.current = null;
        onActivate();
      } else {
        touchPrimedRef.current = hoverKey;
      }
      return;
    }
    touchPrimedRef.current = null;
    onActivate();
  };

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onClick={(e) => handleClick(e)}
        onPointerOver={() => setOrbitHover(hoverKey)}
        onPointerOut={() => setOrbitHover((prev) => (prev === hoverKey ? null : prev))}
        onPointerDown={(e) => {
          if (e.pointerType === "touch") setOrbitHover(hoverKey);
        }}
      >
        <sphereGeometry args={[0.58, 20, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={visualRef} position={[0, 0, 0]}>
        <ArtifactFigureVisual figure={figure} color={color} spinRef={spinRef} />
      </group>

      <Html
        position={[0, 0.52, 0]}
        center
        distanceFactor={7.2}
        style={{
          pointerEvents: "none",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "optimizeLegibility",
        }}
      >
        <div
          aria-hidden
          style={{
            whiteSpace: "nowrap",
            padding: "10px 18px",
            borderRadius: 12,
            background: "rgba(5,13,26,0.96)",
            border: "1px solid rgba(0,212,255,0.55)",
            color: "#e8f8ff",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.03em",
            lineHeight: 1.35,
            fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
            boxShadow:
              "0 6px 28px rgba(0,0,0,0.5), 0 0 24px rgba(0,212,255,0.14), inset 0 1px 0 rgba(255,255,255,0.06)",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.28s ease",
          }}
        >
          {hoverLabel}
        </div>
      </Html>
    </group>
  );
}

// ── Data-flow lines (nucleus → each orbit marker) ───────────────────────────
function ConnectionLines() {
  const geom = useMemo(() => {
    const pts: number[] = [];
    ORBIT_NAV_ITEMS.forEach((n) => {
      const x = Math.cos(n.angle) * ORBIT_R;
      const z = Math.sin(n.angle) * ORBIT_R;
      pts.push(0, 0, 0);
      pts.push(x, n.y, z);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useEffect(() => {
    return () => geom.dispose();
  }, [geom]);

  const lineMat = useRef<THREE.LineBasicMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.55 + Math.sin(t * 1.85) * 0.45;
    if (lineMat.current) {
      lineMat.current.opacity = 0.08 + pulse * 0.08;
    }
  });

  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial
        ref={lineMat}
        color="#7dd3fc"
        transparent
        opacity={0.14}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function OrbitingRimLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!light.current) return;
    light.current.position.x = Math.cos(t * 0.35) * 3.1;
    light.current.position.z = Math.sin(t * 0.35) * 3.1;
    light.current.position.y = 1.0 + Math.sin(t * 0.28) * 0.45;
  });
  return <pointLight ref={light} intensity={1.15} color="#7dd3fc" distance={18} decay={2} />;
}

function SceneLighting() {
  const fill = useRef<THREE.HemisphereLight>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (fill.current) {
      fill.current.intensity = 0.28 + Math.sin(t * 0.5) * 0.04;
    }
  });
  return (
    <>
      <hemisphereLight ref={fill} args={["#1a3a55", "#050d1a", 0.3]} position={[0, 6, 0]} />
      <ambientLight intensity={0.24} color="#1e3a5f" />
      <directionalLight position={[-6, 8, 4]} intensity={0.65} color="#00d4ff" />
      <pointLight position={[-4.5, 2.5, 5]} intensity={1.65} color="#00d4ff" decay={2} distance={24} />
      <pointLight position={[6, -1.5, 3]} intensity={0.78} color="#0ea5e9" decay={2} distance={18} />
      <OrbitingRimLight />
    </>
  );
}

function ConstellationGroup({
  mouseRef,
  groupPosition,
}: {
  mouseRef: MutableRefObject<{ x: number; y: number }>;
  groupPosition: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const parallax = useRef({ x: 0, y: 0 });
  const [orbitHover, setOrbitHover] = useState<string | null>(null);
  /** First tap shows label; second tap on same icon navigates (touch / pen). */
  const touchPrimedRef = useRef<string | null>(null);

  useEffect(() => {
    document.body.style.cursor = orbitHover ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [orbitHover]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    parallax.current.y += (mx * 0.2 - parallax.current.y) * 0.035;
    parallax.current.x += (my * 0.09 - parallax.current.x) * 0.035;

    groupRef.current.rotation.y = t * 0.055 + parallax.current.y;
    groupRef.current.rotation.x = parallax.current.x * 0.92;
  });

  return (
    <group ref={groupRef} position={groupPosition}>
      <NucleusCore />
      <OrbitalPath radius={INNER_ORBIT_DECOR_R} tilt={0.08} />
      <OrbitalPath radius={ORBIT_R} tilt={-0.06} />
      {ORBIT_NAV_ITEMS.map((item) => {
        const x = Math.cos(item.angle) * ORBIT_R;
        const z = Math.sin(item.angle) * ORBIT_R;
        return (
          <OrbitNavMarker
            key={item.key}
            position={[x, item.y, z]}
            hoverLabel={item.label}
            action={item.action}
            color={item.color}
            figure={item.figure}
            hoverKey={item.key}
            orbitHover={orbitHover}
            setOrbitHover={setOrbitHover}
            touchPrimedRef={touchPrimedRef}
          />
        );
      })}
      <ConnectionLines />
    </group>
  );
}

function Scene({
  constellationOffset,
  lowPower,
}: {
  constellationOffset: [number, number, number];
  lowPower: boolean;
}) {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <fog attach="fog" args={["#050d1a", 26, 78]} />
      <SceneLighting />
      <Stars
        radius={110}
        depth={70}
        count={lowPower ? 1500 : 2400}
        factor={lowPower ? 2.1 : 2.8}
        saturation={0}
        fade
        speed={0.38}
      />
      <Sparkles
        count={lowPower ? 64 : 100}
        scale={lowPower ? [12, 8, 12] : [14, 10, 14]}
        position={[0, 0.4, 0]}
        size={2.2}
        speed={0.25}
        opacity={lowPower ? 0.3 : 0.4}
        color="#7dd3fc"
        noise={0.22}
      />
      <Sparkles
        count={lowPower ? 28 : 45}
        scale={lowPower ? [7, 5, 7] : [8, 6, 8]}
        position={[0, 0.2, 0]}
        size={1.4}
        speed={0.4}
        opacity={lowPower ? 0.2 : 0.25}
        color="#00d4ff"
        noise={0.15}
      />
      <Grid
        position={[0, -2.15, -0.4]}
        args={[28, 28]}
        cellSize={0.28}
        cellThickness={0.55}
        cellColor="#0ea5e9"
        sectionSize={3.4}
        sectionThickness={0.85}
        sectionColor="#00d4ff"
        fadeDistance={32}
        fadeStrength={1.15}
        infiniteGrid
      />
      <ConstellationGroup mouseRef={mouseRef} groupPosition={constellationOffset} />
    </>
  );
}

function HeroSpinner() {
  return (
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
  );
}

/** CSS-only hero backdrop when WebGL cannot be created — fills the same box as Canvas. */
function TechSphereWebGLFallback({ variant = "hero" }: { variant?: "hero" | "compact" }) {
  const dim = variant === "hero" ? "72%" : "65%";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,212,255,0.12) 0%, transparent 55%)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: dim,
          height: dim,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background:
            "conic-gradient(from 200deg, rgba(14,165,233,0.45), rgba(0,212,255,0.35), rgba(56,189,248,0.3), rgba(129,140,248,0.25), rgba(14,165,233,0.45))",
          filter: "blur(42px)",
          opacity: 0.85,
          animation: "spin-slow 28s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "38%",
          height: "38%",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: "1px solid rgba(0,212,255,0.12)",
          boxShadow: "0 0 60px rgba(0,212,255,0.08)",
          animation: "spin-slow 18s linear infinite reverse",
        }}
      />
    </div>
  );
}

export type TechSphereProps = {
  variant?: "hero" | "compact";
};

function TechSphere({ variant = "hero" }: TechSphereProps) {
  const mounted = useClientOnly();
  const hostRef = useRef<HTMLDivElement>(null);
  const [tabHidden, setTabHidden] = useState(false);
  const [heroInView, setHeroInView] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(1280);

  const webglSupported = useMemo(
    () => (mounted ? canCreateWebGLContext() : true),
    [mounted]
  );

  useEffect(() => {
    const h = () => setTabHidden(document.hidden);
    h();
    document.addEventListener("visibilitychange", h);
    return () => document.removeEventListener("visibilitychange", h);
  }, []);

  useEffect(() => {
    const updateViewport = () => setViewportWidth(window.innerWidth);
    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e) setHeroInView(e.isIntersecting);
      },
      { root: null, rootMargin: "80px 0px 80px 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const isHero = variant === "hero";
  const cameraPosition: [number, number, number] = isHero ? [0, 0.22, 8.1] : [0, 0.5, 7];
  const cameraFov = isHero ? 50 : 50;
  const constellationOffset: [number, number, number] = isHero ? [0.12, 0, 0] : [2, 0, 0];
  const lowPower = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const deviceMemory = nav.deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency ?? 8;
    return viewportWidth < 900 || deviceMemory <= 4 || cores <= 4;
  }, [viewportWidth]);

  if (!mounted) return <HeroSpinner />;

  if (!webglSupported) {
    return (
      <div ref={hostRef} style={{ width: "100%", height: "100%", position: "relative" }}>
        <TechSphereWebGLFallback variant={variant} />
      </div>
    );
  }

  const dprCap = 2;
  const maxDpr =
    typeof window !== "undefined"
      ? Math.min(lowPower ? 1.2 : 1.5, Math.min(window.devicePixelRatio || 1, dprCap))
      : Math.min(lowPower ? 1.2 : 1.5, dprCap);

  const renderLoopActive = !tabHidden && heroInView;

  return (
    <div ref={hostRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        frameloop={renderLoopActive ? "always" : "never"}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          touchAction: "none",
        }}
        camera={{ fov: cameraFov, near: 0.1, far: 300, position: cameraPosition }}
        gl={{
          antialias: !lowPower,
          alpha: true,
          depth: true,
          stencil: false,
          preserveDrawingBuffer: false,
          powerPreference: lowPower ? "low-power" : "default",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.28;
          gl.setClearColor(0x000000, 0);
        }}
        dpr={[1, maxDpr]}
      >
        <Suspense fallback={null}>
          <ResumeRenderWhenVisible active={renderLoopActive} />
          <WebGLContextSafety maxDpr={maxDpr} clearAlpha={0} acesToneMapping />
          <Scene constellationOffset={constellationOffset} lowPower={lowPower} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default memo(TechSphere);
