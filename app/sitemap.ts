import type { MetadataRoute } from "next";
import { readdir, stat } from "fs/promises";
import path from "path";

const BASE_URL = "https://boringtools.vercel.app";
const APP_DIR = path.join(process.cwd(), "app");
const PAGE_FILE_PATTERN = /^page\.(js|jsx|ts|tsx)$/i;
const IGNORED_SEGMENTS = new Set(["api"]);

async function collectPageRoutes(directory: string, segments: string[] = []): Promise<MetadataRoute.Sitemap> {
  const entries = await readdir(directory, { withFileTypes: true });
  const routes: MetadataRoute.Sitemap = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_SEGMENTS.has(entry.name) || entry.name.startsWith("_") || entry.name.startsWith("(")) {
        continue;
      }

      const childRoutes = await collectPageRoutes(path.join(directory, entry.name), [...segments, entry.name]);
      routes.push(...childRoutes);
      continue;
    }

    if (!PAGE_FILE_PATTERN.test(entry.name)) {
      continue;
    }

    const routePath = segments.length ? `/${segments.join("/")}` : "/";
    const fileStats = await stat(path.join(directory, entry.name));

    routes.push({
      url: `${BASE_URL}${routePath}`,
      lastModified: fileStats.mtime,
      changeFrequency: routePath === "/" ? "daily" : "weekly",
      priority: routePath === "/" ? 1 : 0.8,
    });
  }

  return routes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await collectPageRoutes(APP_DIR);

  return routes.sort((a, b) => a.url.localeCompare(b.url));
}