"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, TrendingUp, AlertTriangle as AlertIcon, DollarSign, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface RevenueInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string | null;
  contact_id: string | null;
  priority: string;
  is_resolved: boolean;
  created_at: string;
}

const insightTypeIcons: Record<string, typeof TrendingUp> = {
  at_risk_deal: AlertIcon,
  upsell_opportunity: TrendingUp,
  stalled_lead: AlertIcon,
  conversion_opportunity: Target,
  revenue_forecast: DollarSign,
};

const insightTypeLabels: Record<string, string> = {
  at_risk_deal: 'At Risk Deal',
  upsell_opportunity: 'Upsell Opportunity',
  stalled_lead: 'Stalled Lead',
  conversion_opportunity: 'Conversion Opportunity',
  revenue_forecast: 'Revenue Forecast',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-500/10 text-slate-400',
  medium: 'bg-blue-500/10 text-blue-300',
  high: 'bg-orange-500/10 text-orange-300',
  critical: 'bg-red-500/10 text-red-300',
};

export default function RevenueInsightsPage() {
  const { profileLoading } = useAuth();
  const [insights, setInsights] = useState<RevenueInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('all');

  useEffect(() => {
    loadInsights();
  }, [filter]);

  async function loadInsights() {
    setLoading(true);
    try {
      const url = filter === 'unresolved'
        ? '/api/brain/revenue-insights?unresolved=true'
        : '/api/brain/revenue-insights';
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error);
      setInsights(Array.isArray(data.insights) ? data.insights : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function resolveInsight(insight: RevenueInsight) {
    try {
      const response = await fetch('/api/brain/revenue-insights', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: insight.id, is_resolved: true }),
      });
      if (!response.ok) throw new Error('Failed to resolve');
      await loadInsights();
    } catch (err) {
      console.error(err);
    }
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const byType = insights.reduce((acc, i) => {
    acc[i.insight_type] = (acc[i.insight_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">Revenue Intelligence</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              AI-powered revenue insights.
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={loadInsights}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Automated insights that surface at-risk deals, upsell opportunities, and conversion leads.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(insightTypeLabels).map(([type, label]) => {
          const Icon = insightTypeIcons[type]
          return (
            <div key={type} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {Icon ? <Icon className="h-5 w-5" /> : null}
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">{byType[type] || 0}</p>
                  <p className="text-sm text-slate-400">{label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium transition ${filter === 'all' ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
        >
          All Insights ({insights.length})
        </button>
        <button
          onClick={() => setFilter('unresolved')}
          className={`px-4 py-2 text-sm font-medium transition ${filter === 'unresolved' ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
        >
          Unresolved ({insights.filter(i => !i.is_resolved).length})
        </button>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading insights...</p>
          ) : insights.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-300" />
              <p>No insights found. AI will generate insights as conversations happen.</p>
            </div>
          ) : (
            insights.map((insight) => {
              const Icon = insightTypeIcons[insight.insight_type] || AlertIcon;
              return (
                <div key={insight.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-primary-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${priorityColors[insight.priority]}`}>
                            {insight.priority}
                          </span>
                          <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] uppercase tracking-wider text-slate-400">
                            {insightTypeLabels[insight.insight_type] || insight.insight_type}
                          </span>
                        </div>
                        {insight.description && (
                          <p className="mt-2 text-sm text-slate-400">{insight.description}</p>
                        )}
                        <p className="mt-2 text-xs text-slate-500">
                          {new Date(insight.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!insight.is_resolved && (
                      <Button variant="secondary" size="sm" onClick={() => resolveInsight(insight)}>
                        <CheckCircle className="h-4 w-4" /> Mark resolved
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}