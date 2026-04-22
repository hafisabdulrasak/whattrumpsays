import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 512,
  height: 512
};

export default function Icon() {
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
          borderRadius: 96,
          fontSize: 176,
          fontWeight: 700,
          letterSpacing: 8,
          color: "#F59E0B",
        }}
      >
        WTS
      </div>
    ),
    size
  );
}
