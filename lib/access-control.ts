import { supabaseAdmin } from "@/lib/supabase-admin";

export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type OrgContext =
  | {
      accountType: "corporate";
      orgType: "corporate";
      orgId: string;
      orgSlug: string;
      orgName: string;
      roleLabel: string;
      allowedPages: string[] | null;
    }
  | {
      accountType: "corporate_employee";
      orgType: "corporate";
      orgId: string;
      orgSlug: string;
      orgName: string;
      roleLabel: string;
      allowedPages: string[];
    }
  | {
      accountType: "ngo";
      orgType: "ngo";
      orgId: string;
      orgSlug: string;
      orgName: string;
      roleLabel: string;
      allowedPages: string[] | null;
    }
  | {
      accountType: "ngo_member";
      orgType: "ngo";
      orgId: string;
      orgSlug: string;
      orgName: string;
      roleLabel: string;
      allowedPages: string[] | null;
    }
  | {
      accountType: "admin";
      orgType: "admin";
      orgId: string;
      orgSlug: string;
      orgName: string;
      roleLabel: string;
      allowedPages: string[] | null;
    };

export type ProjectPermission = "read_only" | "edit";

export function tokenFrom(request: Request) {
  return (request.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
}

export async function getCaller(request: Request): Promise<AuthUser | null> {
  const token = tokenFrom(request);
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user as AuthUser;
}

function cleanStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export async function getAdminForUser(user: AuthUser) {
  const { data } = await supabaseAdmin
    .from("admin_users")
    .select("id, email, full_name, is_active")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  return data as { id: string; email: string; full_name: string; is_active: boolean } | null;
}

export async function getOrgContext(user: AuthUser): Promise<OrgContext | null> {
  const admin = await getAdminForUser(user);
  if (admin) {
    return {
      accountType: "admin",
      orgType: "admin",
      orgId: admin.id,
      orgSlug: "admin",
      orgName: admin.full_name,
      roleLabel: "Platform Admin",
      allowedPages: null,
    };
  }

  const accountType = user.user_metadata?.account_type;

  if (accountType === "corporate") {
    const { data } = await supabaseAdmin
      .from("corporates")
      .select("id, slug, company_name")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (!data) return null;

    return {
      accountType,
      orgType: "corporate",
      orgId: data.id,
      orgSlug: data.slug,
      orgName: data.company_name,
      roleLabel: "Corporate Admin",
      allowedPages: null,
    };
  }

  if (accountType === "corporate_employee") {
    const { data: employee } = await supabaseAdmin
      .from("corporate_employees")
      .select("corporate_id, full_name, position, allowed_pages, is_active")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const corporateId =
      employee?.is_active && employee.corporate_id
        ? employee.corporate_id
        : typeof user.user_metadata?.corporate_id === "string"
          ? user.user_metadata.corporate_id
          : "";

    if (!corporateId) return null;

    const { data: corporate } = await supabaseAdmin
      .from("corporates")
      .select("id, slug, company_name")
      .eq("id", corporateId)
      .maybeSingle();
    if (!corporate) return null;

    return {
      accountType,
      orgType: "corporate",
      orgId: corporate.id,
      orgSlug: corporate.slug,
      orgName: corporate.company_name,
      roleLabel:
        typeof employee?.position === "string"
          ? employee.position
          : typeof user.user_metadata?.position === "string"
            ? user.user_metadata.position
            : "Corporate Employee",
      allowedPages: cleanStringArray(employee?.allowed_pages ?? user.user_metadata?.allowed_pages),
    };
  }

  if (accountType === "ngo") {
    const { data } = await supabaseAdmin
      .from("ngos")
      .select("id, slug, ngo_name")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (!data) return null;

    return {
      accountType,
      orgType: "ngo",
      orgId: data.id,
      orgSlug: data.slug,
      orgName: data.ngo_name,
      roleLabel: "NGO Super Admin",
      allowedPages: null,
    };
  }

  if (accountType === "ngo_member") {
    const ngoId =
      typeof user.user_metadata?.ngo_id === "string" ? user.user_metadata.ngo_id : "";
    if (!ngoId) return null;

    const { data: ngo } = await supabaseAdmin
      .from("ngos")
      .select("id, slug, ngo_name")
      .eq("id", ngoId)
      .maybeSingle();
    if (!ngo) return null;

    return {
      accountType,
      orgType: "ngo",
      orgId: ngo.id,
      orgSlug: ngo.slug,
      orgName: ngo.ngo_name,
      roleLabel:
        typeof user.user_metadata?.role === "string"
          ? user.user_metadata.role
          : "NGO Member",
      allowedPages: null,
    };
  }

  return null;
}

function permissionForArea(value: unknown, area: string): ProjectPermission | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = (value as Record<string, unknown>)[area] ?? (value as Record<string, unknown>).all;
  return raw === "edit" || raw === "read_only" ? raw : null;
}

export async function authorizeProjectAccess(
  user: AuthUser,
  connectionId: string,
  options: {
    area?: string;
    action?: ProjectPermission;
  } = {},
) {
  const context = await getOrgContext(user);
  if (!context) {
    return { ok: false, status: 403, error: "Unsupported account type." } as const;
  }

  if (context.accountType === "admin") {
    return { ok: true, context, permission: "edit" as ProjectPermission } as const;
  }

  const { data: connection, error } = await supabaseAdmin
    .from("project_connections")
    .select("id, corporate_id, ngo_id, status")
    .eq("id", connectionId)
    .maybeSingle();

  if (error || !connection) {
    return { ok: false, status: 404, error: "Project connection not found." } as const;
  }

  const isOwnerOrg =
    (context.orgType === "corporate" && context.orgId === connection.corporate_id) ||
    (context.orgType === "ngo" && context.orgId === connection.ngo_id);

  if (
    isOwnerOrg &&
    (context.accountType === "corporate" || context.accountType === "ngo")
  ) {
    return { ok: true, context, connection, permission: "edit" as ProjectPermission } as const;
  }

  const { data: assignee } = await supabaseAdmin
    .from("project_assignees")
    .select("permissions")
    .eq("project_id", connectionId)
    .eq("user_id", user.id)
    .maybeSingle();

  const permission = permissionForArea(assignee?.permissions, options.area ?? "all");
  const hasPermission =
    permission === "edit" || (permission === "read_only" && options.action !== "edit");

  if (!hasPermission) {
    return {
      ok: false,
      status: 403,
      error: "Access denied. You are not assigned to this project connection.",
    } as const;
  }

  return { ok: true, context, connection, permission } as const;
}
