import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text to Handwriting Image Converter – Generate Realistic Handwritten Notes Online",
  description: "Convert typed text into realistic handwritten pages using multiple handwriting styles, notebook papers, ink colors and export as PNG, PDF or JPG directly from your browser.",
  keywords: [
    "text to handwriting",
    "handwriting generator",
    "handwritten notes converter",
    "convert text to image",
    "realistic handwriting",
    "online handwriting creator",
    "ruled notebook paper generator",
    "free text to handwriting",
    "boring tools"
  ],
  openGraph: {
    title: "Text to Handwriting Image Converter – Generate Realistic Handwritten Notes Online",
    description: "Convert typed text into realistic handwritten pages using multiple handwriting styles, notebook papers, ink colors and export as PNG, PDF or JPG directly from your browser.",
    type: "website",
  },
};

export default function TextToHandwritingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
