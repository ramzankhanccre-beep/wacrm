import { ArrowRight, Activity, Cpu, Layers, Stars, TrendingUp, Zap, Brain, GraduationCap, FileText, Workflow, DollarSign, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Brain — Brand Reach Solutions',
  description:
    'Intelligence layer and self-evolution for Brand Reach Solutions: Customer Digital Twin, Business Brain, knowledge graph, intent prediction, and proactive revenue automation.',
};

const phaseTwoModules = [
  {
    title: 'Customer Digital Twin',
    description:
      'Create a living customer profile that unifies contact details, preferences, purchase history, and conversation summaries.',
    icon: Activity,
    status: 'Live',
    href: '/contacts',
  },
  {
    title: 'AI Business Brain',
    description:
      'Establish a workspace-level business intelligence layer that all agents can query for consistent company context.',
    icon: Cpu,
    status: 'Live',
    href: '/brain/business-memory',
  },
  {
    title: 'Universal Knowledge Graph',
    description:
      'Build an entity graph that connects customers, products, deals, conversations, and policies for smarter reasoning.',
    icon: Layers,
    status: 'Live',
    href: '/brain/knowledge-graph',
  },
  {
    title: 'Intent Prediction Engine',
    description:
      'Predict contact intent and surface the next best action before conversations even conclude.',
    icon: Stars,
    status: 'Live',
    href: '/brain/intent-predictions',
  },
  {
    title: 'Revenue Intelligence',
    description:
      'Turn conversation data into revenue signals, opportunity scoring, and proactive agent recommendations.',
    icon: TrendingUp,
    status: 'Live',
    href: '/brain/revenue-insights',
  },
  {
    title: 'Opportunity Discovery',
    description:
      'Automatically detect new sales opportunities, upsell potential, and cross-sell leads from conversations.',
    icon: Zap,
    status: 'Live',
    href: '/brain/opportunities',
  },
  {
    title: 'Negotiation Engine',
    description:
      'Build negotiation profiles per contact with risk tolerance, price sensitivity, and strategy recommendations.',
    icon: Activity,
    status: 'Live',
    href: '/brain/negotiation-profiles',
  },
  {
    title: 'Autonomous Follow-Up',
    description:
      'Automate follow-up sequences, reminders, and ownership handoffs with configurable business rules.',
    icon: Zap,
    status: 'Live',
    href: '/brain/follow-up',
  },
];

const phaseSevenModules = [
  {
    title: 'AI Self-Improvement',
    description:
      'Agents analyze their own performance metrics, failed intents, and escalations to generate actionable improvement reports.',
    icon: Brain,
    status: 'Live',
    href: '/brain/self-improvement',
  },
  {
    title: 'Agent Evolution',
    description:
      'Track agent performance over time with performance timelines, version every configuration, and graduation to higher autonomy.',
    icon: GraduationCap,
    status: 'Live',
    href: '/brain/agent-evolution',
  },
  {
    title: 'Prompt Recommendations',
    description:
      'AI analyzes successful conversations and extracts patterns to generate prompt improvement suggestions with A/B testing.',
    icon: FileText,
    status: 'Live',
    href: '/brain/prompt-recommendations',
  },
  {
    title: 'Workflow Recommendations',
    description:
      'Monitor repetitive human actions, suggest automation workflows, and generate workflows automatically.',
    icon: Workflow,
    status: 'Live',
    href: '/brain/workflow-recommendations',
  },
  {
    title: 'Cost Recommendations',
    description:
      'Monitor token usage, identify over-provisioned agents, and recommend cost-optimized model switches with impact simulation.',
    icon: DollarSign,
    status: 'Live',
    href: '/brain/cost-recommendations',
  },
];

export default function BrainPage() {
  return (
    <div className="space-y-10 py-8">
      {/* Phase 2 Section */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 2</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            AI Brain and Intelligence Layer
          </h1>
          <p className="max-w-2xl text-slate-400 sm:text-lg">
            Build the next layer of Brand Reach Solutions: the intelligence engine that
            automatically understands business context, predicts outcomes, and powers proactive agents.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Status</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-400">Complete</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              All 8 Phase 2 intelligence modules are now live and ready for use.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Modules</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>Customer Digital Twin</li>
              <li>AI Business Brain</li>
              <li>Knowledge Graph</li>
              <li>+ 5 more</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Goal</p>
            <p className="mt-3 text-base leading-7 text-slate-400">
              Deliver a unified intelligence layer so agents stop being reactive and start acting like proactive employees.
            </p>
          </div>
        </div>
      </div>

      {/* Phase 2 Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {phaseTwoModules.map((module) => {
          const Icon = module.icon;
          return (
            <div key={module.title} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">{module.title}</h2>
                    <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      {module.status}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-400">{module.description}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                {module.href ? (
                  <Link href={module.href}>
                    <Button variant="secondary" className="min-w-[160px]">
                      Open module
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" className="min-w-[160px]">
                    Coming soon
                  </Button>
                )}
                <span className="text-sm text-slate-500">{module.status === 'Live' ? 'Active' : 'Planned'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase 7 Section */}
      <div className="flex flex-col gap-6 rounded-3xl border border-purple-900/50 bg-purple-950/20 p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-purple-300">Phase 7</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Self-Evolving AI
          </h1>
          <p className="max-w-2xl text-slate-400 sm:text-lg">
            Agents that improve themselves with full human control and oversight. The workforce gets smarter over time.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-purple-800/50 bg-purple-900/20 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Status</p>
            <p className="mt-3 text-3xl font-semibold text-purple-400">Live</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              All 5 Phase 7 self-evolution modules are now available.
            </p>
          </div>
          <div className="rounded-3xl border border-purple-800/50 bg-purple-900/20 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Modules</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>AI Self-Improvement</li>
              <li>Agent Evolution</li>
              <li>Prompt Recommendations</li>
              <li>+ 2 more</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-purple-800/50 bg-purple-900/20 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Critical Rule</p>
            <p className="mt-3 text-base leading-7 text-slate-400">
              No self-improvement change is ever deployed automatically. Agents present, humans decide.
            </p>
          </div>
        </div>
      </div>

      {/* Phase 7 Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {phaseSevenModules.map((module) => {
          const Icon = module.icon;
          return (
            <div key={module.title} className="rounded-3xl border border-purple-800/30 bg-purple-900/10 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">{module.title}</h2>
                    <span className="rounded-full border border-purple-700 bg-purple-950 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-purple-300">
                      {module.status}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-400">{module.description}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                {module.href ? (
                  <Link href={module.href}>
                    <Button variant="secondary" className="min-w-[160px]">
                      Open module
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" className="min-w-[160px]">
                    Coming soon
                  </Button>
                )}
                <span className="text-sm text-slate-500">{module.status === 'Live' ? 'Active' : 'Planned'}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary-100">Continue to roadmap</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Explore all phases</h2>
          </div>
          <Button>
            View Full Roadmap <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}