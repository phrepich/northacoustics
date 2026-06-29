const truthy = new Set(["1", "true", "yes", "on"]);

export const webRuntimeConfig = {
  enableDemoMode: truthy.has((process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE ?? "").toLowerCase()),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  contactWebhookUrl: process.env.CONTACT_SUBMISSIONS_WEBHOOK_URL ?? "",
};

export const isSupabaseAdminConfigured =
  Boolean(webRuntimeConfig.supabaseUrl) && Boolean(webRuntimeConfig.supabaseServiceRoleKey);
