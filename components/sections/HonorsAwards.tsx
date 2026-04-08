"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import SectionLabel from "@/components/ui/SectionLabel";
import GlowOrb from "@/components/ui/GlowOrb";
import ImageLightbox from "@/components/ui/ImageLightbox";
import { honors } from "@/lib/honors";

export default function HonorsAwards() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  return (
    <section
      id="honors"
      style={{
        padding: "100px clamp(20px, 4vw, 40px) 120px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GlowOrb top="30%" right="10%" color="rgba(167, 139, 250, 0.05)" size={420} />

      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <FadeIn>
          <SectionLabel text="Honors & Awards" />
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="honors-grid">
            {honors.map((h, i) => (
              <HonorCard
                key={h.id}
                honor={h}
                index={i}
                onOpenImage={(src) => setLightboxSrc(src)}
              />
            ))}
          </div>
        </FadeIn>
      </div>

      <ImageLightbox src={lightboxSrc} alt="Award certificate" onClose={closeLightbox} />
    </section>
  );
}

function HonorCard({
  honor,
  index,
  onOpenImage,
}: {
  honor: (typeof honors)[number];
  index: number;
  onOpenImage: (src: string) => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  const showImg = honor.imageSrc && !imgFailed;

  return (
    <motion.article
      className="honor-card-glass"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.28) }}
      whileHover={{ scale: 1.015, boxShadow: "0 14px 44px rgba(0, 212, 255, 0.1)" }}
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(0, 212, 255, 0.12)",
        background: "rgba(8, 18, 32, 0.5)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 200,
          background: honor.placeholderGradient,
        }}
      >
        {showImg ? (
          interactive ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpenImage(honor.imageSrc!)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenImage(honor.imageSrc!);
                }
              }}
              aria-label={`View full ${honor.title} certificate`}
              className="honor-cert-trigger"
              style={{
                padding: 0,
                margin: 0,
                width: "100%",
                height: "100%",
                cursor: "zoom-in",
                display: "block",
                background: "transparent",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={honor.imageSrc!}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  pointerEvents: "none",
                }}
                onError={() => setImgFailed(true)}
              />
            </div>
          ) : (
            <div
              style={{
                padding: 0,
                margin: 0,
                width: "100%",
                height: "100%",
                display: "block",
                background: "transparent",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={honor.imageSrc!}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
                onError={() => setImgFailed(true)}
              />
            </div>
          )
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: honor.placeholderGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 800,
              fontSize: 14,
              color: "rgba(0, 212, 255, 0.35)",
              letterSpacing: 2,
            }}
          >
            AWARD
          </div>
        )}
      </div>
      <div style={{ padding: "20px 22px 22px", flex: 1 }}>
        <h3
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "var(--text)",
            margin: "0 0 10px",
            lineHeight: 1.3,
          }}
        >
          {honor.title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--accent)",
            margin: "0 0 12px",
            lineHeight: 1.5,
          }}
        >
          {honor.organization}
          <span style={{ color: "var(--muted)", fontWeight: 500 }}> · {honor.dateLine}</span>
        </p>
        <p
          style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 14,
            color: "var(--text-muted)",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {honor.description}
        </p>
      </div>
    </motion.article>
  );
}
