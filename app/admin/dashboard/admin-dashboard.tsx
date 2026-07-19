"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  LineChart,
  Loader2,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Tab =
  | "Overview"
  | "Projects"
  | "Corporates"
  | "NGOs"
  | "Recommendations"
  | "Allocations"
  | "Live Projects"
  | "Completed Projects"
  | "Research Queue"
  | "Notifications";

type AdminProject = {
  id: string;
  title: string;
  focus_area: string;
  csr_focus_area?: string | null;
  budget: number;
  state?: string | null;
  district?: string | null;
  duration_months?: number | null;
  description?: string | null;
  sdg_targets?: string[];
  target_beneficiaries?: string[];
  required_skills?: string[];
  status?: string;
  admin_status?: string;
  corporate_decision_status?: string;
  created_at: string;
  corporates?: {
    id: string;
    company_name: string;
    company_email?: string;
  };
};

type TrustScoreRow = {
  id: string;
  opportunity_id: string;
  ngo_id: string;
  overall_score: number;
  score_breakdown: Record<string, number>;
  rank: number;
  why_recommended: string;
  key_strengths: string[];
  past_similar_projects: string;
  budget_experience: string;
  compliance_status: string;
  ngos?: {
    id: string;
    ngo_name: string;
    ngo_email?: string;
    access_status?: string;
    trust_score?: number;
    registration_data?: Record<string, unknown>;
  };
};

type CommandCenterPayload = {
  overview: {
    projects: number;
    pendingRecommendation: number;
    recommendationsSent: number;
    allocated: number;
    liveProjects: number;
    completedProjects: number;
  };
  projects: AdminProject[];
  scores: TrustScoreRow[];
  recommendations: Array<Record<string, unknown>>;
  allocations: Array<Record<string, unknown>>;
  connections: Array<Record<string, unknown>>;
  corporates: Array<Record<string, unknown>>;
  ngos: Array<Record<string, unknown>>;
};

const tabs: Tab[] = [
  "Overview",
  "Projects",
  "Corporates",
  "NGOs",
  "Recommendations",
  "Allocations",
  "Live Projects",
  "Completed Projects",
  "Research Queue",
  "Notifications",
];

const tabIcons: Record<Tab, React.ElementType> = {
  Overview: BarChart3,
  Projects: FolderKanban,
  Corporates: Building2,
  NGOs: Users,
  Recommendations: Sparkles,
  Allocations: ClipboardList,
  "Live Projects": LineChart,
  "Completed Projects": CheckCircle2,
  "Research Queue": Search,
  Notifications: Bell,
};

const emptyPayload: CommandCenterPayload = {
  overview: {
    projects: 0,
    pendingRecommendation: 0,
    recommendationsSent: 0,
    allocated: 0,
    liveProjects: 0,
    completedProjects: 0,
  },
  projects: [],
  scores: [],
  recommendations: [],
  allocations: [],
  connections: [],
  corporates: [],
  ngos: [],
};

export function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [data, setData] = useState<CommandCenterPayload>(emptyPayload);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedNgoIds, setSelectedNgoIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingScores, setIsRefreshingScores] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedProject = data.projects.find((project) => project.id === selectedProjectId) ?? data.projects[0];
  const rankedScores = useMemo(() => {
    if (!selectedProject) return [];
    const query = search.trim().toLowerCase();
    return data.scores
      .filter((score) => score.opportunity_id === selectedProject.id)
      .filter((score) => {
        if (!query) return true;
        return [
          score.ngos?.ngo_name,
          score.ngos?.ngo_email,
          score.why_recommended,
          ...(Array.isArray(score.key_strengths) ? score.key_strengths : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => a.rank - b.rank || b.overall_score - a.overall_score);
  }, [data.scores, search, selectedProject]);

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        router.replace("/signin");
        return;
      }
      setToken(accessToken);
      await load(accessToken);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function load(accessToken = token) {
    if (!accessToken) return;
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/admin/command-center", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const result = (await response.json()) as CommandCenterPayload & { error?: string };

    if (!response.ok) {
      setError(result.error || "Could not load admin command center.");
      setIsLoading(false);
      return;
    }

    setData(result);
    setSelectedProjectId((current) => current || result.projects[0]?.id || "");
    setIsLoading(false);
  }

  async function refreshScores(projectId: string) {
    if (!token || !projectId) return;
    setIsRefreshingScores(true);
    setError("");

    const response = await fetch("/api/admin/command-center", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ opportunityId: projectId }),
    });

    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(result.error || "Could not refresh trust scores.");
      setIsRefreshingScores(false);
      return;
    }

    await load();
    setIsRefreshingScores(false);
    setMessage("Trust scores recalculated for this project.");
  }

  function toggleNgo(ngoId: string) {
    setSelectedNgoIds((current) => {
      if (current.includes(ngoId)) return current.filter((id) => id !== ngoId);
      if (current.length >= 10) return current;
      return [...current, ngoId];
    });
  }

  async function sendRecommendations() {
    if (!token || !selectedProject || !selectedNgoIds.length) return;
    setIsSending(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/admin/recommendations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        opportunityId: selectedProject.id,
        ngoIds: selectedNgoIds,
      }),
    });

    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(result.error || "Could not send recommendations.");
      setIsSending(false);
      return;
    }

    setSelectedNgoIds([]);
    await load();
    setIsSending(false);
    setMessage("Recommendations sent to the corporate dashboard.");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading admin command center...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <aside className="border-r border-slate-200 bg-slate-950 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold">CorpoGN Admin</p>
            <p className="text-xs text-slate-400">CSR command center</p>
          </div>
        </div>
        <nav className="grid gap-1 p-3">
          {tabs.map((tab) => {
            const Icon = tabIcons[tab];
            const active = tab === activeTab;
            return (
              <button
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                  active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {tab}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="min-w-0 flex-1 lg:ml-72">
        <header className="sticky top-0 z-20 flex min-h-16 flex-col justify-center gap-2 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:flex-row md:items-center md:justify-between lg:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Admin Dashboard</p>
            <h1 className="text-xl font-black tracking-tight text-slate-950">CSR Facilitation Lifecycle</h1>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => load()}
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </header>

        <div className="mx-auto w-full max-w-7xl space-y-5 p-4 lg:p-6">
          {error ? <Banner tone="error" text={error} /> : null}
          {message ? <Banner tone="success" text={message} /> : null}

          {activeTab === "Overview" ? <Overview data={data} /> : null}
          {activeTab === "Projects" ? (
            <ProjectsModule
              projects={data.projects}
              selectedProjectId={selectedProject?.id ?? ""}
              onSelect={(projectId) => {
                setSelectedProjectId(projectId);
                setActiveTab("Research Queue");
              }}
            />
          ) : null}
          {activeTab === "Research Queue" ? (
            <ResearchQueue
              projects={data.projects}
              selectedProject={selectedProject}
              scores={rankedScores}
              selectedNgoIds={selectedNgoIds}
              search={search}
              isRefreshing={isRefreshingScores}
              isSending={isSending}
              onProjectChange={(projectId) => {
                setSelectedProjectId(projectId);
                setSelectedNgoIds([]);
              }}
              onSearch={setSearch}
              onRefreshScores={refreshScores}
              onSend={sendRecommendations}
              onToggleNgo={toggleNgo}
            />
          ) : null}
          {activeTab === "NGOs" ? <EntityTable title="NGO Module" rows={data.ngos} primary="ngo_name" /> : null}
          {activeTab === "Corporates" ? <EntityTable title="Corporate Module" rows={data.corporates} primary="company_name" /> : null}
          {activeTab === "Recommendations" ? <GenericRows title="Recommendations Module" rows={data.recommendations} /> : null}
          {activeTab === "Allocations" ? <GenericRows title="Allocation Module" rows={data.allocations} /> : null}
          {activeTab === "Live Projects" ? <GenericRows title="Live Projects" rows={data.connections.filter((row) => row.status === "active")} /> : null}
          {activeTab === "Completed Projects" ? <GenericRows title="Completed Projects" rows={data.connections.filter((row) => row.status === "completed")} /> : null}
          {activeTab === "Notifications" ? <Notifications projects={data.projects} /> : null}
        </div>
      </section>
    </main>
  );
}

function Overview({ data }: { data: CommandCenterPayload }) {
  return (
    <div className="space-y-5">
      <Panel>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Overview</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Operational command center</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
            Monitor project intake, AI-ranked NGO recommendations, corporate decisions, allocations, live delivery, and completion from one admin surface.
          </p>
        </div>
      </Panel>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Stat label="Projects" value={data.overview.projects} />
        <Stat label="Pending Recommendation" value={data.overview.pendingRecommendation} />
        <Stat label="Recommendations Sent" value={data.overview.recommendationsSent} />
        <Stat label="Allocated" value={data.overview.allocated} />
        <Stat label="Live Projects" value={data.overview.liveProjects} />
        <Stat label="Completed" value={data.overview.completedProjects} />
      </div>
    </div>
  );
}

function ProjectsModule({
  projects,
  selectedProjectId,
  onSelect,
}: {
  projects: AdminProject[];
  selectedProjectId: string;
  onSelect: (projectId: string) => void;
}) {
  return (
    <Panel>
      <Header title="Projects Module" text="New corporate projects appear here with pending NGO recommendation status." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {["Project", "Corporate", "Sector", "Budget", "Timeline", "Location", "Status", "Created"].map((head) => (
                <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500" key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr className={`border-b border-slate-100 ${project.id === selectedProjectId ? "bg-blue-50/50" : ""}`} key={project.id}>
                <td className="px-3 py-3">
                  <button className="font-bold text-blue-700 hover:underline" onClick={() => onSelect(project.id)} type="button">
                    {project.title}
                  </button>
                  <p className="mt-1 max-w-sm truncate text-xs text-slate-500">{project.description || "No description provided"}</p>
                </td>
                <td className="px-3 py-3">{project.corporates?.company_name ?? "Corporate"}</td>
                <td className="px-3 py-3">{project.focus_area}</td>
                <td className="px-3 py-3 font-semibold">{formatINR(project.budget)}</td>
                <td className="px-3 py-3">{project.duration_months ? `${project.duration_months} months` : "Not set"}</td>
                <td className="px-3 py-3">{[project.district, project.state].filter(Boolean).join(", ") || "Pan India"}</td>
                <td className="px-3 py-3"><StatusPill status={project.admin_status ?? "pending_recommendation"} /></td>
                <td className="px-3 py-3">{formatDate(project.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ResearchQueue({
  projects,
  selectedProject,
  scores,
  selectedNgoIds,
  search,
  isRefreshing,
  isSending,
  onProjectChange,
  onSearch,
  onRefreshScores,
  onSend,
  onToggleNgo,
}: {
  projects: AdminProject[];
  selectedProject?: AdminProject;
  scores: TrustScoreRow[];
  selectedNgoIds: string[];
  search: string;
  isRefreshing: boolean;
  isSending: boolean;
  onProjectChange: (projectId: string) => void;
  onSearch: (value: string) => void;
  onRefreshScores: (projectId: string) => void;
  onSend: () => void;
  onToggleNgo: (ngoId: string) => void;
}) {
  if (!selectedProject) {
    return <Panel>No projects available.</Panel>;
  }

  return (
    <div className="space-y-5">
      <Panel>
        <Header title="Research Queue" text="Calculate dynamic trust scores per project and shortlist up to 10 NGOs for corporate review." />
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <select
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
            onChange={(event) => onProjectChange(event.target.value)}
            value={selectedProject.id}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            disabled={isRefreshing}
            onClick={() => onRefreshScores(selectedProject.id)}
            type="button"
          >
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Recalculate Scores
          </button>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedNgoIds.length || selectedNgoIds.length > 10 || isSending}
            onClick={onSend}
            type="button"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send {selectedNgoIds.length || ""} Recommendations
          </button>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-950">{selectedProject.title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {selectedProject.focus_area} · {formatINR(selectedProject.budget)} · {[selectedProject.district, selectedProject.state].filter(Boolean).join(", ") || "Pan India"}
            </p>
          </div>
          <label className="relative block md:w-80">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400"
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search NGOs, strengths, notes"
              value={search}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3">
          {scores.map((score) => (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={score.id}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      checked={selectedNgoIds.includes(score.ngo_id)}
                      className="h-4 w-4 rounded border-slate-300"
                      onChange={() => onToggleNgo(score.ngo_id)}
                      type="checkbox"
                    />
                    <span className="rounded-full bg-slate-950 px-2 py-0.5 text-xs font-bold text-white">#{score.rank}</span>
                    <h4 className="text-base font-bold text-slate-950">{score.ngos?.ngo_name ?? "NGO Partner"}</h4>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {score.ngos?.access_status ?? "verified"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{score.why_recommended}</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    <Mini label="Previous Projects" value={score.past_similar_projects || "No project count available"} />
                    <Mini label="Financials" value={score.budget_experience || "Review required"} />
                    <Mini label="Compliance" value={score.compliance_status || "Review required"} />
                  </div>
                </div>
                <div className="shrink-0 rounded-xl border border-blue-100 bg-white p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall</p>
                  <p className="mt-1 text-3xl font-black text-blue-700">{score.overall_score}</p>
                  <p className="text-xs text-slate-400">project score</p>
                </div>
              </div>
            </div>
          ))}
          {!scores.length ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No scores available yet. Recalculate scores for this project.
            </div>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

function EntityTable({ title, rows, primary }: { title: string; rows: Array<Record<string, unknown>>; primary: string }) {
  return (
    <Panel>
      <Header title={title} text="Profile, compliance, financial, project, and performance records from the existing platform data." />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={String(row.id)}>
            <h3 className="font-bold text-slate-950">{String(row[primary] ?? "Record")}</h3>
            <p className="mt-1 text-sm text-slate-500">{String(row.company_email ?? row.ngo_email ?? row.access_status ?? "")}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Mini label="Status" value={String(row.access_status ?? "active")} />
              <Mini label="Trust Score" value={String(row.trust_score ?? "N/A")} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function GenericRows({ title, rows }: { title: string; rows: Array<Record<string, unknown>> }) {
  return (
    <Panel>
      <Header title={title} text="Complete historical records for lifecycle tracking and review." />
      <div className="grid gap-3">
        {rows.map((row, index) => (
          <pre className="overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100" key={String(row.id ?? index)}>
            {JSON.stringify(row, null, 2)}
          </pre>
        ))}
        {!rows.length ? <p className="text-sm text-slate-500">No records yet.</p> : null}
      </div>
    </Panel>
  );
}

function Notifications({ projects }: { projects: AdminProject[] }) {
  const pending = projects.filter((project) => (project.admin_status ?? "pending_recommendation") === "pending_recommendation");
  return (
    <Panel>
      <Header title="Notifications" text="Operational alerts generated from lifecycle status." />
      <div className="grid gap-3">
        {pending.map((project) => (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" key={project.id}>
            <strong>{project.title}</strong> is waiting for NGO recommendations.
          </div>
        ))}
        {!pending.length ? <p className="text-sm text-slate-500">No pending recommendation alerts.</p> : null}
      </div>
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">{children}</section>;
}

function Header({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-lg font-black tracking-tight text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{text}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Panel>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </Panel>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function Banner({ tone, text }: { tone: "error" | "success"; text: string }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      {text}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function formatINR(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "Rs 0";
  if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `Rs ${(value / 100000).toFixed(1)}L`;
  return `Rs ${value.toLocaleString("en-IN")}`;
}
