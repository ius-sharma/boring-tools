import type { MetadataRoute } from "next";
import { readdir, stat } from "fs/promises";
import path from "path";

const BASE_URL = "https://boringtools.vercel.app";
const APP_DIR = path.join(process.cwd(), "app");
const PAGE_FILE_PATTERN = /^page\.(js|jsx|ts|tsx)$/i;
const IGNORE_DIRECTORIES = new Set([
  "api",
  "components",
]);
const IGNORE_SEGMENT_NAMES = new Set([
  "layout",
  "page",
  "page-old",
  "sitemap",
  "robots",
  "loading",
  "error",
  "not-found",
  "default",
  "template",
]);

function isIgnoredDirectory(name: string) {
  return IGNORE_DIRECTORIES.has(name) || name.startsWith("_") || name.startsWith("(") || name.startsWith("[");
}

function isIgnoredSegment(name: string) {
  return IGNORE_SEGMENT_NAMES.has(name) || name.startsWith("_") || name.startsWith("(") || name.startsWith("[");
}

async function collectRoutes(directory: string, segments: string[] = []): Promise<MetadataRoute.Sitemap> {
  const entries = await readdir(directory, { withFileTypes: true });
  const routes: MetadataRoute.Sitemap = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (isIgnoredDirectory(entry.name)) {
        continue;
      }

      const childRoutes = await collectRoutes(path.join(directory, entry.name), [...segments, entry.name]);
      routes.push(...childRoutes);
      continue;
    }

    if (!PAGE_FILE_PATTERN.test(entry.name)) {
      continue;
    }

    if (segments.some(isIgnoredSegment)) {
      continue;
    }

    const routePath = segments.length ? `/${segments.join("/")}` : "/";
    const fileStats = await stat(path.join(directory, entry.name));

    routes.push({
      url: `${BASE_URL}${routePath}`,
      lastModified: fileStats.mtime,
      changeFrequency: routePath === "/" ? "daily" : "weekly",
      priority: routePath === "/" ? 1 : 0.7,
    });
  }

  return routes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await collectRoutes(APP_DIR);

  return routes.sort((left, right) => left.url.localeCompare(right.url));
}