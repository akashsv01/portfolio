"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";

/* ── Smooth-scroll to a page section ── */
function nav(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* ── Canvas texture for monitor screens ── */
function makeScreenTex(lines: string[], bgColor: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 320;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 320);
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, 512, 26);
  [["#ff5f57", 12], ["#febc2e", 30], ["#28c840", 48]].forEach(([col, x]) => {
    ctx.beginPath();
    ctx.arc(x as number, 13, 5, 0, Math.PI * 2);
    ctx.fillStyle = col as string;
    ctx.fill();
  });
  ctx.font = "13px 'Courier New', monospace";
  lines.forEach((line, i) => {
    const y = 48 + i * 19;
    if (y > 308) return;
    ctx.fillStyle = line.startsWith("//") || line.startsWith("#")
      ? "#4ec9b0"
      : line.match(/\b(def |class |function |import |from |return |async )\b/)
      ? "#569cd6"
      : line.includes('"') || line.includes("'") ? "#ce9178" : "#d4d4d4";
    ctx.fillText(line, 10, y);
  });
  return new THREE.CanvasTexture(c);
}

/* ── Canvas texture for hover label chip ── */
function makeLabelTex(text: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 320; c.height = 72;
  const ctx = c.getContext("2d")!;
  // Background pill
  ctx.clearRect(0, 0, 320, 72);
  ctx.fillStyle = "rgba(5,13,26,0.92)";
  ctx.beginPath();
  ctx.roundRect(6, 8, 308, 56, 28);
  ctx.fill();
  // Border glow
  ctx.strokeStyle = "rgba(0,212,255,0.65)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(6, 8, 308, 56, 28);
  ctx.stroke();
  // Arrow + text
  ctx.fillStyle = "#00d4ff";
  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("→  " + text, 160, 36);
  return new THREE.CanvasTexture(c);
}

/* ── Pulsing glow ring at base of object ── */
function GlowRing({ radius = 0.35 }: { radius?: number }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const ring2 = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (mat.current) mat.current.opacity = 0.35 + Math.sin(t * 5) * 0.25;
    if (ring2.current) ring2.current.opacity = 0.15 + Math.sin(t * 5 + 1.5) * 0.1;
  });
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[radius, radius + 0.055, 40]} />
        <meshBasicMaterial ref={mat} color="#00d4ff" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <ringGeometry args={[radius + 0.07, radius + 0.13, 40]} />
        <meshBasicMaterial ref={ring2} color="#00d4ff" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ── Floating hover label (Billboard keeps it facing camera) ── */
function HoverLabel({ text, yOffset = 0.5 }: { text: string; yOffset?: number }) {
  const tex = useMemo(() => makeLabelTex(text), [text]);
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (meshRef.current) {
      meshRef.current.position.y = yOffset + Math.sin(s.clock.elapsedTime * 2.5) * 0.04;
    }
  });
  return (
    <Billboard follow lockX={false} lockY={false} lockZ={false}>
      <mesh ref={meshRef} position={[0, yOffset, 0]}>
        <planeGeometry args={[1.4, 0.32]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} />
      </mesh>
    </Billboard>
  );
}

/* ── Interactive Monitor ── */
function Monitor({
  position, rotation, lines, isMain, section, navLabel,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  lines: string[];
  isMain: boolean;
  section: string;
  navLabel: string;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);
  const tex = useMemo(() => makeScreenTex(lines, "#0a0f1e"), [lines]);
  const w = isMain ? 2.2 : 1.7;
  const h = isMain ? 1.3 : 1.0;

  useFrame((s) => {
    if (lightRef.current) {
      const base = hovered ? 2.5 : 1.2;
      lightRef.current.intensity = base + Math.sin(s.clock.elapsedTime * 1.8) * 0.2;
    }
  });

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); nav(section); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Outer glow highlight on hover */}
      {hovered && (
        <mesh>
          <boxGeometry args={[w + 0.22, h + 0.22, 0.1]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.06} />
        </mesh>
      )}

      {/* Bezel */}
      <mesh>
        <boxGeometry args={[w + 0.1, h + 0.1, 0.08]} />
        <meshStandardMaterial
          color="#0d1b2e" metalness={0.7} roughness={0.3}
          emissive="#001828"
          emissiveIntensity={hovered ? 1.8 : 0.3}
        />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      {/* Screen glow */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[w + 0.05, h + 0.05]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={hovered ? 0.12 : 0.04} />
      </mesh>
      {/* Stand neck */}
      <mesh position={[0, -h / 2 - 0.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 6]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Stand base */}
      <mesh position={[0, -h / 2 - 0.4, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.04, 12]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.8} roughness={0.2} />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0, 0.6]}
        intensity={hovered ? 2.5 : 1.2}
        color="#00d4ff" distance={4} decay={2}
      />

      {/* Hover effects */}
      {hovered && (
        <>
          <GlowRing radius={0.3} />
          <HoverLabel text={navLabel} yOffset={h / 2 + 0.45} />
        </>
      )}
    </group>
  );
}

/* ── Keyboard (interactive) ── */
function Keyboard({ position }: { position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); nav("contact"); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Base */}
      <mesh>
        <boxGeometry args={[1.5, 0.055, 0.5]} />
        <meshStandardMaterial
          color="#0d1b2e" metalness={0.5} roughness={0.4}
          emissive="#001522" emissiveIntensity={hovered ? 1.2 : 0.5}
        />
      </mesh>
      {/* Keys */}
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 10 }, (_, col) => (
          <mesh key={`${row}-${col}`} position={[-0.62 + col * 0.135, 0.042, -0.16 + row * 0.12]}>
            <boxGeometry args={[0.1, 0.02, 0.09]} />
            <meshStandardMaterial
              color="#0a1628" metalness={0.3} roughness={0.6}
              emissive="#00d4ff"
              emissiveIntensity={hovered ? 0.6 : (Math.random() > 0.88 ? 0.5 : 0.08)}
            />
          </mesh>
        ))
      )}
      {hovered && (
        <>
          <GlowRing radius={0.75} />
          <HoverLabel text="Contact Me" yOffset={0.35} />
        </>
      )}
    </group>
  );
}

/* ── Desk lamp ── */
function DeskLamp({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame((s) => {
    if (ref.current)
      ref.current.intensity = 1.5 + Math.sin(s.clock.elapsedTime * 0.7) * 0.2;
  });
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.1, 0.13, 0.05, 8]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.35, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.012, 0.012, 0.7, 6]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.18, 0.72, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.012, 0.012, 0.45, 6]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.32, 0.82, 0]} rotation={[0, 0, -1.1]}>
        <coneGeometry args={[0.1, 0.16, 8, 1, true]} />
        <meshStandardMaterial color="#0d1b2e" metalness={0.6} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <pointLight ref={ref} position={[-0.32, 0.7, 0]} intensity={1.5} color="#b8f0ff" distance={5} decay={2} />
    </group>
  );
}

/* ── Floating wireframe shapes ── */
function Floaters() {
  const icoRef = useRef<THREE.Mesh>(null);
  const cubeRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (icoRef.current) {
      icoRef.current.rotation.x = t * 0.5;
      icoRef.current.rotation.y = t * 0.7;
      icoRef.current.position.y = 3.8 + Math.sin(t * 0.9) * 0.18;
    }
    if (cubeRef.current) {
      cubeRef.current.rotation.x = t * 0.35;
      cubeRef.current.rotation.z = t * 0.55;
      cubeRef.current.position.y = 3.2 + Math.sin(t * 0.7 + 1.2) * 0.14;
    }
  });
  return (
    <>
      <mesh ref={icoRef} position={[-1.6, 3.8, -0.8]}>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.6} />
      </mesh>
      <mesh ref={cubeRef} position={[2.0, 3.2, -1.6]}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.5} />
      </mesh>
    </>
  );
}

/* ── Bookshelf (interactive → Experience) ── */
function Bookshelf({ position }: { position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const books = [
    { color: "#00d4ff", w: 0.1 }, { color: "#818cf8", w: 0.09 },
    { color: "#34d399", w: 0.12 }, { color: "#f472b6", w: 0.08 },
    { color: "#fb923c", w: 0.1 }, { color: "#0ea5e9", w: 0.11 },
  ];
  let xOff = -0.38;

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); nav("experience"); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Shelf base */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.9, 0.05, 0.25]} />
        <meshStandardMaterial
          color="#0d1b2e" metalness={0.4} roughness={0.6}
          emissive="#001020" emissiveIntensity={hovered ? 1.0 : 0.3}
        />
      </mesh>
      {/* Back panel */}
      <mesh position={[0, 0.33, -0.1]}>
        <boxGeometry args={[0.9, 0.6, 0.04]} />
        <meshStandardMaterial
          color="#0a1628" metalness={0.3} roughness={0.7}
          emissive="#000810" emissiveIntensity={hovered ? 0.8 : 0.3}
        />
      </mesh>
      {/* Books */}
      {books.map((b, i) => {
        const x = xOff + b.w / 2;
        xOff += b.w + 0.015;
        return (
          <mesh key={i} position={[x, 0.28, 0]}>
            <boxGeometry args={[b.w, 0.48, 0.2]} />
            <meshStandardMaterial
              color={b.color} roughness={0.7}
              emissive={b.color} emissiveIntensity={hovered ? 0.55 : 0.2}
              transparent opacity={0.9}
            />
          </mesh>
        );
      })}
      {hovered && (
        <>
          <GlowRing radius={0.52} />
          <HoverLabel text="Experience" yOffset={0.75} />
        </>
      )}
    </group>
  );
}

/* ── Main export ── */
export default function DeskSetup() {
  const mainLines = [
    "// GenAI RAG Pipeline",
    "import { OpenAI } from 'openai'",
    "import { Pinecone } from '@pinecone'",
    "",
    "async function retrieve(query) {",
    "  const emb = await embed(query)",
    "  const docs = await index.query({",
    "    vector: emb, topK: 5",
    "  })",
    "  return generate(docs, query)",
    "}",
    "",
    "// 28% faster resolution ✓",
  ];
  const sideLines = [
    "# ML Model Training",
    "import tensorflow as tf",
    "from sklearn import metrics",
    "",
    "model = tf.Sequential([",
    "  Dense(128, activation='relu'),",
    "  Dropout(0.2),",
    "  Dense(64),",
    "  Dense(10, 'softmax')",
    "])",
    "model.compile('adam','mse')",
    "model.fit(X_train, y_train)",
    "# acc: 95.2% ✓",
  ];

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#040b16" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Floor grid */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.05} />
      </mesh>

      {/* Desk surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5.5, 0.1, 2.8]} />
        <meshStandardMaterial
          color="#0d1b2e" metalness={0.5} roughness={0.35}
          emissive="#001525" emissiveIntensity={0.4}
        />
      </mesh>
      {/* Desk edge glow strip */}
      <mesh position={[0, -0.04, 1.38]}>
        <boxGeometry args={[5.3, 0.02, 0.04]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} />
      </mesh>
      {/* Desk legs */}
      {([-2.3, 2.3] as number[]).flatMap((x) =>
        ([-1.1, 1.1] as number[]).map((z, j) => (
          <mesh key={`${x}-${j}`} position={[x, -0.6, z]}>
            <boxGeometry args={[0.07, 1.1, 0.07]} />
            <meshStandardMaterial color="#0a1628" metalness={0.7} roughness={0.3} emissive="#000a14" emissiveIntensity={0.3} />
          </mesh>
        ))
      )}

      {/* ── Interactive Monitors ── */}
      <Monitor
        position={[0.2, 1.95, -0.55]}
        rotation={[0.04, 0, 0]}
        lines={mainLines}
        isMain={true}
        section="projects"
        navLabel="View Projects"
      />
      <Monitor
        position={[-2.0, 1.75, 0.1]}
        rotation={[0.04, 0.52, 0]}
        lines={sideLines}
        isMain={false}
        section="skills"
        navLabel="My Skills"
      />

      {/* ── Interactive Keyboard ── */}
      <Keyboard position={[0.2, 0.08, 0.65]} />

      {/* Trackpad */}
      <mesh position={[1.35, 0.08, 0.65]}>
        <boxGeometry args={[0.48, 0.025, 0.33]} />
        <meshStandardMaterial color="#0d1b2e" metalness={0.6} roughness={0.3} emissive="#001020" emissiveIntensity={0.4} />
      </mesh>
      {/* Mouse */}
      <mesh position={[1.95, 0.08, 0.55]}>
        <boxGeometry args={[0.18, 0.04, 0.28]} />
        <meshStandardMaterial color="#0d1b2e" metalness={0.6} roughness={0.3} emissive="#001020" emissiveIntensity={0.4} />
      </mesh>

      {/* Coffee mug */}
      <group position={[-1.7, 0.08, 0.45]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.085, 0.22, 10]} />
          <meshStandardMaterial color="#1a2a3a" metalness={0.4} roughness={0.5} emissive="#001020" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Small plant */}
      <group position={[2.1, 0.1, -0.35]}>
        <mesh>
          <cylinderGeometry args={[0.09, 0.07, 0.13, 8]} />
          <meshStandardMaterial color="#1a2a3a" roughness={0.7} emissive="#000810" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#1a4a2e" roughness={0.8} emissive="#0a2a12" emissiveIntensity={0.4} />
        </mesh>
      </group>

      <DeskLamp position={[2.1, 0.08, -0.75]} />

      {/* ── Interactive Bookshelf ── */}
      <Bookshelf position={[-2.0, 0.12, -0.55]} />

      <Floaters />
    </group>
  );
}
