export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://boringtools.vercel.app/sitemap.xml",
  };
}