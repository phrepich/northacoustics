import Link from "next/link";

import { company, navigation } from "../lib/site-content";
import { SiteLogo } from "./site-logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-cq-obsidian text-white">
      <div className="cq-shell grid gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <SiteLogo withTagline={true} inverted={true} />
          <p className="max-w-xl text-sm leading-7 text-white/68">
            NorthAcoustics organiza la medicion acustica en terreno mediante datos, evidencia y trazabilidad tecnica.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/42">Navegacion</p>
            <div className="grid gap-2">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-white/72 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/42">Contacto</p>
            <div className="grid gap-2 text-sm text-white/72">
              <p>{company.contact.email}</p>
              <p>{company.contact.phone}</p>
              <p>{company.contact.location}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
