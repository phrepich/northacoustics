import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  buildReportPayload,
  seedBundle,
  type GeneratedReportVersion,
  type Measurement,
  type MeasurementPoint,
  type Project,
  type ProjectAggregate,
} from "@northacoustics/shared";

import { loginWithFieldCredentials, buildDemoLoginState, loadActiveSessionState, logoutFieldSession, refreshAuthenticatedState } from "../src/application/auth/field-session-service";
import { capturePointPhoto, requestCurrentCoordinates as requestDeviceCoordinates } from "../src/application/device/field-device-service";
import {
  createEnterpriseQueueItem,
  estimateStorageBytes,
  updateTelemetryAfterRun,
} from "../src/application/sync/offline-sync-engine";
import { syncFieldQueue } from "../src/application/sync/field-sync-service";
import {
  buildDemoClient,
  buildInitialFieldState,
  buildProjectAggregate,
  createClientRecord,
  createMeasurementRecord,
  createPointRecord,
  createProjectRecord,
  createReportVersionRecord,
  type NewClientInput,
  type NewMeasurementInput,
  type NewPointInput,
  type NewProjectInput,
  type PersistedFieldState,
} from "../src/domain/field/field-state";
import {
  getOrCreateDeviceId,
  loadPersistedFieldState,
  savePersistedFieldState,
} from "../src/infrastructure/storage/offline-field-state-store";
import { createId } from "../lib/ids";
import { isSupabaseConfigured, mobileRuntimeConfig } from "../lib/runtime-config";
import { supabase } from "../src/infrastructure/supabase/mobile-supabase-client";

interface FieldContextValue extends PersistedFieldState {
  isBooting: boolean;
  isDemoMode: boolean;
  isSupabaseConfigured: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  createClient: (input: NewClientInput) => void;
  createProject: (input: NewProjectInput) => void;
  createPoint: (input: NewPointInput) => void;
  createMeasurement: (input: NewMeasurementInput) => void;
  createReportVersion: (projectId: string) => GeneratedReportVersion;
  refreshFromServer: () => Promise<void>;
  getProjectsByClient: (clientId: string) => Project[];
  getProjectAggregate: (projectId: string) => ProjectAggregate | null;
  getPointsByProject: (projectId: string) => MeasurementPoint[];
  getMeasurementsByPoint: (pointId: string) => Measurement[];
  requestCurrentCoordinates: () => Promise<{ latitude: number; longitude: number }>;
  capturePhoto: () => Promise<string | null>;
  runSync: () => Promise<void>;
}

const isDemoMode = mobileRuntimeConfig.enableDemoMode;
const FieldDataContext = createContext<FieldContextValue | null>(null);

export function FieldDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedFieldState>(() => buildInitialFieldState(isDemoMode));
  const [isBooting, setIsBooting] = useState(true);

  const refreshFromServer = async () => {
    if (!supabase) {
      if (isDemoMode) {
        setState((current) => ({
          ...current,
          ...seedBundle,
          currentUser: current.currentUser,
        }));
        return;
      }

      throw new Error("Supabase no está configurado. Completa las variables de entorno.");
    }

    const { currentUser, remoteState } = await refreshAuthenticatedState();

    setState((current) => ({
      ...current,
      ...remoteState,
      currentUser,
    }));
  };

  useEffect(() => {
    void (async () => {
      const persisted = await loadPersistedFieldState();
      const deviceId = persisted?.deviceId ?? (await getOrCreateDeviceId());
      setState(persisted ?? { ...buildInitialFieldState(isDemoMode), deviceId });

      if (supabase) {
        try {
          const sessionState = await loadActiveSessionState();
          if (sessionState) {
            setState((current) => ({
              ...current,
              ...sessionState.remoteState,
              deviceId,
              syncQueue: persisted?.syncQueue ?? current.syncQueue,
              lastSyncAt: persisted?.lastSyncAt ?? current.lastSyncAt,
              currentUser: sessionState.currentUser,
            }));
          }
        } catch {
          setState((current) => ({
            ...current,
            currentUser: undefined,
          }));
        }
      }

      setIsBooting(false);
    })();
  }, []);

  useEffect(() => {
    if (isBooting) {
      return;
    }

    void savePersistedFieldState(state);
  }, [isBooting, state]);

  const createClient = (input: NewClientInput) => {
    const deviceId = state.deviceId ?? "unknown";
    const client = createClientRecord(createId, input, deviceId, state.currentUser);

    setState((current) => ({
      ...current,
      clients: [client, ...current.clients],
      syncQueue: [
        ...current.syncQueue,
        createEnterpriseQueueItem({
          action: "upsert-client",
          entityId: client.id,
          payload: client,
          deviceId,
          user: current.currentUser,
        }),
      ],
    }));
  };

  const createProject = (input: NewProjectInput) => {
    const deviceId = state.deviceId ?? "unknown";
    const project = createProjectRecord(createId, input, deviceId, state.currentUser);

    setState((current) => ({
      ...current,
      projects: [project, ...current.projects],
      syncQueue: [
        ...current.syncQueue,
        createEnterpriseQueueItem({
          action: "upsert-project",
          entityId: project.id,
          payload: project,
          deviceId,
          user: current.currentUser,
        }),
      ],
    }));
  };

  const createPoint = (input: NewPointInput) => {
    const deviceId = state.deviceId ?? "unknown";
    const recordedBy = state.currentUser?.fullName ?? "Técnico";
    const { point, photo } = createPointRecord(createId, input, recordedBy, deviceId, state.currentUser);

    setState((current) => ({
      ...current,
      points: [point, ...current.points],
      photos: photo ? [photo, ...current.photos] : current.photos,
      syncQueue: [
        ...current.syncQueue,
        createEnterpriseQueueItem({
          action: "upsert-point",
          entityId: point.id,
          payload: point,
          deviceId,
          user: current.currentUser,
        }),
        ...(photo
          ? [
              createEnterpriseQueueItem({
                action: "upload-photo",
                entityId: photo.id,
                payload: photo,
                deviceId,
                user: current.currentUser,
              }),
            ]
          : []),
      ],
    }));
  };

  const createMeasurement = (input: NewMeasurementInput) => {
    const deviceId = state.deviceId ?? "unknown";
    const measurement = createMeasurementRecord(createId, input, deviceId, state.currentUser);

    setState((current) => ({
      ...current,
      measurements: [measurement, ...current.measurements],
      syncQueue: [
        ...current.syncQueue,
        createEnterpriseQueueItem({
          action: "upsert-measurement",
          entityId: measurement.id,
          payload: measurement,
          deviceId,
          user: current.currentUser,
        }),
      ],
    }));
  };

  const createReportVersion = (projectId: string) => {
    const deviceId = state.deviceId ?? "unknown";
    const report = createReportVersionRecord(createId, state, projectId, deviceId);

    setState((current) => ({
      ...current,
      reports: [report, ...current.reports],
      syncQueue: [
        ...current.syncQueue,
        createEnterpriseQueueItem({
          action: "generate-report",
          entityId: report.id,
          payload: report,
          deviceId,
          user: current.currentUser,
        }),
      ],
    }));

    return report;
  };

  const login = async (email: string, password: string) => {
    if (!supabase) {
      if (isDemoMode) {
        setState((current) => ({
          ...current,
          ...buildDemoLoginState(email),
          deviceId: current.deviceId,
          syncConflicts: current.syncConflicts,
          syncTelemetry: current.syncTelemetry,
        }));
        return;
      }

      throw new Error("Supabase no está configurado. Completa las variables de entorno.");
    }

    const { currentUser, remoteState } = await loginWithFieldCredentials(email, password);

    setState((current) => ({
      ...current,
      ...remoteState,
      currentUser,
    }));
  };

  const logout = async () => {
    const nextState = await logoutFieldSession(isDemoMode);

    setState((current) => ({
      ...nextState,
      deviceId: current.deviceId,
      syncQueue: current.syncQueue,
      syncConflicts: current.syncConflicts,
      syncTelemetry: current.syncTelemetry,
      lastSyncAt: current.lastSyncAt,
    }));
  };

  const runSync = async () => {
    if (!supabase) {
      if (isDemoMode) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setState((current) => ({
          ...current,
          syncQueue: [],
          lastSyncAt: new Date().toISOString(),
        }));
        return;
      }

      throw new Error("Supabase no está configurado. Completa las variables de entorno.");
    }

    const startedAt = Date.now();
    const result = await syncFieldQueue(state.syncQueue);
    const finishedAt = Date.now();

    await refreshFromServer();
    setState((current) => ({
      ...current,
      syncQueue: result.queue,
      syncConflicts: [...current.syncConflicts, ...result.conflicts],
      syncTelemetry: updateTelemetryAfterRun({
        previous: current.syncTelemetry,
        startedAt,
        finishedAt,
        pendingQueue: result.queue,
        successfulCount: result.successfulCount,
        failedCount: result.failedCount,
        conflicts: [...current.syncConflicts, ...result.conflicts],
        syncedBytes: result.syncedBytes,
        localStorageBytes: estimateStorageBytes(current),
      }),
      lastSyncAt: new Date().toISOString(),
    }));
  };

  useEffect(() => {
    if (isBooting || !supabase || state.syncQueue.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      void runSync().catch(() => undefined);
    }, 60_000);

    return () => clearInterval(timer);
  }, [isBooting, state.syncQueue.length]);

  const value = useMemo<FieldContextValue>(
    () => ({
      ...state,
      isBooting,
      isDemoMode,
      isSupabaseConfigured,
      login,
      logout,
      createClient,
      createProject,
      createPoint,
      createMeasurement,
      createReportVersion,
      refreshFromServer,
      getProjectsByClient: (clientId) => state.projects.filter((project) => project.clientId === clientId),
      getProjectAggregate: (projectId) => buildProjectAggregate(state, projectId),
      getPointsByProject: (projectId) => state.points.filter((point) => point.projectId === projectId),
      getMeasurementsByPoint: (pointId) => state.measurements.filter((measurement) => measurement.pointId === pointId),
      requestCurrentCoordinates: () => requestDeviceCoordinates(isDemoMode),
      capturePhoto: capturePointPhoto,
      runSync,
    }),
    [isBooting, state],
  );

  return <FieldDataContext.Provider value={value}>{children}</FieldDataContext.Provider>;
}

export function useFieldData() {
  const context = useContext(FieldDataContext);

  if (!context) {
    throw new Error("useFieldData must be used within FieldDataProvider");
  }

  return context;
}

export function useProjectReportPreview(projectId: string) {
  const { getProjectAggregate } = useFieldData();
  const aggregate = getProjectAggregate(projectId);

  if (!aggregate) {
    return null;
  }

  return buildReportPayload(aggregate);
}

export { buildDemoClient };
