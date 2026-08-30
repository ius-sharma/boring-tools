import React from "react";
import type { Metadata } from "next";
import { tools } from "@/app/tools-data";
import { constructToolMetadata, getWebApplicationSchema } from "@/lib/seo";
import StructuredData from "@/app/components/StructuredData";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const tool = tools.find((t) => t.id === "cgpa-target-planner") || {
  id: "cgpa-target-planner",
  name: "CGPA Target Planner",
  href: "/cgpa-target-planner",
  category: "Education",
  description: "Calculate the required SGPA for your remaining semesters to reach your target CGPA, simulate scenarios, and plan your academic roadmap.",
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
