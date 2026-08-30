import React from "react";
import type { Metadata } from "next";
import { tools } from "@/app/tools-data";
import { constructToolMetadata, getWebApplicationSchema } from "@/lib/seo";
import StructuredData from "@/app/components/StructuredData";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const tool = tools.find((t) => t.id === "days-between-dates") || {
  id: "days-between-dates",
  name: "Days Between Dates",
  href: "/days-between-dates",
  category: "Time & Date",
  description: "Calculate the number of days between two dates.",
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
