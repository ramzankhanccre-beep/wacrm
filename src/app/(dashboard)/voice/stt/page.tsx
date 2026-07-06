"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Mic,
  RefreshCw,
  Save,
  Trash2,
  Plus,
  Globe,
  Users,
  Volume2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface STTConfig {
  id: string;
  provider: string;
  model: string;
  language: string;
  enable_diarization: boolean;
  enable_punctuation: boolean;
  is_default: boolean;
  is_active: boolean;
}

const PROVIDERS = [
  { value: "openai", label: "OpenAI Whisper", models: ["whisper-1"] },
  { value: "google", label: "Google Cloud Speech", models: ["latest", "default"] },
  { value: "assemblyai", label: "AssemblyAI", models: ["best", "fast"] },
];

const LANGUAGES = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "hi", label: "Hindi" },
];

interface TranscriptionLog {
  id: string;
  audio_url: string;
  duration_seconds: number;
  language: string;
  transcript: string;
  speakers_detected: number;
  created_at: string;
}

export default function SpeechToTextPage() {
  const { profileLoading } = useAuth();
  const [configs, setConfigs] = useState<STTConfig[]>([]);
  const [logs, setLogs] = useState<TranscriptionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({
    provider: "openai",
    model: "whisper-1",
    language: "auto",
    enable_diarization: true,
    enable_punctuation: true,
    is_default: true,
    is_active: true,
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [configRes, logsRes] = await Promise.all([
        fetch("/api/voice/stt"),
        fetch("/api/voice/stt/logs"),
      ]);

      const configData = await configRes.json();
      const logsData = await logsRes.json();

      setConfigs(Array.isArray(configData.configs) ? configData.configs : []);
      setLogs(Array.isArray(logsData.logs) ? logsData.logs : []);
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
      const response = await fetch("/api/voice/stt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to save");

      setMessage("STT configuration saved successfully");
      setShowForm(false);
      setFormState({
        provider: "openai",
        model: "whisper-1",
        language: "auto",
        enable_diarization: true,
        enable_punctuation: true,
        is_default: true,
        is_active: true,
      });
      await loadData();
    } catch (err) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  }

  async function deleteConfig(config: STTConfig) {
    if (!confirm(`Delete this STT configuration?`)) return;
    try {
      const response = await fetch(`/api/voice/stt?configId=${config.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      await loadData();
    } catch (err) {
      toast.error("Failed to delete configuration");
    }
  }

  async function toggleConfig(config: STTConfig) {
    try {
      const response = await fetch(`/api/voice/stt/${config.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !config.is_active }),
      });
      if (!response.ok) throw new Error("Failed to update");
      await loadData();
    } catch (err) {
      toast.error("Failed to update configuration");
    }
  }

  function getProviderLabel(provider: string) {
    return PROVIDERS.find((p) => p.value === provider)?.label || provider;
  }

  function getLanguageLabel(code: string) {
    return LANGUAGES.find((l) => l.value === code)?.label || code;
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeConfigs = configs.filter((c) => c.is_active).length;
  const totalTranscriptions = logs.length;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">
              Voice Intelligence
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Speech to Text
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4" /> New Config
            </Button>
            <Button variant="ghost" onClick={loadData}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Configure speech-to-text providers for transcribing voice messages and call audio in
          real time.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Configs</p>
          <p className="mt-3 text-3xl font-semibold text-white">{configs.length}</p>
          <p className="mt-2 text-sm text-slate-400">Total configured</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-400">{activeConfigs}</p>
          <p className="mt-2 text-sm text-slate-400">Ready to transcribe</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Transcriptions</p>
          <p className="mt-3 text-3xl font-semibold text-white">{totalTranscriptions}</p>
          <p className="mt-2 text-sm text-slate-400">Total processed</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Languages</p>
          <p className="mt-3 text-3xl font-semibold text-white">{LANGUAGES.length - 1}+</p>
          <p className="mt-2 text-sm text-slate-400">Supported</p>
        </div>
      </div>

      {showForm && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
          <div className="flex items-center gap-3 text-white mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create STT Configuration</h2>
              <p className="text-sm text-slate-400">
                Set up a speech-to-text provider for voice transcription.
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={submitForm}>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Provider</label>
                <select
                  value={formState.provider}
                  onChange={(e) => {
                    const provider = PROVIDERS.find((p) => p.value === e.target.value);
                    setFormState({
                      ...formState,
                      provider: e.target.value,
                      model: provider?.models[0] || "",
                    });
                  }}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
                >
                  {PROVIDERS.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Model</label>
                <select
                  value={formState.model}
                  onChange={(e) => setFormState({ ...formState, model: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
                >
                  {PROVIDERS.find((p) => p.value === formState.provider)?.models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">
                <Globe className="mr-2 inline h-4 w-4" />
                Language
              </label>
              <select
                value={formState.language}
                onChange={(e) => setFormState({ ...formState, language: e.target.value })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
              <label className="text-sm font-medium text-white">Advanced Options</label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={formState.enable_diarization}
                    onChange={(e) =>
                      setFormState({ ...formState, enable_diarization: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
                  />
                  <Users className="h-4 w-4" />
                  Speaker diarization
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={formState.enable_punctuation}
                    onChange={(e) =>
                      setFormState({ ...formState, enable_punctuation: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
                  />
                  <Volume2 className="h-4 w-4" />
                  Auto punctuation
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={formState.is_default}
                  onChange={(e) => setFormState({ ...formState, is_default: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
                />
                Set as default
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={formState.is_active}
                  onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
                />
                Active
              </label>
            </div>

            <div className="flex gap-3">
              {message && <p className="text-sm text-emerald-300">{message}</p>}
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" /> Save Configuration
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : configs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <Mic className="mx-auto mb-4 h-10 w-10 text-amber-300" />
              <p>No STT configurations yet. Create your first one to enable voice transcription.</p>
            </div>
          ) : (
            configs.map((config) => (
              <div
                key={config.id}
                className={`rounded-3xl border p-5 ${
                  config.is_active
                    ? "border-slate-800 bg-slate-900/80"
                    : "border-slate-800 bg-slate-900/50 opacity-60"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mic className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {getProviderLabel(config.provider)}
                        </h3>
                        {config.is_default && (
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                            Default
                          </span>
                        )}
                        {!config.is_active && (
                          <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs text-slate-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        Model: {config.model} • Language: {getLanguageLabel(config.language)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {config.enable_diarization && (
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                            <Users className="mr-1 inline h-3 w-3" />
                            Diarization
                          </span>
                        )}
                        {config.enable_punctuation && (
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                            <Volume2 className="mr-1 inline h-3 w-3" />
                            Punctuation
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleConfig(config)}>
                      {config.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteConfig(config)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {logs.length > 0 && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Transcriptions</h2>
          <div className="space-y-3">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-300 line-clamp-2">{log.transcript}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {log.duration_seconds}s • {log.language} • {log.speakers_detected} speaker
                      {log.speakers_detected !== 1 ? "s" : ""} •{" "}
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}