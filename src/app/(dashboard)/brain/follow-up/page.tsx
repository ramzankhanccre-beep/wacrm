"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, CirclePlus, Save, Trash2, Edit2, RefreshCw, Play, Pause, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface FollowUpSequence {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  conditions: Record<string, unknown>;
  steps: unknown[];
  is_active: boolean;
  requires_approval: boolean;
  created_at: string;
  updated_at: string;
}

interface FollowUpTask {
  id: string;
  sequence_id: string;
  contact_id: string;
  step_index: number;
  scheduled_at: string;
  completed_at: string | null;
  status: string;
  message_content: string | null;
}

const triggerEvents = [
  { value: 'manual', label: 'Manual Trigger' },
  { value: 'conversation_ended', label: 'Conversation Ended' },
  { value: 'no_response', label: 'No Response' },
  { value: 'stage_changed', label: 'Stage Changed' },
  { value: 'tag_added', label: 'Tag Added' },
  { value: 'scheduled', label: 'Scheduled' },
];

const initialFormState = {
  name: '',
  description: '',
  trigger_event: 'manual',
  is_active: true,
  requires_approval: true,
};

export default function FollowUpPage() {
  const { profileLoading } = useAuth();
  const [sequences, setSequences] = useState<FollowUpSequence[]>([]);
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sequences' | 'tasks'>('sequences');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [seqRes, taskRes] = await Promise.all([
        fetch('/api/brain/follow-up?type=sequences'),
        fetch('/api/brain/follow-up?type=tasks&pending=true'),
      ]);

      const seqData = await seqRes.json();
      const taskData = await taskRes.json();

      if (!seqRes.ok) throw new Error(seqData?.error);
      if (!taskRes.ok) throw new Error(taskData?.error);

      setSequences(Array.isArray(seqData.sequences) ? seqData.sequences : []);
      setTasks(Array.isArray(taskData.tasks) ? taskData.tasks : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setSelectedId(null);
    setFormState(initialFormState);
    setMessage(null);
    setError(null);
  }

  function populateForm(seq: FollowUpSequence) {
    setSelectedId(seq.id);
    setFormState({
      name: seq.name,
      description: seq.description ?? '',
      trigger_event: seq.trigger_event,
      is_active: seq.is_active,
      requires_approval: seq.requires_approval,
    });
    setMessage('Editing sequence. Save to update.');
    setError(null);
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    if (!formState.name.trim()) {
      setError('Name is required.');
      setSaving(false);
      return;
    }

    try {
      const url = selectedId ? `/api/brain/follow-up?sequence_id=${selectedId}` : '/api/brain/follow-up';
      const method = selectedId ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name.trim(),
          description: formState.description.trim(),
          trigger_event: formState.trigger_event,
          is_active: formState.is_active,
          requires_approval: formState.requires_approval,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to save sequence');
      }

      setMessage(selectedId ? 'Sequence updated.' : 'Sequence created.');
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function toggleSequence(seq: FollowUpSequence) {
    setSaving(true);
    try {
      const response = await fetch('/api/brain/follow-up', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequence_id: seq.id,
          is_active: !seq.is_active,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSequence(seq: FollowUpSequence) {
    if (!confirm(`Delete "${seq.name}"?`)) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/brain/follow-up?sequence_id=${seq.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      if (selectedId === seq.id) resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setSaving(false);
    }
  }

  async function approveTask(task: FollowUpTask) {
    setSaving(true);
    try {
      const response = await fetch('/api/brain/follow-up', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: task.id, status: 'approved' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setSaving(false);
    }
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">Autonomous Follow-Up</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Automated follow-up sequences.
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => { resetForm(); setActiveTab('sequences'); }}>
              <CirclePlus className="h-4 w-4" /> New sequence
            </Button>
            <Button variant="ghost" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Create automated follow-up sequences that trigger based on conversation events.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('sequences')}
          className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'sequences' ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
        >
          Sequences ({sequences.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'tasks' ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
        >
          Pending Tasks ({tasks.length})
        </button>
      </div>

      {activeTab === 'sequences' && (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.75)]">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Save className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Follow-up sequence</h2>
                <p className="text-sm text-slate-400">Configure automated follow-up steps.</p>
              </div>
            </div>

            <form className="mt-8 space-y-6" onSubmit={submitForm}>
              <div className="space-y-2 text-sm text-slate-200">
                <span className="font-medium">Sequence name</span>
                <input
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-primary"
                  placeholder="e.g. Lead follow-up sequence"
                />
              </div>

              <div className="space-y-2 text-sm text-slate-200">
                <span className="font-medium">Trigger event</span>
                <select
                  value={formState.trigger_event}
                  onChange={(e) => setFormState({ ...formState, trigger_event: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-primary"
                >
                  {triggerEvents.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-sm text-slate-200">
                <span className="font-medium">Description (optional)</span>
                <textarea
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-primary"
                  placeholder="Describe when this sequence should trigger..."
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={formState.is_active}
                    onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={formState.requires_approval}
                    onChange={(e) => setFormState({ ...formState, requires_approval: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
                  />
                  <span>Require approval before sending</span>
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div className="text-sm">
                  {message && <p className="text-emerald-300">{message}</p>}
                  {error && <p className="text-destructive-300">{error}</p>}
                </div>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {selectedId ? 'Save changes' : 'Create sequence'}
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-primary-300">
                <Edit2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Sequences</h2>
                <p className="text-sm text-slate-400">Manage follow-up sequences.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-slate-400">Loading...</p>
              ) : sequences.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                  <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-300" />
                  <p>No sequences yet. Create your first one.</p>
                </div>
              ) : (
                sequences.map((seq) => (
                  <div key={seq.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="truncate text-lg font-semibold text-white">{seq.name}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${seq.is_active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                            {seq.is_active ? 'Active' : 'Paused'}
                          </span>
                          <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] uppercase tracking-wider text-slate-400">
                            {triggerEvents.find(e => e.value === seq.trigger_event)?.label || seq.trigger_event}
                          </span>
                        </div>
                        {seq.description && <p className="mt-2 truncate text-sm text-slate-400">{seq.description}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={() => populateForm(seq)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleSequence(seq)}>
                          {seq.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteSequence(seq)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'tasks' && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-primary-300">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Pending follow-up tasks</h2>
              <p className="text-sm text-slate-400">Tasks awaiting approval or execution.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-slate-400">Loading...</p>
            ) : tasks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                <CheckCircle className="mx-auto mb-4 h-10 w-10 text-emerald-300" />
                <p>No pending tasks. All caught up!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs uppercase tracking-wider text-slate-400">
                          Step {task.step_index + 1}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${task.status === 'pending' ? 'bg-amber-500/10 text-amber-300' : task.status === 'approved' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        Scheduled: {new Date(task.scheduled_at).toLocaleString()}
                      </p>
                      {task.message_content && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-300">{task.message_content}</p>
                      )}
                    </div>
                    {task.status === 'pending' && task.scheduled_at <= new Date().toISOString() && (
                      <Button variant="secondary" size="sm" onClick={() => approveTask(task)}>
                        <CheckCircle className="h-4 w-4" /> Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
}