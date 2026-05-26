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

      {/* Trust score + org health visual */}
      <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2 font-medium">Score Breakdown</p>
            <BarChart color="amber" data={[
              { label: "Base score",           value: 15, formatted: "+15 pts" },
              { label: "12A Certificate",       value: uploadedCount > 0 ? 20 : 0, formatted: uploadedCount > 0 ? "+20 pts" : "0 pts" },
              { label: "80G Certificate",       value: uploadedCount > 1 ? 20 : 0, formatted: uploadedCount > 1 ? "+20 pts" : "0 pts" },
              { label: "FCRA / CSR-1",         value: uploadedCount > 2 ? 15 : 0, formatted: uploadedCount > 2 ? "+15 pts" : "0 pts" },
              { label: "Annual & Audit Reports",value: uploadedCount > 3 ? 20 : 0, formatted: uploadedCount > 3 ? "+20 pts" : "0 pts" },
            ]} />
          </div>
        </div>
        <div className={`${cardCls} p-5`}>
          <p className="text-sm font-semibold text-slate-700 mb-3">Organisation Health</p>
          <DonutChart center="NGO" segments={[
            { label: "Docs Complete",    value: Math.round((uploadedCount / 6) * 40), color: "emerald", formatted: `${uploadedCount}/6 docs` },
            { label: "Profile Filled",   value: 25, color: "blue",    formatted: "Profile 100%" },
            { label: "Pending Actions",  value: 20, color: "amber",   formatted: "3 pending"    },
            { label: "Unlocked Later",   value: 15, color: "slate",   formatted: "Post-project" },
          ]} />
          <div className="mt-4 space-y-2">
            {[
              { l: "Profile complete",    done: true  },
              { l: "Email verified",       done: true  },
              { l: "6 compliance docs",    done: uploadedCount >= 6 },
              { l: "Project assigned",     done: ngo.has_project },
            ].map((it) => (
              <div key={it.l} className="flex items-center gap-2 text-xs">
                <div className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold ${it.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                  {it.done ? "✓" : "○"}
                </div>
                <span className={it.done ? "text-slate-700" : "text-slate-400"}>{it.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className="px-5 pt-4 pb-3 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-700">Recent Team Activity</p>
        </div>
        <ActivityFeed items={[
          { time: "2h ago",  user: "Finance Officer",     action: "submitted Tranche 1 utilization data",            type: "success" },
          { time: "4h ago",  user: "Field Coordinator",   action: "uploaded 12 beneficiary photos from Zone 3",      type: "info"    },
          { time: "Yesterday",user: "Compliance Officer", action: "renewed 80G certificate in Compliance Vault",     type: "success" },
          { time: "2d ago",  user: "Ops Manager",         action: "marked Milestone 1 as complete and submitted",    type: "success" },
          { time: "3d ago",  user: "Reporting Exec",      action: "published Q1 Impact Report — 340 views",         type: "info"    },
        ]} />
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

// ─── Shared rich-panel primitives ────────────────────────────────────────────

function GradientHero({
  from, to, eyebrow, title, description, badge,
}: {
  from: string; to: string; eyebrow: string;
  title: string; description: string; badge?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${from} ${to} p-6 text-white shadow-md`}>
      <div className="relative z-10">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest opacity-80">{eyebrow}</p>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-1.5 max-w-xl text-sm opacity-80 leading-relaxed">{description}</p>
        {badge && <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold">{badge}</span>}
      </div>
      <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
      <div className="absolute -right-2 bottom-0 h-20 w-20 rounded-full bg-white/5" />
    </div>
  );
}

function MetricRow({ items }: { items: { label: string; value: string; sub?: string; color?: string }[] }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue:    "bg-blue-50 text-blue-700 border-blue-100",
    amber:   "bg-amber-50 text-amber-700 border-amber-100",
    violet:  "bg-violet-50 text-violet-700 border-violet-100",
    rose:    "bg-rose-50 text-rose-700 border-rose-100",
    slate:   "bg-slate-50 text-slate-700 border-slate-100",
  };
  return (
    <div className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0,1fr))` }}>
      {items.map((m) => {
        const cls = colors[m.color ?? "emerald"] ?? colors.emerald;
        return (
          <div key={m.label} className={`rounded-2xl border p-4 ${cls}`}>
            <p className="text-xs font-medium opacity-70">{m.label}</p>
            <p className="mt-1 text-2xl font-bold">{m.value}</p>
            {m.sub && <p className="mt-0.5 text-xs opacity-60">{m.sub}</p>}
          </div>
        );
      })}
    </div>
  );
}

type BadgeColor = "emerald"|"amber"|"blue"|"red"|"slate"|"violet";
function Chip({ label, color = "slate" }: { label: string; color?: BadgeColor }) {
  const m: Record<BadgeColor, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber:   "bg-amber-100 text-amber-700",
    blue:    "bg-blue-100 text-blue-700",
    red:     "bg-red-100 text-red-700",
    slate:   "bg-slate-100 text-slate-600",
    violet:  "bg-violet-100 text-violet-700",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${m[color]}`}>{label}</span>;
}

function DataTable({
  headers, rows, emptyMsg = "No records found.",
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  emptyMsg?: string;
}) {
  return (
    <div className={`${cardCls} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.length === 0
              ? <tr><td colSpan={headers.length} className="py-10 text-center text-xs text-slate-400">{emptyMsg}</td></tr>
              : rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-slate-700">{cell}</td>
                  ))}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HowItWorks({ title = "How This Works", points }: { title?: string; points: string[] }) {
  return (
    <div className={`${cardCls} p-5`}>
      <p className="mb-3 text-sm font-bold text-slate-700">{title}</p>
      <ul className="space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">{i + 1}</span>
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Chart Primitives (pure SVG/CSS, zero external deps) ─────────────────────

/** Circular progress ring */
function ProgressRing({ percent, color = "emerald", size = 80, label }: {
  percent: number; color?: string; size?: number; label?: string;
}) {
  const r = 32; const c = 2 * Math.PI * r;
  const fill = Math.max(0, Math.min(percent, 100));
  const dash = (fill / 100) * c;
  const clr: Record<string, string> = {
    emerald: "#10b981", blue: "#3b82f6", amber: "#f59e0b",
    red: "#ef4444", violet: "#8b5cf6", rose: "#f43f5e", cyan: "#06b6d4",
  };
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="9" stroke="#f1f5f9" />
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="9"
          stroke={clr[color] ?? clr.emerald}
          strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round" />
      </svg>
      {label !== undefined && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800">{label}</span>
      )}
    </div>
  );
}

/** SVG donut chart with legend */
function DonutChart({ segments, size = 110, center }: {
  segments: { label: string; value: number; color: string; formatted?: string }[];
  size?: number; center?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = 38; const c = 2 * Math.PI * r;
  const clr: Record<string, string> = {
    emerald: "#10b981", blue: "#3b82f6", amber: "#f59e0b",
    red: "#ef4444", violet: "#8b5cf6", slate: "#94a3b8", rose: "#f43f5e", cyan: "#06b6d4",
  };
  let cum = 0;
  return (
    <div className="flex items-center gap-5 flex-wrap">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="16" stroke="#f1f5f9" />
          {segments.map((seg, i) => {
            const len = (seg.value / total) * c;
            const off = -cum;
            cum += len;
            return (
              <circle key={i} cx="50" cy="50" r={r} fill="none" strokeWidth="16"
                stroke={clr[seg.color] ?? "#94a3b8"}
                strokeDasharray={`${len} ${c - len}`} strokeDashoffset={off} />
            );
          })}
        </svg>
        {center && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 text-center leading-tight px-1">{center}</span>
        )}
      </div>
      <div className="space-y-2 flex-1 min-w-0">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: clr[seg.color] ?? "#94a3b8" }} />
            <span className="truncate text-xs text-slate-600">{seg.label}</span>
            <span className="ml-auto text-xs font-semibold text-slate-700 flex-shrink-0">{seg.formatted ?? `${seg.value}%`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Horizontal bar chart */
function BarChart({ data, color = "emerald" }: {
  data: { label: string; value: number; formatted?: string }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const bgClr: Record<string, string> = {
    emerald: "bg-emerald-500", blue: "bg-blue-500", amber: "bg-amber-400",
    violet: "bg-violet-500", rose: "bg-rose-500", cyan: "bg-cyan-500",
  };
  const bar = bgClr[color] ?? bgClr.emerald;
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">{d.label}</span>
            <span className="font-semibold text-slate-700">{d.formatted ?? d.value}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100">
            <div className={`h-2.5 rounded-full ${bar} transition-all duration-700`}
              style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Vertical stacked column chart (SVG) */
function ColumnChart({ categories, series }: {
  categories: string[];
  series: { label: string; color: string; values: number[] }[];
}) {
  const max = Math.max(...series.flatMap((s) => s.values), 1);
  const barH = 120; const barW = 28; const gap = 20;
  const svgW = categories.length * (series.length * (barW + 4) + gap);
  const clr: Record<string, string> = {
    emerald: "#10b981", blue: "#3b82f6", amber: "#f59e0b",
    violet: "#8b5cf6", rose: "#f43f5e", cyan: "#06b6d4",
  };
  return (
    <div className="overflow-x-auto">
      <svg height={barH + 30} style={{ width: "100%", minWidth: Math.max(svgW, 200) }}>
        {categories.map((cat, ci) => {
          const gx = ci * (series.length * (barW + 4) + gap) + gap / 2;
          return (
            <g key={cat}>
              {series.map((s, si) => {
                const h = max > 0 ? (s.values[ci] / max) * barH : 0;
                const x = gx + si * (barW + 4);
                return (
                  <rect key={s.label} x={x} y={barH - h} width={barW} height={h}
                    fill={clr[s.color] ?? "#10b981"} rx="3" opacity="0.85" />
                );
              })}
              <text x={gx + (series.length * (barW + 4)) / 2} y={barH + 18}
                textAnchor="middle" fontSize="10" fill="#64748b">{cat}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: clr[s.color] ?? "#10b981" }} />
            <span className="text-xs text-slate-600">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Vertical milestone timeline */
function MiniTimeline({ steps }: { steps: { label: string; date: string; done: boolean; note?: string }[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
              step.done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
            }`}>
              {step.done ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 && <div className="w-0.5 flex-1 my-1 bg-slate-200" />}
          </div>
          <div className="pb-4">
            <p className={`text-sm font-semibold ${step.done ? "text-slate-800" : "text-slate-400"}`}>{step.label}</p>
            <p className="text-xs text-slate-400">{step.date}</p>
            {step.note && <p className="mt-0.5 text-xs text-slate-500 italic">{step.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Live activity feed */
function ActivityFeed({ items }: { items: { time: string; user: string; action: string; type?: "success"|"warning"|"info" }[] }) {
  const dot: Record<string, string> = { success: "bg-emerald-500", warning: "bg-amber-400", info: "bg-blue-400" };
  return (
    <div className="divide-y divide-slate-50">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition">
          <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${dot[item.type ?? "info"]}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">{item.user}</span>{" "}{item.action}
            </p>
          </div>
          <span className="text-xs text-slate-400 flex-shrink-0">{item.time}</span>
        </div>
      ))}
    </div>
  );
}

/** Stat with ring — compact KPI + ring combo */
function RingKpi({ label, value, sub, percent, color = "emerald" }: {
  label: string; value: string; sub?: string; percent: number; color?: string;
}) {
  return (
    <div className={`${cardCls} p-4 flex items-center gap-4`}>
      <ProgressRing percent={percent} color={color} size={64} label={`${percent}%`} />
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Finance Officer Sections ─────────────────────────────────────────────────

function FundsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-blue-600" to="to-cyan-700"
        eyebrow="Finance Officer · Funds"
        title="Fund Management Centre"
        description="Track every rupee disbursed to your NGO. Monitor CSR grant tranches, release timelines, and fund utilization in one place. All data is synced directly with the corporate partner's Budget & Fund module."
        badge="FY 2025–26 Active" />

      <MetricRow items={[
        { label: "Total Sanctioned",   value: "₹12,50,000", sub: "Full project grant",         color: "blue"    },
        { label: "Released to Date",   value: "₹6,25,000",  sub: "Tranche 1 received",          color: "emerald" },
        { label: "Pending Release",    value: "₹6,25,000",  sub: "Tranche 2 — Aug 2026",       color: "amber"   },
        { label: "Utilization %",      value: "38%",         sub: "₹4,80,000 spent so far",      color: "violet"  },
      ]} />

      {/* Visual breakdown */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`${cardCls} p-5`}>
          <p className="mb-4 text-sm font-bold text-slate-700">Fund Allocation Breakdown</p>
          <DonutChart center="₹12.5L" segments={[
            { label: "Utilized",       value: 38, color: "emerald",  formatted: "₹4,80,000" },
            { label: "Available",      value: 12, color: "blue",     formatted: "₹1,45,000" },
            { label: "Tranche 2",      value: 32, color: "amber",    formatted: "₹4,00,000" },
            { label: "Tranche 3",      value: 18, color: "slate",    formatted: "₹2,25,000" },
          ]} />
        </div>
        <div className={`${cardCls} p-5`}>
          <p className="mb-4 text-sm font-bold text-slate-700">Monthly Fund Burn Rate</p>
          <BarChart color="blue" data={[
            { label: "January 2026",  value: 55000,  formatted: "₹55,000" },
            { label: "February 2026", value: 82000,  formatted: "₹82,000" },
            { label: "March 2026",    value: 1,      formatted: "₹0 (holiday)" },
            { label: "April 2026",    value: 143000, formatted: "₹1,43,000" },
            { label: "May 2026",      value: 200000, formatted: "₹2,00,000" },
          ]} />
        </div>
      </div>

      {/* Tranche release timeline */}
      <div className={`${cardCls} p-5`}>
        <p className="mb-4 text-sm font-bold text-slate-700">Tranche Release Timeline</p>
        <MiniTimeline steps={[
          { label: "Tranche 1 — Inception Grant",  date: "15 Apr 2026", done: true,  note: "₹6,25,000 received · Milestone 1 submitted" },
          { label: "Tranche 2 — Mid-term Release", date: "15 Aug 2026", done: false, note: "UC pending · Milestone 2 in progress" },
          { label: "Tranche 3 — Final Disbursement",date: "15 Dec 2026",done: false, note: "Locked until Tranche 2 UC approved" },
        ]} />
      </div>

      <DataTable
        headers={["Tranche", "Amount", "Release Date", "Status", "Utilized", "UC Submitted"]}
        rows={[
          ["Tranche 1 — Inception",  "₹6,25,000", "15 Apr 2026", <Chip label="Released"  color="emerald" />, "₹4,80,000", <Chip label="Yes" color="emerald" />],
          ["Tranche 2 — Mid-term",   "₹4,00,000", "15 Aug 2026", <Chip label="Upcoming"  color="amber"   />, "—",          <Chip label="Pending" color="amber" />],
          ["Tranche 3 — Final",      "₹2,25,000", "15 Dec 2026", <Chip label="Locked"    color="slate"   />, "—",          <Chip label="—" color="slate" />],
        ]} />

      <HowItWorks points={[
        "Corporate sanction letter details are uploaded by the CSR Manager and reflected here automatically.",
        "Each tranche is released after the previous milestone is approved — this protects both parties.",
        "Finance Officer must upload utilization certificate before the next tranche unlocks.",
        "All fund movements are audit-logged and visible to the corporate partner in real time.",
      ]} />
    </div>
  );
}

function ExpensesSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-blue-600" to="to-indigo-700"
        eyebrow="Finance Officer · Expenses"
        title="Expenditure Tracker"
        description="Log and review all operational expenses against the sanctioned budget. Expense entries feed directly into the utilization reports submitted to the corporate CSR partner for audit sign-off."
        badge="₹4,80,000 spent YTD" />

      <MetricRow items={[
        { label: "Total Expenses (YTD)", value: "₹4,80,000", sub: "Across all categories",     color: "blue"    },
        { label: "Pending Approvals",    value: "3",           sub: "Awaiting manager sign-off", color: "amber"   },
        { label: "Rejected Claims",      value: "1",           sub: "Needs re-submission",       color: "red"     },
        { label: "Budget Remaining",     value: "₹1,45,000",  sub: "Of Tranche 1",              color: "emerald" },
      ]} />

      {/* Spend by category */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`${cardCls} p-5`}>
          <p className="mb-4 text-sm font-bold text-slate-700">Spend by Category</p>
          <BarChart color="blue" data={[
            { label: "Technology",  value: 120000, formatted: "₹1,20,000 (25%)" },
            { label: "Training",    value: 95000,  formatted: "₹95,000 (20%)" },
            { label: "Stationery",  value: 87000,  formatted: "₹87,000 (18%)" },
            { label: "Salaries",    value: 80000,  formatted: "₹80,000 (17%)" },
            { label: "Travel",      value: 60000,  formatted: "₹60,000 (12%)" },
            { label: "Logistics",   value: 38000,  formatted: "₹38,000 (8%)" },
          ]} />
        </div>
        <div className={`${cardCls} p-5`}>
          <p className="mb-4 text-sm font-bold text-slate-700">Approval Status Split</p>
          <DonutChart center="37 claims" segments={[
            { label: "Approved",  value: 33, color: "emerald", formatted: "33 claims" },
            { label: "Pending",   value: 3,  color: "amber",   formatted: "3 claims"  },
            { label: "Rejected",  value: 1,  color: "red",     formatted: "1 claim"   },
          ]} />
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-xs font-semibold text-amber-700">⚠ 3 expenses pending approval — submit before 31 May to stay on-track for Tranche 2 UC.</p>
          </div>
        </div>
      </div>

      <DataTable
        headers={["Date", "Category", "Description", "Amount", "Receipt", "Status"]}
        rows={[
          ["20 May 2026", "Travel",      "Field visit — Nashik zone",  "₹12,000",   <Chip label="Attached" color="emerald" />, <Chip label="Approved"  color="emerald" />],
          ["18 May 2026", "Training",    "Facilitator fees — 2 days",  "₹35,000",   <Chip label="Attached" color="emerald" />, <Chip label="Approved"  color="emerald" />],
          ["15 May 2026", "Stationery",  "Learning kits — 200 units",  "₹48,000",   <Chip label="Missing"  color="red"     />, <Chip label="Pending"   color="amber"   />],
          ["10 May 2026", "Technology",  "Tablets for beneficiaries",  "₹1,20,000", <Chip label="Attached" color="emerald" />, <Chip label="Approved"  color="emerald" />],
          ["5 May 2026",  "Logistics",   "Transport — event day",      "₹8,500",    <Chip label="Attached" color="emerald" />, <Chip label="Rejected"  color="red"     />],
        ]} />

      <HowItWorks points={[
        "Each expense must be tagged to a project phase and budget head — this maps directly to the CSR report categories.",
        "Expenses above ₹50,000 require Operations Manager countersign before Finance Officer can approve.",
        "All receipts and invoices must be attached as PDF — they are stored in the Compliance Vault.",
        "Monthly expense summaries are auto-generated and shared with the corporate CSR desk.",
      ]} />
    </div>
  );
}

function InvoicesSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-cyan-600" to="to-blue-700"
        eyebrow="Finance Officer · Invoices"
        title="Vendor Invoice Management"
        description="Manage all vendor and service-provider invoices in one registry. Invoices are matched against approved expense entries and submitted for payment authorization to the Finance Head."
        badge="5 open invoices" />
      <MetricRow items={[
        { label: "Open Invoices",    value: "5",          sub: "₹2,30,000 total due",     color: "amber"   },
        { label: "Paid This Month",  value: "₹1,10,000",  sub: "4 invoices cleared",       color: "emerald" },
        { label: "Overdue",          value: "1",           sub: "12 days past due",          color: "red"     },
        { label: "Under Review",     value: "2",           sub: "Finance Head approval",     color: "blue"    },
      ]} />
      <DataTable
        headers={["Invoice #", "Vendor", "Amount", "Due Date", "Status"]}
        rows={[
          ["INV-2026-041", "ABC Training Pvt Ltd",   "₹35,000",  "25 May 2026", <Chip label="Open"     color="amber"   />],
          ["INV-2026-040", "Print & Pack Solutions",  "₹18,500",  "22 May 2026", <Chip label="Overdue"  color="red"     />],
          ["INV-2026-038", "Tablet World Retail",     "₹1,20,000","01 Jun 2026", <Chip label="Approved" color="emerald" />],
          ["INV-2026-035", "Field Logistics Co",      "₹8,500",   "30 Apr 2026", <Chip label="Paid"     color="emerald" />],
          ["INV-2026-030", "Catering Services LLP",   "₹22,000",  "15 Apr 2026", <Chip label="Paid"     color="emerald" />],
        ]} />
      <HowItWorks points={[
        "Every invoice must be linked to an approved expense entry before it can be sent for payment.",
        "Finance Officer reviews and approves invoices up to ₹50,000 — above that needs Finance Head.",
        "Paid invoices are archived and attached to the quarterly utilization report automatically.",
        "GST details and PAN of vendors are captured for compliance with Indian CSR regulations.",
      ]} />
    </div>
  );
}

function UtilizationReportsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-indigo-600" to="to-purple-700"
        eyebrow="Finance Officer · Utilization Reports"
        title="Utilization Report Centre"
        description="Generate and submit quarterly utilization reports to your corporate CSR partner. These reports are the primary financial accountability document required by Indian CSR regulations (Section 135)."
        badge="Q2 FY26 due 30 Jun" />
      <MetricRow items={[
        { label: "Reports Submitted", value: "1",     sub: "Q1 FY 2025-26",           color: "emerald" },
        { label: "Pending",           value: "1",     sub: "Q2 due 30 Jun 2026",       color: "amber"   },
        { label: "Approved by Corp",  value: "1",     sub: "CA-certified",             color: "blue"    },
        { label: "Compliance Rate",   value: "100%",  sub: "All deadlines met so far", color: "violet"  },
      ]} />
      <DataTable
        headers={["Period", "Amount Utilized", "Submitted On", "CA Sign-off", "Corporate Status"]}
        rows={[
          ["Q1 FY 2025-26", "₹2,80,000", "10 Apr 2026", <Chip label="Certified" color="emerald" />, <Chip label="Approved" color="emerald" />],
          ["Q2 FY 2025-26", "—",          "Due 30 Jun",  <Chip label="Pending"  color="amber"   />, <Chip label="Awaiting" color="slate"   />],
          ["Q3 FY 2025-26", "—",          "Due 30 Sep",  <Chip label="—"        color="slate"   />, <Chip label="—"        color="slate"   />],
        ]} />
      <HowItWorks points={[
        "Utilization reports must be certified by a Chartered Accountant before submission — upload the signed PDF here.",
        "The corporate partner's Compliance Officer reviews the UC against their disbursement records.",
        "After corporate approval, the next tranche of funds is automatically queued for release.",
        "Non-submission within 30 days of quarter end flags the NGO for audit on the CorpoGN platform.",
      ]} />
    </div>
  );
}

function GrantTrackingSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-teal-600" to="to-emerald-700"
        eyebrow="Finance Officer · Grant Tracking"
        title="Multi-Source Grant Pipeline"
        description="Track all active, applied, and potential grants across CSR corporates, government schemes, and international funders. Maintain a consolidated funding dashboard to plan utilization and reporting timelines."
        badge="3 active funding sources" />
      <MetricRow items={[
        { label: "Total Pipeline Value",  value: "₹23,50,000", sub: "Across all sources",         color: "emerald" },
        { label: "Confirmed / Active",    value: "₹12,50,000", sub: "1 corporate CSR grant",       color: "blue"    },
        { label: "Applied / Shortlisted", value: "₹11,00,000", sub: "2 sources",                   color: "amber"   },
        { label: "Success Rate (FY25)",   value: "67%",         sub: "2 of 3 applications won",     color: "violet"  },
      ]} />
      <DataTable
        headers={["Funder", "Type", "Amount", "Status", "Next Action", "Deadline"]}
        rows={[
          ["Tata Group CSR",     "Corporate CSR",  "₹12,50,000","Active",       <Chip label="Active"       color="emerald" />, "31 Dec 2026"],
          ["DPIIT — Startup India","Government",   "₹3,00,000", "Applied",      <Chip label="Under Review" color="blue"    />, "15 Jun 2026"],
          ["USAID / FCRA",       "International",  "₹8,00,000", "Shortlisted",  <Chip label="Interview"    color="amber"   />, "28 May 2026"],
        ]} />
      <HowItWorks points={[
        "Each grant source has its own reporting format — CorpoGN helps you track which report type is due when.",
        "FCRA-regulated grants require separate accounting and annual FCRA returns — flagged automatically here.",
        "Government grants (DPIIT, PM schemes) need GFR compliance — compliance checklist available per grant.",
        "Pipeline value helps your Operations team plan project capacity and recruitment 6 months ahead.",
      ]} />
    </div>
  );
}

function FinanceAnalyticsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-violet-600" to="to-purple-700"
        eyebrow="Finance Officer · Finance Analytics"
        title="Financial Intelligence Dashboard"
        description="Deep-dive into your NGO's financial health. Compare budget vs. actuals, track burn rate, forecast cash flow, and ensure you meet India's mandatory CSR spend compliance thresholds before the fiscal year closes."
        badge="FY 2025-26 Analysis" />

      <MetricRow items={[
        { label: "Budget Utilization",    value: "38%",       sub: "₹4,80,000 of ₹12,50,000",   color: "emerald" },
        { label: "Monthly Burn Rate",     value: "₹40,000",   sub: "Avg last 3 months",           color: "blue"    },
        { label: "Mandatory CSR Spend",   value: "₹6,25,000", sub: "Required under Sec. 135",     color: "amber"   },
        { label: "Projected Shortfall",   value: "₹0",        sub: "On track — no shortfall",     color: "violet"  },
      ]} />

      {/* Visual analytics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`${cardCls} p-5`}>
          <p className="mb-4 text-sm font-bold text-slate-700">Budget vs Actual by Head</p>
          <div className="space-y-4">
            {[
              { label: "Training & Capacity", budget: 400000, actual: 230000 },
              { label: "Technology & Equip.", budget: 350000, actual: 120000 },
              { label: "Field Operations",    budget: 200000, actual: 80000  },
              { label: "Administration",      budget: 62500,  actual: 30000  },
              { label: "Documentation",       budget: 50000,  actual: 20000  },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">{row.label}</span>
                  <span className="text-slate-400">{Math.round((row.actual / row.budget) * 100)}% used</span>
                </div>
                <div className="relative h-2.5 w-full rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-violet-200 absolute inset-0" />
                  <div className="h-2.5 rounded-full bg-violet-600 absolute left-0"
                    style={{ width: `${(row.actual / row.budget) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Actual: ₹{(row.actual / 1000).toFixed(0)}K</span>
                  <span>Budget: ₹{(row.budget / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`${cardCls} p-5`}>
          <p className="mb-4 text-sm font-bold text-slate-700">Monthly Cash Burn</p>
          <ColumnChart
            categories={["Jan", "Feb", "Mar", "Apr", "May"]}
            series={[{ label: "Spent (₹K)", color: "violet", values: [55, 82, 0, 143, 200] }]}
          />
          <div className="mt-3 rounded-xl bg-violet-50 border border-violet-100 px-4 py-3">
            <p className="text-xs font-medium text-violet-700">📈 Burn rate accelerating — expected to fully utilize Tranche 1 by Jun 2026. Tranche 2 request in progress.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <RingKpi label="Tranche 1 Utilized" value="₹4,80,000" sub="of ₹6,25,000" percent={77} color="emerald" />
        <RingKpi label="Admin % of Grant"   value="₹30,000"   sub="limit is 5%"   percent={48} color="amber"  />
        <RingKpi label="Compliance Score"   value="A+"         sub="All heads on track" percent={94} color="blue" />
      </div>

      <DataTable
        headers={["Budget Head", "Sanctioned", "Utilized", "Remaining", "% Used", "Status"]}
        rows={[
          ["Training & Capacity Building", "₹4,00,000", "₹2,30,000", "₹1,70,000", "57%", <Chip label="On Track"  color="emerald" />],
          ["Technology & Equipment",       "₹3,50,000", "₹1,20,000", "₹2,30,000", "34%", <Chip label="On Track"  color="blue"    />],
          ["Field Operations & Logistics", "₹2,00,000", "₹80,000",  "₹1,20,000",  "40%", <Chip label="On Track"  color="emerald" />],
          ["Administration (max 5%)",      "₹62,500",   "₹30,000",  "₹32,500",    "48%", <Chip label="Watch"     color="amber"   />],
          ["Documentation & Reporting",    "₹50,000",   "₹20,000",  "₹30,000",    "40%", <Chip label="On Track"  color="blue"    />],
          ["Contingency (max 3%)",         "₹37,500",   "₹0",       "₹37,500",    "0%",  <Chip label="Untouched" color="slate"   />],
        ]} />

      <HowItWorks points={[
        "Administration costs must stay under 5% of total grant — any breach triggers a corporate audit flag.",
        "Burn rate is calculated on a rolling 3-month average — used to forecast if you'll fully utilize the grant by year-end.",
        "CSR Section 135 requires NGOs to spend at least the full sanctioned amount within the project period.",
        "This analytics view is shared read-only with the corporate CSR Manager for their quarterly board reporting.",
      ]} />
    </div>
  );
}

// ─── Compliance Officer Sections ──────────────────────────────────────────────

function LegalDocumentsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-emerald-600" to="to-teal-700"
        eyebrow="Compliance Officer · Legal Documents"
        title="Regulatory Document Vault"
        description="Maintain a certified, timestamped repository of all mandatory legal and regulatory documents. Corporates and auditors can request access — documents must be current and CA/CS-certified to maintain your NGO's verified status on CorpoGN."
        badge="4 of 6 mandatory docs uploaded" />
      <MetricRow items={[
        { label: "Mandatory Docs",  value: "4 / 6",  sub: "2 pending upload",          color: "amber"   },
        { label: "Valid Certs",     value: "3",       sub: "12A, 80G, CSR-1",           color: "emerald" },
        { label: "Expiring Soon",   value: "1",       sub: "80G — Mar 2027",            color: "rose"    },
        { label: "Trust Score Pts", value: "+45",     sub: "From documents",            color: "violet"  },
      ]} />
      <DataTable
        headers={["Document", "Validity", "Uploaded On", "Status", "Action"]}
        rows={[
          ["12A Certificate",    "Valid — Dec 2028", "10 Jan 2026", <Chip label="Valid"   color="emerald" />, "View"],
          ["80G Certificate",    "Valid — Mar 2027", "10 Jan 2026", <Chip label="Expiring" color="amber"  />, "Renew"],
          ["CSR-1 Registration", "FY 2025-26",       "12 Feb 2026", <Chip label="Filed"   color="emerald" />, "View"],
          ["FCRA License",       "Not applicable",   "—",           <Chip label="N/A"     color="slate"   />, "—"],
          ["Annual Report",      "FY 2024-25",       "20 Mar 2026", <Chip label="Uploaded" color="emerald"/>, "View"],
          ["Audit Report",       "FY 2024-25",       "—",           <Chip label="Pending" color="red"     />, "Upload"],
        ]} />
      <HowItWorks points={[
        "All documents are encrypted at rest and accessible only to authorised users — your NGO controls who sees what.",
        "CorpoGN alerts you 90 days before any certificate expires so you have time to renew without losing verified status.",
        "Corporate partners can request document bundles for due diligence — you approve each request individually.",
        "Every upload is timestamped and creates an immutable audit log entry visible to your compliance team.",
      ]} />
    </div>
  );
}

function NgoVerificationSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-sky-600" to="to-blue-700"
        eyebrow="Compliance Officer · NGO Verification"
        title="Verification Status Tracker"
        description="CorpoGN's 4-step verification process gives your NGO a verified badge that corporates trust. Verified NGOs appear in the corporate partner search, receive CSR proposals, and get shortlisted for project assignments. Your compliance officer manages this process."
        badge="Step 2 of 4 — Admin Review" />
      <MetricRow items={[
        { label: "Current Step",       value: "2 / 4",  sub: "Admin document review",     color: "blue"    },
        { label: "Docs Submitted",     value: "4 / 6",  sub: "2 mandatory pending",       color: "amber"   },
        { label: "Est. Completion",    value: "3–5 days",sub: "From full doc submission",  color: "emerald" },
        { label: "Verification Score", value: "72 / 100",sub: "Likely to be approved",    color: "violet"  },
      ]} />
      <DataTable
        headers={["Step", "Description", "Status", "Completed On"]}
        rows={[
          ["1 — Document Upload",    "All 6 mandatory docs uploaded and valid",     <Chip label="In Progress" color="amber"   />, "—"],
          ["2 — System Validation",  "Expiry dates, missing docs, duplicates check",<Chip label="Queued"      color="blue"    />, "—"],
          ["3 — Verification Call",  "15-min call with CorpoGN compliance team",    <Chip label="Pending"     color="slate"   />, "—"],
          ["4 — Badge Issued",       "Verified badge visible to all corporates",    <Chip label="Pending"     color="slate"   />, "—"],
        ]} />
      <HowItWorks points={[
        "Upload the remaining 2 documents (Audit Report + FCRA status) to move to the System Validation step immediately.",
        "Verification call is a 15-minute video call with a CorpoGN compliance analyst — you can schedule it from this page.",
        "Once verified, your NGO profile is listed in the corporate partner discovery engine — visibility to 500+ corporates.",
        "Verified status is reviewed annually — keep documents current to maintain the badge without repeating the process.",
      ]} />
    </div>
  );
}

function AuditRequestsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-orange-600" to="to-red-700"
        eyebrow="Compliance Officer · Audit Requests"
        title="Audit Query Management"
        description="Corporates and CorpoGN's compliance engine can raise audit queries against your NGO's financials, documents, or field reports. This panel tracks every open request, response deadline, and resolution — keeping your NGO audit-ready at all times."
        badge="2 open queries" />
      <MetricRow items={[
        { label: "Open Queries",    value: "2",    sub: "Both need response by 5 Jun",  color: "red"     },
        { label: "Closed (FY26)",   value: "5",    sub: "All resolved within SLA",       color: "emerald" },
        { label: "Avg Resolution",  value: "3 days",sub: "Your team's response time",   color: "blue"    },
        { label: "SLA Breach Risk", value: "Low",  sub: "14 days remaining",             color: "violet"  },
      ]} />
      <DataTable
        headers={["Query #", "Raised By", "Topic", "Deadline", "Status"]}
        rows={[
          ["AQ-2026-12", "Tata CSR Compliance", "Q1 UC — invoice mismatch ₹8,500",    "5 Jun 2026",  <Chip label="Open"   color="red"     />],
          ["AQ-2026-11", "CorpoGN Audit Engine","Field beneficiary count discrepancy", "8 Jun 2026",  <Chip label="Open"   color="amber"   />],
          ["AQ-2026-09", "Tata CSR Compliance", "Annual report date validation",       "Resolved",    <Chip label="Closed" color="emerald" />],
          ["AQ-2026-07", "CorpoGN Audit Engine","80G expiry date mismatch",            "Resolved",    <Chip label="Closed" color="emerald" />],
        ]} />
      <HowItWorks points={[
        "Audit queries have a 15-business-day SLA — breach flags your NGO on the corporate's compliance dashboard.",
        "Each query has a dedicated response thread where you can upload supporting documents and write explanations.",
        "Invoice mismatches above ₹5,000 are automatically escalated to the Finance Officer for co-sign.",
        "Consistently fast query resolution improves your Trust Score — shown to corporate partners during partner selection.",
      ]} />
    </div>
  );
}

function ComplianceWorkflowSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-emerald-700" to="to-green-800"
        eyebrow="Compliance Officer · Workflow"
        title="Compliance Workflow Engine"
        description="Your end-to-end compliance checklist powered by CorpoGN's smart workflow engine. Each step is sequenced to match Indian CSR regulations and corporate due diligence requirements — so nothing falls through the cracks."
        badge="Step 2 active" />
      <MetricRow items={[
        { label: "Steps Completed", value: "1 / 4",  sub: "Document upload done",       color: "emerald" },
        { label: "Current Step",    value: "Admin Review", sub: "2–3 business days",     color: "blue"    },
        { label: "Blockers",        value: "1",       sub: "Audit report still missing", color: "amber"   },
        { label: "Projected Done",  value: "2 Jun",   sub: "If docs uploaded today",     color: "violet"  },
      ]} />
      <DataTable
        headers={["Step", "Owner", "Description", "Status", "SLA"]}
        rows={[
          ["1 — Document Upload",   "Compliance Officer", "12A, 80G, CSR-1, Annual & Audit reports, PAN",     <Chip label="In Progress" color="amber"   />, "No fixed SLA"],
          ["2 — Admin Review",      "CorpoGN Team",       "Validate documents, check expiry and authenticity", <Chip label="Queued"      color="blue"    />, "3 business days"],
          ["3 — Verification Call", "Compliance Officer", "15-min call with CorpoGN analyst, Q&A session",    <Chip label="Pending"     color="slate"   />, "Scheduled by NGO"],
          ["4 — Badge Issuance",    "CorpoGN System",     "Verified badge activated, profile goes live",       <Chip label="Pending"     color="slate"   />, "Same day"],
        ]} />
      <HowItWorks points={[
        "The workflow is sequential — you must complete each step before the next one becomes available.",
        "Upload the Audit Report (the remaining missing document) now to unblock the Admin Review step.",
        "If the verification call is missed, it reschedules automatically after 24 hours — you won't lose your place.",
        "After badge issuance, your NGO goes live in the CorpoGN partner marketplace within 2 hours.",
      ]} />
    </div>
  );
}

// ─── Operations Manager Sections ──────────────────────────────────────────────

function ProjectsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-green-600" to="to-emerald-700"
        eyebrow="Operations Manager · Projects"
        title="CSR Project Operations Hub"
        description="Manage the full lifecycle of CSR projects assigned to your NGO. From inception to final report — track deliverables, coordinate with field teams, communicate with corporate partners, and ensure every milestone is hit on time."
        badge="1 active project" />
      <MetricRow items={[
        { label: "Active Projects",    value: "1",         sub: "Digital Literacy Drive",        color: "emerald" },
        { label: "Total Beneficiaries",value: "1,240",     sub: "Registered this project",       color: "blue"    },
        { label: "Project Health",     value: "On Track",  sub: "M2 due 30 Jun — ahead of plan", color: "emerald" },
        { label: "Corporate Rating",   value: "4.8 / 5",   sub: "Partner satisfaction score",    color: "amber"   },
      ]} />
      <DataTable
        headers={["Project", "Corporate Partner", "Phase", "Timeline", "Budget", "Status"]}
        rows={[
          ["Digital Literacy Drive","Tata Group CSR", "Phase 2 — Field Rollout","Apr–Dec 2026","₹12,50,000",<Chip label="Active"    color="emerald" />],
          ["Clean Water Initiative","Infosys CSR",    "Pre-approval",           "TBD",          "₹8,00,000", <Chip label="Proposed"  color="amber"   />],
          ["Women Empowerment",     "Mahindra CSR",   "Completed",              "FY 2024-25",   "₹6,00,000", <Chip label="Completed" color="blue"    />],
        ]} />
      <HowItWorks points={[
        "Projects are assigned by corporate partners after your NGO submits a proposal and gets shortlisted.",
        "Each project has dedicated milestones, a fund tranche schedule, and a shared workspace with the corporate team.",
        "Operations Manager owns the day-to-day delivery — field teams report to you, and you report to the corporate CSR desk.",
        "Project health score is calculated from milestone completion %, budget utilization, and beneficiary count vs. targets.",
      ]} />
    </div>
  );
}

function MilestonesSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-teal-600" to="to-cyan-700"
        eyebrow="Operations Manager · Milestones"
        title="Milestone Delivery Tracker"
        description="Every CSR project is broken into measurable milestones agreed between the NGO and corporate partner. Meeting milestones on time releases the next fund tranche and protects your NGO's trust score. This panel is your delivery control room."
        badge="M1 complete — M2 on track" />

      <MetricRow items={[
        { label: "Milestones Total",    value: "4",         sub: "For current project",           color: "blue"    },
        { label: "Completed",           value: "1",         sub: "M1 — Inception Report",         color: "emerald" },
        { label: "In Progress",         value: "1",         sub: "M2 — Mid-term Review",          color: "amber"   },
        { label: "Days to Next Due",    value: "35 days",   sub: "M2 due 30 Jun 2026",            color: "violet"  },
      ]} />

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Visual timeline */}
        <div className={`${cardCls} p-5`}>
          <p className="mb-4 text-sm font-bold text-slate-700">Project Timeline</p>
          <MiniTimeline steps={[
            { label: "M1 — Inception Report",     date: "30 Apr 2026", done: true,  note: "Approved by Tata CSR · ₹6,25,000 released" },
            { label: "M2 — Mid-term Review",      date: "30 Jun 2026", done: false, note: "35 days remaining · 3 deliverables pending" },
            { label: "M3 — Impact Assessment",    date: "30 Sep 2026", done: false, note: "3rd-party audit required" },
            { label: "M4 — Final Report + UC",    date: "31 Dec 2026", done: false, note: "Project closure" },
          ]} />
        </div>
        {/* Milestone completion ring */}
        <div className={`${cardCls} p-5`}>
          <p className="mb-4 text-sm font-bold text-slate-700">Milestone Progress</p>
          <div className="flex items-center gap-4 justify-center">
            <ProgressRing percent={25} color="emerald" size={100} label="25%" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-slate-700">1 of 4 milestones done</p>
              <p className="text-slate-500 text-xs">Expected completion: Dec 2026</p>
              <div className="space-y-1.5 mt-2">
                {[{ l: "M1 Inception", p: 100, c: "emerald" }, { l: "M2 Mid-term", p: 60, c: "amber" }, { l: "M3 Impact", p: 0, c: "slate" }, { l: "M4 Final", p: 0, c: "slate" }].map((m) => (
                  <div key={m.l} className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-slate-100">
                      <div className={`h-1.5 rounded-full bg-${m.c}-500`} style={{ width: `${m.p}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{m.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-teal-50 border border-teal-100 px-4 py-3">
            <p className="text-xs font-semibold text-teal-700">🎯 On track for M2 delivery. Upload beneficiary data and mid-term photos to submit by 30 Jun.</p>
          </div>
        </div>
      </div>

      <DataTable
        headers={["Milestone", "Deliverable", "Due Date", "Fund Release", "Status", "Submitted"]}
        rows={[
          ["M1 — Inception",        "Inception report + team roster + baseline survey",  "30 Apr 2026", "₹6,25,000 ✓", <Chip label="Completed"   color="emerald" />, "28 Apr 2026"],
          ["M2 — Mid-term Review",  "Mid-term impact report + beneficiary data + photos","30 Jun 2026", "₹4,00,000",   <Chip label="In Progress" color="amber"   />, "Pending"],
          ["M3 — Impact Assessment","3rd-party impact assessment + financial audit",      "30 Sep 2026", "₹2,25,000",   <Chip label="Upcoming"    color="blue"    />, "—"],
          ["M4 — Final Report",     "Final impact report + utilization certificate",      "31 Dec 2026", "—",           <Chip label="Upcoming"    color="slate"   />, "—"],
        ]} />

      <HowItWorks points={[
        "Milestone documents are submitted here and reviewed by the corporate CSR Manager within 5 business days.",
        "Once a milestone is approved, the next tranche is automatically queued for release by the corporate Finance Head.",
        "Delays beyond 30 days from the due date trigger a formal escalation and impact your Trust Score.",
        "Field data (beneficiary count, attendance, photos) must be attached to each milestone submission.",
      ]} />
    </div>
  );
}

function BeneficiaryTrackingSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-pink-600" to="to-rose-700"
        eyebrow="Operations Manager · Beneficiary Tracking"
        title="Beneficiary Impact Registry"
        description="Track every individual your NGO has reached through CSR-funded interventions. Accurate beneficiary data is the cornerstone of impact reporting and is audited by both the corporate partner and government regulators under SEBI CSR guidelines."
        badge="1,240 beneficiaries registered" />
      <MetricRow items={[
        { label: "Total Registered",     value: "1,240",  sub: "Direct beneficiaries",          color: "rose"    },
        { label: "Indirect Reach",       value: "3,200",  sub: "Households and community",      color: "violet"  },
        { label: "Female Beneficiaries", value: "52%",    sub: "643 women and girls",           color: "blue"    },
        { label: "Active This Quarter",  value: "840",    sub: "Attending sessions regularly",  color: "emerald" },
      ]} />
      <DataTable
        headers={["Zone", "Beneficiaries", "Female %", "Sessions Attended", "Dropout Rate"]}
        rows={[
          ["Nashik — Zone 1",  "320", "55%", "Avg 8 of 10", <Chip label="2%" color="emerald" />],
          ["Pune — Zone 2",    "410", "51%", "Avg 9 of 10", <Chip label="1%" color="emerald" />],
          ["Mumbai — Zone 3",  "290", "48%", "Avg 7 of 10", <Chip label="4%" color="amber"   />],
          ["Aurangabad — Z4",  "220", "54%", "Avg 6 of 10", <Chip label="6%" color="amber"   />],
        ]} />
      <HowItWorks points={[
        "Each beneficiary gets a unique NGO-assigned ID — duplicate registration is blocked at the system level.",
        "Aadhaar-based identity verification is optional but boosts the credibility of your impact data with corporates.",
        "Dropout rates above 10% in any zone trigger an automatic review request from the Operations Manager.",
        "Beneficiary data is anonymized in all public reports but full data is available for CA-certified internal audits.",
      ]} />
    </div>
  );
}

function TaskAssignmentSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-slate-700" to="to-slate-900"
        eyebrow="Operations Manager · Task Assignment"
        title="Team Task Management"
        description="Break down project deliverables into tasks and assign them to specific team members by role. Every task has a deadline, priority, and status — giving you full visibility into who is doing what across all field and office operations."
        badge="8 open tasks" />
      <MetricRow items={[
        { label: "Open Tasks",      value: "8",      sub: "Assigned to team",               color: "amber"   },
        { label: "In Progress",     value: "5",      sub: "Active this week",               color: "blue"    },
        { label: "Completed Today", value: "3",      sub: "Closed in last 24h",             color: "emerald" },
        { label: "Overdue",         value: "1",      sub: "Needs immediate attention",      color: "red"     },
      ]} />
      <DataTable
        headers={["Task", "Assigned To", "Role", "Priority", "Due", "Status"]}
        rows={[
          ["Beneficiary form verification", "Pooja Nair",      "Field Coordinator","High",   "25 May", <Chip label="In Progress" color="amber"   />],
          ["M2 report draft",              "Sneha Kulkarni",   "Reporting Exec",   "High",   "20 Jun", <Chip label="Open"        color="blue"    />],
          ["Finance tracker update",       "Rahul Mehta",      "Finance Officer",  "Medium", "28 May", <Chip label="Open"        color="blue"    />],
          ["Audit report upload",          "Ananya Sharma",    "Compliance Off.",  "High",   "18 May", <Chip label="Overdue"     color="red"     />],
          ["Zone 4 attendance log",        "Pooja Nair",       "Field Coordinator","Low",    "30 May", <Chip label="In Progress" color="amber"   />],
        ]} />
      <HowItWorks points={[
        "Tasks are linked to specific milestones — completing all tasks in a milestone unlocks the submission button.",
        "High-priority tasks send push notifications to the assigned team member every 24 hours until completed.",
        "Operations Manager gets a daily digest at 9 AM with all overdue and due-today tasks across the team.",
        "Completed tasks are archived and referenced in milestone submissions as evidence of delivery.",
      ]} />
    </div>
  );
}

function PartnershipCommunicationSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-indigo-600" to="to-blue-700"
        eyebrow="Operations Manager · Partnership Comms"
        title="Corporate Partner Communication Hub"
        description="All official communication with your corporate CSR partner happens here — structured, logged, and compliant. From project updates to escalation threads, every message is timestamped and creates a legally-admissible audit trail for your project."
        badge="2 unread messages" />
      <MetricRow items={[
        { label: "Unread Messages", value: "2",          sub: "From Tata CSR desk",          color: "amber"   },
        { label: "Open Threads",    value: "3",          sub: "Awaiting your response",      color: "blue"    },
        { label: "Next Review",     value: "28 May",     sub: "Monthly project sync call",   color: "violet"  },
        { label: "Response SLA",    value: "48 hours",   sub: "Corporate expectation",       color: "slate"   },
      ]} />
      <DataTable
        headers={["Thread", "Corporate Contact", "Last Message", "Status"]}
        rows={[
          ["M2 Report Timeline Query",    "Priya Sharma — Tata CSR","20 May 2026 — 3:12 PM", <Chip label="Unread"   color="amber"   />],
          ["Beneficiary Count Discrepancy","Ajay Nair — Tata Audit", "18 May 2026 — 10:45 AM",<Chip label="Unread"   color="amber"   />],
          ["Monthly Project Sync Agenda", "Priya Sharma — Tata CSR","15 May 2026 — 9:00 AM", <Chip label="Replied"  color="emerald" />],
          ["Invoice INV-2026-040 Query",  "Tata Finance Desk",       "12 May 2026 — 2:30 PM", <Chip label="Resolved" color="blue"    />],
        ]} />
      <HowItWorks points={[
        "All messages are E2E encrypted and archived — they form part of the project's legal documentation.",
        "Communications outside this platform (WhatsApp, email) are not recognised as official project comms.",
        "Escalation threads are automatically CC'd to CorpoGN's relationship manager for mediation if needed.",
        "Monthly sync call agendas are auto-generated from open tasks and milestone status — exported as PDF.",
      ]} />
    </div>
  );
}

function ReportDraftsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-amber-600" to="to-orange-700"
        eyebrow="Operations Manager · Report Drafts"
        title="Impact Report Drafting Studio"
        description="Collaborate with your Reporting Executive to draft, review, and finalise impact reports before submission to the corporate partner. Reports must meet CorpoGN's standardised template — deviation triggers a revision request from the corporate compliance team."
        badge="Q1 report — 80% done" />
      <MetricRow items={[
        { label: "Active Drafts",    value: "1",    sub: "Q1 Impact Report",            color: "amber"   },
        { label: "Completion %",     value: "80%",  sub: "4 of 5 sections filled",      color: "emerald" },
        { label: "Review Rounds",    value: "2",    sub: "Ops + Reporting Exec sign-off",color: "blue"    },
        { label: "Submit Deadline",  value: "31 May",sub: "Tied to M2 submission",      color: "red"     },
      ]} />
      <DataTable
        headers={["Report", "Period", "Author", "Sections", "Last Edit", "Status"]}
        rows={[
          ["Q1 Impact Report",  "Jan–Mar 2026","Sneha Kulkarni","4/5 complete","22 May 2026",<Chip label="In Review"   color="amber"   />],
          ["Mid-Year Review",   "Jan–Jun 2026","Not assigned", "0/5",          "—",           <Chip label="Not Started" color="slate"   />],
          ["M1 Inception",      "Apr 2026",    "Sneha Kulkarni","5/5 complete","10 Apr 2026", <Chip label="Submitted"   color="emerald" />],
        ]} />
      <HowItWorks points={[
        "Reports follow CorpoGN's standardised 5-section template: Introduction, Activities, Beneficiaries, Financials, Outcomes.",
        "Reporting Executive drafts the narrative — Operations Manager reviews for factual accuracy before sign-off.",
        "Once the Ops Manager approves, the report is locked and submitted with a digital signature to the corporate partner.",
        "Corporate partner has 10 business days to approve or raise revision requests — tracked in the Communication Hub.",
      ]} />
    </div>
  );
}

// ─── Field Coordinator Sections ───────────────────────────────────────────────

function AssignedProjectsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-green-600" to="to-teal-700"
        eyebrow="Field Coordinator · Assigned Projects"
        title="Your Field Project Assignments"
        description="As Field Coordinator, you are responsible for on-ground delivery of CSR project activities. This panel shows your active assignments, session schedules, zone responsibilities, and daily targets. Your field data directly feeds into milestone reports reviewed by the corporate partner."
        badge="1 active zone assignment" />
      <MetricRow items={[
        { label: "Active Assignments", value: "1",       sub: "Digital Literacy — Zone 3",  color: "emerald" },
        { label: "Sessions Completed", value: "12 / 20", sub: "60% of target",              color: "blue"    },
        { label: "Beneficiaries Today",value: "58",      sub: "Attending current session",  color: "amber"   },
        { label: "Next Session",        value: "Tomorrow",sub: "9 AM — Pune Zone 3 Centre", color: "violet"  },
      ]} />
      <DataTable
        headers={["Assignment", "Zone", "Sessions Done", "Next Session", "Status"]}
        rows={[
          ["Digital Literacy Drive", "Zone 3 — Pune",    "12 of 20", "26 May 2026, 9 AM", <Chip label="Active"    color="emerald" />],
          ["Health Camp Support",    "Pune City Centre", "0 of 1",   "5 Jun 2026, 8 AM",  <Chip label="Scheduled" color="blue"    />],
        ]} />
      <HowItWorks points={[
        "Session data (attendance, beneficiary forms, photos) must be uploaded within 24 hours of each session.",
        "Any session cancellation must be reported here with a reason — it triggers a reschedule request to Ops Manager.",
        "Your zone's beneficiary data feeds directly into the Operations Manager's milestone submission.",
        "Corporate partners can view anonymised field updates from this module during project reviews.",
      ]} />
    </div>
  );
}

function BeneficiaryFormsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-pink-600" to="to-fuchsia-700"
        eyebrow="Field Coordinator · Beneficiary Forms"
        title="Beneficiary Registration & Verification"
        description="Collect, submit, and verify beneficiary registration forms from the field. Each form creates a unique beneficiary record in the NGO's impact registry — which is audited by the corporate partner and reported to the government under CSR regulations."
        badge="47 forms submitted this week" />
      <MetricRow items={[
        { label: "This Week",         value: "47",  sub: "Forms submitted",             color: "emerald" },
        { label: "Pending Review",    value: "12",  sub: "Ops Manager to verify",       color: "amber"   },
        { label: "Rejected",          value: "3",   sub: "Incomplete — needs re-submit", color: "red"     },
        { label: "Total (Project)",   value: "290", sub: "Zone 3 all-time total",       color: "blue"    },
      ]} />
      <DataTable
        headers={["Form ID", "Beneficiary Name", "Submitted On", "Verified By", "Status"]}
        rows={[
          ["BNF-Z3-0290","Meena Patil",     "22 May 2026","Pooja Nair",    <Chip label="Approved"   color="emerald" />],
          ["BNF-Z3-0289","Raju Shinde",     "22 May 2026","—",            <Chip label="Pending"    color="amber"   />],
          ["BNF-Z3-0288","Sunita More",     "21 May 2026","Pooja Nair",    <Chip label="Approved"   color="emerald" />],
          ["BNF-Z3-0285","Ganesh Pawar",    "20 May 2026","—",            <Chip label="Rejected"   color="red"     />],
        ]} />
      <HowItWorks points={[
        "Each form captures name, age, gender, village, UID type, and consent signature — all required for CSR audit.",
        "Offline forms collected in low-connectivity zones can be uploaded in bulk when connectivity is restored.",
        "Rejected forms show the specific field that failed validation — correct and resubmit within 48 hours.",
        "Beneficiary count from verified forms automatically updates the Operations Manager's milestone dashboard.",
      ]} />
    </div>
  );
}

function FieldUpdatesSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-green-700" to="to-lime-600"
        eyebrow="Field Coordinator · Field Updates"
        title="Real-Time Field Reporting"
        description="Post session completion reports, field observations, and incident notes directly from the field. These updates create a live activity log that the Operations Manager and corporate partner can access — building transparency and accountability into every project day."
        badge="4 updates posted this week" />
      <MetricRow items={[
        { label: "Updates This Week",  value: "4",    sub: "All sessions logged",         color: "emerald" },
        { label: "Pending Drafts",     value: "1",    sub: "Save as draft — complete now",color: "amber"   },
        { label: "Photo Attachments",  value: "28",   sub: "Uploaded with updates",       color: "blue"    },
        { label: "Corporate Views",    value: "12",   sub: "Tata CSR team read count",    color: "violet"  },
      ]} />
      <DataTable
        headers={["Update", "Session", "Posted", "Photos", "Corporate Viewed"]}
        rows={[
          ["Session 12 completion — 58 attended",      "Zone 3, Batch A","22 May, 6 PM","8",  "Yes"],
          ["Session 11 — attendance low (42/60)",      "Zone 3, Batch B","20 May, 5 PM","5",  "Yes"],
          ["Session 10 — equipment issue noted",       "Zone 3, Batch A","18 May, 7 PM","3",  "Yes"],
          ["Session 9 — strong participation report",  "Zone 3, Batch B","15 May, 5 PM","12", "Yes"],
        ]} />
      <HowItWorks points={[
        "Post an update within 6 hours of each session — delayed updates are flagged in your compliance score.",
        "Session updates with fewer than 3 photos are marked as incomplete and sent back for re-submission.",
        "Incident reports (accidents, dropouts, venue issues) must be filed within 2 hours and auto-alert the Ops Manager.",
        "Corporate partners receive a weekly digest of all field updates — this builds their confidence in your delivery.",
      ]} />
    </div>
  );
}

function MediaUploadsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-purple-600" to="to-violet-700"
        eyebrow="Field Coordinator · Media Uploads"
        title="Field Media Repository"
        description="Upload photos and short videos from field activities to build a rich evidence bank for your NGO's impact story. Media is used in impact reports, corporate presentations, and annual reports — and must meet CorpoGN's quality and consent standards."
        badge="234 photos uploaded this month" />
      <MetricRow items={[
        { label: "Photos (May)",    value: "234",    sub: "8.4 GB used",                 color: "violet"  },
        { label: "Videos",         value: "8",      sub: "2.1 GB — 12 min total",        color: "blue"    },
        { label: "Storage Used",   value: "1.2 GB", sub: "of 5 GB NGO quota",           color: "amber"   },
        { label: "Consent Forms",  value: "220",    sub: "14 pending digital sign",     color: "rose"    },
      ]} />
      <DataTable
        headers={["File", "Type", "Zone", "Session", "Consent", "Uploaded"]}
        rows={[
          ["zone3-session12-001.jpg","Photo","Zone 3","Session 12","Yes","22 May"],
          ["zone3-session12-002.jpg","Photo","Zone 3","Session 12","Yes","22 May"],
          ["zone3-session11-recap.mp4","Video","Zone 3","Session 11","Yes","20 May"],
          ["zone3-session10-class.jpg","Photo","Zone 3","Session 10","Pending","18 May"],
        ]} />
      <HowItWorks points={[
        "All photos of beneficiaries require a signed consent form — uploading without consent will be blocked.",
        "Photos are auto-tagged with zone, session, and date metadata — making them searchable in the media library.",
        "The Reporting Executive uses this media library directly when drafting impact reports and presentations.",
        "Videos above 100 MB are auto-compressed to 720p — original file is archived for 5 years.",
      ]} />
    </div>
  );
}

function AttendanceSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-sky-600" to="to-indigo-700"
        eyebrow="Field Coordinator · Attendance"
        title="Field Attendance & Session Logs"
        description="Log daily beneficiary and staff attendance for every session. Attendance data is cross-referenced against beneficiary registrations and directly feeds into impact metrics, milestone submissions, and the corporate partner's outcome report."
        badge="91% attendance rate this week" />
      <MetricRow items={[
        { label: "Today's Attendance",  value: "58 / 60", sub: "Zone 3 — morning session",   color: "emerald" },
        { label: "This Week",           value: "91%",     sub: "5 sessions — 290 slots",     color: "blue"    },
        { label: "Staff Present",       value: "18 / 20", sub: "2 on approved leave",        color: "amber"   },
        { label: "Pending Sign-off",    value: "2",       sub: "Sessions need Ops approval", color: "red"     },
      ]} />
      <DataTable
        headers={["Session", "Date", "Beneficiaries", "Staff", "Attendance %", "Status"]}
        rows={[
          ["Zone 3 — Session 12","22 May 2026","58/60","4/4","97%",<Chip label="Logged"  color="emerald" />],
          ["Zone 3 — Session 11","20 May 2026","42/60","3/4","70%",<Chip label="Logged"  color="emerald" />],
          ["Zone 3 — Session 10","18 May 2026","55/60","4/4","92%",<Chip label="Pending" color="amber"   />],
          ["Zone 3 — Session 9", "15 May 2026","60/60","4/4","100%",<Chip label="Logged" color="emerald" />],
        ]} />
      <HowItWorks points={[
        "Mark attendance digitally within 1 hour of session start — paper registers are no longer accepted for CSR reporting.",
        "Attendance below 60% in any session triggers an automatic review note visible to the Operations Manager.",
        "Staff attendance is tracked separately from beneficiary attendance — both are required for milestone submissions.",
        "Cumulative attendance data auto-calculates the 'person-session hours' metric used in impact reports.",
      ]} />
    </div>
  );
}

// ─── Volunteer Sections ───────────────────────────────────────────────────────

function AssignedTasksSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-emerald-500" to="to-green-700"
        eyebrow="Volunteer"
        title="Your Assigned Tasks"
        description="Welcome to CorpoGN! As a volunteer, you play a vital role in delivering CSR impact on the ground. This panel shows all tasks assigned to you by the Operations Manager — complete them on time to build your volunteer credibility score on the platform."
        badge="3 tasks this week" />
      <MetricRow items={[
        { label: "Open Tasks",     value: "2",  sub: "Due this week",               color: "amber"   },
        { label: "Completed",      value: "1",  sub: "Survey distribution done",    color: "emerald" },
        { label: "Volunteer Score","value": "88 / 100", sub: "Top 15% of volunteers",color: "violet" },
        { label: "Hours Logged",   value: "24h",sub: "This month",                  color: "blue"    },
      ]} />
      <DataTable
        headers={["Task", "Project", "Priority", "Due Date", "Status"]}
        rows={[
          ["Beneficiary list data entry",  "Digital Literacy","High",   "25 May 2026",<Chip label="Open"      color="amber"   />],
          ["Event setup — Health Camp",    "Health Camp",     "Medium", "5 Jun 2026", <Chip label="Upcoming"  color="blue"    />],
          ["Survey form distribution",     "Digital Literacy","Low",    "Completed",  <Chip label="Completed" color="emerald" />],
        ]} />
      <HowItWorks points={[
        "Complete tasks and mark them done here — your Operations Manager gets notified instantly.",
        "Your volunteer score is calculated from on-time completion rate, hours logged, and quality ratings.",
        "High-scoring volunteers are first considered for paid field coordinator roles as the NGO grows.",
        "All volunteer contributions are tracked and reflected in the NGO's corporate impact report.",
      ]} />
    </div>
  );
}

function EventParticipationSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-fuchsia-600" to="to-pink-700"
        eyebrow="Volunteer · Events"
        title="Event Participation Centre"
        description="Browse and register for NGO events, community drives, and CSR-funded workshops in your area. Your participation creates direct impact — and every event you attend builds your volunteer profile, which is visible to corporates and NGOs on CorpoGN."
        badge="1 upcoming event" />
      <MetricRow items={[
        { label: "Events Attended",  value: "1",       sub: "Digital Literacy Session 12", color: "emerald" },
        { label: "Upcoming",         value: "1",       sub: "Health Camp — 5 Jun",         color: "blue"    },
        { label: "Total Hours",      value: "14h",     sub: "Across all events",           color: "violet"  },
        { label: "Impact Points",    value: "220",     sub: "1 pt per 15 min volunteered", color: "amber"   },
      ]} />
      <DataTable
        headers={["Event", "Date", "Location", "Hours", "Status"]}
        rows={[
          ["Digital Literacy Drive — Session 12","18 May 2026","Zone 3, Pune",   "3h", <Chip label="Attended"   color="emerald" />],
          ["Health Camp — Pune City",            "5 Jun 2026", "City Centre, Pune","4h (est)", <Chip label="Registered" color="blue"    />],
          ["Community Clean-up Drive",           "TBD",        "Nashik",         "2h (est)", <Chip label="Open"       color="slate"   />],
        ]} />
      <HowItWorks points={[
        "Register for events at least 48 hours in advance so the Field Coordinator can plan logistics.",
        "Events marked 'Open' are accepting volunteers — click Register to join and it appears in your calendar.",
        "Attendance is marked by the Field Coordinator digitally at the event — no manual check-in needed.",
        "Impact Points accumulate across all events and appear on your public CorpoGN volunteer profile.",
      ]} />
    </div>
  );
}

function UploadsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-slate-600" to="to-slate-800"
        eyebrow="Volunteer · Uploads"
        title="File & Evidence Uploads"
        description="Submit photos, forms, and supporting files from your assigned activities. Uploaded files are reviewed by the Field Coordinator and attached to session reports — contributing to the NGO's audit-trail and corporate reporting."
        badge="12 files uploaded this month" />
      <MetricRow items={[
        { label: "Uploaded (May)",   value: "12",   sub: "Photos and documents",         color: "emerald" },
        { label: "Pending Review",   value: "2",    sub: "Field Coordinator to approve",  color: "amber"   },
        { label: "Storage Used",     value: "48 MB",sub: "of 200 MB volunteer quota",    color: "blue"    },
        { label: "Rejected",         value: "0",    sub: "All files accepted so far",    color: "slate"   },
      ]} />
      <DataTable
        headers={["File Name", "Type", "Task", "Uploaded On", "Status"]}
        rows={[
          ["survey-zone3-batch1.pdf","Document","Survey distribution","20 May 2026",<Chip label="Approved" color="emerald" />],
          ["session12-photo-01.jpg", "Photo",   "Event setup",        "22 May 2026",<Chip label="Pending"  color="amber"   />],
          ["session12-photo-02.jpg", "Photo",   "Event setup",        "22 May 2026",<Chip label="Pending"  color="amber"   />],
        ]} />
      <HowItWorks points={[
        "Only files linked to an assigned task will be accepted — free uploads without a task tag are blocked.",
        "Max file size is 10 MB per file and 50 MB per day — for large batches, ask the Field Coordinator to upload.",
        "Approved files are automatically tagged to your task record and contribute to your volunteer score.",
        "Photos of beneficiaries require the Field Coordinator's consent confirmation before they are processed.",
      ]} />
    </div>
  );
}

// ─── Reporting Executive Sections ─────────────────────────────────────────────

function ImpactReportsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-teal-600" to="to-emerald-700"
        eyebrow="Reporting Executive · Impact Reports"
        title="Impact Report Publishing Centre"
        description="Craft, review, and publish NGO impact reports that tell the story of your CSR project's real-world outcomes. Reports are shared with corporate partners, submitted to regulators, and published on your public CorpoGN profile — they are the single most important credibility document for your NGO."
        badge="Q1 report published" />

      <MetricRow items={[
        { label: "Published Reports", value: "1",       sub: "Q1 FY 2025-26",              color: "emerald" },
        { label: "In Draft",          value: "1",       sub: "Mid-year — 80% complete",    color: "amber"   },
        { label: "Downloads (Q1)",    value: "340",     sub: "By corporates and auditors",  color: "blue"    },
        { label: "Avg Review Time",   value: "4 days",  sub: "Ops Manager to approve",     color: "violet"  },
      ]} />

      {/* Report progress + download chart */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`${cardCls} p-5`}>
          <p className="mb-4 text-sm font-bold text-slate-700">Mid-Year Report — Completion</p>
          <div className="space-y-3">
            {[
              { label: "Executive Summary",   done: true  },
              { label: "Activity Log",        done: true  },
              { label: "Beneficiary Data",    done: true  },
              { label: "Financial Overview",  done: true  },
              { label: "SDG Alignment",       done: false },
            ].map((sec) => (
              <div key={sec.label} className="flex items-center gap-3">
                <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${sec.done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                  {sec.done ? "✓" : ""}
                </div>
                <span className={`text-sm ${sec.done ? "text-slate-700" : "text-slate-400"}`}>{sec.label}</span>
                {!sec.done && <Chip label="Pending" color="amber" />}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Overall completion</span><span className="font-semibold text-slate-700">80%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: "80%" }} />
            </div>
          </div>
        </div>
        <div className={`${cardCls} p-5`}>
          <p className="mb-4 text-sm font-bold text-slate-700">Report Downloads Over Time</p>
          <BarChart color="emerald" data={[
            { label: "Q1 Impact Report (Apr)", value: 340, formatted: "340 downloads" },
            { label: "M1 Inception (Apr)",     value: 28,  formatted: "28 downloads"  },
            { label: "Annual FY25 (Mar)",      value: 210, formatted: "210 downloads" },
          ]} />
          <p className="mt-3 text-xs text-slate-400">Downloads by verified corporate users and auditors only.</p>
        </div>
      </div>

      <DataTable
        headers={["Report", "Period", "Sections", "Status", "Published On", "Downloads"]}
        rows={[
          ["Q1 Impact Report",   "Jan–Mar 2026","5/5", <Chip label="Published"  color="emerald" />, "10 Apr 2026","340"],
          ["Mid-Year Report",    "Jan–Jun 2026","4/5", <Chip label="Draft"      color="amber"   />, "—",          "—"],
          ["M1 Inception Report","Apr 2026",    "5/5", <Chip label="Submitted"  color="blue"    />, "15 Apr 2026","28"],
          ["Annual Report FY25", "FY 2024-25",  "5/5", <Chip label="Archived"  color="slate"   />, "31 Mar 2025","210"],
        ]} />

      <HowItWorks points={[
        "Reports follow a 5-section template: Executive Summary, Activities, Beneficiary Data, Financials, SDG Alignment.",
        "Draft is reviewed by the Operations Manager for factual accuracy, then submitted to the corporate CSR Manager.",
        "Published reports appear on your NGO's public CorpoGN profile — increasing visibility to future corporate partners.",
        "Corporate partners use your impact reports for their own CSR board presentations and SEBI filings.",
      ]} />
    </div>
  );
}

function MediaLibrarySection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-purple-600" to="to-fuchsia-700"
        eyebrow="Reporting Executive · Media Library"
        title="Visual Impact Media Library"
        description="Access the full repository of approved field photos, videos, and case studies uploaded by your field team. Use these assets to build compelling impact reports, corporate presentations, and social impact stories that resonate with stakeholders."
        badge="482 approved assets" />
      <MetricRow items={[
        { label: "Photos",       value: "482",   sub: "Across all zones and sessions",   color: "violet"  },
        { label: "Videos",       value: "24",    sub: "12 min total, 720p quality",      color: "blue"    },
        { label: "Case Studies", value: "6",     sub: "Individual beneficiary stories",  color: "emerald" },
        { label: "Used in Reports",value: "134", sub: "Assets placed in published docs", color: "amber"   },
      ]} />
      <DataTable
        headers={["Asset", "Type", "Zone", "Session", "Used In", "Date"]}
        rows={[
          ["zone3-session12-grp.jpg","Photo",     "Zone 3","Session 12","Q1 Report, M2 Slide","22 May"],
          ["zone3-session11-recap.mp4","Video",   "Zone 3","Session 11","Mid-Year Draft",    "20 May"],
          ["beneficiary-story-meena.pdf","Case Study","Zone 3","—",    "Annual Report FY25","15 Apr"],
          ["zone2-session9-outdoor.jpg","Photo",  "Zone 2","Session 9", "Q1 Report",         "15 May"],
        ]} />
      <HowItWorks points={[
        "Only Field Coordinator-approved photos appear here — consent-unverified assets are held in a separate review queue.",
        "Case studies are 500-word beneficiary stories written by you and reviewed by the Operations Manager before publishing.",
        "Assets marked 'Used In Reports' are locked — changes need an Ops Manager override to protect report integrity.",
        "Corporate partners can request a media bundle for their own CSR communications — you approve each request.",
      ]} />
    </div>
  );
}

function AnalyticsViewSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-cyan-600" to="to-sky-700"
        eyebrow="Reporting Executive · Analytics"
        title="Impact Analytics Dashboard"
        description="Quantify and visualise your NGO's real-world outcomes. These metrics are auto-calculated from field data entered across all roles — giving you a single source of truth for beneficiary reach, engagement depth, and outcome quality to include in reports and pitches."
        badge="FY 2025-26 data" />

      <MetricRow items={[
        { label: "Direct Beneficiaries",  value: "1,240", sub: "Across 4 zones",              color: "emerald" },
        { label: "Person-Session Hours",  value: "9,920h",sub: "Total learning hours",         color: "blue"    },
        { label: "Report Downloads",      value: "340",   sub: "By corporates & auditors",    color: "violet"  },
        { label: "Outcome Achievement",   value: "82%",   sub: "vs. project targets",          color: "amber"   },
      ]} />

      {/* Visual analytics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`${cardCls} p-5`}>
          <p className="mb-4 text-sm font-bold text-slate-700">Beneficiary Growth by Zone</p>
          <ColumnChart
            categories={["Nashik", "Pune", "Mumbai", "Aurangabad"]}
            series={[
              { label: "Jan–Mar", color: "cyan",    values: [200, 260, 190, 140] },
              { label: "Apr–Jun", color: "emerald", values: [320, 410, 290, 220] },
            ]}
          />
        </div>
        <div className={`${cardCls} p-5`}>
          <p className="mb-4 text-sm font-bold text-slate-700">Outcome Achievement vs Target</p>
          <BarChart color="cyan" data={[
            { label: "Beneficiaries reached", value: 83, formatted: "83% of 1500 target" },
            { label: "Female beneficiary %",  value: 104,formatted: "104% — exceeding"   },
            { label: "Session attendance",    value: 91, formatted: "91% avg attendance"  },
            { label: "Dropout rate (inv.)",   value: 97, formatted: "3.4% dropout"        },
            { label: "Fund utilization",      value: 77, formatted: "77% of Tranche 1"    },
          ]} />
        </div>
      </div>

      {/* SDG alignment visual */}
      <div className={`${cardCls} p-5`}>
        <p className="mb-4 text-sm font-bold text-slate-700">SDG Alignment — Project Contribution</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[
            { sdg: "SDG 4", label: "Quality Education",  pct: 90, color: "emerald" },
            { sdg: "SDG 5", label: "Gender Equality",    pct: 52, color: "violet"  },
            { sdg: "SDG 8", label: "Decent Work",        pct: 25, color: "amber"   },
            { sdg: "SDG 10",label: "Reduced Inequality", pct: 40, color: "blue"    },
            { sdg: "SDG 17",label: "Partnerships",       pct: 70, color: "cyan"    },
            { sdg: "SDG 1", label: "No Poverty",         pct: 20, color: "rose"    },
          ].map((s) => (
            <div key={s.sdg} className="flex flex-col items-center gap-2">
              <ProgressRing percent={s.pct} color={s.color} size={64} label={`${s.pct}%`} />
              <div className="text-center">
                <p className="text-[11px] font-bold text-slate-700">{s.sdg}</p>
                <p className="text-[9px] text-slate-400 leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DataTable
        headers={["Metric", "Target", "Achieved", "% of Target", "Trend"]}
        rows={[
          ["Direct Beneficiaries",      "1,500",   "1,240",   <Chip label="83%"  color="amber"   />, "↑ +120 this month"],
          ["Person-Session Hours",      "12,000h", "9,920h",  <Chip label="83%"  color="amber"   />, "↑ On Track"],
          ["Female Beneficiary %",      "50%",     "52%",     <Chip label="104%" color="emerald" />, "✓ Exceeding target"],
          ["Dropout Rate (max 10%)",    "<10%",    "3.4%",    <Chip label="✓"    color="emerald" />, "Excellent"],
          ["Utilization Certificate",   "Q1 done", "Approved",<Chip label="100%" color="emerald" />, "On time"],
        ]} />

      <HowItWorks points={[
        "All metrics are auto-pulled from Field Coordinator session logs, beneficiary forms, and Finance Officer data.",
        "Outcome achievement % is compared to the targets set in your project proposal — visible to the corporate partner.",
        "Analytics are refreshed every 24 hours — for real-time data, check the Operations Manager's milestone tracker.",
        "Export any view as a CSV or PDF to include in your impact report or corporate presentation deck.",
      ]} />
    </div>
  );
}

function PresentationsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-rose-600" to="to-pink-700"
        eyebrow="Reporting Executive · Presentations"
        title="Corporate Pitch & Presentation Decks"
        description="Build and manage polished presentations for corporate partners, investor showcases, and CSR proposal pitches. CorpoGN's presentation templates are pre-formatted to match what corporate CSR teams expect — reducing revision cycles and improving proposal success rates."
        badge="2 decks ready" />
      <MetricRow items={[
        { label: "Published Decks",   value: "1",       sub: "Tata CSR project deck",         color: "emerald" },
        { label: "Drafts",            value: "1",       sub: "Annual impact deck",            color: "amber"   },
        { label: "Deck Views",        value: "47",      sub: "By corporate contacts",         color: "blue"    },
        { label: "Proposal Win Rate", value: "67%",     sub: "2 of 3 decks led to projects", color: "violet"  },
      ]} />
      <DataTable
        headers={["Presentation", "Audience", "Last Updated", "Views", "Status"]}
        rows={[
          ["Digital Literacy — Project Deck","Tata CSR Team",    "10 May 2026","32",<Chip label="Shared"    color="emerald" />],
          ["Annual Impact Deck FY25-26",     "All Corporates",   "20 May 2026","15",<Chip label="Draft"     color="amber"   />],
          ["CSR Proposal — Clean Water",     "Infosys CSR",      "5 Apr 2026", "0", <Chip label="Submitted" color="blue"    />],
          ["Green Earth — NGO Overview",     "General / Public", "31 Mar 2025","—", <Chip label="Archived"  color="slate"   />],
        ]} />
      <HowItWorks points={[
        "CorpoGN's templates are built from 50+ real CSR proposal decks — they use the language corporates respond to.",
        "Shared decks generate a view-count and engagement heatmap — you can see exactly which slides corporates spent time on.",
        "Each deck is linked to your NGO's live trust score and document status — so the data on slide 3 is always current.",
        "Proposal decks submitted through the platform are tracked in the Opportunities module — full funnel visibility.",
      ]} />
    </div>
  );
}

// ─── Super Admin — extra sections ────────────────────────────────────────────

function CorporatePartnershipsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-blue-700" to="to-indigo-800"
        eyebrow="Super Admin · Corporate Partnerships"
        title="Corporate Partnership Management"
        description="Your NGO's relationships with corporate CSR partners are the foundation of your funding pipeline. This panel tracks active engagements, proposal pipeline, partnership health scores, and communication history — giving you a 360° view of every corporate relationship."
        badge="1 active partner · 2 in pipeline" />
      <MetricRow items={[
        { label: "Active Partners",    value: "1",     sub: "Tata Group CSR",               color: "emerald" },
        { label: "In Proposal Stage",  value: "2",     sub: "Infosys, Mahindra",            color: "amber"   },
        { label: "Total Funding FY26", value: "₹12.5L",sub: "Across all partners",          color: "blue"    },
        { label: "Avg Satisfaction",   value: "4.8/5", sub: "Corporate partner rating",     color: "violet"  },
      ]} />
      <DataTable
        headers={["Corporate", "Sector", "Engagement", "Project", "Budget", "Relationship Health"]}
        rows={[
          ["Tata Group CSR",      "Conglomerate","Active Partner",    "Digital Literacy",   "₹12.5L", <Chip label="Excellent" color="emerald" />],
          ["Infosys Foundation",  "Technology",  "Proposal Submitted","Clean Water",        "₹8L est.",<Chip label="Promising" color="blue"    />],
          ["Mahindra CSR",        "Auto/Infra",  "Shortlisted",       "Women Empowerment",  "TBD",     <Chip label="Early"     color="amber"   />],
          ["Wipro Foundation",    "Technology",  "Not Engaged",       "—",                  "—",       <Chip label="Prospect"  color="slate"   />],
        ]} />
      <HowItWorks points={[
        "Partnership health score is auto-calculated from response time, milestone delivery, and corporate satisfaction ratings.",
        "All proposal submissions to corporates are tracked here — view status, feedback, and next steps in one place.",
        "CorpoGN's AI recommends which corporates are most likely to fund your NGO based on sector, geography, and SDG alignment.",
        "When a corporate shortlists your NGO, you receive an instant notification and the proposal workspace activates.",
      ]} />
    </div>
  );
}

function ReportsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-slate-700" to="to-slate-900"
        eyebrow="Super Admin · Reports"
        title="Consolidated NGO Reports Centre"
        description="The single source of truth for all reports generated by your NGO — compliance, financial, impact, and milestone. Every report that leaves your NGO is logged here with version history, signatory details, and corporate acknowledgement status."
        badge="4 reports published FY26" />
      <MetricRow items={[
        { label: "Published Reports",  value: "4",    sub: "FY 2025-26",                  color: "emerald" },
        { label: "Drafts In Progress", value: "2",    sub: "Mid-year + Utilization Q2",   color: "amber"   },
        { label: "Corporate Approved", value: "2",    sub: "Q1 Impact + M1 Inception",    color: "blue"    },
        { label: "Pending Approval",   value: "1",    sub: "Q1 Utilization Certificate",  color: "violet"  },
      ]} />
      <DataTable
        headers={["Report", "Type", "Period", "Author", "Corp. Status", "Date"]}
        rows={[
          ["Q1 Impact Report",         "Impact",     "Jan–Mar 26","Sneha Kulkarni","Approved",  "10 Apr 2026"],
          ["M1 Inception Report",      "Milestone",  "Apr 26",    "Sneha Kulkarni","Approved",  "15 Apr 2026"],
          ["Q1 Utilization Certificate","Financial",  "Jan–Mar 26","Rahul Mehta",  "Pending",   "20 Apr 2026"],
          ["Annual Report FY24-25",    "Annual",     "FY 2024-25","Sneha Kulkarni","Archived",  "31 Mar 2025"],
        ]} />
      <HowItWorks points={[
        "Every report submitted through CorpoGN gets a unique timestamp and is tamper-evident — protecting your NGO legally.",
        "Super Admin can retract a report for correction within 24 hours of submission before the corporate reviews it.",
        "CA-certified documents automatically inherit the CA's DSC (Digital Signature Certificate) watermark.",
        "Reports are retained for 7 years per Indian regulatory requirements — auto-archived and retrievable on demand.",
      ]} />
    </div>
  );
}

function AuditLogsSection() {
  return (
    <div className="space-y-6">
      <GradientHero from="from-gray-700" to="to-zinc-900"
        eyebrow="Super Admin · Audit Logs"
        title="Complete Activity Audit Trail"
        description="Every action taken on your NGO's CorpoGN account is recorded in an immutable, timestamped audit log. Audit logs are the backbone of compliance — available for review by your CA, corporate partners, and regulatory authorities during any inspection or due diligence."
        badge="Full audit trail active" />
      <MetricRow items={[
        { label: "Log Entries (30 days)",value: "147",  sub: "Across all team members",     color: "slate"   },
        { label: "High-Risk Actions",    value: "3",    sub: "Require admin review",         color: "red"     },
        { label: "Team Members Logged",  value: "6",    sub: "All roles tracked",            color: "blue"    },
        { label: "Retention Period",     value: "7 yrs",sub: "Per Indian compliance norms",  color: "violet"  },
      ]} />
      <DataTable
        headers={["Timestamp", "User", "Role", "Action", "Risk"]}
        rows={[
          ["22 May 10:32", "Rahul Mehta",   "Finance",     "Expense entry ₹35,000 submitted",       <Chip label="Low"    color="emerald" />],
          ["22 May 09:15", "Pooja Nair",    "Field Coord.","47 beneficiary forms uploaded",          <Chip label="Low"    color="emerald" />],
          ["21 May 16:40", "Ananya Sharma", "Compliance",  "Document upload — Audit Report",         <Chip label="Medium" color="amber"   />],
          ["20 May 11:00", "Admin (You)",   "Super Admin", "New member added: Arjun Singh (Vol.)",   <Chip label="Medium" color="amber"   />],
          ["18 May 09:00", "Sneha Kulkarni","Reporting",   "Q1 Impact Report submitted",             <Chip label="Low"    color="emerald" />],
          ["15 May 11:45", "Admin (You)",   "Super Admin", "NGO Profile updated — address change",  <Chip label="High"   color="red"     />],
        ]} />
      <HowItWorks points={[
        "High-risk actions (profile edits, member removal, report retraction) require a second admin to review within 24h.",
        "Audit logs cannot be edited or deleted — any attempt is itself logged and flagged to CorpoGN's security team.",
        "During a corporate due diligence, you can export a filtered audit log as a signed PDF — one click, instant download.",
        "Log entries are automatically cross-referenced with document uploads and financial entries to detect discrepancies.",
      ]} />
    </div>
  );
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
