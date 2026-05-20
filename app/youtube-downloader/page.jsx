import ComingSoon from "@/app/components/ComingSoon";
import YouTubeDownloader from "./_tool";

// Change this to "live" when the tool is ready to go public
const TOOL_STATUS = "live";

export default function Page() {
  if (TOOL_STATUS === "upcoming") {
    return (
      <ComingSoon 
        toolName="YouTube Downloader"
        setupGuideLink="/setup-guide"
      />
    );
  }

  return <YouTubeDownloader />;
}
