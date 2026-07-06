import { ArrowRight, Cpu, Zap, Workflow, Plug, Star, Users, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace — Brand Reach Solutions',
  description:
    'Marketplace ecosystem for Brand Reach Solutions: Agent Marketplace, Skill Marketplace, Workflow Marketplace, and Integration Marketplace.',
};

const phaseNineModules = [
  {
    title: 'Agent Marketplace',
    description:
      'Browse, preview, and install pre-built AI agents. Sales, Support, Booking, Onboarding, and Collections agents.',
    icon: Cpu,
    status: 'Live',
    href: '/marketplace/agents',
  },
  {
    title: 'Skill Marketplace',
    description:
      'Install individual skills into any agent or workspace. Verified and community-contributed skills with versioning.',
    icon: Zap,
    status: 'Live',
    href: '/marketplace/skills',
  },
  {
    title: 'Workflow Marketplace',
    description:
      'Browse and install automation workflows built by the platform team and community. Categorized by industry and complexity.',
    icon: Workflow,
    status: 'Live',
    href: '/marketplace/workflows',
  },
  {
    title: 'Integration Marketplace',
    description:
      'One-click integrations for Salesforce, HubSpot, Google Calendar, Calendly, Stripe, Shopify. OAuth-based, no API keys.',
    icon: Plug,
    status: 'Live',
    href: '/marketplace/integrations',
  },
];

const developerProgram = [
  { feature: 'Open API for marketplace listings', status: 'available' },
  { feature: 'Revenue sharing for paid items', status: 'available' },
  { feature: 'Verified developer badge', status: 'available' },
  { feature: 'Submission review process', status: 'available' },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-10 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 9</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Marketplace Ecosystem
          </h1>
          <p className="max-w-2xl text-slate-400 sm:text-lg">
            Build a thriving third-party ecosystem that extends the platform's capabilities exponentially.
            Agents, skills, workflows, and integrations from the platform team, verified partners, and community developers.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Status</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-400">Live</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              All 4 marketplace modules are available and ready for use.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Listings</p>
            <p className="mt-3 text-3xl font-semibold text-white">24+</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Agents, skills, workflows, and integrations available
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Developer</p>
            <p className="mt-3 text-base leading-7 text-slate-400">
              Open API, revenue sharing, verified badges for contributors
            </p>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {phaseNineModules.map((module) => {
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
                      Browse
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

      {/* Developer Programme */}
      <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-300">Developer Programme</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Build and Sell on the Marketplace</h2>
            <p className="mt-2 text-slate-400 max-w-xl">
              Create agents, skills, workflows, and integrations. Earn revenue through our marketplace with revenue sharing.
              Get a verified badge for quality contributions.
            </p>
          </div>
          <div>
            <Button>
              Become a Developer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {developerProgram.map((item) => (
            <div key={item.feature} className="flex items-center gap-3 rounded-xl bg-slate-900 p-4">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-white">{item.feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Cpu className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Agents</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">6</p>
          <p className="text-xs text-slate-500">Available</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Zap className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Skills</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">6</p>
          <p className="text-xs text-slate-500">Available</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Workflow className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Workflows</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">6</p>
          <p className="text-xs text-slate-500">Available</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Plug className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Integrations</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">10</p>
          <p className="text-xs text-slate-500">Available</p>
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