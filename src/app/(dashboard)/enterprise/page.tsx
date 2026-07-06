import { ArrowRight, Shield, FileText, Brain, Users, Building2, Lock, Globe, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enterprise — Brand Reach Solutions',
  description:
    'Enterprise platform for Brand Reach Solutions: Audit logs, explainability, safety layer, workspace permissions, multi-company support, and compliance framework.',
};

const phaseEightModules = [
  {
    title: 'Audit Logs',
    description:
      'Immutable log of every action taken on the platform with exportable JSON/CSV for compliance teams.',
    icon: FileText,
    status: 'Live',
    href: '/enterprise/audit-logs',
  },
  {
    title: 'Explainability',
    description:
      'Full reasoning trace for every agent response — memory used, knowledge retrieved, tools called, and why.',
    icon: Brain,
    status: 'Live',
    href: '/enterprise/explainability',
  },
  {
    title: 'Agent Safety Layer',
    description:
      'Define hard limits that no agent can cross. Safety rules enforced at infrastructure level.',
    icon: Shield,
    status: 'Live',
    href: '/enterprise/safety-layer',
  },
  {
    title: 'Workspace Permissions',
    description:
      'Role-based access control with granular permissions. Roles: Owner, Admin, Manager, Supervisor, Analyst.',
    icon: Users,
    status: 'Live',
    href: '/enterprise/workspace-permissions',
  },
  {
    title: 'Multi-Company Support',
    description:
      'Manage multiple company workspaces with isolated data, agents, and settings. Single login, separate billing.',
    icon: Building2,
    status: 'Live',
    href: '/enterprise/multi-company',
  },
  {
    title: 'Compliance Framework',
    description:
      'GDPR tools, configurable data residency (UAE/EU/US), end-to-end encryption, SOC 2 & ISO 27001 roadmap.',
    icon: Lock,
    status: 'Live',
    href: '/enterprise/compliance',
  },
];

export default function EnterprisePage() {
  return (
    <div className="space-y-10 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 8</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Enterprise Platform
          </h1>
          <p className="max-w-2xl text-slate-400 sm:text-lg">
            Make the platform enterprise-ready with governance, security, and multi-tenant support.
            Compliant with GDPR, UAE data laws, and ready for SOC 2 / ISO 27001 certification.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Status</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-400">Live</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              All 6 Enterprise modules are available and production-ready.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Security</p>
            <p className="mt-3 text-base leading-7 text-slate-400">
              AES-256 encryption, GDPR ready, UAE data residency, SOC 2 roadmap
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Compliance</p>
            <div className="mt-3 flex items-center gap-2 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">GDPR Compliant</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">UAE Data Law Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {phaseEightModules.map((module) => {
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

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <FileText className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Audit Logs</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">12,847</p>
          <p className="text-xs text-slate-500">Events logged</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Brain className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Traced</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">100%</p>
          <p className="text-xs text-slate-500">Responses</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Shield className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Safety Rules</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">5</p>
          <p className="text-xs text-slate-500">Active rules</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Globe className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Data Region</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">UAE</p>
          <p className="text-xs text-slate-500">Primary</p>
        </div>
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