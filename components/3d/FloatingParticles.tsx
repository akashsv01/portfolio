"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Deterministic 0–1 pseudo-random from seed (pure — safe during render). */
function rand01(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export default function FloatingParticles() {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const s0 = i * 3;
      positions[i * 3] = (rand01(s0) - 0.5) * 12;
      positions[i * 3 + 1] = rand01(s0 + 1) * 8;
      positions[i * 3 + 2] = (rand01(s0 + 2) - 0.5) * 8;
      speeds[i] = 0.2 + rand01(s0 + 3) * 0.5;
    }

    return { positions, speeds };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < speeds.length; i++) {
      const y = pos.getY(i);
      pos.setY(i, y + speeds[i] * 0.005);
      if (pos.getY(i) > 8) pos.setY(i, 0);

      // Subtle drift
      const x = pos.getX(i);
      pos.setX(i, x + Math.sin(t * 0.3 + i) * 0.001);
    }
    pos.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        color="#00d4ff"
        size={0.04}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
