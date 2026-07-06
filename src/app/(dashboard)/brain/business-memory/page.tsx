"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, CirclePlus, Save, Trash2, Edit2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface BusinessMemory {
  id: string;
  memory_category: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const categories = [
  { value: 'company_info', label: 'Company Info' },
  { value: 'products_services', label: 'Products & Services' },
  { value: 'team_members', label: 'Team Members' },
  { value: 'policies', label: 'Policies' },
  { value: 'business_rules', label: 'Business Rules' },
  { value: 'goals', label: 'Goals' },
  { value: 'other', label: 'Other' },
];

const initialFormState = {
  memory_category: 'company_info',
  title: '',
  content: '',
  is_active: true,
};

export default function BusinessMemoryPage() {
  const { profileLoading } = useAuth();
  const [memories, setMemories] = useState<BusinessMemory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/brain/business-memory');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to load memories');
      }
      setMemories(Array.isArray(data.memories) ? data.memories : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load memories');
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

  function populateForm(memory: BusinessMemory) {
    setSelectedId(memory.id);
    setFormState({
      memory_category: memory.memory_category,
      title: memory.title,
      content: memory.content,
      is_active: memory.is_active,
    });
    setMessage('Editing selected memory. Save to update.');
    setError(null);
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    if (!formState.title.trim() || !formState.content.trim()) {
      setError('Title and content are required.');
      setSaving(false);
      return;
    }

    try {
      const url = selectedId ? `/api/brain/business-memory/${selectedId}` : '/api/brain/business-memory';
      const method = selectedId ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memory_category: formState.memory_category,
          title: formState.title.trim(),
          content: formState.content.trim(),
          is_active: formState.is_active,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to save memory');
      }

      if (selectedId) {
        setMessage('Memory updated successfully.');
      } else {
        setMessage('Memory created successfully.');
      }
      resetForm();
      await loadMemories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save memory');
    } finally {
      setSaving(false);
    }
  }

  async function deleteMemory(memory: BusinessMemory) {
    if (!confirm(`Permanently delete "${memory.title}"? This cannot be undone.`)) {
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/brain/business-memory/${memory.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to delete memory');
      }
      if (selectedId === memory.id) {
        resetForm();
      }
      setMessage('Memory deleted permanently.');
      await loadMemories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete memory');
    } finally {
      setSaving(false);
    }
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Loading AI Business Brain…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">AI Business Brain</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Workspace memory and context.
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={resetForm}>
              <CirclePlus className="h-4 w-4" /> New memory
            </Button>
            <Button variant="ghost" onClick={loadMemories}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Store business context that all AI agents can access for consistent, accurate responses.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Save className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Business memory</h2>
              <p className="text-sm text-slate-400">
                Add context that agents will use when responding to contacts.
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={submitForm}>
            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Category</span>
              <select
                value={formState.memory_category}
                onChange={(event) => setFormState({ ...formState, memory_category: event.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Title</span>
              <input
                value={formState.title}
                onChange={(event) => setFormState({ ...formState, title: event.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Company operating hours"
              />
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Content</span>
              <textarea
                value={formState.content}
                onChange={(event) => setFormState({ ...formState, content: event.target.value })}
                rows={6}
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Enter the business context, rules, or information that agents should know..."
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={formState.is_active}
                onChange={(event) => setFormState({ ...formState, is_active: event.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
              />
              <span className="font-medium">Active (available to agents)</span>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2 text-sm text-slate-400">
                {message ? <p className="text-emerald-300">{message}</p> : null}
                {error ? <p className="text-destructive-300">{error}</p> : null}
              </div>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                {selectedId ? 'Save changes' : 'Create memory'}
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-primary-300">
              <Edit2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Stored memories</h2>
              <p className="text-sm text-slate-400">
                Review and manage business context.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">
                Loading memories…
              </div>
            ) : memories.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-300" />
                <p className="text-sm">No business memories yet. Add your first one.</p>
              </div>
            ) : (
              memories.map((memory) => (
                <div key={memory.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="truncate text-lg font-semibold text-white">{memory.title}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${memory.is_active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                          {memory.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                          {categories.find(c => c.value === memory.memory_category)?.label || memory.memory_category}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-400">{memory.content}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => populateForm(memory)}>
                        <Edit2 className="h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteMemory(memory)}>
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
    </main>
  );
}