import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  MessageSquare,
  Rocket,
  Cpu,
  Zap,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Brand Reach Solutions — WhatsApp CRM",
  description:
    "Brand Reach Solutions is a powerful WhatsApp CRM that unifies conversations, automations, sales pipelines, and broadcasts in one elegant platform.",
};

const features = [
  {
    icon: MessageSquare,
    title: "Shared WhatsApp Inbox",
    description:
      "Turn every conversation into a tracked customer interaction with team routing, status, and notes.",
  },
  {
    icon: Zap,
    title: "Automations & Workflows",
    description:
      "Build event-driven flows, keyword triggers, and follow-up sequences without code.",
  },
  {
    icon: LayoutDashboard,
    title: "Sales Pipelines",
    description:
      "Manage deals from lead to close with visual kanban stages and revenue tracking.",
  },
  {
    icon: Cpu,
    title: "AI Agent Studio",
    description:
      "Create, train, and deploy AI agents that support conversations and automate follow-up workflows.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite agents, assign conversations, and control access with role-based permissions.",
  },
];

export default function HomePage() {
  return (
    <main className="bg-slate-950 text-white">
      <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:px-8 lg:px-10">
        <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_transparent_36%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary-100">
                <Zap className="h-4 w-4" />
                WhatsApp CRM built for modern sales and support teams
              </div>
              <h1 className="mt-8 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                One platform to manage WhatsApp conversations, AI agents, leads, and campaigns.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Brand Reach Solutions unifies your WhatsApp inbox, broadcasts, automations, and sales pipeline so teams can move faster, respond smarter, and scale every customer interaction.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                >
                  Start your workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Login to an existing account
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/40 sm:p-10">
              <div className="absolute -right-16 top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -left-16 bottom-10 h-64 w-64 rounded-full bg-slate-300/10 blur-3xl" />
              <div className="relative rounded-[1.5rem] border border-white/10 bg-slate-950/90 p-7 shadow-[0_40px_100px_-40px_rgba(15,23,42,0.8)]">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Trusted by fast-growing teams</p>
                    <p className="mt-2 text-sm text-slate-300">Build a WhatsApp CRM that your agents actually want to use.</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Live demo ready
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">Shared inbox</p>
                        <p className="mt-1 text-sm text-slate-400">Every WhatsApp conversation stays in one organized view.</p>
                      </div>
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">Templates & broadcasts</p>
                        <p className="mt-1 text-sm text-slate-400">Send approved WhatsApp campaigns with powerful personalization.</p>
                      </div>
                      <Rocket className="h-6 w-6 text-sky-400" />
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">Automated follow-ups</p>
                        <p className="mt-1 text-sm text-slate-400">Trigger replies, tags, and pipeline movement automatically.</p>
                      </div>
                      <Zap className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800/70 bg-slate-950/80 px-6 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">Why Brand Reach Solutions</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                A CRM made to turn WhatsApp conversations into revenue.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Create a reliable team workspace for sales, support, and marketing — without jumping between chat apps, spreadsheets, and lost messages.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-[0_15px_40px_-20px_rgba(15,23,42,0.8)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-primary-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900/95 px-6 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">How it works</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Start in minutes, scale with confidence.
              </h2>
              <ul className="mt-10 space-y-6">
                <li className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
                  <div className="flex items-center gap-4 text-sm font-semibold text-white">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">1</span>
                    Connect your WhatsApp Business API account and phone number.
                  </div>
                </li>
                <li className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
                  <div className="flex items-center gap-4 text-sm font-semibold text-white">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">2</span>
                    Import your contacts, create templates, and assign team roles.
                  </div>
                </li>
                <li className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
                  <div className="flex items-center gap-4 text-sm font-semibold text-white">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">3</span>
                    Launch broadcasts, automate replies, and close more deals.
                  </div>
                </li>
              </ul>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-6 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.75)] sm:p-8">
              <div className="rounded-[1.75rem] bg-slate-950/90 p-6 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]">
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4 text-slate-300">
                    <span className="text-sm uppercase tracking-[0.24em]">Live activity</span>
                    <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">Realtime</span>
                  </div>
                  <div className="rounded-3xl bg-slate-900 p-5">
                    <div className="flex items-center justify-between text-slate-300">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Open conversations</p>
                        <p className="mt-2 text-3xl font-semibold text-white">37</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200">+14% today</div>
                    </div>
                    <div className="mt-6 h-2 rounded-full bg-slate-800">
                      <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-primary to-cyan-400" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-900 p-4">
                      <p className="text-sm text-slate-400">Pipeline value</p>
                      <p className="mt-2 text-2xl font-semibold text-white">$142K</p>
                    </div>
                    <div className="rounded-3xl bg-slate-900 p-4">
                      <p className="text-sm text-slate-400">Pending automations</p>
                      <p className="mt-2 text-2xl font-semibold text-white">8</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800/70 bg-slate-950/90 px-6 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">Ready to stand out?</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Build a WhatsApp CRM your team can trust.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Start with the features your business actually needs, then grow into advanced automation, broadcasts, and pipeline management without switching tools.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              Launch your workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 px-8 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Explore the app
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
