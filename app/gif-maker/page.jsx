import GIFMakerApp from "./GIFMakerApp";

export const metadata = {
  title: "GIF Maker from Images – Create Animated GIFs Online Free",
  description: "Create animated GIFs from multiple images using drag-and-drop editing, transitions, text overlays and browser-based rendering. Fast, private and free.",
  keywords: [
    "gif maker",
    "create gif online",
    "image to gif converter",
    "gif creator browser",
    "animated gif builder",
    "private gif maker",
    "offline gif generator",
    "free online tools"
  ],
  openGraph: {
    title: "GIF Maker from Images – Create Animated GIFs Online Free",
    description: "Create animated GIFs from multiple images using drag-and-drop editing, transitions, text overlays and browser-based rendering. Fast, private and free.",
    type: "website",
  },
};

export default function GIFMakerPage() {
  return <GIFMakerApp />;
}
