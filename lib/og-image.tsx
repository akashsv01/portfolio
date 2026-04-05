import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 } as const;

const bg = {
  background: "linear-gradient(165deg, #050d1a 0%, #0a1628 50%, #050d1a 100%)",
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily:
    "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
} as const;

/** WhatsApp / Facebook use `og:image` for the preview — not the favicon. Embed the same asset so shares match your tab icon branding. */
export async function OgImageResponse() {
  let logoDataUrl: string | null = null;
  try {
    const buf = await readFile(join(process.cwd(), "public", "favicon.png"));
    logoDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    logoDataUrl = null;
  }

  if (logoDataUrl) {
    return new ImageResponse(
      (
        <div style={bg}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "92%",
              height: "72%",
            }}
          >
            {/* Landscape logo: fixed box + contain avoids stretch */}
            <img
              src={logoDataUrl}
              alt=""
              width={1000}
              height={360}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 26,
              color: "#7bacc4",
            }}
          >
            akashsvora.dev
          </div>
        </div>
      ),
      { ...OG_SIZE }
    );
  }

  return new ImageResponse(
    (
      <div style={bg}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#e2f4ff",
            letterSpacing: "-0.02em",
          }}
        >
          Akash S Vora
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "#00d4ff",
            marginTop: 16,
          }}
        >
          Software Engineer
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#7bacc4",
            marginTop: 28,
            textAlign: "center",
            maxWidth: 880,
            lineHeight: 1.35,
          }}
        >
          Portfolio · AI/ML · Masters @ UMD · Gold Medalist · Ex-Cisco
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
