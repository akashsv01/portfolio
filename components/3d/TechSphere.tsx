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
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Billboard, Grid, MeshDistortMaterial, Sparkles, Html } from "@react-three/drei";
import * as THREE from "three";
import { personal } from "@/lib/data";
import { useClientOnly } from "@/lib/useClientOnly";

function nav(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/** Retina-scale canvas labels so billboards stay sharp (no blurry 12px textures). */
function makeLabelTex(text: string, fg: string): THREE.CanvasTexture {
  const padX = 18;
  const logicalH = 36;
  const fontSize = 14;
  const charW = 8.4;
  const logicalW = Math.min(
    168,
    Math.max(88, Math.ceil(text.length * charW) + padX * 2)
  );

  const pr =
    typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 2) : 2;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(2, Math.floor(logicalW * pr));
  canvas.height = Math.max(2, Math.floor(logicalH * pr));
  const ctx = canvas.getContext("2d", { alpha: true })!;
  ctx.setTransform(pr, 0, 0, pr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const w = logicalW;
  const h = logicalH;
  const r = 10;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "rgba(5,13,26,0.96)");
  bg.addColorStop(1, "rgba(10,22,40,0.94)");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  const border = ctx.createLinearGradient(0, 0, w, 0);
  border.addColorStop(0, "rgba(0,212,255,0.6)");
  border.addColorStop(0.5, "rgba(14,165,233,0.42)");
  border.addColorStop(1, "rgba(129,140,248,0.5)");
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.35;
  ctx.stroke();

  ctx.fillStyle = fg;
  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const midY = Math.round((h / 2) * 10) / 10;
  ctx.fillText(text, w / 2, midY);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 8;
  return tex;
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

// ── Section nodes (portfolio nav) ───────────────────────────────────────────
const TAU = Math.PI * 2;
const SECTION_NODES = [
  { id: "projects", label: "Projects", color: "#00d4ff", angle: (TAU * 0) / 5, yOff: 0.22 },
  { id: "skills", label: "Skills", color: "#38bdf8", angle: (TAU * 1) / 5, yOff: -0.28 },
  { id: "experience", label: "Experience", color: "#7dd3fc", angle: (TAU * 2) / 5, yOff: 0.35 },
  { id: "terminal", label: "Terminal", color: "#a78bfa", angle: (TAU * 3) / 5, yOff: -0.2 },
  { id: "contact", label: "Contact", color: "#0ea5e9", angle: (TAU * 4) / 5, yOff: -0.16 },
] as const;

const SECTION_R = 1.52;

type SectionNodeProps = (typeof SECTION_NODES)[number] & {
  hoverKey: string;
  orbitHover: string | null;
  setOrbitHover: Dispatch<SetStateAction<string | null>>;
};

function SectionNode({
  id,
  label,
  color,
  angle,
  yOff,
  hoverKey,
  orbitHover,
  setOrbitHover,
}: SectionNodeProps) {
  const x = Math.cos(angle) * SECTION_R;
  const z = Math.sin(angle) * SECTION_R;

  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const labelMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const hovered = orbitHover === hoverKey;

  const labelTex = useMemo(() => makeLabelTex(label, "#e8f8ff"), [label]);
  useEffect(() => () => labelTex.dispose(), [labelTex]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const target = hovered ? 2.8 : 0.55 + Math.sin(t * 2.1 + angle) * 0.28;
    mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.14;
    const sc = hovered ? 1.22 : 1.0;
    meshRef.current.scale.setScalar(
      meshRef.current.scale.x + (sc - meshRef.current.scale.x) * 0.12
    );
    if (haloRef.current) {
      const hm = haloRef.current.material as THREE.MeshBasicMaterial;
      hm.opacity += ((hovered ? 0.22 : 0.05) - hm.opacity) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * (hovered ? 2.2 : 0.9);
    }
    if (labelMatRef.current) {
      const targetOp = hovered ? 1 : 0;
      labelMatRef.current.opacity += (targetOp - labelMatRef.current.opacity) * 0.16;
    }
  });

  return (
    <group position={[x, yOff, z]}>
      {/* Large invisible hit target so hover persists over the floating label */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          nav(id);
        }}
        onPointerOver={() => setOrbitHover(hoverKey)}
        onPointerOut={() => setOrbitHover((prev) => (prev === hoverKey ? null : prev))}
        onPointerDown={(e) => {
          /* Touch has no hover — show label on tap before click/navigation */
          if (e.pointerType === "touch") setOrbitHover(hoverKey);
        }}
      >
        <sphereGeometry args={[0.62, 20, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.11, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.65}
          roughness={0.12}
          metalness={0.92}
          flatShading
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.006, 6, 28]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.75 : 0.28} />
      </mesh>
      <Billboard position={[0, 0.34, 0]}>
        <mesh raycast={() => {}}>
          <planeGeometry args={[0.92, 0.22]} />
          <meshBasicMaterial
            ref={labelMatRef}
            map={labelTex}
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}

// ── Clickable artifact figures (no skill labels — pure 3D + tooltips) ───────
const ARTIFACT_OUTER_R = 2.62;

const ARTIFACTS = [
  {
    id: "artifact-knot",
    angle: (Math.PI * 2 * 0) / 6 + 0.12,
    r: ARTIFACT_OUTER_R,
    y: 0.52,
    color: "#00d4ff",
    hoverLabel: "Projects",
    action: { kind: "section" as const, id: "projects" },
    figure: "torusKnot" as const,
  },
  {
    id: "artifact-lattice",
    angle: (Math.PI * 2 * 1) / 6 + 0.12,
    r: ARTIFACT_OUTER_R,
    y: -0.46,
    color: "#38bdf8",
    hoverLabel: "Skills",
    action: { kind: "section" as const, id: "skills" },
    figure: "lattice" as const,
  },
  {
    id: "artifact-stack",
    angle: (Math.PI * 2 * 2) / 6 + 0.12,
    r: ARTIFACT_OUTER_R,
    y: 0.58,
    color: "#7dd3fc",
    hoverLabel: "Experience",
    action: { kind: "section" as const, id: "experience" },
    figure: "stack" as const,
  },
  {
    id: "artifact-beacon",
    angle: (Math.PI * 2 * 3) / 6 + 0.12,
    r: ARTIFACT_OUTER_R,
    y: -0.5,
    color: "#0ea5e9",
    hoverLabel: "Contact",
    action: { kind: "section" as const, id: "contact" },
    figure: "beacon" as const,
  },
  {
    id: "artifact-fork",
    angle: (Math.PI * 2 * 4) / 6 + 0.12,
    r: ARTIFACT_OUTER_R,
    y: 0.4,
    color: "#a78bfa",
    hoverLabel: "GitHub",
    action: { kind: "external" as const, url: personal.github },
    figure: "fork" as const,
  },
  {
    id: "artifact-prism",
    angle: (Math.PI * 2 * 5) / 6 + 0.12,
    r: ARTIFACT_OUTER_R,
    y: -0.42,
    color: "#60a5fa",
    hoverLabel: "LinkedIn",
    action: { kind: "external" as const, url: personal.linkedin },
    figure: "prism" as const,
  },
] as const;

function ArtifactFigureVisual({
  figure,
  color,
  spinRef,
}: {
  figure: (typeof ARTIFACTS)[number]["figure"];
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

function InteractiveArtifact({
  position,
  hoverLabel,
  action,
  color,
  figure,
  hoverKey,
  orbitHover,
  setOrbitHover,
}: {
  position: [number, number, number];
  hoverLabel: string;
  action: ArtifactAction;
  color: string;
  figure: (typeof ARTIFACTS)[number]["figure"];
  hoverKey: string;
  orbitHover: string | null;
  setOrbitHover: Dispatch<SetStateAction<string | null>>;
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
      const target = hovered ? 1.12 : 1;
      const cur = visualRef.current.scale.x;
      const next = cur + (target - cur) * 0.14;
      visualRef.current.scale.setScalar(next);
    }
  });

  const onActivate = () => {
    pulseRef.current = 1;
    runArtifactAction(action);
  };

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onActivate();
        }}
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
          pointerEvents: hovered ? "auto" : "none",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "optimizeLegibility",
        }}
      >
        <div
          role="presentation"
          onPointerEnter={() => setOrbitHover(hoverKey)}
          onPointerLeave={() => setOrbitHover((prev) => (prev === hoverKey ? null : prev))}
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
            transition: "opacity 0.22s ease",
          }}
        >
          {hoverLabel}
        </div>
      </Html>
    </group>
  );
}

// ── Data-flow lines ─────────────────────────────────────────────────────────
function ConnectionLines() {
  const innerGeom = useMemo(() => {
    const pts: number[] = [];
    SECTION_NODES.forEach((n) => {
      pts.push(0, 0, 0);
      pts.push(Math.cos(n.angle) * SECTION_R, n.yOff, Math.sin(n.angle) * SECTION_R);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  const outerGeom = useMemo(() => {
    const pts: number[] = [];
    ARTIFACTS.forEach((a) => {
      const tx = Math.cos(a.angle) * a.r;
      const tz = Math.sin(a.angle) * a.r;
      let minDist = Infinity;
      let nearestAngle = 0;
      let nearestY = 0;
      SECTION_NODES.forEach((s) => {
        const sx = Math.cos(s.angle) * SECTION_R;
        const sz = Math.sin(s.angle) * SECTION_R;
        const d = Math.hypot(tx - sx, tz - sz);
        if (d < minDist) {
          minDist = d;
          nearestAngle = s.angle;
          nearestY = s.yOff;
        }
      });
      pts.push(Math.cos(nearestAngle) * SECTION_R, nearestY, Math.sin(nearestAngle) * SECTION_R);
      pts.push(tx, a.y, tz);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useEffect(() => {
    return () => {
      innerGeom.dispose();
      outerGeom.dispose();
    };
  }, [innerGeom, outerGeom]);

  const innerMat = useRef<THREE.LineBasicMaterial>(null);
  const outerMat = useRef<THREE.LineBasicMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.55 + Math.sin(t * 1.85) * 0.45;
    if (innerMat.current) {
      innerMat.current.opacity = 0.14 + pulse * 0.1;
    }
    if (outerMat.current) {
      outerMat.current.opacity = 0.05 + pulse * 0.055;
    }
  });

  return (
    <group>
      <lineSegments geometry={innerGeom}>
        <lineBasicMaterial
          ref={innerMat}
          color="#7dd3fc"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      <lineSegments geometry={outerGeom}>
        <lineBasicMaterial
          ref={outerMat}
          color="#00d4ff"
          transparent
          opacity={0.09}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
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
  /** Single hover target across inner section nodes + outer artifacts (avoids duplicate labels, e.g. two "Experience"). */
  const [orbitHover, setOrbitHover] = useState<string | null>(null);

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
      <OrbitalPath radius={SECTION_R} tilt={0.08} />
      <OrbitalPath radius={ARTIFACT_OUTER_R} tilt={-0.06} />
      {SECTION_NODES.map((n) => (
        <SectionNode
          key={n.id}
          {...n}
          hoverKey={`section:${n.id}`}
          orbitHover={orbitHover}
          setOrbitHover={setOrbitHover}
        />
      ))}
      {ARTIFACTS.map((a) => {
        const x = Math.cos(a.angle) * a.r;
        const z = Math.sin(a.angle) * a.r;
        return (
          <InteractiveArtifact
            key={a.id}
            position={[x, a.y, z]}
            hoverLabel={a.hoverLabel}
            action={a.action}
            color={a.color}
            figure={a.figure}
            hoverKey={`artifact:${a.id}`}
            orbitHover={orbitHover}
            setOrbitHover={setOrbitHover}
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

export type TechSphereProps = {
  variant?: "hero" | "compact";
};

function TechSphere({ variant = "hero" }: TechSphereProps) {
  const mounted = useClientOnly();
  const [tabHidden, setTabHidden] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1280);

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

  const maxDpr = typeof window !== "undefined"
    ? Math.min(lowPower ? 1.2 : 1.5, window.devicePixelRatio || 1.5)
    : lowPower ? 1.2 : 1.5;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        frameloop={tabHidden ? "never" : "always"}
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
          powerPreference: "default",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.28;
          gl.setClearColor(0x000000, 0);
        }}
        dpr={[1, maxDpr]}
      >
        <Suspense fallback={null}>
          <Scene constellationOffset={constellationOffset} lowPower={lowPower} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default memo(TechSphere);
