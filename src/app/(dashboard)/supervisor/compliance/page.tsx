"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Shield, Trash2, CheckCircle, AlertOctagon, CirclePlus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface ComplianceRule {
  id: string;
  name: string;
  description: string | null;
  rule_type: string;
  rule_config: Record<string, unknown>;
  severity: string;
  is_active: boolean;
  applies_to_all_agents: boolean;
  created_at: string;
}

interface ComplianceViolation {
  id: string;
  rule_id: string;
  agent_id: string;
  conversation_id: string | null;
  violation_details: Record<string, unknown>;
  severity: string;
  is_resolved: boolean;
  created_at: string;
  rule?: { name: string; rule_type: string };
  agent?: { name: string };
}

const ruleTypeOptions = [
  { value: 'content_block', label: 'Content Block' },
  { value: 'keyword_required', label: 'Keyword Required' },
  { value: 'keyword_forbidden', label: 'Keyword Forbidden' },
  { value: 'approval_required', label: 'Approval Required' },
  { value: 'escalation_trigger', label: 'Escalation Trigger' },
];

const severityOptions = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical' },
];

export default function CompliancePage() {
  const { profileLoading } = useAuth();
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showViolations, setShowViolations] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    rule_type: 'content_block',
    severity: 'warning',
    is_active: true,
    applies_to_all_agents: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [showViolations]);

  async function loadData() {
    setLoading(true);
    try {
      if (showViolations) {
        const response = await fetch('/api/supervisor/compliance?violations=true');
        const data = await response.json();
        setViolations(Array.isArray(data.violations) ? data.violations : []);
      } else {
        const response = await fetch('/api/supervisor/compliance');
        const data = await response.json();
        setRules(Array.isArray(data.rules) ? data.rules : []);
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
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/supervisor/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Failed to save');
      setMessage('Rule created successfully');
      setShowForm(false);
      setFormState({ name: '', description: '', rule_type: 'content_block', severity: 'warning', is_active: true, applies_to_all_agents: true });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function deleteRule(rule: ComplianceRule) {
    if (!confirm(`Delete rule "${rule.name}"?`)) return;
    try {
      const response = await fetch(`/api/supervisor/compliance?ruleId=${rule.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function resolveViolation(violation: ComplianceViolation) {
    try {
      const response = await fetch('/api/supervisor/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ violation_id: violation.id, is_resolved: true }),
      });
      if (!response.ok) throw new Error('Failed to resolve');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  function getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-300';
      case 'warning': return 'bg-yellow-500/10 text-yellow-300';
      default: return 'bg-blue-500/10 text-blue-300';
    }
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeRules = rules.filter(r => r.is_active).length;
  const unresolvedViolations = violations.filter(v => !v.is_resolved).length;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">AI Supervisor</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Compliance Monitoring
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setShowForm(!showForm)}>
              <CirclePlus className="h-4 w-4" /> New Rule
            </Button>
            <Button variant="ghost" onClick={loadData}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Define and enforce compliance rules. Block content, require approvals, and track violations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active Rules</p>
          <p className="mt-3 text-3xl font-semibold text-white">{activeRules}</p>
          <p className="mt-2 text-sm text-slate-400">Enforcing compliance</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Violations</p>
          <p className="mt-3 text-3xl font-semibold text-white">{violations.length}</p>
          <p className="mt-2 text-sm text-slate-400">All time</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Unresolved</p>
          <p className="mt-3 text-3xl font-semibold text-red-400">{unresolvedViolations}</p>
          <p className="mt-2 text-sm text-slate-400">Needs attention</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setShowViolations(false)}
          className={`px-4 py-2 text-sm font-medium transition ${!showViolations ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
        >
          Rules ({rules.length})
        </button>
        <button
          onClick={() => setShowViolations(true)}
          className={`px-4 py-2 text-sm font-medium transition ${showViolations ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
        >
          Violations ({unresolvedViolations} pending)
        </button>
      </div>

      {showForm && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
          <div className="flex items-center gap-3 text-white mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create Compliance Rule</h2>
              <p className="text-sm text-slate-400">Define a new rule to enforce.</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={submitForm}>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Rule Name</label>
                <input
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
                  placeholder="e.g. No pricing guarantees"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Severity</label>
                <select
                  value={formState.severity}
                  onChange={(e) => setFormState({ ...formState, severity: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
                >
                  {severityOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">Rule Type</label>
              <select
                value={formState.rule_type}
                onChange={(e) => setFormState({ ...formState, rule_type: e.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
              >
                {ruleTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">Description</label>
              <textarea
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                rows={2}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
                placeholder="Describe what this rule enforces..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formState.is_active}
                onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
              />
              <label htmlFor="is_active" className="text-sm text-slate-200">Rule is active</label>
            </div>

            <div className="flex gap-3">
              {message && <p className="text-sm text-emerald-300">{message}</p>}
              {error && <p className="text-sm text-red-300">{error}</p>}
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" /> Save Rule
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : showViolations ? (
            violations.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                <CheckCircle className="mx-auto mb-4 h-10 w-10 text-emerald-300" />
                <p>No violations found. Great job staying compliant!</p>
              </div>
            ) : (
              violations.map((violation) => (
                <div key={violation.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                        <AlertOctagon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{violation.rule?.name || 'Unknown Rule'}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${getSeverityColor(violation.severity)}`}>
                            {violation.severity}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          Agent: {violation.agent?.name || 'Unknown'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(violation.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!violation.is_resolved && (
                      <Button variant="secondary" size="sm" onClick={() => resolveViolation(violation)}>
                        <CheckCircle className="h-4 w-4" /> Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            rules.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                <Shield className="mx-auto mb-4 h-10 w-10 text-amber-300" />
                <p>No compliance rules yet. Create your first rule to enforce policies.</p>
              </div>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                        {!rule.is_active && (
                          <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs text-slate-400">Inactive</span>
                        )}
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${getSeverityColor(rule.severity)}`}>
                          {rule.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{rule.description || rule.rule_type}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="destructive" size="sm" onClick={() => deleteRule(rule)}>
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