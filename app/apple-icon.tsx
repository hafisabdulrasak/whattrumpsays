import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 180,
  height: 180
};

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0c10",
          color: "#f5f0e4",
          borderRadius: 36,
          border: "8px solid #c5a66a",
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: 2
        }}
      >
        WTS
      </div>
    ),
    size
  );
}
