import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "../../components/page-hero";
import { serviceLines } from "../../lib/site-content";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Capacidades de NorthAcoustics para monitoreo acustico, operacion de terreno y reportabilidad.",
};

export default function ServiciosPage() {
  return (
    <main>
      <PageHero
        eyebrow="Servicios"
        title="Capacidades tecnicas para medir, organizar y reportar."
        description="NorthAcoustics integra estas lineas segun el alcance de cada campana y los requerimientos de trazabilidad."
      />

      <section className="cq-section pt-0">
        <div className="cq-shell grid gap-6">
          {serviceLines.map((service) => (
            <article key={service.slug} className="cq-panel grid gap-8 p-8 md:p-10 lg:grid-cols-[0.7fr_1.3fr]">
              <div className="space-y-5">
                <div className="space-y-3">
                  <p className="cq-overline">Línea de servicio</p>
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-cq-navy">{service.title}</h2>
                </div>
                <p className="text-sm leading-7 text-cq-slate">{service.description}</p>
                <Link href={service.href} className="cq-button-ghost">
                  Ver detalle
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-[24px] border border-cq-line bg-cq-paper p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cq-brand">Problema que resuelve</p>
                  <p className="mt-4 text-sm leading-7 text-cq-slate">{service.problem}</p>
                </div>
                <div className="rounded-[24px] border border-cq-line bg-cq-paper p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cq-brand">Tipo de cliente</p>
                  <div className="mt-4 grid gap-3">
                    {service.clients.map((item) => (
                      <p key={item} className="text-sm leading-7 text-cq-slate">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="rounded-[24px] border border-cq-line bg-cq-paper p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cq-brand">Entregables</p>
                  <div className="mt-4 grid gap-3">
                    {service.deliverables.map((item) => (
                      <p key={item} className="text-sm leading-7 text-cq-slate">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
