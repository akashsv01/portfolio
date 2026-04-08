"use client";

import { useEffect } from "react";
import { useThree, invalidate } from "@react-three/fiber";
import * as THREE from "three";

type WebGLContextSafetyProps = {
  /** Upper bound passed from Canvas `dpr={[1, maxDpr]}` — must match after restore. */
  maxDpr: number;
  /** Re-apply after restore if `onCreated` set these (hero TechSphere). */
  clearAlpha?: number;
  /** Hero scene uses ACES in `onCreated` — re-apply after restore only when true. */
  acesToneMapping?: boolean;
};

/**
 * Handles `webglcontextlost` / `webglcontextrestored`:
 * - Calling `preventDefault()` on the lost event is required so the browser may fire
 *   `webglcontextrestored` instead of leaving the page permanently broken.
 * - On restore, pixel ratio and clear color are reset; R3F is nudged to re-render.
 */
export default function WebGLContextSafety({
  maxDpr,
  clearAlpha = 0,
  acesToneMapping = false,
}: WebGLContextSafetyProps) {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const canvas = gl.domElement;

    const onContextLost = (event: Event) => {
      event.preventDefault();
    };

    const onContextRestored = () => {
      const pr = Math.min(
        maxDpr,
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
      );
      gl.setPixelRatio(pr);
      gl.setClearColor(0x000000, clearAlpha);
      if (acesToneMapping) {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.28;
      }
      invalidate();
    };

    canvas.addEventListener("webglcontextlost", onContextLost, false);
    canvas.addEventListener("webglcontextrestored", onContextRestored, false);

    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, [gl, maxDpr, clearAlpha, acesToneMapping]);

  return null;
}
