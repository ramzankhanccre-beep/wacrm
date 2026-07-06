"use client";

import { useEffect, useState } from 'react';
import { RefreshCw, Stars, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface IntentPrediction {
  id: string;
  contact_id: string;
  predicted_intent: string;
  confidence_score: number;
  next_best_action: string | null;
  is_active: boolean;
  created_at: string;
}

export default function IntentPredictionsPage() {
  const { profileLoading } = useAuth();
  const [predictions, setPredictions] = useState<IntentPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  async function loadPredictions() {
    setLoading(true);
    try {
      const response = await fetch('/api/brain/intent-predictions');
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error);
      setPredictions(Array.isArray(data.predictions) ? data.predictions : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">Intent Prediction</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              AI-predicted contact intent.
            </h1>
          </div>
          <Button variant="ghost" onClick={loadPredictions}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
        <p className="max-w-3xl text-slate-400">
          Predicted intents and next best actions based on conversation analysis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total predictions</p>
          <p className="mt-3 text-3xl font-semibold text-white">{predictions.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active predictions</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-300">{predictions.filter(p => p.is_active).length}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Avg confidence</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {predictions.length > 0
              ? Math.round(predictions.reduce((s, p) => s + p.confidence_score, 0) / predictions.length * 100)
              : 0}%
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="flex items-center gap-3 text-white mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Stars className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Intent predictions</h2>
            <p className="text-sm text-slate-400">Recent predictions for contacts.</p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading predictions...</p>
          ) : predictions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <Lightbulb className="mx-auto mb-4 h-10 w-10 text-primary-300" />
              <p>No predictions yet. Intent predictions are generated as conversations happen.</p>
            </div>
          ) : (
            predictions.map((pred) => (
              <div key={pred.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{pred.predicted_intent}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${pred.is_active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                        {pred.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {pred.next_best_action && (
                      <p className="mt-2 text-sm text-slate-400">Next best action: {pred.next_best_action}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      Confidence: {Math.round(pred.confidence_score * 100)}% • {new Date(pred.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-2 w-24 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pred.confidence_score * 100}%` }}
                    />
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