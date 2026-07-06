"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Phone,
  RefreshCw,
  Save,
  Trash2,
  Plus,
  Play,
  Pause,
  Mic,
  PhoneOff,
  UserPlus,
  Volume2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface VoiceAgent {
  id: string;
  name: string;
  description: string | null;
  agent_id: string | null;
  stt_config_id: string | null;
  tts_config_id: string | null;
  enable_inbound: boolean;
  enable_outbound: boolean;
  max_duration_minutes: number;
  silence_timeout_seconds: number;
  interruptionSensitivity: "high" | "medium" | "low";
  greeting_message: string | null;
  fallback_message: string | null;
  is_active: boolean;
  created_at: string;
}

interface Agent {
  id: string;
  name: string;
}

const INTERRUPTION_OPTIONS = [
  { value: "high", label: "High (responsive)", description: "Responds quickly to interruptions" },
  {
    value: "medium",
    label: "Medium (balanced)",
    description: "Balanced response to interruptions",
  },
  { value: "low", label: "Low (focused)", description: "Maintains focus, less responsive to interruptions" },
];

export default function VoiceAgentsPage() {
  const { profileLoading } = useAuth();
  const [voiceAgents, setVoiceAgents] = useState<VoiceAgent[]>([]);
  const [textAgents, setTextAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    agent_id: "",
    stt_config_id: "",
    tts_config_id: "",
    enable_inbound: true,
    enable_outbound: false,
    max_duration_minutes: 30,
    silence_timeout_seconds: 10,
    interruptionSensitivity: "medium" as "high" | "medium" | "low",
    greeting_message: "",
    fallback_message: "",
    is_active: true,
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [voiceRes, agentsRes] = await Promise.all([
        fetch("/api/voice/agents"),
        fetch("/api/agents"),
      ]);

      const voiceData = await voiceRes.json();
      const agentsData = await agentsRes.json();

      setVoiceAgents(Array.isArray(voiceData.agents) ? voiceData.agents : []);
      setTextAgents(Array.isArray(agentsData.agents) ? agentsData.agents : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setFormState({
      name: "",
      description: "",
      agent_id: "",
      stt_config_id: "",
      tts_config_id: "",
      enable_inbound: true,
      enable_outbound: false,
      max_duration_minutes: 30,
      silence_timeout_seconds: 10,
      interruptionSensitivity: "medium",
      greeting_message: "",
      fallback_message: "",
      is_active: true,
    });
    setMessage(null);
  }

  function populateForm(agent: VoiceAgent) {
    setEditingId(agent.id);
    setFormState({
      name: agent.name,
      description: agent.description || "",
      agent_id: agent.agent_id || "",
      stt_config_id: agent.stt_config_id || "",
      tts_config_id: agent.tts_config_id || "",
      enable_inbound: agent.enable_inbound,
      enable_outbound: agent.enable_outbound,
      max_duration_minutes: agent.max_duration_minutes,
      silence_timeout_seconds: agent.silence_timeout_seconds,
      interruptionSensitivity: agent.interruptionSensitivity,
      greeting_message: agent.greeting_message || "",
      fallback_message: agent.fallback_message || "",
      is_active: agent.is_active,
    });
    setMessage("Editing voice agent. Save to update.");
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    if (!formState.name.trim()) {
      toast.error("Name is required");
      setSaving(false);
      return;
    }

    try {
      const url = editingId ? `/api/voice/agents/${editingId}` : "/api/voice/agents";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to save");

      setMessage(editingId ? "Voice agent updated successfully" : "Voice agent created successfully");
      resetForm();
      await loadData();
    } catch (err) {
      toast.error("Failed to save voice agent");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAgent(agent: VoiceAgent) {
    if (!confirm(`Delete voice agent "${agent.name}"?`)) return;
    try {
      const response = await fetch(`/api/voice/agents/${agent.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      if (editingId === agent.id) resetForm();
      await loadData();
    } catch (err) {
      toast.error("Failed to delete voice agent");
    }
  }

  async function toggleAgent(agent: VoiceAgent) {
    try {
      const response = await fetch(`/api/voice/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !agent.is_active }),
      });
      if (!response.ok) throw new Error("Failed to update");
      await loadData();
    } catch (err) {
      toast.error("Failed to update voice agent");
    }
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeAgents = voiceAgents.filter((a) => a.is_active).length;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">
              Voice Intelligence
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Voice Agents
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="h-4 w-4" /> New Voice Agent
            </Button>
            <Button variant="ghost" onClick={loadData}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Create voice-native AI agents that can handle inbound and outbound phone calls with natural
          conversation flow.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Agents</p>
          <p className="mt-3 text-3xl font-semibold text-white">{voiceAgents.length}</p>
          <p className="mt-2 text-sm text-slate-400">Voice agents configured</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-400">{activeAgents}</p>
          <p className="mt-2 text-sm text-slate-400">Ready for calls</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Inbound</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {voiceAgents.filter((a) => a.enable_inbound).length}
          </p>
          <p className="mt-2 text-sm text-slate-400">Can receive calls</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Outbound</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {voiceAgents.filter((a) => a.enable_outbound).length}
          </p>
          <p className="mt-2 text-sm text-slate-400">Can make calls</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Form */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit Voice Agent" : "Create Voice Agent"}
              </h2>
              <p className="text-sm text-slate-400">
                Configure a voice-native AI agent for phone calls.
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={submitForm}>
            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Name</span>
              <input
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                placeholder="e.g. Sales Voice Agent"
              />
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Description</span>
              <textarea
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                rows={2}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                placeholder="Describe this voice agent's purpose..."
              />
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Linked AI Agent</span>
              <select
                value={formState.agent_id}
                onChange={(e) => setFormState({ ...formState, agent_id: e.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
              >
                <option value="">Select an AI agent...</option>
                {textAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
              <h3 className="text-sm font-medium text-white">Call Settings</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={formState.enable_inbound}
                    onChange={(e) =>
                      setFormState({ ...formState, enable_inbound: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
                  />
                  <Phone className="h-4 w-4" />
                  Enable inbound calls
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={formState.enable_outbound}
                    onChange={(e) =>
                      setFormState({ ...formState, enable_outbound: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
                  />
                  <Phone className="h-4 w-4" />
                  Enable outbound calls
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-slate-200">
                    <Clock className="mr-2 inline h-4 w-4" />
                    Max Duration (min)
                  </label>
                  <input
                    type="number"
                    value={formState.max_duration_minutes}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        max_duration_minutes: parseInt(e.target.value) || 30,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-200">
                    <Mic className="mr-2 inline h-4 w-4" />
                    Silence Timeout (s)
                  </label>
                  <input
                    type="number"
                    value={formState.silence_timeout_seconds}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        silence_timeout_seconds: parseInt(e.target.value) || 10,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <label className="font-medium">Interruption Sensitivity</label>
              <div className="grid gap-2">
                {INTERRUPTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setFormState({
                        ...formState,
                        interruptionSensitivity: opt.value as "high" | "medium" | "low",
                      })
                    }
                    className={`rounded-2xl border border-slate-800 bg-slate-900 p-3 text-left transition ${
                      formState.interruptionSensitivity === opt.value
                        ? "border-primary bg-primary/10"
                        : "hover:border-slate-700"
                    }`}
                  >
                    <p className="font-medium text-white">{opt.label}</p>
                    <p className="text-xs text-slate-400">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Greeting Message</span>
              <textarea
                value={formState.greeting_message}
                onChange={(e) => setFormState({ ...formState, greeting_message: e.target.value })}
                rows={2}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                placeholder="Hello! How can I help you today?"
              />
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <span className="font-medium">Fallback Message</span>
              <textarea
                value={formState.fallback_message}
                onChange={(e) => setFormState({ ...formState, fallback_message: e.target.value })}
                rows={2}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                placeholder="I'm sorry, I didn't catch that. Could you please repeat?"
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={formState.is_active}
                onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
              />
              <span className="font-medium">Voice agent is active</span>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2 text-sm text-slate-400">
                {message ? <p className="text-emerald-300">{message}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {editingId && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => deleteAgent(voiceAgents.find((a) => a.id === editingId)!)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {editingId ? "Save changes" : "Create voice agent"}
                </Button>
              </div>
            </div>
          </form>
        </section>

        {/* List */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-primary-300">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Voice Agents</h2>
              <p className="text-sm text-slate-400">
                Manage your voice-native AI agents.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">
                Loading...
              </div>
            ) : voiceAgents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                <Phone className="mx-auto mb-4 h-10 w-10 text-amber-300" />
                <p className="text-sm">
                  No voice agents yet. Create one to enable voice calls with AI agents.
                </p>
              </div>
            ) : (
              voiceAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={`rounded-3xl border p-5 ${
                    agent.is_active
                      ? "border-slate-800 bg-slate-900/80"
                      : "border-slate-800 bg-slate-900/50 opacity-60"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="truncate text-lg font-semibold text-white">{agent.name}</h3>
                        {!agent.is_active && (
                          <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs text-slate-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-400">
                        {agent.description || "No description"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {agent.enable_inbound && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                            <Phone className="mr-1 inline h-3 w-3" />
                            Inbound
                          </span>
                        )}
                        {agent.enable_outbound && (
                          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300">
                            <Phone className="mr-1 inline h-3 w-3" />
                            Outbound
                          </span>
                        )}
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {agent.max_duration_minutes}min
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleAgent(agent)}>
                        {agent.is_active ? "Disable" : "Enable"}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => populateForm(agent)}>
                        <Settings className="h-4 w-4" /> Edit
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