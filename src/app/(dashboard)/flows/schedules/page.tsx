"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Calendar, Plus, Trash2, PlayCircle, PauseCircle, Clock, Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface FlowSchedule {
  id: string;
  flow_id: string;
  cron_expression: string;
  timezone: string;
  next_run_at: string | null;
  last_run_at: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  flow?: { name: string };
}

interface Flow {
  id: string;
  name: string;
}

const CRON_PRESETS = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at 9am', value: '0 9 * * *' },
  { label: 'Every day at 6pm', value: '0 18 * * *' },
  { label: 'Every Monday at 9am', value: '0 9 * * 1' },
  { label: 'Every week on Monday', value: '0 9 * * 1' },
  { label: 'Every month on the 1st', value: '0 9 1 * *' },
];

export default function WorkflowSchedulesPage() {
  const { profileLoading } = useAuth();
  const [schedules, setSchedules] = useState<FlowSchedule[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({
    flow_id: '',
    cron_expression: '0 9 * * *',
    timezone: 'UTC',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [schedulesRes, flowsRes] = await Promise.all([
        fetch('/api/flows/schedules'),
        fetch('/api/flows'),
      ]);

      const schedulesData = await schedulesRes.json();
      const flowsData = await flowsRes.json();

      setSchedules(Array.isArray(schedulesData.schedules) ? schedulesData.schedules : []);
      setFlows(Array.isArray(flowsData.flows) ? flowsData.flows : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/flows/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Failed to create schedule');

      toast.success('Schedule created');
      setShowForm(false);
      setFormState({ flow_id: '', cron_expression: '0 9 * * *', timezone: 'UTC', is_active: true });
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create schedule';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function toggleSchedule(schedule: FlowSchedule) {
    try {
      const response = await fetch('/api/flows/schedules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: schedule.id, is_active: !schedule.is_active }),
      });

      if (!response.ok) throw new Error('Failed to update');
      await loadData();
    } catch (err) {
      toast.error('Failed to update schedule');
    }
  }

  async function deleteSchedule(schedule: FlowSchedule) {
    if (!confirm(`Delete schedule for "${schedule.flow?.name}"?`)) return;

    try {
      const response = await fetch(`/api/flows/schedules?id=${schedule.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Schedule deleted');
      await loadData();
    } catch (err) {
      toast.error('Failed to delete schedule');
    }
  }

  function formatCron(cron: string): string {
    const preset = CRON_PRESETS.find(p => p.value === cron);
    if (preset) return preset.label;

    const parts = cron.split(' ');
    if (parts.length >= 5) {
      return `At ${parts[1]}:${parts[0].padStart(2, '0')} on day ${parts[2]} of month ${parts[3]}, weekday ${parts[4]}`;
    }
    return cron;
  }

  function formatNextRun(date: string | null): string {
    if (!date) return 'Not scheduled';
    const d = new Date(date);
    if (d < new Date()) return 'Due now';
    return d.toLocaleString();
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeSchedules = schedules.filter(s => s.is_active).length;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">Workflow Automation</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Scheduled Flows
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4" /> New Schedule
            </Button>
            <Button variant="ghost" onClick={loadData}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Schedule workflows to run automatically. Set up daily reminders, weekly follow-ups, and more.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Schedules</p>
          <p className="mt-3 text-3xl font-semibold text-white">{schedules.length}</p>
          <p className="mt-2 text-sm text-slate-400">Configured</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-400">{activeSchedules}</p>
          <p className="mt-2 text-sm text-slate-400">Running on schedule</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Next Run</p>
          <p className="mt-3 text-lg font-semibold text-white">
            {schedules.find(s => s.is_active && s.next_run_at)
              ? formatNextRun(schedules.find(s => s.is_active && s.next_run_at)?.next_run_at || null)
              : 'None'}
          </p>
          <p className="mt-2 text-sm text-slate-400">Upcoming execution</p>
        </div>
      </div>

      {showForm && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
          <div className="flex items-center gap-3 text-white mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create Schedule</h2>
              <p className="text-sm text-slate-400">Set up automated flow execution.</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={submitForm}>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Flow</label>
              <select
                value={formState.flow_id}
                onChange={(e) => setFormState({ ...formState, flow_id: e.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
                required
              >
                <option value="">Select a flow...</option>
                {flows.map((flow) => (
                  <option key={flow.id} value={flow.id}>{flow.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">Schedule</label>
              <select
                value={formState.cron_expression}
                onChange={(e) => setFormState({ ...formState, cron_expression: e.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
              >
                {CRON_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>{preset.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">Custom Cron Expression</label>
              <input
                value={formState.cron_expression}
                onChange={(e) => setFormState({ ...formState, cron_expression: e.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white font-mono"
                placeholder="0 9 * * *"
              />
              <p className="text-xs text-slate-500">Format: minute hour day-of-month month day-of-week</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formState.is_active}
                onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
              />
              <label htmlFor="is_active" className="text-sm text-slate-200">Schedule is active</label>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || !formState.flow_id}>
                <Save className="h-4 w-4" /> Create Schedule
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading schedules...</p>
          ) : schedules.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <Calendar className="mx-auto mb-4 h-10 w-10 text-primary-300" />
              <p>No scheduled flows yet. Create a schedule to automate your workflows.</p>
            </div>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${schedule.is_active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {schedule.flow?.name || 'Unknown Flow'}
                        </h3>
                        {!schedule.is_active && (
                          <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs text-slate-400">Paused</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        {formatCron(schedule.cron_expression)} ({schedule.timezone})
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span>Next: {formatNextRun(schedule.next_run_at)}</span>
                        {schedule.last_run_at && (
                          <span>Last: {new Date(schedule.last_run_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleSchedule(schedule)}>
                      {schedule.is_active ? (
                        <><PauseCircle className="h-4 w-4" /> Pause</>
                      ) : (
                        <><PlayCircle className="h-4 w-4" /> Activate</>
                      )}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteSchedule(schedule)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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