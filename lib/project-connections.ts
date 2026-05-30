export type ProjectConnectionStatus = "proposal" | "active" | "completed";

export type ProjectConnection = {
  id: string;
  corporate_id: string;
  ngo_id: string;
  project_name: string;
  focus_area: string;
  budget: string;
  status: ProjectConnectionStatus;
  progress: number;
  milestone: string;
  document_requests: string[];
  latest_update: string;
  corporate_name: string;
  ngo_name: string;
  created_at: string;
};

export type NgoCandidate = {
  id: string;
  name: string;
  focusArea: string;
  state: string;
  trustScore: number;
  status: string;
  activeProjects: number;
  rating: string;
};

export const defaultNgoCandidates: NgoCandidate[] = [
  {
    id: "demo-asha-foundation",
    name: "Asha Foundation",
    focusArea: "Women Empowerment",
    state: "Karnataka",
    trustScore: 88,
    status: "Verified",
    activeProjects: 6,
    rating: "4.7",
  },
  {
    id: "demo-xyz-ngo",
    name: "XYZ NGO",
    focusArea: "Education",
    state: "Maharashtra",
    trustScore: 84,
    status: "Verified",
    activeProjects: 8,
    rating: "4.5",
  },
  {
    id: "demo-jal-seva-trust",
    name: "Jal Seva Trust",
    focusArea: "Water Conservation",
    state: "Uttar Pradesh",
    trustScore: 64,
    status: "Under Review",
    activeProjects: 3,
    rating: "3.8",
  },
  {
    id: "demo-carebridge",
    name: "CareBridge",
    focusArea: "Healthcare",
    state: "Delhi",
    trustScore: 91,
    status: "Verified",
    activeProjects: 5,
    rating: "4.8",
  },
  {
    id: "demo-green-earth-foundation",
    name: "Green Earth Foundation",
    focusArea: "Education",
    state: "Maharashtra",
    trustScore: 78,
    status: "Verified",
    activeProjects: 0,
    rating: "4.6",
  },
];

export function projectNameForFocus(focusArea: string) {
  const area = focusArea.toLowerCase();
  if (area.includes("women")) return "Women Skill Labs";
  if (area.includes("water")) return "Water Access Program";
  if (area.includes("health")) return "Urban Health Camps";
  if (area.includes("climate")) return "Climate Schools";
  return "Rural Education Mission";
}

export function mapConnectionRow(
  row: Record<string, unknown>,
  corporateName = "Corporate Partner",
  ngoName = "NGO Partner",
): ProjectConnection {
  return {
    id: String(row.id),
    corporate_id: String(row.corporate_id),
    ngo_id: String(row.ngo_id),
    project_name: String(row.project_name ?? "CSR Project"),
    focus_area: String(row.focus_area ?? "Education"),
    budget: String(row.budget ?? "Rs 25L"),
    status: (row.status as ProjectConnectionStatus) ?? "active",
    progress: Number(row.progress ?? 18),
    milestone: String(row.milestone ?? "Kickoff and baseline"),
    document_requests: Array.isArray(row.document_requests)
      ? row.document_requests.map(String)
      : [],
    latest_update: String(row.latest_update ?? "Project workspace established."),
    corporate_name: corporateName,
    ngo_name: ngoName,
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}
