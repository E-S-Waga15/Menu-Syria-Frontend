import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "منيو سوريا — Menu Syria",
    short_name: "منيو سوريا",
    description: "رؤية جديدة لإدارة المطاعم والمتاجر السورية.",
    start_url: "/ar",
    display: "standalone",
    background_color: "#fffaf7",
    theme_color: "#850036",
    lang: "ar",
    dir: "rtl",
    scope: "/",
    id: `${SITE_URL}/ar`,
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
