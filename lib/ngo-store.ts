/**
 * Lightweight NGO shared state store.
 * Used to sync compliance docs, milestones, profile edits etc.
 * across Super Admin + all role dashboards within the same session.
 *
 * In production this would be backed by Supabase Realtime subscriptions.
 * For now it uses localStorage events so multiple tabs stay in sync.
 */

export type DocStatus = "missing" | "uploaded" | "verified";

export interface NgoSharedState {
  docs:       Record<string, DocStatus>;   // docId → status
  milestones: Record<number, string>;      // milestoneId → status
  tranches:   Record<string, string>;      // trancheId → status
  proposals:  string[][];                  // proposal rows
  ngoName:    string;
  ngoEmail:   string;
  trustScore: number;
}

const STORAGE_KEY = "ngo_shared_state";

function defaultState(ngoName: string, ngoEmail: string, trustScore: number): NgoSharedState {
  return {
    docs: {
      certificate12a:  "verified",
      certificate80g:  "verified",
      csr1Certificate: "missing",
      fcraCertificate: "missing",
      annualReport:    "missing",
      auditReport:     "missing",
    },
    milestones: { 1: "done", 2: "done", 3: "in-progress", 4: "pending", 5: "pending", 6: "pending" },
    tranches: {
      T1: "unlocked",
      T2: "release_requested",
      T3: "locked",
      T4: "locked",
    },
    proposals: [
      ["prop-1", "Rural Education Mission", "Demo Corporation", "₹25,00,000", "Approved", "18 May 2026"],
    ],
    ngoName,
    ngoEmail,
    trustScore,
  };
}

export function loadState(ngoId: string, ngoName: string, ngoEmail: string, trustScore: number): NgoSharedState {
  if (typeof window === "undefined") return defaultState(ngoName, ngoEmail, trustScore);
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${ngoId}`);
    if (raw) return JSON.parse(raw) as NgoSharedState;
  } catch { /* ignore */ }
  return defaultState(ngoName, ngoEmail, trustScore);
}

export function saveState(ngoId: string, state: NgoSharedState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_KEY}_${ngoId}`, JSON.stringify(state));
  // Notify other tabs
  window.dispatchEvent(new StorageEvent("storage", {
    key: `${STORAGE_KEY}_${ngoId}`,
    newValue: JSON.stringify(state),
  }));
}

/** Compute trust score from uploaded docs */
export function computeTrustScore(docs: Record<string, DocStatus>): number {
  const weights: Record<string, number> = {
    certificate12a:  20,
    certificate80g:  20,
    fcraCertificate: 15,
    csr1Certificate: 10,
    annualReport:    10,
    auditReport:     10,
  };
  let score = 15; // base score
  for (const [docId, status] of Object.entries(docs)) {
    if (status === "uploaded" || status === "verified") {
      score += weights[docId] ?? 0;
    }
  }
  return Math.min(score, 100);
}
