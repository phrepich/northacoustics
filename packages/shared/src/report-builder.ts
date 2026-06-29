import type {
  Measurement,
  MeasurementPoint,
  ProjectAggregate,
  ReportPayload,
} from "./types";

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function measurementSummary(measurements: Measurement[]) {
  const laeqValues = measurements.map((measurement) => measurement.laeq);
  const maxLmax = Math.max(...measurements.map((measurement) => measurement.lmax));
  const minLmin = Math.min(...measurements.map((measurement) => measurement.lmin));

  return {
    averageLaeq: average(laeqValues).toFixed(1),
    maxLmax: Number.isFinite(maxLmax) ? maxLmax.toFixed(1) : "0.0",
    minLmin: Number.isFinite(minLmin) ? minLmin.toFixed(1) : "0.0",
  };
}

function buildPointDescription(point: MeasurementPoint) {
  return `${point.code}: ${point.environmentDescription} Uso observado ${point.landUse}. Receptor sensible cercano: ${point.nearestSensitiveReceiver}.`;
}

export function buildReportPayload(aggregate: ProjectAggregate): ReportPayload {
  const summary = measurementSummary(aggregate.measurements);
  const project = aggregate.project;
  const client = aggregate.client;

  return {
    title: `Informe ${project.reportType} - ${project.name}`,
    executiveSummary:
      `Se evaluó el proyecto ${project.name} para ${client.name}. ` +
      `El promedio de LAeq fue ${summary.averageLaeq} dB(A), ` +
      `con Lmax máximo de ${summary.maxLmax} dB(A) y Lmin mínimo de ${summary.minLmin} dB(A).`,
    aggregate,
  };
}

export function buildReportMarkdown(payload: ReportPayload) {
  const { aggregate } = payload;
  const pointLines = aggregate.points.map((point) => `- ${buildPointDescription(point)}`).join("\n");
  const measurementLines = aggregate.measurements
    .map(
      (measurement) =>
        `- ${measurement.measurementType}: LAeq ${measurement.laeq} dB(A), ` +
        `Lmax ${measurement.lmax} dB(A), Lmin ${measurement.lmin} dB(A), validez ${measurement.validity}.`,
    )
    .join("\n");

  return [
    `# ${payload.title}`,
    "",
    "## 1. Portada",
    `${aggregate.client.name} - ${aggregate.project.internalCode}`,
    "",
    "## 2. Antecedentes del cliente",
    `${aggregate.client.name} (${aggregate.client.companyRut})`,
    "",
    "## 3. Objetivo del estudio",
    aggregate.project.studyObjective,
    "",
    "## 4. Metodología",
    `Campaña en terreno realizada el ${aggregate.project.visitDate} con georreferenciación, registro fotográfico y control instrumental.`,
    "",
    "## 5. Instrumental utilizado",
    ...aggregate.equipment.map(
      (equipment) => `- ${equipment.brand} ${equipment.model} / Serie ${equipment.serialNumber}`,
    ),
    "",
    "## 6. Descripción de puntos de medición",
    pointLines,
    "",
    "## 7. Condiciones de terreno",
    ...aggregate.measurements.map(
      (measurement) =>
        `- ${measurement.measurementType}: ${measurement.environmentalConditions.weatherState}, ` +
        `${measurement.environmentalConditions.temperatureC} °C, ` +
        `${measurement.environmentalConditions.windSpeedMs} m/s.`,
    ),
    "",
    "## 8. Resultados de mediciones",
    measurementLines,
    "",
    "## 9. Registro fotográfico",
    ...aggregate.photos.map((photo) => `- ${photo.category}: ${photo.uri}`),
    "",
    "## 10. Plano o mapa de puntos",
    ...aggregate.points.map((point) => `- ${point.code}: ${point.latitude}, ${point.longitude}`),
    "",
    "## 11. Análisis técnico",
    payload.executiveSummary,
    "",
    "## 12. Conclusiones",
    "Los valores levantados permiten estructurar el informe final y respaldar la trazabilidad del estudio.",
    "",
    "## 13. Anexos",
    "Se adjuntan fotografías, certificados de calibración y bitácora digital de terreno.",
  ].join("\n");
}

export function buildReportHtml(payload: ReportPayload) {
  const markdown = buildReportMarkdown(payload);
  const htmlBody = markdown
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) {
        return `<h1>${line.slice(2)}</h1>`;
      }
      if (line.startsWith("## ")) {
        return `<h2>${line.slice(3)}</h2>`;
      }
      if (line.startsWith("- ")) {
        return `<li>${line.slice(2)}</li>`;
      }
      if (!line.trim()) {
        return "<br />";
      }
      return `<p>${line}</p>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${payload.title}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #10212b; margin: 48px; line-height: 1.5; }
      h1, h2 { color: #0f4c5c; }
      h1 { border-bottom: 3px solid #0f4c5c; padding-bottom: 12px; }
      li { margin-bottom: 8px; }
      .hero { background: #eef4f5; padding: 16px 20px; border-radius: 16px; margin-bottom: 24px; }
    </style>
  </head>
  <body>
    <div class="hero">
      <strong>Northacoustics Field</strong>
      <p>${payload.executiveSummary}</p>
    </div>
    ${htmlBody}
  </body>
</html>`.trim();
}

export function toCsv<T extends Record<string, unknown>>(rows: T[]) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const csvRows = rows.map((row) =>
    headers
      .map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`)
      .join(","),
  );

  return [headers.join(","), ...csvRows].join("\n");
}

