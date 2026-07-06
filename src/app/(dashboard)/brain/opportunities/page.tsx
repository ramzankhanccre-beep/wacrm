"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface DiscoveredOpportunity {
  id: string;
  opportunity_type: string;
  title: string;
  description: string | null;
  contact_id: string | null;
  estimated_value: number | null;
  probability: number;
  status: string;
  created_at: string;
}

const opportunityTypeLabels: Record<string, string> = {
  new_lead: 'New Lead',
  upsell: 'Upsell',
  cross_sell: 'Cross-sell',
  renewal: 'Renewal',
  referral: 'Referral',
  event_interest: 'Event Interest',
};

const statusLabels: Record<string, string> = {
  discovered: 'Discovered',
  qualified: 'Qualified',
  pursuing: 'Pursuing',
  converted: 'Converted',
  lost: 'Lost',
};

const statusColors: Record<string, string> = {
  discovered: 'bg-blue-500/10 text-blue-300',
  qualified: 'bg-purple-500/10 text-purple-300',
  pursuing: 'bg-amber-500/10 text-amber-300',
  converted: 'bg-emerald-500/10 text-emerald-300',
  lost: 'bg-slate-500/10 text-slate-400',
};

export default function OpportunitiesPage() {
  const { profileLoading } = useAuth();
  const [opportunities, setOpportunities] = useState<DiscoveredOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadOpportunities();
  }, [filter]);

  async function loadOpportunities() {
    setLoading(true);
    try {
      const url = filter === 'all'
        ? '/api/brain/opportunities'
        : `/api/brain/opportunities?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error);
      setOpportunities(Array.isArray(data.opportunities) ? data.opportunities : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(opp: DiscoveredOpportunity, newStatus: string) {
    try {
      const response = await fetch('/api/brain/opportunities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: opp.id, status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update');
      await loadOpportunities();
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

  const totalValue = opportunities
    .filter(o => o.status !== 'lost' && o.estimated_value)
    .reduce((sum, o) => sum + (o.estimated_value || 0) * o.probability, 0);

  const byType = opportunities.reduce((acc, o) => {
    acc[o.opportunity_type] = (acc[o.opportunity_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">Opportunity Discovery</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              AI-detected sales opportunities.
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={loadOpportunities}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Automatically detected opportunities from conversations. Track, qualify, and pursue leads.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pipeline value</p>
          <p className="mt-3 text-3xl font-semibold text-white">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="mt-2 text-sm text-slate-400">Probability-weighted</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total opportunities</p>
          <p className="mt-3 text-3xl font-semibold text-white">{opportunities.length}</p>
          <p className="mt-2 text-sm text-slate-400">Across all types</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">By type</p>
          <div className="mt-3 space-y-1">
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-slate-400">{opportunityTypeLabels[type] || type}</span>
                <span className="text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-800">
        {['all', 'discovered', 'qualified', 'pursuing', 'converted', 'lost'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium transition ${filter === status ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
          >
            {status === 'all' ? 'All' : statusLabels[status]} ({status === 'all' ? opportunities.length : opportunities.filter(o => o.status === status).length})
          </button>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading opportunities...</p>
          ) : opportunities.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <Target className="mx-auto mb-4 h-10 w-10 text-primary-300" />
              <p>No opportunities found. AI will detect opportunities as conversations happen.</p>
            </div>
          ) : (
            opportunities.map((opp) => (
              <div key={opp.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{opp.title}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${statusColors[opp.status]}`}>
                          {statusLabels[opp.status]}
                        </span>
                        <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] uppercase tracking-wider text-slate-400">
                          {opportunityTypeLabels[opp.opportunity_type] || opp.opportunity_type}
                        </span>
                      </div>
                      {opp.description && (
                        <p className="mt-2 text-sm text-slate-400">{opp.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                        {opp.estimated_value && (
                          <span>Value: ${opp.estimated_value.toLocaleString()}</span>
                        )}
                        <span>Probability: {Math.round(opp.probability * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {opp.status === 'discovered' && (
                      <Button variant="secondary" size="sm" onClick={() => updateStatus(opp, 'qualified')}>
                        Qualify <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                    {opp.status === 'qualified' && (
                      <Button variant="secondary" size="sm" onClick={() => updateStatus(opp, 'pursuing')}>
                        Pursue <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                    {opp.status === 'pursuing' && (
                      <Button variant="secondary" size="sm" onClick={() => updateStatus(opp, 'converted')}>
                        <CheckCircle className="h-4 w-4" /> Converted
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