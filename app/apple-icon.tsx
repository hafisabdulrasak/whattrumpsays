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
          background: "#2D2AA6",
          borderRadius: 36,
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: 2,
          color: "#F59E0B",
        }}
      >
        WTS
      </div>
    ),
    size
  );
}
