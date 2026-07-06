"use client";

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Archive, BookOpen, CirclePlus, Copy, Cpu, Pencil, Save, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface AgentRecord {
  id: string;
  name: string;
  description: string | null;
  goal: string | null;
  personality: string;
  tone: string;
  communication_style: string;
  languages: string[];
  business_context: string | null;
  instructions: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const personalityOptions = ['Friendly', 'Professional', 'Assertive', 'Empathetic', 'Neutral'] as const;
const toneOptions = ['Formal', 'Casual', 'Conversational', 'Technical'] as const;
const communicationStyleOptions = ['Concise', 'Detailed', 'Bullet-led', 'Narrative'] as const;
const statusOptions = ['draft', 'testing', 'live', 'archived'] as const;

const initialFormState = {
  name: '',
  description: '',
  goal: '',
  personality: 'Neutral',
  tone: 'Conversational',
  communication_style: 'Concise',
  languages: 'en',
  business_context: '',
  instructions: '',
  status: 'draft',
};

type FormState = typeof initialFormState;

function statusLabel(status: string) {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'testing':
      return 'Testing';
    case 'live':
      return 'Live';
    case 'archived':
      return 'Archived';
    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-slate-800 text-slate-300';
    case 'testing':
      return 'bg-amber-500/10 text-amber-300';
    case 'live':
      return 'bg-emerald-500/10 text-emerald-300';
    case 'archived':
      return 'bg-slate-700 text-slate-400';
    default:
      return 'bg-slate-800 text-slate-300';
  }
}

export default function AgentsPage() {
  const { profileLoading } = useAuth();
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  );

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to load agents');
      }
      setAgents(Array.isArray(data.agents) ? data.agents : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load agents');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setSelectedAgentId(null);
    setFormState(initialFormState);
    setMessage(null);
    setError(null);
  }

  function populateForm(agent: AgentRecord) {
    setSelectedAgentId(agent.id);
    setFormState({
      name: agent.name,
      description: agent.description ?? '',
      goal: agent.goal ?? '',
      personality: agent.personality,
      tone: agent.tone,
      communication_style: agent.communication_style,
      languages: agent.languages.join(', '),
      business_context: agent.business_context ?? '',
      instructions: agent.instructions ?? '',
      status: agent.status,
    });
    setMessage('Editing selected AI agent. Save to update its settings.');
    setError(null);
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      name: formState.name.trim(),
      description: formState.description.trim(),
      goal: formState.goal.trim(),
      personality: formState.personality,
      tone: formState.tone,
      communication_style: formState.communication_style,
      languages: formState.languages.split(',').map((lang) => lang.trim()).filter(Boolean),
      business_context: formState.business_context.trim(),
      instructions: formState.instructions.trim(),
      status: formState.status,
    };

    if (!payload.name) {
      setError('Agent name is required.');
      setSaving(false);
      return;
    }

    try {
      const url = selectedAgentId ? `/api/agents/${selectedAgentId}` : '/api/agents';
      const method = selectedAgentId ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to save agent');
      }

      if (selectedAgentId) {
        setMessage('Agent updated successfully.');
      } else {
        setMessage('Agent created successfully.');
      }
      resetForm();
      await loadAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save agent');
    } finally {
      setSaving(false);
    }
  }

  async function duplicateAgent(agent: AgentRecord) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Copy of ${agent.name}`,
          description: agent.description,
          goal: agent.goal,
          personality: agent.personality,
          tone: agent.tone,
          communication_style: agent.communication_style,
          languages: agent.languages,
          business_context: agent.business_context,
          instructions: agent.instructions,
          status: 'draft',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to duplicate agent');
      }
      setMessage('Agent duplicated. Edit the copy and save when ready.');
      await loadAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to duplicate agent');
    } finally {
      setSaving(false);
    }
  }

  async function updateAgentStatus(agent: AgentRecord, status: string) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to update agent status');
      }
      setMessage(`Agent status updated to ${statusLabel(status)}.`);
      if (selectedAgentId === agent.id) {
        populateForm(data.agent as AgentRecord);
      }
      await loadAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update agent status');
    } finally {
      setSaving(false);
    }
  }

  async function deleteAgent(agent: AgentRecord) {
    if (!confirm(`Permanently delete “${agent.name}”? This cannot be undone.`)) {
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to delete agent');
      }
      if (selectedAgentId === agent.id) {
        resetForm();
      }
      setMessage('Agent deleted permanently.');
      await loadAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete agent');
    } finally {
      setSaving(false);
    }
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Loading AI Agent Studio…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">Agent Studio</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Build AI agents that feel like your team.
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={resetForm}>
              <CirclePlus className="h-4 w-4" /> New agent
            </Button>
            <Button variant="ghost" onClick={loadAgents}>
              <Save className="h-4 w-4" /> Refresh list
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Manage each AI employee with its own profile, goals, personality, and lifecycle status. Create a draft, test it, deploy it live, or archive it when business priorities shift.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Agent configuration</h2>
              <p className="text-sm text-slate-400">
                Define your AI agent once and deploy across conversations with consistent behavior.
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={submitForm}>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                <span className="font-medium">Agent name</span>
                <input
                  value={formState.name}
                  onChange={(event) => setFormState({ ...formState, name: event.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Lead Assistant"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-200">
                <span className="font-medium">Status</span>
                <select
                  value={formState.status}
                  onChange={(event) => setFormState({ ...formState, status: event.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Agent goal</span>
              <input
                value={formState.goal}
                onChange={(event) => setFormState({ ...formState, goal: event.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Qualify leads, book meetings, answer FAQs"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                <span className="font-medium">Personality</span>
                <select
                  value={formState.personality}
                  onChange={(event) => setFormState({ ...formState, personality: event.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {personalityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span className="font-medium">Tone</span>
                <select
                  value={formState.tone}
                  onChange={(event) => setFormState({ ...formState, tone: event.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {toneOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                <span className="font-medium">Communication style</span>
                <select
                  value={formState.communication_style}
                  onChange={(event) => setFormState({ ...formState, communication_style: event.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {communicationStyleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-slate-200">
                <span className="font-medium">Languages</span>
                <input
                  value={formState.languages}
                  onChange={(event) => setFormState({ ...formState, languages: event.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="en, es, fr"
                />
              </label>
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Business context</span>
              <textarea
                value={formState.business_context}
                onChange={(event) => setFormState({ ...formState, business_context: event.target.value })}
                rows={4}
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Describe your business, products, and customer expectations."
              />
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Behavior instructions</span>
              <textarea
                value={formState.instructions}
                onChange={(event) => setFormState({ ...formState, instructions: event.target.value })}
                rows={5}
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Add rules, tone guidance, and any guardrails for this AI employee."
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2 text-sm text-slate-400">
                <p>{selectedAgentId ? 'Edit your selected agent, or create a new one.' : 'Create a new AI agent and deploy it when ready.'}</p>
                {message ? <p className="text-emerald-300">{message}</p> : null}
                {error ? <p className="text-destructive-300">{error}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedAgent && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => updateAgentStatus(selectedAgent, selectedAgent.status === 'archived' ? 'draft' : 'archived')}
                  >
                    <Archive className="h-4 w-4" />
                    {selectedAgent.status === 'archived' ? 'Restore' : 'Archive'}
                  </Button>
                )}
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {selectedAgentId ? 'Save changes' : 'Create agent'}
                </Button>
              </div>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-primary-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Your AI agents</h2>
              <p className="text-sm text-slate-400">
                Review draft, testing, live, and archived agents in one place.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">
                Loading agents…
              </div>
            ) : agents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-300" />
                <p className="text-sm">No AI agents exist yet. Use the form to create the first one.</p>
              </div>
            ) : (
              agents.map((agent) => (
                <div key={agent.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="truncate text-lg font-semibold text-white">{agent.name}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${statusClass(agent.status)}`}>
                          {statusLabel(agent.status)}
                        </span>
                      </div>
                      <p className="mt-2 truncate text-sm text-slate-400">{agent.goal || 'No goal configured yet.'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => populateForm(agent)}>
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => duplicateAgent(agent)}>
                        <Copy className="h-4 w-4" /> Duplicate
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateAgentStatus(agent, agent.status === 'archived' ? 'draft' : 'archived')}>
                        <Archive className="h-4 w-4" /> {agent.status === 'archived' ? 'Restore' : 'Archive'}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteAgent(agent)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                      <p className="font-medium text-white">Personality</p>
                      <p className="mt-2">{agent.personality}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                      <p className="font-medium text-white">Tone</p>
                      <p className="mt-2">{agent.tone}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 text-slate-300 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.75)]">
        <div className="flex items-center gap-3 text-primary-100">
          <Sparkles className="h-5 w-5" />
          <p className="text-sm font-semibold">Phase one foundation</p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm font-semibold text-white">Create agents</p>
            <p className="mt-2 text-sm text-slate-400">Launch AI employees with business-context instructions, goals, and workflow-ready settings.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm font-semibold text-white">Test & iterate</p>
            <p className="mt-2 text-sm text-slate-400">Keep agents in draft, move them to testing, then deploy them live when they are ready.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm font-semibold text-white">Archive safely</p>
            <p className="mt-2 text-sm text-slate-400">Retire agents without losing configuration and bring them back later if needed.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
