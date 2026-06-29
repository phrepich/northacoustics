import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://northacoustics.cl";

const routes = [
  "",
  "/servicios",
  "/servicios/calidad-soporte-tecnico",
  "/servicios/topografia-control-geometrico",
  "/servicios/monitoreo-ambiental-acustico",
  "/nosotros",
  "/direccion-tecnica",
  "/proyectos",
  "/contacto",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
