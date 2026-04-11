import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "What Trump Says — Trump Truth Social Archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#141414",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 90px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Orange accent bar left */}
        <div style={{ position: "absolute", left: 0, top: 0, width: "10px", height: "100%", background: "#E8561A" }} />

        {/* Orange top strip */}
        <div style={{
          position: "absolute", top: 0, left: 10, right: 0, height: "52px",
          background: "#E8561A", display: "flex", alignItems: "center", padding: "0 48px"
        }}>
          <span style={{ color: "#141414", fontSize: "13px", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase" }}>
            ★ LIVE ARCHIVE INTERFACE ★
          </span>
        </div>

        {/* Main title */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "28px" }}>
          <span style={{ fontSize: "110px", fontWeight: 900, color: "#F0EEE8", lineHeight: 0.9, letterSpacing: "-2px", textTransform: "uppercase" }}>
            WHAT
          </span>
          <span style={{ fontSize: "110px", fontWeight: 900, color: "#E8561A", lineHeight: 0.9, letterSpacing: "-2px", textTransform: "uppercase" }}>
            TRUMP
          </span>
          <span style={{ fontSize: "110px", fontWeight: 900, color: "#F0EEE8", lineHeight: 0.9, letterSpacing: "-2px", textTransform: "uppercase" }}>
            SAYS
          </span>
        </div>

        {/* Yellow rule */}
        <div style={{ width: "80px", height: "5px", background: "#FFD000", margin: "28px 0 20px" }} />

        {/* Description */}
        <div style={{ fontSize: "22px", color: "#7A84B0", lineHeight: 1.5, maxWidth: "580px" }}>
          A reverse-chronological archive of Donald Trump&apos;s public Truth Social posts.
        </div>

        {/* Domain */}
        <div style={{
          position: "absolute", bottom: "36px", right: "90px",
          fontSize: "15px", color: "#2A3E99", letterSpacing: "0.08em", textTransform: "uppercase"
        }}>
          whattrumpsays.com
        </div>
      </div>
    ),
    { ...size }
  );
}
