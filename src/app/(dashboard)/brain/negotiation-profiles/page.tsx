"use client";

import { useEffect, useState } from 'react';
import { RefreshCw, Handshake, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface NegotiationProfile {
  id: string;
  contact_id: string;
  risk_tolerance: string;
  price_sensitivity: string;
  decision_timeline: string | null;
  preferred_concession: string | null;
  objection_history: string[];
  negotiation_strategy: string | null;
  created_at: string;
}

const levelColors: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-300',
  medium: 'bg-amber-500/10 text-amber-300',
  high: 'bg-red-500/10 text-red-300',
};

export default function NegotiationProfilesPage() {
  const { profileLoading } = useAuth();
  const [profiles, setProfiles] = useState<NegotiationProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    try {
      const response = await fetch('/api/brain/negotiation-profiles');
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error);
      setProfiles(Array.isArray(data.profiles) ? data.profiles : []);
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
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">Negotiation Engine</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Contact negotiation profiles.
            </h1>
          </div>
          <Button variant="ghost" onClick={loadProfiles}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
        <p className="max-w-3xl text-slate-400">
          Per-contact negotiation strategies including risk tolerance, price sensitivity, and objection tracking.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total profiles</p>
          <p className="mt-3 text-3xl font-semibold text-white">{profiles.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">High risk tolerance</p>
          <p className="mt-3 text-3xl font-semibold text-red-300">{profiles.filter(p => p.risk_tolerance === 'high').length}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">High price sensitivity</p>
          <p className="mt-3 text-3xl font-semibold text-red-300">{profiles.filter(p => p.price_sensitivity === 'high').length}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="flex items-center gap-3 text-white mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Handshake className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Negotiation profiles</h2>
            <p className="text-sm text-slate-400">Per-contact negotiation characteristics.</p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading profiles...</p>
          ) : profiles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-primary-300" />
              <p>No negotiation profiles yet. Profiles are built as agents interact with contacts.</p>
            </div>
          ) : (
            profiles.map((profile) => (
              <div key={profile.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">Contact Profile</h3>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">Risk Tolerance</p>
                        <p className={`mt-1 rounded-full px-2.5 py-1 text-xs font-semibold inline-block ${levelColors[profile.risk_tolerance]}`}>
                          {profile.risk_tolerance}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">Price Sensitivity</p>
                        <p className={`mt-1 rounded-full px-2.5 py-1 text-xs font-semibold inline-block ${levelColors[profile.price_sensitivity]}`}>
                          {profile.price_sensitivity}
                        </p>
                      </div>
                      {profile.decision_timeline && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500">Decision Timeline</p>
                          <p className="mt-1 text-sm text-white">{profile.decision_timeline}</p>
                        </div>
                      )}
                      {profile.preferred_concession && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500">Preferred Concession</p>
                          <p className="mt-1 text-sm text-white">{profile.preferred_concession}</p>
                        </div>
                      )}
                    </div>
                    {profile.objection_history && profile.objection_history.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Objection History</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {profile.objection_history.map((obj, i) => (
                            <span key={i} className="rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-xs text-slate-400">
                              {obj}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.negotiation_strategy && (
                      <div className="mt-3">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Strategy</p>
                        <p className="mt-1 text-sm text-primary-300">{profile.negotiation_strategy}</p>
                      </div>
                    )}
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