"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HomeButton() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <Link
      href="/"
      className="tool-float-button tool-float-button--left"
      aria-label="Go to home page"
    >
      <span aria-hidden="true">←</span>
      <span>Home</span>
    </Link>
  );
}
