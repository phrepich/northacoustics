import {
  seedBundle,
  type Client,
  type EntitySyncMetadata,
  type GeneratedReportVersion,
  type Measurement,
  type MeasurementPoint,
  type PhotoRecord,
  type Project,
  type ProjectAggregate,
  type SeedBundle,
  type SyncConflictRecord,
  type SyncQueueItem,
  type SyncTelemetrySnapshot,
  type UserProfile,
} from "@northacoustics/shared";

export interface PersistedFieldState extends Omit<SeedBundle, "currentUser"> {
  currentUser?: UserProfile;
  lastSyncAt?: string;
  deviceId?: string;
  syncConflicts: SyncConflictRecord[];
  syncTelemetry: SyncTelemetrySnapshot;
}

export type NewClientInput = Omit<Client, "id" | "createdAt" | "updatedAt">;

export type NewProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: Project["status"];
};

export type NewPointInput = Omit<
  MeasurementPoint,
  "id" | "createdAt" | "updatedAt" | "measuredAt" | "recordedBy" | "status"
> & {
  status?: MeasurementPoint["status"];
};

export type NewMeasurementInput = Omit<Measurement, "id" | "createdAt" | "updatedAt">;

export type IdFactory = (prefix: string) => string;

export interface PointCreationResult {
  point: MeasurementPoint;
  photo: PhotoRecord | null;
}

const initialSyncTelemetry: SyncTelemetrySnapshot = {
  averageDurationMs: 0,
  pendingOperations: 0,
  successfulOperations: 0,
  failedOperations: 0,
  conflictsDetected: 0,
  conflictsResolved: 0,
  retryCount: 0,
  syncedBytes: 0,
  pendingPhotos: 0,
  localStorageBytes: 0,
};

export function buildEmptyFieldState(): PersistedFieldState {
  return {
    currentUser: undefined,
    lastSyncAt: undefined,
    deviceId: undefined,
    clients: [],
    projects: [],
    points: [],
    measurements: [],
    photos: [],
    equipment: [],
    checklistRuns: [],
    signatures: [],
    reports: [],
    syncQueue: [],
    syncConflicts: [],
    syncTelemetry: initialSyncTelemetry,
  };
}

export function buildInitialFieldState(enableDemoMode: boolean): PersistedFieldState {
  if (enableDemoMode) {
    return {
      ...seedBundle,
      currentUser: undefined,
      lastSyncAt: undefined,
      deviceId: undefined,
      syncConflicts: [],
      syncTelemetry: initialSyncTelemetry,
    };
  }

  return buildEmptyFieldState();
}

export function createSyncQueueItem(
  createId: IdFactory,
  action: SyncQueueItem["action"],
  entityId: string,
  payload: unknown,
): SyncQueueItem {
  return {
    id: createId("sync"),
    action,
    entityId,
    payload,
    createdAt: new Date().toISOString(),
  };
}

function metadata(deviceId: string, user?: UserProfile, overrides?: Partial<EntitySyncMetadata>) {
  return {
    version: overrides?.version ?? 1,
    updatedBy: overrides?.updatedBy ?? user?.id,
    deviceId,
    syncVersion: overrides?.syncVersion ?? 0,
    deletedAt: overrides?.deletedAt,
    syncStatus: overrides?.syncStatus ?? "pending",
  };
}

export function createClientRecord(createId: IdFactory, input: NewClientInput, deviceId = "unknown", user?: UserProfile): Client {
  const createdAt = new Date().toISOString();

  return {
    id: createId("cli"),
    ...input,
    createdAt,
    updatedAt: createdAt,
    sync: metadata(deviceId, user),
  };
}

export function createProjectRecord(createId: IdFactory, input: NewProjectInput, deviceId = "unknown", user?: UserProfile): Project {
  const createdAt = new Date().toISOString();

  return {
    id: createId("pro"),
    ...input,
    status: input.status ?? "pending",
    createdAt,
    updatedAt: createdAt,
    sync: metadata(deviceId, user),
  };
}

export function createPointRecord(
  createId: IdFactory,
  input: NewPointInput,
  recordedBy: string,
  deviceId = "unknown",
  user?: UserProfile,
): PointCreationResult {
  const createdAt = new Date().toISOString();
  const point: MeasurementPoint = {
    id: createId("pt"),
    ...input,
    measuredAt: createdAt,
    recordedBy,
    status: input.status ?? "pending",
    createdAt,
    updatedAt: createdAt,
    sync: metadata(deviceId, user),
  };

  const photo: PhotoRecord | null = input.photoUri
    ? {
        id: createId("pho"),
        projectId: input.projectId,
        pointId: point.id,
        category: "measurement_point",
        uri: input.photoUri,
        capturedAt: createdAt,
        capturedBy: recordedBy,
        latitude: input.latitude,
        longitude: input.longitude,
        sync: metadata(deviceId, user),
      }
    : null;

  return { point, photo };
}

export function createMeasurementRecord(
  createId: IdFactory,
  input: NewMeasurementInput,
  deviceId = "unknown",
  user?: UserProfile,
): Measurement {
  const createdAt = new Date().toISOString();

  return {
    id: createId("me"),
    ...input,
    createdAt,
    updatedAt: createdAt,
    sync: metadata(deviceId, user),
  };
}

export function createReportVersionRecord(
  createId: IdFactory,
  state: Pick<PersistedFieldState, "currentUser" | "reports">,
  projectId: string,
  deviceId = "unknown",
): GeneratedReportVersion {
  return {
    id: createId("rep"),
    projectId,
    version: state.reports.filter((item) => item.projectId === projectId).length + 1,
    status: "draft",
    storagePath: `generated-reports/${projectId}/${Date.now()}/northacoustics-report.pdf`,
    generatedAt: new Date().toISOString(),
    generatedBy: state.currentUser?.fullName ?? "Sistema",
    sync: metadata(deviceId, state.currentUser),
  };
}

export function buildProjectAggregate(state: PersistedFieldState, projectId: string): ProjectAggregate | null {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) {
    return null;
  }

  const client = state.clients.find((item) => item.id === project.clientId);
  if (!client) {
    return null;
  }

  const points = state.points.filter((point) => point.projectId === projectId);
  const pointIds = new Set(points.map((point) => point.id));
  const measurements = state.measurements.filter((measurement) => pointIds.has(measurement.pointId));

  return {
    client,
    project,
    points,
    measurements,
    photos: state.photos.filter(
      (photo) => photo.projectId === projectId || (photo.pointId ? pointIds.has(photo.pointId) : false),
    ),
    equipment: state.equipment,
    checklistRuns: state.checklistRuns.filter((item) => item.projectId === projectId),
    signatures: state.signatures.filter(
      (signature) => signature.entityId === projectId || pointIds.has(signature.entityId),
    ),
    reports: state.reports.filter((report) => report.projectId === projectId),
  };
}

export function buildDemoClient(index: number): NewClientInput {
  return {
    name: `Cliente Demo ${index}`,
    companyRut: `77.${120000 + index}-K`,
    address: `Ruta de Servicio ${index}00, Concepción`,
    contactName: `Contacto Demo ${index}`,
    contactEmail: `contacto${index}@demo.cl`,
    phone: "+56 9 5555 1212",
    notes: "Ingreso rápido desde la app móvil.",
  };
}
