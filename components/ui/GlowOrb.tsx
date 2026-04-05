interface GlowOrbProps {
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  color?: string;
  size?: number;
  opacity?: number;
  /** Use -1 to sit behind full-bleed canvases (e.g. hero 3D). */
  zIndex?: number;
}

export default function GlowOrb({
  top,
  left,
  right,
  bottom,
  color = "rgba(0, 212, 255, 0.06)",
  size = 500,
  opacity = 1,
  zIndex = 0,
}: GlowOrbProps) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        top,
        left,
        right,
        bottom,
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex,
        opacity,
      }}
    />
  );
}
