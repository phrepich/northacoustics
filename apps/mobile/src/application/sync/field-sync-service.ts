import type {
  Client,
  GeneratedReportVersion,
  Measurement,
  MeasurementPoint,
  PhotoRecord,
  Project,
  SyncConflictRecord,
  SyncEntity,
  SyncQueueItem,
} from "@northacoustics/shared";

import { supabase } from "../../infrastructure/supabase/mobile-supabase-client";
import {
  canAttemptSync,
  createSyncConflict,
  hashString,
  markQueueItemAttempt,
  orderQueueForSync,
} from "./offline-sync-engine";

interface RemoteSyncRow {
  id: string;
  version: number | null;
  sync_version: number | null;
  device_id: string | null;
  deleted_at: string | null;
}

export interface SyncRunResult {
  queue: SyncQueueItem[];
  conflicts: SyncConflictRecord[];
  successfulCount: number;
  failedCount: number;
  syncedBytes: number;
}

function assertSupabase() {
  if (!supabase) {
    throw new Error("Supabase no está configurado.");
  }

  return supabase;
}

function tableForEntity(entity: SyncEntity): string | null {
  switch (entity) {
    case "client":
      return "clients";
    case "project":
      return "projects";
    case "measurement-point":
      return "measurement_points";
    case "measurement":
      return "measurements";
    case "photo":
      return "photos";
    case "report":
      return "generated_reports";
    case "environmental-condition":
      return "environmental_conditions";
    case "file":
      return null;
  }
}

function localVersionOf(item: SyncQueueItem): number {
  const payload = item.payload as { sync?: { version?: number; syncVersion?: number } };
  return payload.sync?.version ?? payload.sync?.syncVersion ?? 1;
}

function localSyncVersionOf(item: SyncQueueItem): number {
  const payload = item.payload as { sync?: { syncVersion?: number } };
  return payload.sync?.syncVersion ?? 0;
}

async function getRemoteSyncRow(item: SyncQueueItem): Promise<RemoteSyncRow | null> {
  const client = assertSupabase();
  const table = item.entity ? tableForEntity(item.entity) : null;

  if (!table) {
    return null;
  }

  const { data, error } = await client
    .from(table)
    .select("id, version, sync_version, device_id, deleted_at")
    .eq("id", item.entityId)
    .maybeSingle<RemoteSyncRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
}

async function detectConflict(item: SyncQueueItem): Promise<SyncConflictRecord | null> {
  if (!item.entity) {
    return null;
  }

  const remote = await getRemoteSyncRow(item);
  if (!remote) {
    return null;
  }

  const localVersion = localVersionOf(item);
  const localSyncVersion = localSyncVersionOf(item);
  const remoteVersion = remote.version ?? 0;
  const remoteSyncVersion = remote.sync_version ?? 0;
  const changedOnAnotherDevice = Boolean(remote.device_id && item.deviceId && remote.device_id !== item.deviceId);

  if (remote.deleted_at && item.operation !== "restore") {
    return createSyncConflict({
      entity: item.entity,
      entityId: item.entityId,
      localVersion,
      remoteVersion,
      reason: "remote-deleted",
      decisionBy: item.userId,
    });
  }

  if (changedOnAnotherDevice && remoteSyncVersion > localSyncVersion) {
    return createSyncConflict({
      entity: item.entity,
      entityId: item.entityId,
      localVersion,
      remoteVersion,
      reason: item.entity === "photo" ? "photo-conflict" : "simultaneous-edit",
      decisionBy: item.userId,
    });
  }

  return null;
}

function nextVersion(item: SyncQueueItem): number {
  return localVersionOf(item) + 1;
}

function syncColumns(item: SyncQueueItem, options?: { includeEntityVersion?: boolean }) {
  const base = {
    version: nextVersion(item),
    updated_by: item.userId,
    device_id: item.deviceId,
    sync_version: localSyncVersionOf(item) + 1,
    sync_status: "synced",
    deleted_at: item.operation === "delete" ? new Date().toISOString() : null,
  };

  if (options?.includeEntityVersion === false) {
    const { version: _version, ...withoutVersion } = base;
    return withoutVersion;
  }

  return base;
}

async function syncClient(item: SyncQueueItem): Promise<void> {
  const client = item.payload as Client;
  const db = assertSupabase();
  const { error } = await db.from("clients").upsert({
    id: client.id,
    name: client.name,
    company_rut: client.companyRut,
    address: client.address,
    contact_name: client.contactName,
    contact_email: client.contactEmail,
    phone: client.phone,
    notes: client.notes,
    ...syncColumns(item),
  });

  if (error) {
    throw error;
  }
}

async function syncProject(item: SyncQueueItem): Promise<void> {
  const project = item.payload as Project;
  const db = assertSupabase();
  const { error } = await db.from("projects").upsert({
    id: project.id,
    client_id: project.clientId,
    name: project.name,
    internal_code: project.internalCode,
    site_address: project.siteAddress,
    district: project.district,
    region: project.region,
    visit_date: project.visitDate,
    professional_responsible: project.professionalResponsible,
    study_objective: project.studyObjective,
    report_type: project.reportType,
    applicable_regulation: project.applicableRegulation,
    general_notes: project.generalNotes,
    status: project.status,
    ...syncColumns(item),
  });

  if (error) {
    throw error;
  }
}

async function syncPoint(item: SyncQueueItem): Promise<void> {
  const point = item.payload as MeasurementPoint;
  const db = assertSupabase();
  const { error } = await db.from("measurement_points").upsert({
    id: point.id,
    project_id: point.projectId,
    code: point.code,
    latitude: point.latitude,
    longitude: point.longitude,
    photo_path: point.photoUri,
    environment_description: point.environmentDescription,
    sketch_reference: point.sketchReference,
    land_use: point.landUse,
    nearest_sensitive_receiver: point.nearestSensitiveReceiver,
    estimated_distance_to_source_m: point.estimatedDistanceToSourceM,
    notes: point.notes,
    measured_at: point.measuredAt,
    status: point.status,
    ...syncColumns(item),
  });

  if (error) {
    throw error;
  }
}

async function syncMeasurement(item: SyncQueueItem): Promise<void> {
  const measurement = item.payload as Measurement;
  const db = assertSupabase();
  const { error: measurementError } = await db.from("measurements").upsert({
    id: measurement.id,
    point_id: measurement.pointId,
    measurement_type: measurement.measurementType,
    started_at: measurement.startedAt,
    ended_at: measurement.endedAt,
    duration_minutes: measurement.durationMinutes,
    laeq: measurement.laeq,
    lmax: measurement.lmax,
    lmin: measurement.lmin,
    l10: measurement.l10,
    l50: measurement.l50,
    l90: measurement.l90,
    weighting: measurement.weighting,
    equipment_response: measurement.equipmentResponse,
    equipment_name: measurement.equipmentName,
    sound_level_meter_code: measurement.soundLevelMeterCode,
    serial_number: measurement.serialNumber,
    calibrator_name: measurement.calibratorName,
    initial_calibration: measurement.initialCalibration,
    final_calibration: measurement.finalCalibration,
    validity: measurement.validity,
    technical_notes: measurement.technicalNotes,
    ...syncColumns(item),
  });

  if (measurementError) {
    throw measurementError;
  }

  const { error: environmentalError } = await db.from("environmental_conditions").upsert({
    measurement_id: measurement.id,
    temperature_c: measurement.environmentalConditions.temperatureC,
    relative_humidity: measurement.environmentalConditions.relativeHumidity,
    wind_speed_ms: measurement.environmentalConditions.windSpeedMs,
    cloudiness: measurement.environmentalConditions.cloudiness,
    weather_state: measurement.environmentalConditions.weatherState,
    weather_notes: measurement.environmentalConditions.weatherNotes,
    external_evidence: measurement.environmentalConditions.externalEvidence,
    updated_by: item.userId,
    device_id: item.deviceId,
    sync_version: localSyncVersionOf(item) + 1,
    sync_status: "synced",
  });

  if (environmentalError) {
    throw environmentalError;
  }
}

async function syncPhoto(item: SyncQueueItem): Promise<number> {
  const photo = item.payload as PhotoRecord;
  const db = assertSupabase();
  const extension = photo.uri.toLowerCase().endsWith(".png") ? "png" : "jpg";
  const fileName = `${photo.projectId}/${photo.pointId ?? "general"}/${photo.id}.${extension}`;
  let storagePath = photo.uri;
  let byteSize = photo.byteSize ?? photo.uri.length;
  let checksum = photo.checksum ?? hashString(photo.uri);

  if (photo.uri.startsWith("file://")) {
    const response = await fetch(photo.uri);
    const blob = await response.blob();
    byteSize = blob.size;
    checksum = hashString(`${photo.uri}:${blob.size}:${blob.type}`);

    const { error: uploadError } = await db.storage.from("project-photos").upload(fileName, blob, {
      contentType: extension === "png" ? "image/png" : "image/jpeg",
      upsert: true,
    });

    if (uploadError) {
      throw uploadError;
    }

    storagePath = fileName;
  }

  const { error } = await db.from("photos").upsert({
    id: photo.id,
    project_id: photo.projectId,
    point_id: photo.pointId,
    measurement_id: photo.measurementId,
    category: photo.category,
    storage_path: storagePath,
    taken_at: photo.capturedAt,
    latitude: photo.latitude,
    longitude: photo.longitude,
    metadata: {
      checksum,
      byteSize,
      idempotencyKey: item.idempotencyKey,
    },
    ...syncColumns(item),
  });

  if (error) {
    throw error;
  }

  return byteSize;
}

async function syncReport(item: SyncQueueItem): Promise<void> {
  const report = item.payload as GeneratedReportVersion;
  const db = assertSupabase();
  const { error } = await db.from("generated_reports").upsert({
    id: report.id,
    project_id: report.projectId,
    version: report.version,
    status: report.status,
    file_type: "pdf",
    storage_path: report.storagePath,
    generated_at: report.generatedAt,
    ...syncColumns(item, { includeEntityVersion: false }),
  });

  if (error) {
    throw error;
  }
}

async function executeItem(item: SyncQueueItem): Promise<number> {
  if (item.operation === "delete" || item.operation === "restore") {
    const db = assertSupabase();
    const table = item.entity ? tableForEntity(item.entity) : null;
    if (!table) {
      throw new Error(`Entidad no soportada para ${item.operation}: ${item.entity ?? "sin entidad"}`);
    }

    const { error } = await db.from(table).update(syncColumns(item)).eq("id", item.entityId);
    if (error) {
      throw error;
    }
    return 0;
  }

  if (item.action === "upsert-client") {
    await syncClient(item);
    return JSON.stringify(item.payload).length;
  }

  if (item.action === "upsert-project") {
    await syncProject(item);
    return JSON.stringify(item.payload).length;
  }

  if (item.action === "upsert-point") {
    await syncPoint(item);
    return JSON.stringify(item.payload).length;
  }

  if (item.action === "upsert-measurement") {
    await syncMeasurement(item);
    return JSON.stringify(item.payload).length;
  }

  if (item.action === "upload-photo") {
    return syncPhoto(item);
  }

  if (item.action === "generate-report") {
    await syncReport(item);
    return JSON.stringify(item.payload).length;
  }

  return 0;
}

export async function syncFieldQueue(syncQueue: SyncQueueItem[]): Promise<SyncRunResult> {
  const activeQueue = orderQueueForSync(syncQueue);
  const untouchedQueue = syncQueue.filter((item) => !activeQueue.some((active) => active.id === item.id));
  const pendingQueue: SyncQueueItem[] = [];
  const conflicts: SyncConflictRecord[] = [];
  let successfulCount = 0;
  let failedCount = 0;
  let syncedBytes = 0;

  for (const item of activeQueue) {
    if (!canAttemptSync(item)) {
      pendingQueue.push(item);
      continue;
    }

    try {
      const conflict = await detectConflict(item);
      if (conflict) {
        conflicts.push(conflict);
        pendingQueue.push({
          ...item,
          status: "conflict",
          conflict,
          lastError: `Conflicto detectado: ${conflict.reason}`,
          updatedAt: new Date().toISOString(),
        });
        continue;
      }

      syncedBytes += await executeItem({ ...item, status: "running" });
      successfulCount += 1;
    } catch (error) {
      failedCount += 1;
      pendingQueue.push(markQueueItemAttempt(item, "failed", error instanceof Error ? error.message : "Error desconocido"));
    }
  }

  return {
    queue: [...pendingQueue, ...untouchedQueue].filter((item) => item.status !== "synced"),
    conflicts,
    successfulCount,
    failedCount,
    syncedBytes,
  };
}
