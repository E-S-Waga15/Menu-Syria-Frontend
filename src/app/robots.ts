import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // private consoles — note the "$" so /agents (public) stays crawlable
      disallow: [
        "/ar/dashboard",
        "/en/dashboard",
        "/ar/admin",
        "/en/admin",
        "/ar/agent$",
        "/en/agent$",
        "/ar/agent/",
        "/en/agent/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
