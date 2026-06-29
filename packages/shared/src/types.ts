export type RoleCode = "technician" | "reviewer" | "supervisor";

export type ProjectStatus = "pending" | "measured" | "reviewed" | "approved";

export type MeasurementValidity = "valid" | "invalid";

export type PhotoCategory =
  | "measurement_point"
  | "emission_source"
  | "surroundings"
  | "installed_equipment"
  | "complementary_evidence";

export type SyncAction =
  | "upsert-client"
  | "upsert-project"
  | "upsert-point"
  | "upsert-measurement"
  | "upload-photo"
  | "generate-report";

export type SyncOperation = "insert" | "update" | "delete" | "restore" | "upload-photo" | "upload-file" | "generate-report";

export type SyncEntity =
  | "client"
  | "project"
  | "measurement-point"
  | "measurement"
  | "environmental-condition"
  | "photo"
  | "file"
  | "report";

export type SyncStatus = "pending" | "running" | "synced" | "failed" | "conflict" | "cancelled";

export type ConflictResolutionPolicy = "server-wins" | "client-wins" | "latest-version" | "manual";

export interface EntitySyncMetadata {
  version: number;
  updatedBy?: string;
  deviceId: string;
  syncVersion: number;
  deletedAt?: string;
  syncStatus: SyncStatus;
}

export interface SyncConflictRecord {
  id: string;
  entity: SyncEntity;
  entityId: string;
  detectedAt: string;
  localVersion: number;
  remoteVersion?: number;
  reason:
    | "simultaneous-edit"
    | "remote-deleted"
    | "local-deleted"
    | "incompatible-change"
    | "photo-conflict"
    | "file-conflict";
  policy: ConflictResolutionPolicy;
  resolvedAt?: string;
  resolution?: "server" | "client" | "latest" | "manual-required";
  decisionBy?: string;
}

export interface SyncTelemetrySnapshot {
  lastStartedAt?: string;
  lastFinishedAt?: string;
  averageDurationMs: number;
  pendingOperations: number;
  successfulOperations: number;
  failedOperations: number;
  conflictsDetected: number;
  conflictsResolved: number;
  retryCount: number;
  syncedBytes: number;
  pendingPhotos: number;
  localStorageBytes: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: RoleCode;
  phone?: string;
}

export interface Client {
  id: string;
  name: string;
  companyRut: string;
  address: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  sync?: EntitySyncMetadata;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  internalCode: string;
  siteAddress: string;
  district: string;
  region: string;
  visitDate: string;
  professionalResponsible: string;
  studyObjective: string;
  reportType: string;
  applicableRegulation: string;
  generalNotes?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  sync?: EntitySyncMetadata;
}

export interface MeasurementPoint {
  id: string;
  projectId: string;
  code: string;
  latitude: number;
  longitude: number;
  photoUri?: string;
  environmentDescription: string;
  sketchReference: string;
  landUse: string;
  nearestSensitiveReceiver: string;
  estimatedDistanceToSourceM: number;
  notes?: string;
  measuredAt: string;
  recordedBy: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  sync?: EntitySyncMetadata;
}

export interface EnvironmentalCondition {
  temperatureC: number;
  relativeHumidity: number;
  windSpeedMs: number;
  cloudiness: string;
  weatherState: string;
  weatherNotes?: string;
  externalEvidence?: string;
}

export interface Measurement {
  id: string;
  pointId: string;
  measurementType: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  laeq: number;
  lmax: number;
  lmin: number;
  l10?: number;
  l50?: number;
  l90?: number;
  weighting: string;
  equipmentResponse: string;
  equipmentName: string;
  soundLevelMeterCode: string;
  serialNumber: string;
  calibratorName: string;
  initialCalibration: number;
  finalCalibration: number;
  validity: MeasurementValidity;
  technicalNotes?: string;
  environmentalConditions: EnvironmentalCondition;
  createdAt: string;
  updatedAt: string;
  sync?: EntitySyncMetadata;
}

export interface PhotoRecord {
  id: string;
  projectId: string;
  pointId?: string;
  measurementId?: string;
  category: PhotoCategory;
  uri: string;
  capturedAt: string;
  capturedBy: string;
  latitude?: number;
  longitude?: number;
  checksum?: string;
  byteSize?: number;
  sync?: EntitySyncMetadata;
}

export interface Equipment {
  id: string;
  type: "sound_level_meter" | "calibrator" | "microphone" | "tripod" | "accessory";
  brand: string;
  model: string;
  serialNumber: string;
  calibrationCertificateUrl?: string;
  calibrationDueDate?: string;
  attachmentUrl?: string;
  sync?: EntitySyncMetadata;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface ChecklistRun {
  id: string;
  projectId: string;
  pointId?: string;
  measurementId?: string;
  technicianId: string;
  items: ChecklistItem[];
  technicianConfirmation: string;
  createdAt: string;
  sync?: EntitySyncMetadata;
}

export interface SignatureRecord {
  id: string;
  entityType: "project" | "point" | "measurement" | "report";
  entityId: string;
  signedBy: string;
  role: RoleCode;
  signedAt: string;
  signatureLabel: string;
}

export interface GeneratedReportVersion {
  id: string;
  projectId: string;
  version: number;
  status: "draft" | "generated" | "approved";
  storagePath?: string;
  generatedAt: string;
  generatedBy: string;
  sync?: EntitySyncMetadata;
}

export interface SyncQueueItem {
  id: string;
  action: SyncAction;
  operation?: SyncOperation;
  entity?: SyncEntity;
  entityId: string;
  payload: unknown;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
  deviceId?: string;
  priority?: number;
  attempts?: number;
  maxAttempts?: number;
  lastError?: string;
  lastAttemptAt?: string;
  nextAttemptAt?: string;
  status?: SyncStatus;
  idempotencyKey?: string;
  conflict?: SyncConflictRecord;
}

export interface ProjectAggregate {
  client: Client;
  project: Project;
  points: MeasurementPoint[];
  measurements: Measurement[];
  photos: PhotoRecord[];
  equipment: Equipment[];
  checklistRuns: ChecklistRun[];
  signatures: SignatureRecord[];
  reports: GeneratedReportVersion[];
}

export interface SeedBundle {
  currentUser: UserProfile;
  clients: Client[];
  projects: Project[];
  points: MeasurementPoint[];
  measurements: Measurement[];
  photos: PhotoRecord[];
  equipment: Equipment[];
  checklistRuns: ChecklistRun[];
  signatures: SignatureRecord[];
  reports: GeneratedReportVersion[];
  syncQueue: SyncQueueItem[];
  syncConflicts?: SyncConflictRecord[];
  syncTelemetry?: SyncTelemetrySnapshot;
}

export interface ReportPayload {
  title: string;
  executiveSummary: string;
  aggregate: ProjectAggregate;
}
