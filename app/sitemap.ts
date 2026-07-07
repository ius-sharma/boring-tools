import { MetadataRoute } from "next";
import { tools } from "./tools-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://boringtools.vercel.app";

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  // Map all "Live" tools to sitemap entries
  const toolPages = tools
    .filter((tool) => tool.status === "Live")
    .map((tool) => ({
      url: `${baseUrl}${tool.href}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...toolPages];
}