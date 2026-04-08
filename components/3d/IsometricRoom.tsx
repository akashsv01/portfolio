"use client";

import { Suspense, useRef, useEffect } from "react";
import { useClientOnly } from "@/lib/useClientOnly";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import DeskSetup from "./DeskSetup";
import FloatingParticles from "./FloatingParticles";
import WebGLContextSafety from "@/components/3d/WebGLContextSafety";

/*
  Camera setup: R3F orthographic canvas puts camera at [0,0,5] looking at origin.
  We override every frame to force isometric position + lookAt.
  Scene group handles subtle mouse rotation so camera stays fixed.
*/
function CameraSetup() {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.set(10, 12, 10);
    camera.lookAt(0, 0.8, 0);
    camera.updateMatrixWorld(true);
  });

  return null;
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTarget.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y +=
      (mouseTarget.current.x * 0.1 - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x +=
      (-mouseTarget.current.y * 0.04 - groupRef.current.rotation.x) * 0.04;
    groupRef.current.rotation.y +=
      Math.sin(state.clock.elapsedTime * 0.15) * 0.0004;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={1.5} color="#4488aa" />
      <directionalLight position={[5, 10, 5]} intensity={2} color="#00d4ff" />
      <directionalLight position={[-3, 8, -4]} intensity={1} color="#0ea5e9" />
      <pointLight position={[0, 4, 3]} intensity={3} color="#00d4ff" distance={12} decay={2} />
      <pointLight position={[-3, 3, -3]} intensity={1.5} color="#818cf8" distance={10} decay={2} />

      <DeskSetup />
      <FloatingParticles />
    </group>
  );
}

function Spinner() {
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
          width: 36,
          height: 36,
          border: "2px solid rgba(0,212,255,0.15)",
          borderTop: "2px solid #00d4ff",
          borderRadius: "50%",
          animation: "spin-slow 1s linear infinite",
        }}
      />
    </div>
  );
}

export default function IsometricRoom() {
  const mounted = useClientOnly();
  if (!mounted) return <Spinner />;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(5,13,26,0.6) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <Canvas
        orthographic
        dpr={[1, 1.5]}
        camera={{ position: [10, 12, 10], zoom: 52, near: 0.1, far: 300 }}
        gl={{
          antialias: true,
          alpha: true,
          depth: true,
          stencil: false,
          preserveDrawingBuffer: false,
          powerPreference: "default",
        }}
        style={{ background: "transparent" }}
      >
        <CameraSetup />
        <Suspense fallback={null}>
          <WebGLContextSafety maxDpr={1.5} clearAlpha={0} />
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
