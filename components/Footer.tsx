export default function Footer() {
  return (
    <footer
      style={{
        padding: "32px",
        textAlign: "center",
        borderTop: "1px solid rgba(0, 212, 255, 0.06)",
        position: "relative",
        zIndex: 2,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-dm-mono), monospace",
          fontSize: 12,
          color: "var(--muted)",
          margin: 0,
          letterSpacing: "0.5px",
        }}
      >
        © 2026{" "}
        <span style={{ color: "var(--accent)" }}>Akash S Vora</span>
        {" "}·{" "}
        Designed & Built with{" "}
        <span style={{ color: "#e74c3c" }}>♥</span>
      </p>
    </footer>
  );
}
