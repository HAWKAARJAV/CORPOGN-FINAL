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
      created_at,
      corporates (
        company_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const formatted = (opportunities ?? []).map((opp: any) => ({
    id: opp.id,
    corporate_id: opp.corporate_id,
    title: opp.title,
    description: opp.description,
    focus_area: opp.focus_area,
    budget: Number(opp.budget),
    state: opp.state,
    created_at: opp.created_at,
    corporate_name: opp.corporates?.company_name ?? "Partner Corporate",
  }));

  return Response.json({ opportunities: formatted });
}
