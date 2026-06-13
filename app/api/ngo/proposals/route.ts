import { supabaseAdmin } from "@/lib/supabase-admin";
import { mapConnectionRow } from "@/lib/project-connections";

type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

async function getCaller(request: Request): Promise<AuthUser | null> {
  const token = (request.headers.get("Authorization") ?? "")
    .replace("Bearer ", "")
    .trim();
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user as AuthUser;
}

async function getNgoForUser(user: AuthUser) {
  const accountType = user.user_metadata?.account_type;

  if (accountType === "ngo") {
    const { data, error } = await supabaseAdmin
      .from("ngos")
      .select("id, ngo_name")
      .eq("auth_user_id", user.id)
      .single();
    if (error || !data) return null;
    return data as { id: string; ngo_name: string };
  }

  if (accountType === "ngo_member") {
    const ngoId = user.user_metadata?.ngo_id as string | undefined;
    if (!ngoId) return null;

    const { data, error } = await supabaseAdmin
      .from("ngos")
      .select("id, ngo_name")
      .eq("id", ngoId)
      .single();
    if (error || !data) return null;
    return data as { id: string; ngo_name: string };
  }

  return null;
}

export async function GET(request: Request) {
  const user = await getCaller(request);
  if (!user) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const ngo = await getNgoForUser(user);
  if (!ngo) {
    return Response.json(
      { error: "NGO not found or user is not associated with an NGO." },
      { status: 403 },
    );
  }

  // Fetch proposals (status = 'proposal') for this NGO
  const { data: rows, error: fetchError } = await supabaseAdmin
    .from("project_connections")
    .select("*")
    .eq("ngo_id", ngo.id)
    .eq("status", "proposal")
    .order("created_at", { ascending: false });

  if (fetchError) {
    return Response.json({ error: fetchError.message }, { status: 500 });
  }

  const corporateIds = [...new Set((rows ?? []).map((row) => String(row.corporate_id)))];
  const { data: corporates } = corporateIds.length
    ? await supabaseAdmin.from("corporates").select("id, company_name").in("id", corporateIds)
    : { data: [] };

  const corporateNames = new Map(
    (corporates ?? []).map((c) => [c.id, c.company_name]),
  );

  const formatted = (rows ?? []).map((row) =>
    mapConnectionRow(row, corporateNames.get(String(row.corporate_id)), ngo.ngo_name),
  );

  return Response.json({ proposals: formatted });
}

export async function POST(request: Request) {
  const user = await getCaller(request);
  if (!user) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const ngo = await getNgoForUser(user);
  if (!ngo) {
    return Response.json(
      { error: "Only NGO accounts can submit proposals." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    corporate_id?: string;
    project_name?: string;
    focus_area?: string;
    budget?: number;
    summary?: string;
  };

  if (!body.corporate_id || !body.project_name || !body.focus_area || !body.budget) {
    return Response.json(
      { error: "corporate_id, project_name, focus_area, and budget are required." },
      { status: 400 },
    );
  }

  const summary = body.summary?.trim() || "No proposal summary provided.";

  // Insert proposal connection
  const { data: connection, error: insertError } = await supabaseAdmin
    .from("project_connections")
    .insert({
      corporate_id: body.corporate_id,
      ngo_id: ngo.id,
      project_name: body.project_name.trim(),
      focus_area: body.focus_area.trim(),
      budget: body.budget,
      status: "proposal",
      progress: 0,
      milestone: "Proposal Submitted",
      latest_update: `Proposal submitted: ${summary}`,
      document_requests: ["CSR-1 certificate", "Latest audit report"],
    })
    .select("*")
    .single();

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  const { data: corporate } = await supabaseAdmin
    .from("corporates")
    .select("company_name")
    .eq("id", body.corporate_id)
    .single();

  return Response.json({
    proposal: mapConnectionRow(
      connection as Record<string, unknown>,
      corporate?.company_name || "Partner Corporate",
      ngo.ngo_name,
    ),
  });
}
