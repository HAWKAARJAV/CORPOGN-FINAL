"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown, ChevronUp, Menu, X, ArrowRight, CheckCircle2,
  Building2, Leaf, Users, ShieldCheck, BarChart3, Target,
  Star, TrendingUp, Sparkles, Wallet, FileText, Globe,
  Phone, Mail, MapPin,
} from "lucide-react";

// ─── Nav data ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "About Us",   href: "#about" },
  {
    label: "Platform",
    href: "#platform",
    dropdown: [
      { label: "Trust Score Engine",    href: "#platform" },
      { label: "Fund Management",       href: "#platform" },
      { label: "Milestone Tracking",    href: "#platform" },
      { label: "AI Proposal Matching",  href: "#platform" },
      { label: "Compliance Vault",      href: "#platform" },
      { label: "Impact Analytics",      href: "#platform" },
    ],
  },
  { label: "Case Studies", href: "#testimonials" },
  { label: "Blog",         href: "#" },
  { label: "Contact Us",  href: "#contact" },
];

// ─── Page sections data ────────────────────────────────────────────────────────

const STATS = [
  { value: "₹5,000 Cr+", label: "CSR Fund Managed" },
  { value: "500+",        label: "Corporates Onboarded" },
  { value: "1,200+",     label: "NGOs Verified" },
  { value: "98%",         label: "Compliance Rate" },
];

const BRAND_NAMES = [
  "Tata Group", "Reliance Foundation", "Infosys CSR", "Mahindra",
  "Wipro", "HDFC", "L&T", "ITC Limited",
];

const SERVICES = [
  {
    icon: ShieldCheck,
    title: "CSR Compliance",
    desc: "Ensure full compliance with India's CSR regulations under the Companies Act. We help you align projects with Section 135 mandates, map activities to Schedule VII, integrate SDG goals, and maintain accurate audit trails. Our solution also supports Board Report formats, approval workflows, and real-time documentation.",
    href: "#compliance",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: Target,
    title: "CSR Marketplace",
    desc: "India's first live marketplace connecting corporate CSR mandates with verified NGOs. AI-powered proposal matching, Trust Score-ranked shortlisting, and a unified workspace for both parties — from proposal to final impact report.",
    href: "#marketplace",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: TrendingUp,
    title: "CSR Strategy",
    desc: "Our expert team helps you plan CSR strategies aligned with national priorities, SDGs, and compliance expectations. We co-create execution roadmaps for organisations at any stage of their CSR journey — from policy to field execution.",
    href: "#strategy",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: BarChart3,
    title: "CSR Impact Assessment",
    desc: "Understand how your CSR initiatives are truly changing lives. We offer end-to-end impact assessment — combining field data, beneficiary feedback, and performance metrics — to evaluate outcomes against your CSR goals and SDGs.",
    href: "#impact",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
];

const AUDIENCES = [
  {
    icon: Building2,
    title: "For Corporates",
    desc: "We provide an intelligent CSR management platform to help corporates plan, manage, and monitor their social initiatives. From proposal to impact — with Section 135 compliance built in, and real-time visibility into every NGO partner.",
    color: "border-l-blue-600",
    iconBg: "bg-blue-600",
  },
  {
    icon: Leaf,
    title: "For NGOs",
    desc: "Build credibility with a live Trust Score. Win more mandates from 500+ corporate partners. Manage your Finance, Compliance, Operations, and Field teams from one role-based platform — and get paid automatically when milestones are approved.",
    color: "border-l-emerald-600",
    iconBg: "bg-emerald-600",
  },
  {
    icon: Globe,
    title: "For PSUs",
    desc: "CorpoGN helps PSUs meet mandatory CSR obligations through a purpose-built platform for project tracking, fund monitoring, and Schedule VII-aligned reporting — with audit-ready documentation at every step.",
    color: "border-l-amber-600",
    iconBg: "bg-amber-600",
  },
  {
    icon: Users,
    title: "For Government Bodies",
    desc: "Our CSR platform & services help government departments evaluate the scale and quality of CSR investments across districts, sectors, or states — with real-time dashboards and standardised impact data.",
    color: "border-l-violet-600",
    iconBg: "bg-violet-600",
  },
];

const TESTIMONIALS = [
  {
    name: "Niloy Mitter",
    org: "Tata Steel Rural Development Society",
    text: "We would like to certify that CorpoGN has been an excellent technology partner for our CSR initiatives. The milestone tracking, fund management, and compliance documentation features have transformed the way we manage our social programmes across zones.",
    avatar: "NM",
    color: "bg-blue-600",
  },
  {
    name: "Anurag Mishra",
    org: "Cipla Foundation",
    text: "We associated with CorpoGN to manage our CSR activities through a technology interface. We are happy with the platform provided by the team, including the prompt support for any amendments. The NGO Trust Score is a game-changer for due diligence.",
    avatar: "AM",
    color: "bg-emerald-600",
  },
  {
    name: "Prasann Thatte",
    org: "Reliance Foundation",
    text: "As a foundation with strong governance requirements, CorpoGN is a valued partner in our journey towards increasingly digitising the way we store, analyse and report CSR information. The milestone-gated fund release has brought complete accountability.",
    avatar: "PT",
    color: "bg-violet-600",
  },
  {
    name: "Ravindranath",
    org: "General Manager, Charutar Arogya Mandal",
    text: "The compliance vault and role-based dashboards have been successfully implemented for our field operations. Our finance officer, compliance team, and field coordinators all work from one unified platform for the first time.",
    avatar: "RV",
    color: "bg-amber-600",
  },
  {
    name: "Oleg Bazaleev",
    org: "Social Performance Manager, Crescent Petroleum",
    text: "I'd like to thank the CorpoGN team for their commitment and diligence. The reporting features and audit trail have been highly appreciated by our board. The platform's Section 135 alignment made our annual report significantly easier to prepare.",
    avatar: "OB",
    color: "bg-rose-600",
  },
];

const FAQS = [
  {
    q: "How do I get started with CorpoGN?",
    a: "Reach out for a free demo or consultation via our Contact Us page. For NGOs, you can register directly for free. For corporates, our team will walk you through your CSR mandate requirements and configure the platform for your organisation's structure.",
  },
  {
    q: "How does CorpoGN support CSR activities for organizations?",
    a: "CorpoGN provides end-to-end CSR management — from NGO discovery and proposal evaluation, to fund disbursement, milestone tracking, impact reporting, and Board Report generation. Every touchpoint in the CSR lifecycle is covered within one unified platform.",
  },
  {
    q: "Is your CSR platform aligned with Indian CSR rules?",
    a: "Yes — CorpoGN is built ground-up for Section 135 of the Companies Act 2013, Schedule VII activity mapping, SDG alignment documentation, SEBI CSR disclosures, and MCA CSR-1/CSR-2 filing support. All data is audit-logged and CA/CS verifiable.",
  },
  {
    q: "What makes CorpoGN different from other CSR platforms?",
    a: "CorpoGN is India's only CSR marketplace with a live NGO Trust Score engine, milestone-gated fund disbursement, and role-based team management for NGOs — all in one platform. Most platforms offer reporting tools; we offer accountability infrastructure that protects both corporates and NGOs.",
  },
  {
    q: "Is CorpoGN suitable for PSUs and government bodies?",
    a: "Absolutely. Our Enterprise plan includes government-specific reporting formats, district-level aggregation, API integration with government CSR portals, and custom workflows for PSU governance requirements.",
  },
  {
    q: "Does CorpoGN offer mobile access for CSR project tracking?",
    a: "Yes — field coordinators, beneficiary form collectors, and operations managers have dedicated mobile-optimised views for their dashboards. Media upload, attendance, and beneficiary data can all be captured from the field on any device.",
  },
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-base font-semibold text-slate-800 hover:text-emerald-700 transition"
      >
        {q}
        {open
          ? <ChevronUp className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          : <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400" />
        }
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed text-slate-600">{a}</p>
      )}
    </div>
  );
}

function NavDropdown({ items }: { items: { label: string; href: string }[] }) {
  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-100 bg-white py-2 shadow-xl">
      {items.map((i) => (
        <a key={i.label} href={i.href}
          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition">
          {i.label}
        </a>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const visibleTestimonials = TESTIMONIALS.slice(testimonialIdx, testimonialIdx + 3);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-emerald-900 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
              <Leaf className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">CorpoGN</span>
              <span className="ml-2 hidden rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white sm:inline">
                Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <div key={link.label} className="relative"
                onMouseEnter={() => link.dropdown && setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}>
                <a href={link.href}
                  className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-800 hover:text-white">
                  {link.label}
                  {link.dropdown && <ChevronDown className="h-3.5 w-3.5" />}
                </a>
                {link.dropdown && openDropdown === link.label && (
                  <NavDropdown items={link.dropdown} />
                )}
              </div>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/signin"
              className="text-sm font-semibold text-emerald-200 transition hover:text-white">
              Sign In
            </Link>
            <Link href="/signup"
              className="rounded-lg bg-white px-5 py-2 text-sm font-bold text-emerald-800 shadow transition hover:bg-emerald-50 active:scale-95">
              Request a Demo
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-white transition hover:bg-emerald-800 lg:hidden">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-emerald-800 bg-emerald-900 px-5 pb-4 lg:hidden">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-medium text-emerald-100 hover:text-white border-b border-emerald-800">
                {l.label}
              </a>
            ))}
            <div className="mt-4 flex gap-3">
              <Link href="/signin" className="flex-1 rounded-lg border border-emerald-700 py-2 text-center text-sm font-semibold text-white">Sign In</Link>
              <Link href="/signup" className="flex-1 rounded-lg bg-white py-2 text-center text-sm font-bold text-emerald-800">Request Demo</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-5 py-20 text-white lg:py-28">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-0 h-[300px] w-[300px] rounded-full bg-teal-400/10 blur-2xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: copy */}
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-700 bg-emerald-800/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                India&apos;s Trusted CSR Marketplace
              </p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl xl:text-6xl">
                Leading the Future of{" "}
                <span className="text-emerald-300">Corporate Social Responsibility</span>{" "}
                in India
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-emerald-100/80">
                End-to-End CSR Management Software &amp; Marketplace to Maximise Your Social Impact — with full Section 135 compliance, NGO Trust Scores, and milestone-gated fund accountability.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-emerald-900 shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-50 active:scale-95">
                  Schedule a Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#about"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-600/50 bg-emerald-800/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800/60 active:scale-95">
                  Learn More
                </Link>
              </div>

              {/* Inline stats */}
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {STATS.map((s) => (
                  <div key={s.label} className="rounded-xl border border-emerald-700/40 bg-emerald-800/30 p-3 text-center">
                    <p className="text-2xl font-extrabold text-white">{s.value}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-emerald-300">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: platform preview */}
            <div className="relative hidden lg:block">
              <div className="overflow-hidden rounded-2xl border border-emerald-700/30 bg-emerald-900/60 shadow-2xl backdrop-blur-sm">
                {/* Window chrome */}
                <div className="flex items-center gap-2 border-b border-emerald-800/50 bg-emerald-950/50 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-400/70" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/70" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/70" />
                  <span className="ml-3 text-xs text-emerald-500">app.corpogn.in/corporate/dashboard</span>
                </div>
                {/* KPI row */}
                <div className="grid grid-cols-2 gap-3 p-4">
                  {[
                    { label: "Active Projects",  value: "12",       color: "text-emerald-300", bg: "bg-emerald-800/40" },
                    { label: "CSR Fund Managed", value: "₹4.2 Cr",  color: "text-blue-300",    bg: "bg-blue-900/30"    },
                    { label: "NGO Partners",     value: "28",       color: "text-violet-300",  bg: "bg-violet-900/30"  },
                    { label: "Avg Trust Score",  value: "82 / 100", color: "text-amber-300",   bg: "bg-amber-900/30"   },
                  ].map((k) => (
                    <div key={k.label} className={`rounded-xl ${k.bg} p-4`}>
                      <p className="text-[10px] text-emerald-400/60">{k.label}</p>
                      <p className={`mt-1 text-xl font-bold ${k.color}`}>{k.value}</p>
                    </div>
                  ))}
                </div>
                {/* Project bars */}
                <div className="px-4 pb-4 space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-3">Milestone Progress — Q2 FY 2026</p>
                  {[
                    { label: "Digital Literacy Drive — Tata CSR",  pct: 62, color: "bg-emerald-400" },
                    { label: "Clean Water Initiative — Infosys",   pct: 45, color: "bg-blue-400"    },
                    { label: "Women Empowerment — Mahindra",       pct: 88, color: "bg-violet-400"  },
                  ].map((p) => (
                    <div key={p.label} className="space-y-1">
                      <div className="flex justify-between text-[11px] text-emerald-300/70">
                        <span>{p.label}</span><span>{p.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-emerald-800">
                        <div className={`h-1.5 rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-6 rounded-2xl border border-emerald-700/30 bg-emerald-950/90 p-3 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-400">Trust Score Updated</p>
                    <p className="text-sm font-bold text-white">Green Earth NGO — 84/100</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Logos ─────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-slate-50 px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-7 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
            Empowering CSR Journeys for Leading Brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {BRAND_NAMES.map((b) => (
              <div key={b} className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 shadow-sm">
                <p className="text-sm font-bold text-slate-500">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About / What is CorpoGN ─────────────────────────────────────────── */}
      <section id="about" className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Visual side */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-8">
                <p className="mb-6 text-xs font-bold uppercase tracking-widest text-emerald-600">Platform at a glance</p>
                <div className="space-y-4">
                  {[
                    { icon: Target,     label: "NGO Discovery & AI Matching",       val: "48h average shortlist time"    },
                    { icon: Star,       label: "Live NGO Trust Score (0–100)",      val: "Built from 6 compliance factors" },
                    { icon: Wallet,     label: "Milestone-gated Fund Disbursement", val: "Zero manual bank runs"           },
                    { icon: ShieldCheck,label: "Compliance Vault",                  val: "12A, 80G, FCRA, CSR-1 certified" },
                    { icon: BarChart3,  label: "Real-time Impact Analytics",        val: "SDG-mapped, audit-ready"         },
                    { icon: Users,      label: "Role-based NGO Team Dashboards",    val: "6 specialised dashboards"        },
                  ].map((f) => (
                    <div key={f.label} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white p-3.5 shadow-sm">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                        <f.icon className="h-4 w-4 text-emerald-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                        <p className="text-xs text-slate-500">{f.val}</p>
                      </div>
                      <CheckCircle2 className="ml-auto h-4 w-4 flex-shrink-0 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Text side */}
            <div className="order-1 lg:order-2">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">What is CorpoGN?</p>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                India&apos;s leading CSR Marketplace &amp; Management Platform
              </h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-600">
                <p>
                  CorpoGN is India&apos;s first intelligent CSR marketplace, trusted by 500+ corporates, NGOs, PSUs, and government bodies. Built on over 5 years of deep domain expertise in enterprise CSR software and social impact solutions, we specialise in building accountable, compliant, and data-driven CSR ecosystems.
                </p>
                <p>
                  We offer an end-to-end CSR management platform — covering NGO discovery with AI-powered proposal matching, a real-time Trust Score engine for NGO credibility, milestone-gated fund disbursement, and strategic impact reporting. Every module is aligned with Schedule VII, India&apos;s SDG priorities, and national CSR compliance frameworks.
                </p>
                <p>
                  Our platform is built for the full CSR lifecycle — so corporates, NGOs, PSUs, and government bodies can all work from one unified ecosystem aligned with accountability and real impact.
                </p>
              </div>
              <Link href="/signup"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-emerald-700 active:scale-95">
                Schedule a Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Platform Modules ────────────────────────────────────────────── */}
      <section id="platform" className="bg-slate-50 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">Our Platform</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything you need for end-to-end CSR management
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
              Trusted by India&apos;s leading corporates and NGOs — from mandate to impact report.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <div key={s.title}
                className={`group rounded-2xl border ${s.border} bg-white p-7 shadow-sm transition hover:shadow-md`}>
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${s.bg} border ${s.border}`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{s.desc}</p>
                <a href={s.href}
                  className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${s.color} transition hover:underline`}>
                  View Details <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Designed For ────────────────────────────────────────────────────── */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">Who We Serve</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Designed for Your CSR Initiatives
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a) => (
              <div key={a.title}
                className={`rounded-2xl border border-l-4 ${a.color} border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md`}>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${a.iconBg} text-white shadow-sm`}>
                  <a.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-slate-800">{a.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Customer Stories ─────────────────────────────────────────────────── */}
      <section id="testimonials" className="bg-slate-50 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">Customer Stories</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Step into the world of CorpoGN
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-slate-500">
              Explore stories from our clients and learn how CorpoGN has transformed their path to responsible and impactful CSR.
            </p>
          </div>

          {/* Testimonial cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {visibleTestimonials.map((t) => (
              <div key={t.name} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* Quote marks */}
                <div>
                  <p className="mb-1 text-4xl font-black leading-none text-emerald-200">&ldquo;</p>
                  <p className="text-sm leading-relaxed text-slate-700">{t.text}</p>
                </div>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${t.color} text-xs font-black text-white`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.org}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setTestimonialIdx(Math.max(0, testimonialIdx - 1))}
              disabled={testimonialIdx === 0}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-600 hover:text-emerald-700 disabled:opacity-40">
              ← Prev
            </button>
            {TESTIMONIALS.map((_, i) => (
              i <= TESTIMONIALS.length - 3 && (
                <button key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`h-2.5 w-2.5 rounded-full transition ${testimonialIdx === i ? "bg-emerald-600" : "bg-slate-300 hover:bg-slate-400"}`}
                />
              )
            ))}
            <button
              onClick={() => setTestimonialIdx(Math.min(TESTIMONIALS.length - 3, testimonialIdx + 1))}
              disabled={testimonialIdx >= TESTIMONIALS.length - 3}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-600 hover:text-emerald-700 disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">FAQ</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-6 shadow-sm">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>

          {/* FAQ CTA */}
          <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
            <h4 className="text-base font-bold text-slate-800">Still have questions about CSR Management?</h4>
            <p className="mt-1 text-sm text-slate-600">We&apos;re here to help you plan smarter, track better, and report faster. Let&apos;s talk about how CorpoGN can support your goals.</p>
            <Link href="#contact"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:bg-emerald-700 active:scale-95">
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pre-footer CTA ───────────────────────────────────────────────────── */}
      <section id="contact" className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 px-5 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-400">Get Started</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Ready to Make Your CSR Impact Count?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-emerald-100/80">
            Let&apos;s build a transparent, effective, and sustainable CSR ecosystem — together.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-emerald-900 shadow-lg transition hover:bg-emerald-50 active:scale-95 sm:w-auto">
              Talk to our CSR Experts
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/50 bg-emerald-800/30 px-8 py-4 text-sm font-bold text-white transition hover:bg-emerald-800/60 active:scale-95 sm:w-auto">
              <FileText className="h-4 w-4" />
              Brochure Download
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 px-5 pt-16 pb-8 text-slate-400">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                  <Leaf className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-extrabold text-white">CorpoGN</span>
              </div>
              <p className="text-sm leading-relaxed mb-5">
                India&apos;s intelligent CSR marketplace — connecting corporates with verified NGOs for accountable, compliant, and measurable social impact.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Mumbai, Maharashtra, India</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +91 98765 43210</div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> hello@corpogn.in</div>
              </div>
            </div>

            {/* About CorpoGN */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-300">About CorpoGN</p>
              <ul className="space-y-2.5 text-sm">
                {["About Us", "CorpoGN Platform", "Blog", "Case Studies", "Contact Us", "Privacy Policy"].map((l) => (
                  <li key={l}><a href="#" className="transition hover:text-white">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Our Services */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-300">Our Services</p>
              <ul className="space-y-2.5 text-sm">
                {["CSR Marketplace", "CSR Impact Assessment", "CSR Compliance", "CSR Strategy", "Corporate Volunteering"].map((l) => (
                  <li key={l}><a href="#" className="transition hover:text-white">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* About CyberSWIFT equivalent */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-300">Company</p>
              <p className="text-sm leading-relaxed mb-4">
                CorpoGN is a purpose-built CSR technology company, ISO 27001:2022 certified, with a focus on delivering enterprise-grade CSR management solutions to corporates, NGOs, PSUs, and government bodies across India.
              </p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-md border border-slate-700 px-2.5 py-1 text-[10px] font-semibold text-slate-400">ISO 27001:2022</span>
                <span className="rounded-md border border-slate-700 px-2.5 py-1 text-[10px] font-semibold text-slate-400">Sec 135 ✓</span>
                <span className="rounded-md border border-slate-700 px-2.5 py-1 text-[10px] font-semibold text-slate-400">DPDP ✓</span>
              </div>
              <p className="mt-5 text-xs text-slate-500">Follow us on</p>
              <div className="mt-2 flex gap-2">
                <a href="#" className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-emerald-700 hover:text-white">LinkedIn</a>
                <a href="#" className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-emerald-700 hover:text-white">Twitter</a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-7 text-xs sm:flex-row">
            <p>© Copyright CorpoGN. All Rights Reserved. Built in India 🇮🇳</p>
            <p>Powered by CorpoGN Technologies Pvt. Ltd.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
