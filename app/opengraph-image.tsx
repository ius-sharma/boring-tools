import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export const alt = "BoringTools — 100 Days 100 Tools";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // Load official logo from public/boringtools-logo.png as base64
  let logoDataUrl = "";
  try {
    const logoBuffer = fs.readFileSync(
      path.join(process.cwd(), "public", "boringtools-logo.png")
    );
    logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    logoDataUrl = "";
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "60px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          border: "16px solid #f8fafc",
        }}
      >
        {/* Subtle orange ambient glow in background */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(234, 88, 12, 0.08) 0%, rgba(255, 255, 255, 0) 70%)",
          }}
        />

        {/* Top Header with Official BT Golden Logo & Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {logoDataUrl && (
            <img
              src={logoDataUrl}
              alt="BoringTools Logo"
              style={{
                width: "56px",
                height: "56px",
                objectFit: "contain",
              }}
            />
          )}
          <div
            style={{
              fontSize: "34px",
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.5px",
            }}
          >
            BoringTools
          </div>
          <div
            style={{
              marginLeft: "12px",
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              color: "#ea580c",
              fontSize: "13px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
            }}
          >
            100 DAYS · 101 TOOLS
          </div>
        </div>

        {/* Main Headline & Description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "54px",
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
            }}
          >
            Fast, Private Browser-First Micro-Utilities.
          </div>
          <div
            style={{
              fontSize: "23px",
              color: "#64748b",
              lineHeight: 1.45,
              maxWidth: "880px",
            }}
          >
            Free image editing, PDF intelligence, converters, calculators, and developer tools. Processed 100% client-side with zero tracking.
          </div>
        </div>

        {/* Bottom Feature Badges matching About page pill styling */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "9999px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            <span style={{ color: "#ea580c", fontSize: "16px" }}>•</span>
            Zero Sign-Up Required
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "9999px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            <span style={{ color: "#ea580c", fontSize: "16px" }}>•</span>
            100% Client-Side Privacy
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "9999px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            <span style={{ color: "#ea580c", fontSize: "16px" }}>•</span>
            Free & Open-Source
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
