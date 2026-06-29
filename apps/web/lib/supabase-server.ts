import { createClient } from "@supabase/supabase-js";

import { isSupabaseAdminConfigured, webRuntimeConfig } from "./runtime-config";

export function createSupabaseServerClient() {
  if (!isSupabaseAdminConfigured) {
    return null;
  }

  return createClient(webRuntimeConfig.supabaseUrl, webRuntimeConfig.supabaseServiceRoleKey);
}
