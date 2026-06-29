import { createClient } from "npm:@supabase/supabase-js@2.49.9";

type ReportRequest = {
  projectId?: string;
};

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlReport(title: string, summary: string, sections: string[]) {
  return [
    "<html><head><meta charset=\\"utf-8\\" /><title>",
    escapeHtml(title),
    "</title><style>",
    "body { font-family: Arial, sans-serif; margin: 48px; color: #10212b; line-height: 1.6; }",
    "h1, h2 { color: #0f4c5c; } .hero { background: #eef4f5; padding: 18px; border-radius: 16px; margin-bottom: 20px; }",
    "</style></head><body><div class=\\"hero\\"><h1>",
    escapeHtml(title),
    "</h1><p>",
    escapeHtml(summary),
    "</p></div>",
    sections.join(""),
    "</body></html>",
  ].join("");
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const authorization = request.headers.get("Authorization") ?? "";

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization.startsWith("Bearer ")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let body: ReportRequest;

  try {
    body = (await request.json()) as ReportRequest;
  } catch {
    return jsonResponse({ error: "Invalid request payload" }, 400);
  }

  if (!body.projectId) {
    return jsonResponse({ error: "projectId is required" }, 400);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser();

  if (userError || !userData.user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const [memberResult, userResult, projectResult] = await Promise.all([
    supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userData.user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
    supabase.from("users").select("roles(code)").eq("id", userData.user.id).maybeSingle(),
    supabase
      .from("projects")
      .select("id, name, internal_code, report_type, study_objective, organization_id")
      .eq("id", body.projectId)
      .maybeSingle(),
  ]);

  const roleCode = (userResult.data?.roles as { code?: string } | null)?.code;
  const organizationId = memberResult.data?.organization_id;
  const project = projectResult.data;

  if (
    memberResult.error ||
    userResult.error ||
    projectResult.error ||
    !organizationId ||
    !project ||
    project.organization_id !== organizationId ||
    (roleCode !== "reviewer" && roleCode !== "supervisor")
  ) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  const { data: points, error: pointsError } = await supabase
    .from("measurement_points")
    .select("id, code, latitude, longitude, environment_description")
    .eq("project_id", body.projectId)
    .eq("organization_id", organizationId);

  if (pointsError) {
    return jsonResponse({ error: "Unable to load project points" }, 502);
  }

  const pointIds = (points ?? []).map((point) => point.id).filter(Boolean);
  const { data: measurements, error: measurementsError } = await supabase
    .from("measurements")
    .select("measurement_type, laeq, lmax, lmin, validity")
    .eq("organization_id", organizationId)
    .in("point_id", pointIds);

  if (measurementsError) {
    return jsonResponse({ error: "Unable to load project measurements" }, 502);
  }

  const version = Math.floor(Date.now() / 1000);
  const title = "Informe " + project.report_type + " - " + project.name;
  const summary = "Objetivo del estudio: " + project.study_objective;
  const sections = [
    "<h2>Descripcion de puntos</h2><ul>" +
      (points ?? [])
        .map(
          (point) =>
            "<li>" +
            escapeHtml(point.code) +
            ": " +
            escapeHtml(point.environment_description) +
            " (" +
            escapeHtml(point.latitude) +
            ", " +
            escapeHtml(point.longitude) +
            ")</li>",
        )
        .join("") +
      "</ul>",
    "<h2>Resultados</h2><ul>" +
      (measurements ?? [])
        .map(
          (measurement) =>
            "<li>" +
            escapeHtml(measurement.measurement_type) +
            ": LAeq " +
            escapeHtml(measurement.laeq) +
            ", Lmax " +
            escapeHtml(measurement.lmax) +
            ", Lmin " +
            escapeHtml(measurement.lmin) +
            ", " +
            escapeHtml(measurement.validity) +
            "</li>",
        )
        .join("") +
      "</ul>",
  ];

  const html = htmlReport(title, summary, sections);
  const filePath = body.projectId + "/v-" + version + "/report.html";
  const upload = await supabase.storage.from("generated-reports").upload(filePath, html, {
    contentType: "text/html",
    upsert: true,
  });

  if (upload.error) {
    return jsonResponse({ error: "Unable to store report" }, 502);
  }

  const insert = await supabase.from("generated_reports").insert({
    organization_id: organizationId,
    project_id: body.projectId,
    version,
    status: "generated",
    file_type: "html",
    storage_path: filePath,
    payload_snapshot: {
      title,
      summary,
      points: points ?? [],
      measurements: measurements ?? [],
    },
  });

  if (insert.error) {
    return jsonResponse({ error: "Unable to register report" }, 502);
  }

  return jsonResponse({ ok: true, storagePath: filePath });
});
