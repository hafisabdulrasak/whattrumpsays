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
          background: "#141414",
          color: "#F5F0E0",
          borderRadius: 96,
          border: "20px solid #E8561A",
          fontSize: 176,
          fontWeight: 700,
          letterSpacing: 10
        }}
      >
        WTS
      </div>
    ),
    size
  );
}
