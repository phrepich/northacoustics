import { buildEmptyFieldState, buildInitialFieldState } from "../src/domain/field/field-state";
import { fetchRemoteFieldState, getCurrentUserProfile } from "../src/infrastructure/supabase/field-remote-repository";
import { mobileRuntimeConfig } from "./runtime-config";

export const isDemoMode = mobileRuntimeConfig.enableDemoMode;

export function buildEmptyState() {
  return buildEmptyFieldState();
}

export function buildInitialState() {
  return buildInitialFieldState(isDemoMode);
}

export { fetchRemoteFieldState as fetchRemoteState, getCurrentUserProfile };
