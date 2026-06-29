import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "../../components/contact-form";
import { PageHero } from "../../components/page-hero";
import { company } from "../../lib/site-content";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Canales de contacto de NorthAcoustics para coordinar mediciones acusticas y soporte tecnico de terreno.",
};

const whatsappHref = `https://wa.me/${company.contact.whatsapp}?text=${encodeURIComponent(
  "Hola, necesito coordinar una consulta tecnica con NorthAcoustics."
)}`;

export default function ContactoPage() {
  return (
    <main>
      <PageHero
        eyebrow="Contacto"
        title="Coordina una consulta tecnica."
        description="Cuéntanos el alcance de tu campana, el tipo de medicion requerida y las condiciones generales de terreno."
      />

      <section className="cq-section pt-0">
        <div className="cq-shell grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <ContactForm />
          <aside className="grid gap-6">
            <article className="cq-panel p-8">
              <p className="cq-overline">Canales directos</p>
              <div className="mt-6 grid gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cq-slate">Correo</p>
                  <p className="mt-2 text-base text-cq-navy">{company.contact.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cq-slate">Teléfono</p>
                  <p className="mt-2 text-base text-cq-navy">{company.contact.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cq-slate">WhatsApp</p>
                  <p className="mt-2 text-base text-cq-navy">Canal directo para coordinación comercial</p>
                </div>
              </div>
            </article>

            <article className="cq-panel-dark p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/58">Atención comercial</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Respuesta orientada a terreno</h2>
              <p className="mt-4 text-sm leading-7 text-white/72">
                El contacto inicial permite revisar el requerimiento tecnico, dimensionar el alcance y definir el apoyo
                operativo mas adecuado.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={whatsappHref} target="_blank" rel="noreferrer" className="cq-button-primary">
                  Abrir WhatsApp
                </Link>
                <Link href={`mailto:${company.contact.email}`} className="cq-button-secondary">
                  Escribir correo
                </Link>
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
