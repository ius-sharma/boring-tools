"use client";

import React from "react";
import Link from "next/link";
import { getBreadcrumbSchema } from "@/lib/seo";
import StructuredData from "./StructuredData";

interface BreadcrumbsProps {
  category?: string;
  toolName: string;
  toolHref?: string;
}

export default function Breadcrumbs({
  category,
  toolName,
  toolHref,
}: BreadcrumbsProps) {
  const items = [
    { name: "Home", url: "/" },
    ...(category
      ? [
          {
            name: category,
            url: `/#find-tools`,
          },
        ]
      : []),
    {
      name: toolName,
      url: toolHref || "#",
    },
  ];

  const schema = getBreadcrumbSchema(items);

  return (
    <>
      <StructuredData data={schema} />
      <nav
        aria-label="Breadcrumb"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 text-xs font-medium text-slate-500"
      >
        <ol className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <li>
            <Link
              href="/"
              className="hover:text-orange-600 transition flex items-center gap-1"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Home</span>
            </Link>
          </li>

          {category && (
            <>
              <li className="text-slate-300 select-none">/</li>
              <li>
                <Link
                  href="/#find-tools"
                  className="hover:text-orange-600 transition"
                >
                  {category}
                </Link>
              </li>
            </>
          )}

          <li className="text-slate-300 select-none">/</li>
          <li aria-current="page" className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">
            {toolName}
          </li>
        </ol>
      </nav>
    </>
  );
}
