import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import HomeButton from "./components/HomeButton";
import NavBar from "./components/NavBar";
import { Analytics } from "@vercel/analytics/next";
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
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavBar />
        <div className="fixed inset-x-0 top-0 z-50 flex items-start justify-end gap-3 p-3 sm:p-4 pointer-events-none">
          <HomeButton />
        </div>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
