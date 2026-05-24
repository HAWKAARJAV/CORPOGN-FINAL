"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const inputClass =
  "h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-700";

export default function SignInPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    const { data: corporate, error: corporateError } = await supabaseBrowser
      .from("corporates")
      .select("slug")
      .single();

    setIsSubmitting(false);

    if (corporateError || !corporate) {
      setErrorMessage(corporateError?.message || "Corporate profile not found.");
      return;
    }

    router.push(`/corporate/${corporate.slug}/dashboard`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <div className="mx-auto max-w-md">
        <Link
          className="inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-slate-500"
          href="/"
        >
          Back
        </Link>

        <section className="mt-16 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Continue to your corporate dashboard.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {errorMessage ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
              Email
              <input className={inputClass} name="email" required type="email" />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
              Password
              <input
                className={inputClass}
                name="password"
                required
                type="password"
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
        </section>
      </div>
    </main>
  );
}
