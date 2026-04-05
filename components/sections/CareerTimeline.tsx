"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import GlowOrb from "@/components/ui/GlowOrb";
import { careerTimeline } from "@/lib/data";

const kindLabel: Record<(typeof careerTimeline)[number]["kind"], string> = {
  education: "Education",
  internship: "Internship",
  fulltime: "Experience",
};

export default function CareerTimeline() {
  return (
    <section
      id="experience"
      className="career-path-section"
      style={{
        padding: "120px 0 110px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GlowOrb top="12%" left="-4%" color="rgba(0,212,255,0.07)" size={520} />
      <GlowOrb bottom="5%" right="-8%" color="rgba(167,139,250,0.06)" size={440} />

      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <SectionLabel text="Career Timeline" />
        <h2
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(26px, 4vw, 36px)",
            color: "var(--text)",
            margin: "14px 0 44px",
            letterSpacing: "-0.8px",
            lineHeight: 1.15,
          }}
        >
          From undergrad to{" "}
          <span className="gradient-text">graduate school</span>
        </h2>

        {/* Timeline rail + steps */}
        <div className="career-path-rail">
          {careerTimeline.map((node, i) => (
            <motion.article
              key={node.id}
              className="career-path-step"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.07, 0.35) }}
            >
              <div className="career-path-step__marker" aria-hidden>
                <span
                  className="career-path-step__dot"
                  style={{
                    background: node.color,
                    boxShadow: `0 0 0 4px ${node.color}22, 0 0 28px ${node.color}55`,
                  }}
                />
              </div>

              <div
                className="career-path-step__card"
                style={{
                  borderColor: `${node.color}28`,
                  background: `linear-gradient(145deg, ${node.color}08, rgba(0,212,255,0.02))`,
                }}
              >
                <div className="career-path-step__meta">
                  <span
                    className="career-path-step__kind"
                    style={{
                      color: node.color,
                      borderColor: `${node.color}35`,
                      background: `${node.color}10`,
                    }}
                  >
                    {kindLabel[node.kind]}
                  </span>
                  <time
                    className="career-path-step__period"
                    style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                  >
                    {node.period}
                  </time>
                </div>

                <h3 className="career-path-step__title">{node.title}</h3>
                <p className="career-path-step__subtitle" style={{ color: node.color }}>
                  {node.subtitle}
                </p>
                <p className="career-path-step__summary">{node.summary}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
