"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Building2,
  ClipboardCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Download,
  FileText,
  Filter,
  FolderKanban,
  HandHeart,
  HeartHandshake,
  LayoutDashboard,
  LineChart,
  Lock,
  LogOut,
  Map,
  Leaf,
  Menu,
  MessageCircle,
  Mountain,
  PieChart,
  Plus,
  Search,
  ShieldCheck,
  Users,
  Wallet,
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

type CorporateEmployeeRecord = {
  id: string;
  email: string;
  full_name: string;
  position: string;
  allowed_pages: unknown;
  is_active: boolean;
  corporate_id?: string;
  created_at?: string;
};

type RoleDraft = RoleAccess & {
  password: string;
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

const kpis = [
  {
    label: "CSR Budget",
    value: "Rs 5.2 Cr",
    meta: "Rs 3.8 Cr disbursed so far",
    tone: "blue",
    icon: Wallet,
    progress: 73,
  },
  {
    label: "Active Campaigns",
    value: "18",
    meta: "4 need attention",
    tone: "violet",
    icon: FileText,
  },
  {
    label: "Pending Approvals",
    value: "12",
    meta: "Fund, NGO, and report approvals",
    tone: "amber",
    icon: Clock,
  },
  {
    label: "Compliance Health",
    value: "96%",
    meta: "42 verified NGO partners",
    tone: "green",
    icon: ShieldCheck,
  },
];

const dashboardCards = [
  {
    title: "1. Review partners",
    text: "Evaluate NGO readiness, trust score, compliance freshness, and sector alignment before approvals move.",
    tone: "blue",
    icon: Compass,
  },
  {
    title: "2. Manage approvals",
    text: "Use the priority queue to review tranche requests, proposals, compliance documents, and report submissions.",
    tone: "violet",
    icon: CheckCircle2,
  },
  {
    title: "3. Stay reporting-ready",
    text: "Track utilisation, monitor impact evidence, and keep board-ready reporting context live through the year.",
    tone: "emerald",
    icon: Activity,
  },
];

const campaigns = [
  ["Rural Education", "XYZ NGO", "Active", "Rs 20L", "65%", "82"],
  ["Women Skill Labs", "Asha Foundation", "Active", "Rs 34L", "78%", "88"],
  ["Water Access", "Jal Seva Trust", "Delayed", "Rs 18L", "42%", "71"],
  ["Health Camps", "CareBridge", "Completed", "Rs 12L", "100%", "91"],
];

const masterKpis = [
  ["Total CSR Spend", "Rs 5.8 Cr", "Across 42 projects", "blue"],
  ["Impact Efficiency", "Rs 42", "Spent per beneficiary", "emerald"],
  ["NGO Success Rate", "87%", "Completed projects", "violet"],
  ["Fund Efficiency", "92%", "Released vs utilized", "blue"],
  ["ESG Index", "84/100", "Improving 8 pts YoY", "emerald"],
  ["Risk Score", "Medium", "6 projects watched", "amber"],
];

const campaignOverview = [
  ["Total Campaigns", "48", "12 launched this year", "blue"],
  ["Active Campaigns", "18", "4 need attention", "emerald"],
  ["Completed Campaigns", "22", "91% report approved", "violet"],
  ["Delayed Campaigns", "5", "2 high risk", "amber"],
  ["Campaign Budget", "Rs 8.4 Cr", "73% allocated", "blue"],
  ["Avg Completion", "74%", "Across active portfolio", "emerald"],
];

const campaignRows = [
  ["Rural Education Mission", "XYZ NGO", "Active", "Rs 20L", "65%", "Maharashtra", "82", "Jun 20"],
  ["Women Skill Labs", "Asha Foundation", "Proposal Review", "Rs 34L", "28%", "Karnataka", "88", "Jul 12"],
  ["Water Access Program", "Jal Seva Trust", "Delayed", "Rs 18L", "42%", "Uttar Pradesh", "71", "May 30"],
  ["Urban Health Camps", "CareBridge", "Completed", "Rs 12L", "100%", "Delhi", "91", "Closed"],
  ["Climate Schools", "GreenSteps", "Open for NGO Applications", "Rs 26L", "8%", "Tamil Nadu", "79", "Aug 05"],
];

const ngoOverview = [
  ["Total NGOs", "124", "Across 19 focus areas", "blue"],
  ["Verified NGOs", "86", "CSR-ready partners", "emerald"],
  ["Pending Verification", "14", "Awaiting compliance review", "amber"],
  ["High-Risk NGOs", "5", "Needs escalation", "amber"],
  ["Active Partnerships", "42", "Currently assigned", "violet"],
  ["Avg Trust Score", "81/100", "Portfolio benchmark", "blue"],
];

const budgetOverview = [
  ["Total CSR Budget", "Rs 10 Cr", "FY 2026-27", "blue"],
  ["Funds Allocated", "Rs 7.2 Cr", "Campaign budgets assigned", "violet"],
  ["Funds Released", "Rs 5.8 Cr", "Approved disbursements", "emerald"],
  ["Funds Utilized", "Rs 4.6 Cr", "UC-backed utilization", "blue"],
  ["Remaining Budget", "Rs 5.4 Cr", "Available and reserve", "emerald"],
  ["Pending Approvals", "Rs 1.1 Cr", "Awaiting finance review", "amber"],
  ["Budget Utilization", "76%", "Against allocated budget", "violet"],
];

const fundAllocations = [
  ["Rural Education Mission", "XYZ NGO", "Rs 20L", "Rs 13L", "Rs 10L", "Rs 7L"],
  ["Women Skill Labs", "Asha Foundation", "Rs 34L", "Rs 18L", "Rs 12L", "Rs 16L"],
  ["Water Access Program", "Jal Seva Trust", "Rs 18L", "Rs 9L", "Rs 7L", "Rs 9L"],
  ["Urban Health Camps", "CareBridge", "Rs 12L", "Rs 12L", "Rs 11L", "Rs 0"],
];

const disbursements = [
  ["XYZ NGO", "Rural Education", "Rs 5L", "Rs 5L", "May 21", "Released"],
  ["Asha Foundation", "Women Skill Labs", "Rs 8L", "Rs 6L", "Pending", "Approved"],
  ["Jal Seva Trust", "Water Access", "Rs 4L", "Pending", "Pending", "Under Review"],
  ["GreenSteps", "Climate Schools", "Rs 7L", "Pending", "Pending", "Requested"],
];

const budgetCreation = [
  ["Financial Year", "FY 2026-27"],
  ["Total CSR Budget", "Rs 10 Cr"],
  ["Education Allocation", "Rs 2 Cr"],
  ["Healthcare Allocation", "Rs 1.5 Cr"],
  ["Environment Allocation", "Rs 1 Cr"],
  ["Emergency Reserve", "Rs 50L"],
  ["ESG Allocation Target", "28% sustainability-linked"],
];

const esgOverview = [
  ["Overall ESG Score", "84/100", "Up 8 pts YoY", "blue"],
  ["Environmental Score", "79/100", "Carbon and water progress", "emerald"],
  ["Social Score", "88/100", "Strong beneficiary outcomes", "violet"],
  ["Governance Score", "82/100", "Audit posture improving", "blue"],
  ["Total ESG Projects", "32", "Tagged campaigns", "emerald"],
  ["SDGs Covered", "11", "Across 9 regions", "violet"],
  ["Carbon Reduction", "1,240T", "CO2 reduced", "emerald"],
  ["Compliance", "93%", "Reporting readiness", "blue"],
];

const sdgRows = [
  ["SDG 4 Education", "14", "75,000", "32%"],
  ["SDG 3 Health", "9", "1,10,000", "21%"],
  ["SDG 5 Gender", "7", "58,000", "18%"],
  ["SDG 6 Water", "5", "42,000", "12%"],
  ["SDG 13 Climate", "6", "85,000", "11%"],
];

const esgCampaignRows = [
  ["Rural Education", "Social", "SDG 4", "86", "75,000 students educated"],
  ["Water Access", "Environmental", "SDG 6", "78", "12M litres conserved"],
  ["Women Skill Labs", "Social", "SDG 5", "89", "58,000 women reached"],
  ["Climate Schools", "Environmental", "SDG 13", "81", "85,000 trees planted"],
];

const frameworks = [
  ["GRI", "Ready", "92"],
  ["BRSR", "In Progress", "78"],
  ["SASB", "Mapped", "66"],
  ["TCFD", "Needs Data", "54"],
  ["Integrated Reporting", "Ready", "86"],
];

const impactOverview = [
  ["Total Beneficiaries", "2,45,000", "Across active campaigns", "blue"],
  ["Active Campaigns", "32", "Field monitoring active", "emerald"],
  ["Villages Covered", "410", "Rural and semi-urban areas", "violet"],
  ["Women Benefited", "78,000", "Skill and livelihood programs", "blue"],
  ["Students Educated", "56,000", "School and digital literacy", "emerald"],
  ["Trees Planted", "1,20,000", "Climate and restoration work", "violet"],
  ["Verification Rate", "91%", "Geo and report validated", "blue"],
  ["Reporting Accuracy", "94%", "NGO submission quality", "emerald"],
];

const beneficiaryRows = [
  ["Students", "56,000", "Maharashtra", "Rural Education", "XYZ NGO"],
  ["Women", "78,000", "Karnataka", "Women Skill Labs", "Asha Foundation"],
  ["Healthcare Patients", "1,10,000", "Delhi", "Urban Health Camps", "CareBridge"],
  ["Farmers", "18,400", "Uttar Pradesh", "Water Access", "Jal Seva Trust"],
  ["Rural Communities", "42,000", "Tamil Nadu", "Climate Schools", "GreenSteps"],
];

const fieldReports = [
  ["Daily activity log", "XYZ NGO", "Submitted", "Today"],
  ["Attendance records", "Asha Foundation", "Under Review", "Yesterday"],
  ["Progress photos", "CareBridge", "Approved", "May 22"],
  ["Field visit video", "Jal Seva Trust", "Clarification Required", "May 20"],
];

const impactMilestones = [
  ["Baseline survey", "XYZ NGO", "May 28", "Approved", "100%"],
  ["Training cohort 1", "Asha Foundation", "Jun 04", "Submitted", "82%"],
  ["Health camp 3", "CareBridge", "Jun 08", "In Progress", "64%"],
  ["Water site audit", "Jal Seva Trust", "May 30", "Delayed", "42%"],
];

const evidenceCards = [
  ["Geo-tagged photos", "1,284", "Timestamp and location verified"],
  ["Field videos", "246", "AI duplicate check enabled"],
  ["Survey sheets", "532", "Offline and mobile submissions"],
  ["Testimonials", "318", "Community feedback attached"],
];

const beforeAfterRows = [
  ["Education attendance", "62%", "89%", "+27 pts"],
  ["Vaccination coverage", "48%", "92%", "+44 pts"],
  ["Skill placement", "21%", "57%", "+36 pts"],
  ["Water access reliability", "54%", "86%", "+32 pts"],
];

const validationRows = [
  ["Manual field validation", "28 visits", "Verified"],
  ["AI image validation", "1,284 media", "91% clean"],
  ["Duplicate report scan", "532 reports", "3 flagged"],
  ["Third-party audit", "6 campaigns", "In Progress"],
];

const approvalOverview = [
  ["Pending Approvals", "18", "Needs decision", "amber"],
  ["Approved This Month", "124", "Across workflows", "emerald"],
  ["Rejected Requests", "9", "With comments", "violet"],
  ["Reports Awaiting Review", "22", "NGO and impact reports", "blue"],
  ["Avg Approval Time", "2.8 Days", "Workflow average", "emerald"],
  ["Compliance Completion", "91%", "Audit-ready reports", "blue"],
];

const pendingApprovals = [
  ["Fund Release", "XYZ NGO / Rural Education", "Finance Manager", "High", "Under Review", "3 days"],
  ["NGO Approval", "GreenSteps", "NGO Manager", "Medium", "Pending", "1 day"],
  ["Final Impact Approval", "CareBridge / Health Camps", "CSR Head", "High", "Escalated", "6 days"],
  ["UC Approval", "Jal Seva Trust", "Compliance Officer", "High", "Revision Requested", "4 days"],
  ["Campaign Approval", "Climate Schools", "CSR Manager", "Low", "Pending", "Today"],
];

const reportsCenter = [
  ["Annual CSR Report FY26", "CSR Report", "Corporate Portfolio", "Under Review", "May 23"],
  ["Monthly ESG Summary", "ESG Report", "All Campaigns", "Approved", "May 20"],
  ["Q2 Fund Utilization", "Financial Report", "Finance", "Submitted", "May 18"],
  ["Women Skill Labs Field Report", "NGO Report", "Asha Foundation", "Needs Revision", "May 17"],
  ["SDG Impact Assessment", "Impact Report", "Portfolio", "Draft", "May 15"],
];

const auditTrailRows = [
  ["Approved", "Finance Head", "10:42 AM", "Released Rs 5L to XYZ NGO"],
  ["Commented", "Compliance Officer", "11:10 AM", "Requested UC clarification"],
  ["Signed", "Authorized Signatory", "12:35 PM", "Stamped Q2 ESG summary"],
  ["Escalated", "System", "02:20 PM", "Final impact approval overdue"],
];

const aiOverview = [
  ["AI Risk Alerts", "12", "Active alerts", "amber"],
  ["Budget Utilization", "84%", "Predicted by quarter end", "blue"],
  ["Recommended NGOs", "8", "High-performing matches", "emerald"],
  ["Success Probability", "92%", "Campaign completion forecast", "violet"],
  ["ESG Forecast", "+11%", "Expected ESG growth", "emerald"],
  ["Fraud Risk Score", "Low", "Portfolio-level risk", "blue"],
];

const riskCenterRows = [
  ["Financial", "Duplicate invoice pattern", "Medium", "Jal Seva Trust"],
  ["NGO", "80G certificate expiring", "High", "GreenSteps"],
  ["Campaign", "Milestone delay predicted", "Medium", "Water Access"],
  ["ESG", "Environmental contribution below benchmark", "Low", "North region"],
  ["Impact", "Duplicate media evidence suspected", "High", "Field report batch"],
];

const aiRecommendations = [
  ["NGO Recommendation", "Asha Foundation is the best fit for Women Skill Labs."],
  ["Budget Recommendation", "Shift Rs 18L from underutilized health reserve to education pipeline."],
  ["Campaign Recommendation", "Healthcare projects in rural Maharashtra show highest impact efficiency."],
  ["ESG Recommendation", "Add water conservation campaigns to improve environmental score."],
];

const complianceOverview = [
  ["Compliance Score", "94%", "Overall platform health", "emerald"],
  ["Active Issues", "12", "Open compliance items", "amber"],
  ["Expiring Documents", "8", "Within next 30 days", "amber"],
  ["Audit Readiness", "91%", "Evidence and logs ready", "blue"],
  ["NGO Compliance", "88%", "Partner legal health", "violet"],
  ["Pending Filings", "4", "Regulatory submissions", "blue"],
  ["High-Risk Cases", "2", "Critical escalation", "amber"],
];

const auditRows = [
  ["Internal Audit", "CSR Portfolio", "Meera S.", "In Progress", "Jun 02"],
  ["NGO Audit", "Jal Seva Trust", "Arjun K.", "Findings Raised", "May 30"],
  ["Financial Audit", "Rural Education", "Finance Team", "Scheduled", "Jun 08"],
  ["ESG Audit", "Climate Schools", "ESG Officer", "Completed", "Closed"],
  ["Compliance Audit", "Annual Filing", "Legal Team", "Closed", "May 18"],
];

const complianceRows = [
  ["Schedule VII alignment", "Corporate CSR", "Compliant", "Mar 31", "Low"],
  ["80G certificate", "Jal Seva Trust", "Expiring Soon", "Jun 21", "Medium"],
  ["FCRA validity", "GreenSteps", "Under Review", "Jul 10", "Medium"],
  ["UC submission", "Water Access", "Non-Compliant", "Overdue", "High"],
  ["BRSR readiness", "ESG Portfolio", "Compliant", "Sep 30", "Low"],
];

const auditLogRows = [
  ["Fund approval", "Finance Head", "Rural Education", "10:42 AM", "Approved Rs 5L release"],
  ["NGO verification", "NGO Manager", "GreenSteps", "11:15 AM", "Requested clarification"],
  ["Document upload", "Asha Foundation", "80G Certificate", "12:08 PM", "New version uploaded"],
  ["Budget edit", "CSR Manager", "Women Skill Labs", "02:20 PM", "Milestone allocation revised"],
  ["Role change", "Admin", "Finance User", "03:45 PM", "Approval access updated"],
];

const violationRows = [
  ["Financial", "Duplicate invoice risk", "Medium", "Finance review"],
  ["NGO", "80G expiry approaching", "Medium", "Document renewal"],
  ["Operational", "Delayed field report", "High", "Escalate to NGO"],
  ["Compliance", "UC overdue", "High", "Corrective action"],
  ["Audit", "Missing evidence", "Critical", "Immediate review"],
];

const correctiveRows = [
  ["UC overdue for Water Access", "Compliance Officer", "May 30", "In Progress"],
  ["Missing audit evidence", "Field Auditor", "May 28", "Escalated"],
  ["80G renewal reminder", "NGO Manager", "Jun 12", "Open"],
  ["Budget variance explanation", "Finance Manager", "Jun 03", "Under Review"],
];

const employeeOverview = [
  ["Total Employees", "124", "Corporate CSR workforce", "blue"],
  ["Active CSR Staff", "42", "Working across modules", "emerald"],
  ["Managers", "8", "Department and team leads", "violet"],
  ["Assigned to Campaigns", "35", "Active project owners", "blue"],
  ["Pending Tasks", "72", "Across approval queues", "amber"],
  ["Average Workload", "68%", "Team utilization", "emerald"],
];

const employeeRows = [
  ["Ananya Sharma", "CSR", "CSR Manager", "6", "Active", "Meera S."],
  ["Rohan Mehta", "Finance", "Finance Manager", "4", "Active", "Vikram R."],
  ["Priya Nair", "Compliance", "Compliance Officer", "5", "On Leave", "Meera S."],
  ["Kabir Khan", "NGO Relations", "NGO Manager", "8", "Active", "Ananya S."],
  ["Sara Iyer", "ESG", "ESG Officer", "3", "Active", "Dev P."],
  ["Amit Joshi", "Operations", "Field Auditor", "7", "Inactive", "Kabir K."],
];

const employeeTabs = [
  ["Overview", "Designation, department, manager, contact, joining date, workload"],
  ["Campaigns", "Campaign role, NGO, status, progress, assignment controls"],
  ["Tasks", "NGO verification, proposal review, fund approval, audit review"],
  ["Approvals", "Completed, pending, rejected approvals, approval history"],
  ["Activity Logs", "Logins, approvals, NGO verification, budget edits, reports"],
  ["Performance", "Task completion, approval time, campaign success, ratings"],
  ["Documents", "Employment docs, certifications, policy acknowledgements, NDA"],
  ["Permissions", "Role, accessible modules, approval authority, temporary access"],
];

const departmentRows = [
  ["CSR", "18", "Meera S.", "72% workload"],
  ["Finance", "9", "Vikram R.", "92% workload"],
  ["Compliance", "7", "Priya N.", "81% workload"],
  ["ESG", "5", "Dev P.", "64% workload"],
  ["Operations", "12", "Kabir K.", "76% workload"],
];

const taskRows = [
  ["Verify GreenSteps documents", "High", "May 28", "In Progress"],
  ["Review Q2 fund release", "High", "May 27", "Pending"],
  ["Approve impact report", "Medium", "Jun 02", "Delayed"],
  ["Audit Water Access UC", "High", "May 30", "In Progress"],
  ["Generate ESG summary", "Low", "Jun 05", "Completed"],
];

const employeeActivityRows = [
  ["Logged in", "Ananya Sharma", "09:05 AM", "Web dashboard"],
  ["Approved fund release", "Rohan Mehta", "10:42 AM", "Rs 5L to XYZ NGO"],
  ["Verified NGO", "Kabir Khan", "11:18 AM", "GreenSteps profile"],
  ["Edited budget", "Rohan Mehta", "12:40 PM", "Women Skill Labs"],
  ["Generated report", "Sara Iyer", "02:15 PM", "Monthly ESG summary"],
];

const roleRows = [
  ["Super Admin", "2", "Full", "All approvals"],
  ["CSR Head", "4", "Strategic", "Campaign and final impact"],
  ["NGO Manager", "12", "Operational", "NGO verification"],
  ["Finance Manager", "8", "Financial", "Budget and fund release"],
  ["Compliance Officer", "6", "Audit", "UC and compliance"],
  ["ESG Officer", "5", "ESG", "ESG reporting"],
  ["Auditor", "3", "Read-only", "Audit review"],
  ["Employee/User", "84", "Limited", "None"],
];

const roleAccessPages = corporateSidebarItems.filter(
  (item) => item !== "Support / Chat",
);

const defaultRoleAccess: RoleAccess[] = roleRows.map(([position]) => ({
  name: `${position} User`,
  email: `${position.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@corpogn.test`,
  position,
  pages:
      position === "Super Admin" || position === "CSR Head"
        ? [...roleAccessPages]
        : position === "Finance Manager"
          ? ["Dashboard", "Budget & Fund Tracking", "Reports & Approvals", "Notifications"]
          : position === "NGO Manager"
            ? ["Dashboard", "Campaign Management", "NGO Management", "Reports & Approvals", "Notifications"]
            : position === "Compliance Officer" || position === "Auditor"
              ? ["Dashboard", "Audit & Compliance", "Reports & Approvals", "Notifications"]
              : position === "ESG Officer"
                ? ["Dashboard", "ESG & Impact", "Reports & Approvals", "Notifications"]
                : ["Dashboard", "Notifications"],
}));

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

const notificationOverview = [
  ["Unread Alerts", "28", "Need attention", "amber"],
  ["Critical Alerts", "4", "Immediate action", "amber"],
  ["Pending Approvals", "18", "Workflow reminders", "blue"],
  ["Overdue Reports", "9", "NGO and impact reports", "violet"],
  ["Expiring Docs", "8", "Compliance reminders", "emerald"],
  ["Avg Response Time", "2.4h", "Across all alerts", "blue"],
];

const notificationFeed = [
  ["Approval Alert", "Rs 12L fund release request awaiting approval.", "High", "10 mins ago"],
  ["Compliance Alert", "NGO 80G certificate expires in 5 days.", "Critical", "22 mins ago"],
  ["Campaign Alert", "Water Access milestone delayed by 3 days.", "Medium", "1 hour ago"],
  ["AI Alert", "High financial risk detected in Project Alpha.", "Critical", "2 hours ago"],
  ["NGO Alert", "GreenSteps submitted a new proposal.", "Low", "Yesterday"],
];

const notificationLogs = [
  ["Fund release approval reminder", "Finance Manager", "Delivered", "10:42 AM"],
  ["80G expiry alert", "NGO Manager", "Read", "11:05 AM"],
  ["ESG filing reminder", "ESG Officer", "Delivered", "12:10 PM"],
  ["Budget anomaly alert", "CSR Head", "Failed Retry", "01:15 PM"],
];

const filters = [
  "FY 2025-26",
  "All Campaigns",
  "All States",
  "Education",
  "Active",
];

const portfolioMix = [
  ["Education", 35, "#2563eb"],
  ["Healthcare", 24, "#10b981"],
  ["Environment", 19, "#8b5cf6"],
  ["Women Empowerment", 14, "#f59e0b"],
  ["Other", 8, "#64748b"],
] as const;

const monthlySpendTrend = [
  ["Jan", 42],
  ["Feb", 58],
  ["Mar", 64],
  ["Apr", 72],
  ["May", 68],
  ["Jun", 84],
] as const;

const campaignStatusMix = [
  ["Active", 18, "#2563eb"],
  ["Completed", 22, "#10b981"],
  ["Delayed", 5, "#f59e0b"],
  ["Review", 3, "#8b5cf6"],
] as const;

const impactTrend = [
  ["Education", 75],
  ["Health", 68],
  ["Water", 42],
  ["Women", 58],
  ["Climate", 51],
] as const;

const approvalHistogram = [
  ["0-1d", 12],
  ["2-3d", 18],
  ["4-5d", 9],
  ["6-7d", 5],
  [">7d", 2],
] as const;

const esgScoreTrend = [
  ["Q1", 72],
  ["Q2", 78],
  ["Q3", 82],
  ["Q4", 89],
] as const;

const budgetAllocationMix = [
  ["Education", 40, "#2563eb"],
  ["Healthcare", 25, "#10b981"],
  ["Environment", 18, "#8b5cf6"],
  ["Women", 12, "#f59e0b"],
  ["Reserve", 5, "#64748b"],
] as const;

const fundFlowBars = [
  ["Budget", 100],
  ["Allocated", 72],
  ["Released", 58],
  ["Utilized", 46],
  ["Pending", 11],
] as const;

const burnRateTrend = [
  ["Apr", 34],
  ["May", 42],
  ["Jun", 49],
  ["Jul", 57],
  ["Aug", 63],
  ["Sep", 76],
] as const;

const disbursementStatusMix = [
  ["Released", 2, "#10b981"],
  ["Approved", 1, "#2563eb"],
  ["Under Review", 1, "#f59e0b"],
  ["Requested", 1, "#8b5cf6"],
] as const;

export function CorporateDashboard({ slug }: { slug: string }) {
  const router = useRouter();
  const [corporate, setCorporate] = useState<Corporate | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeItem, setActiveItem] = useState("Support / Chat");
  const [messageBody, setMessageBody] = useState("");
  const [employees, setEmployees] = useState<RoleAccess[]>([]);
  const [projectConnections, setProjectConnections] = useState<ProjectConnection[]>([]);
  const [ngoCandidates, setNgoCandidates] = useState<NgoCandidate[]>(defaultNgoCandidates);
  const [viewerAllowedPages, setViewerAllowedPages] = useState<string[] | null>(null);
  const [viewerAccountType, setViewerAccountType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assigningNgoId, setAssigningNgoId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isUnlocked = corporate?.access_status === "active";
  const isCorporateEmployee = viewerAccountType === "corporate_employee";
  const canOpenAssignedPages = isUnlocked || isCorporateEmployee;
  const visibleSidebarItems = useMemo(
    () => {
      if (viewerAllowedPages) {
        return corporateSidebarItems.filter((item) =>
          viewerAllowedPages.includes(item),
        );
      }

      return isCorporateEmployee ? [] : corporateSidebarItems;
    },
    [isCorporateEmployee, viewerAllowedPages],
  );

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
          typeof metadata.corporate_slug === "string"
            ? metadata.corporate_slug
            : "";

        employeeRecord = {
          email: session.user.email ?? "",
          name:
            typeof metadata.full_name === "string"
              ? metadata.full_name
              : session.user.email?.split("@")[0] || "Employee",
          position:
            typeof metadata.position === "string"
              ? metadata.position
              : "Employee",
          pages: metadataPages,
          isActive: true,
        };
        setViewerAllowedPages(metadataPages);
        setEmployees([employeeRecord]);
        setActiveItem((current) =>
          metadataPages.includes(current) ? current : metadataPages[0],
        );

        const { data: employeeData, error: employeeError } = await supabaseBrowser
          .from("corporate_employees")
          .select(
            "id, corporate_id, email, full_name, position, allowed_pages, is_active, created_at",
          )
          .eq("auth_user_id", session.user.id)
          .single();

        if (employeeData?.is_active) {
          employeeRecord = mapCorporateEmployee(
            employeeData as CorporateEmployeeRecord,
          );
          setViewerAllowedPages(employeeRecord.pages);
          setEmployees([employeeRecord]);

          setActiveItem((current) =>
            employeeRecord?.pages.includes(current)
              ? current
              : employeeRecord?.pages[0] || "Dashboard",
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
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const result = (await response.json()) as {
          employees?: CorporateEmployeeRecord[];
          error?: string;
        };

        if (response.ok && result.employees) {
          setEmployees(result.employees.map(mapCorporateEmployee));
        } else if (result.error) {
          setErrorMessage(result.error);
        }
      } else if (employeeRecord) {
        setEmployees([employeeRecord]);
      }

      if (accountType === "corporate") {
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
      } else {
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

    const channel = supabaseBrowser
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

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [corporate, viewerAccountType]);

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

  function handleSidebarClick(item: string) {
    if (lockedItems.has(item)) {
      setActiveItem("Support / Chat");
      setSidebarOpen(false);
      return;
    }

    setActiveItem(item);
    setSidebarOpen(false);
  }

  async function handleLogout() {
    await supabaseBrowser.auth.signOut();
    router.replace("/");
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
        budget: "Rs 25L",
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

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <p className="text-sm font-medium text-slate-600">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {sidebarOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white shadow-2xl shadow-slate-950/20 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <span className="text-xl font-bold tracking-tight text-blue-400">
            CorpoGN
          </span>
        </div>

        <div className="border-b border-slate-800 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {corporate?.company_name || "Corporate"}
              </p>
              <p className="truncate text-xs text-slate-400">Corporate workspace</p>
            </div>
          </div>
          <span
            className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              isUnlocked
                ? "bg-emerald-400/15 text-emerald-200"
                : "bg-amber-400/15 text-amber-200"
            }`}
          >
            {isUnlocked ? "Unlocked" : "Chat required"}
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleSidebarItems.map((item) => {
            const locked = lockedItems.has(item);
            const active = activeItem === item;
            const Icon = sidebarIcons[item] || LayoutDashboard;

            return (
              <button
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
                key={item}
                onClick={() => handleSidebarClick(item)}
                type="button"
              >
                {active ? (
                  <div className="absolute left-0 top-1/2 -ml-3 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-400" />
                ) : null}
                <Icon className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1 truncate font-medium">{item}</span>
                {locked ? <Lock className="h-3.5 w-3.5" /> : null}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-200"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="min-w-0 flex-1 truncate">Logout</span>
          </button>
        </div>
      </aside>

      <section className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="Open navigation"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-base font-semibold text-slate-800 sm:text-lg">{activeItem}</h1>
            <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 md:inline-block">
              Corporate
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              type="button"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 md:flex">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                <Building2 className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                {corporate?.company_email.split("@")[0] || "Corporate"}
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6">
          {activeItem === "Support / Chat" ? (
            <ChatPanel
              errorMessage={errorMessage}
              isSending={isSending}
              messageBody={messageBody}
              messages={messages}
              onMessageBodyChange={setMessageBody}
              onSendMessage={sendMessage}
              unlocked={isUnlocked}
            />
          ) : activeItem === "Dashboard" ? (
            <CorporateHomeDashboard
              companyName={corporate?.company_name || "Corporate Admin"}
            />
          ) : activeItem === "Master Analytics" ? (
            <MasterAnalytics />
          ) : activeItem === "Campaign Management" ? (
            <CampaignManagement />
          ) : activeItem === "NGO Management" ? (
            <NgoManagement
              assigningNgoId={assigningNgoId}
              connections={projectConnections}
              candidates={ngoCandidates}
              onAssignProject={assignProjectToNgo}
            />
          ) : activeItem === "Project Workspace" ? (
            <ProjectWorkspace connections={projectConnections} />
          ) : activeItem === "Budget & Fund Tracking" ? (
            <BudgetFundTracking />
          ) : activeItem === "ESG & Impact" ? (
            <EsgDashboard />
          ) : activeItem === "Reports & Approvals" ? (
            <ReportsApprovals />
          ) : activeItem === "AI Insights" ? (
            <AiInsights />
          ) : activeItem === "Audit & Compliance" ? (
            <AuditCompliance />
          ) : activeItem === "Employees & Access" ? (
            <RolePermissions
              canManageEmployees={viewerAccountType === "corporate"}
              employees={employees}
              onCreateEmployee={createEmployeeAccess}
            />
          ) : activeItem === "Notifications" ? (
            <NotificationsPage />
          ) : (
            <FeaturePanel activeItem={activeItem} />
          )}
        </div>
      </section>
    </main>
  );
}

function CorporateHomeDashboard({ companyName }: { companyName: string }) {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white md:flex-row md:items-center">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
            Corporate Workspace
          </div>
          <h2 className="text-2xl font-bold">Welcome back, {companyName}!</h2>
          <p className="mt-1 text-blue-100">
            You have 12 approvals, 18 active campaigns, and 42 NGO partners in
            your CSR control center.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-blue-50/85">
            Review NGO partners, monitor active projects, manage tranche
            approvals, and keep CSR reporting on track.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <Search className="h-4 w-4" />
            Discover NGOs
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <FileText className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {dashboardCards.map((card) => (
          <InfoCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalyticsPanel
          icon={PieChart}
          title="Portfolio Mix"
          subtitle="Budget allocation across CSR focus areas."
        >
          <DonutChart items={portfolioMix} centerLabel="CSR" centerValue="100%" />
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={BarChart3}
          title="Monthly Spend"
          subtitle="Disbursement trend across the current reporting period."
        >
          <VerticalBarChart items={monthlySpendTrend} unit="L" />
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={LineChart}
          title="Impact Reach"
          subtitle="Beneficiary reach by program area."
        >
          <HorizontalBarChart items={impactTrend} />
        </AnalyticsPanel>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionHeader
            title="Priority Queue"
            text="Review the work that needs decisions from your team first."
          />
          <Card>
            <div className="border-b border-slate-100 p-5">
              <h3 className="font-semibold text-slate-900">Campaign Overview</h3>
              <p className="mt-1 text-sm text-slate-500">
                Project status, budget, progress, and ESG signals.
              </p>
            </div>
            <div className="overflow-x-auto p-5">
              <CampaignTable />
            </div>
          </Card>
          <Card>
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <MiniMetric title="5 NGOs pending KYC" text="Compliance team review" />
              <MiniMetric title="3 low trust score" text="Risk watchlist" />
              <MiniMetric title="2 delayed reports" text="Needs follow-up" />
            </div>
          </Card>
          <AnalyticsPanel
            icon={PieChart}
            title="Campaign Status"
            subtitle="Active, completed, delayed, and review-stage campaigns."
          >
            <DonutChart
              centerLabel="Campaigns"
              centerValue="48"
              items={campaignStatusMix}
            />
          </AnalyticsPanel>
        </div>

        <div className="space-y-6">
          <SectionHeader
            title="Portfolio Intelligence"
            text="Ecosystem signals, geographic spread, and AI-led opportunities."
          />
          <Card>
            <div className="border-b border-slate-100 p-5">
              <h3 className="flex items-center gap-2 font-semibold">
                <Activity className="h-4 w-4 text-blue-500" />
                Live Ecosystem
              </h3>
            </div>
            <div className="space-y-5 p-5">
              {[
                ["Rs 5L released to XYZ NGO", "10:42 AM"],
                ["Proposal submitted by ABC Foundation", "11:10 AM"],
                ["Audit note added to Rural Education", "12:05 PM"],
                ["AI flagged a budget underutilization risk", "02:20 PM"],
              ].map(([activity, time]) => (
                <div className="flex gap-3" key={activity}>
                  <div className="mt-1 h-9 w-9 rounded-full bg-blue-100 text-blue-600 grid place-items-center">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{activity}</p>
                    <p className="text-xs text-slate-400">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-none bg-gradient-to-br from-blue-600 to-blue-800 text-white">
            <div className="p-5">
              <h3 className="flex items-center gap-2 font-semibold">
                AI Scout
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                  BETA
                </span>
              </h3>
              <p className="mt-2 text-sm text-blue-100">
                AI predicts 15% budget underutilization this quarter.
              </p>
              <div className="mt-4 rounded-lg bg-white/10 p-3">
                <div className="flex justify-between">
                  <p className="font-medium">GreenSteps Climate Action</p>
                  <span className="text-xs font-bold text-green-200">96% Match</span>
                </div>
                <p className="mt-2 text-xs text-blue-100">
                  Matches your environmental mandate and ESG evidence needs.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function ReportsApprovals() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
            CSR Workflow + Reporting Engine
          </div>
          <h2 className="text-2xl font-bold">Reports & Approvals</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
            Manage multi-level approvals, review reports, maintain audit-ready
            documentation, automate reporting cycles, and generate board-ready
            CSR narratives.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <FileText className="h-4 w-4" />
            Generate Report
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <CheckCircle2 className="h-4 w-4" />
            Approve Requests
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <Download className="h-4 w-4" />
            Export Reports
          </button>
        </div>
      </section>

      <Card>
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Filter className="h-4 w-4 text-blue-500" />
              Approval & Report Controls
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Filter by approval type, report type, NGO, campaign, financial
              year, status, priority, and date range.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Create Workflow", "Schedule Reports", "Bulk Approvals"].map(
              (action) => (
                <button
                  className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  key={action}
                  type="button"
                >
                  {action}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Approval: All",
            "Report: ESG",
            "NGO: All",
            "Campaign: All",
            "FY: 2025-26",
            "Status: Pending",
            "Priority: High",
            "Date: Last 30 days",
          ].map((filter) => (
            <button
              className="flex h-10 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              key={filter}
              type="button"
            >
              {filter}
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {approvalOverview.map(([label, value, meta, tone]) => (
          <SimpleKpi key={label} label={label} value={value} meta={meta} tone={tone} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <AnalyticsPanel
          icon={BarChart3}
          title="Approval Age"
          subtitle="How long pending requests have been waiting."
        >
          <VerticalBarChart items={approvalHistogram} unit="" />
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={PieChart}
          title="Campaign Status"
          subtitle="Portfolio status mix across active CSR work."
        >
          <DonutChart
            centerLabel="Campaigns"
            centerValue="48"
            items={campaignStatusMix}
          />
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6">
        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900">Pending Approvals</h3>
            <p className="mt-1 text-sm text-slate-500">
              Main queue for decisions, comments, clarification, and bulk approvals.
            </p>
          </div>
          <div className="overflow-x-auto p-5">
            <PendingApprovalsTable />
          </div>
        </Card>
      </section>

      <Card>
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900">Reports Center</h3>
          <p className="mt-1 text-sm text-slate-500">
            CSR, ESG, financial, NGO, impact, and compliance reports with version control.
          </p>
        </div>
        <div className="overflow-x-auto p-5">
          <ReportsCenterTable />
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel icon={ClipboardCheck} title="Document Review" subtitle="Submitted reports by review state.">
          <div className="grid gap-3">
            <MiniMetric title="22 under review" text="Reports and documents submitted" />
            <MiniMetric title="8 need revision" text="NGO response requested" />
            <MiniMetric title="14 approved" text="Ready for signature or export" />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel icon={ShieldCheck} title="Digital Signatures" subtitle="Approval stamp and sign-off status.">
          <div className="space-y-3">
            <Insight tone="green" text="Q2 ESG summary signed by authorized signatory." />
            <Insight tone="blue" text="3 final reports are ready for approval stamping." />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel icon={Activity} title="Audit Trail" subtitle="Recent approval and report actions.">
          <div className="space-y-3">
            {auditTrailRows.map(([action, user, time, details]) => (
              <div className="border-l-2 border-blue-500 pl-3" key={`${action}-${time}`}>
                <p className="text-xs font-semibold text-slate-500">{time} - {action} by {user}</p>
                <p className="text-sm text-slate-800">{details}</p>
              </div>
            ))}
          </div>
        </AnalyticsPanel>
      </section>
    </div>
  );
}

function PendingApprovalsTable() {
  return (
    <table className="w-full min-w-[820px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Request Type</th>
          <th className="pb-3">NGO/Campaign</th>
          <th className="pb-3">Requested By</th>
          <th className="pb-3">Priority</th>
          <th className="pb-3">Status</th>
          <th className="pb-3">Pending Since</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {pendingApprovals.map(([type, item, requestedBy, priority, status, pending]) => (
          <tr key={`${type}-${item}`}>
            <td className="py-3 font-semibold text-slate-900">{type}</td>
            <td className="py-3 text-slate-600">{item}</td>
            <td className="py-3 text-slate-600">{requestedBy}</td>
            <td className="py-3"><PriorityBadge priority={priority} /></td>
            <td className="py-3"><ApprovalStatusBadge status={status} /></td>
            <td className="py-3 text-slate-600">{pending}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReportsCenterTable() {
  return (
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Report Name</th>
          <th className="pb-3">Type</th>
          <th className="pb-3">NGO/Campaign</th>
          <th className="pb-3">Status</th>
          <th className="pb-3">Last Updated</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {reportsCenter.map(([name, type, owner, status, updated]) => (
          <tr key={name}>
            <td className="py-3 font-semibold text-slate-900">{name}</td>
            <td className="py-3 text-slate-600">{type}</td>
            <td className="py-3 text-slate-600">{owner}</td>
            <td className="py-3"><ReportStatusBadge status={status} /></td>
            <td className="py-3 text-slate-600">{updated}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const className = priority === "High" ? "bg-red-50 text-red-700" : priority === "Medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>{priority}</span>;
}

function ApprovalStatusBadge({ status }: { status: string }) {
  const className = status === "Approved" ? "bg-emerald-50 text-emerald-700" : status === "Rejected" ? "bg-red-50 text-red-700" : status === "Escalated" || status === "Revision Requested" ? "bg-amber-50 text-amber-700" : status === "Under Review" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}

function ReportStatusBadge({ status }: { status: string }) {
  const className = status === "Approved" ? "bg-emerald-50 text-emerald-700" : status === "Needs Revision" ? "bg-amber-50 text-amber-700" : status === "Under Review" || status === "Submitted" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}

function NotificationsPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
            Central Alert & Notification Engine
          </div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
            Prevent missed approvals, deadlines, risks, document expiries, and
            delayed campaigns with real-time alerts, reminders, escalations, and
            delivery tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <CheckCircle2 className="h-4 w-4" />
            Mark All Read
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <Bell className="h-4 w-4" />
            Preferences
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {notificationOverview.map(([label, value, meta, tone]) => (
          <SimpleKpi key={label} label={label} value={value} meta={meta} tone={tone} />
        ))}
      </section>

      <section className="grid gap-6">
        <Card>
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Notification Center</h3>
              <p className="mt-1 text-sm text-slate-500">
                Main inbox with read/unread, pin, archive, and search actions.
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400"
                placeholder="Search notifications..."
                type="search"
              />
            </div>
          </div>
          <div className="overflow-x-auto p-5">
            <NotificationFeedTable />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <AnalyticsPanel icon={Clock} title="Reminder Engine" subtitle="Approval, report, compliance expiry, meeting, and audit reminders.">
          <div className="space-y-3">
            <MiniMetric title="Recurring reminders" text="Auto reminders for reports and approvals" />
            <MiniMetric title="Snooze enabled" text="Users can defer non-critical alerts" />
            <MiniMetric title="Escalation reminders" text="SLA breach alerts route upward" />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel icon={MessageCircle} title="Multi-Channel Delivery" subtitle="In-app, email, SMS, push, WhatsApp optional, emergency routing.">
          <ProgressStack
            items={[
              ["In-app delivery", 98],
              ["Email delivery", 94],
              ["SMS delivery", 87],
              ["Push delivery", 91],
            ]}
          />
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900">Notification Logs</h3>
            <p className="mt-1 text-sm text-slate-500">
              Delivery tracking, read receipts, failed retries, and audit-ready logs.
            </p>
          </div>
          <div className="overflow-x-auto p-5">
            <NotificationLogsTable />
          </div>
        </Card>
        <AnalyticsPanel icon={LineChart} title="Notification Analytics" subtitle="Response time, delay trends, missed alerts, escalation frequency.">
          <ProgressStack
            items={[
              ["Approval response", 72],
              ["Missed alert reduction", 81],
              ["Escalation resolution", 68],
              ["Digest engagement", 77],
            ]}
          />
        </AnalyticsPanel>
      </section>

    </div>
  );
}

function NotificationFeedTable() {
  return (
    <table className="w-full min-w-[700px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Type</th>
          <th className="pb-3">Message</th>
          <th className="pb-3">Priority</th>
          <th className="pb-3">Time</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {notificationFeed.map(([type, message, priority, time]) => (
          <tr key={`${type}-${time}`}>
            <td className="py-3 font-semibold text-slate-900">{type}</td>
            <td className="py-3 text-slate-600">{message}</td>
            <td className="py-3"><NotificationPriorityBadge priority={priority} /></td>
            <td className="py-3 text-slate-600">{time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NotificationLogsTable() {
  return (
    <table className="w-full min-w-[620px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Notification</th>
          <th className="pb-3">Recipient</th>
          <th className="pb-3">Status</th>
          <th className="pb-3">Time</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {notificationLogs.map(([notification, recipient, status, time]) => (
          <tr key={`${notification}-${time}`}>
            <td className="py-3 font-semibold text-slate-900">{notification}</td>
            <td className="py-3 text-slate-600">{recipient}</td>
            <td className="py-3"><ReportStatusBadge status={status} /></td>
            <td className="py-3 text-slate-600">{time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NotificationPriorityBadge({ priority }: { priority: string }) {
  const className = priority === "Critical" ? "bg-red-50 text-red-700" : priority === "High" ? "bg-amber-50 text-amber-700" : priority === "Medium" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>{priority}</span>;
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

  const roles = employees;
  const totalPageAssignments = roles.reduce((total, role) => total + role.pages.length, 0);
  const fullAccessUsers = roles.filter(
    (role) => role.pages.length === roleAccessPages.length,
  ).length;
  const restrictedUsers = roles.length - fullAccessUsers;
  const accessStats = [
    ["Employees", String(roles.length), "With workspace access", "blue"],
    ["Full Access", String(fullAccessUsers), "Can open all pages", "emerald"],
    ["Restricted", String(restrictedUsers), "Limited page access", "amber"],
    ["Assignments", String(totalPageAssignments), "Total page permissions", "violet"],
  ];

  function toggleDraftPage(page: string) {
    setRoleDraft((current) => {
      const pages = current.pages.includes(page)
        ? current.pages.filter((item) => item !== page)
        : [...current.pages, page];

      return {
        ...current,
        pages: pages.length ? pages : ["Dashboard"],
      };
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
    const result = await onCreateEmployee({
      ...roleDraft,
      name,
      email,
      position,
    });
    setIsSavingEmployee(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setRoleDraft({
      name: "",
      email: "",
      position: "",
      password: "",
      pages: ["Dashboard"],
    });
    setIsRoleFormOpen(false);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-slate-800 p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
            RBAC + Permission Governance
          </div>
          <h2 className="text-2xl font-bold">Employees & Access</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
            Manage CSR team members, responsibilities, workload, and page
            access in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canManageEmployees ? (
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              onClick={() => setIsRoleFormOpen((current) => !current)}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          ) : null}
        </div>
      </section>

      {isRoleFormOpen && canManageEmployees ? (
        <Card className="border-blue-200">
          <form className="grid gap-5 p-5 xl:grid-cols-[0.85fr_1.15fr]" onSubmit={submitRole}>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Add User Access</h3>
                  <p className="text-sm text-slate-500">
                    Add a person, their position, and the pages they can open.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">User Name</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    onChange={(event) =>
                      setRoleDraft((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Ananya Sharma"
                    required
                    value={roleDraft.name}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">Email</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    onChange={(event) =>
                      setRoleDraft((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="ananya@company.com"
                    required
                    type="email"
                    value={roleDraft.email}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">Position</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    onChange={(event) =>
                      setRoleDraft((current) => ({ ...current, position: event.target.value }))
                    }
                    placeholder="Finance Manager"
                    required
                    value={roleDraft.position}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">Temporary Password</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    minLength={8}
                    onChange={(event) =>
                      setRoleDraft((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder="At least 8 characters"
                    required
                    type="password"
                    value={roleDraft.password}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Allowed Pages</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {roleAccessPages.map((page) => (
                    <label
                      className={`flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-medium transition ${
                        roleDraft.pages.includes(page)
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"
                      }`}
                      key={page}
                    >
                      <input
                        checked={roleDraft.pages.includes(page)}
                        className="h-4 w-4 accent-blue-600"
                        onChange={() => toggleDraftPage(page)}
                        type="checkbox"
                      />
                      <span>{page}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {formError}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  className="h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsRoleFormOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSavingEmployee}
                  type="submit"
                >
                  {isSavingEmployee ? "Saving..." : "Create Login"}
                </button>
              </div>
            </div>
          </form>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        {accessStats.map(([label, value, meta, tone]) => (
          <SimpleKpi key={label} label={label} value={value} meta={meta} tone={tone} />
        ))}
      </section>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Users className="h-4 w-4 text-blue-500" />
              Employee Directory
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Current CSR team members, departments, roles, active campaigns, and managers.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400"
              placeholder="Search employees..."
              type="search"
            />
          </div>
        </div>
        <div className="overflow-x-auto p-5">
          <EmployeeTable employees={employees} />
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900">Page Access</h3>
            <p className="mt-1 text-sm text-slate-500">
              People who can open this workspace and how many pages they can access.
            </p>
          </div>
          <div className="overflow-x-auto p-5">
            <RoleTable roles={roles} />
          </div>
        </Card>

        <AnalyticsPanel
          icon={CheckCircle2}
          title="Open Tasks"
          subtitle="Current employee responsibilities that need follow-up."
        >
          <div className="space-y-3">
            {taskRows.map(([task, priority, deadline, status]) => (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={task}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{task}</p>
                  <PriorityBadge priority={priority} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Due {deadline} - {status}
                </p>
              </div>
            ))}
          </div>
        </AnalyticsPanel>
      </section>

      <Card>
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900">Page Access By User</h3>
          <p className="mt-1 text-sm text-slate-500">
            This maps each person to the dashboard pages that should appear for them.
          </p>
        </div>
        <div className="overflow-x-auto p-5">
          <RoleAccessMatrix roles={roles} />
        </div>
      </Card>
    </div>
  );
}

function RoleTable({ roles }: { roles: RoleAccess[] }) {
  return (
    <table className="w-full min-w-[780px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">User</th>
          <th className="pb-3">Email</th>
          <th className="pb-3">Position</th>
          <th className="pb-3">Pages</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {roles.map(({ email, name, pages, position }) => (
          <tr key={`${email}-${position}`}>
            <td className="py-3 font-semibold text-slate-900">{name}</td>
            <td className="py-3 text-slate-600">{email}</td>
            <td className="py-3 font-semibold text-blue-600">{position}</td>
            <td className="py-3 text-slate-600">{pages.length} pages</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RoleAccessMatrix({ roles }: { roles: RoleAccess[] }) {
  return (
    <table className="w-full min-w-[980px] text-center text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3 text-left">User</th>
          {roleAccessPages.map((page) => (
            <th className="pb-3" key={page}>
              {page.replace(" & ", " + ")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {roles.map((role) => (
          <tr key={`${role.email}-${role.position}`}>
            <td className="py-3 text-left">
              <p className="font-semibold text-slate-900">{role.name}</p>
              <p className="text-xs text-slate-500">{role.position}</p>
            </td>
            {roleAccessPages.map((page) => {
              const allowed = role.pages.includes(page);

              return (
                <td className="py-3" key={page}>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      allowed
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {allowed ? "Y" : "N"}
                  </span>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EmployeeManagement() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
            Internal CSR Workforce Management
          </div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
            Manage corporate CSR employees, assign responsibilities, track
            activity, monitor workload, organize departments, and improve
            accountability across the CSR operating team.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <Users className="h-4 w-4" />
            Create Team
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {employeeOverview.map(([label, value, meta, tone]) => (
          <SimpleKpi key={label} label={label} value={value} meta={meta} tone={tone} />
        ))}
      </section>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Users className="h-4 w-4 text-blue-500" />
              Employee Directory
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Search, filter, profile, add, remove, and manage employees.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400"
              placeholder="Search employees..."
              type="search"
            />
          </div>
        </div>
        <div className="overflow-x-auto p-5">
          <EmployeeTable />
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900">Employee Profile Workspace</h3>
            <p className="mt-1 text-sm text-slate-500">
              Full employee intelligence profile after opening a team member.
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {employeeTabs.map(([title, text]) => (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4" key={title}>
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900">Departments & Teams</h3>
            <p className="mt-1 text-sm text-slate-500">
              CSR, Finance, Compliance, ESG, Legal, and Operations hierarchy.
            </p>
          </div>
          <div className="space-y-3 p-5">
            {departmentRows.map(([department, count, manager, workload]) => (
              <div className="grid grid-cols-4 gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm" key={department}>
                <span className="font-semibold text-slate-900">{department}</span>
                <span className="text-slate-500">{count} people</span>
                <span className="text-slate-500">{manager}</span>
                <span className="font-semibold text-blue-600">{workload}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel icon={CheckCircle2} title="Task Assignment" subtitle="Assign tasks, deadlines, dependencies, reminders, escalation workflows.">
          <div className="space-y-3">
            {taskRows.map(([task, priority, deadline, status]) => (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={task}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{task}</p>
                  <PriorityBadge priority={priority} />
                </div>
                <p className="mt-1 text-xs text-slate-500">Due {deadline} - {status}</p>
              </div>
            ))}
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel icon={FolderKanban} title="Campaign Assignment" subtitle="Multi-user assignment, ownership, department collaboration.">
          <div className="space-y-3">
            <MiniMetric title="Rural Education" text="Ananya, Rohan, Kabir assigned" />
            <MiniMetric title="Women Skill Labs" text="Sara, Ananya, Finance reviewer" />
            <MiniMetric title="Water Access" text="Kabir owns NGO coordination" />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel icon={Activity} title="Attendance & Activity" subtitle="Login activity, platform usage, last active time, work hours.">
          <div className="space-y-3">
            {employeeActivityRows.map(([action, user, time, detail]) => (
              <div className="border-l-2 border-blue-500 pl-3" key={`${action}-${time}`}>
                <p className="text-xs font-semibold text-slate-500">{time} - {user}</p>
                <p className="text-sm text-slate-800">{action}: {detail}</p>
              </div>
            ))}
          </div>
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel icon={LineChart} title="Performance Tracking" subtitle="Tasks completed, approval time, campaign success, NGO satisfaction, reporting efficiency.">
          <ProgressStack
            items={[
              ["Tasks completed", 86],
              ["Campaign success", 91],
              ["NGO satisfaction", 92],
              ["Reporting efficiency", 93],
            ]}
          />
        </AnalyticsPanel>
        <AnalyticsPanel icon={Wallet} title="Workload Monitoring" subtitle="Task overload, resource availability, team capacity, reassignment suggestions.">
          <div className="space-y-3">
            <Insight tone="amber" text="Finance team operating at 92% workload." />
            <Insight tone="blue" text="CSR team has capacity for 4 additional campaign reviews." />
            <Insight tone="green" text="AI suggests adding NGO reviewers to reduce delays." />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel icon={Bot} title="AI Employee Insights" subtitle="Approval bottlenecks, overloaded employees, slow responses, efficiency gaps.">
          <div className="space-y-3">
            <Insight tone="amber" text="Rohan has 14 pending financial approvals this week." />
            <Insight tone="blue" text="Kabir resolves NGO queries 28% faster than team average." />
            <Insight tone="green" text="Reassigning 6 tasks may reduce compliance delay by 2 days." />
          </div>
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <AnalyticsPanel icon={FileText} title="Documents & Records" subtitle="Employment documents, certifications, policy acknowledgements, NDA/compliance docs.">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric title="118" text="Policy acknowledgements" />
            <MiniMetric title="42" text="CSR certifications" />
            <MiniMetric title="9" text="Documents pending" />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel icon={Download} title="Reports & Analytics" subtitle="Performance, workload, task completion, department productivity.">
          <div className="grid gap-3 sm:grid-cols-3">
            {["Performance", "Workload", "Productivity"].map((report) => (
              <button className="h-11 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50" key={report} type="button">
                {report} Report
              </button>
            ))}
          </div>
        </AnalyticsPanel>
      </section>
    </div>
  );
}

function EmployeeTable({ employees }: { employees?: RoleAccess[] }) {
  if (employees) {
    return (
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="pb-3">Employee</th>
            <th className="pb-3">Email</th>
            <th className="pb-3">Position</th>
            <th className="pb-3">Page Access</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.length ? (
            employees.map((employee) => (
              <tr key={employee.id || employee.email}>
                <td className="py-3 font-semibold text-slate-900">{employee.name}</td>
                <td className="py-3 text-slate-600">{employee.email}</td>
                <td className="py-3 text-slate-600">{employee.position}</td>
                <td className="py-3 font-semibold text-blue-600">
                  {employee.pages.length} pages
                </td>
                <td className="py-3">
                  <EmployeeStatusBadge
                    status={employee.isActive === false ? "Suspended" : "Active"}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="py-8 text-center text-sm text-slate-400" colSpan={5}>
                No employee logins yet. Add an employee to create backend access.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  return (
    <table className="w-full min-w-[780px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Employee</th>
          <th className="pb-3">Department</th>
          <th className="pb-3">Role</th>
          <th className="pb-3">Campaigns</th>
          <th className="pb-3">Status</th>
          <th className="pb-3">Manager</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {employeeRows.map(([employee, department, role, campaigns, status, manager]) => (
          <tr key={employee}>
            <td className="py-3 font-semibold text-slate-900">{employee}</td>
            <td className="py-3 text-slate-600">{department}</td>
            <td className="py-3 text-slate-600">{role}</td>
            <td className="py-3 font-semibold text-blue-600">{campaigns}</td>
            <td className="py-3"><EmployeeStatusBadge status={status} /></td>
            <td className="py-3 text-slate-600">{manager}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmployeeStatusBadge({ status }: { status: string }) {
  const className = status === "Active" ? "bg-emerald-50 text-emerald-700" : status === "On Leave" ? "bg-amber-50 text-amber-700" : status === "Suspended" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}

function AuditCompliance() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-slate-800 p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
            CSR Governance & Regulatory Monitoring
          </div>
          <h2 className="text-2xl font-bold">Audit & Compliance</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
            Ensure CSR legal compliance, maintain audit readiness, track every
            platform action, manage documents, detect violations, and create
            transparent governance trails.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <ShieldCheck className="h-4 w-4" />
            Run Compliance Check
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <Download className="h-4 w-4" />
            Export Audit Pack
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        {complianceOverview.map(([label, value, meta, tone]) => (
          <SimpleKpi key={label} label={label} value={value} meta={meta} tone={tone} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900">Audit Dashboard</h3>
            <p className="mt-1 text-sm text-slate-500">
              Internal, NGO, financial, ESG, and compliance audit activities.
            </p>
          </div>
          <div className="overflow-x-auto p-5">
            <AuditTable />
          </div>
        </Card>

        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900">Compliance Tracker</h3>
            <p className="mt-1 text-sm text-slate-500">
              CSR, NGO, financial, and ESG compliance health by item.
            </p>
          </div>
          <div className="overflow-x-auto p-5">
            <ComplianceTable />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel icon={Bell} title="Regulatory Monitoring" subtitle="CSR spend targets, annual filings, certificates, ESG obligations, audit deadlines.">
          <div className="space-y-3">
            <Insight tone="amber" text="CSR annual filing due in 7 days." />
            <Insight tone="amber" text="Jal Seva Trust 80G expires next month." />
            <Insight tone="blue" text="BRSR reporting obligation is 78% complete." />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel icon={FileText} title="Document Compliance" subtitle="CSR-1, 12A, 80G, FCRA, corporate CSR policy, reports, audits.">
          <ProgressStack
            items={[
              ["NGO documents valid", 88],
              ["Corporate documents current", 96],
              ["Expiry reminders configured", 91],
              ["AI validation coverage", 74],
            ]}
          />
        </AnalyticsPanel>
        <AnalyticsPanel icon={Wallet} title="Financial Compliance" subtitle="Fund releases, UCs, invoices, expense reports, audit reports.">
          <div className="grid gap-3">
            <MiniMetric title="18 UCs pending" text="Awaiting compliance review" />
            <MiniMetric title="3 invoice flags" text="Potential duplicate bills" />
            <MiniMetric title="91%" text="Spending validation score" />
          </div>
        </AnalyticsPanel>
      </section>

      <Card>
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900">Immutable Audit Logs</h3>
          <p className="mt-1 text-sm text-slate-500">
            Fund approvals, budget edits, NGO verification, uploads, role changes, logins, document modifications.
          </p>
        </div>
        <div className="overflow-x-auto p-5">
          <AuditLogsTable />
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <AnalyticsPanel icon={ShieldCheck} title="Risk & Violations" subtitle="Financial, NGO, operational, compliance, and audit risks by severity.">
          <div className="space-y-3">
            {violationRows.map(([category, risk, severity, action]) => (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={`${category}-${risk}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{category}</p>
                  <RiskLevelBadge level={severity} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{risk}</p>
                <p className="mt-1 text-xs text-slate-500">{action}</p>
              </div>
            ))}
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel icon={Users} title="NGO Compliance" subtitle="CSR-1, FCRA, audit submissions, timeliness, trust impact, blacklist status.">
          <div className="rounded-xl bg-blue-50 p-4 text-center">
            <p className="text-sm font-semibold text-blue-700">NGO Compliance Score</p>
            <p className="mt-1 text-4xl font-bold text-blue-900">82/100</p>
            <p className="mt-1 text-sm text-blue-600">Moderate risk watchlist</p>
          </div>
          <div className="mt-4 grid gap-3">
            <MiniMetric title="8 expiring documents" text="Renewal reminders active" />
            <MiniMetric title="5 delayed reports" text="Trust score impact pending" />
          </div>
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6">
        <AnalyticsPanel icon={CheckCircle2} title="Corrective Actions" subtitle="Escalation workflow, resolution tracking, compliance closure verification.">
          <div className="space-y-3">
            {correctiveRows.map(([issue, assignedTo, deadline, status]) => (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={issue}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{issue}</p>
                  <ReportStatusBadge status={status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{assignedTo} - Due {deadline}</p>
              </div>
            ))}
          </div>
        </AnalyticsPanel>
      </section>
    </div>
  );
}

function AuditTable() {
  return (
    <table className="w-full min-w-[680px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Audit Type</th>
          <th className="pb-3">Campaign/NGO</th>
          <th className="pb-3">Auditor</th>
          <th className="pb-3">Status</th>
          <th className="pb-3">Due Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {auditRows.map(([type, entity, auditor, status, due]) => (
          <tr key={`${type}-${entity}`}>
            <td className="py-3 font-semibold text-slate-900">{type}</td>
            <td className="py-3 text-slate-600">{entity}</td>
            <td className="py-3 text-slate-600">{auditor}</td>
            <td className="py-3"><ReportStatusBadge status={status} /></td>
            <td className="py-3 text-slate-600">{due}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ComplianceTable() {
  return (
    <table className="w-full min-w-[680px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Compliance Item</th>
          <th className="pb-3">Entity</th>
          <th className="pb-3">Status</th>
          <th className="pb-3">Expiry</th>
          <th className="pb-3">Risk</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {complianceRows.map(([item, entity, status, expiry, risk]) => (
          <tr key={`${item}-${entity}`}>
            <td className="py-3 font-semibold text-slate-900">{item}</td>
            <td className="py-3 text-slate-600">{entity}</td>
            <td className="py-3"><ComplianceStatusBadge status={status} /></td>
            <td className="py-3 text-slate-600">{expiry}</td>
            <td className="py-3"><RiskLevelBadge level={risk} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AuditLogsTable() {
  return (
    <table className="w-full min-w-[820px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Action</th>
          <th className="pb-3">User</th>
          <th className="pb-3">Entity</th>
          <th className="pb-3">Timestamp</th>
          <th className="pb-3">Details</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {auditLogRows.map(([action, user, entity, timestamp, details]) => (
          <tr key={`${action}-${timestamp}`}>
            <td className="py-3 font-semibold text-slate-900">{action}</td>
            <td className="py-3 text-slate-600">{user}</td>
            <td className="py-3 text-slate-600">{entity}</td>
            <td className="py-3 text-slate-600">{timestamp}</td>
            <td className="py-3 text-slate-600">{details}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ComplianceStatusBadge({ status }: { status: string }) {
  const className = status === "Compliant" ? "bg-emerald-50 text-emerald-700" : status === "Expiring Soon" ? "bg-amber-50 text-amber-700" : status === "Non-Compliant" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}

function AiInsights() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-700 p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
            AI Copilot for CSR & ESG Management
          </div>
          <h2 className="text-2xl font-bold">AI Insights</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
            Predict risks and outcomes, recommend NGOs and projects, detect
            anomalies, generate summaries, and help teams make stronger CSR and
            ESG decisions.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <Bot className="h-4 w-4" />
            Open Copilot
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <FileText className="h-4 w-4" />
            Generate Summary
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {aiOverview.map(([label, value, meta, tone]) => (
          <SimpleKpi key={label} label={label} value={value} meta={meta} tone={tone} />
        ))}
      </section>

      <section className="grid gap-6">
        <AnalyticsPanel
          icon={LineChart}
          title="Predictive Analytics"
          subtitle="Budget forecasting, delay prediction, impact forecasting, ESG score forecasting."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniMetric title="84% by Q end" text="Predicted budget utilization" />
            <MiniMetric title="6 projects" text="Delay probability above 60%" />
            <MiniMetric title="2.9L beneficiaries" text="Forecasted annual reach" />
            <MiniMetric title="89/100 ESG" text="Projected Q4 ESG score" />
          </div>
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel
          icon={Users}
          title="NGO Intelligence"
          subtitle="Recommendation, risk analysis, completion probability, reporting quality."
        >
          <ProgressStack
            items={[
              ["Asha Foundation match", 96],
              ["CareBridge reporting quality", 91],
              ["XYZ NGO completion probability", 88],
              ["Jal Seva risk confidence", 64],
            ]}
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={FolderKanban}
          title="Campaign Intelligence"
          subtitle="Success prediction, optimization, opportunity detection, risk alerts."
        >
          <div className="space-y-3">
            <Insight tone="green" text="Rural Education has 92% probability of successful completion." />
            <Insight tone="blue" text="Education campaigns in Bihar show highest impact ROI." />
            <Insight tone="amber" text="Water Access needs milestone rescheduling." />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={Wallet}
          title="Financial Intelligence"
          subtitle="Fraud detection, budget optimization, cost reduction, financial alerts."
        >
          <div className="space-y-3">
            <Insight tone="amber" text="Duplicate invoice pattern detected in one field batch." />
            <Insight tone="blue" text="Rs 24L can be reallocated to higher-efficiency projects." />
            <Insight tone="green" text="Fraud risk remains low across verified NGOs." />
          </div>
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel
          icon={Activity}
          title="Impact Intelligence"
          subtitle="Social ROI, cost per beneficiary, validation, beneficiary analytics."
        >
          <div className="grid gap-3">
            <MiniMetric title="1.8x" text="Portfolio social ROI" />
            <MiniMetric title="Rs 120/person" text="Cost per beneficiary" />
            <MiniMetric title="12% above target" text="Beneficiary growth forecast" />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={Leaf}
          title="ESG Intelligence"
          subtitle="Gap detection, ESG recommendations, carbon forecasting, risk alerts."
        >
          <div className="space-y-3">
            <Insight tone="amber" text="Environmental contribution lower than industry benchmark." />
            <Insight tone="green" text="Water projects can increase ESG score by 6 points." />
            <Insight tone="blue" text="Net-zero trajectory improves if climate pipeline is funded." />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={ShieldCheck}
          title="Risk Detection Center"
          subtitle="Financial, NGO, campaign, ESG, and impact risks by severity."
        >
          <div className="space-y-3">
            {riskCenterRows.map(([category, risk, level, owner]) => (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={`${category}-${risk}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{category}</p>
                  <RiskLevelBadge level={level} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{risk}</p>
                <p className="mt-1 text-xs text-slate-500">{owner}</p>
              </div>
            ))}
          </div>
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel
          icon={Bot}
          title="AI Recommendations"
          subtitle="NGO, budget, campaign, and ESG recommendations."
        >
          <div className="space-y-3">
            {aiRecommendations.map(([title, text]) => (
              <MiniMetric key={title} title={title} text={text} />
            ))}
          </div>
        </AnalyticsPanel>
      </section>
    </div>
  );
}

function RiskLevelBadge({ level }: { level: string }) {
  const className =
    level === "High"
      ? "bg-red-50 text-red-700"
      : level === "Medium"
        ? "bg-amber-50 text-amber-700"
        : level === "Critical"
          ? "bg-red-100 text-red-800"
          : "bg-emerald-50 text-emerald-700";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>
      {level}
    </span>
  );
}

function EsgDashboard() {
  const combinedOverview = [
    esgOverview[0],
    esgOverview[1],
    esgOverview[2],
    esgOverview[3],
    impactOverview[0],
    impactOverview[6],
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
            ESG + Verified Impact
          </div>
          <h2 className="text-2xl font-bold">ESG & Impact</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
            Track sustainability scores, SDG contribution, beneficiaries,
            evidence, and measurable outcome changes in one view.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <FileText className="h-4 w-4" />
            Generate Report
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </section>

      <Card>
        <div className="border-b border-slate-100 p-5">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <Filter className="h-4 w-4 text-blue-500" />
            Filters
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Narrow the view by campaign, NGO, state, SDG, ESG category, and reporting period.
          </p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "FY: 2026",
            "Campaign: All",
            "NGO: All",
            "ESG: All",
            "SDG: All",
            "State: All",
            "Date: Last 12 months",
            "Evidence: Verified",
          ].map((filter) => (
            <button
              className="flex h-10 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              key={filter}
              type="button"
            >
              {filter}
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {combinedOverview.map(([label, value, meta, tone]) => (
          <SimpleKpi key={label} label={label} value={value} meta={meta} tone={tone} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel icon={LineChart} title="ESG Score Trend" subtitle="Quarterly ESG score movement.">
          <VerticalBarChart items={esgScoreTrend} unit="" />
        </AnalyticsPanel>
        <AnalyticsPanel icon={Users} title="Beneficiary Reach" subtitle="Impact reach by program area.">
          <HorizontalBarChart items={impactTrend} />
        </AnalyticsPanel>
        <AnalyticsPanel icon={PieChart} title="SDG Contribution" subtitle="Contribution mix by SDG focus.">
          <DonutChart
            centerLabel="SDG"
            centerValue="86%"
            items={[
              ["SDG 4 Education", 35, "#2563eb"],
              ["SDG 3 Health", 22, "#10b981"],
              ["SDG 5 Gender", 18, "#8b5cf6"],
              ["SDG 13 Climate", 12, "#f59e0b"],
            ]}
          />
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <PieChart className="h-4 w-4 text-blue-500" />
              SDG Mapping
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Campaign count, beneficiaries, and ESG contribution by SDG.
            </p>
          </div>
          <div className="overflow-x-auto p-5">
            <SdgTable />
          </div>
        </Card>

        <AnalyticsPanel
          icon={FileText}
          title="Field Evidence"
          subtitle="Recent field reports and verification status."
        >
          <div className="space-y-3">
            {fieldReports.map(([report, ngo, status, date]) => (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={report}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{report}</p>
                  <ImpactStatusBadge status={status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {ngo} - {date}
                </p>
              </div>
            ))}
          </div>
        </AnalyticsPanel>
      </section>

      <Card>
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900">Campaign ESG & Impact Tracking</h3>
          <p className="mt-1 text-sm text-slate-500">
            ESG category, SDG mapping, score, and reported impact by campaign.
          </p>
        </div>
        <div className="overflow-x-auto p-5">
          <EsgCampaignTable />
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900">Before vs After Outcomes</h3>
            <p className="mt-1 text-sm text-slate-500">
              Baseline and latest measurable outcomes from active projects.
            </p>
          </div>
          <div className="overflow-x-auto p-5">
            <BeforeAfterTable />
          </div>
        </Card>
        <AnalyticsPanel
          icon={ClipboardCheck}
          title="Reporting Readiness"
          subtitle="Framework completion for board and statutory reporting."
        >
          <FrameworkTable />
        </AnalyticsPanel>
      </section>
    </div>
  );
}

function SdgTable() {
  return (
    <table className="w-full min-w-[620px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">SDG</th>
          <th className="pb-3">Campaigns</th>
          <th className="pb-3">Beneficiaries</th>
          <th className="pb-3">ESG Contribution</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {sdgRows.map(([sdg, campaignsCount, beneficiaries, contribution]) => (
          <tr key={sdg}>
            <td className="py-3 font-semibold text-slate-900">{sdg}</td>
            <td className="py-3 text-slate-600">{campaignsCount}</td>
            <td className="py-3 text-slate-600">{beneficiaries}</td>
            <td className="py-3 font-semibold text-blue-600">{contribution}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EsgCampaignTable() {
  return (
    <table className="w-full min-w-[720px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Campaign</th>
          <th className="pb-3">ESG Category</th>
          <th className="pb-3">SDGs</th>
          <th className="pb-3">ESG Score</th>
          <th className="pb-3">Impact</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {esgCampaignRows.map(([campaign, category, sdg, score, impact]) => (
          <tr key={campaign}>
            <td className="py-3 font-semibold text-slate-900">{campaign}</td>
            <td className="py-3 text-slate-600">{category}</td>
            <td className="py-3 text-slate-600">{sdg}</td>
            <td className="py-3 font-semibold text-blue-600">{score}</td>
            <td className="py-3 text-slate-600">{impact}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FrameworkTable() {
  return (
    <div className="space-y-3">
      {frameworks.map(([framework, status, completion]) => (
        <div key={framework}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{framework}</span>
            <span className="text-slate-500">{status}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TrendingBenchmarkIcon({ className }: { className?: string }) {
  return <LineChart className={className} />;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ImpactMonitoring() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
            Ground-Level CSR Impact Intelligence
          </div>
          <h2 className="text-2xl font-bold">Impact Monitoring</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
            Monitor project execution, validate NGO work, collect field data,
            measure before/after outcomes, and prove CSR effectiveness with
            verified evidence.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <Map className="h-4 w-4" />
            Open Impact Map
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <Download className="h-4 w-4" />
            Export Impact Report
          </button>
        </div>
      </section>

      <Card>
        <div className="border-b border-slate-100 p-5">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <Filter className="h-4 w-4 text-blue-500" />
            Impact Filters
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Example: Healthcare impact in Rajasthan during FY 2026.
          </p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Campaign: All",
            "NGO: All",
            "State: All",
            "SDG: All",
            "Focus: Healthcare",
            "Beneficiary: All",
            "Date: FY 2026",
            "Status: Active",
          ].map((filter) => (
            <button
              className="flex h-10 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              key={filter}
              type="button"
            >
              {filter}
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-8">
        {impactOverview.map(([label, value, meta, tone]) => (
          <SimpleKpi key={label} label={label} value={value} meta={meta} tone={tone} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Users className="h-4 w-4 text-blue-500" />
              Beneficiary Tracking
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Beneficiary groups, counts, regions, campaigns, and NGOs.
            </p>
          </div>
          <div className="overflow-x-auto p-5">
            <BeneficiaryTable />
          </div>
        </Card>

        <AnalyticsPanel
          icon={FileText}
          title="Field Reporting"
          subtitle="Daily reports, activity logs, attendance, photos, videos, comments."
        >
          <div className="space-y-3">
            {fieldReports.map(([report, ngo, status, date]) => (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={report}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{report}</p>
                  <ImpactStatusBadge status={status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {ngo} - {date}
                </p>
              </div>
            ))}
          </div>
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel
          icon={CheckCircle2}
          title="Milestone Monitoring"
          subtitle="Due dates, completion, approvals, delay alerts, proof uploads."
        >
          <div className="space-y-3">
            {impactMilestones.map(([milestone, ngo, due, status, completion]) => (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={milestone}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{milestone}</p>
                    <p className="text-xs text-slate-500">
                      {ngo} - Due {due}
                    </p>
                  </div>
                  <ImpactStatusBadge status={status} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: completion }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{completion}</span>
                </div>
              </div>
            ))}
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel
          icon={Map}
          title="Geo-Tagged Monitoring"
          subtitle="Photos, videos, field visits, beneficiary check-ins, activity areas."
        >
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-center">
            <Mountain className="mx-auto h-10 w-10 text-blue-500" />
            <p className="mt-3 font-semibold text-slate-900">Interactive Impact Map</p>
            <p className="mt-1 text-sm text-slate-500">
              Project locations, NGO activity areas, impact density, rural coverage.
            </p>
          </div>
          <div className="mt-4 grid gap-3">
            {["Real project location", "Actual field visits", "NGO presence"].map(
              (item) => (
                <MiniMetric key={item} title={item} text="Verification enabled" />
              ),
            )}
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel
          icon={Activity}
          title="Media & Evidence"
          subtitle="Photos, videos, PDFs, survey sheets, testimonials."
        >
          <div className="grid gap-3">
            {evidenceCards.map(([title, value, text]) => (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={title}>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-xl font-bold text-blue-600">{value}</p>
                <p className="text-xs text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900">Before vs After Analytics</h3>
            <p className="mt-1 text-sm text-slate-500">
              Measurable change from baseline to current outcomes.
            </p>
          </div>
          <div className="overflow-x-auto p-5">
            <BeforeAfterTable />
          </div>
        </Card>

        <AnalyticsPanel
          icon={PieChart}
          title="SDG Impact Tracking"
          subtitle="SDG contribution analysis, heatmaps, and progress tracking."
        >
          <ProgressStack
            items={[
              ["SDG 4 Education", 34],
              ["SDG 3 Health", 28],
              ["SDG 5 Gender", 22],
              ["SDG 13 Climate", 16],
            ]}
          />
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel
          icon={MessageCircle}
          title="Survey & Feedback"
          subtitle="Beneficiary, NGO, field staff, and community satisfaction surveys."
        >
          <div className="grid gap-3">
            <MiniMetric title="4.6/5" text="Community satisfaction score" />
            <MiniMetric title="+38%" text="Awareness increase" />
            <MiniMetric title="+42%" text="Skill improvement score" />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={ShieldCheck}
          title="NGO Impact Validation"
          subtitle="Manual, AI, and third-party verification of NGO claims."
        >
          <div className="space-y-3">
            {validationRows.map(([method, volume, status]) => (
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm" key={method}>
                <span className="font-medium text-slate-800">{method}</span>
                <span className="text-slate-500">{volume}</span>
                <span className="font-semibold text-blue-600">{status}</span>
              </div>
            ))}
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={Bot}
          title="AI Impact Insights"
          subtitle="Predictions, recommendations, fake reporting and missing evidence alerts."
        >
          <div className="space-y-3">
            <Insight tone="blue" text="Women empowerment projects show highest social ROI." />
            <Insight tone="amber" text="3 field reports may contain duplicate media evidence." />
            <Insight tone="green" text="Expected beneficiary reach likely to exceed target by 12%." />
          </div>
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <AnalyticsPanel
          icon={LineChart}
          title="Impact Analytics"
          subtitle="Cost per beneficiary, region-wise impact, NGO-wise impact, campaign ROI."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric title="Rs 120/person" text="Cost per beneficiary" />
            <MiniMetric title="CareBridge" text="Highest NGO impact score" />
            <MiniMetric title="1.8x" text="Campaign social ROI" />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={Download}
          title="Reports & Exports"
          subtitle="Impact, SDG, beneficiary, NGO performance, and field monitoring reports."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {["PDF", "Excel", "CSV"].map((format) => (
              <button
                className="h-11 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
                key={format}
                type="button"
              >
                Export {format}
              </button>
            ))}
          </div>
        </AnalyticsPanel>
      </section>
    </div>
  );
}

function BeneficiaryTable() {
  return (
    <table className="w-full min-w-[720px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Beneficiary Group</th>
          <th className="pb-3">Count</th>
          <th className="pb-3">Region</th>
          <th className="pb-3">Campaign</th>
          <th className="pb-3">NGO</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {beneficiaryRows.map(([group, count, region, campaign, ngo]) => (
          <tr key={group}>
            <td className="py-3 font-semibold text-slate-900">{group}</td>
            <td className="py-3 font-semibold text-blue-600">{count}</td>
            <td className="py-3 text-slate-600">{region}</td>
            <td className="py-3 text-slate-600">{campaign}</td>
            <td className="py-3 text-slate-600">{ngo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BeforeAfterTable() {
  return (
    <table className="w-full min-w-[560px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Outcome</th>
          <th className="pb-3">Before</th>
          <th className="pb-3">After</th>
          <th className="pb-3">Change</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {beforeAfterRows.map(([outcome, before, after, change]) => (
          <tr key={outcome}>
            <td className="py-3 font-semibold text-slate-900">{outcome}</td>
            <td className="py-3 text-slate-600">{before}</td>
            <td className="py-3 text-slate-600">{after}</td>
            <td className="py-3 font-semibold text-emerald-600">{change}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ImpactStatusBadge({ status }: { status: string }) {
  const className =
    status === "Approved" || status === "Verified"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Submitted" || status === "In Progress"
        ? "bg-blue-50 text-blue-700"
        : status === "Under Review"
          ? "bg-violet-50 text-violet-700"
          : status === "Delayed" || status === "Clarification Required"
            ? "bg-amber-50 text-amber-700"
            : "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
}

function BudgetFundTracking() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
            CSR Financial Management & Fund Governance
          </div>
          <h2 className="text-2xl font-bold">Budget & Fund Tracking</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
            Manage CSR budgets, allocate funds, approve disbursements, monitor
            utilization, prevent overspending, and keep financial records
            audit-ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            ["Create Budget", Plus],
            ["Allocate Funds", Wallet],
            ["Release Funds", Download],
          ].map(([label, Icon]) => {
            const ActionIcon = Icon as React.ElementType;
            return (
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                key={String(label)}
                type="button"
              >
                <ActionIcon className="h-4 w-4" />
                {String(label)}
              </button>
            );
          })}
        </div>
      </section>

      <Card>
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Filter className="h-4 w-4 text-blue-500" />
              Financial Controls
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Filter by financial year, campaign, NGO, state, focus area, fund
              status, and budget range.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Approve UC", "Export Financial Report", "Bulk Actions"].map(
              (action) => (
                <button
                  className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  key={action}
                  type="button"
                >
                  {action}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "FY: 2026-27",
            "Campaign: All",
            "NGO: All",
            "State: All",
            "Focus: Education",
            "Fund Status: Active",
            "Budget: Rs 10L+",
            "UC: Pending + Submitted",
          ].map((filter) => (
            <button
              className="flex h-10 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              key={filter}
              type="button"
            >
              {filter}
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
        {budgetOverview.map(([label, value, meta, tone]) => (
          <SimpleKpi key={label} label={label} value={value} meta={meta} tone={tone} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel
          icon={PieChart}
          title="Budget Allocation"
          subtitle="CSR budget split by focus area."
        >
          <DonutChart
            centerLabel="Budget"
            centerValue="Rs 10Cr"
            items={budgetAllocationMix}
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={BarChart3}
          title="Fund Flow"
          subtitle="Budget to allocation, release, utilization, and pending approvals."
        >
          <VerticalBarChart items={fundFlowBars} unit="%" />
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={LineChart}
          title="Burn Rate"
          subtitle="Monthly utilization pace across active campaigns."
        >
          <VerticalBarChart items={burnRateTrend} unit="%" />
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900">Budget Creation</h3>
            <p className="mt-1 text-sm text-slate-500">
              Define annual CSR budgets, allocations, reserves, and revisions.
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {budgetCreation.map(([label, value]) => (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4" key={label}>
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-1 text-sm text-blue-600">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900">Fund Allocation</h3>
            <p className="mt-1 text-sm text-slate-500">
              Campaign budget, milestone-wise allocation, released, utilized,
              and remaining funds.
            </p>
          </div>
          <div className="overflow-x-auto p-5">
            <FundAllocationTable />
          </div>
        </Card>
      </section>

      <Card>
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900">Fund Disbursement</h3>
          <p className="mt-1 text-sm text-slate-500">
            NGO request to finance review, approval, release, and confirmation.
          </p>
        </div>
        <div className="overflow-x-auto p-5">
          <DisbursementTable />
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel
          icon={LineChart}
          title="Expense Breakdown"
          subtitle="Budget usage by expense category."
        >
          <ProgressStack
            items={[
              ["Operations", 32],
              ["Field work", 45],
              ["Logistics", 18],
              ["Training", 27],
              ["Administration", 14],
            ]}
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={Users}
          title="Disbursement Status"
          subtitle="Current request, approval, and release mix."
        >
          <DonutChart
            centerLabel="Requests"
            centerValue="5"
            items={disbursementStatusMix}
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={FileText}
          title="Utilization Certificates"
          subtitle="UCs, bills, invoices, expense reports, bank statements."
        >
          <div className="space-y-3">
            <Insight tone="blue" text="18 UCs submitted and awaiting corporate review." />
            <Insight tone="amber" text="5 UCs have missing bill attachments." />
            <Insight tone="green" text="OCR extraction ready for invoice validation." />
          </div>
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6">
        <AnalyticsPanel
          icon={ShieldCheck}
          title="Risk & Audit"
          subtitle="Overspending, duplicates, missing bills, delayed utilization, suspicious spend."
        >
          <div className="space-y-3">
            <Insight tone="amber" text="UC overdue: Medium severity for Jal Seva Trust." />
            <Insight tone="amber" text="Budget overrun risk: High for Water Access Program." />
            <Insight tone="blue" text="All budget edits and approvals are audit logged." />
          </div>
        </AnalyticsPanel>
      </section>
    </div>
  );
}

function FundAllocationTable() {
  return (
    <table className="w-full min-w-[720px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Campaign</th>
          <th className="pb-3">NGO</th>
          <th className="pb-3">Allocated</th>
          <th className="pb-3">Released</th>
          <th className="pb-3">Utilized</th>
          <th className="pb-3">Remaining</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {fundAllocations.map(([campaign, ngo, allocated, released, utilized, remaining]) => (
          <tr key={campaign}>
            <td className="py-3 font-semibold text-slate-900">{campaign}</td>
            <td className="py-3 text-slate-600">{ngo}</td>
            <td className="py-3 text-slate-600">{allocated}</td>
            <td className="py-3 text-blue-600 font-semibold">{released}</td>
            <td className="py-3 text-emerald-600 font-semibold">{utilized}</td>
            <td className="py-3 text-slate-600">{remaining}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DisbursementTable() {
  return (
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">NGO</th>
          <th className="pb-3">Campaign</th>
          <th className="pb-3">Requested</th>
          <th className="pb-3">Approved</th>
          <th className="pb-3">Released Date</th>
          <th className="pb-3">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {disbursements.map(([ngo, campaign, requested, approved, date, status]) => (
          <tr key={`${ngo}-${campaign}`}>
            <td className="py-3 font-semibold text-slate-900">{ngo}</td>
            <td className="py-3 text-slate-600">{campaign}</td>
            <td className="py-3 text-slate-600">{requested}</td>
            <td className="py-3 text-slate-600">{approved}</td>
            <td className="py-3 text-slate-600">{date}</td>
            <td className="py-3">
              <FundStatusBadge status={status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FundStatusBadge({ status }: { status: string }) {
  const className =
    status === "Released"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Approved"
        ? "bg-blue-50 text-blue-700"
        : status === "Under Review"
          ? "bg-violet-50 text-violet-700"
          : status === "Requested"
            ? "bg-amber-50 text-amber-700"
            : "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
}

function NgoManagement({
  assigningNgoId,
  candidates,
  connections,
  onAssignProject,
}: {
  assigningNgoId: string;
  candidates: NgoCandidate[];
  connections: ProjectConnection[];
  onAssignProject: (candidate: NgoCandidate) => void;
}) {
  const connectedNgoIds = new Set(connections.map((connection) => connection.ngo_id));
  const connectedNgoNames = new Set(connections.map((connection) => connection.ngo_name));

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
            Corporate CRM for NGOs
          </div>
          <h2 className="text-2xl font-bold">NGO Management</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
            Onboard, verify, profile, evaluate, and manage long-term NGO
            relationships with trust, risk, compliance, financial, and impact
            intelligence in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <Plus className="h-4 w-4" />
            Add NGO
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <HeartHandshake className="h-4 w-4" />
            Invite NGO
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <Download className="h-4 w-4" />
            Export NGOs
          </button>
        </div>
      </section>

      <Card>
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Filter className="h-4 w-4 text-blue-500" />
              NGO Filters
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Narrow partners by verification, focus area, state, trust score, and rating.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Verify NGO", "Blacklist NGO", "Bulk Actions"].map((action) => (
              <button
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                key={action}
                type="button"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Verification: All",
            "Focus: Education",
            "State: All",
            "Trust: 70+",
            "ESG: Available",
            "Type: Section 8",
            "CSR Eligible",
            "Rating: 4+",
          ].map((filter) => (
            <button
              className="flex h-10 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              key={filter}
              type="button"
            >
              {filter}
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {ngoOverview.map(([label, value, meta, tone]) => (
          <SimpleKpi key={label} label={label} value={value} meta={meta} tone={tone} />
        ))}
      </section>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Users className="h-4 w-4 text-blue-500" />
              NGO Directory
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Verified, pending, under-review, suspended, blacklisted, and
              inactive NGOs.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400"
              placeholder="Search NGOs..."
              type="search"
            />
          </div>
        </div>
        <div className="overflow-x-auto p-5">
          <NgoDirectoryTable
            assigningNgoId={assigningNgoId}
            candidates={candidates}
            connectedNgoIds={connectedNgoIds}
            connectedNgoNames={connectedNgoNames}
            onAssignProject={onAssignProject}
          />
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsPanel
          icon={ShieldCheck}
          title="Trust Score"
          subtitle="Compliance, reporting timeliness, transparency, project success, and feedback."
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-blue-50 p-4 text-center">
              <p className="text-sm font-semibold text-blue-700">Trust Score</p>
              <p className="mt-1 text-4xl font-bold text-blue-900">84/100</p>
              <p className="mt-1 text-sm text-blue-600">Low Risk NGO</p>
            </div>
            <ProgressStack
              items={[
                ["Compliance", 25],
                ["Reporting Timeliness", 20],
                ["Financial Transparency", 20],
                ["Project Success", 20],
                ["Corporate Feedback", 15],
              ]}
            />
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel
          icon={Bot}
          title="AI NGO Matching"
          subtitle="Recommendations based on campaign goals, region, ESG, budget, and performance."
        >
          <div className="space-y-3">
            <Insight tone="blue" text="Asha Foundation is the best fit for Women Skill Labs." />
            <Insight tone="green" text="CareBridge has strongest healthcare reporting quality." />
            <Insight tone="amber" text="Jal Seva Trust needs clarification before assignment." />
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel
          icon={Activity}
          title="Risk & Performance"
          subtitle="Delayed reporting, low utilization, compliance expiry, audit issues."
        >
          <div className="grid gap-3">
            <MiniMetric title="92%" text="Average project completion rate" />
            <MiniMetric title="3.6 days" text="Average reporting delay" />
            <MiniMetric title="89%" text="Fund utilization efficiency" />
          </div>
        </AnalyticsPanel>
      </section>
    </div>
  );
}

function NgoDirectoryTable({
  assigningNgoId,
  candidates,
  connectedNgoIds,
  connectedNgoNames,
  onAssignProject,
}: {
  assigningNgoId: string;
  candidates: NgoCandidate[];
  connectedNgoIds: Set<string>;
  connectedNgoNames: Set<string>;
  onAssignProject: (candidate: NgoCandidate) => void;
}) {
  return (
    <table className="w-full min-w-[820px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">NGO Name</th>
          <th className="pb-3">Focus Area</th>
          <th className="pb-3">State</th>
          <th className="pb-3">Trust Score</th>
          <th className="pb-3">Verification</th>
          <th className="pb-3">Active Projects</th>
          <th className="pb-3">Rating</th>
          <th className="pb-3">Connection</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {candidates.map((candidate) => {
          const connected =
            connectedNgoIds.has(candidate.id) || connectedNgoNames.has(candidate.name);
          const disabled =
            connected ||
            assigningNgoId === candidate.id ||
            candidate.status === "Suspended";

          return (
          <tr key={candidate.id}>
            <td className="py-3 font-semibold text-slate-900">{candidate.name}</td>
            <td className="py-3 text-slate-600">{candidate.focusArea}</td>
            <td className="py-3 text-slate-600">{candidate.state}</td>
            <td className="py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${
                      candidate.trustScore >= 80
                        ? "bg-emerald-500"
                        : candidate.trustScore >= 65
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${candidate.trustScore}%` }}
                  />
                </div>
                <span className="font-semibold text-slate-800">{candidate.trustScore}</span>
              </div>
            </td>
            <td className="py-3">
              <NgoStatusBadge status={candidate.status} />
            </td>
            <td className="py-3 text-slate-600">{candidate.activeProjects}</td>
            <td className="py-3 font-semibold text-blue-600">{candidate.rating}</td>
            <td className="py-3">
              <button
                className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold transition ${
                  connected
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                }`}
                disabled={disabled}
                onClick={() => onAssignProject(candidate)}
                type="button"
              >
                {connected ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
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
  );
}

function NgoStatusBadge({ status }: { status: string }) {
  const className =
    status === "Verified"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Pending Verification"
        ? "bg-amber-50 text-amber-700"
        : status === "Under Review"
          ? "bg-blue-50 text-blue-700"
          : status === "Suspended"
            ? "bg-red-50 text-red-700"
            : "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
}

function CampaignManagement() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
            CSR Project Lifecycle Management
          </div>
          <h2 className="text-2xl font-bold">Campaign Management</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
            Create campaigns, assign NGOs, track execution, manage milestones,
            approve progress, monitor budgets, and close reporting from one
            operating workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <Plus className="h-4 w-4" />
            Create Campaign
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <Download className="h-4 w-4" />
            Export Campaigns
          </button>
        </div>
      </section>

      <Card>
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Filter className="h-4 w-4 text-blue-500" />
              Campaign Filters
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Narrow campaigns by status, NGO, focus area, budget, geography, and year.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Import", "Archive", "Bulk Actions"].map((action) => (
              <button
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                key={action}
                type="button"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Status: Active",
            "NGO: All",
            "Focus: Education",
            "State: All",
            "Budget: Rs 10L+",
            "SDG: All",
            "ESG: Social",
            "Date: FY 2025-26",
          ].map((filter) => (
            <button
              className="flex h-10 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              key={filter}
              type="button"
            >
              {filter}
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {campaignOverview.map(([label, value, meta, tone]) => (
          <SimpleKpi key={label} label={label} value={value} meta={meta} tone={tone} />
        ))}
      </section>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <FolderKanban className="h-4 w-4 text-blue-500" />
              Campaign Table
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Draft, open application, proposal review, approved, active,
              delayed, completed, and archived campaigns.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400"
              placeholder="Search campaigns..."
              type="search"
            />
          </div>
        </div>
        <div className="overflow-x-auto p-5">
          <CampaignManagementTable />
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <AnalyticsPanel
          icon={Bot}
          title="AI NGO Recommendation"
          subtitle="Matches NGOs using focus area, geography, trust score, and past impact."
        >
          <div className="space-y-3">
            <Insight tone="blue" text="GreenSteps is a 96% match for Climate Schools in Tamil Nadu." />
            <Insight tone="green" text="Asha Foundation has strong reporting consistency for skill programs." />
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={ShieldCheck}
          title="AI Risk Detection"
          subtitle="Delay risk, budget overrun risk, and low NGO performance signals."
        >
          <div className="space-y-3">
            <Insight tone="amber" text="Water Access Program has a 64% delay probability." />
            <Insight tone="amber" text="Operational costs are trending 8% above plan." />
          </div>
        </AnalyticsPanel>
      </section>
    </div>
  );
}

function CampaignManagementTable() {
  return (
    <table className="w-full min-w-[920px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Campaign Name</th>
          <th className="pb-3">NGO</th>
          <th className="pb-3">Status</th>
          <th className="pb-3">Budget</th>
          <th className="pb-3">Progress</th>
          <th className="pb-3">State</th>
          <th className="pb-3">ESG Score</th>
          <th className="pb-3">Deadline</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {campaignRows.map(
          ([campaign, ngo, status, budget, progress, state, esg, deadline]) => (
            <tr key={campaign}>
              <td className="py-3 font-semibold text-slate-900">{campaign}</td>
              <td className="py-3 text-slate-600">{ngo}</td>
              <td className="py-3">
                <StatusBadge status={status} />
              </td>
              <td className="py-3 text-slate-600">{budget}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: progress }}
                    />
                  </div>
                  <span className="text-slate-600">{progress}</span>
                </div>
              </td>
              <td className="py-3 text-slate-600">{state}</td>
              <td className="py-3 font-semibold text-blue-600">{esg}</td>
              <td className="py-3 text-slate-600">{deadline}</td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "Delayed"
      ? "bg-amber-50 text-amber-700"
      : status === "Completed"
        ? "bg-emerald-50 text-emerald-700"
        : status === "Proposal Review"
          ? "bg-violet-50 text-violet-700"
          : status === "Open for NGO Applications"
            ? "bg-blue-50 text-blue-700"
            : "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
}

function MasterAnalytics() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
              <BarChart3 className="h-3.5 w-3.5" />
              Portfolio Analytics
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Master Analytics</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Portfolio spend, NGO performance, impact reach, ESG trend, and
              regional concentration in one view.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Excel
            </button>
          </div>
        </div>
      </section>

      <Card>
        <div className="border-b border-slate-100 p-5">
          <h3 className="flex items-center gap-2 font-semibold">
            <Filter className="h-4 w-4 text-blue-500" />
            Analytics Filters
          </h3>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
          {filters.map((filter) => (
            <button
              className="flex h-10 items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              key={filter}
              type="button"
            >
              {filter}
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {masterKpis.map(([label, value, meta, tone]) => (
          <SimpleKpi key={label} label={label} value={value} meta={meta} tone={tone} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalyticsPanel
          icon={LineChart}
          title="Campaign Analytics"
          subtitle="Performance, comparison, trend graph, and ROI."
        >
          <VerticalBarChart items={monthlySpendTrend} unit="L" />
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={Users}
          title="NGO Analytics"
          subtitle="Leaderboard, risk analysis, reporting consistency."
        >
          <ProgressStack
            items={[
              ["XYZ NGO", 94],
              ["Asha Foundation", 88],
              ["CareBridge", 83],
              ["Jal Seva Trust", 64],
            ]}
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={Wallet}
          title="Financial Analytics"
          subtitle="Allocation, utilization, leakage risk, release tracking."
        >
          <DonutChart items={portfolioMix} centerLabel="Budget" centerValue="Rs 8.4Cr" />
        </AnalyticsPanel>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalyticsPanel
          icon={Activity}
          title="Impact Analytics"
          subtitle="Beneficiaries, villages, SDGs, and before vs after outcomes."
        >
          <HorizontalBarChart items={impactTrend} />
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={ShieldCheck}
          title="ESG Analytics"
          subtitle="Environmental, social, governance, and score trends."
        >
          <VerticalBarChart items={esgScoreTrend} unit="" />
        </AnalyticsPanel>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalyticsPanel
          icon={Map}
          title="Regional Concentration"
          subtitle="Project count and allocated budget by state."
        >
          <div className="space-y-3">
            {[
              ["Maharashtra", "12 projects", "Rs 1.4 Cr"],
              ["Uttar Pradesh", "8 projects", "Rs 88L"],
              ["Karnataka", "6 projects", "Rs 74L"],
              ["Tamil Nadu", "5 projects", "Rs 62L"],
            ].map(([state, projects, budget]) => (
              <div
                className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"
                key={state}
              >
                <span className="font-medium text-slate-800">{state}</span>
                <span className="text-slate-500">{projects}</span>
                <span className="font-semibold text-blue-600">{budget}</span>
              </div>
            ))}
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={PieChart}
          title="SDG Contribution"
          subtitle="Portfolio contribution by SDG focus."
        >
          <DonutChart
            centerLabel="SDG"
            centerValue="86%"
            items={[
              ["SDG 4 Education", 35, "#2563eb"],
              ["SDG 3 Health", 22, "#10b981"],
              ["SDG 5 Gender", 18, "#8b5cf6"],
              ["SDG 13 Climate", 12, "#f59e0b"],
            ]}
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          icon={ShieldCheck}
          title="Risk Watch"
          subtitle="Campaigns that need review."
        >
          <div className="space-y-3">
            <Insight tone="amber" text="Water Access has delayed milestone evidence." />
            <Insight tone="amber" text="Jal Seva Trust trust score is below portfolio average." />
            <Insight tone="blue" text="6 projects need finance or compliance review." />
          </div>
        </AnalyticsPanel>
      </section>
    </div>
  );
}

function ProjectWorkspace({ connections }: { connections: ProjectConnection[] }) {
  if (!connections.length) {
    return (
      <Card className="p-8">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <HeartHandshake className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
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
      <section className="rounded-xl bg-gradient-to-r from-slate-900 to-blue-800 p-6 text-white">
        <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
          Shared corporate + NGO execution layer
        </div>
        <h2 className="text-2xl font-bold">Project Workspace</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/90">
          Each assigned project now has one shared record. Corporate teams can
          request documents, review progress, and monitor the same milestones
          the NGO updates from its dashboard.
        </p>
      </section>

      {connections.map((connection) => (
        <Card key={connection.id}>
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {connection.focus_area}
                  </span>
                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    {connection.project_name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Assigned to{" "}
                    <span className="font-semibold text-slate-800">
                      {connection.ngo_name}
                    </span>
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
                  {connection.status}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MiniMetric title={connection.budget} text="Approved project budget" />
                <MiniMetric title={`${connection.progress}%`} text="Completion progress" />
                <MiniMetric title={connection.milestone} text="Current milestone" />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                  <span>Shared progress</span>
                  <span>{connection.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${connection.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Latest NGO update
                </p>
                <p className="mt-1 text-sm text-blue-900">{connection.latest_update}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-5 lg:border-l lg:border-t-0">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText className="h-4 w-4 text-blue-600" />
                Corporate document requests
              </h4>
              <div className="mt-4 space-y-3">
                {connection.document_requests.length ? (
                  connection.document_requests.map((request) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                      key={request}
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {request}
                      </span>
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        Requested
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    No pending requests.
                  </p>
                )}
              </div>
              <button className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
                <FileText className="h-4 w-4" />
                Request Document
              </button>
            </div>
          </div>
        </Card>
      ))}
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
}: {
  errorMessage: string;
  isSending: boolean;
  messageBody: string;
  messages: Message[];
  onMessageBodyChange: (value: string) => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  unlocked: boolean;
}) {
  return (
    <Card className="flex min-h-[calc(100vh-9rem)] flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <h3 className="text-lg font-semibold">Live chat with Corpogn Admin</h3>
          <p className="mt-1 text-sm text-slate-500">
            Send a first message to unlock the corporate workspace for testing.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            unlocked
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {unlocked ? "Workspace unlocked" : "Waiting for first message"}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-5">
        {messages.length ? (
          messages.map((message) => (
            <div
              className={`flex ${
                message.sender_type === "corporate" ? "justify-end" : "justify-start"
              }`}
              key={message.id}
            >
              <div
                className={`max-w-[72%] rounded-lg px-4 py-3 text-sm ${
                  message.sender_type === "corporate"
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-800"
                }`}
              >
                <p>{message.body}</p>
                <p className="mt-2 text-[11px] opacity-70">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
            No messages yet.
          </div>
        )}
      </div>

      <form className="border-t border-slate-100 bg-white p-4" onSubmit={onSendMessage}>
        {errorMessage ? (
          <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {errorMessage}
          </p>
        ) : null}
        <div className="flex gap-3">
          <input
            className="h-11 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500"
            onChange={(event) => onMessageBodyChange(event.target.value)}
            placeholder="Type your message..."
            type="text"
            value={messageBody}
          />
          <button
            className="rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSending || !messageBody.trim()}
            type="submit"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </Card>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function InfoCard({
  icon: Icon,
  text,
  title,
  tone,
}: {
  icon: React.ElementType;
  text: string;
  title: string;
  tone: string;
}) {
  const tones: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    violet: "bg-violet-100 text-violet-700 border-violet-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <Card className="border-blue-200">
      <div className="flex items-start gap-3 p-5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
        </div>
      </div>
    </Card>
  );
}

function KpiCard({
  icon: Icon,
  label,
  meta,
  progress,
  tone,
  value,
}: {
  icon: React.ElementType;
  label: string;
  meta: string;
  progress?: number;
  tone: string;
  value: string;
}) {
  const tones: Record<string, string> = {
    blue: "from-blue-50 to-blue-100/50 border-blue-200 text-blue-900 text-blue-600",
    violet:
      "from-violet-50 to-violet-100/50 border-violet-200 text-violet-900 text-violet-600",
    amber:
      "from-amber-50 to-amber-100/50 border-amber-200 text-amber-900 text-amber-600",
    green:
      "from-green-50 to-green-100/50 border-green-200 text-green-900 text-green-600",
  };

  return (
    <Card className={`bg-gradient-to-br ${tones[tone]}`}>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide opacity-75">
              {label}
            </p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-70">{meta}</p>
          </div>
          <Icon className="h-8 w-8 opacity-60" />
        </div>
        {typeof progress === "number" ? (
          <>
            <div className="h-2 rounded-full bg-white/70">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs font-medium">{progress}% disbursed</p>
          </>
        ) : null}
      </div>
    </Card>
  );
}

function SectionHeader({ text, title }: { text: string; title: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}

function CampaignTable({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="space-y-3">
        {campaigns.map(([campaign, ngo, status, budget, progress]) => (
          <div
            className="rounded-lg border border-slate-100 bg-slate-50 p-3"
            key={campaign}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {campaign}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">{ngo}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                  status === "Delayed"
                    ? "bg-amber-50 text-amber-700"
                    : status === "Completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700"
                }`}
              >
                {status}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>{budget}</span>
              <span className="font-semibold text-slate-700">{progress}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-3">Campaign</th>
          <th className="pb-3">NGO</th>
          <th className="pb-3">Status</th>
          <th className="pb-3">Budget</th>
          <th className="pb-3">Progress</th>
          {!compact ? <th className="pb-3">ESG</th> : null}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {campaigns.map(([campaign, ngo, status, budget, progress, esg]) => (
          <tr key={campaign}>
            <td className="py-3 font-semibold text-slate-900">{campaign}</td>
            <td className="py-3 text-slate-600">{ngo}</td>
            <td className="py-3">
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  status === "Delayed"
                    ? "bg-amber-50 text-amber-700"
                    : status === "Completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700"
                }`}
              >
                {status}
              </span>
            </td>
            <td className="py-3 text-slate-600">{budget}</td>
            <td className="py-3 text-slate-600">{progress}</td>
            {!compact ? <td className="py-3 font-semibold text-blue-600">{esg}</td> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MiniMetric({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

function DonutChart({
  centerLabel,
  centerValue,
  items,
}: {
  centerLabel: string;
  centerValue: string;
  items: ReadonlyArray<readonly [string, number, string]>;
}) {
  const total = items.reduce((sum, [, value]) => sum + value, 0);
  const segments = items
    .reduce(
      (result, [, value, color]) => {
        const end = result.offset + (value / total) * 100;

        return {
          offset: end,
          parts: [...result.parts, `${color} ${result.offset}% ${end}%`],
        };
      },
      { offset: 0, parts: [] as string[] },
    )
    .parts;

  return (
    <div className="grid gap-5 sm:grid-cols-[160px_1fr] sm:items-center">
      <div className="relative mx-auto h-40 w-40">
        <div
          className="h-40 w-40 rounded-full"
          style={{ background: `conic-gradient(${segments.join(", ")})` }}
        />
        <div className="absolute inset-5 grid place-items-center rounded-full bg-white text-center shadow-inner">
          <div>
            <p className="text-xl font-bold text-slate-900">{centerValue}</p>
            <p className="text-xs font-semibold uppercase text-slate-500">
              {centerLabel}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {items.map(([label, value, color]) => (
          <div className="flex items-center justify-between gap-3 text-sm" key={label}>
            <span className="flex min-w-0 items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="truncate">{label}</span>
            </span>
            <span className="font-semibold text-slate-900">{value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerticalBarChart({
  items,
  unit,
}: {
  items: ReadonlyArray<readonly [string, number]>;
  unit: string;
}) {
  const max = Math.max(...items.map(([, value]) => value));

  return (
    <div className="flex h-56 items-end gap-3 rounded-lg bg-slate-50 p-4">
      {items.map(([label, value]) => (
        <div className="flex min-w-10 flex-1 flex-col items-center gap-2" key={label}>
          <div className="flex h-36 w-full items-end rounded-md bg-white px-1.5 py-1.5">
            <div
              className="w-full rounded bg-blue-600"
              style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
            />
          </div>
          <p className="text-xs font-semibold text-slate-900">
            {value}
            {unit}
          </p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}

function HorizontalBarChart({
  items,
}: {
  items: ReadonlyArray<readonly [string, number]>;
}) {
  const max = Math.max(...items.map(([, value]) => value));

  return (
    <div className="space-y-4">
      {items.map(([label, value]) => (
        <div key={label}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-700">{label}</span>
            <span className="font-semibold text-slate-900">{value}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-emerald-500"
              style={{ width: `${Math.max(6, (value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SimpleKpi({
  label,
  meta,
  tone,
  value,
}: {
  label: string;
  meta: string;
  tone: string;
  value: string;
}) {
  const colors: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50/60 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-50/60 text-emerald-700",
    violet: "border-violet-200 bg-violet-50/60 text-violet-700",
    amber: "border-amber-200 bg-amber-50/60 text-amber-700",
  };

  return (
    <Card className={colors[tone]}>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-sm opacity-80">{meta}</p>
      </div>
    </Card>
  );
}

function AnalyticsPanel({
  children,
  icon: Icon,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
  subtitle: string;
  title: string;
}) {
  return (
    <Card>
      <div className="border-b border-slate-100 p-5">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <Icon className="h-4 w-4 text-blue-500" />
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="overflow-x-auto p-5">{children}</div>
    </Card>
  );
}

function ProgressStack({ items }: { items: Array<[string, number]> }) {
  return (
    <div className="space-y-4">
      {items.map(([label, value]) => (
        <div key={label}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{label}</span>
            <span className="font-semibold text-slate-900">{value}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Insight({ text, tone }: { text: string; tone: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <p className={`rounded-lg border px-3 py-2 text-sm font-medium ${colors[tone]}`}>
      {text}
    </p>
  );
}

function FeaturePanel({ activeItem }: { activeItem: string }) {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-xl font-semibold">{activeItem}</h3>
        <p className="mt-2 text-sm text-slate-500">
          This corporate feature is unlocked. We can build the full workflow
          here next.
        </p>
      </div>
    </Card>
  );
}
