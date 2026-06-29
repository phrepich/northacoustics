import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "../../../components/page-hero";
import { serviceLines } from "../../../lib/site-content";

const service = serviceLines[1];

export const metadata: Metadata = {
  title: service.title,
  description: service.summary,
};

export default function CalidadPage() {
  return (
    <main>
      <PageHero eyebrow="Gestion de campanas" title={service.title} description={service.summary} />

      <section className="cq-section pt-0">
        <div className="cq-shell grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="cq-panel p-8 md:p-10">
            <p className="cq-overline">Problema que resuelve</p>
            <p className="mt-5 text-base leading-8 text-cq-slate">{service.problem}</p>
            <div className="mt-8 grid gap-4">
              {service.focus.map((item) => (
                <span key={item} className="rounded-full border border-cq-line bg-cq-paper px-4 py-2 text-sm font-semibold text-cq-brand">
                  {item}
                </span>
              ))}
            </div>
          </article>
          <article className="cq-panel p-8 md:p-10">
            <p className="cq-overline">Servicios incluidos</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {service.services.map((item) => (
                <div key={item} className="rounded-[22px] border border-cq-line bg-cq-paper px-5 py-4 text-sm leading-7 text-cq-slate">
                  {item}
                </div>
              ))}
            </div>
          </article>
          <article className="cq-panel p-8 md:p-10">
            <p className="cq-overline">Tipo de cliente</p>
            <div className="mt-6 grid gap-3">
              {service.clients.map((item) => (
                <p key={item} className="text-sm leading-7 text-cq-slate">
                  {item}
                </p>
              ))}
            </div>
          </article>
          <article className="cq-panel p-8 md:p-10">
            <p className="cq-overline">Entregables</p>
            <div className="mt-6 grid gap-3">
              {service.deliverables.map((item) => (
                <p key={item} className="text-sm leading-7 text-cq-slate">
                  {item}
                </p>
              ))}
            </div>
          </article>
        </div>
        <div className="cq-shell pt-8">
          <Link href="/contacto" className="cq-button-primary">
            Solicitar reunión técnica
          </Link>
        </div>
      </section>
    </main>
  );
}
