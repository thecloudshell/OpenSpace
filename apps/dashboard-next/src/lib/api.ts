// Typed client for the OpenSpace dashboard API (openspace/entrypoints/dashboard/server.py).
// All requests go through the Next.js rewrite proxy at /api/v1/* so the browser
// never needs cross-origin access; rewrites target API_INTERNAL_URL at runtime.

const API_PREFIX = '/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API ${path} failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

export interface HealthPayload {
  status: string
  project_root: string
  db_path: string
  evidence_db_path: string
  db_exists: boolean
  evidence_db_exists: boolean
  frontend_dist_exists: boolean
  workflow_roots: string[]
  workflow_count: number
}

export interface SkillStats {
  total_skills: number
  total_skills_all: number
  by_category: Record<string, number>
  by_origin: Record<string, number>
  total_analyses: number
  evolution_candidates: number
  total_selections: number
  total_applied: number
  total_completions: number
  total_fallbacks: number
  average_score: number
  skills_with_activity: number
  skills_with_recent_analysis: number
}

export interface SkillLineageMeta {
  origin: string
  generation: number
  parent_skill_ids: string[]
  change_summary: string
  created_at: string
  created_by: string
}

export interface Skill {
  skill_id: string
  name: string
  description: string
  path: string
  skill_dir: string
  is_active: boolean
  enabled?: boolean
  category: string
  tags: string[]
  visibility: string
  creator_id: string
  lineage: SkillLineageMeta
  origin: string
  generation: number
  parent_skill_ids: string[]
  total_selections: number
  total_applied: number
  total_completions: number
  total_fallbacks: number
  applied_rate: number
  completion_rate: number
  effective_rate: number
  fallback_rate: number
  score: number
  first_seen: string
  last_updated: string
}

export interface WorkflowSummary {
  id: string
  task_id: string
  task_name: string
  instruction: string
  status: string
  iterations: number
  execution_time: number
  start_time: string | null
  end_time: string | null
  total_steps: number
  success_count: number
  success_rate: number
  agent_action_count: number
  selected_skills: string[]
}

export interface OverviewResponse {
  health: {
    status: string
    db_path: string
    evidence_db_path: string
    workflow_count: number
    frontend_dist_exists: boolean
  }
  skills: {
    summary: SkillStats
    average_score: number
    top: Skill[]
    recent: Skill[]
  }
  workflows: {
    total: number
    average_success_rate: number
    recent: WorkflowSummary[]
  }
}

export interface LineageNode {
  skill_id: string
  name: string
  description: string
  origin: string
  generation: number
  created_at: string
  visibility: string
  is_active: boolean
  tags: string[]
  score: number
  effective_rate: number
  total_selections: number
}

export interface SkillLineage {
  skill_id: string
  nodes: LineageNode[]
  edges: Array<{ source: string; target: string }>
  total_nodes: number
}

export interface EvolutionJob {
  job_id: string
  trigger_type: string
  status: string
  reason: string
  created_at: string
  completed_at?: string | null
  error?: string | null
  candidate_ids: string[]
}

export const api = {
  health: () => request<HealthPayload>('/health'),
  overview: () => request<OverviewResponse>('/overview'),
  skills: (params?: { activeOnly?: boolean; sort?: string; limit?: number; query?: string }) => {
    const search = new URLSearchParams();
    search.set('active_only', String(params?.activeOnly ?? false));
    search.set('sort', params?.sort ?? 'score');
    search.set('limit', String(params?.limit ?? 500));
    if (params?.query) {
      search.set('query', params.query);
    }
    return request<{ items: Skill[]; count: number }>(`/skills?${search.toString()}`);
  },
  skillStats: () => request<SkillStats>('/skills/stats'),
  skillLineage: (skillId: string) => request<SkillLineage>(`/skills/${encodeURIComponent(skillId)}/lineage`),
  workflows: () => request<{ items: WorkflowSummary[] }>('/workflows'),
  evolutionJobs: () => request<{ items: EvolutionJob[] }>('/evolution/jobs?limit=50'),
};
