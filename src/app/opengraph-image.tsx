import { ImageResponse } from "next/og";

export const alt = "CheckForMe — check an assignment for hidden AI traps";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#ffffff",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 42, fontWeight: 800 }}>
          <span style={{ color: "#12263f" }}>Check</span>
          <span style={{ color: "#127a3a" }}>ForMe</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 62,
            fontWeight: 800,
            color: "#12263f",
            lineHeight: 1.08,
            letterSpacing: -1,
            maxWidth: 980,
          }}
        >
          Check your assignment for hidden AI traps
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 28, color: "#5c6b80" }}>
          White text, tiny fonts, prompt injections. Files never leave your device.
        </div>
      </div>
    ),
    { ...size },
  );
}
