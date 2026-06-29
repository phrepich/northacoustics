import type { Metadata } from "next";

import { PageHero } from "../../components/page-hero";
import { directionHighlights } from "../../lib/site-content";

export const metadata: Metadata = {
  title: "Direccion tecnica",
  description: "Criterio tecnico y coordinacion operativa para mediciones acusticas trazables.",
};

export default function DireccionTecnicaPage() {
  return (
    <main>
      <PageHero
        eyebrow="Direccion tecnica"
        title="Criterio tecnico para operar, revisar y reportar."
        description="NorthAcoustics articula el trabajo de terreno con la calidad de datos necesaria para entregar resultados verificables."
      />
      <section className="cq-section pt-0">
        <div className="cq-shell grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="cq-panel-dark p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/58">NorthAcoustics</p>
            <p className="mt-6 text-2xl font-semibold leading-9">
              Una operacion de campo necesita decisiones claras, datos consistentes y evidencia disponible.
            </p>
          </aside>
          <section className="cq-panel p-8 md:p-10">
            <p className="cq-overline">Enfoque de trabajo</p>
            <h2 className="mt-4 text-3xl font-semibold text-cq-navy md:text-5xl">Direccion tecnica conectada al terreno.</h2>
            <div className="mt-10 grid gap-4">
              {directionHighlights.map((item) => (
                <div key={item} className="rounded-[22px] border border-cq-line bg-cq-paper px-5 py-4 text-sm leading-7 text-cq-slate">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
