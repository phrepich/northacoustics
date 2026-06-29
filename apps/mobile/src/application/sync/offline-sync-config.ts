import type { ConflictResolutionPolicy, SyncEntity, SyncOperation } from "@northacoustics/shared";

export interface OfflineSyncConfig {
  defaultConflictPolicy: ConflictResolutionPolicy;
  maxAttempts: number;
  baseBackoffMs: number;
  maxBackoffMs: number;
  autoSyncIntervalMs: number;
  photoCompressionQuality: number;
  operationPriorities: Record<SyncOperation, number>;
  entityPriorities: Partial<Record<SyncEntity, number>>;
}

export const offlineSyncConfig: OfflineSyncConfig = {
  defaultConflictPolicy: "manual",
  maxAttempts: 8,
  baseBackoffMs: 1_000,
  maxBackoffMs: 15 * 60_000,
  autoSyncIntervalMs: 60_000,
  photoCompressionQuality: 0.75,
  operationPriorities: {
    insert: 80,
    update: 70,
    restore: 65,
    delete: 60,
    "upload-photo": 50,
    "upload-file": 45,
    "generate-report": 30,
  },
  entityPriorities: {
    measurement: 20,
    "measurement-point": 18,
    photo: 12,
    file: 10,
  },
};
