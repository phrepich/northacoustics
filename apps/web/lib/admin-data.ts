import {
  sampleChecklistRuns,
  sampleClients,
  sampleMeasurements,
  samplePhotos,
  samplePoints,
  sampleProjects,
  sampleReports,
  sampleSignatures,
  type ChecklistRun,
  type Client,
  type Equipment,
  type GeneratedReportVersion,
  type Measurement,
  type MeasurementPoint,
  type PhotoRecord,
  type Project,
  type ProjectAggregate,
  type SignatureRecord,
} from "@northacoustics/shared";

import { createSupabaseServerClient } from "./supabase-server";
import { webRuntimeConfig } from "./runtime-config";

function isAbsoluteUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

export interface AdminSeedData {
  clients: Client[];
  projects: Project[];
  points: MeasurementPoint[];
  measurements: Measurement[];
  photos: PhotoRecord[];
  equipment: Equipment[];
  checklistRuns: ChecklistRun[];
  signatures: SignatureRecord[];
  reports: GeneratedReportVersion[];
  aggregates: ProjectAggregate[];
}

function buildAggregates(
  clients: Client[],
  projects: Project[],
  points: MeasurementPoint[],
  measurements: Measurement[],
  photos: PhotoRecord[],
  equipment: Equipment[],
  checklistRuns: ChecklistRun[],
  signatures: SignatureRecord[],
  reports: GeneratedReportVersion[],
) {
  return projects
    .map((project) => {
      const client = clients.find((item) => item.id === project.clientId);
      if (!client) {
        return null;
      }

      const projectPoints = points.filter((point) => point.projectId === project.id);
      const pointIds = projectPoints.map((point) => point.id);

      return {
        client,
        project,
        points: projectPoints,
        measurements: measurements.filter((measurement) => pointIds.includes(measurement.pointId)),
        photos: photos.filter((photo) => photo.projectId === project.id),
        equipment,
        checklistRuns: checklistRuns.filter((item) => item.projectId === project.id),
        signatures: signatures.filter((item) => item.entityId === project.id || pointIds.includes(item.entityId)),
        reports: reports.filter((report) => report.projectId === project.id),
      } satisfies ProjectAggregate;
    })
    .filter(Boolean) as ProjectAggregate[];
}

export async function getAdminSeedData(organizationId?: string): Promise<AdminSeedData> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    if (!webRuntimeConfig.enableDemoMode) {
      return {
        clients: [],
        projects: [],
        points: [],
        measurements: [],
        photos: [],
        equipment: [],
        checklistRuns: [],
        signatures: [],
        reports: [],
        aggregates: [],
      };
    }

    return {
      clients: sampleClients,
      projects: sampleProjects,
      points: samplePoints,
      measurements: sampleMeasurements,
      photos: samplePhotos,
      equipment: [],
      checklistRuns: sampleChecklistRuns,
      signatures: sampleSignatures,
      reports: sampleReports,
      aggregates: buildAggregates(
        sampleClients,
        sampleProjects,
        samplePoints,
        sampleMeasurements,
        samplePhotos,
        [],
        sampleChecklistRuns,
        sampleSignatures,
        sampleReports,
      ),
    };
  }

  const [clientsResult, projectsResult, pointsResult, measurementsResult, conditionsResult, photosResult, equipmentResult, checklistResult, signaturesResult, reportsResult] = await Promise.all([
    supabase.from("clients").select("*").eq("organization_id", organizationId ?? "").is("deleted_at", null).order("created_at", { ascending: false }),
    supabase.from("projects").select("*").eq("organization_id", organizationId ?? "").is("deleted_at", null).order("visit_date", { ascending: false }),
    supabase.from("measurement_points").select("*").eq("organization_id", organizationId ?? "").is("deleted_at", null).order("measured_at", { ascending: false }),
    supabase.from("measurements").select("*").eq("organization_id", organizationId ?? "").is("deleted_at", null).order("started_at", { ascending: false }),
    supabase.from("environmental_conditions").select("*").eq("organization_id", organizationId ?? ""),
    supabase.from("photos").select("*").eq("organization_id", organizationId ?? "").is("deleted_at", null).order("taken_at", { ascending: false }),
    supabase.from("equipment").select("*").eq("organization_id", organizationId ?? "").is("deleted_at", null).order("brand", { ascending: true }),
    supabase.from("checklists").select("*").eq("organization_id", organizationId ?? "").is("deleted_at", null).order("created_at", { ascending: false }),
    supabase.from("signatures").select("*").eq("organization_id", organizationId ?? "").order("signed_at", { ascending: false }),
    supabase.from("generated_reports").select("*").eq("organization_id", organizationId ?? "").is("deleted_at", null).order("generated_at", { ascending: false }),
  ]);

  if (
    clientsResult.error ||
    projectsResult.error ||
    pointsResult.error ||
    measurementsResult.error ||
    photosResult.error ||
    equipmentResult.error ||
    checklistResult.error ||
    signaturesResult.error ||
    reportsResult.error
  ) {
    throw new Error("No fue posible cargar los datos de la organizacion solicitada.");
  }

  const conditionsByMeasurementId = new Map(
    (conditionsResult.data ?? []).map((item: any) => [item.measurement_id, item]),
  );

  const clients: Client[] = (clientsResult.data ?? []).map((client: any) => ({
    id: client.id,
    name: client.name,
    companyRut: client.company_rut,
    address: client.address,
    contactName: client.contact_name,
    contactEmail: client.contact_email,
    phone: client.phone ?? "",
    notes: client.notes ?? "",
    createdAt: client.created_at,
    updatedAt: client.updated_at,
  }));

  const projects: Project[] = (projectsResult.data ?? []).map((project: any) => ({
    id: project.id,
    clientId: project.client_id,
    name: project.name,
    internalCode: project.internal_code,
    siteAddress: project.site_address,
    district: project.district,
    region: project.region,
    visitDate: project.visit_date,
    professionalResponsible: project.professional_responsible,
    studyObjective: project.study_objective,
    reportType: project.report_type,
    applicableRegulation: project.applicable_regulation,
    generalNotes: project.general_notes ?? "",
    status: project.status,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  }));

  const points: MeasurementPoint[] = (pointsResult.data ?? []).map((point: any) => ({
    id: point.id,
    projectId: point.project_id,
    code: point.code,
    latitude: point.latitude,
    longitude: point.longitude,
    photoUri: point.photo_path ?? undefined,
    environmentDescription: point.environment_description,
    sketchReference: point.sketch_reference ?? "",
    landUse: point.land_use ?? "",
    nearestSensitiveReceiver: point.nearest_sensitive_receiver ?? "",
    estimatedDistanceToSourceM: Number(point.estimated_distance_to_source_m ?? 0),
    notes: point.notes ?? "",
    measuredAt: point.measured_at,
    recordedBy: point.recorded_by ?? "",
    status: point.status,
    createdAt: point.created_at,
    updatedAt: point.updated_at,
  }));

  const measurements: Measurement[] = (measurementsResult.data ?? []).map((measurement: any) => {
    const condition = conditionsByMeasurementId.get(measurement.id);

    return {
      id: measurement.id,
      pointId: measurement.point_id,
      measurementType: measurement.measurement_type,
      startedAt: measurement.started_at,
      endedAt: measurement.ended_at,
      durationMinutes: measurement.duration_minutes,
      laeq: Number(measurement.laeq),
      lmax: Number(measurement.lmax),
      lmin: Number(measurement.lmin),
      l10: measurement.l10 ? Number(measurement.l10) : undefined,
      l50: measurement.l50 ? Number(measurement.l50) : undefined,
      l90: measurement.l90 ? Number(measurement.l90) : undefined,
      weighting: measurement.weighting,
      equipmentResponse: measurement.equipment_response,
      equipmentName: measurement.equipment_name,
      soundLevelMeterCode: measurement.sound_level_meter_code,
      serialNumber: measurement.serial_number,
      calibratorName: measurement.calibrator_name,
      initialCalibration: Number(measurement.initial_calibration),
      finalCalibration: Number(measurement.final_calibration),
      validity: measurement.validity,
      technicalNotes: measurement.technical_notes ?? "",
      environmentalConditions: {
        temperatureC: Number(condition?.temperature_c ?? 0),
        relativeHumidity: Number(condition?.relative_humidity ?? 0),
        windSpeedMs: Number(condition?.wind_speed_ms ?? 0),
        cloudiness: condition?.cloudiness ?? "",
        weatherState: condition?.weather_state ?? "",
        weatherNotes: condition?.weather_notes ?? "",
        externalEvidence: condition?.external_evidence ?? "",
      },
      createdAt: measurement.created_at,
      updatedAt: measurement.updated_at,
    };
  });

  const photos: PhotoRecord[] = (photosResult.data ?? []).map((photo: any) => ({
    id: photo.id,
    projectId: photo.project_id,
    pointId: photo.point_id ?? undefined,
    measurementId: photo.measurement_id ?? undefined,
    category: photo.category,
    uri: photo.storage_path,
    capturedAt: photo.taken_at,
    capturedBy: photo.captured_by ?? "",
    latitude: photo.latitude ?? undefined,
    longitude: photo.longitude ?? undefined,
  }));

  const photosWithUrls: PhotoRecord[] = await Promise.all(
    photos.map(async (photo) => {
      if (isAbsoluteUrl(photo.uri)) {
        return photo;
      }

      const { data } = await supabase.storage.from("project-photos").createSignedUrl(photo.uri, 60 * 60);

      return {
        ...photo,
        uri: data?.signedUrl ?? photo.uri,
      };
    }),
  );

  const equipment: Equipment[] = (equipmentResult.data ?? []).map((item: any) => ({
    id: item.id,
    type: item.type,
    brand: item.brand,
    model: item.model,
    serialNumber: item.serial_number,
    calibrationCertificateUrl: item.calibration_certificate_path ?? undefined,
    calibrationDueDate: item.calibration_due_date ?? undefined,
    attachmentUrl: item.attachment_path ?? undefined,
  }));

  const checklistRuns: ChecklistRun[] = (checklistResult.data ?? []).map((item: any) => ({
    id: item.id,
    projectId: item.project_id,
    pointId: item.point_id ?? undefined,
    measurementId: item.measurement_id ?? undefined,
    technicianId: item.technician_id ?? "",
    items: Array.isArray(item.items) ? item.items : [],
    technicianConfirmation: item.technician_confirmation ?? "",
    createdAt: item.created_at,
  }));

  const signatures: SignatureRecord[] = (signaturesResult.data ?? []).map((item: any) => ({
    id: item.id,
    entityType: item.entity_type,
    entityId: item.entity_id,
    signedBy: item.signed_by ?? "",
    role: "technician",
    signedAt: item.signed_at,
    signatureLabel: item.signature_label,
  }));

  const reports: GeneratedReportVersion[] = (reportsResult.data ?? []).map((report: any) => ({
    id: report.id,
    projectId: report.project_id,
    version: report.version,
    status: report.status,
    storagePath: report.storage_path ?? undefined,
    generatedAt: report.generated_at,
    generatedBy: report.generated_by ?? "",
  }));

  return {
    clients,
    projects,
    points,
    measurements,
    photos: photosWithUrls,
    equipment,
    checklistRuns,
    signatures,
    reports,
    aggregates: buildAggregates(clients, projects, points, measurements, photosWithUrls, equipment, checklistRuns, signatures, reports),
  };
}
