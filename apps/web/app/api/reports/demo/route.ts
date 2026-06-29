import { buildReportHtml, buildReportPayload } from "@northacoustics/shared";

import { getAdminSeedData } from "../../../../lib/admin-data";
import { authorizeReportRequest } from "../../../../lib/report-authorization";
import { buildNorthacousticsPdfBuffer } from "../../../../lib/report-pdf";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

type ReportRequestBody = {
  format?: "html" | "pdf";
  projectId?: string;
};

export async function POST(request: Request) {
  const authorization = await authorizeReportRequest(request);

  if (!authorization) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  let body: ReportRequestBody;

  try {
    body = (await request.json()) as ReportRequestBody;
  } catch {
    return Response.json({ message: "Solicitud de informe invalida." }, { status: 400 });
  }

  const data = await getAdminSeedData(authorization.organizationId);
  const projectId = body.projectId ?? data.aggregates[0]?.project.id;
  const format = body.format ?? "pdf";
  const aggregate = data.aggregates.find((item) => item.project.id === projectId) ?? data.aggregates[0];

  if (!aggregate) {
    return new Response("No hay datos suficientes para generar el informe.", { status: 404 });
  }

  const payload = buildReportPayload(aggregate);
  const safeProjectCode = aggregate.project.internalCode.replace(/[^a-zA-Z0-9_-]/g, "-");
  const fileBaseName = "northacoustics-" + safeProjectCode + "-v" + (aggregate.reports.length + 1);

  if (format === "html") {
    const reportHtml = buildReportHtml(payload);

    return new Response(reportHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'attachment; filename="' + fileBaseName + '.html"',
      },
    });
  }

  const pdfBuffer = await buildNorthacousticsPdfBuffer(aggregate);
  const supabase = createSupabaseServerClient();

  if (supabase) {
    const version = aggregate.reports.length + 1;
    const storagePath = aggregate.project.id + "/v" + version + "/" + fileBaseName + ".pdf";
    const upload = await supabase.storage.from("generated-reports").upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

    if (upload.error) {
      return Response.json({ message: "No fue posible almacenar el informe." }, { status: 502 });
    }

    const insert = await supabase.from("generated_reports").insert({
      organization_id: authorization.organizationId,
      project_id: aggregate.project.id,
      version,
      status: "generated",
      file_type: "pdf",
      storage_path: storagePath,
      payload_snapshot: payload,
    });

    if (insert.error) {
      return Response.json({ message: "No fue posible registrar el informe." }, { status: 502 });
    }
  }

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="' + fileBaseName + '.pdf"',
    },
  });
}

export async function GET() {
  return Response.json({ message: "Use POST con una sesion autorizada." }, { status: 405 });
}
