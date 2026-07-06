"use client";

import {
  Mic,
  Mic2,
  Volume2,
  Headphones,
  Brain,
  MessageSquare,
  Phone,
  Activity,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voice Intelligence — Brand Reach Solutions",
  description:
    "Phase 6 Voice Intelligence Platform: Speech-to-text, text-to-speech, voice agents, sentiment analysis, and voice memory.",
};

const voiceModules = [
  {
    title: "Speech to Text",
    description:
      "Transcribe inbound voice messages and call audio in real time. Supports Arabic, English, French, and all major languages.",
    icon: Mic,
    status: "Live",
    href: "/voice/stt",
    features: ["Real-time transcription", "Speaker diarization", "Multi-language support"],
  },
  {
    title: "Text to Speech",
    description:
      "Convert agent text responses to natural-sounding voice. Select voice profile per agent with gender, accent, and pace control.",
    icon: Volume2,
    status: "Live",
    href: "/voice/tts",
    features: ["Natural voices", "SSML support", "Voice cloning ready"],
  },
  {
    title: "Voice Agents",
    description:
      "Full voice-native AI agents that can handle inbound and outbound phone calls with interruption handling and silence detection.",
    icon: Phone,
    status: "Live",
    href: "/voice/agents",
    features: ["Inbound calls", "Outbound calls", "Interruption handling"],
  },
  {
    title: "Voice Sentiment",
    description:
      "Analyse tone and emotion in real-time during voice calls. Display sentiment to human supervisors and trigger automatic escalations.",
    icon: Activity,
    status: "Live",
    href: "/voice/sentiment",
    features: ["Real-time analysis", "Emotion detection", "Auto-escalation"],
  },
  {
    title: "Voice Memory",
    description:
      "Extract key phrases, commitments, and information from calls. Automatically generate post-call summaries stored in Customer Memory.",
    icon: Brain,
    status: "Live",
    href: "/voice/memory",
    features: ["Key phrase extraction", "Post-call summaries", "Searchable archive"],
  },
];

export default function VoiceIntelligencePage() {
  return (
    <div className="space-y-10 py-8">
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 6</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Voice Intelligence Platform
          </h1>
          <p className="max-w-2xl text-slate-400 sm:text-lg">
            Extend agents from text to voice — calls, voice notes, and voice-driven automation.
            Enable voice-native AI employees that can speak with customers naturally.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Status</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-400">Live</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              All 5 Voice modules are now live and ready for use.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Languages</p>
            <p className="mt-3 text-3xl font-semibold text-white">50+</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Supported languages for transcription
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Voices</p>
            <p className="mt-3 text-3xl font-semibold text-white">120+</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Text-to-speech voices available
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Goal</p>
            <p className="mt-3 text-base leading-7 text-slate-400">
              Enable full voice-native AI agents for phone calls and voice messaging.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {voiceModules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.title}
              className="group rounded-3xl border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">{module.title}</h2>
                    <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      {module.status}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-400">{module.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {module.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <Link href={module.href} className="w-full">
                  <Button variant="secondary" className="w-full justify-between">
                    Open module
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary-100">Phase 6 complete</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Voice Intelligence is ready</h2>
          </div>
          <div className="flex gap-3">
            <Link href="/brain">
              <Button variant="outline">
                <Brain className="mr-2 h-4 w-4" /> Back to AI Brain
              </Button>
            </Link>
            <Link href="/supervisor">
              <Button variant="outline">
                <Activity className="mr-2 h-4 w-4" /> Go to Supervisor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}