"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export default function SkillsNetworkParticles() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      particles: {
        number: { value: 32 },
        color: { value: "#00d4ff" },
        opacity: { value: { min: 0.06, max: 0.28 } },
        size: { value: { min: 0.35, max: 1.4 } },
        move: {
          enable: true,
          speed: { min: 0.12, max: 0.38 },
          direction: "none",
          random: true,
          outModes: { default: "bounce" },
        },
        links: {
          enable: true,
          distance: 64,
          opacity: 0.05,
          width: 0.35,
          color: "#38bdf8",
        },
      },
      interactivity: {
        events: {
          onHover: { enable: false },
          onClick: { enable: false },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!ready) return null;

  return (
    <Particles
      id="skills-network-tsparticles"
      className="skills-network-particles-canvas"
      options={options}
    />
  );
}
