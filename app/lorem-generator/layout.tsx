import React from "react";
import type { Metadata } from "next";
import { constructToolMetadata, getWebApplicationSchema } from "@/lib/seo";
import StructuredData from "@/app/components/StructuredData";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const tool = {
  id: "lorem-generator",
  name: "Lorem Ipsum Generator",
  href: "/lorem-generator",
  category: "Developer",
  description: "Generate placeholder text, sentences, and paragraphs for designs and mockups.",
  status: "Live",
};

export const metadata: Metadata = constructToolMetadata(tool);

export default function LoremGeneratorLayout({
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
