import React from "react";
import type { Metadata } from "next";
import { tools } from "@/app/tools-data";
import { constructToolMetadata, getWebApplicationSchema } from "@/lib/seo";
import StructuredData from "@/app/components/StructuredData";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const tool = tools.find((t) => t.id === "startup-name-analyzer") || {
  id: "startup-name-analyzer",
  name: "Startup Name Analyzer",
  href: "/startup-name-analyzer",
  category: "Creator Tools",
  description: "Analyze your startup name for memorability, branding, pronunciation, global appeal, emotional impact, and market readiness.",
  status: "Live",
};

export const metadata: Metadata = constructToolMetadata(tool);

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getWebApplicationSchema(tool);

  return (
    <>
      <StructuredData data={schema} />
      <Breadcrumbs
        category={tool.category}
        toolName={tool.name}
        toolHref={tool.href}
      />
      {children}
    </>
  );
}
