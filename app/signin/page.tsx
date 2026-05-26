"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const inputClass =
  "h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-700";

type Tab = "corporate" | "ngo" | "ngo_member";

const TABS: { id: Tab; label: string; description: string }[] = [
  { id: "corporate", label: "Corporate", description: "Sign in to your corporate CSR dashboard" },
  { id: "ngo", label: "NGO Admin", description: "Sign in as NGO super admin" },
  { id: "ngo_member", label: "NGO Member", description: "Sign in with your assigned role" },
];

// ── TEST-PHASE credentials ────────────────────────────────────────────────────
const NGO_ADMIN_CREDS = { email: "admin@greenearthngo.in", password: "GreenEarth@2026" };

const ROLE_CREDS: { label: string; role: string; email: string; password: string }[] = [
  { label: "Finance Officer",       role: "Finance",     email: "finance@greenearthngo.in",    password: "Finance@2026"   },
  { label: "Compliance Officer",    role: "Compliance",  email: "compliance@greenearthngo.in", password: "Comply@2026"    },
  { label: "Operations Manager",    role: "Operations",  email: "ops@greenearthngo.in",         password: "Ops@2026"       },
  { label: "Field Coordinator",     role: "Field",       email: "field@greenearthngo.in",       password: "Field@2026"     },
  { label: "Reporting Executive",   role: "Reporter",    email: "reporter@greenearthngo.in",    password: "Report@2026"    },
  { label: "Volunteer",             role: "Volunteer",   email: "volunteer@greenearthngo.in",   password: "Volunteer@2026" },
];

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [activeTab, setActiveTab] = useState<Tab>("corporate");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setErrorMessage("");
    // Pre-fill NGO Admin creds; clear for everything else
    if (tab === "ngo") {
      setEmail(NGO_ADMIN_CREDS.email);
      setPassword(NGO_ADMIN_CREDS.password);
    } else {
      setEmail("");
      setPassword("");
    }
  }

  function fillRole(creds: { email: string; password: string }) {
    setEmail(creds.email);
    setPassword(creds.password);
    setErrorMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const { data: signInData, error } = await supabaseBrowser.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !signInData.user) {
      setErrorMessage(error?.message || "Invalid email or password.");
      setIsSubmitting(false);
      return;
    }

    const accountType = signInData.user.user_metadata?.account_type as string;

    // Validate tab matches account type
    if (activeTab === "corporate" && accountType !== "corporate") {
      await supabaseBrowser.auth.signOut();
      setErrorMessage("This account is not a corporate account. Please select the correct sign-in type.");
      setIsSubmitting(false);
      return;
    }
    if (activeTab === "ngo" && accountType !== "ngo") {
      await supabaseBrowser.auth.signOut();
      setErrorMessage("This account is not an NGO admin account. Please select the correct sign-in type.");
      setIsSubmitting(false);
      return;
    }
    if (activeTab === "ngo_member" && accountType !== "ngo_member") {
      await supabaseBrowser.auth.signOut();
      setErrorMessage("This account is not an NGO team member account. Please select the correct sign-in type.");
      setIsSubmitting(false);
      return;
    }

    // Route based on account type
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
      const ngoId = signInData.user.user_metadata?.ngo_id as string;

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

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <div className="mx-auto max-w-md">
        <Link
          className="inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-slate-500"
          href="/"
        >
          ← Back
        </Link>

        <section className="mt-10 rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-slate-100 px-6 pt-6 pb-5">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">
              {TABS.find((t) => t.id === activeTab)?.description}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                type="button"
                className={`flex-1 py-3 text-xs font-semibold tracking-wide transition ${
                  activeTab === tab.id
                    ? "border-b-2 border-slate-950 text-slate-950"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="p-6">
            {registered === "ngo" ? (
              <p className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                NGO registered successfully! Sign in with your admin credentials.
              </p>
            ) : null}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {errorMessage ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              {activeTab === "ngo" ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  🧪 Test credentials pre-filled for NGO Admin.
                </p>
              ) : null}

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Email address
                <input
                  className={inputClass}
                  name="email"
                  required
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Password
                <input
                  className={inputClass}
                  name="password"
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* ── Role quick-fill (NGO Member tab only) ── */}
            {activeTab === "ngo_member" ? (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="mb-3 text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  🧪 Testing — fill credentials by role
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_CREDS.map((cred) => (
                    <button
                      key={cred.email}
                      type="button"
                      onClick={() => fillRole(cred)}
                      className="rounded-md border border-amber-300 bg-white px-3 py-2 text-left transition hover:border-amber-500 hover:bg-amber-100"
                    >
                      <p className="text-xs font-semibold text-slate-800">{cred.role}</p>
                      <p className="text-[10px] text-slate-400 truncate">{cred.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="mt-5 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-slate-950 underline underline-offset-2 hover:text-slate-700">
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
