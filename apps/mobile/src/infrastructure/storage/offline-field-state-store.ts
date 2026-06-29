import AsyncStorage from "@react-native-async-storage/async-storage";

import { createId } from "../../../lib/ids";
import { estimateStorageBytes, initialSyncTelemetry, normalizeQueueItem } from "../../application/sync/offline-sync-engine";
import type { PersistedFieldState } from "../../domain/field/field-state";

const STORAGE_KEY = "northacoustics-field-state";
const DEVICE_ID_KEY = "northacoustics-device-id";

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const next = createId("device");
  await AsyncStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

export function normalizePersistedFieldState(state: PersistedFieldState, deviceId: string): PersistedFieldState {
  const syncQueue = (state.syncQueue ?? []).map((item) => normalizeQueueItem(item, deviceId, state.currentUser));
  const nextState: PersistedFieldState = {
    ...state,
    deviceId,
    syncQueue,
    syncConflicts: state.syncConflicts ?? [],
    syncTelemetry: {
      ...initialSyncTelemetry,
      ...(state.syncTelemetry ?? {}),
      pendingOperations: syncQueue.filter((item) => item.status !== "synced").length,
      pendingPhotos: syncQueue.filter((item) => item.entity === "photo" || item.action === "upload-photo").length,
    },
  };

  return {
    ...nextState,
    syncTelemetry: {
      ...nextState.syncTelemetry,
      localStorageBytes: estimateStorageBytes(nextState),
    },
  };
}

export async function loadPersistedFieldState(): Promise<PersistedFieldState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  const deviceId = await getOrCreateDeviceId();
  return normalizePersistedFieldState(JSON.parse(raw) as PersistedFieldState, deviceId);
}

export async function savePersistedFieldState(state: PersistedFieldState): Promise<void> {
  const deviceId = state.deviceId ?? (await getOrCreateDeviceId());
  const normalized = normalizePersistedFieldState(state, deviceId);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}
