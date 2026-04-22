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
          background: "#F59E0B",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Blue header bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "64px",
          background: "#2D2AA6", display: "flex", alignItems: "center", padding: "0 80px",
          gap: "16px",
        }}>
          <span style={{ color: "#F59E0B", fontSize: "14px", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase" }}>
            ★ LIVE ARCHIVE INTERFACE ★
          </span>
        </div>

        {/* White panel */}
        <div style={{
          background: "#ffffff",
          borderRadius: "8px",
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          marginTop: "32px",
          boxShadow: "0 8px 40px rgba(45,42,166,0.18)",
        }}>
          {/* Red divider label */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
            <div style={{ height: "2px", width: "48px", background: "#E11D48" }} />
            <span style={{ color: "#E11D48", fontSize: "12px", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase" }}>
              THE ARCHIVE
            </span>
            <div style={{ height: "2px", width: "48px", background: "#E11D48" }} />
          </div>

          {/* Main title */}
          <div style={{ display: "flex", gap: "0px", lineHeight: 0.88 }}>
            <span style={{ fontSize: "108px", fontWeight: 900, color: "#2D2AA6", letterSpacing: "-2px", textTransform: "uppercase" }}>
              WHAT&nbsp;
            </span>
            <span style={{ fontSize: "108px", fontWeight: 900, color: "#E11D48", letterSpacing: "-2px", textTransform: "uppercase" }}>
              TRUMP&nbsp;
            </span>
            <span style={{ fontSize: "108px", fontWeight: 900, color: "#2D2AA6", letterSpacing: "-2px", textTransform: "uppercase" }}>
              SAYS
            </span>
          </div>

          {/* Subtitle */}
          <div style={{ marginTop: "20px", fontSize: "20px", color: "#1F2937", lineHeight: 1.5, maxWidth: "620px" }}>
            A reverse-chronological archive of Donald Trump&apos;s public Truth Social posts. Open source. No spin.
          </div>
        </div>

        {/* Domain badge */}
        <div style={{
          position: "absolute", bottom: "28px", right: "80px",
          background: "#2D2AA6", borderRadius: "4px",
          padding: "6px 16px",
          fontSize: "13px", color: "#F59E0B", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700,
        }}>
          whattrumpsays.com
        </div>
      </div>
    ),
    { ...size }
  );
}
