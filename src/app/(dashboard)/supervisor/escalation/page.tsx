"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, AlertOctagon, CirclePlus, Save, Trash2, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface EscalationPolicy {
  id: string;
  name: string;
  description: string | null;
  priority: number;
  trigger_conditions: Record<string, unknown>;
  escalation_target_type: string;
  is_active: boolean;
  auto_escalate: boolean;
  escalation_delay_seconds: number;
  created_at: string;
}

interface EscalationEvent {
  id: string;
  policy_id: string;
  conversation_id: string;
  trigger_reason: string | null;
  status: string;
  acknowledged_by: string | null;
  created_at: string;
  policy?: { name: string };
  conversation?: { id: string };
}

export default function EscalationControlPage() {
  const { profileLoading } = useAuth();
  const [policies, setPolicies] = useState<EscalationPolicy[]>([]);
  const [events, setEvents] = useState<EscalationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEvents, setShowEvents] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    priority: 0,
    trigger_conditions: {} as Record<string, unknown>,
    escalation_target_type: 'user',
    escalation_target_id: '',
    auto_escalate: true,
    escalation_delay_seconds: 300,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [showEvents]);

  async function loadData() {
    setLoading(true);
    try {
      const params = showEvents ? 'events=true&pending=true' : '';
      const response = await fetch(`/api/supervisor/escalation${params ? '?' + params : ''}`);
      const data = await response.json();

      if (showEvents) {
        setEvents(Array.isArray(data.events) ? data.events : []);
      } else {
        setPolicies(Array.isArray(data.policies) ? data.policies : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/supervisor/escalation?createPolicy=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Failed to save');
      setMessage('Policy created successfully');
      setShowForm(false);
      setFormState({
        name: '',
        description: '',
        priority: 0,
        trigger_conditions: {},
        escalation_target_type: 'user',
        escalation_target_id: '',
        auto_escalate: true,
        escalation_delay_seconds: 300,
        is_active: true,
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function deletePolicy(policy: EscalationPolicy) {
    if (!confirm(`Delete policy "${policy.name}"?`)) return;
    try {
      const response = await fetch(`/api/supervisor/escalation?policyId=${policy.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function acknowledgeEvent(event: EscalationEvent) {
    try {
      const response = await fetch('/api/supervisor/escalation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id, status: 'acknowledged' }),
      });
      if (!response.ok) throw new Error('Failed to acknowledge');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function resolveEvent(event: EscalationEvent) {
    try {
      const response = await fetch('/api/supervisor/escalation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id, status: 'resolved' }),
      });
      if (!response.ok) throw new Error('Failed to resolve');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  function getStatusBadge(status: string): string {
    switch (status) {
      case 'resolved': return 'bg-emerald-500/10 text-emerald-300';
      case 'acknowledged': return 'bg-blue-500/10 text-blue-300';
      case 'notified': return 'bg-yellow-500/10 text-yellow-300';
      default: return 'bg-red-500/10 text-red-300';
    }
  }

  function getTargetLabel(type: string): string {
    switch (type) {
      case 'user': return 'User';
      case 'agent': return 'Agent';
      case 'team': return 'Team';
      case 'webhook': return 'Webhook';
      default: return type;
    }
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const activePolicies = policies.filter(p => p.is_active).length;
  const pendingEvents = events.filter(e => e.status === 'pending' || e.status === 'notified').length;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">AI Supervisor</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Escalation Control
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setShowForm(!showForm)}>
              <CirclePlus className="h-4 w-4" /> New Policy
            </Button>
            <Button variant="ghost" onClick={loadData}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Centralized escalation policies. Configure triggers, targets, and notification channels.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active Policies</p>
          <p className="mt-3 text-3xl font-semibold text-white">{activePolicies}</p>
          <p className="mt-2 text-sm text-slate-400">Configured rules</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pending Escalations</p>
          <p className="mt-3 text-3xl font-semibold text-yellow-400">{pendingEvents}</p>
          <p className="mt-2 text-sm text-slate-400">Awaiting action</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Auto-Escalate</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-400">{policies.filter(p => p.auto_escalate).length}</p>
          <p className="mt-2 text-sm text-slate-400">Enabled policies</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setShowEvents(false)}
          className={`px-4 py-2 text-sm font-medium transition ${!showEvents ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
        >
          Policies ({policies.length})
        </button>
        <button
          onClick={() => setShowEvents(true)}
          className={`px-4 py-2 text-sm font-medium transition ${showEvents ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
        >
          Active Events ({pendingEvents})
        </button>
      </div>

      {showForm && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
          <div className="flex items-center gap-3 text-white mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create Escalation Policy</h2>
              <p className="text-sm text-slate-400">Define when and how escalations happen.</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={submitForm}>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Policy Name</label>
                <input
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
                  placeholder="e.g. Urgent Lead Escalation"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Priority</label>
                <input
                  type="number"
                  value={formState.priority}
                  onChange={(e) => setFormState({ ...formState, priority: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">Target Type</label>
              <select
                value={formState.escalation_target_type}
                onChange={(e) => setFormState({ ...formState, escalation_target_type: e.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
              >
                <option value="user">User</option>
                <option value="agent">Agent</option>
                <option value="team">Team</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Delay (seconds)</label>
                <input
                  type="number"
                  value={formState.escalation_delay_seconds}
                  onChange={(e) => setFormState({ ...formState, escalation_delay_seconds: parseInt(e.target.value) || 300 })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
                />
              </div>
              <div className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  id="auto_escalate"
                  checked={formState.auto_escalate}
                  onChange={(e) => setFormState({ ...formState, auto_escalate: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
                />
                <label htmlFor="auto_escalate" className="text-sm text-slate-200">Auto-escalate</label>
              </div>
            </div>

            <div className="flex gap-3">
              {message && <p className="text-sm text-emerald-300">{message}</p>}
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" /> Save Policy
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : showEvents ? (
            events.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                <CheckCircle className="mx-auto mb-4 h-10 w-10 text-emerald-300" />
                <p>No pending escalations. All clear!</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{event.policy?.name || 'Unknown Policy'}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${getStatusBadge(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{event.trigger_reason || 'No reason specified'}</p>
                        <p className="mt-1 text-xs text-slate-500">{new Date(event.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {event.status === 'pending' && (
                        <Button variant="secondary" size="sm" onClick={() => acknowledgeEvent(event)}>
                          Acknowledge
                        </Button>
                      )}
                      {event.status === 'acknowledged' && (
                        <Button variant="secondary" size="sm" onClick={() => resolveEvent(event)}>
                          <CheckCircle className="h-4 w-4" /> Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            policies.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                <AlertOctagon className="mx-auto mb-4 h-10 w-10 text-amber-300" />
                <p>No escalation policies yet. Create your first policy to automate escalations.</p>
              </div>
            ) : (
              policies.map((policy) => (
                <div key={policy.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-mono text-slate-500">#{policy.priority}</span>
                        <h3 className="text-lg font-semibold text-white">{policy.name}</h3>
                        {!policy.is_active && (
                          <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs text-slate-400">Inactive</span>
                        )}
                        {policy.auto_escalate && (
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">Auto</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{policy.description || 'No description'}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span className="text-primary-300">Route to: {getTargetLabel(policy.escalation_target_type)}</span>
                        <span className="text-slate-500">({policy.escalation_delay_seconds}s delay)</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="destructive" size="sm" onClick={() => deletePolicy(policy)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </section>
    </main>
  );
}