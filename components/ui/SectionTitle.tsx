import type { CSSProperties, ReactNode } from "react";

/** Bold white title + short cyan gradient underline (matches new portfolio sections). */
export default function SectionTitle({
  children,
  style,
  noLabelSpacing,
}: {
  children: ReactNode;
  style?: CSSProperties;
  /** When there is no SectionLabel above, tighten top margin. */
  noLabelSpacing?: boolean;
}) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-syne), sans-serif",
        fontWeight: 800,
        fontSize: "clamp(26px, 4vw, 36px)",
        color: "var(--text)",
        margin: noLabelSpacing ? "0 0 44px" : "14px 0 44px",
        letterSpacing: "-0.8px",
        lineHeight: 1.2,
        ...style,
      }}
    >
      {children}
      <span
        aria-hidden
        style={{
          display: "block",
          width: 56,
          height: 3,
          marginTop: 14,
          borderRadius: 2,
          background: "linear-gradient(90deg, var(--accent), rgba(0, 212, 255, 0.2))",
        }}
      />
    </h2>
  );
}
