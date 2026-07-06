"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  CirclePlus,
  Copy,
  Cpu,
  Pencil,
  Save,
  Trash2,
  Users,
  UsersRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { Agent, AgentTeam } from '@/types';

interface TeamMember {
  id: string;
  team_id: string;
  agent_id: string;
  role: 'lead' | 'member';
  created_at: string;
  agent?: Agent;
}

interface TeamWithMembers extends AgentTeam {
  member_count: number;
  members?: TeamMember[];
}

const teamColors = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

const initialFormState = {
  name: '',
  description: '',
  color: '#6366f1',
};

type FormState = typeof initialFormState;

export default function TeamsPage() {
  const { profileLoading } = useAuth();
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [addingMembers, setAddingMembers] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? null,
    [teams, selectedTeamId],
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [teamsRes, agentsRes] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/agents'),
      ]);

      const teamsData = await teamsRes.json();
      const agentsData = await agentsRes.json();

      if (!teamsRes.ok) {
        throw new Error(teamsData?.error ?? 'Unable to load teams');
      }
      if (!agentsRes.ok) {
        throw new Error(agentsData?.error ?? 'Unable to load agents');
      }

      setTeams(Array.isArray(teamsData.teams) ? teamsData.teams : []);
      setAgents(Array.isArray(agentsData.agents) ? agentsData.agents : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadTeamMembers(teamId: string) {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to load team members');
      }
      setSelectedMembers(Array.isArray(data.members) ? data.members : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load team members');
    }
  }

  function resetForm() {
    setSelectedTeamId(null);
    setSelectedMembers([]);
    setFormState(initialFormState);
    setMessage(null);
    setError(null);
    setAddingMembers(false);
    setSelectedAgentId('');
  }

  function populateForm(team: TeamWithMembers) {
    setSelectedTeamId(team.id);
    setFormState({
      name: team.name,
      description: team.description ?? '',
      color: team.color,
    });
    setMessage('Editing selected team. Save to update its settings.');
    setError(null);
    setAddingMembers(false);
    loadTeamMembers(team.id);
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      name: formState.name.trim(),
      description: formState.description.trim(),
      color: formState.color,
    };

    if (!payload.name) {
      setError('Team name is required.');
      setSaving(false);
      return;
    }

    try {
      const url = selectedTeamId ? `/api/teams/${selectedTeamId}` : '/api/teams';
      const method = selectedTeamId ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to save team');
      }

      if (selectedTeamId) {
        setMessage('Team updated successfully.');
      } else {
        setMessage('Team created successfully.');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save team');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTeam(team: TeamWithMembers) {
    if (!confirm(`Permanently delete "${team.name}"? This will remove all team members.`)) {
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to delete team');
      }
      if (selectedTeamId === team.id) {
        resetForm();
      }
      setMessage('Team deleted permanently.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete team');
    } finally {
      setSaving(false);
    }
  }

  async function addMember() {
    if (!selectedTeamId || !selectedAgentId) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/teams/${selectedTeamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: selectedAgentId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to add member');
      }
      setMessage('Member added successfully.');
      setSelectedAgentId('');
      setAddingMembers(false);
      await loadTeamMembers(selectedTeamId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add member');
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(memberId: string) {
    if (!selectedTeamId) return;
    if (!confirm('Remove this agent from the team?')) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/teams/${selectedTeamId}/members?member_id=${memberId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to remove member');
      }
      setMessage('Member removed successfully.');
      await loadTeamMembers(selectedTeamId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove member');
    } finally {
      setSaving(false);
    }
  }

  // Get available agents (not already in this team)
  const availableAgents = useMemo(() => {
    const teamMemberIds = new Set(selectedMembers.map(m => m.agent_id));
    return agents.filter(a => !teamMemberIds.has(a.id));
  }, [agents, selectedMembers]);

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Loading Teams...</p>
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
              Agent Teams
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={resetForm}>
              <CirclePlus className="h-4 w-4" /> New team
            </Button>
            <Button variant="ghost" onClick={loadData}>
              <Save className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Group agents into teams with shared resources. Route conversations to the right team based on conditions.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Team Form */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <UsersRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {selectedTeamId ? 'Edit Team' : 'Create Team'}
              </h2>
              <p className="text-sm text-slate-400">
                Define a team of AI agents with shared resources.
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={submitForm}>
            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Team name</span>
              <input
                value={formState.name}
                onChange={(event) => setFormState({ ...formState, name: event.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Sales Team"
              />
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Description</span>
              <textarea
                value={formState.description}
                onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                rows={3}
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Describe this team's purpose and responsibilities."
              />
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Team color</span>
              <div className="flex flex-wrap gap-2">
                {teamColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormState({ ...formState, color })}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      formState.color === color
                        ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Team Members Section - Only show when editing */}
            {selectedTeamId && (
              <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">Team Members</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddingMembers(!addingMembers)}
                    disabled={availableAgents.length === 0}
                  >
                    <CirclePlus className="h-4 w-4" /> Add Agent
                  </Button>
                </div>

                {addingMembers && availableAgents.length > 0 && (
                  <div className="flex gap-2">
                    <select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-white outline-none transition focus:border-primary"
                    >
                      <option value="">Select an agent...</option>
                      {availableAgents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    <Button onClick={addMember} disabled={!selectedAgentId || saving}>
                      Add
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedMembers.length === 0 ? (
                    <p className="text-sm text-slate-400">No agents in this team yet.</p>
                  ) : (
                    selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-2xl bg-slate-800/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                            <Cpu className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {member.agent?.name ?? 'Unknown Agent'}
                            </p>
                            <p className="text-xs text-slate-400 capitalize">{member.role}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2 text-sm text-slate-400">
                {message ? <p className="text-emerald-300">{message}</p> : null}
                {error ? <p className="text-destructive-300">{error}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTeam && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => deleteTeam(selectedTeam)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {selectedTeamId ? 'Save changes' : 'Create team'}
                </Button>
              </div>
            </div>
          </form>
        </section>

        {/* Teams List */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-primary-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Your Teams</h2>
              <p className="text-sm text-slate-400">
                Review and manage your agent teams.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">
                Loading teams...
              </div>
            ) : teams.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-300" />
                <p className="text-sm">No teams exist yet. Use the form to create the first one.</p>
              </div>
            ) : (
              teams.map((team) => (
                <div key={team.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <h3 className="truncate text-lg font-semibold text-white">{team.name}</h3>
                        {!team.is_active && (
                          <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs font-semibold uppercase text-slate-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="mt-2 truncate text-sm text-slate-400">
                        {team.description || 'No description set.'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => populateForm(team)}>
                        <Pencil className="h-4 w-4" /> Edit
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