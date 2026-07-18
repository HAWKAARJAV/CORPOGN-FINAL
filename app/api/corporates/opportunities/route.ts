import { supabaseAdmin } from "@/lib/supabase-admin";

async function getCaller(request: Request) {
  const token = (request.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

async function getCorporateForUser(user: any) {
  const accountType = user.user_metadata?.account_type;

  if (accountType === "corporate") {
    const { data, error } = await supabaseAdmin
      .from("corporates")
      .select("id, company_name")
      .eq("auth_user_id", user.id)
      .single();
    if (error || !data) return null;
    return data as { id: string; company_name: string };
  }

  if (accountType === "corporate_employee") {
    const { data: employee } = await supabaseAdmin
      .from("corporate_employees")
      .select("corporate_id, is_active")
      .eq("auth_user_id", user.id)
      .single();

    const corporateId =
      employee?.is_active && employee.corporate_id
        ? employee.corporate_id
        : (user.user_metadata?.corporate_id as string | undefined);

    if (!corporateId) return null;

    const { data, error } = await supabaseAdmin
      .from("corporates")
      .select("id, company_name")
      .eq("id", corporateId)
      .single();
    if (error || !data) return null;
    return data as { id: string; company_name: string };
  }

  return null;
}

/**
 * POST /api/corporates/opportunities
 * Create a new CSR opportunity (posted project). Corporate admin or active employee only.
 */
export async function POST(request: Request) {
  const user = await getCaller(request);
  if (!user) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const corp = await getCorporateForUser(user);
  if (!corp) {
    return Response.json({ error: "Only corporate accounts or their active employees can post opportunities." }, { status: 403 });
  }

  const body = (await request.json()) as {
    title?: string;
    focus_area?: string;
    state?: string;
    district?: string;
    budget?: number;
    description?: string;
    sdg_targets?: string[];
    target_beneficiaries?: string[];
    expected_start_date?: string;
    duration_months?: number;
    min_trust_score?: number;
  };

  if (!body.title?.trim() || !body.focus_area?.trim() || !body.budget) {
    return Response.json({ error: "Title, focus area, and budget are required." }, { status: 400 });
  }

  // Attempt to insert with all the new fields on the opportunities table
  const { data, error } = await supabaseAdmin
    .from("opportunities")
    .insert({
      corporate_id: corp.id,
      title: body.title.trim(),
      focus_area: body.focus_area.trim(),
      state: body.state?.trim() || "Pan India",
      budget: body.budget,
      description: body.description?.trim() || "",
      district: body.district?.trim() || null,
      sdg_targets: body.sdg_targets ?? [],
      target_beneficiaries: body.target_beneficiaries ?? [],
      expected_start_date: body.expected_start_date || null,
      duration_months: body.duration_months || null,
      min_trust_score: body.min_trust_score ?? 0,
      status: "open",
    })
    .select()
    .single();

  if (error) {
    const isColumnError = error.code === "42703" || error.message?.includes("column") || error.message?.includes("schema cache");
    if (isColumnError) {
      console.warn("New opportunities columns not found in DB. Falling back to legacy columns...");
      const { data: fallbackData, error: fallbackError } = await supabaseAdmin
        .from("opportunities")
        .insert({
          corporate_id: corp.id,
          title: body.title.trim(),
          focus_area: body.focus_area.trim(),
          state: body.state?.trim() || "Pan India",
          budget: body.budget,
          description: body.description?.trim() || "",
        })
        .select()
        .single();
      
      if (fallbackError) {
        return Response.json({ error: fallbackError.message }, { status: 500 });
      }
      return Response.json({ opportunity: fallbackData }, { status: 201 });
    }

    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ opportunity: data }, { status: 201 });
}

/**
 * GET /api/corporates/opportunities
 * Fetch all opportunities for the authenticated corporate.
 */
export async function GET(request: Request) {
  const user = await getCaller(request);
  if (!user) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const corp = await getCorporateForUser(user);
  if (!corp) {
    return Response.json({ opportunities: [] });
  }

  const { data: opps, error } = await supabaseAdmin
    .from("opportunities")
    .select("*")
    .eq("corporate_id", corp.id)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ opportunities: opps ?? [] });
}
