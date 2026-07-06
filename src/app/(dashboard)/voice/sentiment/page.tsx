"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  RefreshCw,
  Save,
  Trash2,
  Plus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Frown,
  Meh,
  Zap,
  AlertOctagon,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface SentimentConfig {
  id: string;
  name: string;
  provider: string;
  enable_real_time: boolean;
  negative_threshold: number;
  auto_escalate_on_negative: boolean;
  alert_channels: string[];
  is_active: boolean;
}

interface SentimentLog {
  id: string;
  call_id: string;
  agent_id: string | null;
  sentiment_score: number;
  emotion: string;
  confidence: number;
  transcript_segment: string;
  created_at: string;
  agent?: { name: string };
}

const EMOTION_ICONS: Record<string, typeof Heart> = {
  positive: Heart,
  negative: Frown,
  neutral: Meh,
  excited: Zap,
  frustrated: AlertTriangle,
};

const EMOTION_COLORS: Record<string, string> = {
  positive: "text-emerald-400",
  negative: "text-red-400",
  neutral: "text-slate-400",
  excited: "text-yellow-400",
  frustrated: "text-orange-400",
};

const PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "elevenlabs", label: "ElevenLabs" },
  { value: "custom", label: "Custom Provider" },
];

export default function VoiceSentimentPage() {
  const { profileLoading } = useAuth();
  const [configs, setConfigs] = useState<SentimentConfig[]>([]);
  const [logs, setLogs] = useState<SentimentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    provider: "openai",
    enable_real_time: true,
    negative_threshold: 0.3,
    auto_escalate_on_negative: true,
    alert_channels: [] as string[],
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
        fetch("/api/voice/sentiment"),
        fetch("/api/voice/sentiment/logs"),
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
      const response = await fetch("/api/voice/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to save");

      setMessage("Sentiment configuration saved successfully");
      setShowForm(false);
      setFormState({
        name: "",
        provider: "openai",
        enable_real_time: true,
        negative_threshold: 0.3,
        auto_escalate_on_negative: true,
        alert_channels: [],
        is_active: true,
      });
      await loadData();
    } catch (err) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  }

  async function deleteConfig(config: SentimentConfig) {
    if (!confirm(`Delete this sentiment configuration?`)) return;
    try {
      const response = await fetch(`/api/voice/sentiment?configId=${config.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      await loadData();
    } catch (err) {
      toast.error("Failed to delete configuration");
    }
  }

  async function toggleConfig(config: SentimentConfig) {
    try {
      const response = await fetch(`/api/voice/sentiment/${config.id}`, {
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

  function getSentimentLabel(score: number): string {
    if (score >= 0.6) return "Positive";
    if (score >= 0.3) return "Neutral";
    if (score >= 0) return "Mixed";
    return "Negative";
  }

  function getSentimentColor(score: number): string {
    if (score >= 0.6) return "text-emerald-400";
    if (score >= 0.3) return "text-yellow-400";
    if (score >= 0) return "text-orange-400";
    return "text-red-400";
  }

  function getTrendIcon(score: number) {
    if (score > 0.1) return TrendingUp;
    if (score < -0.1) return TrendingDown;
    return Minus;
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeConfigs = configs.filter((c) => c.is_active).length;
  const totalAnalyses = logs.length;
  const avgSentiment = logs.length > 0
    ? logs.reduce((sum, log) => sum + log.sentiment_score, 0) / logs.length
    : 0;
  const negativeCount = logs.filter((l) => l.sentiment_score < 0.3).length;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">
              Voice Intelligence
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Voice Sentiment
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
          Analyse tone and emotion in real-time during voice calls. Display sentiment to supervisors
          and trigger automatic escalations on negative sentiment.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-400">{activeConfigs}</p>
          <p className="mt-2 text-sm text-slate-400">Configs monitoring</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Analyses</p>
          <p className="mt-3 text-3xl font-semibold text-white">{totalAnalyses}</p>
          <p className="mt-2 text-sm text-slate-400">Total processed</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Avg Score</p>
          <p className={`mt-3 text-3xl font-semibold ${getSentimentColor(avgSentiment)}`}>
            {avgSentiment > 0 ? "+" : ""}
            {avgSentiment.toFixed(2)}
          </p>
          <p className="mt-2 text-sm text-slate-400">{getSentimentLabel(avgSentiment)}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Negative</p>
          <p className="mt-3 text-3xl font-semibold text-red-400">{negativeCount}</p>
          <p className="mt-2 text-sm text-slate-400">Need attention</p>
        </div>
      </div>

      {showForm && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
          <div className="flex items-center gap-3 text-white mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create Sentiment Configuration</h2>
              <p className="text-sm text-slate-400">
                Set up real-time sentiment analysis for voice calls.
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={submitForm}>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Name</label>
                <input
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"
                  placeholder="e.g. Sales Calls Monitor"
                />
              </div>
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
            </div>

            <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
              <label className="text-sm font-medium text-white">Analysis Settings</label>
              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={formState.enable_real_time}
                  onChange={(e) =>
                    setFormState({ ...formState, enable_real_time: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
                />
                Enable real-time sentiment analysis
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">
                  Negative Threshold: {formState.negative_threshold}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formState.negative_threshold}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      negative_threshold: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Scores below this trigger negative sentiment alerts
                </p>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={formState.auto_escalate_on_negative}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        auto_escalate_on_negative: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary"
                  />
                  Auto-escalate on negative sentiment
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
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
        <h2 className="text-xl font-semibold text-white mb-4">Sentiment Configurations</h2>
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : configs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <Activity className="mx-auto mb-4 h-10 w-10 text-amber-300" />
              <p>No sentiment configurations yet. Create one to enable voice sentiment analysis.</p>
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
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{config.name}</h3>
                        {!config.is_active && (
                          <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs text-slate-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        Provider: {config.provider} • Threshold: {config.negative_threshold}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {config.enable_real_time && (
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                            Real-time
                          </span>
                        )}
                        {config.auto_escalate_on_negative && (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-300">
                            Auto-escalate
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
          <h2 className="text-xl font-semibold text-white mb-4">Recent Sentiment Analyses</h2>
          <div className="space-y-3">
            {logs.slice(0, 15).map((log) => {
              const EmotionIcon = EMOTION_ICONS[log.emotion] || Meh;
              const TrendIcon = getTrendIcon(log.sentiment_score);
              return (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          log.sentiment_score < 0.3
                            ? "bg-red-500/10 text-red-400"
                            : log.sentiment_score > 0.6
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        <EmotionIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">
                            {log.agent?.name || "Unknown Agent"}
                          </p>
                          <span className={`text-xs ${getSentimentColor(log.sentiment_score)}`}>
                            {getSentimentLabel(log.sentiment_score)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400 line-clamp-1">
                          "{log.transcript_segment}"
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(log.created_at).toLocaleString()} • Confidence:{" "}
                          {(log.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendIcon
                        className={`h-5 w-5 ${
                          log.sentiment_score > 0.1
                            ? "text-emerald-400"
                            : log.sentiment_score < -0.1
                            ? "text-red-400"
                            : "text-slate-400"
                        }`}
                      />
                      <span className={getSentimentColor(log.sentiment_score)}>
                        {log.sentiment_score > 0 ? "+" : ""}
                        {log.sentiment_score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}