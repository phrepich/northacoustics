import type { Metadata } from "next";

import { PageHero } from "../../components/page-hero";
import { projects } from "../../lib/site-content";

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Estructura de proyectos NorthAcoustics para registrar mediciones, evidencia y resultados.",
};

export default function ProyectosPage() {
  return (
    <main>
      <PageHero
        eyebrow="Proyectos"
        title="Proyectos organizados por campana, puntos y resultados."
        description="La estructura permite revisar el alcance tecnico de cada proyecto sin exponer datos operativos sensibles."
      />

      <section className="cq-section pt-0">
        <div className="cq-shell">
          <div className="cq-panel p-8 md:p-10">
            <div className="grid gap-5 md:grid-cols-2">
              {projects.map((project) => (
                <article key={`${project.type}-${project.result}`} className="rounded-[28px] border border-cq-line bg-cq-paper p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cq-brand">Tipo de obra</p>
                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-cq-navy">{project.type}</h2>
                  <div className="mt-6 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cq-slate">Intervención</p>
                      <p className="mt-2 text-sm leading-7 text-cq-slate">{project.intervention}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cq-slate">Resultado</p>
                      <p className="mt-2 text-sm leading-7 text-cq-slate">{project.result}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 rounded-[24px] border border-dashed border-cq-line bg-white px-6 py-5 text-sm leading-7 text-cq-slate">
              Las referencias publicas se incorporan solo cuando exista autorizacion de cada cliente y proyecto.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
