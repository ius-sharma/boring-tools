import React from "react";

interface StructuredDataProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
