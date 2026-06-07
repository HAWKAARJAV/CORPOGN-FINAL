import { supabaseAdmin } from "@/lib/supabase-admin";

async function getCaller(request: Request) {
  const token = (request.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

/**
 * PATCH /api/ngo/profile
 * Updates ngo_name and/or ngo_email for the authenticated NGO owner.
 * Only account_type="ngo" (super_admin) can call this.
 */
export async function PATCH(request: Request) {
  const user = await getCaller(request);
  if (!user) return Response.json({ error: "Unauthorized." }, { status: 401 });

  if (user.user_metadata?.account_type !== "ngo") {
    return Response.json(
      { error: "Only the NGO account owner can update the profile." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    ngo_name?: string;
    ngo_email?: string;
  };

  const updates: Record<string, string> = {};
  if (typeof body.ngo_name === "string" && body.ngo_name.trim()) {
    updates.ngo_name = body.ngo_name.trim();
  }
  if (typeof body.ngo_email === "string" && body.ngo_email.trim()) {
    updates.ngo_email = body.ngo_email.trim().toLowerCase();
  }

  if (!Object.keys(updates).length) {
    return Response.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("ngos")
    .update(updates)
    .eq("auth_user_id", user.id)
    .select("id, ngo_name, ngo_email, access_status, has_project, trust_score, slug")
    .single();

  if (error || !data) {
    return Response.json({ error: error?.message || "Update failed." }, { status: 500 });
  }

  return Response.json({ ngo: data });
}
