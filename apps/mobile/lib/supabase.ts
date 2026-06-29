import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, mobileRuntimeConfig } from "./runtime-config";

export const supabase = isSupabaseConfigured
  ? createClient(mobileRuntimeConfig.supabaseUrl, mobileRuntimeConfig.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
        storage: AsyncStorage,
      },
    })
  : null;
