import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <nav className="absolute right-6 top-6 flex items-center gap-3">
        <Link
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium transition hover:border-slate-500 hover:bg-slate-50"
          href="/signin"
        >
          Sign in
        </Link>
        <Link
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          href="/signup"
        >
          Sign up
        </Link>
      </nav>

      <section className="flex min-h-screen items-center justify-center px-6">
        <h1 className="text-5xl font-semibold tracking-normal sm:text-7xl">
          Hello
        </h1>
      </section>
    </main>
  );
}
