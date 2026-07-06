"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Brain,
  RefreshCw,
  Search,
  FileText,
  Phone,
  Calendar,
  User,
  MessageSquare,
  Tag,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface VoiceMemoryEntry {
  id: string;
  contact_id: string;
  call_id: string;
  entry_type: "summary" | "key_phrase" | "commitment" | "action_item";
  content: string;
  importance: number;
  created_at: string;
  contact?: { name: string; phone: string };
  call?: { started_at: string; duration_seconds: number };
}

interface VoiceTranscript {
  id: string;
  contact_id: string;
  call_id: string;
  audio_url: string | null;
  transcript: string;
  summary: string | null;
  key_phrases: string[];
  duration_seconds: number;
  created_at: string;
  contact?: { name: string; phone: string };
}

export default function VoiceMemoryPage() {
  const { profileLoading } = useAuth();
  const [entries, setEntries] = useState<VoiceMemoryEntry[]>([]);
  const [transcripts, setTranscripts] = useState<VoiceTranscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"entries" | "transcripts">("entries");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [entriesRes, transcriptsRes] = await Promise.all([
        fetch("/api/voice/memory/entries"),
        fetch("/api/voice/memory/transcripts"),
      ]);

      const entriesData = await entriesRes.json();
      const transcriptsData = await transcriptsRes.json();

      setEntries(Array.isArray(entriesData.entries) ? entriesData.entries : []);
      setTranscripts(Array.isArray(transcriptsData.transcripts) ? transcriptsData.transcripts : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEntry(entry: VoiceMemoryEntry) {
    if (!confirm("Delete this memory entry?")) return;
    try {
      const response = await fetch(`/api/voice/memory/entries?entryId=${entry.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      await loadData();
    } catch (err) {
      toast.error("Failed to delete entry");
    }
  }

  const filteredEntries = entries.filter(
    (entry) =>
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTranscripts = transcripts.filter(
    (t) =>
      t.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const summaryCount = entries.filter((e) => e.entry_type === "summary").length;
  const keyPhraseCount = entries.filter((e) => e.entry_type === "key_phrase").length;
  const commitmentCount = entries.filter((e) => e.entry_type === "commitment").length;
  const actionItemCount = entries.filter((e) => e.entry_type === "action_item").length;

  function getEntryTypeIcon(type: string) {
    switch (type) {
      case "summary":
        return FileText;
      case "key_phrase":
        return Tag;
      case "commitment":
        return User;
      case "action_item":
        return Calendar;
      default:
        return MessageSquare;
    }
  }

  function getEntryTypeColor(type: string): string {
    switch (type) {
      case "summary":
        return "text-blue-400 bg-blue-500/10";
      case "key_phrase":
        return "text-purple-400 bg-purple-500/10";
      case "commitment":
        return "text-emerald-400 bg-emerald-500/10";
      case "action_item":
        return "text-orange-400 bg-orange-500/10";
      default:
        return "text-slate-400 bg-slate-500/10";
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
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">
              Voice Intelligence
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Voice Memory
            </h1>
          </div>
          <Button variant="ghost" onClick={loadData}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
        <p className="max-w-3xl text-slate-400">
          Extract key phrases, commitments, and information from calls. Automatically generate
          post-call summaries stored in Customer Memory.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-5">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Entries</p>
          <p className="mt-3 text-3xl font-semibold text-white">{entries.length}</p>
          <p className="mt-2 text-sm text-slate-400">Memory entries</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Summaries</p>
          <p className="mt-3 text-3xl font-semibold text-blue-400">{summaryCount}</p>
          <p className="mt-2 text-sm text-slate-400">Call summaries</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Key Phrases</p>
          <p className="mt-3 text-3xl font-semibold text-purple-400">{keyPhraseCount}</p>
          <p className="mt-2 text-sm text-slate-400">Extracted phrases</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Commitments</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-400">{commitmentCount}</p>
          <p className="mt-2 text-sm text-slate-400">Promises made</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Action Items</p>
          <p className="mt-3 text-3xl font-semibold text-orange-400">{actionItemCount}</p>
          <p className="mt-2 text-sm text-slate-400">Tasks to do</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setView("entries")}
            className={`px-4 py-2 text-sm font-medium transition ${
              view === "entries" ? "border-b-2 border-primary text-white" : "text-slate-400"
            }`}
          >
            Memory Entries ({entries.length})
          </button>
          <button
            onClick={() => setView("transcripts")}
            className={`px-4 py-2 text-sm font-medium transition ${
              view === "transcripts" ? "border-b-2 border-primary text-white" : "text-slate-400"
            }`}
          >
            Transcripts ({transcripts.length})
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search memory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 sm:w-64"
          />
        </div>
      </div>

      {view === "entries" && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-400">Loading...</p>
            ) : filteredEntries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                <Brain className="mx-auto mb-4 h-10 w-10 text-amber-300" />
                <p>
                  {searchQuery
                    ? "No entries match your search."
                    : "No voice memory entries yet. Calls will be processed and stored here."}
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const TypeIcon = getEntryTypeIcon(entry.entry_type);
                return (
                  <div
                    key={entry.id}
                    className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getEntryTypeColor(
                            entry.entry_type
                          )}`}
                        >
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${getEntryTypeColor(
                                entry.entry_type
                              )}`}
                            >
                              {entry.entry_type.replace("_", " ")}
                            </span>
                            <span className="text-sm text-slate-500">
                              {entry.contact?.name || "Unknown Contact"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-white">{entry.content}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            {entry.call?.started_at &&
                              new Date(entry.call.started_at).toLocaleString()}
                            {entry.call?.duration_seconds && (
                              <> • {Math.floor(entry.call.duration_seconds / 60)}min</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntry(entry)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {view === "transcripts" && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-400">Loading...</p>
            ) : filteredTranscripts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
                <FileText className="mx-auto mb-4 h-10 w-10 text-amber-300" />
                <p>
                  {searchQuery
                    ? "No transcripts match your search."
                    : "No call transcripts yet. Voice calls will be transcribed here."}
                </p>
              </div>
            ) : (
              filteredTranscripts.map((transcript) => (
                <div
                  key={transcript.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {transcript.contact?.name || "Unknown Contact"}
                          </p>
                          <p className="text-sm text-slate-400">
                            {transcript.contact?.phone || "No phone"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        <p>{new Date(transcript.created_at).toLocaleString()}</p>
                        <p>{Math.floor(transcript.duration_seconds / 60)}min duration</p>
                      </div>
                    </div>

                    {transcript.summary && (
                      <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
                        <p className="text-xs font-semibold uppercase text-slate-500">Summary</p>
                        <p className="mt-1 text-sm text-white">{transcript.summary}</p>
                      </div>
                    )}

                    {transcript.key_phrases.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {transcript.key_phrases.map((phrase, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-300"
                          >
                            {phrase}
                          </span>
                        ))}
                      </div>
                    )}

                    <details className="cursor-pointer">
                      <summary className="text-sm text-primary hover:text-primary/80">
                        View full transcript
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-400">
                        {transcript.transcript}
                      </p>
                    </details>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
}