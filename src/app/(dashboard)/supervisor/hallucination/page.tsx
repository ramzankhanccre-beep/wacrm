"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Eye, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface HallucinationScore {
  id: string;
  agent_id: string;
  conversation_id: string | null;
  hallucination_score: number;
  grounding_sources: string[];
  is_blocked: boolean;
  review_status: string;
  created_at: string;
  agent?: { name: string };
}

interface Agent {
  id: string;
  name: string;
}

export default function HallucinationDetectionPage() {
  const { profileLoading } = useAuth();
  const [scores, setScores] = useState<HallucinationScore[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlocked, setShowBlocked] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [showBlocked, selectedAgentId]);

  async function loadData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showBlocked) params.set('blocked', 'true');
      if (selectedAgentId) params.set('agentId', selectedAgentId);

      const [scoresRes, agentsRes] = await Promise.all([
        fetch(`/api/supervisor/hallucination?${params}`),
        fetch('/api/agents'),
      ]);

      const scoresData = await scoresRes.json();
      const agentsData = await agentsRes.json();

      setScores(Array.isArray(scoresData.scores) ? scoresData.scores : []);
      setAgents(Array.isArray(agentsData.agents) ? agentsData.agents : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleBlock(score: HallucinationScore) {
    try {
      const response = await fetch('/api/supervisor/hallucination', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: score.id,
          is_blocked: !score.is_blocked,
        }),
      });
      if (!response.ok) throw new Error('Failed to update');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 0.8) return 'text-red-400'; // High hallucination
    if (score >= 0.5) return 'text-yellow-400';
    return 'text-emerald-400'; // Low hallucination
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const blockedCount = scores.filter(s => s.is_blocked).length;
  const highRiskCount = scores.filter(s => s.hallucination_score >= 0.7).length;
  const avgScore = scores.length > 0
    ? scores.reduce((sum, s) => sum + (s.hallucination_score || 0), 0) / scores.length
    : 0;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">AI Supervisor</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Hallucination Detection
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={loadData}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Detect and block responses that cannot be grounded in memory or knowledge base. Configure risk thresholds.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Avg Score</p>
          <p className={`mt-3 text-3xl font-semibold ${getScoreColor(avgScore)}`}>
            {(avgScore * 100).toFixed(0)}%
          </p>
          <p className="mt-2 text-sm text-slate-400">Risk level</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Scans</p>
          <p className="mt-3 text-3xl font-semibold text-white">{scores.length}</p>
          <p className="mt-2 text-sm text-slate-400">Responses checked</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">High Risk</p>
          <p className="mt-3 text-3xl font-semibold text-red-400">{highRiskCount}</p>
          <p className="mt-2 text-sm text-slate-400">Score ≥ 70%</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Blocked</p>
          <p className="mt-3 text-3xl font-semibold text-yellow-400">{blockedCount}</p>
          <p className="mt-2 text-sm text-slate-400">Held for review</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-white"
        >
          <option value="">All Agents</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>

        <div className="flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setShowBlocked(false)}
            className={`px-4 py-2 text-sm font-medium transition ${!showBlocked ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
          >
            All ({scores.length})
          </button>
          <button
            onClick={() => setShowBlocked(true)}
            className={`px-4 py-2 text-sm font-medium transition ${showBlocked ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
          >
            Blocked ({blockedCount})
          </button>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="flex items-center gap-3 text-white mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Hallucination Scores</h2>
            <p className="text-sm text-slate-400">Responses scanned for factual grounding</p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : scores.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <Eye className="mx-auto mb-4 h-10 w-10 text-primary-300" />
              <p>No hallucination scores yet. Responses are scanned as agents process conversations.</p>
            </div>
          ) : (
            scores.map((score) => (
              <div key={score.id} className={`rounded-3xl border ${score.is_blocked ? 'border-red-800 bg-red-900/10' : 'border-slate-800 bg-slate-900/80'} p-5`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${score.is_blocked ? 'bg-red-500/10 text-red-300' : 'bg-slate-800 text-primary-300'}`}>
                      <Eye className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {score.agent?.name || 'Unknown Agent'}
                        </h3>
                        {score.is_blocked && (
                          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold uppercase text-red-300">
                            Blocked
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        Hallucination Score: <span className={getScoreColor(score.hallucination_score)}>{(score.hallucination_score * 100).toFixed(0)}%</span>
                      </p>
                      {score.grounding_sources && score.grounding_sources.length > 0 && (
                        <p className="mt-1 text-xs text-slate-500">
                          Sources: {score.grounding_sources.length} grounding sources found
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(score.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {score.is_blocked ? (
                      <Button variant="secondary" size="sm" onClick={() => toggleBlock(score)}>
                        <CheckCircle className="h-4 w-4" /> Unblock
                      </Button>
                    ) : (
                      <Button variant="destructive" size="sm" onClick={() => toggleBlock(score)}>
                        <XCircle className="h-4 w-4" /> Block
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}