import { supabaseAdmin } from "@/lib/supabase-admin";

async function getCaller(request: Request) {
  const token = (request.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

/**
 * GET /api/opportunities
 * Returns all open CSR opportunities — for NGO dashboard Opportunities/Proposals section.
 * Any authenticated NGO (or corporate) can call this.
 */
export async function GET(request: Request) {
  const user = await getCaller(request);
  if (!user) return Response.json({ error: "Unauthorized." }, { status: 401 });

  // Select open opportunities, falling back to all opportunities if 'status' column is not yet present
  let query = supabaseAdmin
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  // Try checking status if schema includes it
  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Filter open opportunities in application layer if status column exists, or return all if status is not defined
  const filtered = (data ?? []).filter((opp: any) => opp.status === undefined || opp.status === "open");

  return Response.json({ opportunities: filtered });
}
