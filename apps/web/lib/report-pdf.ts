import PDFDocument from "pdfkit";

import { buildReportPayload, type ProjectAggregate } from "@northacoustics/shared";

type PdfDoc = InstanceType<typeof PDFDocument>;

function addParagraph(doc: PdfDoc, text: string, options?: PDFKit.Mixins.TextOptions) {
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#20323B")
    .text(text, {
      align: "justify",
      lineGap: 3,
      ...options,
    });
  doc.moveDown(0.8);
}

function addSectionTitle(doc: PdfDoc, title: string) {
  doc
    .moveDown(0.2)
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#0F4C5C")
    .text(title);
  doc.moveDown(0.4);
}

function addKeyValue(doc: PdfDoc, label: string, value: string) {
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#10212B").text(`${label}: `, { continued: true });
  doc.font("Helvetica").fillColor("#20323B").text(value);
}

export async function buildNorthacousticsPdfBuffer(aggregate: ProjectAggregate) {
  const payload = buildReportPayload(aggregate);
  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: payload.title,
      Author: "Northacoustics Field",
      Subject: aggregate.project.reportType,
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk as Buffer));

  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.rect(0, 0, doc.page.width, 120).fill("#0F4C5C");
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(24).text("Northacoustics", 48, 42);
  doc.font("Helvetica").fontSize(14).text("Informe Técnico Ambiental", 48, 74);
  doc
    .fillColor("#10212B")
    .roundedRect(48, 146, 500, 90, 18)
    .fillAndStroke("#EEF4F5", "#D6E0E4");
  doc.fillColor("#10212B").font("Helvetica-Bold").fontSize(18).text(payload.title, 68, 168, { width: 460 });
  doc.font("Helvetica").fontSize(10).fillColor("#57727E").text(`Código interno: ${aggregate.project.internalCode}`, 68, 210);

  doc.moveDown(10);
  addSectionTitle(doc, "1. Portada");
  addKeyValue(doc, "Cliente", aggregate.client.name);
  addKeyValue(doc, "RUT empresa", aggregate.client.companyRut);
  addKeyValue(doc, "Proyecto", aggregate.project.name);
  addKeyValue(doc, "Fecha de visita", aggregate.project.visitDate);
  addKeyValue(doc, "Responsable", aggregate.project.professionalResponsible);

  addSectionTitle(doc, "2. Antecedentes del cliente");
  addParagraph(
    doc,
    `${aggregate.client.name} se ubica en ${aggregate.client.address}. Contacto principal: ${aggregate.client.contactName} (${aggregate.client.contactEmail}).`,
  );

  addSectionTitle(doc, "3. Objetivo del estudio");
  addParagraph(doc, aggregate.project.studyObjective);

  addSectionTitle(doc, "4. Metodología");
  addParagraph(
    doc,
    "El presente levantamiento fue ejecutado con captura georreferenciada, registro fotográfico, trazabilidad digital y respaldo instrumental, siguiendo un flujo controlado para informes ambientales profesionales.",
  );

  addSectionTitle(doc, "5. Instrumental utilizado");
  if (aggregate.equipment.length) {
    aggregate.equipment.forEach((equipment) => {
      addParagraph(doc, `${equipment.brand} ${equipment.model} | Serie ${equipment.serialNumber}`);
    });
  } else {
    addParagraph(doc, "No se registró instrumental en la base para este proyecto.");
  }

  addSectionTitle(doc, "6. Descripción de puntos de medición");
  aggregate.points.forEach((point) => {
    addParagraph(
      doc,
      `${point.code}. ${point.environmentDescription} Coordenadas: ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}. Receptor sensible: ${point.nearestSensitiveReceiver || "No indicado"}.`,
    );
  });

  addSectionTitle(doc, "7. Condiciones de terreno");
  aggregate.measurements.forEach((measurement) => {
    addParagraph(
      doc,
      `${measurement.measurementType}: ${measurement.environmentalConditions.weatherState}, ${measurement.environmentalConditions.temperatureC} °C, ${measurement.environmentalConditions.relativeHumidity}% HR, ${measurement.environmentalConditions.windSpeedMs} m/s.`,
    );
  });

  addSectionTitle(doc, "8. Resultados de mediciones");
  aggregate.measurements.forEach((measurement) => {
    addParagraph(
      doc,
      `${measurement.measurementType}. LAeq ${measurement.laeq} dB(A), Lmax ${measurement.lmax} dB(A), Lmin ${measurement.lmin} dB(A), validez ${measurement.validity}.`,
    );
  });

  addSectionTitle(doc, "9. Registro fotográfico");
  addParagraph(doc, `Se registraron ${aggregate.photos.length} evidencias fotográficas asociadas al proyecto.`);

  addSectionTitle(doc, "10. Plano o mapa de puntos");
  addParagraph(
    doc,
    aggregate.points.map((point) => `${point.code} (${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)})`).join(" | "),
  );

  addSectionTitle(doc, "11. Análisis técnico");
  addParagraph(doc, payload.executiveSummary);

  addSectionTitle(doc, "12. Conclusiones");
  addParagraph(
    doc,
    "La información levantada permite sostener la trazabilidad del estudio y consolidar una base técnica suficiente para la emisión del informe ambiental correspondiente.",
  );

  addSectionTitle(doc, "13. Anexos");
  addParagraph(doc, "Anexos disponibles en el repositorio documental: fotografías, trazabilidad digital, instrumental y registros asociados.");

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#6B818A")
    .text("Northacoustics Field | Informe generado automáticamente", 48, doc.page.height - 48, {
      align: "center",
      width: doc.page.width - 96,
    });

  doc.end();
  return finished;
}
