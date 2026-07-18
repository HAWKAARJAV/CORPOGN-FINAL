import { getCaller, getOrgContext } from "@/lib/access-control";
import { mapConnectionRow } from "@/lib/project-connections";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function requireAdmin(request: Request) {
  const user = await getCaller(request);
  if (!user) return { error: "Unauthorized.", status: 401 } as const;

  const context = await getOrgContext(user);
  if (!context || context.accountType !== "admin") {
    return { error: "Only platform admins can access this endpoint.", status: 403 } as const;
  }

  return { user, context } as const;
}

async function loadNames(rows: Record<string, unknown>[]) {
  const corporateIds = [...new Set(rows.map((row) => String(row.corporate_id)))];
  const ngoIds = [...new Set(rows.map((row) => String(row.ngo_id)))];

  const [{ data: corporates }, { data: ngos }] = await Promise.all([
    corporateIds.length
      ? supabaseAdmin.from("corporates").select("id, company_name, auth_user_id").in("id", corporateIds)
      : Promise.resolve({ data: [] }),
    ngoIds.length
      ? supabaseAdmin.from("ngos").select("id, ngo_name, auth_user_id").in("id", ngoIds)
      : Promise.resolve({ data: [] }),
  ]);

  return {
    corporateNames: new Map((corporates ?? []).map((row) => [row.id, row.company_name])),
    ngoNames: new Map((ngos ?? []).map((row) => [row.id, row.ngo_name])),
    corporateOwners: new Map((corporates ?? []).map((row) => [row.id, row.auth_user_id])),
    ngoOwners: new Map((ngos ?? []).map((row) => [row.id, row.auth_user_id])),
  };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });

  const status = new URL(request.url).searchParams.get("status") || "pending_admin";
  const { data, error } = await supabaseAdmin
    .from("project_connections")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as Record<string, unknown>[];
  const names = await loadNames(rows);

  return Response.json({
    projects: rows.map((row) =>
      mapConnectionRow(
        row,
        names.corporateNames.get(String(row.corporate_id)),
        names.ngoNames.get(String(row.ngo_id)),
      ),
    ),
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });

  const body = (await request.json()) as {
    projectId?: string;
    decision?: "approve" | "reject";
    notes?: string;
  };

  if (!body.projectId || (body.decision !== "approve" && body.decision !== "reject")) {
    return Response.json({ error: "projectId and decision are required." }, { status: 400 });
  }

  const { data: current, error: currentError } = await supabaseAdmin
    .from("project_connections")
    .select("*")
    .eq("id", body.projectId)
    .maybeSingle();

  if (currentError || !current) {
    return Response.json({ error: "Project not found." }, { status: 404 });
  }

  const names = await loadNames([current as Record<string, unknown>]);

  if (body.decision === "approve") {
    const { data: updated, error } = await supabaseAdmin
      .from("project_connections")
      .update({
        status: "active",
        latest_update: body.notes?.trim()
          ? `Platform admin approved assignment: ${body.notes.trim()}`
          : "Platform admin approved assignment. Shared workspace is active.",
      })
      .eq("id", body.projectId)
      .select("*")
      .single();

    if (error || !updated) {
      return Response.json({ error: error?.message ?? "Could not approve project." }, { status: 500 });
    }

    const corporateOwner = names.corporateOwners.get(String(current.corporate_id));
    const ngoOwner = names.ngoOwners.get(String(current.ngo_id));
    const assignments = [
      corporateOwner && {
        project_id: body.projectId,
        user_id: corporateOwner,
        role_in_project: "Corporate Owner",
        permissions: { all: "edit" },
      },
      ngoOwner && {
        project_id: body.projectId,
        user_id: ngoOwner,
        role_in_project: "NGO Owner",
        permissions: { all: "edit" },
      },
    ].filter(Boolean);

    if (assignments.length) {
      await supabaseAdmin.from("project_assignees").upsert(assignments, {
        onConflict: "project_id,user_id",
      });
    }

    await supabaseAdmin
      .from("ngos")
      .update({ has_project: true, access_status: "active" })
      .eq("id", String(current.ngo_id));

    return Response.json({
      project: mapConnectionRow(
        updated as Record<string, unknown>,
        names.corporateNames.get(String(current.corporate_id)),
        names.ngoNames.get(String(current.ngo_id)),
      ),
    });
  }

  const { data: updated, error } = await supabaseAdmin
    .from("project_connections")
    .update({
      status: "proposal",
      latest_update: body.notes?.trim()
        ? `Platform admin returned assignment for revision: ${body.notes.trim()}`
        : "Platform admin returned assignment for revision.",
    })
    .eq("id", body.projectId)
    .select("*")
    .single();

  if (error || !updated) {
    return Response.json({ error: error?.message ?? "Could not reject project." }, { status: 500 });
  }

  return Response.json({
    project: mapConnectionRow(
      updated as Record<string, unknown>,
      names.corporateNames.get(String(current.corporate_id)),
      names.ngoNames.get(String(current.ngo_id)),
    ),
  });
}
