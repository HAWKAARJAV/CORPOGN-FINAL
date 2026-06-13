"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useRef } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  FolderKanban,
  GraduationCap,
  HeartPulse,
  HandHeart,
  HeartHandshake,
  LayoutDashboard,
  LineChart,
  Lock,
  LogOut,
  MessageCircle,
  PieChart,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
  TrendingUp,
  Users,
  Wallet,
  Workflow,
  X,
} from "lucide-react";
import { corporateSidebarItems } from "@/lib/corporate";
import {
  defaultNgoCandidates,
  projectNameForFocus,
  type NgoCandidate,
  type ProjectConnection,
} from "@/lib/project-connections";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Corporate = {
  id: string;
  slug: string;
  company_name: string;
  company_email: string;
  access_status: "locked" | "active";
};

type Message = {
  id: string;
  corporate_id: string;
  sender_type: "corporate" | "admin";
  body: string;
  created_at: string;
};

type RoleAccess = {
  id?: string;
  name: string;
  email: string;
  position: string;
  pages: string[];
  isActive?: boolean;
};

const SEEDED_EMPLOYEES: RoleAccess[] = [
  { name: "Ananya Sharma", position: "CSR Manager", email: "ananya.sharma@corporate-giant.example", pages: ["Dashboard", "Master Analytics", "Campaign Management", "NGO Management", "Reports & Approvals", "Employees & Access", "Notifications"], isActive: true },
  { name: "Rohan Mehta", position: "Finance Manager", email: "rohan.mehta@corporate-giant.example", pages: ["Dashboard", "Budget & Fund Tracking", "Reports & Approvals", "Audit & Compliance", "Notifications"], isActive: true },
  { name: "Priya Nair", position: "Compliance Officer", email: "priya.nair@corporate-giant.example", pages: ["Dashboard", "Reports & Approvals", "Audit & Compliance", "Notifications"], isActive: true },
  { name: "Kabir Khan", position: "NGO Manager", email: "kabir.khan@corporate-giant.example", pages: ["Dashboard", "Campaign Management", "NGO Management", "Reports & Approvals", "Notifications"], isActive: true },
  { name: "Sara Iyer", position: "ESG Officer", email: "sara.iyer@corporate-giant.example", pages: ["Dashboard", "ESG & Impact", "Reports & Approvals", "Master Analytics", "Notifications"], isActive: true },
];

type CorporateEmployeeRecord = {
  id: string;
  email: string;
  full_name: string;
  position: string;
  allowed_pages: unknown;
  is_active: boolean;
  corporate_id?: string;
};

type RoleDraft = RoleAccess & {
  password: string;
};

type Sector = "Rural Education" | "Healthcare" | "Women Empowerment";
type Tone = "blue" | "green" | "amber" | "red" | "violet" | "slate";
type Destination =
  | "Dashboard"
  | "Master Analytics"
  | "Campaign Management"
  | "NGO Management"
  | "Project Workspace"
  | "Budget & Fund Tracking"
  | "ESG & Impact"
  | "Reports & Approvals"
  | "AI Insights"
  | "Audit & Compliance"
  | "Employees & Access"
  | "Notifications"
  | "Support / Chat";

type Milestone = {
  id: string;
  title: string;
  status: "Planned" | "In Progress" | "Submitted" | "Verified" | "Delayed";
  dueDate: string;
  tranche: number;
  evidenceRequired: string;
};

type ImpactMetric = {
  label: string;
  target: number;
  actual: number;
  unit: string;
};

type Evidence = {
  id: string;
  title: string;
  type: string;
  status: "Pending" | "Submitted" | "Verified" | "Flagged";
  proof: string;
  submittedOn: string;
};

type Beneficiary = {
  group: string;
  count: number;
  location: string;
  consent: "Complete" | "Partial" | "Not Required";
  proof: string;
  verified: "Verified" | "Submitted" | "Pending";
};

type SectorSpend = {
  sector: Sector;
  category: string;
  allocated: number;
  released: number;
  utilized: number;
  proof: string;
  status: "Verified" | "Submitted" | "Flagged" | "Pending";
};

type Campaign = {
  id: string;
  title: string;
  sector: Sector;
  ngoId: string;
  status: "Active" | "Delayed" | "Review" | "Completed";
  state: string;
  district: string;
  template: string;
  summary: string;
  conductedDates: string;
  impactSummary: string;
  budget: number;
  allocated: number;
  released: number;
  utilized: number;
  pendingRelease: number;
  progress: number;
  risk: "Low" | "Medium" | "High";
  sdg: string;
  nextAction: string;
  milestones: Milestone[];
  metrics: ImpactMetric[];
  beneficiaries: Beneficiary[];
  evidence: Evidence[];
  sectorSpend: SectorSpend[];
};

type NgoPartner = {
  id: string;
  name: string;
  sector: Sector;
  state: string;
  trustScore: number;
  verification: "Verified" | "Under Review" | "Needs Renewal";
  risk: "Low" | "Medium" | "High";
  fieldPerformance: number;
  documents: Array<{
    name: string;
    status: "Valid" | "Expiring" | "Missing" | "Expired";
    receivedOn: string;
    expiresOn?: string;
    owner: string;
    reference: string;
  }>;
};

type Approval = {
  id: string;
  type:
    | "Campaign Approval"
    | "NGO Onboarding"
    | "Budget Allocation"
    | "Fund Release"
    | "Utilization Certificate"
    | "Impact Report";
  title: string;
  campaignId?: string;
  ngoId?: string;
  amount?: number;
  status: "Pending" | "Approved" | "Rejected" | "Revision Requested";
  priority: "Low" | "Medium" | "High" | "Critical";
  owner: string;
  createdAt: string;
  comments: string[];
};

type Report = {
  id: string;
  title: string;
  type: "CSR" | "ESG" | "Financial" | "Impact" | "NGO";
  campaignId?: string;
  status: "Draft" | "Submitted" | "Approved" | "Needs Revision";
  updatedAt: string;
};

type WorkspaceNotification = {
  id: string;
  title: string;
  body: string;
  priority: "Normal" | "High" | "Critical";
  read: boolean;
  destination: Destination;
  campaignId?: string;
  ngoId?: string;
  approvalId?: string;
  createdAt: string;
};

type AuditLog = {
  id: string;
  action: string;
  actor: string;
  entity: string;
  details: string;
  time: string;
};

type AiInsight = {
  id: string;
  title: string;
  body: string;
  severity: "Low" | "Medium" | "High";
  destination: Destination;
  campaignId?: string;
  ngoId?: string;
};

type Issue = {
  id: string;
  title: string;
  owner: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Closed";
  campaignId?: string;
  ngoId?: string;
};

type Workspace = {
  campaigns: Campaign[];
  ngos: NgoPartner[];
  approvals: Approval[];
  reports: Report[];
  notifications: WorkspaceNotification[];
  auditLogs: AuditLog[];
  insights: AiInsight[];
  issues: Issue[];
};

const sidebarIcons: Record<string, React.ElementType> = {
  Dashboard: LayoutDashboard,
  "Master Analytics": BarChart3,
  "Campaign Management": HandHeart,
  "NGO Management": Users,
  "Project Workspace": FolderKanban,
  "Budget & Fund Tracking": Wallet,
  "ESG & Impact": ShieldCheck,
  "Reports & Approvals": FileText,
  "AI Insights": Bot,
  "Audit & Compliance": CheckCircle2,
  "Employees & Access": Users,
  Notifications: Bell,
  "Support / Chat": MessageCircle,
};

const sectorIcons: Record<Sector, React.ElementType> = {
  "Rural Education": GraduationCap,
  Healthcare: HeartPulse,
  "Women Empowerment": HandHeart,
};

const roleAccessPages = corporateSidebarItems.filter(
  (item) => item !== "Support / Chat",
);

function createInitialWorkspace(): Workspace {
  const campaigns: Campaign[] = [
    {
      id: "camp-education",
      title: "Rural Education Mission",
      sector: "Rural Education",
      ngoId: "ngo-learning",
      status: "Active",
      state: "Bihar",
      district: "Gaya + Nalanda",
      template: "Rural school digital learning template",
      summary: "Digital classroom rollout with teacher enablement, baseline learning checks, and verified school infrastructure upgrades.",
      conductedDates: "Apr 02, 2026 - Jun 22, 2026",
      impactSummary: "Improves foundational learning access for rural students through smart classrooms and teacher certification.",
      budget: 8000000,
      allocated: 8000000,
      released: 4600000,
      utilized: 3100000,
      pendingRelease: 0,
      progress: 64,
      risk: "Medium",
      sdg: "SDG 4",
      nextAction: "Verify teacher training milestone",
      milestones: [
        {
          id: "edu-ms-1",
          title: "Map 40 government schools",
          status: "Verified",
          dueDate: "2026-04-18",
          tranche: 900000,
          evidenceRequired: "School MoUs and geo-tagged baseline photos",
        },
        {
          id: "edu-ms-2",
          title: "Install 20 smart classrooms",
          status: "Submitted",
          dueDate: "2026-05-31",
          tranche: 1400000,
          evidenceRequired: "Asset inventory, invoices, installation photos",
        },
        {
          id: "edu-ms-3",
          title: "Train 120 teachers",
          status: "In Progress",
          dueDate: "2026-06-22",
          tranche: 1100000,
          evidenceRequired: "Attendance sheets and certification records",
        },
      ],
      metrics: [
        { label: "Schools covered", target: 40, actual: 24, unit: "schools" },
        { label: "Students reached", target: 12000, actual: 7600, unit: "students" },
        { label: "Teachers trained", target: 120, actual: 62, unit: "teachers" },
        { label: "Learning score uplift", target: 18, actual: 9, unit: "% uplift" },
      ],
      beneficiaries: [
        { group: "Rural students", count: 7600, location: "Gaya", consent: "Not Required", proof: "School enrollment extract", verified: "Verified" },
        { group: "Teachers", count: 62, location: "Nalanda", consent: "Complete", proof: "Training attendance register", verified: "Submitted" },
      ],
      evidence: [
        { id: "edu-ev-1", title: "Baseline school photos", type: "Geo photo", status: "Verified", proof: "GPS batch EDU-GAYA-0426", submittedOn: "Apr 18, 2026" },
        { id: "edu-ev-2", title: "Smart classroom invoices", type: "Invoice", status: "Submitted", proof: "INV-SMART-2041", submittedOn: "May 21, 2026" },
        { id: "edu-ev-3", title: "Teacher attendance register", type: "PDF", status: "Pending", proof: "Awaiting signed register", submittedOn: "Due Jun 22, 2026" },
      ],
      sectorSpend: [
        { sector: "Rural Education", category: "Smart classroom assets", allocated: 3600000, released: 2400000, utilized: 1700000, proof: "Invoices + installation photos", status: "Submitted" },
        { sector: "Rural Education", category: "Teacher training", allocated: 2200000, released: 1100000, utilized: 760000, proof: "Attendance + certificates", status: "Pending" },
        { sector: "Rural Education", category: "School mapping", allocated: 2200000, released: 1100000, utilized: 640000, proof: "MoUs + geo photos", status: "Verified" },
      ],
    },
    {
      id: "camp-health",
      title: "Mobile Healthcare Camps",
      sector: "Healthcare",
      ngoId: "ngo-health",
      status: "Delayed",
      state: "Rajasthan",
      district: "Barmer",
      template: "Rural health camp and referral template",
      summary: "Mobile medical camps with patient screening, medicine distribution, and referral follow-up in remote villages.",
      conductedDates: "Apr 08, 2026 - Jun 19, 2026",
      impactSummary: "Expands primary healthcare access while tracking high-risk referrals and consent-backed patient records.",
      budget: 12000000,
      allocated: 10000000,
      released: 5200000,
      utilized: 4100000,
      pendingRelease: 600000,
      progress: 48,
      risk: "High",
      sdg: "SDG 3",
      nextAction: "Close referral tracking gap",
      milestones: [
        {
          id: "health-ms-1",
          title: "Verify medical staff and licenses",
          status: "Verified",
          dueDate: "2026-04-12",
          tranche: 800000,
          evidenceRequired: "Doctor licenses and mobile unit permissions",
        },
        {
          id: "health-ms-2",
          title: "Complete 40 health camps",
          status: "Delayed",
          dueDate: "2026-05-26",
          tranche: 1800000,
          evidenceRequired: "Camp roster, patient consent, medicine logs",
        },
        {
          id: "health-ms-3",
          title: "Track high-risk referrals",
          status: "In Progress",
          dueDate: "2026-06-19",
          tranche: 1200000,
          evidenceRequired: "Referral slips and follow-up status",
        },
      ],
      metrics: [
        { label: "Health camps completed", target: 100, actual: 38, unit: "camps" },
        { label: "Patients screened", target: 50000, actual: 21400, unit: "people" },
        { label: "Referrals completed", target: 3200, actual: 980, unit: "referrals" },
        { label: "Medicine kits distributed", target: 18000, actual: 7900, unit: "kits" },
      ],
      beneficiaries: [
        { group: "Screened patients", count: 21400, location: "Barmer", consent: "Complete", proof: "Patient consent register", verified: "Submitted" },
        { group: "High-risk referrals", count: 980, location: "Rural PHCs", consent: "Partial", proof: "Referral slips", verified: "Pending" },
      ],
      evidence: [
        { id: "health-ev-1", title: "Patient consent register", type: "Consent", status: "Submitted", proof: "CONS-BRM-0526", submittedOn: "May 26, 2026" },
        { id: "health-ev-2", title: "Medicine stock log", type: "Inventory", status: "Flagged", proof: "STOCK-HEALTH-17", submittedOn: "May 25, 2026" },
        { id: "health-ev-3", title: "Camp photos and doctor roster", type: "Geo photo", status: "Submitted", proof: "GPS-CAMP-BRM", submittedOn: "May 24, 2026" },
      ],
      sectorSpend: [
        { sector: "Healthcare", category: "Camp operations", allocated: 4600000, released: 2600000, utilized: 2100000, proof: "Camp roster + photos", status: "Submitted" },
        { sector: "Healthcare", category: "Medicine procurement", allocated: 3400000, released: 1800000, utilized: 1500000, proof: "Stock register", status: "Flagged" },
        { sector: "Healthcare", category: "Referral follow-up", allocated: 2000000, released: 800000, utilized: 500000, proof: "Referral slips", status: "Pending" },
      ],
    },
    {
      id: "camp-women",
      title: "Women Empowerment Labs",
      sector: "Women Empowerment",
      ngoId: "ngo-nari",
      status: "Review",
      state: "Uttar Pradesh",
      district: "Varanasi + Mirzapur",
      template: "Skill training and microenterprise template",
      summary: "Skill labs for women entrepreneurs with certification, SHG mapping, and seed-grant readiness.",
      conductedDates: "Apr 15, 2026 - Jul 09, 2026",
      impactSummary: "Builds livelihood capacity for women-led microenterprises and links grants to verified training completion.",
      budget: 9000000,
      allocated: 7600000,
      released: 3900000,
      utilized: 2600000,
      pendingRelease: 0,
      progress: 57,
      risk: "Low",
      sdg: "SDG 5",
      nextAction: "Approve seed grant cohort",
      milestones: [
        {
          id: "women-ms-1",
          title: "Enroll 2,000 women",
          status: "Verified",
          dueDate: "2026-04-30",
          tranche: 900000,
          evidenceRequired: "Enrollment forms and SHG mapping",
        },
        {
          id: "women-ms-2",
          title: "Complete first training batch",
          status: "Submitted",
          dueDate: "2026-05-29",
          tranche: 1300000,
          evidenceRequired: "Attendance, curriculum, certification records",
        },
        {
          id: "women-ms-3",
          title: "Distribute 300 seed grants",
          status: "Planned",
          dueDate: "2026-07-09",
          tranche: 1700000,
          evidenceRequired: "Bank transfer records and enterprise plans",
        },
      ],
      metrics: [
        { label: "Women trained", target: 2000, actual: 1120, unit: "women" },
        { label: "Certificates issued", target: 1800, actual: 740, unit: "certificates" },
        { label: "Seed grants", target: 300, actual: 82, unit: "grants" },
        { label: "Income uplift", target: 35, actual: 18, unit: "% uplift" },
      ],
      beneficiaries: [
        { group: "Women trainees", count: 1120, location: "Varanasi", consent: "Complete", proof: "Enrollment + attendance", verified: "Verified" },
        { group: "Self-help groups", count: 84, location: "Mirzapur", consent: "Complete", proof: "SHG partner MoUs", verified: "Verified" },
      ],
      evidence: [
        { id: "women-ev-1", title: "Training attendance sheets", type: "PDF", status: "Submitted", proof: "ATT-VNS-0529", submittedOn: "May 29, 2026" },
        { id: "women-ev-2", title: "Certificate batch", type: "Document", status: "Verified", proof: "CERT-BATCH-01", submittedOn: "May 27, 2026" },
        { id: "women-ev-3", title: "Seed grant bank file", type: "Finance", status: "Pending", proof: "Awaiting bank file", submittedOn: "Due Jul 09, 2026" },
      ],
      sectorSpend: [
        { sector: "Women Empowerment", category: "Training labs", allocated: 3300000, released: 1700000, utilized: 1200000, proof: "Attendance + curriculum", status: "Submitted" },
        { sector: "Women Empowerment", category: "Certification", allocated: 1600000, released: 900000, utilized: 700000, proof: "Certificate batch", status: "Verified" },
        { sector: "Women Empowerment", category: "Seed grants", allocated: 2700000, released: 1300000, utilized: 700000, proof: "Bank transfer file", status: "Pending" },
      ],
    },
  ];

  return {
    campaigns,
    ngos: [
      {
        id: "ngo-learning",
        name: "Rural Learning Trust",
        sector: "Rural Education",
        state: "Bihar",
        trustScore: 86,
        verification: "Verified",
        risk: "Low",
        fieldPerformance: 89,
        documents: [
          { name: "CSR-1", status: "Valid", receivedOn: "Apr 01, 2026", expiresOn: "Mar 31, 2029", owner: "Compliance Officer", reference: "CSR1-RLT-2026" },
          { name: "12A", status: "Valid", receivedOn: "Apr 01, 2026", expiresOn: "Mar 31, 2028", owner: "Compliance Officer", reference: "12A-RLT-2026" },
          { name: "80G", status: "Expiring", receivedOn: "Apr 01, 2026", expiresOn: "Jun 18, 2026", owner: "NGO Manager", reference: "80G-RLT-2026" },
          { name: "Annual Audit", status: "Valid", receivedOn: "Apr 05, 2026", expiresOn: "Sep 30, 2026", owner: "Finance Manager", reference: "AUD-RLT-FY25" },
        ],
      },
      {
        id: "ngo-health",
        name: "Seva Health Foundation",
        sector: "Healthcare",
        state: "Rajasthan",
        trustScore: 78,
        verification: "Under Review",
        risk: "High",
        fieldPerformance: 74,
        documents: [
          { name: "CSR-1", status: "Valid", receivedOn: "Apr 02, 2026", expiresOn: "Mar 31, 2029", owner: "Compliance Officer", reference: "CSR1-SHF-2026" },
          { name: "Medical licenses", status: "Valid", receivedOn: "Apr 06, 2026", expiresOn: "Dec 31, 2026", owner: "Medical Reviewer", reference: "MED-SHF-77" },
          { name: "Patient consent SOP", status: "Missing", receivedOn: "Not received", owner: "Compliance Officer", reference: "Required before approval" },
          { name: "Medicine procurement policy", status: "Expiring", receivedOn: "Apr 08, 2026", expiresOn: "Jun 05, 2026", owner: "Finance Manager", reference: "PROC-SHF-2026" },
        ],
      },
      {
        id: "ngo-nari",
        name: "Nari Udyam Foundation",
        sector: "Women Empowerment",
        state: "Uttar Pradesh",
        trustScore: 91,
        verification: "Verified",
        risk: "Low",
        fieldPerformance: 93,
        documents: [
          { name: "CSR-1", status: "Valid", receivedOn: "Apr 01, 2026", expiresOn: "Mar 31, 2029", owner: "Compliance Officer", reference: "CSR1-NUF-2026" },
          { name: "12A", status: "Valid", receivedOn: "Apr 01, 2026", expiresOn: "Mar 31, 2028", owner: "Compliance Officer", reference: "12A-NUF-2026" },
          { name: "80G", status: "Valid", receivedOn: "Apr 01, 2026", expiresOn: "Mar 31, 2028", owner: "Compliance Officer", reference: "80G-NUF-2026" },
          { name: "SHG partner MoUs", status: "Valid", receivedOn: "Apr 14, 2026", expiresOn: "Apr 13, 2027", owner: "CSR Manager", reference: "MOU-SHG-84" },
        ],
      },
    ],
    approvals: [
      {
        id: "approval-health-release",
        type: "Fund Release",
        title: "Release Rs 6L for Healthcare camp catch-up",
        campaignId: "camp-health",
        ngoId: "ngo-health",
        amount: 600000,
        status: "Pending",
        priority: "High",
        owner: "Finance Manager",
        createdAt: "Today",
        comments: ["Milestone delayed; release requires medicine stock clarification."],
      },
      {
        id: "approval-women-report",
        type: "Impact Report",
        title: "Review Women Empowerment first batch report",
        campaignId: "camp-women",
        ngoId: "ngo-nari",
        status: "Pending",
        priority: "Medium",
        owner: "CSR Head",
        createdAt: "Yesterday",
        comments: ["Impact data ready, seed grant proof pending."],
      },
      {
        id: "approval-health-ngo",
        type: "NGO Onboarding",
        title: "Close Seva Health consent SOP review",
        ngoId: "ngo-health",
        status: "Pending",
        priority: "Critical",
        owner: "Compliance Officer",
        createdAt: "2 days ago",
        comments: ["Sensitive health data workflow needs sign-off."],
      },
    ],
    reports: [
      {
        id: "report-education",
        title: "Rural Education May Impact Pack",
        type: "Impact",
        campaignId: "camp-education",
        status: "Submitted",
        updatedAt: "Today",
      },
      {
        id: "report-esg",
        title: "Q1 ESG Portfolio Summary",
        type: "ESG",
        status: "Draft",
        updatedAt: "Yesterday",
      },
      {
        id: "report-finance",
        title: "Fund Utilization Snapshot",
        type: "Financial",
        status: "Submitted",
        updatedAt: "May 27",
      },
    ],
    notifications: [
      {
        id: "notif-health-risk",
        title: "Healthcare camp milestone delayed",
        body: "40-camp milestone needs evidence and medicine-stock clarification.",
        priority: "Critical",
        read: false,
        destination: "Campaign Management",
        campaignId: "camp-health",
        createdAt: "10 mins ago",
      },
      {
        id: "notif-education-approval",
        title: "Education report ready for review",
        body: "Rural Learning Trust submitted the May impact pack.",
        priority: "High",
        read: false,
        destination: "Reports & Approvals",
        campaignId: "camp-education",
        createdAt: "1 hour ago",
      },
      {
        id: "notif-ngo-doc",
        title: "Consent SOP missing",
        body: "Seva Health Foundation cannot clear healthcare compliance until SOP is uploaded.",
        priority: "Critical",
        read: false,
        destination: "Audit & Compliance",
        ngoId: "ngo-health",
        createdAt: "2 hours ago",
      },
    ],
    auditLogs: [
      {
        id: "audit-1",
        action: "Fund request created",
        actor: "CSR Manager",
        entity: "Mobile Healthcare Camps",
        details: "Rs 6L pending release for delayed health camp catch-up.",
        time: "Today 10:12",
      },
      {
        id: "audit-2",
        action: "Evidence verified",
        actor: "Field Auditor",
        entity: "Rural Education Mission",
        details: "Baseline school photos verified with location metadata.",
        time: "Yesterday 16:40",
      },
      {
        id: "audit-3",
        action: "Report submitted",
        actor: "Nari Udyam Foundation",
        entity: "Women Empowerment Labs",
        details: "First training batch impact report submitted.",
        time: "May 27 11:05",
      },
    ],
    insights: [
      {
        id: "insight-health-delay",
        title: "Healthcare delay risk is rising",
        body: "The camp milestone is 3 days overdue and medicine evidence is flagged.",
        severity: "High",
        destination: "Campaign Management",
        campaignId: "camp-health",
        ngoId: "ngo-health",
      },
      {
        id: "insight-budget",
        title: "Education can absorb unused Q1 budget",
        body: "Rural Education has verified evidence and can use Rs 11L for teacher training.",
        severity: "Medium",
        destination: "Budget & Fund Tracking",
        campaignId: "camp-education",
      },
      {
        id: "insight-ngo-match",
        title: "Nari Udyam is strongest sector match",
        body: "Trust score, field performance, and SHG coverage make it best for women livelihood work.",
        severity: "Low",
        destination: "NGO Management",
        ngoId: "ngo-nari",
      },
      {
        id: "insight-evidence",
        title: "Duplicate evidence check needed",
        body: "Healthcare camp photos and medicine logs need manual validation before release.",
        severity: "High",
        destination: "Audit & Compliance",
        campaignId: "camp-health",
      },
    ],
    issues: [
      {
        id: "issue-health-consent",
        title: "Healthcare consent SOP missing",
        owner: "Compliance Officer",
        severity: "Critical",
        status: "Open",
        ngoId: "ngo-health",
      },
      {
        id: "issue-health-stock",
        title: "Medicine stock log flagged",
        owner: "Finance Manager",
        severity: "High",
        status: "In Progress",
        campaignId: "camp-health",
      },
      {
        id: "issue-education-80g",
        title: "Rural Learning Trust 80G expires soon",
        owner: "NGO Manager",
        severity: "Medium",
        status: "Open",
        ngoId: "ngo-learning",
      },
    ],
  };
}

function normalizePageList(value: unknown) {
  const pages = Array.isArray(value)
    ? value.filter((page): page is string => typeof page === "string")
    : [];

  return pages.length ? pages : ["Dashboard"];
}

function mapCorporateEmployee(employee: CorporateEmployeeRecord): RoleAccess {
  return {
    id: employee.id,
    name: employee.full_name,
    email: employee.email,
    position: employee.position,
    pages: normalizePageList(employee.allowed_pages),
    isActive: employee.is_active,
  };
}

export function CorporateDashboard({ slug }: { slug: string }) {
  const router = useRouter();
  const [corporate, setCorporate] = useState<Corporate | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeItem, setActiveItem] = useState<Destination>("Support / Chat");
  const [messageBody, setMessageBody] = useState("");
  const [employees, setEmployees] = useState<RoleAccess[]>(SEEDED_EMPLOYEES);
  const [viewerAllowedPages, setViewerAllowedPages] = useState<string[] | null>(null);
  const [viewerAccountType, setViewerAccountType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [workspace, setWorkspace] = useState<Workspace>(() => createInitialWorkspace());
  const [activeCampaignId, setActiveCampaignId] = useState("camp-education");
  const [activeNgoId, setActiveNgoId] = useState("ngo-learning");
  const [selectedApprovalId, setSelectedApprovalId] = useState("approval-health-release");
  const [campaignDetailTab, setCampaignDetailTab] = useState("Overview");
  const [projectConnections, setProjectConnections] = useState<ProjectConnection[]>([]);
  const [ngoCandidates, setNgoCandidates] = useState<NgoCandidate[]>(defaultNgoCandidates);
  const [assigningNgoId, setAssigningNgoId] = useState("");

  const isUnlocked = corporate?.access_status === "active";
  const isCorporateEmployee = viewerAccountType === "corporate_employee";
  const canOpenAssignedPages = isUnlocked || isCorporateEmployee;
  const unreadCount = workspace.notifications.filter((notification) => !notification.read).length;

  const visibleSidebarItems = useMemo(() => {
    if (viewerAllowedPages) {
      return corporateSidebarItems.filter((item) => viewerAllowedPages.includes(item));
    }

    return isCorporateEmployee ? [] : corporateSidebarItems;
  }, [isCorporateEmployee, viewerAllowedPages]);

  const lockedItems = useMemo(
    () =>
      new Set<string>(
        visibleSidebarItems.filter(
          (item) => item !== "Support / Chat" && !canOpenAssignedPages,
        ),
      ),
    [canOpenAssignedPages, visibleSidebarItems],
  );

  useEffect(() => {
    let ignore = false;

    async function loadCorporate() {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!session) {
        router.replace("/signin");
        return;
      }

      const accountType = session.user.user_metadata?.account_type as string;
      const metadata = session.user.user_metadata ?? {};
      setViewerAccountType(accountType);

      let employeeRecord: RoleAccess | null = null;
      let corporateQuery;

      if (accountType === "corporate_employee") {
        const metadataPages = normalizePageList(metadata.allowed_pages);
        const metadataCorporateId =
          typeof metadata.corporate_id === "string" ? metadata.corporate_id : "";
        const metadataCorporateSlug =
          typeof metadata.corporate_slug === "string" ? metadata.corporate_slug : "";

        employeeRecord = {
          email: session.user.email ?? "",
          name:
            typeof metadata.full_name === "string"
              ? metadata.full_name
              : session.user.email?.split("@")[0] || "Employee",
          position:
            typeof metadata.position === "string" ? metadata.position : "Employee",
          pages: metadataPages,
          isActive: true,
        };

        setViewerAllowedPages(metadataPages);
        setEmployees([employeeRecord]);
        setActiveItem((current) =>
          metadataPages.includes(current) ? current : (metadataPages[0] as Destination),
        );

        const { data: employeeData, error: employeeError } = await supabaseBrowser
          .from("corporate_employees")
          .select("id, corporate_id, email, full_name, position, allowed_pages, is_active")
          .eq("auth_user_id", session.user.id)
          .single();

        if (employeeData?.is_active) {
          employeeRecord = mapCorporateEmployee(employeeData as CorporateEmployeeRecord);
          setViewerAllowedPages(employeeRecord.pages);
          setEmployees([employeeRecord]);
          setActiveItem((current) =>
            employeeRecord?.pages.includes(current)
              ? current
              : ((employeeRecord?.pages[0] || "Dashboard") as Destination),
          );

          corporateQuery = supabaseBrowser
            .from("corporates")
            .select("id, slug, company_name, company_email, access_status")
            .eq("id", employeeData.corporate_id)
            .single();
        } else if (employeeError && !metadataCorporateId && !metadataCorporateSlug) {
          setErrorMessage("Employee access not found or inactive.");
          setIsLoading(false);
          return;
        } else if (metadataCorporateId) {
          corporateQuery = supabaseBrowser
            .from("corporates")
            .select("id, slug, company_name, company_email, access_status")
            .eq("id", metadataCorporateId)
            .single();
        } else if (metadataCorporateSlug) {
          corporateQuery = supabaseBrowser
            .from("corporates")
            .select("id, slug, company_name, company_email, access_status")
            .eq("slug", metadataCorporateSlug)
            .single();
        } else {
          setErrorMessage("Employee access not found or inactive.");
          setIsLoading(false);
          return;
        }
      } else if (accountType === "corporate") {
        setViewerAllowedPages(null);
        corporateQuery = supabaseBrowser
          .from("corporates")
          .select("id, slug, company_name, company_email, access_status")
          .eq("slug", slug)
          .single();
      } else {
        router.replace("/signin");
        return;
      }

      const { data, error } = await corporateQuery;

      if (ignore) {
        return;
      }

      if (error || !data || data.slug !== slug) {
        setErrorMessage(error?.message || "Corporate profile not found.");
        setIsLoading(false);
        return;
      }

      setCorporate(data as Corporate);

      if (accountType === "corporate") {
        const response = await fetch("/api/corporates/employees", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const result = (await response.json()) as {
          employees?: CorporateEmployeeRecord[];
          error?: string;
        };

        if (response.ok && result.employees) {
          const dbEmployees = result.employees.map(mapCorporateEmployee);
          const combined = [...dbEmployees];
          for (const seeded of SEEDED_EMPLOYEES) {
            if (!combined.some((emp) => emp.email.toLowerCase() === seeded.email.toLowerCase())) {
              combined.push(seeded);
            }
          }
          setEmployees(combined);
        } else if (result.error) {
          setErrorMessage(result.error);
        }

        const { data: messageData, error: messagesError } = await supabaseBrowser
          .from("corporate_messages")
          .select("id, corporate_id, sender_type, body, created_at")
          .eq("corporate_id", data.id)
          .order("created_at", { ascending: true });

        if (messagesError) {
          setErrorMessage(messagesError.message);
        } else {
          setMessages((messageData || []) as Message[]);
        }
      } else if (employeeRecord) {
        setEmployees([employeeRecord]);
        setMessages([]);
      }

      const connectionResponse = await fetch("/api/project-connections", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const connectionResult = (await connectionResponse.json()) as {
        connections?: ProjectConnection[];
        candidates?: NgoCandidate[];
        error?: string;
      };

      if (connectionResponse.ok) {
        setProjectConnections(connectionResult.connections ?? []);
        setNgoCandidates(
          connectionResult.candidates?.length
            ? connectionResult.candidates
            : defaultNgoCandidates,
        );
      } else if (connectionResult.error) {
        setErrorMessage(connectionResult.error);
      }

      setIsLoading(false);
    }

    loadCorporate();

    return () => {
      ignore = true;
    };
  }, [router, slug]);

  useEffect(() => {
    if (!corporate || viewerAccountType !== "corporate") {
      return;
    }

    // ── Channel 1: Corporate admin<->admin chat messages ───────────────────
    const chatChannel = supabaseBrowser
      .channel(`corporate-chat-${corporate.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "corporate_messages",
          filter: `corporate_id=eq.${corporate.id}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((current) =>
            current.some((message) => message.id === incoming.id)
              ? current
              : [...current, incoming],
          );
        },
      )
      .subscribe();

    // ── Channel 2: NGO project updates (realtime sync to corporate) ────────
    // When the NGO posts an update, changes progress, or submits a UC,
    // the corporate Project Workspace updates immediately without refresh.
    const connectionsChannel = supabaseBrowser
      .channel(`corporate-connections-${corporate.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "project_connections",
          filter: `corporate_id=eq.${corporate.id}`,
        },
        (payload) => {
          const raw = payload.new as Record<string, unknown>;
          setProjectConnections((prev) =>
            prev.map((c) =>
              c.id === String(raw.id)
                ? {
                    ...c,
                    latest_update:           typeof raw.latest_update === "string"  ? raw.latest_update           : c.latest_update,
                    progress:                typeof raw.progress === "number"        ? raw.progress                : c.progress,
                    milestone:               typeof raw.milestone === "string"       ? raw.milestone               : c.milestone,
                    status:                  (raw.status as typeof c.status)        ?? c.status,
                    uc_submitted:            typeof raw.uc_submitted === "boolean"   ? raw.uc_submitted            : c.uc_submitted,
                    impact_report_submitted: typeof raw.impact_report_submitted === "boolean" ? raw.impact_report_submitted : c.impact_report_submitted,
                    ngo_milestone_status:    typeof raw.ngo_milestone_status === "string" ? (raw.ngo_milestone_status as typeof c.ngo_milestone_status) : c.ngo_milestone_status,
                    ngo_beneficiary_count:   typeof raw.ngo_beneficiary_count === "number" ? raw.ngo_beneficiary_count : c.ngo_beneficiary_count,
                    document_requests:       Array.isArray(raw.document_requests)
                      ? (raw.document_requests as unknown[]).map(String)
                      : c.document_requests,
                  }
                : c,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(chatChannel);
      supabaseBrowser.removeChannel(connectionsChannel);
    };
  }, [corporate, viewerAccountType]);

  function navigateTo(destination: Destination, focus?: {
    campaignId?: string;
    ngoId?: string;
    approvalId?: string;
  }) {
    setActiveItem(destination);
    if (focus?.campaignId) {
      setActiveCampaignId(focus.campaignId);
      const campaign = workspace.campaigns.find((item) => item.id === focus.campaignId);
      if (campaign) {
        setActiveNgoId(campaign.ngoId);
      }
    }
    if (focus?.ngoId) {
      setActiveNgoId(focus.ngoId);
    }
    if (focus?.approvalId) {
      setSelectedApprovalId(focus.approvalId);
    }
  }

  function appendAudit(action: string, entity: string, details: string, actor = "Corporate Admin") {
    setWorkspace((current) => ({
      ...current,
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          action,
          actor,
          entity,
          details,
          time: "Just now",
        },
        ...current.auditLogs,
      ],
    }));
  }

  function appendNotification(notification: Omit<WorkspaceNotification, "id" | "createdAt" | "read">) {
    setWorkspace((current) => ({
      ...current,
      notifications: [
        {
          id: `notif-${Date.now()}`,
          createdAt: "Just now",
          read: false,
          ...notification,
        },
        ...current.notifications,
      ],
    }));
  }

  function requestFundRelease(campaignId: string) {
    const campaign = workspace.campaigns.find((item) => item.id === campaignId);
    if (!campaign) {
      return;
    }

    const nextMilestone =
      campaign.milestones.find((milestone) => milestone.status === "Submitted") ||
      campaign.milestones.find((milestone) => milestone.status === "In Progress") ||
      campaign.milestones[0];
    const amount = nextMilestone?.tranche || 500000;
    const approvalId = `approval-release-${Date.now()}`;

    setWorkspace((current) => ({
      ...current,
      campaigns: current.campaigns.map((item) =>
        item.id === campaignId
          ? { ...item, pendingRelease: item.pendingRelease + amount }
          : item,
      ),
      approvals: [
        {
          id: approvalId,
          type: "Fund Release",
          title: `Release ${formatINR(amount)} for ${campaign.title}`,
          campaignId,
          ngoId: campaign.ngoId,
          amount,
          status: "Pending",
          priority: campaign.risk === "High" ? "High" : "Medium",
          owner: "Finance Manager",
          createdAt: "Just now",
          comments: [`Linked milestone: ${nextMilestone?.title || "Program tranche"}`],
        },
        ...current.approvals,
      ],
    }));

    setSelectedApprovalId(approvalId);
    appendAudit("Fund release requested", campaign.title, `${formatINR(amount)} added to approval queue.`);
    appendNotification({
      title: "Fund release approval created",
      body: `${campaign.title} now waits for Finance Manager review.`,
      priority: "High",
      destination: "Reports & Approvals",
      campaignId,
      ngoId: campaign.ngoId,
      approvalId,
    });
    setActiveItem("Reports & Approvals");
  }

  function verifyNextMilestone(campaignId: string) {
    const campaign = workspace.campaigns.find((item) => item.id === campaignId);
    if (!campaign) {
      return;
    }

    const milestone = campaign.milestones.find((item) => item.status !== "Verified");
    if (!milestone) {
      return;
    }

    setWorkspace((current) => ({
      ...current,
      campaigns: current.campaigns.map((item) =>
        item.id === campaignId
          ? {
              ...item,
              progress: Math.min(100, item.progress + 12),
              utilized: Math.min(item.released, item.utilized + milestone.tranche),
              status: item.status === "Delayed" ? "Active" : item.status,
              risk: item.risk === "High" ? "Medium" : item.risk,
              milestones: item.milestones.map((candidate) =>
                candidate.id === milestone.id
                  ? { ...candidate, status: "Verified" }
                  : candidate,
              ),
              evidence: item.evidence.map((evidence) =>
                evidence.status === "Submitted" ? { ...evidence, status: "Verified" } : evidence,
              ),
            }
          : item,
      ),
      reports: [
        {
          id: `report-milestone-${Date.now()}`,
          title: `${campaign.title} milestone verification note`,
          type: "Impact",
          campaignId,
          status: "Submitted",
          updatedAt: "Just now",
        },
        ...current.reports,
      ],
    }));

    appendAudit("Milestone verified", campaign.title, `${milestone.title} verified and ESG evidence updated.`, "Field Auditor");
    appendNotification({
      title: "Milestone verified",
      body: `${campaign.title}: ${milestone.title} now updates ESG and reporting readiness.`,
      priority: "Normal",
      destination: "ESG & Impact",
      campaignId,
      ngoId: campaign.ngoId,
    });
  }

  function generateCampaignReport(campaignId: string) {
    const campaign = workspace.campaigns.find((item) => item.id === campaignId);
    if (!campaign) {
      return;
    }

    const reportId = `report-${Date.now()}`;
    const approvalId = `approval-report-${Date.now()}`;

    setWorkspace((current) => ({
      ...current,
      reports: [
        {
          id: reportId,
          title: `${campaign.title} board-ready impact report`,
          type: "Impact",
          campaignId,
          status: "Submitted",
          updatedAt: "Just now",
        },
        ...current.reports,
      ],
      approvals: [
        {
          id: approvalId,
          type: "Impact Report",
          title: `Approve generated report for ${campaign.title}`,
          campaignId,
          ngoId: campaign.ngoId,
          status: "Pending",
          priority: "Medium",
          owner: "CSR Head",
          createdAt: "Just now",
          comments: ["Generated from campaign milestones, evidence, and impact metrics."],
        },
        ...current.approvals,
      ],
    }));

    setSelectedApprovalId(approvalId);
    appendAudit("Report generated", campaign.title, "Impact report added to approvals.");
    appendNotification({
      title: "Report generated",
      body: `${campaign.title} report is ready for CSR Head approval.`,
      priority: "High",
      destination: "Reports & Approvals",
      campaignId,
      ngoId: campaign.ngoId,
      approvalId,
    });
    setActiveItem("Reports & Approvals");
  }

  function decideApproval(approvalId: string, decision: Approval["status"]) {
    const approval = workspace.approvals.find((item) => item.id === approvalId);
    if (!approval) {
      return;
    }

    setWorkspace((current) => ({
      ...current,
      approvals: current.approvals.map((item) =>
        item.id === approvalId
          ? {
              ...item,
              status: decision,
              comments: [`${decision} just now`, ...item.comments],
            }
          : item,
      ),
      campaigns: current.campaigns.map((campaign) => {
        if (campaign.id !== approval.campaignId) {
          return campaign;
        }

        if (decision === "Approved" && approval.type === "Fund Release" && approval.amount) {
          return {
            ...campaign,
            released: campaign.released + approval.amount,
            pendingRelease: Math.max(0, campaign.pendingRelease - approval.amount),
          };
        }

        return campaign;
      }),
      reports: current.reports.map((report) =>
        report.campaignId === approval.campaignId && approval.type === "Impact Report"
          ? {
              ...report,
              status: decision === "Approved" ? "Approved" : "Needs Revision",
              updatedAt: "Just now",
            }
          : report,
      ),
    }));

    appendAudit(
      `${approval.type} ${decision.toLowerCase()}`,
      approval.title,
      approval.amount ? `${formatINR(approval.amount)} workflow updated.` : "Approval workflow updated.",
      approval.owner,
    );
    appendNotification({
      title: `${approval.type} ${decision.toLowerCase()}`,
      body: approval.title,
      priority: decision === "Approved" ? "Normal" : "High",
      destination: approval.type === "Fund Release" ? "Budget & Fund Tracking" : "Reports & Approvals",
      campaignId: approval.campaignId,
      ngoId: approval.ngoId,
      approvalId,
    });
  }

  function markNotificationRead(notificationId: string) {
    setWorkspace((current) => ({
      ...current,
      notifications: current.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    }));
  }

  function markAllNotificationsRead() {
    setWorkspace((current) => ({
      ...current,
      notifications: current.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    }));
  }

  function handleSidebarClick(item: string) {
    if (lockedItems.has(item)) {
      setActiveItem("Support / Chat");
      return;
    }

    setActiveItem(item as Destination);
  }

  async function handleLogout() {
    await supabaseBrowser.auth.signOut();
    router.replace("/");
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!corporate || viewerAccountType !== "corporate" || !messageBody.trim()) {
      return;
    }

    setIsSending(true);
    setErrorMessage("");

    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();

    if (!session) {
      router.replace("/signin");
      return;
    }

    const response = await fetch("/api/corporates/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        corporateId: corporate.id,
        body: messageBody,
      }),
    });
    const result = (await response.json()) as {
      message?: Message;
      error?: string;
    };

    setIsSending(false);

    if (!response.ok || !result.message) {
      setErrorMessage(result.error || "Could not send message.");
      return;
    }

    const sentMessage = result.message;

    setMessageBody("");
    setMessages((current) =>
      current.some((message) => message.id === sentMessage.id)
        ? current
        : [...current, sentMessage],
    );
    setCorporate((current) =>
      current ? { ...current, access_status: "active" } : current,
    );
  }

  async function createEmployeeAccess(draft: RoleDraft) {
    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();

    if (!session) {
      router.replace("/signin");
      return { error: "Session expired. Please sign in again." };
    }

    const response = await fetch("/api/corporates/employees", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: draft.name,
        email: draft.email,
        position: draft.position,
        password: draft.password,
        allowedPages: draft.pages,
      }),
    });
    const result = (await response.json()) as {
      employee?: CorporateEmployeeRecord;
      error?: string;
    };

    if (!response.ok || !result.employee) {
      return { error: result.error || "Could not create employee access." };
    }

    const employee = mapCorporateEmployee(result.employee);
    setEmployees((current) => [employee, ...current]);
    return { employee };
  }

  async function assignProjectToNgo(candidate: NgoCandidate) {
    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();

    if (!session) {
      router.replace("/signin");
      return;
    }

    setAssigningNgoId(candidate.id);
    setErrorMessage("");

    const response = await fetch("/api/project-connections", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ngoId: candidate.id.startsWith("demo-") ? undefined : candidate.id,
        ngoName: candidate.name,
        projectName: projectNameForFocus(candidate.focusArea),
        focusArea: candidate.focusArea,
        budget: 2500000,
      }),
    });
    const result = (await response.json()) as {
      connection?: ProjectConnection;
      error?: string;
    };

    setAssigningNgoId("");

    if (!response.ok || !result.connection) {
      setErrorMessage(
        result.error ||
          "Could not assign project. Make sure this NGO is registered on the platform.",
      );
      return;
    }

    setProjectConnections((current) =>
      current.some((connection) => connection.id === result.connection?.id)
        ? current
        : [result.connection as ProjectConnection, ...current],
    );
    setActiveItem("Project Workspace");
  }

  async function requestDocumentForConnection(connectionId: string, documentName: string) {
    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();

    if (!session) {
      router.replace("/signin");
      return;
    }

    const connection = projectConnections.find((c) => c.id === connectionId);
    if (!connection) return;

    if (connection.document_requests.includes(documentName)) {
      return;
    }

    const updatedRequests = [...connection.document_requests, documentName];

    const response = await fetch(`/api/project-connections/${connectionId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_requests: updatedRequests,
      }),
    });

    const result = (await response.json()) as {
      connection?: ProjectConnection;
      error?: string;
    };

    if (!response.ok || !result.connection) {
      throw new Error(result.error || "Could not request document.");
    }

    setProjectConnections((current) =>
      current.map((c) => (c.id === connectionId ? (result.connection as ProjectConnection) : c)),
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <p className="text-sm font-medium text-slate-600">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] font-sans text-slate-900 lg:flex">
      <aside className="fixed inset-x-0 top-0 z-50 flex h-16 flex-row bg-[#0f172a] text-white lg:inset-y-0 lg:left-0 lg:h-auto lg:w-64 lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            CorpoGN
          </span>
        </div>

        <div className="hidden border-b border-white/5 px-4 py-4 lg:block">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-500/20 text-blue-300">
              <Building2 size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {corporate?.company_name || "Corporate Giant"}
              </p>
              <p className="truncate text-xs text-slate-400">Corporate workspace</p>
            </div>
          </div>
          <span
            className={`mt-2.5 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
              isUnlocked
                ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20"
                : "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${ isUnlocked ? "bg-emerald-400" : "bg-amber-400"}`} />
            {isUnlocked ? "Unlocked" : "Chat required"}
          </span>
        </div>

        <nav className="flex flex-1 gap-0.5 overflow-x-auto p-2 lg:block lg:space-y-0.5 lg:overflow-y-auto">
          {visibleSidebarItems.map((item) => {
            const locked = lockedItems.has(item);
            const active = activeItem === item;
            const Icon = sidebarIcons[item] || LayoutDashboard;

            return (
              <button
                className={`group relative flex min-w-fit items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-all lg:w-full ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-white/6 hover:text-slate-200"
                } ${locked ? "cursor-not-allowed opacity-40" : ""}`}
                key={item}
                onClick={() => handleSidebarClick(item)}
                type="button"
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
                <span className="min-w-0 flex-1 whitespace-nowrap font-medium lg:truncate">{item}</span>
                {item === "Notifications" && unreadCount > 0 ? (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                ) : null}
                {locked ? <Lock className="h-3 w-3 text-slate-600" /> : null}
              </button>
            );
          })}
        </nav>

        <div className="hidden border-t border-white/5 p-3 lg:block">
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">Logout</span>
          </button>
        </div>
      </aside>

      <section className="flex min-h-screen min-w-0 flex-1 flex-col pt-16 lg:ml-64 lg:pt-0">
        <header className="sticky top-16 z-40 flex min-h-[60px] items-center justify-between gap-3 border-b border-slate-200/80 bg-white/98 px-4 py-2.5 backdrop-blur-sm lg:top-0 lg:px-6">
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-semibold text-slate-800 tracking-tight">{activeItem}</h1>
            <span className="hidden rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 md:inline-block">
              Corporate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="relative grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:border-slate-300"
              onClick={() => setActiveItem("Notifications")}
              type="button"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 md:flex">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
                <Building2 className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                {corporate?.company_email.split("@")[0] || "Corporate"}
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-5 sm:px-5 lg:p-6">
          {activeItem === "Support / Chat" ? (
            <ChatPanel
              errorMessage={errorMessage}
              isSending={isSending}
              messageBody={messageBody}
              messages={messages}
              onMessageBodyChange={setMessageBody}
              onSendMessage={sendMessage}
              unlocked={isUnlocked}
              workspace={workspace}
            />
          ) : activeItem === "Dashboard" ? (
            <DashboardPage
              companyName={corporate?.company_name || "Corporate Admin"}
              navigateTo={navigateTo}
              unreadCount={unreadCount}
              workspace={workspace}
            />
          ) : activeItem === "Master Analytics" ? (
            <MasterAnalyticsPage
              navigateTo={navigateTo}
              workspace={workspace}
            />
          ) : activeItem === "Campaign Management" ? (
            <CampaignManagementPage
              activeCampaignId={activeCampaignId}
              campaignDetailTab={campaignDetailTab}
              generateCampaignReport={generateCampaignReport}
              navigateTo={navigateTo}
              requestFundRelease={requestFundRelease}
              setActiveCampaignId={setActiveCampaignId}
              setCampaignDetailTab={setCampaignDetailTab}
              verifyNextMilestone={verifyNextMilestone}
              workspace={workspace}
            />
          ) : activeItem === "NGO Management" ? (
            <NgoManagementPage
              activeNgoId={activeNgoId}
              assigningNgoId={assigningNgoId}
              candidates={ngoCandidates}
              connections={projectConnections}
              navigateTo={navigateTo}
              onAssignProject={assignProjectToNgo}
              setActiveNgoId={setActiveNgoId}
              workspace={workspace}
            />
          ) : activeItem === "Project Workspace" ? (
            <ProjectWorkspace connections={projectConnections} onRequestDocument={requestDocumentForConnection} />
          ) : activeItem === "Budget & Fund Tracking" ? (
            <BudgetPage
              navigateTo={navigateTo}
              requestFundRelease={requestFundRelease}
              workspace={workspace}
            />
          ) : activeItem === "ESG & Impact" ? (
            <EsgImpactPage
              navigateTo={navigateTo}
              verifyNextMilestone={verifyNextMilestone}
              workspace={workspace}
            />
          ) : activeItem === "Reports & Approvals" ? (
            <ReportsApprovalsPage
              decideApproval={decideApproval}
              navigateTo={navigateTo}
              selectedApprovalId={selectedApprovalId}
              setSelectedApprovalId={setSelectedApprovalId}
              workspace={workspace}
            />
          ) : activeItem === "AI Insights" ? (
            <AiInsightsPage navigateTo={navigateTo} workspace={workspace} />
          ) : activeItem === "Audit & Compliance" ? (
            <AuditCompliancePage navigateTo={navigateTo} workspace={workspace} />
          ) : activeItem === "Employees & Access" ? (
            <RolePermissions
              canManageEmployees={viewerAccountType === "corporate"}
              employees={employees}
              onCreateEmployee={createEmployeeAccess}
            />
          ) : activeItem === "Notifications" ? (
            <NotificationsPage
              markAllNotificationsRead={markAllNotificationsRead}
              markNotificationRead={markNotificationRead}
              navigateTo={navigateTo}
              workspace={workspace}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}

function DashboardPage({
  companyName,
  navigateTo,
  unreadCount,
  workspace,
}: {
  companyName: string;
  navigateTo: (destination: Destination, focus?: { campaignId?: string; ngoId?: string; approvalId?: string }) => void;
  unreadCount: number;
  workspace: Workspace;
}) {
  const totals = getWorkspaceTotals(workspace);
  const criticalItems = [
    ...workspace.approvals.filter((approval) => approval.status === "Pending").slice(0, 3),
    ...workspace.issues.filter((issue) => issue.status !== "Closed").slice(0, 2),
  ];

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Connected CSR command center"
        title={`Welcome back, ${companyName}`}
        text="Rural education, healthcare, and women empowerment now run from one connected operating workspace."
        actions={
          <>
            <ActionButton icon={FileText} onClick={() => navigateTo("Reports & Approvals")}>
              Review Approvals
            </ActionButton>
            <GhostButton icon={Bot} onClick={() => navigateTo("AI Insights")}>
              Open AI Signals
            </GhostButton>
          </>
        }
      />

      <section className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Annual CSR Budget" value={formatINR(totals.budget)} meta="3 live sector programs" tone="blue" />
        <MetricCard label="Released" value={formatINR(totals.released)} meta={`${totals.releaseRate}% of budget`} tone="green" />
        <MetricCard label="Utilized" value={formatINR(totals.utilized)} meta="UC and evidence linked" tone="violet" />
        <MetricCard label="Pending Approvals" value={String(totals.pendingApprovals)} meta="Across funds, NGO, reports" tone="amber" />
        <MetricCard label="Unread Alerts" value={String(unreadCount)} meta="Notifications requiring action" tone="red" />
      </section>

      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <Card>
          <SectionHeading
            icon={Workflow}
            title="Campaign Operating Board"
            text="Each campaign links directly to NGO, budget, evidence, approvals, and reporting."
          />
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Campaign</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">NGO</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Budget</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 min-w-[120px]">Progress</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Risk</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workspace.campaigns.map((campaign) => {
                  const ngo = getNgo(workspace, campaign.ngoId);
                  return (
                    <tr
                      className="cursor-pointer transition-colors hover:bg-blue-50/40"
                      key={campaign.id}
                      onClick={() => navigateTo("Campaign Management", { campaignId: campaign.id })}
                    >
                      <td className="px-3 py-3.5 align-top">
                        <p className="font-semibold text-slate-900 leading-snug">{campaign.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{campaign.sector} · {campaign.district}</p>
                      </td>
                      <td className="px-3 py-3.5 align-top text-sm text-slate-600 whitespace-nowrap">{ngo?.name}</td>
                      <td className="px-3 py-3.5 align-top text-sm font-semibold text-slate-900 whitespace-nowrap">{formatINR(campaign.budget)}</td>
                      <td className="px-3 py-3.5 align-top min-w-[130px]">
                        <Progress value={campaign.progress} />
                      </td>
                      <td className="px-3 py-3.5 align-top"><RiskBadge value={campaign.risk} /></td>
                      <td className="px-3 py-3.5 align-top text-sm text-slate-600 max-w-[180px]">{campaign.nextAction}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionHeading icon={AlertCircle} title="Priority Queue" text="Click any item to jump to its workflow." />
            <div className="space-y-3">
              {criticalItems.map((item) => {
                const isApproval = "type" in item;
                return (
                  <button
                    className="w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                    key={item.id}
                    onClick={() =>
                      isApproval
                        ? navigateTo("Reports & Approvals", {
                            campaignId: item.campaignId,
                            ngoId: item.ngoId,
                            approvalId: item.id,
                          })
                        : navigateTo("Audit & Compliance", {
                            campaignId: item.campaignId,
                            ngoId: item.ngoId,
                          })
                    }
                    type="button"
                  >
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <p className="min-w-0 break-words text-sm font-semibold text-slate-900">{item.title}</p>
                      <RiskBadge value={isApproval ? item.priority : item.severity} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {isApproval ? item.owner : item.owner}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>
          <Card>
            <SectionHeading icon={Sparkles} title="Priority Signals" text="Signals are derived from the same campaign, budget, NGO, and audit data." />
            <div className="space-y-3">
              {workspace.insights.slice(0, 3).map((insight) => (
                <button
                  className="w-full min-w-0 rounded-md border border-slate-200 bg-white p-3 text-left hover:border-violet-200 hover:bg-violet-50"
                  key={insight.id}
                  onClick={() => navigateTo(insight.destination, { campaignId: insight.campaignId, ngoId: insight.ngoId })}
                  type="button"
                >
                  <p className="break-words text-sm font-semibold text-slate-900">{insight.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{insight.body}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function MasterAnalyticsPage({
  navigateTo,
  workspace,
}: {
  navigateTo: (destination: Destination, focus?: { campaignId?: string; ngoId?: string }) => void;
  workspace: Workspace;
}) {
  // ── Derive available options from real campaign data ────────────────────────
  const FY_OPTIONS     = ["FY 2026-27", "FY 2025-26", "FY 2024-25"];
  const STATE_OPTIONS  = ["All states",  ...Array.from(new Set(workspace.campaigns.map((c) => c.state)))];
  const NGO_OPTIONS    = ["All NGOs",    ...Array.from(new Set(workspace.campaigns.map((c) => c.title)))];
  const STATUS_OPTIONS = ["All statuses",...Array.from(new Set(workspace.campaigns.map((c) => c.status)))];
  const EVIDENCE_OPTIONS = ["All evidence", "Evidence verified", "Evidence pending", "Evidence flagged"];

  const FILTER_DEFS = [
    { key: "fy",       label: "FY 2026-27"      },
    { key: "state",   label: "All states"        },
    { key: "ngo",     label: "All NGOs"          },
    { key: "status",  label: "All statuses"      },
    { key: "evidence",label: "All evidence"      },
  ];

  const FILTER_OPTIONS: Record<string, string[]> = {
    fy:       FY_OPTIONS,
    state:    STATE_OPTIONS,
    ngo:      NGO_OPTIONS,
    status:   STATUS_OPTIONS,
    evidence: EVIDENCE_OPTIONS,
  };

  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    fy:       "FY 2026-27",
    state:    "All states",
    ngo:      "All NGOs",
    status:   "All statuses",
    evidence: "All evidence",
  });

  function handleFilterChange(key: string, value: string) {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  }

  // ── Apply filters to campaigns ──────────────────────────────────────────────
  const filtered = workspace.campaigns.filter((c) => {
    if (activeFilters.state   !== "All states"    && c.state  !== activeFilters.state)  return false;
    if (activeFilters.ngo     !== "All NGOs"      && c.title  !== activeFilters.ngo)    return false;
    if (activeFilters.status  !== "All statuses"  && c.status !== activeFilters.status) return false;
    if (activeFilters.evidence === "Evidence verified" &&
        !c.evidence.some((e) => e.status === "Verified")) return false;
    if (activeFilters.evidence === "Evidence pending" &&
        !c.evidence.some((e) => e.status === "Pending")) return false;
    if (activeFilters.evidence === "Evidence flagged" &&
        !c.evidence.some((e) => e.status === "Flagged")) return false;
    return true;
  });

  const sectorRows = filtered.map((campaign) => {
    const beneficiaryTotal = campaign.beneficiaries.reduce((sum, b) => sum + b.count, 0);
    const metricCompletion = Math.round(
      campaign.metrics.reduce((sum, m) => sum + Math.min(100, (m.actual / m.target) * 100), 0) /
        campaign.metrics.length,
    );
    return { campaign, beneficiaryTotal, metricCompletion };
  });

  // ── Export filtered data as CSV ─────────────────────────────────────────────
  function handleExport() {
    const rows = [
      ["Campaign", "Sector", "State", "Status", "Budget", "Released", "Utilized", "Progress %", "Beneficiaries"].join(","),
      ...filtered.map((c) => [
        `"${c.title}"`, `"${c.sector}"`, `"${c.state}"`, c.status,
        c.budget, c.released, c.utilized, c.progress,
        c.beneficiaries.reduce((s, b) => s + b.count, 0),
      ].join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `corpogn-analytics-${activeFilters.fy.replace(" ", "-")}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Master analytics"
        title="Cause-wise CSR intelligence"
        text="Compare rural education, healthcare, and women empowerment using one connected data model."
        actions={<GhostButton icon={Download} onClick={handleExport}>Export Analytics</GhostButton>}
      />

      <FilterBar
        filters={FILTER_DEFS}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        filterOptions={FILTER_OPTIONS}
      />

      {filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-16 text-center">
            <Filter className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-600">No campaigns match current filters</p>
            <button
              type="button"
              onClick={() => setActiveFilters({ fy: "FY 2026-27", state: "All states", ngo: "All NGOs", status: "All statuses", evidence: "All evidence" })}
              className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >Clear all filters</button>
          </div>
        </Card>
      ) : (
      <section className="grid min-w-0 gap-4 md:grid-cols-3">
        {sectorRows.map(({ campaign, beneficiaryTotal, metricCompletion }) => {
          const Icon = sectorIcons[campaign.sector];
          return (
            <Card key={campaign.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{campaign.sector}</p>
                  <p className="mt-1 text-xs text-slate-500">{campaign.state} - {campaign.sdg}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <MetricLine label="Budget released" value={Math.round((campaign.released / campaign.budget) * 100)} />
                <MetricLine label="Impact completion" value={metricCompletion} />
                <MetricLine label="Progress" value={campaign.progress} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-500">Beneficiaries</span>
                <span className="font-bold text-slate-900">{beneficiaryTotal.toLocaleString("en-IN")}</span>
              </div>
              <button
                className="mt-4 w-full rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                onClick={() => navigateTo("Campaign Management", { campaignId: campaign.id })}
                type="button"
              >
                Open campaign
              </button>
            </Card>
          );
        })}
      </section>
      )}

      <section className="grid min-w-0 gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <SectionHeading icon={BarChart3} title="Portfolio Financial Flow" text="Budget to allocated to released to utilized." />
          <div className="space-y-4">
            {filtered.map((campaign) => (
              <div key={campaign.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{campaign.title}</span>
                  <span className="text-slate-500">{formatINR(campaign.utilized)} utilized</span>
                </div>
                <div className="mt-2 grid h-3 grid-cols-12 overflow-hidden rounded-full bg-slate-100">
                  <div className="bg-blue-500" style={{ gridColumnEnd: `span ${Math.max(1, Math.round((campaign.released / campaign.budget) * 12))}` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHeading icon={LineChart} title="Outcome Readiness" text="Sector-specific impact metrics are normalized for board reporting." />
          <div className="space-y-3">
            {filtered.flatMap((campaign) =>
              campaign.metrics.slice(0, 2).map((metric) => (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3" key={`${campaign.id}-${metric.label}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">{metric.label}</span>
                    <span className="text-slate-500">
                      {metric.actual.toLocaleString("en-IN")} / {metric.target.toLocaleString("en-IN")} {metric.unit}
                    </span>
                  </div>
                  <Progress value={Math.round((metric.actual / metric.target) * 100)} />
                </div>
              )),
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

function CampaignManagementPage({
  activeCampaignId,
  campaignDetailTab,
  generateCampaignReport,
  navigateTo,
  requestFundRelease,
  setActiveCampaignId,
  setCampaignDetailTab,
  verifyNextMilestone,
  workspace,
}: {
  activeCampaignId: string;
  campaignDetailTab: string;
  generateCampaignReport: (campaignId: string) => void;
  navigateTo: (destination: Destination, focus?: { campaignId?: string; ngoId?: string }) => void;
  requestFundRelease: (campaignId: string) => void;
  setActiveCampaignId: (campaignId: string) => void;
  setCampaignDetailTab: (tab: string) => void;
  verifyNextMilestone: (campaignId: string) => void;
  workspace: Workspace;
}) {
  const activeCampaign = getCampaign(workspace, activeCampaignId) || workspace.campaigns[0];
  const activeNgo = getNgo(workspace, activeCampaign.ngoId);
  const tabs = ["Overview", "Milestones", "Budget", "NGO", "Beneficiaries", "Evidence", "Reports"];
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Campaign management"
        title="Sector templates, milestones, NGOs, funds, evidence, and reports"
        text="The three example programs are operational workflows rather than disconnected dashboard cards."
        actions={
          <>
            <ActionButton icon={CircleDollarSign} onClick={() => requestFundRelease(activeCampaign.id)}>
              Request Fund Release
            </ActionButton>
            <GhostButton icon={CheckCircle2} onClick={() => verifyNextMilestone(activeCampaign.id)}>
              Verify Milestone
            </GhostButton>
            <GhostButton icon={FileText} onClick={() => generateCampaignReport(activeCampaign.id)}>
              Generate Report
            </GhostButton>
          </>
        }
      />

      <section className="grid min-w-0 gap-5 lg:grid-cols-[0.95fr_1.45fr]">
        <Card>
          <SectionHeading icon={HandHeart} title="Campaign List" text="Select a campaign to update every detail panel." />
          <div className="space-y-3">
            {workspace.campaigns.map((campaign) => {
              const ngo = getNgo(workspace, campaign.ngoId);
              return (
                <button
                  className={`w-full min-w-0 rounded-md border p-4 text-left transition ${
                    activeCampaign.id === campaign.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/60"
                  }`}
                  key={campaign.id}
                  onClick={() => {
                    setActiveCampaignId(campaign.id);
                    setCampaignDetailTab("Overview");
                  }}
                  type="button"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{campaign.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{campaign.sector} - {ngo?.name}</p>
                    </div>
                    <StatusBadge value={campaign.status} />
                  </div>
                  <div className="mt-3">
                    <Progress value={campaign.progress} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{campaign.state}</span>
                    <RiskBadge value={campaign.risk} />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{activeCampaign.title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {activeCampaign.template} - {activeCampaign.district}, {activeCampaign.state}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={activeCampaign.status} />
              <RiskBadge value={activeCampaign.risk} />
              <button
                className="inline-flex h-8 items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                onClick={() => setShowAnalysis((current) => !current)}
                type="button"
              >
                {showAnalysis ? <Table2 className="h-3.5 w-3.5" /> : <BarChart3 className="h-3.5 w-3.5" />}
                {showAnalysis ? "Hide Analysis" : "Open Analysis"}
              </button>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold ${
                  campaignDetailTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                key={tab}
                onClick={() => setCampaignDetailTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {showAnalysis ? (
              <CampaignBriefPanel campaign={activeCampaign} ngoName={activeNgo?.name || "-"} />
            ) : null}

            {campaignDetailTab === "Overview" ? (
              <div className={`${showAnalysis ? "mt-6" : ""} grid gap-4 md:grid-cols-2`}>
                <MetricCard label="Progress" value={`${activeCampaign.progress}%`} meta={activeCampaign.nextAction} tone="blue" />
                <MetricCard label="SDG Mapping" value={activeCampaign.sdg} meta={activeCampaign.sector} tone="green" />
                <MetricCard label="Budget" value={formatINR(activeCampaign.budget)} meta={`${formatINR(activeCampaign.released)} released`} tone="violet" />
                <MetricCard label="NGO Partner" value={activeNgo?.name || "-"} meta={`${activeNgo?.trustScore || 0}/100 trust score`} tone="amber" />
              </div>
            ) : null}

            {campaignDetailTab === "Milestones" ? (
              <MilestoneList campaign={activeCampaign} />
            ) : null}

            {campaignDetailTab === "Budget" ? (
              <BudgetBreakdown campaign={activeCampaign} />
            ) : null}

            {campaignDetailTab === "NGO" ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  {activeNgo?.name} owns field execution, evidence uploads, utilization certificates, and impact reporting for this campaign.
                </p>
                <button
                  className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                  onClick={() => navigateTo("NGO Management", { ngoId: activeCampaign.ngoId })}
                  type="button"
                >
                  Open NGO profile
                </button>
              </div>
            ) : null}

            {campaignDetailTab === "Beneficiaries" ? (
              <SimpleTable
                headers={["Group", "Count", "Location", "Consent", "Proof", "Verification"]}
                rows={activeCampaign.beneficiaries.map((item) => [
                  item.group,
                  item.count.toLocaleString("en-IN"),
                  item.location,
                  item.consent,
                  item.proof,
                  item.verified,
                ])}
              />
            ) : null}

            {campaignDetailTab === "Evidence" ? (
              <SimpleTable
                headers={["Evidence", "Type", "Proof", "Submitted", "Status"]}
                rows={activeCampaign.evidence.map((item) => [item.title, item.type, item.proof, item.submittedOn, item.status])}
              />
            ) : null}

            {campaignDetailTab === "Reports" ? (
              <SimpleTable
                headers={["Report", "Type", "Status", "Updated"]}
                rows={workspace.reports
                  .filter((report) => report.campaignId === activeCampaign.id)
                  .map((report) => [report.title, report.type, report.status, report.updatedAt])}
              />
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}

function NgoManagementPage({
  activeNgoId,
  assigningNgoId,
  candidates,
  connections,
  navigateTo,
  onAssignProject,
  setActiveNgoId,
  workspace,
}: {
  activeNgoId: string;
  assigningNgoId: string;
  candidates: NgoCandidate[];
  connections: ProjectConnection[];
  navigateTo: (destination: Destination, focus?: { campaignId?: string; ngoId?: string }) => void;
  onAssignProject: (candidate: NgoCandidate) => void;
  setActiveNgoId: (ngoId: string) => void;
  workspace: Workspace;
}) {
  const activeNgo = getNgo(workspace, activeNgoId) || workspace.ngos[0];
  const campaigns = workspace.campaigns.filter((campaign) => campaign.ngoId === activeNgo.id);
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="NGO management"
        title="Partner profiles connected to campaigns, funds, evidence, and risk"
        text="Corporate-side NGO views show what each partner is delivering and what is blocking approval."
        actions={
          <ActionButton icon={showAnalysis ? Table2 : Clock} onClick={() => setShowAnalysis((current) => !current)}>
            {showAnalysis ? "Hide Register" : "Open Document Register"}
          </ActionButton>
        }
      />

      <section className="grid min-w-0 gap-5 lg:grid-cols-[0.9fr_1.5fr]">
        <Card>
          <SectionHeading icon={Users} title="NGO Directory" text="Three partners mapped to the example sectors." />
          <div className="space-y-3">
            {workspace.ngos.map((ngo) => (
              <button
                className={`w-full min-w-0 rounded-md border p-4 text-left ${
                  activeNgo.id === ngo.id
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-blue-200"
                }`}
                key={ngo.id}
                onClick={() => setActiveNgoId(ngo.id)}
                type="button"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{ngo.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{ngo.sector} - {ngo.state}</p>
                  </div>
                  <RiskBadge value={ngo.risk} />
                </div>
                <div className="mt-3">
                  <MetricLine label="Trust score" value={ngo.trustScore} />
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{activeNgo.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {activeNgo.sector} partner - {activeNgo.state}
              </p>
            </div>
            <StatusBadge value={activeNgo.verification} />
          </div>

          <section className="mt-5 grid min-w-0 gap-4 md:grid-cols-4">
            <MetricCard label="Trust Score" value={`${activeNgo.trustScore}/100`} meta="Verification + performance" tone="blue" />
            <MetricCard label="Field Performance" value={`${activeNgo.fieldPerformance}%`} meta="Milestone reliability" tone="green" />
            <MetricCard label="Campaigns" value={String(campaigns.length)} meta="Connected programs" tone="violet" />
            <MetricCard label="Risk" value={activeNgo.risk} meta="Compliance posture" tone={activeNgo.risk === "High" ? "red" : "amber"} />
          </section>

          {showAnalysis ? (
            <NgoAnalysisPanel campaigns={campaigns} ngo={activeNgo} />
          ) : null}

          <section className="mt-6 grid min-w-0 gap-5 lg:grid-cols-2">
            <div>
              <SectionHeading icon={FileCheck2} title="Compliance Documents" text="Document status directly feeds Audit & Compliance." />
              <div className="space-y-2">
                {activeNgo.documents.map((document) => (
                  <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm" key={document.name}>
                    <span className="min-w-0 break-words font-medium text-slate-800">{document.name}</span>
                    <StatusBadge value={document.status} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionHeading icon={HandHeart} title="Connected Campaigns" text="Open campaign or budget context from the NGO profile." />
              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <button
                    className="w-full min-w-0 rounded-md border border-slate-200 bg-white p-3 text-left text-sm hover:border-blue-200 hover:bg-blue-50"
                    key={campaign.id}
                    onClick={() => navigateTo("Campaign Management", { campaignId: campaign.id, ngoId: activeNgo.id })}
                    type="button"
                  >
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <span className="min-w-0 break-words font-semibold text-slate-900">{campaign.title}</span>
                      <span className="shrink-0 text-slate-500">{formatINR(campaign.released)} released</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{campaign.nextAction}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </Card>
      </section>

      {/* Available NGO Partners table */}
      <Card>
        <SectionHeading
          icon={HeartHandshake}
          title="Available NGO Partners"
          text="Assign a CSR project to establish a new connected workspace."
        />
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">NGO Partner</th>
                <th className="px-4 py-3">Focus Area</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3 text-right">Trust Score</th>
                <th className="px-4 py-3 text-right">Rating</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.map((candidate) => {
                const connected =
                  connections.some((conn) => conn.ngo_id === candidate.id) ||
                  connections.some((conn) => conn.ngo_name === candidate.name);
                const disabled =
                  connected ||
                  assigningNgoId === candidate.id ||
                  candidate.status === "Suspended";

                return (
                  <tr className="hover:bg-slate-50/50" key={candidate.id}>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      {candidate.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {candidate.focusArea}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {candidate.state}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-700">
                      {candidate.trustScore}/100
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-blue-600">
                      {candidate.rating}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-sm transition active:scale-95 ${
                          connected
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        }`}
                        disabled={disabled}
                        onClick={() => onAssignProject(candidate)}
                        type="button"
                      >
                        {connected ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 animate-pulse" />
                            Connected
                          </>
                        ) : assigningNgoId === candidate.id ? (
                          "Assigning..."
                        ) : (
                          <>
                            <HeartHandshake className="h-3.5 w-3.5" />
                            Assign Project
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ProjectWorkspace({
  connections,
  onRequestDocument,
}: {
  connections: ProjectConnection[];
  onRequestDocument: (connectionId: string, documentName: string) => Promise<void>;
}) {
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [customDocName, setCustomDocName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeConnectionId || !customDocName.trim()) return;

    setError("");
    setIsSubmitting(true);
    try {
      await onRequestDocument(activeConnectionId, customDocName.trim());
      setActiveConnectionId(null);
      setCustomDocName("");
    } catch (err: any) {
      setError(err?.message || "Could not request document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connections.length) {
    return (
      <Card className="p-8">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <HeartHandshake className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900 tracking-tight">
            No NGO project connection yet
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Open NGO Management, choose a suitable registered NGO, and assign a
            CSR project. That unlocks the shared monitoring workspace for both
            sides.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Shared corporate + NGO execution layer"
        title="Project Workspace"
        text="Each assigned project now has one shared record. Corporate teams can request documents, review progress, and monitor the same milestones the NGO updates from its dashboard."
      />

      {connections.map((connection) => (
        <Card key={connection.id}>
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {connection.focus_area}
                  </span>
                  <h3 className="mt-3 text-xl font-bold text-slate-900 tracking-tight">
                    {connection.project_name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Assigned to{" "}
                    <span className="font-semibold text-slate-800">
                      {connection.ngo_name}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold uppercase text-emerald-700">
                    {connection.status}
                  </span>
                  {connection.uc_submitted && (
                    <span className="rounded-full bg-violet-50 px-3 py-0.5 text-xs font-semibold text-violet-700">
                      ✓ UC Submitted
                    </span>
                  )}
                  {connection.impact_report_submitted && (
                    <span className="rounded-full bg-teal-50 px-3 py-0.5 text-xs font-semibold text-teal-700">
                      ✓ Impact Report
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MiniStat label="Approved Budget" value={formatINR(connection.budget)} />
                <MiniStat label="Completion progress" value={`${connection.progress}%`} />
                <MiniStat label="Current milestone" value={connection.milestone} />
              </div>

              <div className="mt-5">
                <span className="text-xs font-semibold text-slate-500">Shared progress</span>
                <Progress value={connection.progress} />
              </div>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Latest NGO update
                </p>
                <p className="mt-1.5 text-sm text-blue-900 leading-relaxed">{connection.latest_update}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 p-5 lg:border-l lg:border-t-0">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 tracking-tight">
                <FileText className="h-4 w-4 text-blue-600" />
                Corporate document requests
              </h4>
              <div className="mt-4 space-y-3">
                {connection.document_requests.length ? (
                  connection.document_requests.map((request) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm"
                      key={request}
                    >
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {request}
                      </span>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 shrink-0">
                        Requested
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500">
                    No pending requests.
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setActiveConnectionId(connection.id);
                  setCustomDocName("");
                  setError("");
                }}
                type="button"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition active:scale-95"
              >
                <FileText className="h-4 w-4" />
                Request Document
              </button>
            </div>
          </div>
        </Card>
      ))}

      {activeConnectionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900">Request Document</h3>
              <button
                type="button"
                onClick={() => {
                  setActiveConnectionId(null);
                  setCustomDocName("");
                  setError("");
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Select standard document
                  </label>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {[
                      "CSR-1 Certificate",
                      "Latest audit report",
                      "Utilization Certificate (UC)",
                      "Detailed Project Report (DPR)",
                      "80G / 12A Registration"
                    ].map((doc) => {
                      const conn = connections.find(c => c.id === activeConnectionId);
                      const exists = conn?.document_requests.includes(doc);
                      return (
                        <button
                          key={doc}
                          type="button"
                          disabled={exists}
                          onClick={() => setCustomDocName(doc)}
                          className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${
                            customDocName === doc
                              ? "border-blue-600 bg-blue-50/50 text-blue-700"
                              : exists
                              ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{doc}</span>
                          {exists && (
                            <span className="text-xs font-semibold text-emerald-600">Already requested</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-slate-400">OR</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>
                
                <div>
                  <label htmlFor="custom-doc" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Custom Document Request
                  </label>
                  <input
                    id="custom-doc"
                    type="text"
                    placeholder="e.g. Beneficiary Consent Forms - Q3"
                    value={customDocName}
                    onChange={(e) => setCustomDocName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                    maxLength={80}
                  />
                </div>
                
                {error && (
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1.5 bg-red-50 p-2.5 rounded-lg border border-red-100">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                  </p>
                )}
              </div>
              
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveConnectionId(null);
                    setCustomDocName("");
                    setError("");
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !customDocName.trim()}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition shadow-sm"
                >
                  {isSubmitting ? "Requesting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetPage({
  navigateTo,
  requestFundRelease,
  workspace,
}: {
  navigateTo: (destination: Destination, focus?: { campaignId?: string; approvalId?: string }) => void;
  requestFundRelease: (campaignId: string) => void;
  workspace: Workspace;
}) {
  const totals = getWorkspaceTotals(workspace);
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Budget & fund tracking"
        title="Milestone-based fund control"
        text="Budget, release, utilization certificate, and approval queues are connected to campaign progress."
        actions={
          <ActionButton icon={showAnalysis ? Table2 : BarChart3} onClick={() => setShowAnalysis((current) => !current)}>
            {showAnalysis ? "Hide Analysis" : "Open Analysis"}
          </ActionButton>
        }
      />

      <section className="grid min-w-0 gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Total Budget" value={formatINR(totals.budget)} meta="Annual CSR pool" tone="blue" />
        <MetricCard label="Allocated" value={formatINR(totals.allocated)} meta={`${totals.allocationRate}% allocated`} tone="violet" />
        <MetricCard label="Released" value={formatINR(totals.released)} meta={`${totals.releaseRate}% released`} tone="green" />
        <MetricCard label="Utilized" value={formatINR(totals.utilized)} meta="UC-backed spend" tone="blue" />
        <MetricCard label="Pending" value={formatINR(totals.pendingRelease)} meta="Release queue" tone="amber" />
        <MetricCard label="Remaining" value={formatINR(totals.budget - totals.utilized)} meta="Unutilized budget" tone="green" />
      </section>

      {showAnalysis ? (
        <BudgetAnalysisPanel workspace={workspace} />
      ) : null}

      <section className="grid min-w-0 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <SectionHeading icon={Wallet} title="Campaign-wise Fund Flow" text="Release actions create approvals, notifications, and audit logs." />
          <div className="space-y-4">
            {workspace.campaigns.map((campaign) => (
              <div className="min-w-0 rounded-md border border-slate-200 bg-white p-4" key={campaign.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{campaign.title}</p>
                    <p className="text-xs text-slate-500">{campaign.sector} - {getNgo(workspace, campaign.ngoId)?.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      onClick={() => requestFundRelease(campaign.id)}
                      type="button"
                    >
                      Request Release
                    </button>
                    <button
                      className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => navigateTo("Campaign Management", { campaignId: campaign.id })}
                      type="button"
                    >
                      Details
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-4">
                  <MiniStat label="Budget" value={formatINR(campaign.budget)} />
                  <MiniStat label="Allocated" value={formatINR(campaign.allocated)} />
                  <MiniStat label="Released" value={formatINR(campaign.released)} />
                  <MiniStat label="Utilized" value={formatINR(campaign.utilized)} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeading icon={Clock} title="Pending Financial Approvals" text="Approvals are owned by Reports & Approvals." />
          <div className="space-y-3">
            {workspace.approvals
              .filter((approval) => approval.type === "Fund Release")
              .map((approval) => (
                <button
                  className="w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3 text-left hover:border-blue-200 hover:bg-blue-50"
                  key={approval.id}
                  onClick={() => navigateTo("Reports & Approvals", { campaignId: approval.campaignId, approvalId: approval.id })}
                  type="button"
                >
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <p className="min-w-0 break-words text-sm font-semibold text-slate-900">{approval.title}</p>
                    <StatusBadge value={approval.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{approval.owner} - {approval.amount ? formatINR(approval.amount) : ""}</p>
                </button>
              ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function EsgImpactPage({
  navigateTo,
  verifyNextMilestone,
  workspace,
}: {
  navigateTo: (destination: Destination, focus?: { campaignId?: string }) => void;
  verifyNextMilestone: (campaignId: string) => void;
  workspace: Workspace;
}) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const totalBeneficiaries = workspace.campaigns.reduce(
    (sum, campaign) => sum + campaign.beneficiaries.reduce((inner, beneficiary) => inner + beneficiary.count, 0),
    0,
  );
  const verifiedEvidence = workspace.campaigns.flatMap((campaign) => campaign.evidence).filter((evidence) => evidence.status === "Verified").length;
  const totalEvidence = workspace.campaigns.flatMap((campaign) => campaign.evidence).length;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="ESG & impact"
        title="Sector-specific outcome tracking"
        text="Education, healthcare, and women empowerment each have purpose-built metrics, evidence, beneficiaries, and verification logic."
        actions={
          <ActionButton icon={showAnalysis ? Table2 : PieChart} onClick={() => setShowAnalysis((current) => !current)}>
            {showAnalysis ? "Hide SDG Analysis" : "Open SDG Analysis"}
          </ActionButton>
        }
      />

      <section className="grid min-w-0 gap-4 md:grid-cols-4">
        <MetricCard label="Beneficiaries" value={totalBeneficiaries.toLocaleString("en-IN")} meta="Across all campaigns" tone="blue" />
        <MetricCard label="Evidence Verified" value={`${verifiedEvidence}/${totalEvidence}`} meta="Photos, reports, finance, consent" tone="green" />
        <MetricCard label="Avg Progress" value={`${Math.round(workspace.campaigns.reduce((sum, campaign) => sum + campaign.progress, 0) / workspace.campaigns.length)}%`} meta="Milestone weighted" tone="violet" />
        <MetricCard label="SDGs Covered" value="3" meta="SDG 3, 4, and 5" tone="amber" />
      </section>

      {showAnalysis ? (
        <SdgAnalysisPanel workspace={workspace} />
      ) : null}

      <section className="grid min-w-0 gap-5">
        {workspace.campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-bold text-slate-900">{campaign.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{campaign.sector} metric template - {campaign.sdg}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                  onClick={() => navigateTo("Campaign Management", { campaignId: campaign.id })}
                  type="button"
                >
                  Open Campaign
                </button>
                <button
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                  onClick={() => verifyNextMilestone(campaign.id)}
                  type="button"
                >
                  Verify Next Milestone
                </button>
              </div>
            </div>
            <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {campaign.metrics.map((metric) => (
                <div className="rounded-lg bg-slate-50 p-4" key={metric.label}>
                  <p className="text-sm font-semibold text-slate-900">{metric.label}</p>
                  <p className="mt-2 text-xl font-bold text-blue-600">
                    {metric.actual.toLocaleString("en-IN")}
                    <span className="text-xs font-medium text-slate-500"> / {metric.target.toLocaleString("en-IN")}</span>
                  </p>
                  <p className="text-xs text-slate-500">{metric.unit}</p>
                  <Progress value={Math.round((metric.actual / metric.target) * 100)} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}

function ReportsApprovalsPage({
  decideApproval,
  navigateTo,
  selectedApprovalId,
  setSelectedApprovalId,
  workspace,
}: {
  decideApproval: (approvalId: string, decision: Approval["status"]) => void;
  navigateTo: (destination: Destination, focus?: { campaignId?: string; ngoId?: string }) => void;
  selectedApprovalId: string;
  setSelectedApprovalId: (approvalId: string) => void;
  workspace: Workspace;
}) {
  const selectedApproval = workspace.approvals.find((approval) => approval.id === selectedApprovalId) || workspace.approvals[0];
  const linkedCampaign = selectedApproval?.campaignId ? getCampaign(workspace, selectedApproval.campaignId) : null;
  const linkedNgo = selectedApproval?.ngoId ? getNgo(workspace, selectedApproval.ngoId) : null;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Reports & approvals"
        title="Approval hub with linked context"
        text="Every approval shows its campaign, NGO, budget, evidence, comments, and audit trail."
      />

      <section className="grid min-w-0 gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <SectionHeading icon={FileText} title="Approval Queue" text="Campaign, NGO, budget, fund, UC, and impact report approvals." />
          <div className="space-y-3">
            {workspace.approvals.map((approval) => (
              <button
                className={`w-full rounded-lg border p-4 text-left ${
                  selectedApproval?.id === approval.id
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-100 bg-white hover:border-blue-200"
                }`}
                key={approval.id}
                onClick={() => setSelectedApprovalId(approval.id)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{approval.title}</p>
                  <StatusBadge value={approval.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{approval.type} - {approval.owner} - {approval.createdAt}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          {selectedApproval ? (
            <>
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedApproval.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{selectedApproval.type} - assigned to {selectedApproval.owner}</p>
                  </div>
                  <RiskBadge value={selectedApproval.priority} />
                </div>
              </div>

              <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-2">
                <MiniStat label="Linked Campaign" value={linkedCampaign?.title || "Not linked"} />
                <MiniStat label="Linked NGO" value={linkedNgo?.name || "Not linked"} />
                <MiniStat label="Amount" value={selectedApproval.amount ? formatINR(selectedApproval.amount) : "No amount"} />
                <MiniStat label="Status" value={selectedApproval.status} />
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Reviewer Notes</p>
                <div className="mt-2 space-y-2">
                  {selectedApproval.comments.map((comment) => (
                    <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600" key={comment}>{comment}</p>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <ActionButton icon={CheckCircle2} onClick={() => decideApproval(selectedApproval.id, "Approved")}>
                  Approve
                </ActionButton>
                <GhostButton icon={AlertCircle} onClick={() => decideApproval(selectedApproval.id, "Revision Requested")}>
                  Request Revision
                </GhostButton>
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 hover:bg-red-100"
                  onClick={() => decideApproval(selectedApproval.id, "Rejected")}
                  type="button"
                >
                  Reject
                </button>
                {linkedCampaign ? (
                  <GhostButton icon={Eye} onClick={() => navigateTo("Campaign Management", { campaignId: linkedCampaign.id })}>
                    View Campaign
                  </GhostButton>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">No approval selected.</p>
          )}
        </Card>
      </section>

      <Card>
        <SectionHeading icon={FileCheck2} title="Reports Center" text="Generated and submitted reports update when approvals are decided." />
        <SimpleTable
          headers={["Report", "Type", "Campaign", "Status", "Updated"]}
          rows={workspace.reports.map((report) => [
            report.title,
            report.type,
            report.campaignId ? getCampaign(workspace, report.campaignId)?.title || "-" : "Portfolio",
            report.status,
            report.updatedAt,
          ])}
        />
      </Card>
    </div>
  );
}

function AiInsightsPage({
  navigateTo,
  workspace,
}: {
  navigateTo: (destination: Destination, focus?: { campaignId?: string; ngoId?: string }) => void;
  workspace: Workspace;
}) {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="AI insights"
        title="Risk, recommendations, forecasts, and anomaly detection"
        text="Insight cards are linked to real prototype campaigns, NGOs, budgets, and compliance issues."
      />

      <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workspace.insights.map((insight) => (
          <button
            className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-violet-200 hover:shadow-md"
            key={insight.id}
            onClick={() => navigateTo(insight.destination, { campaignId: insight.campaignId, ngoId: insight.ngoId })}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-violet-600">
                <Bot className="h-5 w-5" />
              </div>
              <RiskBadge value={insight.severity} />
            </div>
            <p className="mt-4 font-semibold text-slate-900">{insight.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{insight.body}</p>
            <p className="mt-4 text-xs font-semibold text-blue-600">Open linked workflow</p>
          </button>
        ))}
      </section>

      <Card>
        <SectionHeading icon={TrendingUp} title="Forecast Summary" text="AI forecasts combine budget pace, milestone health, evidence verification, and NGO risk." />
        <div className="grid min-w-0 gap-4 md:grid-cols-3">
          <MetricCard label="ESG Forecast" value="86/100" meta="+8 if health compliance closes" tone="green" />
          <MetricCard label="Budget Utilization" value={`${getWorkspaceTotals(workspace).releaseRate}%`} meta="Released against total budget" tone="blue" />
          <MetricCard label="Fraud Risk" value="Medium" meta="Healthcare evidence requires manual review" tone="amber" />
        </div>
      </Card>
    </div>
  );
}

function AuditCompliancePage({
  navigateTo,
  workspace,
}: {
  navigateTo: (destination: Destination, focus?: { campaignId?: string; ngoId?: string }) => void;
  workspace: Workspace;
}) {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Audit & compliance"
        title="Evidence, consent, documents, approvals, and immutable actions"
        text="Every prototype action creates or updates the governance trail."
      />

      <section className="grid min-w-0 gap-4 md:grid-cols-4">
        <MetricCard label="Open Issues" value={String(workspace.issues.filter((issue) => issue.status !== "Closed").length)} meta="Risk register" tone="amber" />
        <MetricCard label="Audit Logs" value={String(workspace.auditLogs.length)} meta="Recent system actions" tone="blue" />
        <MetricCard label="High Risk NGOs" value={String(workspace.ngos.filter((ngo) => ngo.risk === "High").length)} meta="Needs compliance review" tone="red" />
        <MetricCard label="Approval Completeness" value="82%" meta="Chains with owner + comments" tone="green" />
      </section>

      <section className="grid min-w-0 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <SectionHeading icon={AlertCircle} title="Issue Register" text="Risks link to the relevant campaign or NGO." />
          <div className="space-y-3">
            {workspace.issues.map((issue) => (
              <button
                className="w-full rounded-lg border border-slate-100 bg-slate-50 p-3 text-left hover:border-blue-200 hover:bg-blue-50"
                key={issue.id}
                onClick={() =>
                  navigateTo(issue.campaignId ? "Campaign Management" : "NGO Management", {
                    campaignId: issue.campaignId,
                    ngoId: issue.ngoId,
                  })
                }
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{issue.title}</p>
                  <RiskBadge value={issue.severity} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{issue.owner} - {issue.status}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeading icon={Activity} title="Immutable Audit Logs" text="Fund releases, approvals, reports, evidence and verification actions." />
          <SimpleTable
            headers={["Action", "Actor", "Entity", "Details", "Time"]}
            rows={workspace.auditLogs.map((log) => [log.action, log.actor, log.entity, log.details, log.time])}
          />
        </Card>
      </section>

      <Card>
        <SectionHeading icon={ShieldCheck} title="Compliance Checklist" text="Sector-specific gaps surfaced from NGO documents and campaign evidence." />
        <div className="grid gap-3 md:grid-cols-3">
          {workspace.ngos.flatMap((ngo) =>
            ngo.documents.map((document) => (
              <div className="rounded-lg border border-slate-100 bg-white p-3" key={`${ngo.id}-${document.name}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{document.name}</p>
                  <StatusBadge value={document.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{ngo.name}</p>
              </div>
            )),
          )}
        </div>
      </Card>
    </div>
  );
}

function NotificationsPage({
  markAllNotificationsRead,
  markNotificationRead,
  navigateTo,
  workspace,
}: {
  markAllNotificationsRead: () => void;
  markNotificationRead: (notificationId: string) => void;
  navigateTo: (destination: Destination, focus?: { campaignId?: string; ngoId?: string; approvalId?: string }) => void;
  workspace: Workspace;
}) {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Notifications"
        title="Connected alerts and workflow reminders"
        text="Notifications route directly to campaign, NGO, approval, budget, AI, and compliance context."
        actions={
          <ActionButton icon={CheckCircle2} onClick={markAllNotificationsRead}>
            Mark All Read
          </ActionButton>
        }
      />

      <Card>
        <SectionHeading icon={Bell} title="Notification Center" text="Clicking an alert marks it read and opens the related workflow." />
        <div className="space-y-3">
          {workspace.notifications.map((notification) => (
            <button
              className={`w-full rounded-lg border p-4 text-left transition ${
                notification.read
                  ? "border-slate-100 bg-white"
                  : "border-blue-200 bg-blue-50"
              } hover:border-blue-300`}
              key={notification.id}
              onClick={() => {
                markNotificationRead(notification.id);
                navigateTo(notification.destination, {
                  campaignId: notification.campaignId,
                  ngoId: notification.ngoId,
                  approvalId: notification.approvalId,
                });
              }}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{notification.title}</p>
                <RiskBadge value={notification.priority === "Normal" ? "Low" : notification.priority} />
              </div>
              <p className="mt-1 text-sm text-slate-600">{notification.body}</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">{notification.createdAt} - opens {notification.destination}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RolePermissions({
  canManageEmployees,
  employees,
  onCreateEmployee,
}: {
  canManageEmployees: boolean;
  employees: RoleAccess[];
  onCreateEmployee: (draft: RoleDraft) => Promise<{
    employee?: RoleAccess;
    error?: string;
  }>;
}) {
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [roleDraft, setRoleDraft] = useState<RoleDraft>({
    name: "",
    email: "",
    position: "",
    password: "",
    pages: ["Dashboard"],
  });
  const [formError, setFormError] = useState("");
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);

  function toggleDraftPage(page: string) {
    setRoleDraft((current) => {
      const pages = current.pages.includes(page)
        ? current.pages.filter((item) => item !== page)
        : [...current.pages, page];

      return { ...current, pages: pages.length ? pages : ["Dashboard"] };
    });
  }

  async function submitRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const name = roleDraft.name.trim();
    const email = roleDraft.email.trim();
    const position = roleDraft.position.trim();

    if (!name || !email || !position || !roleDraft.password) {
      setFormError("Name, email, position, and password are required.");
      return;
    }

    setIsSavingEmployee(true);
    const result = await onCreateEmployee({ ...roleDraft, name, email, position });
    setIsSavingEmployee(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setRoleDraft({ name: "", email: "", position: "", password: "", pages: ["Dashboard"] });
    setIsRoleFormOpen(false);
  }

  const roleExamples = [
    ["CSR Head", "Approves campaigns and final reports", "Campaign + Report approvals"],
    ["Finance Manager", "Approves budget allocations and fund releases", "Budget + Fund Tracking"],
    ["Compliance Officer", "Verifies NGO documents and UCs", "Audit + Compliance"],
    ["ESG Officer", "Verifies outcome metrics and ESG reports", "ESG + Reports"],
    ["Field Auditor", "Checks evidence, beneficiaries, and milestones", "Campaign + Evidence"],
  ];

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Employees & access"
        title="Role-based workflow ownership"
        text="Employee access is preserved, with examples that show how people map to CSR operations."
        actions={
          canManageEmployees ? (
            <ActionButton icon={Plus} onClick={() => setIsRoleFormOpen((current) => !current)}>
              Add Employee
            </ActionButton>
          ) : undefined
        }
      />

      {isRoleFormOpen && canManageEmployees ? (
        <Card>
          <form className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]" onSubmit={submitRole}>
            <div className="space-y-4">
              <TextField label="User Name" value={roleDraft.name} onChange={(value) => setRoleDraft((current) => ({ ...current, name: value }))} />
              <TextField label="Email" type="email" value={roleDraft.email} onChange={(value) => setRoleDraft((current) => ({ ...current, email: value }))} />
              <TextField label="Position" value={roleDraft.position} onChange={(value) => setRoleDraft((current) => ({ ...current, position: value }))} />
              <TextField label="Temporary Password" type="password" value={roleDraft.password} onChange={(value) => setRoleDraft((current) => ({ ...current, password: value }))} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Allowed Pages</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {roleAccessPages.map((page) => (
                  <label
                    className={`flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-medium ${
                      roleDraft.pages.includes(page)
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                    key={page}
                  >
                    <input
                      checked={roleDraft.pages.includes(page)}
                      className="h-4 w-4 accent-blue-600"
                      onChange={() => toggleDraftPage(page)}
                      type="checkbox"
                    />
                    {page}
                  </label>
                ))}
              </div>
              {formError ? (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {formError}
                </p>
              ) : null}
              <div className="mt-4 flex justify-end gap-3">
                <GhostButton onClick={() => setIsRoleFormOpen(false)}>Cancel</GhostButton>
                <ActionButton disabled={isSavingEmployee} type="submit">
                  {isSavingEmployee ? "Saving..." : "Create Login"}
                </ActionButton>
              </div>
            </div>
          </form>
        </Card>
      ) : null}

      <section className="grid min-w-0 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <SectionHeading icon={Users} title="Employee Directory" text="Real employee access from the existing backend API." />
          <SimpleTable
            headers={["Employee", "Email", "Position", "Pages", "Status"]}
            rows={
              employees.length
                ? employees.map((employee) => [
                    employee.name,
                    employee.email,
                    employee.position,
                    `${employee.pages.length} pages`,
                    employee.isActive === false ? "Suspended" : "Active",
                  ])
                : [["No employee logins yet", "Add an employee to create backend access", "-", "-", "-"]]
            }
          />
        </Card>
        <div className="space-y-6">
          <Card>
            <SectionHeading icon={Workflow} title="Role Workflow Map" text="Who owns what in the connected CSR operating model." />
            <div className="space-y-3">
              {roleExamples.map(([role, responsibility, pages]) => (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3" key={role}>
                  <p className="font-semibold text-slate-900">{role}</p>
                  <p className="mt-1 text-sm text-slate-600">{responsibility}</p>
                  <p className="mt-1 text-xs font-semibold text-blue-600">{pages}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeading icon={Lock} title="Seeded Employee Logins" text="Testing credentials for corporate employee roles." />
            <div className="space-y-3">
              {[
                { name: "Ananya Sharma", position: "CSR Manager", email: "ananya.sharma@corporate-giant.example", password: "Employee@2026" },
                { name: "Rohan Mehta", position: "Finance Manager", email: "rohan.mehta@corporate-giant.example", password: "Employee@2026" },
                { name: "Priya Nair", position: "Compliance Officer", email: "priya.nair@corporate-giant.example", password: "Employee@2026" },
                { name: "Kabir Khan", position: "NGO Manager", email: "kabir.khan@corporate-giant.example", password: "Employee@2026" },
                { name: "Sara Iyer", position: "ESG Officer", email: "sara.iyer@corporate-giant.example", password: "Employee@2026" },
              ].map((emp) => (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs" key={emp.email}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{emp.name}</p>
                      <p className="text-slate-500 font-medium">{emp.position}</p>
                    </div>
                    <span className="rounded bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">Seeded</span>
                  </div>
                  <div className="mt-2.5 space-y-1 font-mono text-slate-600">
                    <p><span className="font-semibold text-slate-500">Email:</span> {emp.email}</p>
                    <p><span className="font-semibold text-slate-500">Password:</span> {emp.password}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function ChatPanel({
  errorMessage,
  isSending,
  messageBody,
  messages,
  onMessageBodyChange,
  onSendMessage,
  unlocked,
  workspace,
}: {
  errorMessage: string;
  isSending: boolean;
  messageBody: string;
  messages: Message[];
  onMessageBodyChange: (value: string) => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  unlocked: boolean;
  workspace: Workspace;
}) {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Support / Chat"
        title={unlocked ? "Workspace support is available" : "Chat with admin to unlock dashboard"}
        text="Support can reference specific campaigns, approvals, fund releases, NGO documents, and compliance issues."
      />

      <section className="grid min-w-0 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex min-h-[420px] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
              {messages.length ? (
                messages.map((message) => (
                  <div
                    className={`max-w-[82%] rounded-lg p-3 text-sm ${
                      message.sender_type === "corporate"
                        ? "ml-auto bg-blue-600 text-white"
                        : "bg-white text-slate-700 shadow-sm"
                    }`}
                    key={message.id}
                  >
                    {message.body}
                  </div>
                ))
              ) : (
                <div className="grid h-full place-items-center text-center text-sm text-slate-500">
                  <div>
                    <MessageCircle className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 font-medium">No messages yet.</p>
                    <p>Ask for access or reference a specific CSR workflow.</p>
                  </div>
                </div>
              )}
            </div>
            <form className="mt-4 flex gap-3" onSubmit={onSendMessage}>
              <textarea
                className="min-h-20 flex-1 resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-400"
                onChange={(event) => onMessageBodyChange(event.target.value)}
                placeholder="Example: Please unlock the workspace and review the healthcare fund release issue."
                value={messageBody}
              />
              <button
                className="h-20 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!messageBody.trim() || isSending}
                type="submit"
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </form>
            {errorMessage ? <p className="mt-3 text-sm font-medium text-red-600">{errorMessage}</p> : null}
          </div>
        </Card>

        <Card>
          <SectionHeading icon={MessageCircle} title="Contextual Support Threads" text="Examples of support issues tied to workspace objects." />
          <div className="space-y-3">
            {workspace.issues.map((issue) => (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3" key={issue.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{issue.title}</p>
                  <RiskBadge value={issue.severity} />
                </div>
                <p className="mt-1 text-xs text-slate-500">Owner: {issue.owner}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function MilestoneList({ campaign }: { campaign: Campaign }) {
  return (
    <div className="space-y-3">
      {campaign.milestones.map((milestone) => (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4" key={milestone.id}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-semibold text-slate-900">{milestone.title}</p>
              <p className="mt-1 text-sm text-slate-500">{milestone.evidenceRequired}</p>
            </div>
            <StatusBadge value={milestone.status} />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
            <span>Due {milestone.dueDate}</span>
            <span>Tranche {formatINR(milestone.tranche)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BudgetBreakdown({ campaign }: { campaign: Campaign }) {
  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2">
      <MetricCard label="Budget" value={formatINR(campaign.budget)} meta="Sanctioned campaign budget" tone="blue" />
      <MetricCard label="Allocated" value={formatINR(campaign.allocated)} meta={`${Math.round((campaign.allocated / campaign.budget) * 100)}% of budget`} tone="violet" />
      <MetricCard label="Released" value={formatINR(campaign.released)} meta={`${Math.round((campaign.released / campaign.budget) * 100)}% released`} tone="green" />
      <MetricCard label="Utilized" value={formatINR(campaign.utilized)} meta="UC-backed and evidence linked" tone="amber" />
    </div>
  );
}

function BudgetAnalysisPanel({ workspace }: { workspace: Workspace }) {
  const totals = getWorkspaceTotals(workspace);
  const sectorRows = workspace.campaigns.flatMap((campaign) =>
    campaign.sectorSpend.map((spend) => ({
      campaign,
      spend,
      variance: spend.released - spend.utilized,
    })),
  );
  const flaggedRows = sectorRows.filter(({ spend }) => spend.status === "Flagged" || spend.status === "Pending");

  return (
    <Card className="border-blue-200 bg-blue-50/40">
      <SectionHeading
        icon={BarChart3}
        title="Budget Analysis"
        text="Formal view of allocation, release, utilization, sector spend, and proof status."
      />
      <div className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <StackedFlowBar
            items={[
              { label: "Allocated", value: totals.allocated, color: "bg-violet-500" },
              { label: "Released", value: totals.released, color: "bg-emerald-500" },
              { label: "Utilized", value: totals.utilized, color: "bg-blue-600" },
            ]}
            max={totals.budget}
            title="Annual CSR Fund Flow"
          />
          <SimpleTable
            headers={["Sector", "Category", "Campaign", "Utilized", "Proof", "Status"]}
            rows={sectorRows.map(({ campaign, spend }) => [
              spend.sector,
              spend.category,
              campaign.title,
              formatINR(spend.utilized),
              spend.proof,
              spend.status,
            ])}
          />
        </div>
        <SimpleTable
          headers={["Campaign", "Allocated", "Released", "Utilized", "Use Rate", "Proof"]}
          rows={workspace.campaigns.map((campaign) => [
            campaign.title,
            formatINR(campaign.allocated),
            formatINR(campaign.released),
            formatINR(campaign.utilized),
            `${Math.round((campaign.utilized / campaign.allocated) * 100)}%`,
            campaign.evidence.some((item) => item.status === "Flagged") ? "Flagged" : "Linked",
          ])}
        />
        {flaggedRows.length > 0 && (
          <SimpleTable
            headers={["Variance Watch", "Released − Utilized", "Owner Action", "Status"]}
            rows={flaggedRows.map(({ campaign, spend, variance }) => [
              campaign.title,
              formatINR(variance),
              spend.status === "Flagged" ? "Review proof before next release" : "Collect missing utilization proof",
              spend.status,
            ])}
          />
        )}
      </div>
    </Card>
  );
}

function SdgAnalysisPanel({ workspace }: { workspace: Workspace }) {
  const totalBeneficiaries = workspace.campaigns.reduce(
    (sum, campaign) => sum + campaign.beneficiaries.reduce((inner, beneficiary) => inner + beneficiary.count, 0),
    0,
  );
  const sdgSegments = workspace.campaigns.map((campaign) => ({
    label: `${campaign.sdg} - ${campaign.sector}`,
    value: campaign.beneficiaries.reduce((sum, beneficiary) => sum + beneficiary.count, 0),
    color: campaign.sector === "Healthcare" ? "#10b981" : campaign.sector === "Women Empowerment" ? "#f59e0b" : "#2563eb",
  }));

  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <SectionHeading
        icon={PieChart}
        title="SDG And Beneficiary Analysis"
        text="Click-open view showing SDG share, beneficiary proofs, and evidence readiness."
      />
      <div className="grid min-w-0 gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <div>
          <PieVisual segments={sdgSegments} total={totalBeneficiaries} />
          <div className="mt-4 space-y-2">
            {sdgSegments.map((segment) => (
              <div className="flex items-center justify-between text-sm" key={segment.label}>
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: segment.color }} />
                  {segment.label}
                </span>
                <span className="font-semibold text-slate-950">{Math.round((segment.value / totalBeneficiaries) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <SimpleTable
            headers={["Campaign", "Beneficiary Group", "Count", "Consent", "Proof", "Verification"]}
            rows={workspace.campaigns.flatMap((campaign) =>
              campaign.beneficiaries.map((beneficiary) => [
                campaign.title,
                beneficiary.group,
                beneficiary.count.toLocaleString("en-IN"),
                beneficiary.consent,
                beneficiary.proof,
                beneficiary.verified,
              ]),
            )}
          />
          <SimpleTable
            headers={["Campaign", "Impact Metric", "Actual", "Target", "Completion"]}
            rows={workspace.campaigns.flatMap((campaign) =>
              campaign.metrics.map((metric) => [
                campaign.title,
                metric.label,
                `${metric.actual.toLocaleString("en-IN")} ${metric.unit}`,
                `${metric.target.toLocaleString("en-IN")} ${metric.unit}`,
                `${Math.round((metric.actual / metric.target) * 100)}%`,
              ]),
            )}
          />
        </div>
      </div>
    </Card>
  );
}

function CampaignBriefPanel({ campaign, ngoName }: { campaign: Campaign; ngoName: string }) {
  const beneficiaryTotal = campaign.beneficiaries.reduce((sum, beneficiary) => sum + beneficiary.count, 0);
  const verifiedEvidence = campaign.evidence.filter((item) => item.status === "Verified").length;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <SectionHeading
        icon={Table2}
        title="Campaign Analysis Brief"
        text="Board-ready campaign knowledge in one controlled view."
      />
      <div className="grid gap-3 md:grid-cols-4">
        <MiniStat label="Conducted Dates" value={campaign.conductedDates} />
        <MiniStat label="NGO Partner" value={ngoName} />
        <MiniStat label="SDG" value={campaign.sdg} />
        <MiniStat label="Beneficiaries" value={beneficiaryTotal.toLocaleString("en-IN")} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-600">
            <span className="font-semibold text-slate-900">Summary: </span>
            {campaign.summary}
          </p>
          <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-600">
            <span className="font-semibold text-slate-900">Impact: </span>
            {campaign.impactSummary}
          </p>
          <StackedFlowBar
            items={[
              { label: "Allocated", value: campaign.allocated, color: "bg-violet-500" },
              { label: "Released", value: campaign.released, color: "bg-emerald-500" },
              { label: "Utilized", value: campaign.utilized, color: "bg-blue-600" },
            ]}
            max={campaign.budget}
            title="Campaign Fund Position"
          />
        </div>
        <SimpleTable
          headers={["Proof Area", "Reference", "Date", "Status"]}
          rows={[
            ...campaign.evidence.map((item) => [item.title, item.proof, item.submittedOn, item.status]),
            ["Evidence Readiness", `${verifiedEvidence}/${campaign.evidence.length} verified`, "Live", verifiedEvidence === campaign.evidence.length ? "Verified" : "Submitted"],
          ]}
        />
      </div>
    </div>
  );
}

function NgoAnalysisPanel({ campaigns, ngo }: { campaigns: Campaign[]; ngo: NgoPartner }) {
  const released = campaigns.reduce((sum, campaign) => sum + campaign.released, 0);
  const utilized = campaigns.reduce((sum, campaign) => sum + campaign.utilized, 0);

  return (
    <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/40 p-4">
      <SectionHeading
        icon={Clock}
        title="NGO Document Register"
        text="Received documents, expiry clock, campaign totals, and compliance gaps."
      />
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <MiniStat label="Total Campaigns" value={String(campaigns.length)} />
        <MiniStat label="Released" value={formatINR(released)} />
        <MiniStat label="Utilized" value={formatINR(utilized)} />
        <MiniStat label="Document Gaps" value={String(ngo.documents.filter((document) => document.status !== "Valid").length)} />
      </div>
      <SimpleTable
        headers={["Document", "Reference", "Received", "Expiry Clock", "Owner", "Status"]}
        rows={ngo.documents.map((document) => [
          document.name,
          document.reference,
          document.receivedOn,
          getExpiryClock(document),
          document.owner,
          document.status,
        ])}
      />
    </div>
  );
}

function StackedFlowBar({
  items,
  max,
  title,
}: {
  items: Array<{ label: string; value: number; color: string }>;
  max: number;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>{item.label}</span>
              <span>{formatINR(item.value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.min(100, (item.value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieVisual({
  segments,
  total,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  total: number;
}) {
  const gradient = segments
    .reduce<{ cursor: number; parts: string[] }>(
      (state, segment) => {
        const start = state.cursor;
        const end = start + (segment.value / total) * 100;
        return {
          cursor: end,
          parts: [...state.parts, `${segment.color} ${start}% ${end}%`],
        };
      },
      { cursor: 0, parts: [] },
    )
    .parts.join(", ");

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 text-center">
      <div
        aria-label="SDG beneficiary distribution pie chart"
        className="mx-auto h-52 w-52 rounded-full border border-slate-200"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <p className="mt-4 text-sm font-semibold text-slate-900">Beneficiary Distribution</p>
      <p className="mt-1 text-xs text-slate-500">{total.toLocaleString("en-IN")} verified or submitted beneficiaries</p>
    </div>
  );
}

function PageHero({
  actions,
  eyebrow,
  text,
  title,
}: {
  actions?: React.ReactNode;
  eyebrow: string;
  text: string;
  title: string;
}) {
  return (
    <section className="flex min-w-0 flex-col justify-between gap-4 rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-500">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl tracking-tight">{title}</h2>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">{text}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function SectionHeading({
  icon: Icon,
  text,
  title,
}: {
  icon: React.ElementType;
  text: string;
  title: string;
}) {
  return (
    <div className="mb-4 min-w-0">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:text-[15px]">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50">
          <Icon className="h-3.5 w-3.5 text-blue-500" />
        </span>
        {title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-400 ml-8">{text}</p>
    </div>
  );
}

function MetricCard({
  label,
  meta,
  tone,
  value,
}: {
  label: string;
  meta: string;
  tone: Tone;
  value: string;
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    red: "bg-red-50 text-red-600 border-red-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  }[tone];

  const iconBg = {
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    violet: "bg-violet-500",
    slate: "bg-slate-400",
  }[tone];

  return (
    <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500 tracking-tight">{label}</p>
      <p className="mt-2 break-words text-xl font-bold text-slate-900 sm:text-2xl tracking-tight">{value}</p>
      <div className={`mt-3 inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${toneClass}`}>
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${iconBg}`} />
        <span className="truncate">{meta}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200/80 bg-slate-50/50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1.5 break-words text-sm font-semibold text-slate-800 leading-snug">{value}</p>
    </div>
  );
}

function ActionButton({
  children,
  disabled,
  icon: Icon,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ElementType;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}

function GhostButton({
  children,
  icon: Icon,
  onClick,
}: {
  children: React.ReactNode;
  icon?: React.ElementType;
  onClick?: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
      onClick={onClick}
      type="button"
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}

function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  filterOptions,
}: {
  filters: { key: string; label: string }[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  filterOptions: Record<string, string[]>;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenKey(null);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <Card>
      <div className="flex min-w-0 flex-wrap gap-2" ref={ref}>
        <div className="flex h-9 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-600">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </div>
        {filters.map((f) => {
          const isActive = activeFilters[f.key] !== f.label;
          const isOpen   = openKey === f.key;
          const options  = filterOptions[f.key] ?? [];
          return (
            <div key={f.key} className="relative">
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : f.key)}
                className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition ${
                  isActive
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {activeFilters[f.key]}
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""} ${
                  isActive ? "text-blue-400" : "text-slate-400"
                }`} />
              </button>
              {isOpen && (
                <div className="absolute left-0 top-10 z-50 min-w-[160px] rounded-xl border border-slate-200 bg-white shadow-xl">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { onFilterChange(f.key, opt); setOpenKey(null); }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition first:rounded-t-xl last:rounded-b-xl ${
                        activeFilters[f.key] === opt
                          ? "bg-blue-50 font-semibold text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {activeFilters[f.key] === opt && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {Object.values(activeFilters).some((v, i) => v !== Object.values(filterOptions).map(opts => opts[0])[i]) && (
          <button
            type="button"
            onClick={() => filters.forEach(f => onFilterChange(f.key, filterOptions[f.key][0]))}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
          >
            Clear filters ✕
          </button>
        )}
      </div>
    </Card>
  );
}

function Progress({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : "bg-amber-500";
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-500">{Math.round(value)}%</span>
    </div>
  );
}

function MetricLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-slate-900">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const tone =
    value === "Approved" ||
    value === "Verified" ||
    value === "Valid" ||
    value === "Complete" ||
    value === "Active" ||
    value === "Completed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : value === "Pending" ||
          value === "Submitted" ||
          value === "Review" ||
          value === "Under Review" ||
          value === "Expiring" ||
          value === "Needs Renewal" ||
          value === "In Progress"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : value === "Rejected" ||
            value === "Flagged" ||
            value === "Delayed" ||
            value === "Missing"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <span className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-5 ${tone}`}>
      {value}
    </span>
  );
}

function RiskBadge({ value }: { value: string }) {
  const tone =
    value === "Critical" || value === "High"
      ? "border-red-200 bg-red-50 text-red-700"
      : value === "Medium" || value === "Normal"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <span className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-5 ${tone}`}>
      {value}
    </span>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <table className="w-full min-w-[560px] table-auto border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {headers.map((header) => (
              <th
                className="px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                key={header}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr className="transition-colors hover:bg-slate-50/80" key={`${row[0]}-${index}`}>
              {row.map((cell, cellIndex) => (
                <td
                  className={`px-3.5 py-3 align-top leading-relaxed ${
                    cellIndex === 0
                      ? "font-semibold text-slate-800 max-w-[200px]"
                      : "text-slate-600 max-w-[200px]"
                  }`}
                  key={`${cell}-${cellIndex}`}
                >
                  <span className="block break-words">{cell}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TextField({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      <input
        className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        onChange={(event) => onChange(event.target.value)}
        required
        type={type}
        value={value}
      />
    </label>
  );
}

function getCampaign(workspace: Workspace, campaignId: string) {
  return workspace.campaigns.find((campaign) => campaign.id === campaignId);
}

function getNgo(workspace: Workspace, ngoId: string) {
  return workspace.ngos.find((ngo) => ngo.id === ngoId);
}

function getWorkspaceTotals(workspace: Workspace) {
  const budget = workspace.campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
  const allocated = workspace.campaigns.reduce((sum, campaign) => sum + campaign.allocated, 0);
  const released = workspace.campaigns.reduce((sum, campaign) => sum + campaign.released, 0);
  const utilized = workspace.campaigns.reduce((sum, campaign) => sum + campaign.utilized, 0);
  const pendingRelease = workspace.campaigns.reduce((sum, campaign) => sum + campaign.pendingRelease, 0);
  const pendingApprovals = workspace.approvals.filter((approval) => approval.status === "Pending").length;

  return {
    budget,
    allocated,
    released,
    utilized,
    pendingRelease,
    pendingApprovals,
    allocationRate: Math.round((allocated / budget) * 100),
    releaseRate: Math.round((released / budget) * 100),
  };
}

function getExpiryClock(document: NgoPartner["documents"][number]) {
  if (!document.expiresOn) {
    return document.status === "Missing" ? "Not received" : "No expiry";
  }

  const expiresAt = new Date(`${document.expiresOn} 00:00:00`);
  const today = new Date();
  const days = Math.ceil((expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (Number.isNaN(days)) {
    return document.expiresOn;
  }

  if (days < 0) {
    return `${Math.abs(days)} days expired`;
  }

  if (days <= 30) {
    return `${days} days left`;
  }

  return `Valid until ${document.expiresOn}`;
}

function formatINR(value: number | null | undefined) {
  if (value == null || isNaN(value)) return "Rs 25L";  // fallback for pre-migration rows
  if (value >= 10000000) {
    return `Rs ${(value / 10000000).toFixed(1)} Cr`;
  }

  if (value >= 100000) {
    return `Rs ${(value / 100000).toFixed(1)}L`;
  }

  return `Rs ${value.toLocaleString("en-IN")}`;
}
