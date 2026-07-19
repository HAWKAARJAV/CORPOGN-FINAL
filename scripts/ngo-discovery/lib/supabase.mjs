import { createClient } from "@supabase/supabase-js";
import { requireSupabaseEnv, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "./env.mjs";

requireSupabaseEnv();

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function logStep(runId, step, message, opts = {}) {
  const { entityType = null, entityRef = null, metadata = {}, severity = "info" } = opts;

  try {
    await supabase.from("research_logs").insert({
      run_id: runId,
      step,
      entity_type: entityType,
      entity_ref: entityRef,
      message,
      metadata,
      severity,
    });
  } catch {
    // Logging must not block enrichment.
  }
}
