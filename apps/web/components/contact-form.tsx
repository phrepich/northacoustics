"use client";

import { FormEvent, useMemo, useState } from "react";

type StatusState =
  | { type: "idle"; message: string }
  | { type: "loading"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const initialState: StatusState = { type: "idle", message: "" };

const serviceOptions = [
  "Monitoreo ambiental y acustico",
  "Gestion de campana de terreno",
  "Reportabilidad tecnica",
  "Soporte operativo",
  "Otro requerimiento",
];

export function ContactForm() {
  const [status, setStatus] = useState<StatusState>(initialState);
  const formStatusClasses = useMemo(() => {
    if (status.type === "success") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status.type === "error") {
      return "border-rose-200 bg-rose-50 text-rose-700";
    }

    return "border-cq-line bg-cq-paper text-cq-steel";
  }, [status.type]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus({ type: "loading", message: "Registrando solicitud tecnica..." });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          company: formData.get("company"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          service: formData.get("service"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("No fue posible registrar la solicitud.");
      }

      form.reset();
      setStatus({
        type: "success",
        message: "Solicitud recibida. NorthAcoustics respondera para coordinar el siguiente paso tecnico.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Se produjo un error al registrar el contacto.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="cq-panel space-y-6 p-8 md:p-10">
      <label className="sr-only" aria-hidden="true">
        Sitio web
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-cq-graphite">
          Nombre
          <input
            name="name"
            required
            className="w-full rounded-2xl border border-cq-line bg-white px-4 py-3 text-cq-graphite outline-none transition focus:border-cq-copper"
            placeholder="Nombre y apellido"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-cq-graphite">
          Empresa
          <input
            name="company"
            required
            className="w-full rounded-2xl border border-cq-line bg-white px-4 py-3 text-cq-graphite outline-none transition focus:border-cq-copper"
          placeholder="Empresa u organizacion"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-cq-graphite">
          Correo
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-cq-line bg-white px-4 py-3 text-cq-graphite outline-none transition focus:border-cq-copper"
            placeholder="correo@empresa.cl"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-cq-graphite">
          Telefono
          <input
            name="phone"
            required
            className="w-full rounded-2xl border border-cq-line bg-white px-4 py-3 text-cq-graphite outline-none transition focus:border-cq-copper"
            placeholder="+56 9 ..."
          />
        </label>
      </div>
      <label className="space-y-2 text-sm font-medium text-cq-graphite">
        Tipo de servicio requerido
        <select
          name="service"
          defaultValue={serviceOptions[0]}
          className="w-full rounded-2xl border border-cq-line bg-white px-4 py-3 text-cq-graphite outline-none transition focus:border-cq-copper"
        >
          {serviceOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium text-cq-graphite">
        Mensaje
        <textarea
          name="message"
          required
          rows={6}
          className="w-full rounded-[24px] border border-cq-line bg-white px-4 py-3 text-cq-graphite outline-none transition focus:border-cq-copper"
          placeholder="Describe el proyecto, la medicion requerida y las condiciones generales de terreno."
        />
      </label>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <button type="submit" disabled={status.type === "loading"} className="cq-button-primary disabled:opacity-70">
          {status.type === "loading" ? "Enviando..." : "Enviar solicitud"}
        </button>
        <p className="max-w-md text-sm leading-6 text-cq-steel">
          El requerimiento se envia de manera segura para su evaluacion y coordinacion tecnica inicial.
        </p>
      </div>
      <div className={`rounded-2xl border px-4 py-3 text-sm ${formStatusClasses}`}>{status.message || " "}</div>
    </form>
  );
}
