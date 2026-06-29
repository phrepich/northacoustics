import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "../components/section-heading";
import { ServiceCard } from "../components/service-card";
import { differentiators, homeMetrics, serviceLines } from "../lib/site-content";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Medicion acustica en terreno con datos, evidencia y trazabilidad tecnica.",
};

export default function HomePage() {
  return (
    <main id="inicio">
      <section className="cq-section pt-8 md:pt-10">
        <div className="cq-shell">
          <div className="cq-panel-dark overflow-hidden px-8 py-16 md:px-12 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/62">NorthAcoustics Field</p>
            <div className="mt-6 grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-semibold md:text-6xl">Medicion acustica en terreno, respaldada por evidencia.</h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 md:text-xl">
                  NorthAcoustics conecta la captura en campo con una gestion ordenada de proyectos, puntos, mediciones,
                  condiciones ambientales y reportes tecnicos.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/contacto" className="cq-button-primary">Contactar a NorthAcoustics</Link>
                  <Link href="/servicios" className="cq-button-secondary">Ver capacidades</Link>
                </div>
              </div>
              <div className="grid gap-4">
                {homeMetrics.map((metric) => (
                  <div key={metric.label} className="border-l border-white/20 pl-5">
                    <p className="text-2xl font-semibold">{metric.value}</p>
                    <p className="mt-1 text-sm leading-6 text-white/70">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="cq-section">
        <div className="cq-shell space-y-10">
          <SectionHeading
            eyebrow="Capacidades"
            title="Una operacion tecnica que mantiene cada dato conectado con su evidencia."
            description="El sistema acompana la campana desde la planificacion de terreno hasta la revision y el reporte."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {serviceLines.map((service) => (
              <ServiceCard key={service.slug} title={service.homeTitle} description={service.summary} href={service.href} focus={service.focus} />
            ))}
          </div>
        </div>
      </section>

      <section className="cq-section pt-0">
        <div className="cq-shell">
          <div className="cq-panel p-8 md:p-10">
            <SectionHeading
              eyebrow="Diferenciadores"
              title="Informacion tecnica util cuando hay que revisar, decidir y responder."
              description="NorthAcoustics prioriza la consistencia operativa sin perder agilidad en terreno."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {differentiators.map((item, index) => (
                <article key={item} className="rounded-[24px] border border-cq-line bg-cq-paper p-6">
                  <p className="text-sm font-semibold text-cq-brand">0{index + 1}</p>
                  <p className="mt-5 text-sm leading-7 text-cq-slate">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
