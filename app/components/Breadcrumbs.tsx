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
                className="w-3.5 h-3.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 160 149"
                aria-hidden="true"
              >
                <path d="M74.3 8.3a1103 1103 0 0 0-50.1 45.1C7 69.3 5.6 71.2 8 75c.5.9 3.1 1.7 6.7 2l5.8.5.5 28.8.5 28.9 3.7 3.4L29 142h16.8c15.1 0 17.1-.2 18.5-1.8 1.5-1.6 1.7-4.7 1.7-22.3 0-14.6.3-20.8 1.2-21.7a60 60 0 0 1 24.6 0c.9.9 1.2 7.1 1.2 21.8 0 18.8.2 20.8 1.8 22.3 1.6 1.4 4.4 1.7 18.1 1.7 18.8 0 21.2-.7 24.2-7.3 1.7-3.8 1.9-6.8 1.9-30.9V77.1l5.7-.3c4.9-.3 5.9-.7 6.9-2.6 2.3-4.6 3.9-2.9-41.6-43.6C85.7 8.8 83.4 7 79.7 7c-1.8.1-4.2.6-5.4 1.3m8.3 6.9c3.1 2.4 21.2 18.5 46.6 41.5L145 71h-4.7c-8.5 0-8.3-.8-8.3 32.2 0 27.5-.1 28.9-2 30.8-1.8 1.8-3.3 2-16.5 2H99V95l-2.9-3.2c-2.9-3.3-3-3.3-13.7-3.6-12.3-.4-17.4.7-20.3 4.5-2 2.4-2.1 3.9-2.1 22.9V136H45.6c-20.1 0-18.6 2.8-18.6-34 0-22.1-.3-29-1.3-29.8a15 15 0 0 0-6.1-1.4l-4.8-.3 8.4-7.5L55 34.2A594 594 0 0 1 79 13c.4 0 2 1 3.6 2.2" />
              </svg>
              <span>Home</span>
            </Link>
          </li>

          {category && (
            <>
              <li className="text-slate-300 select-none flex items-center" aria-hidden="true">
                <svg className="w-2.5 h-2.5 text-slate-300" fill="currentColor" viewBox="0 0 63 122">
                  <path d="M4.2 8.2Q3.1 9.4 3 10.8c0 .7 10.8 11.9 24 24.9s24 24 24 24.6-10.8 12-24 25.2a426 426 0 0 0-24 25.2c0 1.6 2.8 4.3 4.5 4.3.7 0 12.5-11.3 26.1-25 23.7-23.9 24.9-25.3 25.2-29.2l.3-4.2-24.8-24.8C9.8 7.2 7.2 5.2 4.2 8.2" />
                </svg>
              </li>
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

          <li className="text-slate-300 select-none flex items-center" aria-hidden="true">
            <svg className="w-2.5 h-2.5 text-slate-300" fill="currentColor" viewBox="0 0 63 122">
              <path d="M4.2 8.2Q3.1 9.4 3 10.8c0 .7 10.8 11.9 24 24.9s24 24 24 24.6-10.8 12-24 25.2a426 426 0 0 0-24 25.2c0 1.6 2.8 4.3 4.5 4.3.7 0 12.5-11.3 26.1-25 23.7-23.9 24.9-25.3 25.2-29.2l.3-4.2-24.8-24.8C9.8 7.2 7.2 5.2 4.2 8.2" />
            </svg>
          </li>
          <li aria-current="page" className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">
            {toolName}
          </li>
        </ol>
      </nav>
    </>
  );
}
