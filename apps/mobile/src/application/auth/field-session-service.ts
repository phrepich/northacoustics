import { seedBundle, type UserProfile } from "@northacoustics/shared";

import {
  buildEmptyFieldState,
  buildInitialFieldState,
  type PersistedFieldState,
} from "../../domain/field/field-state";
import {
  fetchRemoteFieldState,
  getActiveSupabaseUser,
  getCurrentUserProfile,
  signInWithPassword,
  signOut,
} from "../../infrastructure/supabase/field-remote-repository";

export async function loadActiveSessionState(): Promise<{
  currentUser: UserProfile;
  remoteState: Omit<PersistedFieldState, "currentUser" | "lastSyncAt" | "syncQueue" | "syncConflicts" | "syncTelemetry" | "deviceId">;
} | null> {
  const activeUser = await getActiveSupabaseUser();
  if (!activeUser) {
    return null;
  }

  const currentUser = await getCurrentUserProfile(activeUser);
  const remoteState = await fetchRemoteFieldState(currentUser);

  return { currentUser, remoteState };
}

export async function refreshAuthenticatedState(): Promise<{
  currentUser: UserProfile;
  remoteState: Omit<PersistedFieldState, "currentUser" | "lastSyncAt" | "syncQueue" | "syncConflicts" | "syncTelemetry" | "deviceId">;
}> {
  const activeUser = await getActiveSupabaseUser();
  if (!activeUser) {
    throw new Error("No hay sesión activa.");
  }

  const currentUser = await getCurrentUserProfile(activeUser);
  const remoteState = await fetchRemoteFieldState(currentUser);

  return { currentUser, remoteState };
}

export async function loginWithFieldCredentials(
  email: string,
  password: string,
): Promise<{
  currentUser: UserProfile;
  remoteState: Omit<PersistedFieldState, "currentUser" | "lastSyncAt" | "syncQueue" | "syncConflicts" | "syncTelemetry" | "deviceId">;
}> {
  const activeUser = await signInWithPassword(email, password);
  const currentUser = await getCurrentUserProfile(activeUser);
  const remoteState = await fetchRemoteFieldState(currentUser);

  return { currentUser, remoteState };
}

export function buildDemoLoginState(email: string): Pick<PersistedFieldState, "currentUser"> &
  Omit<PersistedFieldState, "lastSyncAt"> {
  return {
    ...seedBundle,
    currentUser: {
      id: seedBundle.currentUser.id,
      fullName: seedBundle.currentUser.fullName,
      email,
      role: "technician",
    },
    deviceId: undefined,
    syncConflicts: [],
    syncTelemetry: {
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
    },
  };
}

export async function logoutFieldSession(enableDemoMode: boolean): Promise<PersistedFieldState> {
  await signOut();

  return enableDemoMode ? buildInitialFieldState(true) : buildEmptyFieldState();
}
