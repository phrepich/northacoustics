import type { Metadata } from "next";

import { PageHero } from "../../components/page-hero";
import { workflow } from "../../lib/site-content";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "NorthAcoustics organiza la operacion de medicion acustica en terreno.",
};

export default function NosotrosPage() {
  return (
    <main>
      <PageHero
        eyebrow="Nosotros"
        title="Tecnica de terreno con informacion lista para revisar."
        description="NorthAcoustics une captura, evidencia, datos estructurados y reportabilidad para apoyar una operacion acustica consistente."
      />
      <section className="cq-section pt-0">
        <div className="cq-shell">
          <div className="cq-panel p-8 md:p-10">
            <p className="cq-overline">Forma de trabajo</p>
            <h2 className="mt-4 text-3xl font-semibold text-cq-navy md:text-5xl">Un flujo simple para mantener la trazabilidad.</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {workflow.map((step, index) => (
                <article key={step.title} className="rounded-[28px] border border-cq-line bg-cq-paper p-6">
                  <p className="text-sm font-semibold text-cq-brand">0{index + 1}</p>
                  <h3 className="mt-4 text-2xl font-semibold text-cq-navy">{step.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-cq-slate">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
