import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logo Meaning Explorer – Analyze Logo Psychology & Branding",
  description: "Upload any logo and instantly analyze its colors, typography, symbolism, psychology, brand personality, emotional impact, design principles, and branding strategy with an interactive visual report.",
};

export default function LogoExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
