import { buildReportPayload, type ProjectAggregate } from "@northacoustics/shared";

export function ReportPreviewCard({ aggregate }: { aggregate: ProjectAggregate }) {
  const payload = buildReportPayload(aggregate);

  return (
    <div className="panel">
      <small className="muted">Automatización documental</small>
      <h3 style={{ marginBottom: 8 }}>{payload.title}</h3>
      <p className="muted" style={{ lineHeight: 1.6 }}>
        {payload.executiveSummary}
      </p>
      <div className="actions">
        <a className="button primary" href={`/api/reports/demo?projectId=${aggregate.project.id}&format=pdf`}>
          Descargar PDF
        </a>
        <a className="button secondary" href={`/api/reports/demo?projectId=${aggregate.project.id}&format=html`}>
          Descargar HTML
        </a>
        <span className="button secondary">Versión actual: {aggregate.reports[0]?.version ?? 0}</span>
      </div>
    </div>
  );
}
