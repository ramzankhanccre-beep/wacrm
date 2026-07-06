"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CirclePlus,
  Save,
  Trash2,
  GitBranch,
  Clock,
  MessageSquare,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { Agent, AgentTeam, AgentRoutingRule, RoutingCondition } from '@/types';

interface RoutingRuleWithTargets extends Omit<AgentRoutingRule, 'target_team' | 'target_agent' | 'fallback_agent'> {
  target_team?: { id: string; name: string } | null;
  target_agent?: { id: string; name: string } | null;
  fallback_agent?: { id: string; name: string } | null;
}

const initialFormState = {
  name: '',
  description: '',
  priority: 0,
  lead_stage: '',
  message_contains: '',
  contact_tag: '',
  time_start: '',
  time_end: '',
  target_team_id: '',
  target_agent_id: '',
  fallback_agent_id: '',
  is_active: true,
};

type FormState = typeof initialFormState;

const leadStageOptions = [
  { value: '', label: 'Any stage' },
  { value: 'new', label: 'New' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

export default function RoutingPage() {
  const { profileLoading } = useAuth();
  const [rules, setRules] = useState<RoutingRuleWithTargets[]>([]);
  const [teams, setTeams] = useState<AgentTeam[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedRule = useMemo(
    () => rules.find((rule) => rule.id === selectedRuleId) ?? null,
    [rules, selectedRuleId],
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [rulesRes, teamsRes, agentsRes] = await Promise.all([
        fetch('/api/routing'),
        fetch('/api/teams'),
        fetch('/api/agents'),
      ]);

      const rulesData = await rulesRes.json();
      const teamsData = await teamsRes.json();
      const agentsData = await agentsRes.json();

      if (!rulesRes.ok) throw new Error(rulesData?.error ?? 'Unable to load routing rules');
      if (!teamsRes.ok) throw new Error(teamsData?.error ?? 'Unable to load teams');
      if (!agentsRes.ok) throw new Error(agentsData?.error ?? 'Unable to load agents');

      setRules(Array.isArray(rulesData.rules) ? rulesData.rules : []);
      setTeams(Array.isArray(teamsData.teams) ? teamsData.teams : []);
      setAgents(Array.isArray(agentsData.agents) ? agentsData.agents : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setSelectedRuleId(null);
    setFormState(initialFormState);
    setMessage(null);
    setError(null);
  }

  function populateForm(rule: RoutingRuleWithTargets) {
    const conditions = rule.conditions || {};
    setSelectedRuleId(rule.id);
    setFormState({
      name: rule.name,
      description: rule.description ?? '',
      priority: rule.priority,
      lead_stage: conditions.lead_stage ?? '',
      message_contains: conditions.message_contains ?? '',
      contact_tag: conditions.contact_tag ?? '',
      time_start: conditions.time_of_day?.start ?? '',
      time_end: conditions.time_of_day?.end ?? '',
      target_team_id: rule.target_team_id ?? '',
      target_agent_id: rule.target_agent_id ?? '',
      fallback_agent_id: rule.fallback_agent_id ?? '',
      is_active: rule.is_active,
    });
    setMessage('Editing selected routing rule. Save to update.');
    setError(null);
  }

  function buildConditions(form: FormState): RoutingCondition {
    const conditions: RoutingCondition = {};
    if (form.lead_stage) conditions.lead_stage = form.lead_stage;
    if (form.message_contains) conditions.message_contains = form.message_contains;
    if (form.contact_tag) conditions.contact_tag = form.contact_tag;
    if (form.time_start && form.time_end) {
      conditions.time_of_day = { start: form.time_start, end: form.time_end };
    }
    return conditions;
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const conditions = buildConditions(formState);

    if (!formState.name.trim()) {
      setError('Rule name is required.');
      setSaving(false);
      return;
    }

    if (!formState.target_team_id && !formState.target_agent_id) {
      setError('Must specify a target team or agent.');
      setSaving(false);
      return;
    }

    const payload = {
      name: formState.name.trim(),
      description: formState.description.trim() || null,
      priority: formState.priority,
      conditions,
      target_team_id: formState.target_team_id || null,
      target_agent_id: formState.target_agent_id || null,
      fallback_agent_id: formState.fallback_agent_id || null,
      is_active: formState.is_active,
    };

    try {
      const url = selectedRuleId ? `/api/routing/${selectedRuleId}` : '/api/routing';
      const method = selectedRuleId ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to save routing rule');
      }

      setMessage(selectedRuleId ? 'Rule updated successfully.' : 'Rule created successfully.');
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  }

  async function deleteRule(rule: RoutingRuleWithTargets) {
    if (!confirm(`Delete routing rule "${rule.name}"?`)) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/routing/${rule.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? 'Unable to delete rule');
      if (selectedRuleId === rule.id) resetForm();
      setMessage('Rule deleted.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete rule');
    } finally {
      setSaving(false);
    }
  }

  async function toggleRuleActive(rule: RoutingRuleWithTargets) {
    setSaving(true);
    try {
      const response = await fetch(`/api/routing/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !rule.is_active }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? 'Unable to update rule');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update rule');
    } finally {
      setSaving(false);
    }
  }

  function getTargetLabel(rule: RoutingRuleWithTargets): string {
    if (rule.target_team?.name) return `Team: ${rule.target_team.name}`;
    if (rule.target_agent?.name) return `Agent: ${rule.target_agent.name}`;
    return 'No target';
  }

  function getConditionSummary(conditions: RoutingCondition): string {
    const parts = [];
    if (conditions.lead_stage) parts.push(`Stage: ${conditions.lead_stage}`);
    if (conditions.message_contains) parts.push(`Contains: "${conditions.message_contains}"`);
    if (conditions.contact_tag) parts.push(`Tag: ${conditions.contact_tag}`);
    if (conditions.time_of_day) parts.push(`Time: ${conditions.time_of_day.start}-${conditions.time_of_day.end}`);
    return parts.length > 0 ? parts.join(', ') : 'No conditions (catch-all)';
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">AI Workforce</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Routing Rules
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={resetForm}>
              <CirclePlus className="h-4 w-4" /> New rule
            </Button>
            <Button variant="ghost" onClick={loadData}>
              <Save className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Define rules to automatically route incoming conversations to the right agent or team.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Rule Form */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {selectedRuleId ? 'Edit Rule' : 'Create Rule'}
              </h2>
              <p className="text-sm text-slate-400">
                Set conditions and routing targets.
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={submitForm}>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                <span className="font-medium">Rule name</span>
                <input
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                  placeholder="e.g. New Leads to Sales"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span className="font-medium">Priority</span>
                <input
                  type="number"
                  value={formState.priority}
                  onChange={(e) => setFormState({ ...formState, priority: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                />
              </label>
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Description (optional)</span>
              <input
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                placeholder="When this rule should trigger..."
              />
            </div>

            {/* Conditions */}
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
              <h3 className="text-sm font-medium text-white">Conditions</h3>
              <p className="text-xs text-slate-400">All conditions must match for this rule to apply.</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
                  <span className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" /> Lead Stage
                  </span>
                  <select
                    value={formState.lead_stage}
                    onChange={(e) => setFormState({ ...formState, lead_stage: e.target.value })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                  >
                    {leadStageOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-200">
                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Contact Tag
                  </span>
                  <input
                    value={formState.contact_tag}
                    onChange={(e) => setFormState({ ...formState, contact_tag: e.target.value })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                    placeholder="e.g. VIP"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-200">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Message Contains
                </span>
                <input
                  value={formState.message_contains}
                  onChange={(e) => setFormState({ ...formState, message_contains: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                  placeholder="e.g. pricing, demo, buy"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Time Start
                  </span>
                  <input
                    type="time"
                    value={formState.time_start}
                    onChange={(e) => setFormState({ ...formState, time_start: e.target.value })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Time End
                  </span>
                  <input
                    type="time"
                    value={formState.time_end}
                    onChange={(e) => setFormState({ ...formState, time_end: e.target.value })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                  />
                </label>
              </div>
            </div>

            {/* Targets */}
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
              <h3 className="text-sm font-medium text-white">Route To</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
                  <span className="font-medium">Target Team</span>
                  <select
                    value={formState.target_team_id}
                    onChange={(e) => setFormState({ ...formState, target_team_id: e.target.value, target_agent_id: '' })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                  >
                    <option value="">Select team...</option>
                    {teams.filter(t => t.is_active).map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-200">
                  <span className="font-medium">Target Agent</span>
                  <select
                    value={formState.target_agent_id}
                    onChange={(e) => setFormState({ ...formState, target_agent_id: e.target.value, target_team_id: '' })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                  >
                    <option value="">Select agent...</option>
                    {agents.filter(a => a.status === 'live').map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-200">
                <span className="font-medium">Fallback Agent (if target unavailable)</span>
                <select
                  value={formState.fallback_agent_id}
                  onChange={(e) => setFormState({ ...formState, fallback_agent_id: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                >
                  <option value="">None</option>
                  {agents.filter(a => a.status === 'live').map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={formState.is_active}
                onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
              />
              <span className="font-medium">Rule is active</span>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2 text-sm text-slate-400">
                {message ? <p className="text-emerald-300">{message}</p> : null}
                {error ? <p className="text-destructive-300">{error}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedRule && (
                  <Button variant="outline" type="button" onClick={() => deleteRule(selectedRule)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                )}
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {selectedRuleId ? 'Save changes' : 'Create rule'}
                </Button>
              </div>
            </div>
          </form>
        </section>

        {/* Rules List */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-primary-300">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Routing Rules</h2>
              <p className="text-sm text-slate-400">
                Rules are evaluated in priority order (lower = first).
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">
                Loading...
              </div>
            ) : rules.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-300" />
                <p className="text-sm">No routing rules yet. Create one to automate conversation routing.</p>
              </div>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-mono text-slate-500">#{rule.priority}</span>
                        <h3 className="truncate text-lg font-semibold text-white">{rule.name}</h3>
                        {!rule.is_active && (
                          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">Inactive</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{getConditionSummary(rule.conditions)}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span className="text-primary-300">{getTargetLabel(rule)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRuleActive(rule)}
                      >
                        {rule.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => populateForm(rule)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}