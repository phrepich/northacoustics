import Link from "next/link";

import { company } from "../lib/site-content";

type SiteLogoProps = {
  className?: string;
  withTagline?: boolean;
  inverted?: boolean;
};

export function SiteLogo({ className = "", withTagline = true, inverted = false }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 text-left ${className}`.trim()}
      aria-label="NorthAcoustics inicio"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-cq-obsidian text-sm font-bold tracking-[0.12em] text-white shadow-[0_18px_42px_rgba(15,19,24,0.28)]">
        NA
      </span>
      <span className="flex flex-col">
        <span className={`text-base font-semibold tracking-[0.08em] ${inverted ? "text-white" : "text-cq-graphite"}`}>
          NorthAcoustics
        </span>
        <span className={`text-xs font-medium uppercase tracking-[0.2em] ${inverted ? "text-white/75" : "text-cq-petrol"}`}>
          Field Operations
        </span>
        {withTagline ? (
          <span className={`max-w-xs text-xs leading-5 ${inverted ? "text-white/56" : "text-cq-steel"}`}>
            {company.tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
