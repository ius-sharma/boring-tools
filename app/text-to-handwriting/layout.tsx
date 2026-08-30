import React from "react";
import type { Metadata } from "next";
import { tools } from "@/app/tools-data";
import { constructToolMetadata, getWebApplicationSchema } from "@/lib/seo";
import StructuredData from "@/app/components/StructuredData";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const tool = tools.find((t) => t.id === "text-to-handwriting") || {
  id: "text-to-handwriting",
  name: "Text to Handwriting Image Converter",
  href: "/text-to-handwriting",
  category: "Documents",
  description: "Convert typed text into realistic handwritten pages using multiple handwriting styles, notebook papers, ink colors and export as PNG, PDF or JPG directly from your browser.",
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
