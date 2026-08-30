import { MetadataRoute } from "next";
import { tools } from "./tools-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://boringtools.vercel.app";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Map all "Live" tools to sitemap entries with priority boosting for featured tools
  const toolPages: MetadataRoute.Sitemap = tools
    .filter((tool) => tool.status === "Live")
    .map((tool) => ({
      url: `${baseUrl}${tool.href}`,
      lastModified: now,
      changeFrequency: tool.isFeatured ? "weekly" : "monthly",
      priority: tool.isFeatured ? 0.9 : 0.8,
    }));

  return [...staticPages, ...toolPages];
}