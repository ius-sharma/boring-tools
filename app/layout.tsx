import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import HomeButton from "./components/HomeButton";
import ThemeToggle from "./components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Boring Tools",
  description: "100 Days. 100 Boring Tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (function () {
      try {
        var stored = localStorage.getItem("boring-tools-theme");
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var theme = stored === "dark" || stored === "light" ? stored : (prefersDark ? "dark" : "light");
        document.documentElement.setAttribute("data-theme", theme);
      } catch (e) {}
    })();
  `;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-3 p-3 sm:p-4 pointer-events-none">
          <ThemeToggle />
          <HomeButton />
        </div>
        {children}
      </body>
    </html>
  );
}
