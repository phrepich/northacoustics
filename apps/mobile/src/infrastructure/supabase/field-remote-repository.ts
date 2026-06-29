import {
  type ChecklistRun,
  type Client,
  type EntitySyncMetadata,
  type Equipment,
  type GeneratedReportVersion,
  type Measurement,
  type MeasurementPoint,
  type PhotoRecord,
  type Project,
  type RoleCode,
  type SignatureRecord,
  type UserProfile,
} from "@northacoustics/shared";
import type { User } from "@supabase/supabase-js";

import type { PersistedFieldState } from "../../domain/field/field-state";
import { supabase } from "./mobile-supabase-client";

interface UserRow {
  id: string;
  full_name: string;
  phone: string | null;
  role_id: string;
}

interface RoleRow {
  code: string | null;
}

interface ClientRow {
  id: string;
  name: string;
  company_rut: string;
  address: string;
  contact_name: string;
  contact_email: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  version?: number | null;
  updated_by?: string | null;
  device_id?: string | null;
  sync_version?: number | null;
  deleted_at?: string | null;
  sync_status?: EntitySyncMetadata["syncStatus"] | null;
}

interface ProjectRow {
  id: string;
  client_id: string;
  name: string;
  internal_code: string;
  site_address: string;
  district: string;
  region: string;
  visit_date: string;
  professional_responsible: string;
  study_objective: string;
  report_type: string;
  applicable_regulation: string;
  general_notes: string | null;
  status: Project["status"];
  created_at: string;
  updated_at: string;
  version?: number | null;
  updated_by?: string | null;
  device_id?: string | null;
  sync_version?: number | null;
  deleted_at?: string | null;
  sync_status?: EntitySyncMetadata["syncStatus"] | null;
}

interface PointRow {
  id: string;
  project_id: string;
  code: string;
  latitude: number | string;
  longitude: number | string;
  photo_path: string | null;
  environment_description: string;
  sketch_reference: string | null;
  land_use: string | null;
  nearest_sensitive_receiver: string | null;
  estimated_distance_to_source_m: number | string | null;
  notes: string | null;
  measured_at: string;
  recorded_by: string | null;
  status: MeasurementPoint["status"];
  created_at: string;
  updated_at: string;
  version?: number | null;
  updated_by?: string | null;
  device_id?: string | null;
  sync_version?: number | null;
  deleted_at?: string | null;
  sync_status?: EntitySyncMetadata["syncStatus"] | null;
}

interface EnvironmentalConditionRow {
  measurement_id: string;
  temperature_c: number | string | null;
  relative_humidity: number | string | null;
  wind_speed_ms: number | string | null;
  cloudiness: string | null;
  weather_state: string | null;
  weather_notes: string | null;
  external_evidence: string | null;
}

interface MeasurementRow {
  id: string;
  point_id: string;
  measurement_type: string;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  laeq: number | string;
  lmax: number | string;
  lmin: number | string;
  l10: number | string | null;
  l50: number | string | null;
  l90: number | string | null;
  weighting: string;
  equipment_response: string;
  equipment_name: string;
  sound_level_meter_code: string;
  serial_number: string;
  calibrator_name: string;
  initial_calibration: number | string;
  final_calibration: number | string;
  validity: Measurement["validity"];
  technical_notes: string | null;
  created_at: string;
  updated_at: string;
  version?: number | null;
  updated_by?: string | null;
  device_id?: string | null;
  sync_version?: number | null;
  deleted_at?: string | null;
  sync_status?: EntitySyncMetadata["syncStatus"] | null;
}

interface PhotoRow {
  id: string;
  project_id: string;
  point_id: string | null;
  measurement_id: string | null;
  category: PhotoRecord["category"];
  storage_path: string;
  taken_at: string;
  captured_by: string | null;
  latitude: number | undefined;
  longitude: number | undefined;
  version?: number | null;
  updated_by?: string | null;
  device_id?: string | null;
  sync_version?: number | null;
  deleted_at?: string | null;
  sync_status?: EntitySyncMetadata["syncStatus"] | null;
}

interface EquipmentRow {
  id: string;
  type: Equipment["type"];
  brand: string;
  model: string;
  serial_number: string;
  calibration_certificate_path: string | null;
  calibration_due_date: string | null;
  attachment_path: string | null;
  version?: number | null;
  updated_by?: string | null;
  device_id?: string | null;
  sync_version?: number | null;
  deleted_at?: string | null;
  sync_status?: EntitySyncMetadata["syncStatus"] | null;
}

interface ChecklistRow {
  id: string;
  project_id: string;
  point_id: string | null;
  measurement_id: string | null;
  technician_id: string | null;
  items: ChecklistRun["items"] | null;
  technician_confirmation: string | null;
  created_at: string;
  version?: number | null;
  updated_by?: string | null;
  device_id?: string | null;
  sync_version?: number | null;
  deleted_at?: string | null;
  sync_status?: EntitySyncMetadata["syncStatus"] | null;
}

interface SignatureRow {
  id: string;
  entity_type: SignatureRecord["entityType"];
  entity_id: string;
  signed_by: string | null;
  signed_at: string;
  signature_label: string;
}

interface ReportRow {
  id: string;
  project_id: string;
  version: number;
  status: GeneratedReportVersion["status"];
  storage_path: string | null;
  generated_at: string;
  generated_by: string | null;
  updated_by?: string | null;
  device_id?: string | null;
  sync_version?: number | null;
  deleted_at?: string | null;
  sync_status?: EntitySyncMetadata["syncStatus"] | null;
}

function normalizeRole(value: string | null | undefined): RoleCode {
  if (value === "reviewer" || value === "supervisor" || value === "technician") {
    return value;
  }

  return "technician";
}

function rows<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

function syncMetadata(row: {
  version?: number | null;
  updated_by?: string | null;
  device_id?: string | null;
  sync_version?: number | null;
  deleted_at?: string | null;
  sync_status?: EntitySyncMetadata["syncStatus"] | null;
}): EntitySyncMetadata {
  return {
    version: row.version ?? 1,
    updatedBy: row.updated_by ?? undefined,
    deviceId: row.device_id ?? "remote",
    syncVersion: row.sync_version ?? 0,
    deletedAt: row.deleted_at ?? undefined,
    syncStatus: row.sync_status ?? "synced",
  };
}

export async function getActiveSupabaseUser(): Promise<User | null> {
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

export async function signInWithPassword(email: string, password: string): Promise<User> {
  if (!supabase) {
    throw new Error("Supabase no está configurado.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("No fue posible obtener el usuario autenticado.");
  }

  return data.user;
}

export async function signOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getCurrentUserProfile(user: User): Promise<UserProfile> {
  if (!supabase) {
    throw new Error("Supabase no está configurado.");
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("users")
    .select("id, full_name, phone, role_id")
    .eq("id", user.id)
    .single<UserRow>();

  if (profileError) {
    throw profileError;
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("code")
    .eq("id", profileRow.role_id)
    .single<RoleRow>();

  if (roleError) {
    throw roleError;
  }

  return {
    id: profileRow.id,
    fullName: profileRow.full_name,
    email: user.email ?? "",
    role: normalizeRole(roleRow.code),
    phone: profileRow.phone ?? undefined,
  };
}

export async function fetchRemoteFieldState(
  currentUser?: UserProfile,
): Promise<Omit<PersistedFieldState, "currentUser" | "lastSyncAt" | "syncQueue" | "syncConflicts" | "syncTelemetry" | "deviceId">> {
  if (!supabase) {
    throw new Error("Supabase no está configurado.");
  }

  const results = await Promise.all([
    supabase.from("clients").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
    supabase.from("projects").select("*").is("deleted_at", null).order("visit_date", { ascending: false }),
    supabase.from("measurement_points").select("*").is("deleted_at", null).order("measured_at", { ascending: false }),
    supabase.from("measurements").select("*").is("deleted_at", null).order("started_at", { ascending: false }),
    supabase.from("environmental_conditions").select("*"),
    supabase.from("photos").select("*").is("deleted_at", null).order("taken_at", { ascending: false }),
    supabase.from("equipment").select("*").is("deleted_at", null).order("brand", { ascending: true }),
    supabase.from("checklists").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
    supabase.from("signatures").select("*").order("signed_at", { ascending: false }),
    supabase.from("generated_reports").select("*").is("deleted_at", null).order("generated_at", { ascending: false }),
  ]);

  const firstError = results.map((result) => result.error).find(Boolean);
  if (firstError) {
    throw firstError;
  }

  const [
    clientsResult,
    projectsResult,
    pointsResult,
    measurementsResult,
    conditionsResult,
    photosResult,
    equipmentResult,
    checklistResult,
    signaturesResult,
    reportsResult,
  ] = results;

  const conditionsByMeasurementId = new Map(
    rows<EnvironmentalConditionRow>(conditionsResult.data).map((item) => [item.measurement_id, item]),
  );

  const clients: Client[] = rows<ClientRow>(clientsResult.data).map((client) => ({
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
    sync: syncMetadata(client),
  }));

  const projects: Project[] = rows<ProjectRow>(projectsResult.data).map((project) => ({
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
    sync: syncMetadata(project),
  }));

  const points: MeasurementPoint[] = rows<PointRow>(pointsResult.data).map((point) => ({
    id: point.id,
    projectId: point.project_id,
    code: point.code,
    latitude: Number(point.latitude),
    longitude: Number(point.longitude),
    photoUri: point.photo_path ?? undefined,
    environmentDescription: point.environment_description,
    sketchReference: point.sketch_reference ?? "",
    landUse: point.land_use ?? "",
    nearestSensitiveReceiver: point.nearest_sensitive_receiver ?? "",
    estimatedDistanceToSourceM: Number(point.estimated_distance_to_source_m ?? 0),
    notes: point.notes ?? "",
    measuredAt: point.measured_at,
    recordedBy: currentUser?.fullName ?? String(point.recorded_by ?? ""),
    status: point.status,
    createdAt: point.created_at,
    updatedAt: point.updated_at,
    sync: syncMetadata(point),
  }));

  const measurements: Measurement[] = rows<MeasurementRow>(measurementsResult.data).map((measurement) => {
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
      sync: syncMetadata(measurement),
    };
  });

  const photos: PhotoRecord[] = rows<PhotoRow>(photosResult.data).map((photo) => ({
    id: photo.id,
    projectId: photo.project_id,
    pointId: photo.point_id ?? undefined,
    measurementId: photo.measurement_id ?? undefined,
    category: photo.category,
    uri: photo.storage_path,
    capturedAt: photo.taken_at,
    capturedBy: currentUser?.fullName ?? String(photo.captured_by ?? ""),
    latitude: photo.latitude,
    longitude: photo.longitude,
    sync: syncMetadata(photo),
  }));

  const equipment: Equipment[] = rows<EquipmentRow>(equipmentResult.data).map((item) => ({
    id: item.id,
    type: item.type,
    brand: item.brand,
    model: item.model,
    serialNumber: item.serial_number,
    calibrationCertificateUrl: item.calibration_certificate_path ?? undefined,
    calibrationDueDate: item.calibration_due_date ?? undefined,
    attachmentUrl: item.attachment_path ?? undefined,
    sync: syncMetadata(item),
  }));

  const checklistRuns: ChecklistRun[] = rows<ChecklistRow>(checklistResult.data).map((item) => ({
    id: item.id,
    projectId: item.project_id,
    pointId: item.point_id ?? undefined,
    measurementId: item.measurement_id ?? undefined,
    technicianId: item.technician_id ?? "",
    items: Array.isArray(item.items) ? item.items : [],
    technicianConfirmation: item.technician_confirmation ?? "",
    createdAt: item.created_at,
    sync: syncMetadata(item),
  }));

  const signatures: SignatureRecord[] = rows<SignatureRow>(signaturesResult.data).map((item) => ({
    id: item.id,
    entityType: item.entity_type,
    entityId: item.entity_id,
    signedBy: item.signed_by ?? "",
    role: currentUser?.role ?? "technician",
    signedAt: item.signed_at,
    signatureLabel: item.signature_label,
  }));

  const reports: GeneratedReportVersion[] = rows<ReportRow>(reportsResult.data).map((item) => ({
    id: item.id,
    projectId: item.project_id,
    version: item.version,
    status: item.status,
    storagePath: item.storage_path ?? undefined,
    generatedAt: item.generated_at,
    generatedBy: item.generated_by ?? "",
    sync: syncMetadata(item),
  }));

  return {
    clients,
    projects,
    points,
    measurements,
    photos,
    equipment,
    checklistRuns,
    signatures,
    reports,
  };
}
