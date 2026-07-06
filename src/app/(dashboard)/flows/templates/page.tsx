"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RefreshCw, Search, Star, Zap, Inbox, UserPlus, MessageCircle, HelpCircle, Calendar, ShoppingCart, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface WorkflowTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  node_count: number;
  trigger_type: string;
  is_premium: boolean;
  price_usd: number | null;
  usage_count: number;
  author_name: string | null;
}

const CATEGORIES = [
  { value: 'all', label: 'All Templates', icon: FileText },
  { value: 'sales', label: 'Sales', icon: ShoppingCart },
  { value: 'support', label: 'Support', icon: Inbox },
  { value: 'onboarding', label: 'Onboarding', icon: UserPlus },
  { value: 'marketing', label: 'Marketing', icon: Zap },
  { value: 'operations', label: 'Operations', icon: Calendar },
];

const ICON_MAP = {
  MessageCircle,
  HelpCircle,
  UserPlus,
  Inbox,
  Zap,
  Calendar,
  ShoppingCart,
  FileText,
} as const;

const TRIGGER_LABELS: Record<string, string> = {
  keyword: 'Keyword',
  first_inbound_message: 'First Message',
  scheduled: 'Scheduled',
  webhook: 'Webhook',
  manual: 'Manual',
};

export default function WorkflowTemplatesPage() {
  const router = useRouter();
  const { profileLoading } = useAuth();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cloning, setCloning] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  async function loadTemplates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/flows/templates?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data?.error || 'Failed to load');
      setTemplates(Array.isArray(data.templates) ? data.templates : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }

  async function handleUseTemplate(template: WorkflowTemplate) {
    setCloning(template.slug);
    try {
      const response = await fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_slug: template.slug }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Failed to create flow');

      toast.success(`Created "${data.flow.name}"`);
      router.push(`/flows/${data.flow.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create flow';
      toast.error(msg);
    } finally {
      setCloning(null);
    }
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const featuredTemplates = templates.filter(t => t.usage_count > 100);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">Workflow Automation</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Template Marketplace
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={loadTemplates}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-slate-400">
          Browse and install pre-built workflows. Create your own or generate one with AI.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadTemplates()}
          placeholder="Search templates..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-500"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedCategory === cat.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Featured */}
      {featuredTemplates.length > 0 && selectedCategory === 'all' && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Popular Templates
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTemplates.slice(0, 3).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
                loading={cloning === template.slug}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Templates */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">
          {selectedCategory === 'all' ? 'All Templates' : CATEGORIES.find(c => c.value === selectedCategory)?.label}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900 h-48" />
            ))
          ) : templates.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center text-slate-400">
              <FileText className="mx-auto mb-4 h-10 w-10" />
              <p>No templates found in this category.</p>
            </div>
          ) : (
            templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
                loading={cloning === template.slug}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function TemplateCard({
  template,
  onUse,
  loading,
}: {
  template: WorkflowTemplate;
  onUse: (t: WorkflowTemplate) => void;
  loading: boolean;
}) {
  const Icon = ICON_MAP[template.icon as keyof typeof ICON_MAP] || FileText;

  return (
    <div className="group flex flex-col rounded-3xl border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        {template.is_premium && (
          <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-300">
            ${template.price_usd}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-primary">
        {template.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-400">
        {template.description}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          {template.node_count} nodes
        </span>
        <span className="flex items-center gap-1">
          {TRIGGER_LABELS[template.trigger_type] || template.trigger_type}
        </span>
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3" /> {template.usage_count}
        </span>
      </div>

      <Button
        className="mt-4"
        onClick={() => onUse(template)}
        disabled={loading}
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          'Use Template'
        )}
      </Button>
    </div>
  );
}