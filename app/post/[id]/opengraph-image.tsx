import { ImageResponse } from "next/og";
import { getPostById } from "@/lib/ingestion";
import { format } from "date-fns";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

function wrap(text: string, max = 230) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export default async function PostOgImage({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(id);

  const quoteText = post ? wrap(post.text) : "Post not found.";
  const dateStr = post
    ? format(new Date(post.createdAt), "MMMM d, yyyy · h:mm a 'UTC'")
    : "";

  // Adjust font size based on text length for best fit
  const fontSize = quoteText.length < 80 ? 48 : quoteText.length < 140 ? 40 : 33;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#F59E0B",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Decorative orange noise dots */}
        <div style={{
          position: "absolute", bottom: "-60px", right: "-60px",
          width: "320px", height: "320px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          display: "flex",
        }} />
        <div style={{
          position: "absolute", top: "-80px", left: "-80px",
          width: "260px", height: "260px",
          borderRadius: "50%",
          background: "rgba(45,42,166,0.12)",
          display: "flex",
        }} />

        {/* Top bar */}
        <div style={{
          background: "#2D2AA6",
          width: "100%",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 72px",
          flexShrink: 0,
        }}>
          <span style={{
            color: "#F59E0B",
            fontSize: "15px",
            fontWeight: 900,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}>
            ★ WHAT TRUMP SAYS ★
          </span>
          <span style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: "12px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}>
            truthsocial archive
          </span>
        </div>

        {/* White card */}
        <div style={{
          margin: "32px 64px 0 64px",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "44px 56px 40px 56px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 12px 48px rgba(45,42,166,0.22)",
        }}>
          {/* Label */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "24px",
          }}>
            <div style={{ height: "3px", width: "40px", background: "#E11D48", display: "flex" }} />
            <span style={{
              color: "#E11D48",
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
            }}>
              TRUMP POSTED
            </span>
            <div style={{ height: "3px", width: "40px", background: "#E11D48", display: "flex" }} />
          </div>

          {/* Quote mark */}
          <span style={{
            fontSize: "72px",
            lineHeight: 0.6,
            color: "#F59E0B",
            fontWeight: 900,
            marginBottom: "8px",
            display: "flex",
          }}>
            &ldquo;
          </span>

          {/* Post text */}
          <p style={{
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            color: "#1F2937",
            lineHeight: 1.45,
            margin: 0,
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
          }}>
            {quoteText}
          </p>

          {/* Date */}
          {dateStr && (
            <div style={{
              marginTop: "20px",
              fontSize: "14px",
              color: "#6B7280",
              letterSpacing: "0.05em",
              display: "flex",
            }}>
              {dateStr}
            </div>
          )}
        </div>

        {/* Bottom strip */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 72px",
          flexShrink: 0,
        }}>
          <span style={{
            color: "rgba(45,42,166,0.7)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}>
            whattrumpsays.com
          </span>
          <div style={{
            background: "#2D2AA6",
            borderRadius: "4px",
            padding: "5px 14px",
            display: "flex",
          }}>
            <span style={{
              color: "#F59E0B",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}>
              READ THE RECORD
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
