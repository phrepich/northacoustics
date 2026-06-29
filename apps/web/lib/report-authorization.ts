import { createClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "./supabase-server";
import { webRuntimeConfig } from "./runtime-config";

export type AuthorizedReportRequest = {
  organizationId: string;
  userId: string;
};

function readBearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  return scheme.toLowerCase() === "bearer" && token ? token : null;
}

export async function authorizeReportRequest(request: Request): Promise<AuthorizedReportRequest | null> {
  const token = readBearerToken(request);
  const admin = createSupabaseServerClient();

  if (!token || !admin || !webRuntimeConfig.supabaseAnonKey) {
    return null;
  }

  const authClient = createClient(webRuntimeConfig.supabaseUrl, webRuntimeConfig.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  const [membershipResult, userResult] = await Promise.all([
    admin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userData.user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
    admin.from("users").select("roles(code)").eq("id", userData.user.id).maybeSingle(),
  ]);

  const roleCode = (userResult.data?.roles as { code?: string } | null)?.code;
  const organizationId = membershipResult.data?.organization_id;

  if (
    membershipResult.error ||
    userResult.error ||
    !organizationId ||
    (roleCode !== "reviewer" && roleCode !== "supervisor")
  ) {
    return null;
  }

  return {
    organizationId,
    userId: userData.user.id,
  };
}
