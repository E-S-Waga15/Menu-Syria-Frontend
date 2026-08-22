import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Menu Syria — QR Digital Menus & Online Stores";

/**
 * Brand share card. Latin text only — Arabic glyphs would need a bundled
 * font file for the OG renderer; the page <title> carries the Arabic.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #850036 0%, #b0004a 60%, #fe9800 140%)",
          color: "#ffffff",
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        <div style={{ display: "flex" }}>Menu Syria</div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 34,
            fontWeight: 400,
            opacity: 0.9,
            letterSpacing: 0,
          }}
        >
          QR Digital Menus & Online Stores — Syria
        </div>
      </div>
    ),
    size,
  );
}
