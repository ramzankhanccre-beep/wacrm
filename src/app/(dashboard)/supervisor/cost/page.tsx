"use client";

import { useEffect, useState } from 'react';
import { DollarSign, RefreshCw, TrendingDown, TrendingUp, Wallet, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface Agent {
  id: string;
  name: string;
}

interface CostLog {
  id: string;
  agent_id: string;
  conversation_id: string | null;
  model_provider: string;
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  total_cost_usd: number;
  created_at: string;
  agent?: { name: string };
}

interface CostSummary {
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  byAgent: Record<string, { inputTokens: number; outputTokens: number; cost: number }>;
  logCount: number;
}

export default function CostTrackingPage() {
  const { profileLoading } = useAuth();
  const [logs, setLogs] = useState<CostLog[]>([]);
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadData();
  }, [selectedAgentId, timeRange]);

  async function loadData() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ summary: 'true' });
      if (selectedAgentId) params.set('agentId', selectedAgentId);

      const endDate = new Date();
      const startDate = new Date();
      if (timeRange === '7d') startDate.setDate(startDate.getDate() - 7);
      else if (timeRange === '30d') startDate.setDate(startDate.getDate() - 30);
      else startDate.setDate(startDate.getDate() - 90);

      params.set('startDate', startDate.toISOString());
      params.set('endDate', endDate.toISOString());

      const [costRes, agentsRes] = await Promise.all([
        fetch(`/api/supervisor/cost?${params}`),
        fetch('/api/agents'),
      ]);

      const costData = await costRes.json();
      const agentsData = await agentsRes.json();

      setSummary(costData.summary || null);
      setLogs(costData.logs || []);
      setAgents(Array.isArray(agentsData.agents) ? agentsData.agents : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    if (cost < 1) return `$${cost.toFixed(2)}`;
    return `$${cost.toFixed(2)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">AI Supervisor</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Cost Optimisation
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={loadData}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Monitor token usage per agent, track spending, and get recommendations to reduce costs.
        </p>
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
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium transition ${timeRange === range ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Spend</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {formatCost(summary?.totalCost || 0)}
          </p>
          <p className="mt-2 text-sm text-slate-400">Last {timeRange}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Input Tokens</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {formatTokens(summary?.totalInputTokens || 0)}
          </p>
          <p className="mt-2 text-sm text-slate-400">Total used</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Output Tokens</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {formatTokens(summary?.totalOutputTokens || 0)}
          </p>
          <p className="mt-2 text-sm text-slate-400">Total generated</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">API Calls</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {summary?.logCount || 0}
          </p>
          <p className="mt-2 text-sm text-slate-400">Total requests</p>
        </div>
      </div>

      {summary?.byAgent && Object.keys(summary.byAgent).length > 0 && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
          <div className="flex items-center gap-3 text-white mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Cost by Agent</h2>
              <p className="text-sm text-slate-400">Breakdown of spending per agent</p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(summary.byAgent).map(([agentName, data]) => (
              <div key={agentName} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{agentName}</h3>
                    <p className="text-sm text-slate-400">
                      {formatTokens(data.inputTokens)} in / {formatTokens(data.outputTokens)} out
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-semibold ${data.cost > 50 ? 'text-red-400' : 'text-white'}`}>
                      {formatCost(data.cost)}
                    </p>
                    <p className="text-xs text-slate-500">Total spend</p>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min((data.cost / (summary.totalCost || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading cost logs...</p>
          ) : logs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <Wallet className="mx-auto mb-4 h-10 w-10 text-primary-300" />
              <p>No cost data yet. Costs are logged as agents process conversations.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-sm text-slate-400">
                    <th className="pb-3 pr-4">Agent</th>
                    <th className="pb-3 pr-4">Model</th>
                    <th className="pb-3 pr-4 text-right">Input</th>
                    <th className="pb-3 pr-4 text-right">Output</th>
                    <th className="pb-3 pr-4 text-right">Cost</th>
                    <th className="pb-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 20).map((log) => (
                    <tr key={log.id} className="border-b border-slate-800/50 text-sm">
                      <td className="py-3 pr-4 text-white">{log.agent?.name || 'Unknown'}</td>
                      <td className="py-3 pr-4 text-slate-400">{log.model_name}</td>
                      <td className="py-3 pr-4 text-right text-slate-300">{formatTokens(log.input_tokens)}</td>
                      <td className="py-3 pr-4 text-right text-slate-300">{formatTokens(log.output_tokens)}</td>
                      <td className="py-3 pr-4 text-right text-white">{formatCost(log.total_cost_usd)}</td>
                      <td className="py-3 text-right text-slate-500">{new Date(log.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}