"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { loadState, saveState, computeTrustScore, type NgoSharedState } from "@/lib/ngo-store";
import {
  LayoutDashboard, Building2, ShieldCheck, Star, Sparkles, Settings,
  Lock, Briefcase, MessageSquare, Wallet, BarChart3, FileText, Users,
  UserPlus, LogOut, CheckCircle2, AlertCircle, Clock, TrendingUp,
  Globe, Award, Eye, Upload, Camera, Bell, Target, ClipboardList,
  MapPin, Calendar, Heart, Leaf, ArrowUpRight, X, Pencil,
} from "lucide-react";
import { getRoleLabel, NGO_ROLES, ROLE_SIDEBAR_ACCESS } from "@/lib/ngo";
import type { NgoRole } from "@/lib/ngo";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ngo {
  id: string; slug: string; ngo_name: string;
  ngo_email: string; access_status: string;
  has_project: boolean; trust_score: number;
}
interface Member {
  id: string; email: string; full_name: string;
  role: string; is_active: boolean; created_at: string;
}
type SidebarItem = {
  id: string; label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresProject?: boolean; requiresVerified?: boolean;
  superAdminOnly?: boolean; locked?: boolean;
};

// ─── Sidebar config ───────────────────────────────────────────────────────────

const ALL_SIDEBAR_ITEMS: SidebarItem[] = [
  // Super Admin — Overview
  { id: "command-center",           label: "Command Center",          icon: LayoutDashboard, superAdminOnly: true },
  { id: "ngo-profile",              label: "NGO Profile",             icon: Building2,       superAdminOnly: true },
  // Super Admin — Compliance & Trust
  { id: "compliance-vault",         label: "Compliance Vault",        icon: ShieldCheck },
  { id: "trust-score",              label: "Trust Score",             icon: Star,            superAdminOnly: true },
  { id: "ai-proposal",              label: "AI Proposal Reviewer",    icon: Sparkles,        superAdminOnly: true },
  // Super Admin — Opportunities (locked until verified)
  { id: "opportunities",            label: "Opportunities",           icon: Globe,           requiresVerified: true },
  { id: "corporate-funders",        label: "Corporate Funders",       icon: Briefcase,       requiresVerified: true },
  { id: "proposals",                label: "Proposals",               icon: FileText,        requiresVerified: true },
  { id: "corporate-partnerships",   label: "Corporate Partnerships",  icon: Briefcase,       superAdminOnly: true },
  // Super Admin — Project Work (locked until project assigned)
  { id: "my-projects",              label: "My Projects",             icon: Target,          requiresProject: true },
  { id: "project-chat",             label: "Project Chat",            icon: MessageSquare,   requiresProject: true },
  { id: "fund-tracking",            label: "Fund Tracking",           icon: Wallet,          requiresProject: true },
  { id: "milestone-reporting",      label: "Milestone Reporting",     icon: BarChart3,       requiresProject: true },
  { id: "impact-reporting",         label: "Impact Reporting",        icon: TrendingUp,      requiresProject: true },
  { id: "utilization-cert",         label: "Utilization Certificate", icon: Award,           requiresProject: true },
  // Super Admin — Reports & Admin
  { id: "reports",                  label: "Reports",                 icon: FileText,        superAdminOnly: true },
  { id: "audit-logs",               label: "Audit Logs",              icon: ClipboardList,   superAdminOnly: true },
  { id: "team-management",          label: "Team Management",         icon: UserPlus,        superAdminOnly: true },
  { id: "settings",                 label: "Settings",                icon: Settings,        superAdminOnly: true },

  // Finance Officer
  { id: "funds",                    label: "Funds",                   icon: Wallet },
  { id: "expenses",                 label: "Expenses",                icon: ArrowUpRight },
  { id: "invoices",                 label: "Invoices",                icon: FileText },
  { id: "utilization-reports",      label: "Utilization Reports",     icon: BarChart3 },
  { id: "grant-tracking",           label: "Grant Tracking",          icon: Target },
  { id: "finance-analytics",        label: "Finance Analytics",       icon: TrendingUp },

  // Compliance Officer
  { id: "legal-documents",          label: "Legal Documents",         icon: ShieldCheck },
  { id: "ngo-verification",         label: "NGO Verification",        icon: CheckCircle2 },
  { id: "audit-requests",           label: "Audit Requests",          icon: ClipboardList },
  { id: "compliance-workflow",      label: "Compliance Workflow",     icon: Eye },

  // Operations Manager
  { id: "projects",                 label: "Projects",                icon: Target },
  { id: "milestones",               label: "Milestones",              icon: BarChart3 },
  { id: "beneficiary-tracking",     label: "Beneficiary Tracking",    icon: Users },
  { id: "task-assignment",          label: "Task Assignment",         icon: ClipboardList },
  { id: "partnership-communication",label: "Partnership Comms",       icon: MessageSquare },
  { id: "report-drafts",            label: "Report Drafts",           icon: FileText },

  // Field Coordinator
  { id: "assigned-projects",        label: "Assigned Projects",       icon: MapPin },
  { id: "beneficiary-forms",        label: "Beneficiary Forms",       icon: ClipboardList },
  { id: "field-updates",            label: "Field Updates",           icon: Camera },
  { id: "media-uploads",            label: "Media Uploads",           icon: Upload },
  { id: "attendance",               label: "Attendance",              icon: Calendar },

  // Reporting Executive
  { id: "impact-reports",           label: "Impact Reports",          icon: TrendingUp },
  { id: "media-library",            label: "Media Library",           icon: Camera },
  { id: "analytics-view",           label: "Analytics View",          icon: BarChart3 },
  { id: "presentations",            label: "Presentations",           icon: Eye },

  // Volunteer
  { id: "assigned-tasks",           label: "Assigned Tasks",          icon: ClipboardList },
  { id: "event-participation",      label: "Event Participation",     icon: Heart },
  { id: "uploads",                  label: "Uploads",                 icon: Upload },
];

// Which items each non-admin role can see
// (project-unlocked items are added at runtime when has_project = true)
const ROLE_SIDEBAR_IDS: Record<Exclude<NgoRole, "super_admin">, { base: string[]; withProject: string[] }> = {
  finance_officer: {
    base:        ["funds", "expenses", "invoices", "utilization-reports", "grant-tracking", "finance-analytics"],
    withProject: ["fund-tracking", "utilization-cert"],
  },
  compliance_officer: {
    base:        ["compliance-vault", "legal-documents", "ngo-verification", "audit-requests", "compliance-workflow"],
    withProject: ["utilization-cert"],
  },
  operations_manager: {
    base:        ["projects", "milestones", "beneficiary-tracking", "task-assignment", "partnership-communication", "report-drafts"],
    withProject: ["my-projects", "milestone-reporting"],
  },
  field_coordinator: {
    base:        ["assigned-projects", "beneficiary-forms", "field-updates", "media-uploads", "attendance"],
    withProject: ["my-projects", "milestone-reporting"],
  },
  reporting_executive: {
    base:        ["impact-reports", "media-library", "analytics-view", "presentations"],
    withProject: ["impact-reporting"],
  },
  volunteer: {
    base:        ["assigned-tasks", "event-participation", "uploads"],
    withProject: [],
  },
};

// Default landing section per role
const ROLE_DEFAULT_SECTION: Record<NgoRole, string> = {
  super_admin:         "command-center",
  finance_officer:     "funds",
  compliance_officer:  "compliance-vault",
  operations_manager:  "projects",
  field_coordinator:   "assigned-projects",
  reporting_executive: "impact-reports",
  volunteer:           "assigned-tasks",
};

// Groups — order controls sidebar visual order; unused groups auto-hide
const SIDEBAR_GROUPS = [
  { label: "Overview",       ids: ["command-center", "ngo-profile"] },
  { label: "Compliance",     ids: ["compliance-vault", "trust-score", "ai-proposal", "legal-documents", "ngo-verification", "audit-requests", "compliance-workflow"] },
  { label: "Opportunities",  ids: ["opportunities", "corporate-funders", "proposals", "corporate-partnerships"] },
  { label: "Finance",        ids: ["funds", "expenses", "invoices", "utilization-reports", "grant-tracking", "finance-analytics"] },
  { label: "Operations",     ids: ["projects", "milestones", "beneficiary-tracking", "task-assignment", "partnership-communication", "report-drafts"] },
  { label: "Field Work",     ids: ["assigned-projects", "beneficiary-forms", "field-updates", "media-uploads", "attendance", "assigned-tasks", "event-participation", "uploads"] },
  { label: "Project Work",   ids: ["my-projects", "project-chat", "fund-tracking", "milestone-reporting", "impact-reporting", "utilization-cert"] },
  { label: "Reporting",      ids: ["impact-reports", "media-library", "analytics-view", "presentations", "reports", "audit-logs"] },
  { label: "Team & Admin",   ids: ["team-management", "settings"] },
];

// ─── Design tokens ────────────────────────────────────────────────────────────

const btn       = "inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
const btnOutline= "inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 active:scale-95";
const btnGhost  = "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 active:scale-95";
const inputCls  = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const cardCls   = "rounded-2xl border border-slate-100 bg-white shadow-sm";

// ─── Shared components ────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { label: string; cls: string }> = {
    pending:  { label: "Pending Verification", cls: "bg-amber-100 text-amber-800 border-amber-200" },
    verified: { label: "Verified ✓",           cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    active:   { label: "Active ✓",             cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  };
  const b = m[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 border-slate-200" };
  return <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${b.cls}`}>{b.label}</span>;
}

function TrustBar({ score }: { score: number }) {
  const c = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div data-testid="trust-bar-fill" className={`${c} h-2 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, color = "emerald" }: {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: "emerald" | "amber" | "blue" | "violet" | "rose";
}) {
  const p: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber:   "bg-amber-50 text-amber-600",
    blue:    "bg-blue-50 text-blue-600",
    violet:  "bg-violet-50 text-violet-600",
    rose:    "bg-rose-50 text-rose-600",
  };
  return (
    <div className={`${cardCls} p-5`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${p[color]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Alert({ type, title, body }: { type: "warn" | "info" | "success"; title: string; body: string }) {
  const s = {
    warn:    { wrap: "border-amber-200 bg-amber-50",   icon: "text-amber-500",   title: "text-amber-900",   body: "text-amber-700",   Icon: AlertCircle  },
    info:    { wrap: "border-blue-200 bg-blue-50",     icon: "text-blue-500",    title: "text-blue-900",    body: "text-blue-700",    Icon: Bell         },
    success: { wrap: "border-emerald-200 bg-emerald-50",icon: "text-emerald-500",title: "text-emerald-900", body: "text-emerald-700", Icon: CheckCircle2 },
  }[type];
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 ${s.wrap}`}>
      <s.Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${s.icon}`} />
      <div>
        <p className={`text-sm font-semibold ${s.title}`}>{title}</p>
        <p className={`mt-0.5 text-sm ${s.body}`}>{body}</p>
      </div>
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

const DOC_TYPES = [
  { id: "certificate12a",          label: "12A Certificate",       mandatory: true  },
  { id: "certificate80g",          label: "80G Certificate",       mandatory: true  },
  { id: "csr1Certificate",         label: "CSR-1 Registration",    mandatory: true  },
  { id: "fcraCertificate",         label: "FCRA License",          mandatory: false },
  { id: "annualReport",            label: "Annual Report",         mandatory: true  },
  { id: "auditReport",             label: "Audit Report",          mandatory: true  },
];

function UploadModal({
  open, defaultDocType, onClose, onSuccess,
}: {
  open: boolean; defaultDocType?: string;
  onClose: () => void; onSuccess: (docLabel: string) => void;
}) {
  const [docType, setDocType] = useState(defaultDocType ?? "");
  const [file, setFile]       = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) setDocType(defaultDocType ?? ""); }, [open, defaultDocType]);

  async function handleUpload() {
    setError("");
    if (!docType) { setError("Please select a document type."); return; }
    if (!file)    { setError("Please choose a file."); return; }
    setUploading(true);
    // Simulate upload (wire to Supabase Storage when ready)
    await new Promise((r) => setTimeout(r, 900));
    setUploading(false);
    const label = DOC_TYPES.find((d) => d.id === docType)?.label ?? docType;
    onSuccess(label);
    setFile(null);
    setDocType("");
    fileRef.current && (fileRef.current.value = "");
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" data-testid="upload-modal">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="font-bold text-slate-900">Upload Compliance Document</p>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Document Type *
            <select
              data-testid="doc-type-select"
              className={inputCls}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="">Select document type</option>
              {DOC_TYPES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}{d.mandatory ? " *" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Choose File (PDF / Image) *
            <input
              data-testid="doc-file-input"
              ref={fileRef}
              type="file"
              accept=".pdf,image/*"
              className={inputCls + " py-2"}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="flex gap-3 pt-1">
            <button onClick={handleUpload} disabled={uploading} className={btn + " flex-1"} data-testid="upload-submit-btn">
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
            <button onClick={onClose} className={btnOutline}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Command Center ──────────────────────────────────────────────────

function CommandCenterSection({
  ngo, onNavigate, uploadedCount, liveTrustScore,
}: {
  ngo: Ngo; onNavigate: (id: string) => void;
  uploadedCount: number; liveTrustScore: number;
}) {
  const isVerified = ngo.access_status === "verified" || ngo.access_status === "active";
  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-md">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-200 text-sm font-medium mb-1">
            <Leaf className="h-4 w-4" /> NGO Command Center
          </div>
          <h2 className="text-2xl font-bold">{ngo.ngo_name}</h2>
          <p className="mt-1 text-emerald-100 text-sm">
            {ngo.access_status === "pending"
              ? "Your verification is in progress."
              : ngo.has_project
              ? "You have an active CSR project."
              : "Verified — apply for CSR opportunities."}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <StatusBadge status={ngo.access_status} />
            <span className="text-xs text-emerald-200">Trust Score: {ngo.trust_score}/100</span>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -right-2 bottom-0 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* Status alert */}
      {ngo.access_status === "pending" && (
        <Alert type="warn" title="Verification Pending"
          body="Your NGO is under review. Upload compliance documents to speed up the process." />
      )}
      {isVerified && !ngo.has_project && (
        <Alert type="info" title="Ready to Apply"
          body="You're verified! Browse Opportunities to submit proposals and get a CSR project assigned." />
      )}
      {ngo.has_project && (
        <Alert type="success" title="Project Active"
          body="You have an active CSR project. Track milestones and submit reports from the sidebar." />
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Trust Score" value={`${liveTrustScore}/100`} icon={Star} color="amber"
          sub={liveTrustScore >= 70 ? "High trust" : liveTrustScore >= 40 ? "Medium trust" : "Upload docs"} />
        <KpiCard label="Active Projects" value={ngo.has_project ? "1" : "0"} icon={Target} color="emerald" />
        <KpiCard label="Docs Uploaded" value={`${uploadedCount} / 6`} icon={ShieldCheck} color="blue" sub="Upload to boost score" />
        <KpiCard label="Team Members" value="0" icon={Users} color="violet" sub="Manage via Role Assignment" />
      </div>

      {/* Trust score */}
      <div className={`${cardCls} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" /> Trust Score
          </p>
          <span className={`text-sm font-bold ${liveTrustScore >= 70 ? "text-emerald-600" : liveTrustScore >= 40 ? "text-amber-600" : "text-red-500"}`}>
            {liveTrustScore} / 100
          </span>
        </div>
        <TrustBar score={liveTrustScore} />
        <div className="mt-3 flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />0–39 Low</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />40–69 Med</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />70+ High</span>
        </div>
      </div>

      {/* Quick Actions — all navigating to real sections */}
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-700">Quick Actions</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Upload Compliance Docs", desc: "Boost trust score",       icon: Upload,   target: "compliance-vault",   color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100", testId: "qa-upload-docs"    },
            { label: "Edit NGO Profile",        desc: "Keep info up to date",   icon: Building2,target: "ngo-profile",        color: "bg-blue-50 border-blue-200 hover:bg-blue-100",           testId: "qa-edit-profile"   },
            { label: "AI Proposal Tips",        desc: "Improve your proposals", icon: Sparkles, target: "ai-proposal",        color: "bg-violet-50 border-violet-200 hover:bg-violet-100",     testId: "qa-ai-proposal"    },
            { label: "Assign Team Roles",       desc: "Add team members",       icon: UserPlus, target: "role-assignment",    color: "bg-amber-50 border-amber-200 hover:bg-amber-100",        testId: "qa-assign-roles"   },
          ].map((a) => (
            <button
              key={a.label}
              data-testid={a.testId}
              onClick={() => onNavigate(a.target)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${a.color}`}
            >
              <a.icon className="h-5 w-5 text-slate-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{a.label}</p>
                <p className="text-xs text-slate-500">{a.desc}</p>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section: NGO Profile ─────────────────────────────────────────────────────

function NgoProfileSection({
  ngo, onNavigate,
}: {
  ngo: Ngo; onNavigate: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ngo_name: ngo.ngo_name, ngo_email: ngo.ngo_email });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // Optimistic UI — wire to API when ready
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="NGO Profile" sub="Your public identity on the CorpoGN platform." />

      <div className={`${cardCls} overflow-hidden`}>
        <div className="h-20 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <div className="px-6 pb-6">
          <div className="-mt-8 flex items-end justify-between gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-emerald-600 text-2xl font-bold text-white shadow-md">
              {ngo.ngo_name.charAt(0)}
            </div>
            <button
              data-testid="edit-profile-btn"
              onClick={() => setEditing(true)}
              className={btnOutline}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit Profile
            </button>
          </div>
          {saved && (
            <p className="mt-3 text-xs font-semibold text-emerald-600">✓ Changes saved</p>
          )}
          {editing ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                NGO Name
                <input data-testid="profile-name-input" className={inputCls} value={form.ngo_name}
                  onChange={(e) => setForm((p) => ({ ...p, ngo_name: e.target.value }))} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Contact Email
                <input data-testid="profile-email-input" type="email" className={inputCls} value={form.ngo_email}
                  onChange={(e) => setForm((p) => ({ ...p, ngo_email: e.target.value }))} />
              </label>
              <div className="sm:col-span-2 flex gap-3">
                <button data-testid="save-profile-btn" onClick={handleSave} className={btn}>Save Changes</button>
                <button onClick={() => setEditing(false)} className={btnOutline}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{form.ngo_name}</h3>
              <p className="text-sm text-slate-500">{form.ngo_email}</p>
              <div className="mt-2"><StatusBadge status={ngo.access_status} /></div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard label="Trust Score"          value={`${ngo.trust_score} / 100`}                  icon={Star}        color="amber"   />
        <KpiCard label="Verification Status"  value={ngo.access_status.charAt(0).toUpperCase() + ngo.access_status.slice(1)} icon={ShieldCheck} color="emerald"  />
        <KpiCard label="Project Status"       value={ngo.has_project ? "Project Assigned" : "No Project Yet"} icon={Target}   color="blue"    />
        <KpiCard label="Contact Email"        value={form.ngo_email}                              icon={Globe}       color="violet"  />
      </div>

      <div className="flex gap-3">
        <button data-testid="goto-compliance-from-profile" onClick={() => onNavigate("compliance-vault")} className={btnGhost}>
          <ShieldCheck className="h-4 w-4" /> View Compliance Vault
        </button>
        <button data-testid="goto-trust-from-profile" onClick={() => onNavigate("trust-score")} className={btnGhost}>
          <Star className="h-4 w-4" /> View Trust Score
        </button>
      </div>
    </div>
  );
}

// ─── Section: Compliance Vault ────────────────────────────────────────────────

function ComplianceVaultSection({
  docs, onDocUpload,
}: {
  docs: Record<string, string>;
  onDocUpload: (docId: string) => void;
}) {
  const [uploadOpen, setUploadOpen]         = useState(false);
  const [defaultDocType, setDefaultDocType] = useState<string | undefined>();
  const [toast, setToast]                   = useState("");

  function openUpload(docId?: string) {
    setDefaultDocType(docId);
    setUploadOpen(true);
  }

  function handleSuccess(label: string) {
    if (defaultDocType) onDocUpload(defaultDocType);
    setUploadOpen(false);
    setToast(`✓ ${label} uploaded successfully`);
    setTimeout(() => setToast(""), 3500);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <SectionHeader title="Compliance Vault"
          sub="Upload legal documents to increase your Trust Score and get verified faster." />
        <button data-testid="upload-doc-btn" onClick={() => openUpload()} className={btn}>
          <Upload className="h-3.5 w-3.5" /> Upload Document
        </button>
      </div>

      {toast && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          {toast}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {DOC_TYPES.map((doc) => (
          <div
            key={doc.id}
            data-testid={`doc-card-${doc.id}`}
            className={`${cardCls} flex items-center justify-between p-4 transition hover:shadow-md`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${docs[doc.id] ? "bg-emerald-50" : "bg-slate-50"}`}>
                <FileText className={`h-4 w-4 ${docs[doc.id] ? "text-emerald-600" : "text-slate-400"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {doc.label}
                  {doc.mandatory && <span className="ml-1 text-red-400 text-xs">*</span>}
                </p>
                <p className="text-xs text-slate-400">{docs[doc.id] ? "Uploaded — pending review" : "Not uploaded"}</p>
              </div>
            </div>
            {docs[doc.id] ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" data-testid={`doc-check-${doc.id}`} />
                <button className="text-slate-400 hover:text-slate-700"><Eye className="h-3.5 w-3.5" /></button>
              </div>
            ) : (
              <button
                data-testid={`upload-btn-${doc.id}`}
                onClick={() => openUpload(doc.id)}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
              >
                Upload
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
        <span className="font-semibold">💡 Tip:</span> Each verified mandatory document adds points to your Trust Score. Complete all 5 mandatory docs to reach 70+ (High Trust).
      </div>

      <UploadModal
        open={uploadOpen}
        defaultDocType={defaultDocType}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

// ─── Section: Trust Score ─────────────────────────────────────────────────────

function TrustScoreSection({
  ngo, onNavigate, liveTrustScore, docs,
}: {
  ngo: Ngo; onNavigate: (id: string) => void;
  liveTrustScore: number; docs: Record<string, string>;
}) {
  const docFactors = [
    { label: "12A Certification",  docId: "certificate12a",  weight: "High",   points: 20 },
    { label: "80G Verification",   docId: "certificate80g",  weight: "High",   points: 20 },
    { label: "FCRA License",       docId: "fcraCertificate", weight: "High",   points: 15 },
    { label: "CSR-1 Registration", docId: "csr1Certificate", weight: "Medium", points: 10 },
    { label: "Annual Report",      docId: "annualReport",    weight: "Medium", points: 10 },
    { label: "Audit Report",       docId: "auditReport",     weight: "Low",    points: 10 },
  ];
  const extraFactors = [
    { label: "Expense Ratio",          docId: null, weight: "Medium", points: 15, status: "not-computed" },
    { label: "Financial Strain Index", docId: null, weight: "Medium", points: 10, status: "not-computed" },
  ];
  const scoreColor = liveTrustScore >= 70 ? "text-emerald-600" : liveTrustScore >= 40 ? "text-amber-500" : "text-red-500";
  return (
    <div className="space-y-6">
      <SectionHeader title="Trust Score" sub="Dynamically computed from your compliance and financial health." />
      <div className={`${cardCls} p-6 text-center`}>
        <p data-testid="trust-score-value" className={`text-7xl font-black ${scoreColor}`}>{liveTrustScore}</p>
        <p className="mt-1 text-sm font-medium text-slate-400">out of 100</p>
        <div className="mx-auto mt-5 max-w-xs"><TrustBar score={liveTrustScore} /></div>
        <div className="mt-4 flex justify-center gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400" />0–39 Low</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />40–69 Medium</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />70+ High Trust</span>
        </div>
      </div>
      <div className={`${cardCls} divide-y divide-slate-50`}>
        {docFactors.map((f) => {
          const status = docs[f.docId] === "verified" ? "verified" : docs[f.docId] ? "uploaded" : "missing";
          return (
            <div key={f.label} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                <p className="text-xs text-slate-400">Weight: {f.weight} · Up to {f.points} pts</p>
              </div>
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                status === "verified" ? "bg-emerald-100 text-emerald-700" :
                status === "uploaded" ? "bg-amber-100 text-amber-700" :
                                        "bg-red-50 text-red-600"
              }`}>
                {status === "verified" ? "✓ Verified" : status === "uploaded" ? "Pending review" : "Missing"}
              </span>
            </div>
          );
        })}
        {extraFactors.map((f) => (
          <div key={f.label} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-sm font-semibold text-slate-800">{f.label}</p>
              <p className="text-xs text-slate-400">Weight: {f.weight} · Up to {f.points} pts</p>
            </div>
            <span className="rounded-full px-3 py-0.5 text-xs font-semibold bg-slate-100 text-slate-500">Pending data</span>
          </div>
        ))}
      </div>
      <button data-testid="goto-vault-from-trust" onClick={() => onNavigate("compliance-vault")} className={btn}>
        <Upload className="h-4 w-4" /> Upload Documents to Improve Score
      </button>
    </div>
  );
}

// ─── Section: AI Proposal Reviewer ───────────────────────────────────────────

function AiProposalSection() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleAnalyse() {
    if (!text.trim()) return;
    setLoading(true); setResult(null);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setResult(`**AI Analysis Complete**\n\n✓ Schedule VII alignment: Strong — Education & Skill Development clearly mapped.\n⚠ Impact metrics: Consider adding specific KPIs (e.g. number of students, test scores).\n✓ Budget justification: Phase-wise breakdown present.\n⚠ Geographic targeting: Specify district-level coverage for stronger proposal.\n✓ Beneficiary targeting: Well-defined rural youth cohort.`);
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="AI Proposal Reviewer" sub="Get instant AI feedback on your CSR proposal before submitting to corporates." />
      <div className={`${cardCls} p-6`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
            <Sparkles className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Powered by Gemini AI</p>
            <p className="text-xs text-slate-400">Reviews against Schedule VII · 28 CSR doc types</p>
          </div>
        </div>
        <textarea
          data-testid="proposal-textarea"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 placeholder:text-slate-400"
          placeholder="Paste your proposal text here — AI will check alignment with CSR Schedule VII, impact measurement, budget justification, and geographic targeting..."
        />
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-slate-400">Checks: Schedule VII · Impact metrics · Budget · Beneficiary targeting</p>
          <button
            data-testid="analyse-proposal-btn"
            onClick={handleAnalyse}
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {loading ? "Analysing..." : "Analyse Proposal"}
          </button>
        </div>
      </div>
      {result && (
        <div data-testid="proposal-result" className={`${cardCls} p-5`}>
          <p className="text-sm font-bold text-slate-700 mb-3">Analysis Result</p>
          <div className="space-y-1.5">
            {result.split("\n").filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm text-slate-700 leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      )}
      <div className={`${cardCls} p-5`}>
        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> What the AI checks
        </p>
        <ul className="space-y-2">
          {[
            "Alignment with Schedule VII CSR mandate areas",
            "Clarity of objectives and measurable outcomes",
            "Budget justification and phase-wise breakdown",
            "Geographic coverage and beneficiary targeting",
            "Impact measurement methodology",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Locked sections ──────────────────────────────────────────────────────────

function LockedSection({ label, onNavigate }: { label: string; onNavigate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-5">
        <Lock className="h-7 w-7 text-slate-300" />
      </div>
      <h3 className="text-lg font-bold text-slate-600">{label}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-400 leading-relaxed">
        Unlocks once your NGO is verified. Complete compliance documents to speed up verification.
      </p>
      <button data-testid="goto-vault-locked" onClick={() => onNavigate("compliance-vault")} className={`mt-5 ${btn}`}>
        Go to Compliance Vault →
      </button>
    </div>
  );
}

function ProjectLockedSection({ label, onNavigate }: { label: string; onNavigate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mb-5">
        <Heart className="h-7 w-7 text-emerald-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-600">{label}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-400 leading-relaxed">
        Unlocks once a corporate assigns a CSR project to your NGO. Browse Opportunities to apply.
      </p>
      <button data-testid="goto-opportunities-locked" onClick={() => onNavigate("opportunities")} className={`mt-5 ${btn}`}>
        Browse Opportunities →
      </button>
    </div>
  );
}

// ─── Section: My Projects ─────────────────────────────────────────────────────

function MyProjectsSection({ onNavigate }: { onNavigate: (id: string) => void }) {
  const projects = [
    { id: "1", name: "Rural Education Initiative", corporate: "Tata Consultancy Services",
      budget: "₹25,00,000", phase: "Phase 2 of 4", status: "active", completion: 45, sdg: "Quality Education" },
  ];
  return (
    <div className="space-y-6">
      <SectionHeader title="My Projects" sub="CSR projects assigned to your NGO." />
      {projects.map((p) => (
        <div key={p.id} className={`${cardCls} overflow-hidden`}>
          <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">SDG: {p.sdg}</span>
                <h3 className="mt-2 text-base font-bold text-slate-900">{p.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">Corporate: <span className="font-medium text-slate-700">{p.corporate}</span></p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">ACTIVE</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[{ label: "Total Budget", value: p.budget }, { label: "Phase", value: p.phase }, { label: "Completion", value: `${p.completion}%` }].map((s) => (
                <div key={s.label} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Progress</span><span className="font-semibold text-emerald-600">{p.completion}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${p.completion}%` }} />
              </div>
            </div>
            <div className="mt-5 flex gap-2 flex-wrap">
              <button className={btn}><Eye className="h-3.5 w-3.5" /> View Details</button>
              <button onClick={() => onNavigate("project-chat")} className={btnOutline}><MessageSquare className="h-3.5 w-3.5" /> Chat with Corporate</button>
              <button onClick={() => onNavigate("fund-tracking")} className={btnOutline}><Wallet className="h-3.5 w-3.5" /> Fund Tracking</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section: Fund Tracking ───────────────────────────────────────────────────

function FundTrackingSection({ onNavigate }: { onNavigate: (id: string) => void }) {
  const tranches = [
    { id: "T1", label: "Tranche 1 — Phase 1", amount: "₹6,25,000", status: "unlocked",          released: "12 Jan 2026" },
    { id: "T2", label: "Tranche 2 — Phase 2", amount: "₹6,25,000", status: "release_requested", released: "Pending approval" },
    { id: "T3", label: "Tranche 3 — Phase 3", amount: "₹6,25,000", status: "locked",            released: "—" },
    { id: "T4", label: "Tranche 4 — Phase 4", amount: "₹6,25,000", status: "locked",            released: "—" },
  ];
  const ts: Record<string, { badge: string; dot: string; label: string }> = {
    unlocked:          { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Released"           },
    release_requested: { badge: "bg-amber-100 text-amber-700",     dot: "bg-amber-400",   label: "Awaiting Approval"  },
    locked:            { badge: "bg-slate-100 text-slate-500",     dot: "bg-slate-300",   label: "Locked"             },
    blocked:           { badge: "bg-red-100 text-red-600",         dot: "bg-red-500",     label: "Blocked"            },
  };
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <SectionHeader title="Fund Tracking" sub="Milestone-based tranche release status." />
        <button onClick={() => onNavigate("utilization-cert")} className={btn}><Wallet className="h-3.5 w-3.5" /> Request Tranche Release</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard label="Total Sanctioned" value="₹25,00,000" icon={Wallet} color="blue" />
        <KpiCard label="Released So Far"  value="₹6,25,000"  icon={TrendingUp} color="emerald" sub="25% disbursed" />
      </div>
      <div className={`${cardCls} divide-y divide-slate-50`}>
        {tranches.map((t) => (
          <div key={t.id} className="flex items-center gap-4 px-5 py-4">
            <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${ts[t.status].dot}`} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{t.label}</p>
              <p className="text-xs text-slate-400">{t.amount} · {t.released}</p>
            </div>
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${ts[t.status].badge}`}>{ts[t.status].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Milestone Reporting ────────────────────────────────────────────

const MILESTONE_DEFS = [
  { id: 1, label: "Baseline survey completed",              due: "15 Jan 2026" },
  { id: 2, label: "Infrastructure setup",                   due: "28 Feb 2026" },
  { id: 3, label: "First batch of beneficiaries onboarded", due: "31 Mar 2026" },
  { id: 4, label: "Mid-project evaluation",                 due: "30 Jun 2026" },
];

function MilestoneReportingSection({
  milestoneStatuses, onMilestoneSubmit,
}: {
  milestoneStatuses: Record<number, string>;
  onMilestoneSubmit: (id: number) => void;
}) {

  return (
    <div className="space-y-6">
      <SectionHeader title="Milestone Reporting" sub="Track and submit milestone progress reports." />
      <div className={`${cardCls} divide-y divide-slate-50`}>
        {MILESTONE_DEFS.map((m) => {
          const status = milestoneStatuses[m.id] ?? "pending";
          return (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4" data-testid={`milestone-${m.id}`}>
              {status === "done"
                ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                : status === "in-progress"
                ? <Clock className="h-5 w-5 flex-shrink-0 text-amber-500" />
                : <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-slate-200" />
              }
              <div className="flex-1">
                <p className={`text-sm font-semibold ${status === "done" ? "text-slate-400 line-through" : "text-slate-800"}`}>{m.label}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3" /> Due: {m.due}</p>
              </div>
              {status === "in-progress" && (
                <button data-testid={`submit-milestone-${m.id}`} onClick={() => onMilestoneSubmit(m.id)} className={btnOutline + " text-xs py-1.5 px-3"}>Submit</button>
              )}
              {status === "done" && <span className="text-xs font-semibold text-emerald-600">Done ✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section: Impact Reporting ────────────────────────────────────────────────

function ImpactReportingSection() {
  const [toast, setToast] = useState("");
  function handleUpload(type: string) {
    setToast(`${type} upload initiated — select your file.`);
    setTimeout(() => setToast(""), 3000);
  }
  return (
    <div className="space-y-6">
      <SectionHeader title="Impact Reporting" sub="Measure and showcase your project's social impact." />
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Beneficiaries Reached" value="1,240" icon={Heart}     color="rose"    />
        <KpiCard label="Communities Served"     value="8"     icon={MapPin}    color="emerald" />
        <KpiCard label="Reports Submitted"      value="2"     icon={FileText}  color="blue"    />
      </div>
      {toast && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">{toast}</div>}
      <div className={`${cardCls} p-5`}>
        <p className="text-sm font-semibold text-slate-700 mb-4">Submit Evidence</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Geo-Tagged Photos", icon: Camera,   hint: "JPG, PNG · Max 10MB", testId: "upload-photos-btn" },
            { label: "Progress Videos",   icon: Upload,   hint: "MP4, MOV · Max 50MB", testId: "upload-videos-btn" },
            { label: "PDF Reports",       icon: FileText, hint: "PDF · Max 20MB",       testId: "upload-pdf-btn"    },
          ].map((item) => (
            <button
              key={item.label}
              data-testid={item.testId}
              onClick={() => handleUpload(item.label)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
            >
              <item.icon className="h-6 w-6 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-700">{item.label}</p>
              <p className="text-xs text-slate-400">{item.hint}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Utilization Certificate ────────────────────────────────────────

function UtilizationCertSection() {
  const [form, setForm] = useState({ tranche: "", date: "", notes: "" });
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!form.tranche || !form.date) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Certificate Submitted!</h3>
        <p className="mt-2 text-sm text-slate-500">Your utilization certificate has been submitted for review.</p>
        <button onClick={() => setSubmitted(false)} className={`mt-5 ${btnOutline}`}>Submit Another</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Utilization Certificate" sub="Submit utilization certificates for fund tranches." />
      <div className={`${cardCls} p-6`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Tranche Reference *
            <select data-testid="uc-tranche-select" className={inputCls}
              value={form.tranche} onChange={(e) => setForm((p) => ({ ...p, tranche: e.target.value }))}>
              <option value="">Select tranche</option>
              <option value="T1">Tranche 1 — ₹6,25,000</option>
              <option value="T2">Tranche 2 — ₹6,25,000</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Certificate Date *
            <input data-testid="uc-date-input" type="date" className={inputCls}
              value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          </label>
          <div className="sm:col-span-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Upload Certificate (PDF)
              <input data-testid="uc-file-input" type="file" accept=".pdf"
                className={inputCls + " py-2"}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Notes
              <textarea rows={3} data-testid="uc-notes-input"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Additional context..."
                value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
            </label>
          </div>
        </div>
        <button data-testid="uc-submit-btn" onClick={handleSubmit} disabled={submitting || !form.tranche || !form.date} className={btn + " mt-5"}>
          {submitting ? "Submitting..." : "Submit Certificate"}
        </button>
      </div>
    </div>
  );
}

// ─── Section: Role Assignment ─────────────────────────────────────────────────

function RoleAssignmentSection({ ngo, token }: { ngo: Ngo; token: string }) {
  const [members, setMembers]           = useState<Member[]>([]);
  const [loadedMembers, setLoadedMembers] = useState(false);
  const [form, setForm]                 = useState({ fullName: "", email: "", role: "", password: "", confirmPassword: "" });
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadMembers() {
    if (loadedMembers) return;
    const res  = await fetch("/api/ngos/members", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.members) { setMembers(data.members); setLoadedMembers(true); }
  }

  async function handleAdd() {
    setError(""); setSuccess("");
    if (!form.fullName || !form.email || !form.role || !form.password) { setError("All fields are required."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setIsSubmitting(true);
    const res  = await fetch("/api/ngos/members", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setIsSubmitting(false);
    if (!res.ok) { setError(data.error || "Failed to add member."); return; }
    setSuccess(`✓ ${form.fullName} added as ${getRoleLabel(form.role as NgoRole)}.`);
    setForm({ fullName: "", email: "", role: "", password: "", confirmPassword: "" });
    setMembers((p) => [...p, data.member]);
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Role Assignment"
        sub="Assign roles to team members. Each gets their own login and a role-specific dashboard." />

      <div className={`${cardCls} p-6`}>
        <p className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-emerald-500" /> Add New Member
        </p>
        {error   && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" data-testid="role-error">{error}</p>}
        {success && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700" data-testid="role-success">{success}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Full Name",      key: "fullName", type: "text",     placeholder: "Jane Doe",          testId: "role-fullname-input" },
            { label: "Email Address",  key: "email",    type: "email",    placeholder: "jane@example.com",  testId: "role-email-input"    },
          ].map((f) => (
            <label key={f.key} className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              {f.label} *
              <input data-testid={f.testId} type={f.type} placeholder={f.placeholder} className={inputCls}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
            </label>
          ))}

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Role *
            <select data-testid="role-select" className={inputCls} value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
              <option value="">Select role</option>
              {NGO_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Password *
            <input data-testid="role-password-input" type="password" placeholder="Min. 8 characters" className={inputCls}
              value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
            Confirm Password *
            <input data-testid="role-confirm-input" type="password" placeholder="Repeat password" className={inputCls}
              value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
          </label>
        </div>

        <button data-testid="add-member-btn" onClick={handleAdd} disabled={isSubmitting} className={btn + " mt-5"}>
          {isSubmitting ? "Adding..." : "Add Member"}
        </button>
      </div>

      <div className={cardCls}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-700">Team Members</p>
          <button data-testid="load-members-btn" onClick={loadMembers} className={btnGhost}>Load members ↻</button>
        </div>
        {members.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">No team members yet. Add one above.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {members.map((m) => (
              <div key={m.id} data-testid={`member-row-${m.email}`} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{m.full_name}</p>
                  <p className="text-xs text-slate-400">{m.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                    {getRoleLabel(m.role as NgoRole)}
                  </span>
                  <span className={`h-2 w-2 rounded-full ${m.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`${cardCls} p-5`}>
        <p className="text-sm font-bold text-slate-700 mb-4">Role Access Reference</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {NGO_ROLES.map((r) => (
            <div key={r.value} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-700">{r.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                {ROLE_SIDEBAR_ACCESS[r.value]?.join(", ") || "Limited access"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Settings ────────────────────────────────────────────────────────

function SettingsSection({ ngo }: { ngo: Ngo }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" sub="Manage your NGO account and preferences." />
      <div className={`${cardCls} divide-y divide-slate-50`}>
        {[
          { label: "NGO Name",        value: ngo.ngo_name,    testId: "settings-name"   },
          { label: "Contact Email",   value: ngo.ngo_email,   testId: "settings-email"  },
          { label: "Account Status",  value: ngo.access_status.charAt(0).toUpperCase() + ngo.access_status.slice(1), testId: "settings-status" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
              <p data-testid={item.testId} className="text-xs text-slate-400 mt-0.5">{item.value}</p>
            </div>
            <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-800">Edit</button>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
        <p className="text-sm font-bold text-red-800 mb-1">Danger Zone</p>
        <p className="text-xs text-red-500 mb-4">These actions cannot be undone.</p>
        <button data-testid="deactivate-btn" className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 transition">
          Deactivate NGO Account
        </button>
      </div>
    </div>
  );
}

// ─── Generic stub panel ──────────────────────────────────────────────────────

function StubSection({
  title, sub, rows,
}: {
  title: string; sub: string;
  rows: { label: string; value: string; badge?: string }[];
}) {
  return (
    <div className="space-y-6">
      <SectionHeader title={title} sub={sub} />
      <div className={`${cardCls} divide-y divide-slate-50`}>
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">{r.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{r.value}</p>
            </div>
            {r.badge && (
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700">{r.badge}</span>
            )}
          </div>
        ))}
      </div>
      <div className={`${cardCls} p-5`}>
        <p className="text-xs text-slate-400 text-center">Full functionality coming soon — data will populate here.</p>
      </div>
    </div>
  );
}

// ─── Finance Officer Sections ─────────────────────────────────────────────────

function FundsSection() {
  return <StubSection title="Funds" sub="Track incoming grant funds and CSR disbursements." rows={[
    { label: "Total Funds Received", value: "₹12,50,000",  badge: "Active" },
    { label: "Funds Pending Release",value: "₹6,25,000",   badge: "Pending" },
    { label: "Last Disbursement",    value: "15 May 2026 — Tranche 1" },
    { label: "Next Tranche Due",     value: "15 Aug 2026 — Tranche 2" },
  ]} />;
}
function ExpensesSection() {
  return <StubSection title="Expenses" sub="Record and review operational expenditures." rows={[
    { label: "Total Expenses (YTD)", value: "₹4,80,000" },
    { label: "Pending Approvals",    value: "3 expense claims", badge: "Review" },
    { label: "Last Entry",           value: "Field travel — ₹12,000 — 20 May 2026" },
  ]} />;
}
function InvoicesSection() {
  return <StubSection title="Invoices" sub="Manage vendor invoices and payment status." rows={[
    { label: "Open Invoices",   value: "5 invoices — ₹2,30,000 due", badge: "Open" },
    { label: "Paid This Month", value: "₹1,10,000 cleared" },
    { label: "Overdue",         value: "1 invoice — 12 days overdue", badge: "Overdue" },
  ]} />;
}
function UtilizationReportsSection() {
  return <StubSection title="Utilization Reports" sub="Financial utilization reports per project phase." rows={[
    { label: "Q1 Report", value: "Submitted — Apr 2026", badge: "Approved" },
    { label: "Q2 Report", value: "Due 30 Jun 2026",      badge: "Pending" },
  ]} />;
}
function GrantTrackingSection() {
  return <StubSection title="Grant Tracking" sub="Track multi-source grant pipelines and timelines." rows={[
    { label: "CSR Grant — Tata Group",      value: "₹12,50,000 — Active",    badge: "Active" },
    { label: "Government Scheme — DPIIT",   value: "₹3,00,000 — Applied",    badge: "Applied" },
    { label: "International — USAID",       value: "₹8,00,000 — Shortlisted",badge: "Shortlisted" },
  ]} />;
}
function FinanceAnalyticsSection() {
  return <StubSection title="Finance Analytics" sub="Budget vs. actuals, burn rate and CSR compliance spend." rows={[
    { label: "Burn Rate (Monthly avg)", value: "₹40,000 / month" },
    { label: "Budget Utilization",      value: "38% used of total sanction" },
    { label: "CSR Mandatory Spend",     value: "₹6,25,000 required — ₹4,80,000 spent" },
  ]} />;
}

// ─── Compliance Officer Sections ──────────────────────────────────────────────

function LegalDocumentsSection() {
  return <StubSection title="Legal Documents" sub="Repository of regulatory and legal filings." rows={[
    { label: "12A Certificate",    value: "Valid until Dec 2028",      badge: "Valid" },
    { label: "80G Certificate",    value: "Valid until Mar 2027",      badge: "Valid" },
    { label: "CSR-1 Registration", value: "Filed — FY 2025-26",        badge: "Filed" },
    { label: "FCRA License",       value: "Not applicable",            badge: "N/A" },
    { label: "Annual Report",      value: "FY 2024-25 — Uploaded",     badge: "Done" },
    { label: "Audit Report",       value: "FY 2024-25 — Pending CA",   badge: "Pending" },
  ]} />;
}
function NgoVerificationSection() {
  return <StubSection title="NGO Verification" sub="Track your verification status and required actions." rows={[
    { label: "Verification Status",   value: "Under review by CorpoGN admin" },
    { label: "Documents Submitted",   value: "4 of 6 mandatory documents" },
    { label: "Estimated Timeline",    value: "3–5 business days" },
    { label: "Last Updated",          value: "22 May 2026" },
  ]} />;
}
function AuditRequestsSection() {
  return <StubSection title="Audit Requests" sub="Respond to audit queries from corporates or regulators." rows={[
    { label: "Open Requests",   value: "2 audit queries pending",     badge: "Open" },
    { label: "Completed",       value: "5 audits closed this year",   badge: "Done" },
    { label: "Next Deadline",   value: "Respond by 5 Jun 2026" },
  ]} />;
}
function ComplianceWorkflowSection() {
  return <StubSection title="Compliance Workflow" sub="Step-by-step compliance checklist and approvals." rows={[
    { label: "Step 1 — Document Upload",      value: "Completed ✓", badge: "Done" },
    { label: "Step 2 — Admin Review",         value: "In Progress",  badge: "Active" },
    { label: "Step 3 — Verification Call",    value: "Scheduled: 28 May 2026" },
    { label: "Step 4 — Certificate Issue",    value: "Pending",     badge: "Pending" },
  ]} />;
}

// ─── Operations Manager Sections ──────────────────────────────────────────────

function ProjectsSection() {
  return <StubSection title="Projects" sub="All assigned and ongoing CSR projects." rows={[
    { label: "Digital Literacy Drive", value: "Phase 2 — Active", badge: "Active" },
    { label: "Clean Water Initiative", value: "Proposal submitted",badge: "Proposed" },
    { label: "Women Empowerment",      value: "Completed — FY25",  badge: "Done" },
  ]} />;
}
function MilestonesSection() {
  return <StubSection title="Milestones" sub="Project milestones and delivery timelines." rows={[
    { label: "M1 — Inception Report",    value: "Completed — Apr 2026", badge: "Done" },
    { label: "M2 — Mid-term Review",     value: "Due 30 Jun 2026",      badge: "On Track" },
    { label: "M3 — Impact Assessment",   value: "Due 30 Sep 2026" },
    { label: "M4 — Final Report",        value: "Due 31 Dec 2026" },
  ]} />;
}
function BeneficiaryTrackingSection() {
  return <StubSection title="Beneficiary Tracking" sub="Monitor beneficiary reach and demographics." rows={[
    { label: "Total Beneficiaries",      value: "1,240 registered" },
    { label: "Direct Beneficiaries",     value: "840 — active this quarter" },
    { label: "Indirect Beneficiaries",   value: "3,200 estimated" },
    { label: "Gender Split",             value: "52% Female · 48% Male" },
  ]} />;
}
function TaskAssignmentSection() {
  return <StubSection title="Task Assignment" sub="Assign and track tasks across team members." rows={[
    { label: "Open Tasks",      value: "8 tasks pending",     badge: "Open" },
    { label: "In Progress",     value: "5 tasks active",      badge: "Active" },
    { label: "Completed Today", value: "3 tasks closed" },
    { label: "Overdue",         value: "1 task — 2 days late",badge: "Late" },
  ]} />;
}
function PartnershipCommunicationSection() {
  return <StubSection title="Partnership Comms" sub="Messages and updates shared with corporate partners." rows={[
    { label: "Unread Messages",      value: "2 from Tata CSR desk",    badge: "New" },
    { label: "Last Communication",   value: "20 May 2026 — Update call" },
    { label: "Next Review Meeting",  value: "28 May 2026 — 11 AM" },
  ]} />;
}
function ReportDraftsSection() {
  return <StubSection title="Report Drafts" sub="Draft, review and finalise impact reports." rows={[
    { label: "Q1 Impact Report",  value: "Draft — 80% complete",  badge: "Draft" },
    { label: "Mid-Year Review",   value: "Not started",           badge: "Pending" },
    { label: "Annual Report",     value: "Template available" },
  ]} />;
}

// ─── Field Coordinator Sections ───────────────────────────────────────────────

function AssignedProjectsSection() {
  return <StubSection title="Assigned Projects" sub="Your field-level project assignments." rows={[
    { label: "Digital Literacy — Zone 3", value: "Active — 12 sessions completed", badge: "Active" },
    { label: "Health Camp — Pune",        value: "Scheduled — 5 Jun 2026" },
  ]} />;
}
function BeneficiaryFormsSection() {
  return <StubSection title="Beneficiary Forms" sub="Submit and manage beneficiary registration forms." rows={[
    { label: "Forms Submitted This Week", value: "47 forms", badge: "Done" },
    { label: "Pending Verification",      value: "12 forms", badge: "Pending" },
    { label: "Rejected / Incomplete",     value: "3 forms",  badge: "Review" },
  ]} />;
}
function FieldUpdatesSection() {
  return <StubSection title="Field Updates" sub="Post real-time updates from the field." rows={[
    { label: "Last Update", value: "22 May 2026 — Session completion report posted" },
    { label: "This Week",   value: "4 updates submitted" },
    { label: "Pending",     value: "1 update draft saved" },
  ]} />;
}
function MediaUploadsSection() {
  return <StubSection title="Media Uploads" sub="Upload photos and videos from field activities." rows={[
    { label: "Photos Uploaded",  value: "234 photos — May 2026" },
    { label: "Videos",           value: "8 videos uploaded" },
    { label: "Storage Used",     value: "1.2 GB of 5 GB" },
  ]} />;
}
function AttendanceSection() {
  return <StubSection title="Attendance" sub="Field team attendance and session logs." rows={[
    { label: "Today's Attendance",     value: "18 / 20 field staff present" },
    { label: "This Week",              value: "91% attendance rate" },
    { label: "Pending Logs",           value: "2 sessions need sign-off", badge: "Action" },
  ]} />;
}

// ─── Volunteer Sections ───────────────────────────────────────────────────────

function AssignedTasksSection() {
  return <StubSection title="Assigned Tasks" sub="Your volunteer task list for this week." rows={[
    { label: "Data Entry — Beneficiary List", value: "Due 25 May 2026",   badge: "Open" },
    { label: "Event Setup — Health Camp",     value: "Due 5 Jun 2026",    badge: "Upcoming" },
    { label: "Survey Distribution",           value: "Completed 20 May",  badge: "Done" },
  ]} />;
}
function EventParticipationSection() {
  return <StubSection title="Event Participation" sub="Events you're enrolled in or have attended." rows={[
    { label: "Digital Literacy Drive — Session 12", value: "Attended — 18 May 2026", badge: "Done" },
    { label: "Health Camp — Pune",                  value: "Registered — 5 Jun 2026",badge: "Upcoming" },
    { label: "Community Clean-up",                  value: "Open for signup" },
  ]} />;
}
function UploadsSection() {
  return <StubSection title="Uploads" sub="Submit photos or files from your assigned activities." rows={[
    { label: "Files Uploaded This Month", value: "12 files" },
    { label: "Last Upload",              value: "20 May 2026 — Session photo" },
    { label: "Max File Size",            value: "10 MB per file" },
  ]} />;
}

// ─── Reporting Executive Sections ─────────────────────────────────────────────

function ImpactReportsSection() {
  return <StubSection title="Impact Reports" sub="Create and publish NGO impact narratives." rows={[
    { label: "Q1 Impact Report", value: "Published — Apr 2026",      badge: "Live" },
    { label: "Mid-Year Report",  value: "Draft in progress",         badge: "Draft" },
    { label: "Annual Report",    value: "Due Dec 2026" },
  ]} />;
}
function MediaLibrarySection() {
  return <StubSection title="Media Library" sub="Curated photos, videos and case studies." rows={[
    { label: "Photos",      value: "482 assets" },
    { label: "Videos",      value: "24 videos" },
    { label: "Case Studies",value: "6 published" },
    { label: "Last Upload", value: "22 May 2026" },
  ]} />;
}
function AnalyticsViewSection() {
  return <StubSection title="Analytics View" sub="Reach, engagement and outcome metrics." rows={[
    { label: "Beneficiaries Reached", value: "1,240 direct" },
    { label: "Report Downloads",      value: "340 this quarter" },
    { label: "Website Traffic",       value: "4,200 visits (NGO profile page)" },
  ]} />;
}
function PresentationsSection() {
  return <StubSection title="Presentations" sub="Pitch decks and project presentations for corporate partners." rows={[
    { label: "Project Deck — Tata CSR",   value: "Shared — 10 May 2026",   badge: "Shared" },
    { label: "Annual Impact Deck",        value: "Draft ready",            badge: "Draft" },
    { label: "Proposal Slides",           value: "Template available" },
  ]} />;
}

// ─── Super Admin — extra sections ────────────────────────────────────────────

function CorporatePartnershipsSection() {
  return <StubSection title="Corporate Partnerships" sub="Track active and prospective corporate relationships." rows={[
    { label: "Tata Group",        value: "Active CSR project — Digital Literacy", badge: "Active" },
    { label: "Infosys Foundation",value: "Proposal submitted — awaiting approval", badge: "Pending" },
    { label: "Mahindra CSR",      value: "Shortlisted — contact initiated" },
  ]} />;
}
function ReportsSection() {
  return <StubSection title="Reports" sub="All reports across compliance, finance and impact." rows={[
    { label: "Q1 Impact Report",       value: "Published — Apr 2026", badge: "Live" },
    { label: "Q1 Utilization Report",  value: "Approved",             badge: "Approved" },
    { label: "Annual Report FY25",     value: "Submitted" },
    { label: "Mid-Year Report",        value: "Draft in progress",    badge: "Draft" },
  ]} />;
}
function AuditLogsSection() {
  return <StubSection title="Audit Logs" sub="Full audit trail of all actions on this account." rows={[
    { label: "22 May 2026 — 10:32 AM", value: "Team member added: Rahul Mehta (Finance)" },
    { label: "20 May 2026 — 3:15 PM",  value: "Document uploaded: Annual Report" },
    { label: "18 May 2026 — 9:00 AM",  value: "Proposal submitted to Tata CSR" },
    { label: "15 May 2026 — 11:45 AM", value: "NGO Profile updated" },
  ]} />;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function NgoDashboard({
  ngo, viewerRole, viewerName,
}: {
  ngo: Ngo; viewerRole: NgoRole; viewerName: string;
}) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(
    ROLE_DEFAULT_SECTION[viewerRole] ?? "command-center",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [token, setToken]           = useState("");
  const [sharedState, setSharedState] = useState<NgoSharedState>(() => ({
    docs: {}, milestones: { 1: "done", 2: "done", 3: "in-progress", 4: "pending" },
    ngoName: ngo.ngo_name, ngoEmail: ngo.ngo_email, trustScore: ngo.trust_score,
  }));

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? "");
    });
    // Load persisted state
    const initial = loadState(ngo.id, ngo.ngo_name, ngo.ngo_email, ngo.trust_score);
    setSharedState(initial);
    // Cross-tab sync via storage events
    function handleStorage(e: StorageEvent) {
      if (e.key === `ngo_shared_state_${ngo.id}` && e.newValue) {
        try { setSharedState(JSON.parse(e.newValue) as NgoSharedState); } catch { /* ignore */ }
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [ngo.id, ngo.ngo_name, ngo.ngo_email, ngo.trust_score]);

  const updateSharedState = useCallback((updater: (prev: NgoSharedState) => NgoSharedState) => {
    setSharedState((prev) => {
      const next = updater(prev);
      saveState(ngo.id, next);
      return next;
    });
  }, [ngo.id]);

  const liveTrustScore = computeTrustScore(sharedState.docs);
  const uploadedCount  = Object.values(sharedState.docs).filter(Boolean).length;

  async function handleSignOut() {
    await supabaseBrowser.auth.signOut();
    router.push("/signin");
  }

  function navigate(id: string) {
    setActiveSection(id);
    setMobileOpen(false);
  }

  function getSidebarItems(): SidebarItem[] {
    if (viewerRole === "super_admin") {
      // Super admin sees everything (superAdminOnly + shared items)
      return ALL_SIDEBAR_ITEMS.filter((i) => !i.id.startsWith("assigned-") && !["funds","expenses","invoices","utilization-reports","grant-tracking","finance-analytics","legal-documents","ngo-verification","audit-requests","compliance-workflow","projects","milestones","beneficiary-tracking","task-assignment","partnership-communication","report-drafts","beneficiary-forms","field-updates","media-uploads","attendance","impact-reports","media-library","analytics-view","presentations","assigned-tasks","event-participation","uploads"].includes(i.id));
    }
    const cfg = ROLE_SIDEBAR_IDS[viewerRole as Exclude<NgoRole, "super_admin">];
    if (!cfg) return [];
    const ids = ngo.has_project ? [...cfg.base, ...cfg.withProject] : cfg.base;
    return ALL_SIDEBAR_ITEMS.filter((i) => ids.includes(i.id));
  }

  function isLocked(item: SidebarItem) {
    if (item.requiresVerified && ngo.access_status === "pending") return true;
    if (item.requiresProject  && !ngo.has_project)               return true;
    return false;
  }

  function renderSection() {
    const item = ALL_SIDEBAR_ITEMS.find((i) => i.id === activeSection);
    if (item && isLocked(item)) {
      return item.requiresProject
        ? <ProjectLockedSection label={item.label} onNavigate={navigate} />
        : <LockedSection        label={item.label} onNavigate={navigate} />;
    }
    switch (activeSection) {
      case "command-center":       return <CommandCenterSection      ngo={ngo} onNavigate={navigate} uploadedCount={uploadedCount} liveTrustScore={liveTrustScore} />;
      case "ngo-profile":          return <NgoProfileSection         ngo={ngo} onNavigate={navigate} />;
      case "compliance-vault":     return (
        <ComplianceVaultSection
          docs={sharedState.docs}
          onDocUpload={(docId) => updateSharedState((prev) => ({
            ...prev,
            docs: { ...prev.docs, [docId]: "uploaded" },
          }))}
        />
      );
      case "trust-score":          return <TrustScoreSection         ngo={ngo} onNavigate={navigate} liveTrustScore={liveTrustScore} docs={sharedState.docs} />;
      case "ai-proposal":          return <AiProposalSection />;
      case "my-projects":          return <MyProjectsSection         onNavigate={navigate} />;
      case "fund-tracking":        return <FundTrackingSection       onNavigate={navigate} />;
      case "milestone-reporting":  return (
        <MilestoneReportingSection
          milestoneStatuses={sharedState.milestones}
          onMilestoneSubmit={(id) => updateSharedState((prev) => ({
            ...prev,
            milestones: { ...prev.milestones, [id]: "done" },
          }))}
        />
      );
      case "impact-reporting":     return <ImpactReportingSection />;
      case "utilization-cert":     return <UtilizationCertSection />;
      case "team-management":
      case "role-assignment":       return <RoleAssignmentSection      ngo={ngo} token={token} />;
      case "settings":              return <SettingsSection            ngo={ngo} />;
      // Finance Officer
      case "funds":                 return <FundsSection />;
      case "expenses":              return <ExpensesSection />;
      case "invoices":              return <InvoicesSection />;
      case "utilization-reports":   return <UtilizationReportsSection />;
      case "grant-tracking":        return <GrantTrackingSection />;
      case "finance-analytics":     return <FinanceAnalyticsSection />;
      // Compliance Officer
      case "legal-documents":       return <LegalDocumentsSection />;
      case "ngo-verification":      return <NgoVerificationSection />;
      case "audit-requests":        return <AuditRequestsSection />;
      case "compliance-workflow":   return <ComplianceWorkflowSection />;
      // Operations Manager
      case "projects":              return <ProjectsSection />;
      case "milestones":            return <MilestonesSection />;
      case "beneficiary-tracking":  return <BeneficiaryTrackingSection />;
      case "task-assignment":       return <TaskAssignmentSection />;
      case "partnership-communication": return <PartnershipCommunicationSection />;
      case "report-drafts":         return <ReportDraftsSection />;
      // Field Coordinator
      case "assigned-projects":     return <AssignedProjectsSection />;
      case "beneficiary-forms":     return <BeneficiaryFormsSection />;
      case "field-updates":         return <FieldUpdatesSection />;
      case "media-uploads":         return <MediaUploadsSection />;
      case "attendance":            return <AttendanceSection />;
      // Volunteer
      case "assigned-tasks":        return <AssignedTasksSection />;
      case "event-participation":   return <EventParticipationSection />;
      case "uploads":               return <UploadsSection />;
      // Reporting Executive
      case "impact-reports":        return <ImpactReportsSection />;
      case "media-library":         return <MediaLibrarySection />;
      case "analytics-view":        return <AnalyticsViewSection />;
      case "presentations":         return <PresentationsSection />;
      // Super Admin extras
      case "corporate-partnerships":return <CorporatePartnershipsSection />;
      case "reports":               return <ReportsSection />;
      case "audit-logs":            return <AuditLogsSection />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ClipboardList className="h-10 w-10 text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">This section is coming soon.</p>
          </div>
        );
    }
  }

  const sidebarItems = getSidebarItems();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Sidebar */}
      <aside className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-emerald-950 transition-transform lg:relative lg:translate-x-0`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-emerald-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-emerald-950 font-black text-sm">
            {ngo.ngo_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{ngo.ngo_name}</p>
            <p className="text-xs text-emerald-400">{getRoleLabel(viewerRole)}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {SIDEBAR_GROUPS.map((group) => {
            const items = sidebarItems.filter((i) => group.ids.includes(i.id));
            if (items.length === 0) return null;
            return (
              <div key={group.label}>
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-emerald-600">{group.label}</p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const locked = isLocked(item);
                    const active = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        data-testid={`nav-${item.id}`}
                        onClick={() => navigate(item.id)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          active  ? "bg-emerald-500 text-white shadow-sm" :
                          locked  ? "text-emerald-800 cursor-default" :
                                    "text-emerald-200 hover:bg-emerald-900 hover:text-white"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-white" : locked ? "text-emerald-800" : "text-emerald-400"}`} />
                        <span className="truncate">{item.label}</span>
                        {locked && <Lock className="ml-auto h-3 w-3 flex-shrink-0 text-emerald-800" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-emerald-900 p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-emerald-200">
              {viewerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{viewerName}</p>
              <p className="truncate text-xs text-emerald-500">{getRoleLabel(viewerRole)}</p>
            </div>
            <button data-testid="signout-btn" onClick={handleSignOut} title="Sign out" className="text-emerald-600 hover:text-emerald-300 transition">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 shadow-sm">
          <button className="rounded-lg border border-slate-200 p-2 lg:hidden hover:bg-slate-50 transition" onClick={() => setMobileOpen(true)}>
            <div className="space-y-1.5">{[0,1,2].map((i) => <div key={i} className="h-0.5 w-5 bg-slate-600 rounded" />)}</div>
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <StatusBadge status={ngo.access_status} />
            <button className="relative rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-5 py-7 sm:px-8" data-testid="dashboard-main">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
