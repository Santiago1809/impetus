import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Impetus · Mi negocio, claro",
    short_name: "Impetus",
    description:
      "Registra ventas y gastos, calcula tu precio real y cierra el día. Tus datos quedan en tu celular.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2f1ec",
    theme_color: "#17493c",
    lang: "es",
    categories: ["finance", "business", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
