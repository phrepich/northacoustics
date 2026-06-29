import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://northacoustics.cl"),
  title: {
    default: "NorthAcoustics | Medicion acustica trazable",
    template: "%s | NorthAcoustics",
  },
  description:
    "Plataforma de operacion en terreno para mediciones acusticas, evidencia tecnica y reportabilidad trazable.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
