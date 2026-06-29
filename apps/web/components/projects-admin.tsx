"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import {
  buildReportPayload,
  toCsv,
} from "@northacoustics/shared";

import type { AdminSeedData } from "../lib/admin-data";
import { ProjectMapPanel } from "./project-map-panel";
import { ReportPreviewCard } from "./report-preview-card";

export function ProjectsAdmin({ data }: { data: AdminSeedData }) {
  const [clientId, setClientId] = useState("all");
  const [district, setDistrict] = useState("");
  const [responsible, setResponsible] = useState("");
  const [visitDate, setVisitDate] = useState("");

  const filteredProjects = useMemo(
    () =>
      data.projects.filter((project) => {
        const clientMatch = clientId === "all" || project.clientId === clientId;
        const districtMatch = !district || project.district.toLowerCase().includes(district.toLowerCase());
        const responsibleMatch =
          !responsible || project.professionalResponsible.toLowerCase().includes(responsible.toLowerCase());
        const dateMatch = !visitDate || project.visitDate === visitDate;

        return clientMatch && districtMatch && responsibleMatch && dateMatch;
      }),
    [clientId, data.projects, district, responsible, visitDate],
  );

  const selectedAggregate =
    data.aggregates.find((item) => item.project.id === filteredProjects[0]?.id) ?? data.aggregates[0] ?? null;
  const exportRows = filteredProjects.map((project) => {
    const aggregate = data.aggregates.find((item) => item.project.id === project.id);
    const payload = aggregate ? buildReportPayload(aggregate) : null;

    return {
      cliente: data.clients.find((client) => client.id === project.clientId)?.name ?? "",
      proyecto: project.name,
      codigo: project.internalCode,
      comuna: project.district,
      fecha_visita: project.visitDate,
      responsable: project.professionalResponsible,
      estado: project.status,
      resumen: payload?.executiveSummary ?? "",
    };
  });

  if (!selectedAggregate) {
    return (
      <div className="page-shell">
        <section className="panel">
          <h1>Panel administrativo</h1>
          <p className="muted">
            Aún no hay proyectos disponibles o faltan credenciales válidas de Supabase. Crea datos desde la app móvil,
            sincroniza y vuelve a cargar esta vista.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="hero">
        <div className="panel hero-panel">
          <small>Northacoustics Field</small>
          <h1>Panel administrativo de campañas acústicas</h1>
          <p>
            Revisión de proyectos, puntos de medición, evidencia fotográfica, validación técnica y disparo de informe
            automático desde Supabase.
          </p>
        </div>
        <ReportPreviewCard aggregate={selectedAggregate} />
      </section>

      <section className="metric-grid">
        <div className="metric-card">
          <strong>{data.clients.length}</strong>
          <span className="muted">Clientes activos</span>
        </div>
        <div className="metric-card">
          <strong>{data.projects.length}</strong>
          <span className="muted">Campañas registradas</span>
        </div>
        <div className="metric-card">
          <strong>{data.points.length}</strong>
          <span className="muted">Puntos georreferenciados</span>
        </div>
        <div className="metric-card">
          <strong>{selectedAggregate.reports.length}</strong>
          <span className="muted">Versiones de informe</span>
        </div>
      </section>

      <section className="panel">
        <h2>Filtros</h2>
        <div className="filters">
          <select onChange={(event) => setClientId(event.target.value)} value={clientId}>
            <option value="all">Todos los clientes</option>
            {data.clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <input onChange={(event) => setDistrict(event.target.value)} placeholder="Comuna" value={district} />
          <input
            onChange={(event) => setResponsible(event.target.value)}
            placeholder="Responsable"
            value={responsible}
          />
          <input onChange={(event) => setVisitDate(event.target.value)} type="date" value={visitDate} />
        </div>
        <div className="actions">
          <a
            className="button secondary"
            download="northacoustics-proyectos.csv"
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(toCsv(exportRows))}`}
          >
            Exportar CSV
          </a>
          <a className="button primary" href={`/api/reports/demo?projectId=${selectedAggregate?.project.id ?? ""}&format=pdf`}>
            Generar informe PDF
          </a>
        </div>
      </section>

      <section className="content-grid">
        <div className="table-card">
          <h2>Proyectos</h2>
          <table>
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Cliente</th>
                <th>Responsable</th>
                <th>Comuna</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <strong>{project.name}</strong>
                    <div className="muted">{project.internalCode}</div>
                  </td>
                  <td>{data.clients.find((client) => client.id === project.clientId)?.name}</td>
                  <td>{project.professionalResponsible}</td>
                  <td>{project.district}</td>
                  <td>
                    <span className={`pill ${project.status}`}>{project.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <h2>Mapa de puntos</h2>
          <p className="muted">Vista georreferenciada del proyecto seleccionado.</p>
          <ProjectMapPanel points={selectedAggregate?.points ?? []} />
        </div>
      </section>

      <section className="content-grid">
        <div className="gallery-card">
          <h2>Mediciones y validación</h2>
          <table>
            <thead>
              <tr>
                <th>Punto</th>
                <th>LAeq</th>
                <th>Equipo</th>
                <th>Validez</th>
              </tr>
            </thead>
            <tbody>
              {selectedAggregate?.measurements.map((measurement) => {
                const point = selectedAggregate.points.find((item) => item.id === measurement.pointId);

                return (
                  <tr key={measurement.id}>
                    <td>{point?.code}</td>
                    <td>{measurement.laeq} dB(A)</td>
                    <td>{measurement.equipmentName}</td>
                    <td>
                      <span className={`pill ${measurement.validity}`}>{measurement.validity}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="gallery-card">
          <h2>Registro fotográfico</h2>
          <div className="photo-grid">
            {selectedAggregate?.photos.map((photo) => (
              <div key={photo.id}>
                <Image
                  alt={photo.category}
                  height={180}
                  src={photo.uri}
                  unoptimized
                  width={320}
                  style={{ borderRadius: 18, height: 180, objectFit: "cover", width: "100%" }}
                />
                <div style={{ marginTop: 8 }}>
                  <strong>{photo.category}</strong>
                  <div className="muted">{new Date(photo.capturedAt).toLocaleString("es-CL")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
