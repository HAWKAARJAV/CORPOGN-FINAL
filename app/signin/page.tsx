"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const inputClass =
  "h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-700";

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

const ROLE_CREDS: { label: string; role: string; email: string; password: string }[] = [
  {
    label: "Finance Officer",
    role: "Finance",
    email: "finance@greenearthngo.in",
    password: "Finance@2026",
  },
  {
    label: "Compliance Officer",
    role: "Compliance",
    email: "compliance@greenearthngo.in",
    password: "Comply@2026",
  },
  {
    label: "Operations Manager",
    role: "Operations",
    email: "ops@greenearthngo.in",
    password: "Ops@2026",
  },
  {
    label: "Field Coordinator",
    role: "Field",
    email: "field@greenearthngo.in",
    password: "Field@2026",
  },
  {
    label: "Reporting Executive",
    role: "Reporter",
    email: "reporter@greenearthngo.in",
    password: "Report@2026",
  },
  {
    label: "Volunteer",
    role: "Volunteer",
    email: "volunteer@greenearthngo.in",
    password: "Volunteer@2026",
  },
];

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

  function selectOrganization(nextOrganization: Organization) {
    const mode = getDefaultMode(nextOrganization);

    setOrganization(nextOrganization);
    setActiveMode(mode);
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

  function fillRole(creds: { email: string; password: string }) {
    setEmail(creds.email);
    setPassword(creds.password);
    setErrorMessage("");
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

    if (!organization) {
      setErrorMessage("Choose Corporate or NGO first.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const { data: signInData, error } =
      await supabaseBrowser.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error || !signInData.user) {
      setErrorMessage(error?.message || "Invalid email or password.");
      setIsSubmitting(false);
      return;
    }

    const metadata = signInData.user.user_metadata ?? {};
    const accountType = metadata.account_type as string;
    const expectedAccountType = MODE_TO_ACCOUNT_TYPE[activeMode];

    if (accountType !== expectedAccountType) {
      await supabaseBrowser.auth.signOut();
      setErrorMessage(
        `This account is not a ${MODE_LABELS[activeMode]} account. Please select the correct sign-in type.`,
      );
      setIsSubmitting(false);
      return;
    }

    if (accountType === "corporate") {
      const { data: corporate, error: corporateError } = await supabaseBrowser
        .from("corporates")
        .select("slug")
        .single();

      if (corporateError || !corporate) {
        setErrorMessage("Corporate profile not found.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/corporate/${corporate.slug}/dashboard`);
      return;
    }

    if (accountType === "corporate_employee") {
      await routeCorporateEmployee(
        signInData.user.id,
        metadata,
        "Corporate employee profile not found. Ask your admin to assign company access.",
      );
      return;
    }

    if (accountType === "ngo") {
      const { data: ngo, error: ngoError } = await supabaseBrowser
        .from("ngos")
        .select("slug")
        .single();

      if (ngoError || !ngo) {
        setErrorMessage("NGO profile not found.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/ngo/${ngo.slug}/dashboard`);
      return;
    }

    if (accountType === "ngo_member") {
      const ngoId = metadata.ngo_id as string;

      if (!ngoId) {
        setErrorMessage("NGO membership data not found. Contact your admin.");
        setIsSubmitting(false);
        return;
      }

      const { data: ngo, error: ngoError } = await supabaseBrowser
        .from("ngos")
        .select("slug")
        .eq("id", ngoId)
        .single();

      if (ngoError || !ngo) {
        setErrorMessage("Could not find your NGO. Contact your admin.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/ngo/${ngo.slug}/dashboard`);
      return;
    }

    setErrorMessage("Unknown account type. Please contact support.");
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
        <Link
          className="inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-slate-500"
          href="/"
        >
          Back
        </Link>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 pb-5 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
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
            {registered === "ngo" ? (
              <p className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                NGO registered successfully. Sign in with your admin credentials.
              </p>
            ) : null}

            {!organization ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {ORGANIZATION_OPTIONS.map((option) => (
                  <button
                    className="rounded-lg border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
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
                    <span className="text-slate-950">{selectedOrgLabel}</span>
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
                          ? "border-blue-500 bg-blue-50 text-blue-950"
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
                  {errorMessage ? (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                      {errorMessage}
                    </p>
                  ) : null}

                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Email address
                    <input
                      className={inputClass}
                      name="email"
                      onChange={(event) => setEmail(event.target.value)}
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
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                      required
                      type="password"
                      value={password}
                    />
                  </label>

                  <button
                    className="h-11 w-full rounded-md bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </button>
                </form>

                {activeMode === "ngo_employee" ? (
                  <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Testing: fill NGO employee credentials by role
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLE_CREDS.map((cred) => (
                        <button
                          className="rounded-md border border-amber-300 bg-white px-3 py-2 text-left transition hover:border-amber-500 hover:bg-amber-100"
                          key={cred.email}
                          onClick={() => fillRole(cred)}
                          type="button"
                        >
                          <p className="text-xs font-semibold text-slate-800">
                            {cred.role}
                          </p>
                          <p className="truncate text-[10px] text-slate-400">
                            {cred.email}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                className="font-medium text-slate-950 underline underline-offset-2 hover:text-slate-700"
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
