"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import SectionLabel from "@/components/ui/SectionLabel";
import GlowOrb from "@/components/ui/GlowOrb";
import { CISCO_ISSUER_LOGO, certifications } from "@/lib/certifications";

export default function Certifications() {
  return (
    <section
      id="certifications"
      style={{
        padding: "120px clamp(20px, 4vw, 40px) 100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GlowOrb top="8%" right="-6%" color="rgba(0, 212, 255, 0.06)" size={480} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <FadeIn>
          <SectionLabel text="Licenses & Certifications" />
        </FadeIn>

        <FadeIn delay={0.08}>
        <div className="cert-scroll-row">
          {certifications.map((c, i) => (
            <motion.article
              key={c.id}
              className="cert-card-glass"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 16px 48px rgba(0, 212, 255, 0.12)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CISCO_ISSUER_LOGO}
                  alt="Cisco"
                  style={{
                    height: 36,
                    width: "auto",
                    maxWidth: 120,
                    objectFit: "contain",
                  }}
                />
              </div>

              <div
                className="cert-badge-frame"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 132,
                  marginBottom: 18,
                  padding: "12px 10px",
                  borderRadius: 14,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(0, 212, 255, 0.1)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.badgeImage}
                  alt=""
                  style={{
                    maxHeight: 118,
                    maxWidth: "100%",
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  fontWeight: 700,
                  fontSize: 17,
                  color: "var(--text)",
                  margin: "0 0 10px",
                  lineHeight: 1.35,
                }}
              >
                {c.name}
              </h3>

              <p style={{ margin: "0 0 6px", fontSize: 14 }}>
                <a
                  href={c.issuerUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--accent)",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}
                >
                  {c.issuer}
                </a>
              </p>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 13,
                  color: "var(--muted)",
                  margin: "0 0 16px",
                }}
              >
                Issued {c.issued}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                {c.skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-dm-mono), monospace",
                      padding: "4px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(0, 212, 255, 0.2)",
                      color: "var(--text-muted)",
                      background: "rgba(0, 212, 255, 0.04)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <a
                href={c.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--accent)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Show Credential
                <span aria-hidden>-&gt;</span>
              </a>
            </motion.article>
          ))}
        </div>
        </FadeIn>
      </div>
    </section>
  );
}
