import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10 text-slate-950">
      <Link
        className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium transition hover:border-slate-500 hover:bg-slate-50"
        href="/"
      >
        Back
      </Link>

      <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-3xl flex-col items-center justify-center gap-8 text-center">
        <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
          Sign up
        </h1>

        <div className="grid w-full gap-4 sm:grid-cols-2">
          <Link
            className="flex min-h-36 items-center justify-center rounded-lg border border-slate-300 px-6 text-xl font-semibold transition hover:border-slate-500 hover:bg-slate-50"
            href="/signup/ngo"
          >
            Register as NGO
          </Link>
          <Link
            className="flex min-h-36 items-center justify-center rounded-lg bg-slate-950 px-6 text-xl font-semibold text-white transition hover:bg-slate-800"
            href="/signup/corporate"
          >
            Register as Corporate
          </Link>
        </div>
      </section>
    </main>
  );
}
