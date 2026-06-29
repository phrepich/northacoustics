const truthy = new Set(["1", "true", "yes", "on"]);

export const mobileRuntimeConfig = {
  enableDemoMode: truthy.has((process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE ?? "").toLowerCase()),
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export const isSupabaseConfigured =
  Boolean(mobileRuntimeConfig.supabaseUrl) && Boolean(mobileRuntimeConfig.supabaseAnonKey);

