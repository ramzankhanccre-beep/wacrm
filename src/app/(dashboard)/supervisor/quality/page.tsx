"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, Star, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface QualityLog {
  id: string;
  agent_id: string;
  conversation_id: string | null;
  quality_score: number;
  criteria_scores: Record<string, number>;
  review_status: string;
  review_notes: string | null;
  coaching_notes: string | null;
  created_at: string;
  agent?: { name: string };
  conversation?: { id: string };
}

interface Agent {
  id: string;
  name: string;
}

export default function QualityMonitoringPage() {
  const { profileLoading } = useAuth();
  const [logs, setLogs] = useState<QualityLog[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('all');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [filter, selectedAgentId]);

  async function loadData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'unresolved') params.set('unresolved', 'true');
      if (selectedAgentId) params.set('agentId', selectedAgentId);

      const [logsRes, agentsRes] = await Promise.all([
        fetch(`/api/supervisor/quality?${params}`),
        fetch('/api/agents'),
      ]);

      const logsData = await logsRes.json();
      const agentsData = await agentsRes.json();

      setLogs(Array.isArray(logsData.logs) ? logsData.logs : []);
      setAgents(Array.isArray(agentsData.agents) ? agentsData.agents : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function reviewLog(log: QualityLog, status: 'reviewed' | 'flagged', notes?: string) {
    try {
      const response = await fetch('/api/supervisor/quality', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: log.id,
          review_status: status,
          review_notes: notes,
        }),
      });
      if (!response.ok) throw new Error('Failed to update');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 0.8) return 'text-emerald-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  }

  function getStatusBadge(status: string): string {
    switch (status) {
      case 'reviewed':
        return 'bg-emerald-500/10 text-emerald-300';
      case 'flagged':
        return 'bg-red-500/10 text-red-300';
      default:
        return 'bg-yellow-500/10 text-yellow-300';
    }
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const averageScore = logs.length > 0
    ? logs.reduce((sum, log) => sum + (log.quality_score || 0), 0) / logs.length
    : 0;

  const pendingCount = logs.filter(l => l.review_status === 'pending').length;
  const flaggedCount = logs.filter(l => l.review_status === 'flagged').length;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">AI Supervisor</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Quality Monitoring
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={loadData}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Track and review AI agent response quality. Rate conversations and add coaching notes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Average Score</p>
          <p className={`mt-3 text-3xl font-semibold ${getScoreColor(averageScore)}`}>
            {averageScore > 0 ? (averageScore * 100).toFixed(0) : 0}%
          </p>
          <p className="mt-2 text-sm text-slate-400">All agents</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Reviews</p>
          <p className="mt-3 text-3xl font-semibold text-white">{logs.length}</p>
          <p className="mt-2 text-sm text-slate-400">Across all agents</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pending</p>
          <p className="mt-3 text-3xl font-semibold text-yellow-400">{pendingCount}</p>
          <p className="mt-2 text-sm text-slate-400">Awaiting review</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Flagged</p>
          <p className="mt-3 text-3xl font-semibold text-red-400">{flaggedCount}</p>
          <p className="mt-2 text-sm text-slate-400">Needs attention</p>
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
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium transition ${filter === 'all' ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-4 py-2 text-sm font-medium transition ${filter === 'unresolved' ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading quality logs...</p>
          ) : logs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-300" />
              <p>No quality logs yet. Quality scores are generated as agents process conversations.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-primary-300">
                      <Star className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {log.agent?.name ?? 'Unknown Agent'}
                        </h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusBadge(log.review_status)}`}>
                          {log.review_status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        Score: <span className={getScoreColor(log.quality_score)}>{(log.quality_score * 100).toFixed(0)}%</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      {log.coaching_notes && (
                        <p className="mt-2 text-sm text-primary-300">📝 {log.coaching_notes}</p>
                      )}
                    </div>
                  </div>
                  {log.review_status === 'pending' && (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => reviewLog(log, 'reviewed')}>
                        <CheckCircle className="h-4 w-4" /> Approve
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => reviewLog(log, 'flagged')}>
                        <AlertTriangle className="h-4 w-4" /> Flag
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}