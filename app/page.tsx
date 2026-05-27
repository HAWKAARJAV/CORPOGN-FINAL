import Link from "next/link";
import {
  ShieldCheck, Star, Wallet, Users, ArrowRight, CheckCircle2,
  Building2, Leaf, Target, Sparkles, Lock, TrendingUp,
  Globe, BarChart3, FileText, Award, Zap, ChevronDown,
  Phone, Mail, MapPin, ArrowUpRight, ExternalLink,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Proposal Matching",
    desc: "Our AI reviews every NGO proposal against your CSR mandate — scoring for regulatory alignment, past performance, and execution capacity — so you shortlist the best partners in hours, not weeks.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    text: "text-violet-700",
  },
  {
    icon: Star,
    title: "Real-time Trust Score",
    desc: "Every NGO on CorpoGN has a live 0–100 Trust Score built from compliance documents, audit history, project performance, and beneficiary data — full transparency before you commit a single rupee.",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
  },
  {
    icon: Lock,
    title: "Milestone-gated Funds",
    desc: "Fund tranches are released automatically when milestones are approved — never manually. No compliance risk, no trust gaps. Accountability is built into the infrastructure, not a process add-on.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Vault",
    desc: "12A, 80G, FCRA, CSR-1, audit reports — all in a certified, timestamped repository. Corporates request document bundles for due diligence with one click. Expiry alerts keep your NGO partners current.",
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-700",
  },
  {
    icon: TrendingUp,
    title: "End-to-end Traceability",
    desc: "Every rupee tracked from corporate sanction to field expenditure. Real-time utilization certificates, expense breakdowns by budget head, and auto-generated Board Report formats — ready for SEBI filing.",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-700",
  },
  {
    icon: Users,
    title: "Role-based Dashboards",
    desc: "Finance Officer, Compliance Officer, Operations Manager, Field Coordinator, Reporting Executive — every team member sees exactly what they need. Six specialized dashboards, one unified platform.",
    color: "from-cyan-500 to-sky-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    text: "text-cyan-700",
  },
];

const CORPORATE_FEATURES = [
  "Post CSR mandates and receive AI-matched NGO proposals within 48 hours",
  "Monitor milestone completion, fund utilization, and beneficiary data in real time",
  "Auto-generate Section 135 Board Report formats and SEBI CSR disclosures",
  "Schedule VII activity mapping and SDG goal alignment documentation",
  "Multi-project portfolio view with aggregated impact analytics across all NGOs",
  "Direct communication channel with NGO finance, compliance, and ops teams",
];

const NGO_FEATURES = [
  "Build a live Trust Score that makes you stand out to corporate partners",
  "Access exclusive CSR opportunities from 500+ verified corporate partners",
  "Manage Finance, Compliance, Operations, and Field teams from one platform",
  "Submit milestone reports, impact data, and utilization certificates digitally",
  "Fund tranches arrive automatically when milestones are approved — zero delay",
  "AI-powered proposal reviewer to strengthen your CSR applications before submission",
];

const TESTIMONIALS = [
  {
    name: "Rajesh Menon",
    title: "Head of CSR, Mahindra Group",
    quote: "CorpoGN cut our NGO shortlisting time from 6 weeks to 3 days. The Trust Score gave our board instant confidence in every partner we selected — and the milestone-gated fund flow meant zero compliance anxiety.",
    rating: 5,
    avatar: "RM",
    avatarColor: "bg-violet-600",
  },
  {
    name: "Priya Nair",
    title: "Executive Director, Green Earth Foundation",
    quote: "For the first time, our Finance Officer and Field Coordinator work inside the same system. Milestone payments arrive automatically — we spend 100% of our energy on delivery, not paperwork.",
    rating: 5,
    avatar: "PN",
    avatarColor: "bg-emerald-600",
  },
  {
    name: "Arun Krishnaswamy",
    title: "CSR Compliance Officer, Infosys Foundation",
    quote: "The Compliance Vault alone saved us 40 hours of document chasing per project. Section 135 reporting is now a one-click export, and the audit trail is immaculate for our board review.",
    rating: 5,
    avatar: "AK",
    avatarColor: "bg-blue-600",
  },
];

const COMPLIANCE = [
  { label: "Section 135 — Companies Act 2013",  desc: "Mandatory CSR spend tracking and Board approval workflows built in" },
  { label: "Schedule VII alignment",             desc: "Auto-map every project activity to Schedule VII categories" },
  { label: "SDG Mapping (17 Goals)",             desc: "Align all CSR initiatives to the UN Sustainable Development Goals" },
  { label: "SEBI CSR Disclosures",               desc: "Listed companies meet annual report and exchange disclosure norms" },
  { label: "CSR-1 & CSR-2 filing support",       desc: "Generate pre-filled Ministry of Corporate Affairs forms" },
  { label: "Third-party audit ready",            desc: "All data is audit-log protected, CA/CS-verifiable, and immutable" },
];

const STATS = [
  { value: "₹250 Cr+", label: "CSR Funds Managed" },
  { value: "500+",      label: "Corporate Partners" },
  { value: "1,200+",   label: "Verified NGOs" },
  { value: "4,800+",   label: "Projects Completed" },
  { value: "98%",       label: "Compliance Rate" },
];

const PRICING = [
  {
    name: "NGO Starter",
    price: "Free",
    period: "",
    desc: "For NGOs building their credibility and reaching new CSR partners",
    features: [
      "NGO profile + live Trust Score",
      "Apply to up to 3 mandates / month",
      "Compliance Vault (2 GB storage)",
      "Team roles for up to 3 members",
      "AI proposal reviewer (3 reviews / month)",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Corporate Pro",
    price: "₹49,999",
    period: "/ year",
    desc: "For corporate CSR teams managing 1–5 active projects",
    features: [
      "Unlimited NGO proposals + AI matching",
      "Milestone-gated fund disbursement",
      "Section 135 Board Report export",
      "SDG + Schedule VII alignment reports",
      "Up to 5 active CSR projects",
      "Real-time impact analytics",
      "Priority support — 4h SLA",
    ],
    cta: "Start 30-day Free Trial",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    desc: "For large corporates, PSUs, and government bodies with complex needs",
    features: [
      "Unlimited projects and NGO partners",
      "Custom workflow builder",
      "MCA CSR-1/CSR-2 integration",
      "Dedicated CSR consultant",
      "White-label reporting & branding",
      "SLA-backed support with dedicated AM",
    ],
    cta: "Talk to Our Team",
    href: "/contact",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "How is CorpoGN different from other CSR platforms?",
    a: "CorpoGN is the only CSR platform that operates as a real-time marketplace with a built-in Trust Score engine, milestone-gated fund disbursement, and role-based NGO team management — all in one. Most platforms offer reporting tools; we offer accountability infrastructure that protects both corporates and NGOs.",
  },
  {
    q: "Is CorpoGN compliant with Indian CSR regulations?",
    a: "Yes — built ground-up for Section 135 of the Companies Act 2013, Schedule VII, SEBI CSR disclosure requirements, and MCA CSR-1/CSR-2 filing. Our Compliance Vault stores all regulatory documents with timestamped, immutable audit trails.",
  },
  {
    q: "How exactly does the Trust Score work?",
    a: "Each NGO's Trust Score (0–100) is calculated from 6 weighted factors: compliance documents uploaded (55 pts base), past project milestone performance, beneficiary data quality, audit report currency, CSR-1 filing status, and platform engagement history. It updates in real time whenever the NGO takes action.",
  },
  {
    q: "Can we bring our existing NGO partners onto CorpoGN?",
    a: "Yes. Invite your existing NGO partners directly to your corporate workspace. They onboard in minutes, upload compliance documents, and get verified — while you watch their Trust Score build in real time before you commit budget.",
  },
  {
    q: "How does milestone-gated fund release work in practice?",
    a: "When creating a project, you set milestone deliverables and the fund tranche tied to each. When the NGO submits evidence and your CSR Manager approves, the next tranche is automatically queued for release — with full documentation attached to every transaction. No manual bank runs, no paper trails.",
  },
  {
    q: "Is CorpoGN suitable for PSUs and government bodies?",
    a: "Yes. Our Enterprise plan includes custom workflow configuration, government-specific reporting formats, district-level aggregation, and API integration with government CSR portals. We work with PSUs under both mandatory and voluntary CSR frameworks.",
  },
];

// ─── Shared utilities ─────────────────────────────────────────────────────────

function StarRating({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-950 antialiased">

      {/* ── Sticky Navbar ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Leaf className="h-4.5 w-4.5 h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">CorpoGN</span>
            <span className="hidden rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 sm:inline">Beta</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-7 md:flex">
            {[
              { label: "Platform", href: "#platform" },
              { label: "For Corporates", href: "#corporates" },
              { label: "For NGOs", href: "#ngos" },
              { label: "Compliance", href: "#compliance" },
              { label: "Pricing", href: "#pricing" },
            ].map((l) => (
              <a key={l.label} href={l.href}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-2.5">
            <Link href="/signin"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 sm:inline-flex">
              Sign in
            </Link>
            <Link href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95">
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 px-5 pb-24 pt-20 text-white">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-emerald-500/10" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-teal-400/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-700/60 bg-emerald-800/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            India&apos;s Trusted CSR Marketplace
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Where CSR Compliance{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              Meets Real Impact
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-emerald-100/80">
            Connect your corporate CSR mandate with verified, high-trust NGOs. Track every milestone, trace every rupee, and prove your impact — all built for Section 135 compliance.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup?type=corporate"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-emerald-900 shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-50 active:scale-95">
              <Building2 className="h-4 w-4" />
              I&apos;m a Corporate
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/signup?type=ngo"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/50 bg-emerald-800/40 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-emerald-800/60 active:scale-95">
              <Leaf className="h-4 w-4" />
              I&apos;m an NGO
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Trust signals */}
          <p className="mt-5 text-xs text-emerald-400">
            ✓ No credit card required &nbsp;·&nbsp; ✓ Free NGO plan forever &nbsp;·&nbsp; ✓ Section 135 compliant
          </p>
        </div>

        {/* Dashboard preview card */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-emerald-700/40 bg-emerald-900/60 shadow-2xl shadow-emerald-900/60 backdrop-blur-sm">
            {/* Mac-style chrome */}
            <div className="flex items-center gap-2 border-b border-emerald-700/30 px-5 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400/60" />
              <div className="h-3 w-3 rounded-full bg-amber-400/60" />
              <div className="h-3 w-3 rounded-full bg-emerald-400/60" />
              <div className="ml-4 flex-1 rounded-md bg-emerald-800/50 px-3 py-1 text-xs text-emerald-500">
                app.corpogn.in/corporate/tata-csr/dashboard
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
              {[
                { label: "Active Projects", value: "12", color: "text-emerald-300", bg: "bg-emerald-800/40" },
                { label: "CSR Budget Used", value: "₹4.2 Cr", color: "text-blue-300", bg: "bg-blue-900/30" },
                { label: "NGO Partners", value: "28", color: "text-violet-300", bg: "bg-violet-900/30" },
                { label: "Avg Trust Score", value: "82/100", color: "text-amber-300", bg: "bg-amber-900/30" },
              ].map((m) => (
                <div key={m.label} className={`rounded-xl ${m.bg} p-4`}>
                  <p className="text-[11px] text-emerald-400/70">{m.label}</p>
                  <p className={`mt-1 text-xl font-bold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
            {/* Progress bars */}
            <div className="space-y-3 px-5 pb-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">Milestone Progress — Q2 FY 2026</p>
              {[
                { label: "Digital Literacy Drive — Tata CSR", pct: 62, color: "bg-emerald-400" },
                { label: "Clean Water Initiative — Infosys",  pct: 45, color: "bg-blue-400"    },
                { label: "Women Empowerment — Mahindra",      pct: 88, color: "bg-violet-400"  },
              ].map((p) => (
                <div key={p.label} className="space-y-1">
                  <div className="flex justify-between text-xs text-emerald-300/70">
                    <span>{p.label}</span><span>{p.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-emerald-800">
                    <div className={`h-1.5 rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Floating badge cards */}
          <div className="absolute -left-4 top-10 hidden rounded-xl border border-emerald-700/30 bg-emerald-900/80 p-3 shadow-xl backdrop-blur-sm lg:block">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400">Trust Score Updated</p>
                <p className="text-sm font-bold text-white">Green Earth NGO — 84/100</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 bottom-10 hidden rounded-xl border border-emerald-700/30 bg-emerald-900/80 p-3 shadow-xl backdrop-blur-sm lg:block">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400">Tranche 2 Released</p>
                <p className="text-sm font-bold text-white">₹4,00,000 → Foundation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ─────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-slate-50 px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-8 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
            Trusted across India&apos;s CSR ecosystem
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-emerald-700">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem Statement ───────────────────────────────────────────────── */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">Why CorpoGN</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            CSR compliance is complex.<br />
            <span className="text-emerald-600">We make it accountable.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500 leading-relaxed">
            Most CSR platforms give you a dashboard. CorpoGN gives you infrastructure — real-time trust signals, automated fund controls, and role-based accountability across every team.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Building2,
                title: "Corporates face compliance risk",
                desc: "Section 135 violations, opaque NGO spending, and manual Board Report preparation eat up hundreds of hours and create audit exposure.",
                color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100",
              },
              {
                icon: Leaf,
                title: "NGOs struggle for visibility",
                desc: "Great NGOs lose projects to larger names — not because they perform worse, but because they lack the infrastructure to prove their credibility at scale.",
                color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100",
              },
              {
                icon: Globe,
                title: "Impact goes unmeasured",
                desc: "Field data never reaches the boardroom. Beneficiary numbers are guesses. SDG alignment is a checkbox. Real impact stays invisible.",
                color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100",
              },
            ].map((p) => (
              <div key={p.title} className={`rounded-2xl border ${p.border} ${p.bg} p-6 text-left`}>
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${p.bg} border ${p.border}`}>
                  <p.icon className={`h-5 w-5 ${p.color}`} />
                </div>
                <h3 className="text-base font-bold text-slate-800">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section id="platform" className="bg-slate-50 px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">How It Works</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">From mandate to impact in three steps</h2>
          </div>
          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connector line */}
            <div className="absolute left-[16.67%] right-[16.67%] top-10 hidden h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 md:block" />
            {[
              {
                n: "01",
                icon: Building2,
                title: "Corporate Posts Mandate",
                desc: "Define your CSR objectives, budget, project zones, and Schedule VII alignment. Our AI immediately begins matching your mandate to verified NGOs.",
              },
              {
                n: "02",
                icon: Sparkles,
                title: "NGOs Apply with AI Support",
                desc: "Verified NGOs submit proposals powered by our AI proposal reviewer. You receive ranked, compliance-checked applications with Trust Scores — not raw emails.",
              },
              {
                n: "03",
                icon: TrendingUp,
                title: "Platform Manages Everything",
                desc: "Milestones, fund tranches, compliance docs, impact reports, utilization certificates — automated end-to-end. Your Board Report writes itself.",
              },
            ].map((step) => (
              <div key={step.n} className="relative flex flex-col items-center text-center">
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                  <step.icon className="h-8 w-8" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-black text-emerald-700 shadow">
                    {step.n}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">Platform Features</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Built for the full CSR lifecycle
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
              Six enterprise-grade capabilities working together — none are bolt-ons.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className={`rounded-2xl border ${f.border} ${f.bg} p-6 transition hover:shadow-md`}>
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-sm`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-800">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Score Spotlight ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-600">The Trust Score Engine</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                The first real-time credibility score for Indian NGOs
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Every NGO on CorpoGN carries a live 0–100 Trust Score — calculated from 6 weighted dimensions. Corporates see it before committing. NGOs build it by taking action. Transparency drives accountability.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Compliance Documents",   pts: "55 pts", pct: 55, color: "bg-emerald-500" },
                  { label: "Project Performance",    pts: "15 pts", pct: 15, color: "bg-blue-500"    },
                  { label: "Beneficiary Data",       pts: "10 pts", pct: 10, color: "bg-violet-500"  },
                  { label: "Audit Reports",          pts: "10 pts", pct: 10, color: "bg-amber-500"   },
                  { label: "Platform Engagement",    pts: "10 pts", pct: 10, color: "bg-rose-500"    },
                ].map((d) => (
                  <div key={d.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>{d.label}</span>
                      <span className="text-slate-400">{d.pts}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white shadow-inner">
                      <div className={`h-2 rounded-full ${d.color}`} style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Trust score card */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700">Green Earth Foundation</p>
                    <p className="text-xs text-slate-400">NGO · Nashik, Maharashtra</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <Leaf className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div className="my-5 flex items-center justify-between">
                  <div>
                    <p className="text-5xl font-black text-emerald-600">84</p>
                    <p className="text-xs font-semibold text-slate-400">/ 100 Trust Score</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      ✓ Verified NGO
                    </span>
                    <p className="mt-2 text-xs text-slate-400">Updated 2 hrs ago</p>
                  </div>
                </div>
                {/* Score bar */}
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0</span><span className="text-emerald-600 font-bold">84</span><span>100</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: "84%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "12A + 80G + CSR-1",      done: true  },
                    { label: "FCRA Certificate",        done: true  },
                    { label: "FY25 Audit Report",       done: true  },
                    { label: "FY25 Annual Report",      done: false },
                    { label: "Past project data",       done: true  },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <div className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${item.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                        {item.done ? "✓" : "○"}
                      </div>
                      <span className={item.done ? "text-slate-700" : "text-slate-400"}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── For Corporates + For NGOs ───────────────────────────────────────── */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">Built for Both Sides</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">One platform. Two powerful experiences.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Corporates */}
            <div id="corporates" className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-slate-50 p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-500">For Corporates</p>
                  <h3 className="text-lg font-bold text-slate-800">CSR Compliance Command Centre</h3>
                </div>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                From mandate to Board Report — manage your entire CSR obligation in one place. Section 135, Schedule VII, and SDG alignment handled automatically.
              </p>
              <ul className="space-y-3">
                {CORPORATE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup?type=corporate"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95">
                Start for Corporates <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* NGOs */}
            <div id="ngos" className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">For NGOs</p>
                  <h3 className="text-lg font-bold text-slate-800">Your Complete Project Management Platform</h3>
                </div>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                Build credibility, win more mandates, and manage your entire team — Finance, Compliance, Operations, Field — from one role-based platform.
              </p>
              <ul className="space-y-3">
                {NGO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup?type=ngo"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95">
                Start Free as an NGO <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">Customer Stories</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Trusted by India&apos;s leading CSR teams
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <StarRating n={t.rating} />
                  <p className="mt-4 text-sm leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t.avatarColor} text-xs font-black text-white`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance Section ──────────────────────────────────────────────── */}
      <section id="compliance" className="px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">Built for India</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Full regulatory compliance.<br />Out of the box.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Every feature in CorpoGN is designed around Indian CSR law. Not retrofitted — built from the ground up for Section 135, Schedule VII, and SEBI norms.
              </p>
              <Link href="/compliance"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700">
                Read our compliance guide <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {COMPLIANCE.map((c) => (
                <div key={c.label} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">✓</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{c.label}</p>
                    <p className="text-xs text-slate-500">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-slate-50 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">Pricing</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-slate-500">
              NGOs are always free. Corporates pay for the infrastructure that makes CSR accountable.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PRICING.map((plan) => (
              <div key={plan.name} className={`relative flex flex-col rounded-2xl border p-8 transition ${
                plan.highlight
                  ? "border-emerald-500 bg-emerald-950 text-white shadow-xl shadow-emerald-900/30"
                  : "border-slate-200 bg-white"
              }`}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <p className={`text-xs font-bold uppercase tracking-widest ${plan.highlight ? "text-emerald-400" : "text-slate-400"}`}>{plan.name}</p>
                  <div className="mt-2 flex items-end gap-1">
                    <p className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.price}</p>
                    {plan.period && <p className={`pb-1 text-sm ${plan.highlight ? "text-emerald-300" : "text-slate-400"}`}>{plan.period}</p>}
                  </div>
                  <p className={`mt-2 text-sm ${plan.highlight ? "text-emerald-200" : "text-slate-500"}`}>{plan.desc}</p>
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-emerald-100" : "text-slate-700"}`}>
                      <CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 ${plan.highlight ? "text-emerald-400" : "text-emerald-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}
                  className={`rounded-xl px-5 py-3 text-center text-sm font-bold transition active:scale-95 ${
                    plan.highlight
                      ? "bg-emerald-500 text-white hover:bg-emerald-400"
                      : "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">
            All plans include GST. Annual billing only. Enterprise contracts available quarterly.
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">FAQ</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-slate-200 bg-white">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-sm font-semibold text-slate-800 marker:content-none">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <div className="border-t border-slate-100 px-6 py-4">
                  <p className="text-sm leading-relaxed text-slate-600">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 px-5 py-24 text-white">
        <div className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-emerald-500/10" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-teal-400/10" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-400">Get Started Today</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Ready to make every CSR rupee count?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-emerald-100/80 leading-relaxed">
            Join 500+ corporates and 1,200+ NGOs building a transparent, compliant, and impactful CSR ecosystem on CorpoGN.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup?type=corporate"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-emerald-900 shadow-lg transition hover:bg-emerald-50 active:scale-95">
              <Building2 className="h-4 w-4" />
              Start for Corporates — Free Trial
            </Link>
            <Link href="/signup?type=ngo"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/50 bg-emerald-800/40 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800/60 active:scale-95">
              <Leaf className="h-4 w-4" />
              Join as an NGO — It&apos;s Free
            </Link>
          </div>
          <p className="mt-5 text-xs text-emerald-500">
            No credit card · DPDP compliant · Hosted in India
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 px-5 py-16 text-slate-400">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-5">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Leaf className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold text-white">CorpoGN</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed">
                India&apos;s intelligent CSR marketplace. Connecting corporates with verified NGOs — with accountability built in.
              </p>
              <div className="mt-4 flex gap-3">
                <a href="https://twitter.com" aria-label="Twitter"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white">
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a href="https://linkedin.com" aria-label="LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-5 space-y-2 text-xs">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> hello@corpogn.in</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +91 98765 43210</div>
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Mumbai, India</div>
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "Platform",
                links: [
                  { label: "For Corporates", href: "#corporates" },
                  { label: "For NGOs", href: "#ngos" },
                  { label: "Trust Score", href: "#" },
                  { label: "Milestone Tracking", href: "#" },
                  { label: "Compliance Vault", href: "#" },
                  { label: "AI Matching", href: "#" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About Us", href: "/about" },
                  { label: "Blog", href: "/blog" },
                  { label: "Case Studies", href: "/cases" },
                  { label: "Careers", href: "/careers" },
                  { label: "Press", href: "/press" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Cookie Policy", href: "/cookies" },
                  { label: "DPDP Compliance", href: "/dpdp" },
                  { label: "Security", href: "/security" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-300">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm transition hover:text-white">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs sm:flex-row">
            <p>© 2026 CorpoGN. All rights reserved. Built in India 🇮🇳</p>
            <p>Section 135 · Schedule VII · SEBI CSR norms — fully compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
