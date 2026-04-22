import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Banditprice - Comparez les prix les moins chers au Canada",
    short_name: "Banditprice",
    orientation: "any",
    display: "standalone",
    dir: "auto",
    lang: "en-CA",
    scope: "/",
    description:
      "Comparez les prix les moins chers au Canada et économisez de l'argent !",
    start_url: "/",
    background_color: "#091320",
    theme_color: "#007bed",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
