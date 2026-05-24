import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://boringtools.vercel.app",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    }
  ];
}