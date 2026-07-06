import {
  Shield,
  Eye,
  AlertTriangle,
  DollarSign,
  BarChart3,
  AlertOctagon,
  ArrowRight,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Supervisor — Brand Reach Solutions',
  description:
    'Phase 4 AI Supervisor Layer: Monitor agent quality, detect hallucinations, enforce compliance, track costs, and manage escalations.',
};

const supervisorModules = [
  {
    title: 'Quality Monitoring',
    description:
      'Track and review AI agent response quality. Rate conversations, add coaching notes, and identify improvement areas.',
    icon: BarChart3,
    status: 'Live',
    href: '/supervisor/quality',
  },
  {
    title: 'Hallucination Detection',
    description:
      'Detect and block responses that cannot be grounded in memory or knowledge base. Configure risk thresholds.',
    icon: Eye,
    status: 'Live',
    href: '/supervisor/hallucination',
  },
  {
    title: 'Compliance Monitoring',
    description:
      'Define and enforce compliance rules. Block content, require approvals, and track violations.',
    icon: Shield,
    status: 'Live',
    href: '/supervisor/compliance',
  },
  {
    title: 'Cost Optimisation',
    description:
      'Monitor token usage per agent, track spending, and get recommendations to reduce costs.',
    icon: DollarSign,
    status: 'Live',
    href: '/supervisor/cost',
  },
  {
    title: 'Escalation Control',
    description:
      'Centralized escalation policies. Configure triggers, targets, and notification channels.',
    icon: AlertOctagon,
    status: 'Live',
    href: '/supervisor/escalation',
  },
];

export default function SupervisorPage() {
  return (
    <div className="space-y-10 py-8">
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 4</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            AI Supervisor Layer
          </h1>
          <p className="max-w-2xl text-slate-400 sm:text-lg">
            Govern, control, and continuously improve all agents across the workspace.
            Monitor quality, detect hallucinations, enforce compliance, and optimize costs.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Status</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-400">Live</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              All 5 Supervisor modules are now live and ready for use.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Modules</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>Quality Monitoring</li>
              <li>Hallucination Detection</li>
              <li>Compliance Monitoring</li>
              <li>+ 2 more</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Goal</p>
            <p className="mt-3 text-base leading-7 text-slate-400">
              Full governance layer to ensure agent quality, compliance, and cost efficiency.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {supervisorModules.map((module) => {
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
                      Open module <ArrowRight className="ml-2 h-4 w-4" />
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
            <p className="text-sm uppercase tracking-[0.24em] text-primary-100">Phase 4 complete</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">AI Supervisor is ready</h2>
          </div>
          <div className="flex gap-3">
            <Link href="/brain">
              <Button variant="outline">
                <Activity className="mr-2 h-4 w-4" /> Back to AI Brain
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}