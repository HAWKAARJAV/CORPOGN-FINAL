import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const token = authorization.replace("Bearer ", "").trim();
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Fetch opportunities and join with parent corporate info
  const { data: opportunities, error } = await supabaseAdmin
    .from("opportunities")
    .select(`
      id,
      corporate_id,
      title,
      description,
      focus_area,
      budget,
      state,
      district,
      sdg_targets,
      target_beneficiaries,
      expected_start_date,
      duration_months,
      min_trust_score,
      status,
      created_at,
      corporates (
        company_name
      )
    `)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[opportunities API] Error fetching open opportunities:", error.message);
    return Response.json({ opportunities: [] });
  }

  const formatted = (opportunities ?? []).map((opp: any) => ({
    id: opp.id,
    corporate_id: opp.corporate_id,
    title: opp.title,
    description: opp.description ?? "",
    focus_area: opp.focus_area,
    budget: Number(opp.budget),
    state: opp.state ?? "Pan India",
    district: opp.district ?? "",
    sdg_targets: opp.sdg_targets ?? [],
    target_beneficiaries: opp.target_beneficiaries ?? [],
    expected_start_date: opp.expected_start_date ?? null,
    duration_months: opp.duration_months ?? null,
    min_trust_score: opp.min_trust_score ?? 0,
    status: opp.status,
    created_at: opp.created_at,
    corporate_name: opp.corporates?.company_name ?? "Partner Corporate",
  }));

  return Response.json({ opportunities: formatted });
}
