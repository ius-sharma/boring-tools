import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Startup Name Analyzer – Evaluate Your Brand Name",
  description: "Analyze your startup name for memorability, branding, pronunciation, SEO friendliness, global appeal, emotional impact, and brand potential with an interactive report.",
};

export default function StartupNameAnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
