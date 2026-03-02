import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

const appUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api", "/login", "/register"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
