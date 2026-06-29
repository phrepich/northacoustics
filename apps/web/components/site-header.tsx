import Link from "next/link";

import { navigation } from "../lib/site-content";
import { SiteLogo } from "./site-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-cq-line/70 bg-white/88 backdrop-blur-xl">
      <div className="cq-shell py-4">
        <div className="flex items-center justify-between gap-6">
          <SiteLogo withTagline={false} />
          <nav className="hidden items-center gap-6 xl:flex">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-cq-steel hover:text-cq-petrol">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/#contacto"
            className="inline-flex rounded-full bg-cq-obsidian px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cq-petrol xl:px-5 xl:py-3"
          >
            Solicitar diagnostico tecnico
          </Link>
        </div>
        <nav className="mt-4 flex gap-5 overflow-x-auto pb-1 xl:hidden">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-sm font-medium text-cq-steel hover:text-cq-petrol">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
