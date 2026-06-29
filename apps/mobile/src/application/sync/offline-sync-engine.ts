import type {
  ConflictResolutionPolicy,
  EntitySyncMetadata,
  SyncAction,
  SyncConflictRecord,
  SyncEntity,
  SyncOperation,
  SyncQueueItem,
  SyncStatus,
  SyncTelemetrySnapshot,
  UserProfile,
} from "@northacoustics/shared";

import { createId } from "../../../lib/ids";
import { offlineSyncConfig } from "./offline-sync-config";

export const initialSyncTelemetry: SyncTelemetrySnapshot = {
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

export function resolveSyncAction(action: SyncAction): { entity: SyncEntity; operation: SyncOperation } {
  switch (action) {
    case "upsert-client":
      return { entity: "client", operation: "insert" };
    case "upsert-project":
      return { entity: "project", operation: "insert" };
    case "upsert-point":
      return { entity: "measurement-point", operation: "insert" };
    case "upsert-measurement":
      return { entity: "measurement", operation: "insert" };
    case "upload-photo":
      return { entity: "photo", operation: "upload-photo" };
    case "generate-report":
      return { entity: "report", operation: "generate-report" };
  }
}

export function createEntitySyncMetadata(
  deviceId: string,
  user?: UserProfile,
  overrides?: Partial<EntitySyncMetadata>,
): EntitySyncMetadata {
  return {
    version: overrides?.version ?? 1,
    updatedBy: overrides?.updatedBy ?? user?.id,
    deviceId,
    syncVersion: overrides?.syncVersion ?? 0,
    deletedAt: overrides?.deletedAt,
    syncStatus: overrides?.syncStatus ?? "pending",
  };
}

export function createEnterpriseQueueItem(input: {
  action: SyncAction;
  entityId: string;
  payload: unknown;
  deviceId: string;
  user?: UserProfile;
  operation?: SyncOperation;
  entity?: SyncEntity;
  priority?: number;
}): SyncQueueItem {
  const resolved = resolveSyncAction(input.action);
  const operation = input.operation ?? resolved.operation;
  const entity = input.entity ?? resolved.entity;
  const createdAt = new Date().toISOString();
  const priority =
    input.priority ??
    offlineSyncConfig.operationPriorities[operation] + (offlineSyncConfig.entityPriorities[entity] ?? 0);

  return {
    id: createId("sync"),
    action: input.action,
    operation,
    entity,
    entityId: input.entityId,
    payload: input.payload,
    createdAt,
    updatedAt: createdAt,
    userId: input.user?.id,
    deviceId: input.deviceId,
    priority,
    attempts: 0,
    maxAttempts: offlineSyncConfig.maxAttempts,
    status: "pending",
    idempotencyKey: `${entity}:${operation}:${input.entityId}`,
  };
}

export function normalizeQueueItem(item: SyncQueueItem, deviceId: string, user?: UserProfile): SyncQueueItem {
  const resolved = resolveSyncAction(item.action);
  const operation = item.operation ?? resolved.operation;
  const entity = item.entity ?? resolved.entity;

  return {
    ...item,
    operation,
    entity,
    updatedAt: item.updatedAt ?? item.createdAt,
    userId: item.userId ?? user?.id,
    deviceId: item.deviceId ?? deviceId,
    priority:
      item.priority ?? offlineSyncConfig.operationPriorities[operation] + (offlineSyncConfig.entityPriorities[entity] ?? 0),
    attempts: item.attempts ?? 0,
    maxAttempts: item.maxAttempts ?? offlineSyncConfig.maxAttempts,
    status: item.status ?? "pending",
    idempotencyKey: item.idempotencyKey ?? `${entity}:${operation}:${item.entityId}`,
  };
}

export function calculateBackoffMs(attempts: number): number {
  const next = offlineSyncConfig.baseBackoffMs * 2 ** Math.max(0, attempts - 1);
  return Math.min(next, offlineSyncConfig.maxBackoffMs);
}

export function canAttemptSync(item: SyncQueueItem, now = new Date()): boolean {
  if (item.status === "conflict" || item.status === "cancelled" || item.status === "running") {
    return false;
  }

  if (!item.nextAttemptAt) {
    return true;
  }

  return new Date(item.nextAttemptAt).getTime() <= now.getTime();
}

export function orderQueueForSync(items: SyncQueueItem[]): SyncQueueItem[] {
  return [...items]
    .filter((item) => item.status !== "synced")
    .sort((left, right) => {
      const priorityDelta = (right.priority ?? 0) - (left.priority ?? 0);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    });
}

export function markQueueItemAttempt(item: SyncQueueItem, status: SyncStatus, error?: string): SyncQueueItem {
  const attempts = (item.attempts ?? 0) + (status === "failed" ? 1 : 0);
  const now = new Date();

  return {
    ...item,
    attempts,
    status,
    lastError: error,
    lastAttemptAt: now.toISOString(),
    nextAttemptAt: status === "failed" ? new Date(now.getTime() + calculateBackoffMs(attempts)).toISOString() : undefined,
    updatedAt: now.toISOString(),
  };
}

export function createSyncConflict(input: {
  entity: SyncEntity;
  entityId: string;
  localVersion: number;
  remoteVersion?: number;
  reason: SyncConflictRecord["reason"];
  policy?: ConflictResolutionPolicy;
  decisionBy?: string;
}): SyncConflictRecord {
  return {
    id: createId("conflict"),
    entity: input.entity,
    entityId: input.entityId,
    detectedAt: new Date().toISOString(),
    localVersion: input.localVersion,
    remoteVersion: input.remoteVersion,
    reason: input.reason,
    policy: input.policy ?? offlineSyncConfig.defaultConflictPolicy,
    resolution: input.policy === "client-wins" ? "client" : input.policy === "server-wins" ? "server" : undefined,
    resolvedAt: input.policy === "client-wins" || input.policy === "server-wins" ? new Date().toISOString() : undefined,
    decisionBy: input.decisionBy,
  };
}

export function hashString(input: string): string {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function estimateStorageBytes(value: unknown): number {
  return JSON.stringify(value).length;
}

export function updateTelemetryAfterRun(input: {
  previous?: SyncTelemetrySnapshot;
  startedAt: number;
  finishedAt: number;
  pendingQueue: SyncQueueItem[];
  successfulCount: number;
  failedCount: number;
  conflicts: SyncConflictRecord[];
  syncedBytes: number;
  localStorageBytes: number;
}): SyncTelemetrySnapshot {
  const previous = input.previous ?? initialSyncTelemetry;
  const duration = input.finishedAt - input.startedAt;
  const completedRuns = previous.lastFinishedAt ? 2 : 1;

  return {
    lastStartedAt: new Date(input.startedAt).toISOString(),
    lastFinishedAt: new Date(input.finishedAt).toISOString(),
    averageDurationMs:
      completedRuns === 1 ? duration : Math.round((previous.averageDurationMs + duration) / completedRuns),
    pendingOperations: input.pendingQueue.filter((item) => item.status !== "synced").length,
    successfulOperations: previous.successfulOperations + input.successfulCount,
    failedOperations: previous.failedOperations + input.failedCount,
    conflictsDetected: input.conflicts.length,
    conflictsResolved: input.conflicts.filter((item) => Boolean(item.resolvedAt)).length,
    retryCount: previous.retryCount + input.pendingQueue.reduce((total, item) => total + (item.attempts ?? 0), 0),
    syncedBytes: previous.syncedBytes + input.syncedBytes,
    pendingPhotos: input.pendingQueue.filter((item) => item.entity === "photo" || item.action === "upload-photo").length,
    localStorageBytes: input.localStorageBytes,
  };
}
