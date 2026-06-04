"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  Building2, Leaf, ChevronDown, ChevronUp, Zap,
  Star, Shield, Wallet, Wrench, Camera, BarChart3, Heart,
} from "lucide-react";

const inputClass =
  "h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

type Organization = "corporate" | "ngo";
type SignInMode =
  | "corporate_admin"
  | "corporate_employee"
  | "ngo_admin"
  | "ngo_employee";

const ORGANIZATION_OPTIONS: {
  id: Organization;
  label: string;
  description: string;
}[] = [
  {
    id: "corporate",
    label: "Sign in as Corporate",
    description: "For CSR firms, corporate admins, and corporate employees.",
  },
  {
    id: "ngo",
    label: "Sign in as NGO",
    description: "For NGO admins and NGO team members.",
  },
];

const MODE_OPTIONS: Record<
  Organization,
  { id: SignInMode; label: string; description: string }[]
> = {
  corporate: [
    {
      id: "corporate_admin",
      label: "Login as Firm / Admin",
      description: "Company owner, CSR head, or admin account.",
    },
    {
      id: "corporate_employee",
      label: "Login as Employee",
      description: "Team member with page-level access assigned by admin.",
    },
  ],
  ngo: [
    {
      id: "ngo_admin",
      label: "Login as Firm / Admin",
      description: "NGO owner, trustee, or super admin account.",
    },
    {
      id: "ngo_employee",
      label: "Login as Employee",
      description: "NGO member with an assigned operational role.",
    },
  ],
};

const MODE_TO_ACCOUNT_TYPE: Record<SignInMode, string> = {
  corporate_admin: "corporate",
  corporate_employee: "corporate_employee",
  ngo_admin: "ngo",
  ngo_employee: "ngo_member",
};

const MODE_LABELS: Record<SignInMode, string> = {
  corporate_admin: "corporate firm/admin",
  corporate_employee: "corporate employee",
  ngo_admin: "NGO firm/admin",
  ngo_employee: "NGO employee",
};

const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  try {
    return new URL(url).host;
  } catch {
    return url || "the configured Supabase project";
  }
})();

function getAuthErrorMessage(error: unknown, fallback: string) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  if (/failed to fetch|network|name_not_resolved|err_name_not_resolved/i.test(message)) {
    return `Could not reach Supabase (${supabaseHost}). Check your internet/DNS connection, then restart the dev server if you changed .env.local.`;
  }

  return message || fallback;
}

// ─── Demo credentials ─────────────────────────────────────────────────────────

type DemoAccount = {
  label: string;
  sublabel: string;
  email: string;
  password: string;
  org: Organization;
  mode: SignInMode;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  iconBg: string;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Corporate Super Admin",
    sublabel: "Demo Corporation",
    email: "demo@corpdemo.com",
    password: "CorpoGN@2026",
    org: "corporate",
    mode: "corporate_admin",
    icon: Building2,
    color: "text-blue-700",
    iconBg: "bg-blue-100",
  },
  {
    label: "NGO Super Admin",
    sublabel: "Green Earth Foundation",
    email: "admin@greenearthngo.in",
    password: "GreenEarth@2026",
    org: "ngo",
    mode: "ngo_admin",
    icon: Leaf,
    color: "text-emerald-700",
    iconBg: "bg-emerald-100",
  },
];

const NGO_ROLE_CREDS: {
  label: string; sublabel: string; email: string; password: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: "Finance Officer",     sublabel: "Funds & Expenses",    icon: Wallet,   email: "finance@greenearthngo.in",    password: "Finance@2026"   },
  { label: "Compliance Officer",  sublabel: "Docs & Verification", icon: Shield,   email: "compliance@greenearthngo.in", password: "Comply@2026"    },
  { label: "Operations Manager",  sublabel: "Projects & Milestones",icon: Wrench,  email: "ops@greenearthngo.in",         password: "Ops@2026"       },
  { label: "Field Coordinator",   sublabel: "Field & Media",       icon: Camera,   email: "field@greenearthngo.in",       password: "Field@2026"     },
  { label: "Reporting Executive", sublabel: "Analytics & Reports", icon: BarChart3,email: "reporter@greenearthngo.in",    password: "Report@2026"    },
  { label: "Volunteer",           sublabel: "Tasks & Events",      icon: Heart,    email: "volunteer@greenearthngo.in",   password: "Volunteer@2026" },
];

// ─── Demo Panel ───────────────────────────────────────────────────────────────

function DemoPanel({
  onLogin,
  loading,
}: {
  onLogin: (acc: { email: string; password: string; org: Organization; mode: SignInMode }) => void;
  loading: string | null; // email of the account currently signing in
}) {
  const [open, setOpen] = useState(true);
  const [roleOpen, setRoleOpen] = useState(false);

  function DemoButton({
    email, password, org, mode, children,
    className = "",
  }: {
    email: string; password: string; org: Organization; mode: SignInMode;
    children: React.ReactNode; className?: string;
  }) {
    const isLoading = loading === email;
    return (
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => onLogin({ email, password, org, mode })}
        className={`relative transition active:scale-[.97] disabled:cursor-not-allowed ${className}`}
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 z-10">
            <span className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          </span>
        )}
        {children}
      </button>
    );
  }

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600">
            <Zap className="h-3.5 w-3.5 text-white" />
          </span>
          <div>
            <p className="text-sm font-bold text-emerald-900">Try a Demo Account</p>
            <p className="text-[11px] text-emerald-600">Click any card — logs in instantly</p>
          </div>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          : <ChevronDown className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-emerald-200 px-4 pb-4 pt-3 space-y-4">

          {/* ── Admin accounts ── */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              Platform Admins — Shared project active
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <DemoButton
                  key={acc.email}
                  email={acc.email} password={acc.password}
                  org={acc.org} mode={acc.mode}
                  className="group flex items-center gap-3 rounded-xl border border-white bg-white px-3.5 py-3 text-left shadow-sm hover:border-emerald-400 hover:shadow-md"
                >
                  <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${acc.iconBg}`}>
                    <acc.icon className={`h-5 w-5 ${acc.color}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800">{acc.label}</p>
                    <p className="text-xs text-slate-500">{acc.sublabel}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{acc.email}</p>
                  </div>
                  <span className={`ml-auto shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${acc.org === "corporate" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {acc.org === "corporate" ? "Corp" : "NGO"}
                  </span>
                </DemoButton>
              ))}
            </div>
          </div>

          {/* ── NGO role members ── */}
          <div>
            <button
              type="button"
              onClick={() => setRoleOpen(!roleOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-emerald-200 bg-emerald-100/60 px-3 py-2 text-left"
            >
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-emerald-700" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                  NGO Role Members — 6 roles
                </p>
              </div>
              {roleOpen
                ? <ChevronUp className="h-3.5 w-3.5 text-emerald-600" />
                : <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />}
            </button>

            {roleOpen && (
              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {NGO_ROLE_CREDS.map((cred) => (
                  <DemoButton
                    key={cred.email}
                    email={cred.email} password={cred.password}
                    org="ngo" mode="ngo_employee"
                    className="flex flex-col items-start gap-1 rounded-lg border border-white bg-white px-3 py-2.5 text-left shadow-sm hover:border-emerald-300"
                  >
                    <div className="flex items-center gap-1.5">
                      <cred.icon className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      <p className="text-xs font-bold text-slate-800 leading-tight">{cred.label}</p>
                    </div>
                    <p className="text-[10px] text-slate-400">{cred.sublabel}</p>
                  </DemoButton>
                ))}
              </div>
            )}
          </div>

          <p className="text-[10px] text-emerald-600/70 text-center">
            All demo accounts share a live project: <span className="font-semibold">Rural Education Mission</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

function getDefaultMode(organization: Organization): SignInMode {
  return organization === "corporate" ? "corporate_admin" : "ngo_admin";
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [organization, setOrganization] = useState<Organization | null>(() =>
    registered === "ngo" ? "ngo" : null,
  );
  const [activeMode, setActiveMode] = useState<SignInMode>(() =>
    registered === "ngo" ? "ngo_admin" : "corporate_admin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  function selectOrganization(nextOrganization: Organization) {
    setOrganization(nextOrganization);
    setActiveMode(getDefaultMode(nextOrganization));
    setEmail("");
    setPassword("");
    setErrorMessage("");
  }

  function switchMode(mode: SignInMode) {
    setActiveMode(mode);
    setEmail("");
    setPassword("");
    setErrorMessage("");
  }

  async function routeUser(
    accountType: string,
    metadata: Record<string, unknown>,
    userId: string,
    mode: SignInMode,
  ) {
    if (accountType !== MODE_TO_ACCOUNT_TYPE[mode]) {
      await supabaseBrowser.auth.signOut();
      setErrorMessage(`Account type mismatch. Please use the correct sign-in type.`);
      return;
    }

    if (accountType === "corporate") {
      const { data: corporate } = await supabaseBrowser.from("corporates").select("slug").single();
      if (corporate) { router.push(`/corporate/${corporate.slug}/dashboard`); return; }
      setErrorMessage("Corporate profile not found.");
      return;
    }

    if (accountType === "corporate_employee") {
      await routeCorporateEmployee(userId, metadata, "Corporate employee profile not found.");
      return;
    }

    if (accountType === "ngo") {
      const { data: ngo } = await supabaseBrowser.from("ngos").select("slug").single();
      if (ngo) { router.push(`/ngo/${ngo.slug}/dashboard`); return; }
      setErrorMessage("NGO profile not found.");
      return;
    }

    if (accountType === "ngo_member") {
      const ngoId = metadata.ngo_id as string;
      if (!ngoId) { setErrorMessage("NGO membership not found. Contact your admin."); return; }
      const { data: ngo } = await supabaseBrowser.from("ngos").select("slug").eq("id", ngoId).single();
      if (ngo) { router.push(`/ngo/${ngo.slug}/dashboard`); return; }
      setErrorMessage("Could not find your NGO. Contact your admin.");
      return;
    }

    setErrorMessage("Unknown account type. Please contact support.");
  }

  async function loginWithDemo(acc: { email: string; password: string; org: Organization; mode: SignInMode }) {
    setDemoLoading(acc.email);
    setErrorMessage("");

    let signInData;
    let signInError;

    try {
      const result = await supabaseBrowser.auth.signInWithPassword({
        email: acc.email,
        password: acc.password,
      });
      signInData = result.data;
      signInError = result.error;
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, "Could not sign in."));
      setDemoLoading(null);
      return;
    }

    if (signInError || !signInData.user) {
      setErrorMessage(getAuthErrorMessage(signInError, "Invalid credentials."));
      setDemoLoading(null);
      return;
    }

    const metadata    = signInData.user.user_metadata ?? {};
    const accountType = metadata.account_type as string;

    // Sync form state so the sign-in card reflects the logged-in account
    setOrganization(acc.org);
    setActiveMode(acc.mode);
    setEmail(acc.email);
    setPassword(acc.password);

    await routeUser(accountType, metadata, signInData.user.id, acc.mode);
    setDemoLoading(null);
  }

  async function routeCorporateEmployee(
    userId: string,
    metadata: Record<string, unknown>,
    fallbackError: string,
  ) {
    const corporateSlug =
      typeof metadata.corporate_slug === "string"
        ? metadata.corporate_slug
        : typeof metadata.company_slug === "string"
          ? metadata.company_slug
          : typeof metadata.slug === "string"
            ? metadata.slug
            : "";

    if (corporateSlug) {
      router.push(`/corporate/${corporateSlug}/dashboard`);
      return true;
    }

    const corporateId =
      typeof metadata.corporate_id === "string" ? metadata.corporate_id : "";

    if (corporateId) {
      const { data: corporate, error: corporateError } = await supabaseBrowser
        .from("corporates")
        .select("slug")
        .eq("id", corporateId)
        .single();

      if (!corporateError && corporate) {
        router.push(`/corporate/${corporate.slug}/dashboard`);
        return true;
      }
    }

    const { data: employee, error: employeeError } = await supabaseBrowser
      .from("corporate_employees")
      .select("corporate_id, is_active")
      .eq("auth_user_id", userId)
      .single();

    if (!employeeError && employee?.is_active) {
      const { data: corporate, error: corporateError } = await supabaseBrowser
        .from("corporates")
        .select("slug")
        .eq("id", employee.corporate_id)
        .single();

      if (!corporateError && corporate) {
        router.push(`/corporate/${corporate.slug}/dashboard`);
        return true;
      }
    }

    setErrorMessage(fallbackError);
    setIsSubmitting(false);
    return false;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization) { setErrorMessage("Choose Corporate or NGO first."); return; }

    setIsSubmitting(true);
    setErrorMessage("");

    let signInData;
    let signInError;

    try {
      const result = await supabaseBrowser.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      signInData = result.data;
      signInError = result.error;
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, "Could not sign in."));
      setIsSubmitting(false);
      return;
    }

    if (signInError || !signInData.user) {
      setErrorMessage(getAuthErrorMessage(signInError, "Invalid email or password."));
      setIsSubmitting(false);
      return;
    }

    const metadata    = signInData.user.user_metadata ?? {};
    const accountType = metadata.account_type as string;

    await routeUser(accountType, metadata, signInData.user.id, activeMode);
    setIsSubmitting(false);
  }

  const modeOptions = organization ? MODE_OPTIONS[organization] : [];
  const selectedOrgLabel =
    organization === "corporate"
      ? "Corporate"
      : organization === "ngo"
        ? "NGO"
        : "";

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <div className="mx-auto max-w-2xl">

        {/* Back + logo */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            ← Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-extrabold text-slate-800 tracking-tight">CorpoGN</span>
          </div>
        </div>

        {/* Demo panel — one-click instant login */}
        <DemoPanel onLogin={loginWithDemo} loading={demoLoading} />

        {/* Sign-in card */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 pb-5 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              CorpoGN access
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {organization ? `${selectedOrgLabel} sign in` : "Choose sign-in type"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {organization
                ? "Select whether this is an admin account or an employee account."
                : "Start by choosing the workspace you want to enter."}
            </p>
          </div>

          <div className="p-6">
            {registered === "ngo" && (
              <p className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                NGO registered successfully. Sign in with your admin credentials.
              </p>
            )}

            {!organization ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {ORGANIZATION_OPTIONS.map((option) => (
                  <button
                    className="rounded-lg border border-slate-200 bg-white p-5 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                    key={option.id}
                    onClick={() => selectOrganization(option.id)}
                    type="button"
                  >
                    <span className="text-base font-semibold text-slate-950">
                      {option.label}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-slate-500">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-600">
                    Signing in to:{" "}
                    <span className="font-semibold text-slate-950">{selectedOrgLabel}</span>
                  </p>
                  <button
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-950"
                    onClick={() => {
                      setOrganization(null);
                      setErrorMessage("");
                    }}
                    type="button"
                  >
                    Change
                  </button>
                </div>

                <div className="mb-6 grid gap-3 sm:grid-cols-2">
                  {modeOptions.map((mode) => (
                    <button
                      className={`rounded-lg border p-4 text-left transition ${
                        activeMode === mode.id
                          ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                      key={mode.id}
                      onClick={() => switchMode(mode.id)}
                      type="button"
                    >
                      <span className="text-sm font-semibold">{mode.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {mode.description}
                      </span>
                    </button>
                  ))}
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {errorMessage && (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                      {errorMessage}
                    </p>
                  )}

                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Email address
                    <input
                      className={inputClass}
                      name="email"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      type="email"
                      value={email}
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Password
                    <input
                      className={inputClass}
                      name="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      type="password"
                      value={password}
                    />
                  </label>

                  <button
                    className="h-11 w-full rounded-md bg-emerald-700 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                href="/signup"
              >
                Sign up
              </Link>
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
