"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Volume2,
  RefreshCw,
  Save,
  Trash2,
  Plus,
  Play,
  Pause,
  Globe,
  User,
  Gauge,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface TTSConfig {
  id: string;
  provider: string;
  voice_id: string;
  voice_name: string;
  language: string;
  speed: number;
  pitch: number;
  enable_ssml: boolean;
  is_default: boolean;
  is_active: boolean;
}

interface Voice {
  id: string;
  name: string;
  gender: "male" | "female" | "neutral";
  language: string;
  preview_url: string | null;
}

const PROVIDERS = [
  { value: "openai", label: "OpenAI TTS", voices: [] },
  { value: "google", label: "Google Cloud TTS", voices: [] },
  { value: "elevenlabs", label: "ElevenLabs", voices: [] },
  { value: "amazon", label: "Amazon Polly", voices: [] },
];

const PRESET_VOICES: Voice[] = [
  { id: "alloy", name: "Alloy", gender: "neutral", language: "en", preview_url: null },
  { id: "echo", name: "Echo", gender: "male", language: "en", preview_url: null },
  { id: "fable", name: "Fable", gender: "male", language: "en", preview_url: null },
  { id: "onyx", name: "Onyx", gender: "male", language: "en", preview_url: null },
  { id: "nova", name: "Nova", gender: "female", language: "en", preview_url: null },
  { id: "shimmer", name: "Shimmer", gender: "female", language: "en", preview_url: null },
  { id: "ar-Standard-A", name: "Arabic Male", gender: "male", language: "ar", preview_url: null },
  { id: "ar-Standard-B", name: "Arabic Female", gender: "female", language: "ar", preview_url: null },
  { id: "fr-Standard-A", name: "French Male", gender: "male", language: "fr", preview_url: null },
  { id: "fr-Standard-B", name: "French Female", gender: "female", language: "fr", preview_url: null },
];

const LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "ar-SA", label: "Arabic" },
  { value: "fr-FR", label: "French" },
  { value: "es-ES", label: "Spanish" },
  { value: "de-DE", label: "German" },
  { value: "zh-CN", label: "Chinese" },
  { value: "ja-JP", label: "Japanese" },
  { value: "pt-BR", label: "Portuguese" },
  { value: "ru-RU", label: "Russian" },
  { value: "hi-IN", label: "Hindi" },
];

export default function TextToSpeechPage() {
  const { profileLoading } = useAuth();
  const [configs, setConfigs] = useState<TTSConfig[]>([]);
  const [voices, setVoices] = useState<Voice[]>(PRESET_VOICES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    provider: "openai",
    voice_id: "alloy",
    voice_name: "Alloy",
    language: "en-US",
    speed: 1.0,
    pitch: 0,
    enable_ssml: true,
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
      const response = await fetch("/api/voice/tts");
      const data = await response.json();
      setConfigs(Array.isArray(data.configs) ? data.configs : []);
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
      const response = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to save");

      setMessage("TTS configuration saved successfully");
      setShowForm(false);
      setFormState({
        provider: "openai",
        voice_id: "alloy",
        voice_name: "Alloy",
        language: "en-US",
        speed: 1.0,
        pitch: 0,
        enable_ssml: true,
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

  async function deleteConfig(config: TTSConfig) {
    if (!confirm(`Delete this TTS configuration?`)) return;
    try {
      const response = await fetch(`/api/voice/tts?configId=${config.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      await loadData();
    } catch (err) {
      toast.error("Failed to delete configuration");
    }
  }

  async function toggleConfig(config: TTSConfig) {
    try {
      const response = await fetch(`/api/voice/tts/${config.id}`, {
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

  function previewVoice(voiceId: string) {
    // In production, this would play the actual voice preview
    setPlayingVoice(voiceId);
    setTimeout(() => setPlayingVoice(null), 2000);
  }

  const maleVoices = voices.filter((v) => v.gender === "male");
  const femaleVoices = voices.filter((v) => v.gender === "female");
  const neutralVoices = voices.filter((v) => v.gender === "neutral");

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
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">
              Voice Intelligence
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Text to Speech
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
          Configure text-to-speech providers and voices for converting agent text responses to
          natural-sounding voice.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Voices</p>
          <p className="mt-3 text-3xl font-semibold text-white">{voices.length}</p>
          <p className="mt-2 text-sm text-slate-400">Available</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Languages</p>
          <p className="mt-3 text-3xl font-semibold text-white">{LANGUAGES.length}</p>
          <p className="mt-2 text-sm text-slate-400">Supported</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Configs</p>
          <p className="mt-3 text-3xl font-semibold text-white">{configs.length}</p>
          <p className="mt-2 text-sm text-slate-400">Configured</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Status</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-400">Ready</p>
          <p className="mt-2 text-sm text-slate-400">TTS enabled</p>
        </div>
      </div>

      {showForm && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
          <div className="flex items-center gap-3 text-white mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create TTS Configuration</h2>
              <p className="text-sm text-slate-400">
                Set up a text-to-speech provider and voice for your agents.
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={submitForm}>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Provider</label>
                <select
                  value={formState.provider}
                  onChange={(e) => setFormState({ ...formState, provider: e.target.value })}
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
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">
                <User className="mr-2 inline h-4 w-4" />
                Voice
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Female</p>
                  <div className="space-y-1">
                    {femaleVoices.slice(0, 3).map((voice) => (
                      <button
                        key={voice.id}
                        type="button"
                        onClick={() =>
                          setFormState({
                            ...formState,
                            voice_id: voice.id,
                            voice_name: voice.name,
                          })
                        }
                        className={`w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-left text-sm transition ${
                          formState.voice_id === voice.id
                            ? "border-primary bg-primary/10"
                            : "hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white">{voice.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              previewVoice(voice.id);
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            {playingVoice === voice.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Male</p>
                  <div className="space-y-1">
                    {maleVoices.slice(0, 3).map((voice) => (
                      <button
                        key={voice.id}
                        type="button"
                        onClick={() =>
                          setFormState({
                            ...formState,
                            voice_id: voice.id,
                            voice_name: voice.name,
                          })
                        }
                        className={`w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-left text-sm transition ${
                          formState.voice_id === voice.id
                            ? "border-primary bg-primary/10"
                            : "hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white">{voice.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              previewVoice(voice.id);
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            {playingVoice === voice.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Neutral</p>
                  <div className="space-y-1">
                    {neutralVoices.slice(0, 3).map((voice) => (
                      <button
                        key={voice.id}
                        type="button"
                        onClick={() =>
                          setFormState({
                            ...formState,
                            voice_id: voice.id,
                            voice_name: voice.name,
                          })
                        }
                        className={`w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-left text-sm transition ${
                          formState.voice_id === voice.id
                            ? "border-primary bg-primary/10"
                            : "hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white">{voice.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              previewVoice(voice.id);
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            {playingVoice === voice.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">
                  <Gauge className="mr-2 inline h-4 w-4" />
                  Speed: {formState.speed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={formState.speed}
                  onChange={(e) => setFormState({ ...formState, speed: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0.5x</span>
                  <span>2.0x</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Pitch: {formState.pitch}</label>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={formState.pitch}
                  onChange={(e) => setFormState({ ...formState, pitch: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>-12</span>
                  <span>+12</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={formState.enable_ssml}
                  onChange={(e) => setFormState({ ...formState, enable_ssml: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
                />
                <Sparkles className="h-4 w-4" />
                Enable SSML (advanced voice control)
              </label>
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
        <h2 className="text-xl font-semibold text-white mb-4">Voice Configurations</h2>
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : configs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <Volume2 className="mx-auto mb-4 h-10 w-10 text-amber-300" />
              <p>No TTS configurations yet. Create your first one to enable voice synthesis.</p>
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
                      <Volume2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{config.voice_name}</h3>
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
                        Provider: {config.provider} • Language: {config.language} • Speed:{" "}
                        {config.speed}x
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {config.enable_ssml && (
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                            SSML enabled
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
    </main>
  );
}