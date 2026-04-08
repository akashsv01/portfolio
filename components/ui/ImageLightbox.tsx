"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  src: string | null;
  alt?: string;
  onClose: () => void;
};

export default function ImageLightbox({ src, alt = "Enlarged image", onClose }: Props) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [src, onClose]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
            background: "rgba(2, 8, 18, 0.88)",
            backdropFilter: "blur(10px)",
          }}
          onClick={onClose}
        >
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              position: "absolute",
              top: "max(16px, env(safe-area-inset-top))",
              right: "max(16px, env(safe-area-inset-right))",
              width: 44,
              height: 44,
              borderRadius: 12,
              border: "1px solid rgba(0, 212, 255, 0.3)",
              background: "rgba(0, 212, 255, 0.08)",
              color: "var(--text)",
              cursor: "pointer",
              fontSize: 22,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </motion.button>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{
              position: "relative",
              maxWidth: "min(96vw, 1200px)",
              maxHeight: "min(88vh, 900px)",
              margin: "0 auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "min(88vh, 900px)",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: 8,
                boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6)",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
