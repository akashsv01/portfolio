interface SectionLabelProps {
  text: string;
}

export default function SectionLabel({ text }: SectionLabelProps) {
  return (
    <div style={{ marginBottom: 52 }}>
      <span
        style={{
          fontFamily: "var(--font-dm-mono), monospace",
          fontSize: 11,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "4px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            width: 40,
            height: 1,
            background: "linear-gradient(90deg, var(--accent), transparent)",
            display: "block",
            flexShrink: 0,
          }}
        />
        {text}
        <span
          style={{
            flex: 1,
            height: 1,
            background: "linear-gradient(90deg, rgba(0,212,255,0.2), transparent)",
            display: "block",
          }}
        />
      </span>
    </div>
  );
}
