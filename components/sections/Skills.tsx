"use client";

import FadeIn from "@/components/ui/FadeIn";
import SectionLabel from "@/components/ui/SectionLabel";
import GlowOrb from "@/components/ui/GlowOrb";
import SkillsNetwork from "@/components/sections/SkillsNetwork";

export default function Skills() {
  return (
    <section
      id="skills"
      style={{ padding: "120px 32px", position: "relative", overflow: "hidden" }}
    >
      <GlowOrb top="50%" left="90%" color="rgba(0,212,255,0.04)" size={450} />

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        <FadeIn>
          <SectionLabel text="Skills Network" />
        </FadeIn>

        <FadeIn delay={0.08}>
          <SkillsNetwork />
        </FadeIn>
      </div>
    </section>
  );
}
