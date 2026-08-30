import React from "react";
import type { Metadata } from "next";
import { tools } from "@/app/tools-data";
import { constructToolMetadata, getWebApplicationSchema } from "@/lib/seo";
import StructuredData from "@/app/components/StructuredData";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const tool = tools.find((t) => t.id === "social-account-analyzer") || {
  id: "social-account-analyzer",
  name: "Social Account Analyzer",
  href: "/social-account-analyzer",
  category: "Creator Tools",
  description: "Audit Instagram, YouTube, X, TikTok, or LinkedIn. Detect spam followers, consistency, and get a custom AI growth roadmap.",
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
