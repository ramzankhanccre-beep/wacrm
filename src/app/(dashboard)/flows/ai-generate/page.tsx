"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, Loader2, Zap, FileText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const EXAMPLE_PROMPTS = [
  "Create a lead qualification flow that asks about budget and timeline",
  "Build a support triage flow with options for billing and technical",
  "Make a welcome onboarding flow for new contacts",
  "Create a daily appointment reminder flow",
  "Build an abandoned cart recovery flow",
];

export default function AIWorkflowGeneratorPage() {
  const router = useRouter();
  const { profileLoading } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedFlow, setGeneratedFlow] = useState<Record<string, unknown> | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/flows/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate workflow');
      }

      setGeneratedFlow(data.flow);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate';
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  }

  async function handleCreateFlow() {
    if (!generatedFlow) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generatedFlow.name as string,
          description: generatedFlow.description as string,
          trigger_type: generatedFlow.trigger_type as string,
          trigger_config: generatedFlow.trigger_config as Record<string, unknown>,
          nodes: generatedFlow.nodes as Record<string, unknown>[],
          edges: generatedFlow.edges as Record<string, unknown>[],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Failed to create flow');

      toast.success('Flow created successfully!');
      router.push(`/flows/${data.flow.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create flow';
      toast.error(msg);
    } finally {
      setGenerating(false);
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
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-4xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">Workflow Automation</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              AI Workflow Generator
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-slate-400">
          Describe what you want in plain English. AI will generate a complete workflow you can customize.
        </p>
      </div>

      {/* Prompt Input */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <label className="text-sm text-slate-200 mb-2 block">
          Describe your workflow
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="e.g., Create a lead qualification flow that asks about budget and timeline, then tags hot leads"
          className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Be specific about triggers, questions, conditions, and actions
          </p>
          <Button onClick={handleGenerate} disabled={generating || !prompt.trim()}>
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Generate Workflow
          </Button>
        </div>
      </div>

      {/* Example Prompts */}
      <div>
        <p className="text-sm text-slate-400 mb-3">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example, i) => (
            <button
              key={i}
              onClick={() => setPrompt(example)}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-primary/50 hover:text-white"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Flow Preview */}
      {generatedFlow && (
        <div className="rounded-3xl border border-primary/50 bg-primary/5 p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generated Workflow
            </h2>
            <Button onClick={handleCreateFlow} disabled={generating}>
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Flow <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-xs text-slate-500 uppercase">Name</p>
                <p className="mt-1 font-medium text-white">{generatedFlow.name as string}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-xs text-slate-500 uppercase">Trigger</p>
                <p className="mt-1 font-medium text-white">{generatedFlow.trigger_type as string}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs text-slate-500 uppercase mb-2">Nodes</p>
              <div className="space-y-2">
                {(generatedFlow.nodes as Record<string, unknown>[]).map((node: Record<string, unknown>, i: number) => {
                  const cfg = node.config as Record<string, unknown> | undefined;
                  const question = cfg?.question as string | undefined;
                  return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-400">
                      {i + 1}
                    </span>
                    <span className="text-white">{String(node.node_type)}</span>
                    {question && (
                      <span className="text-slate-400 truncate">- {question}</span>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}