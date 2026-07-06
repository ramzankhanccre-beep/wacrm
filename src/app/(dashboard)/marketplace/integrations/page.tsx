'use client';

import { useState } from 'react';
import {
  Plug,
  Search,
  Download,
  Eye,
  Settings,
  Check,
  ExternalLink,
  ArrowRight,
  Zap,
  Users,
  Calendar,
  CreditCard,
  MessageSquare,
  Mail,
  FileText,
  BarChart3,
  RefreshCw,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';

// Mock integration marketplace listings
const mockIntegrations = [
  {
    id: '1',
    name: 'Salesforce',
    description: 'Sync contacts, leads, and opportunities with Salesforce CRM. Bi-directional sync.',
    category: 'crm',
    logo: '☁️',
    status: 'installed',
    version: '2.1.0',
    lastSync: '2026-07-05T14:30:00Z',
    features: ['Contact Sync', 'Lead Creation', 'Opportunity Tracking', 'Activity Logging'],
  },
  {
    id: '2',
    name: 'HubSpot',
    description: 'Connect with HubSpot CRM for contact management, pipelines, and marketing automation.',
    category: 'crm',
    logo: '🟠',
    status: 'available',
    version: '1.8.0',
    lastSync: null,
    features: ['Contact Sync', 'Deal Pipeline', 'Email Tracking', 'Workflow Automation'],
  },
  {
    id: '3',
    name: 'Zoho CRM',
    description: 'Integrate with Zoho for comprehensive CRM functionality including inventory and reports.',
    category: 'crm',
    logo: '🟢',
    status: 'available',
    version: '1.5.0',
    lastSync: null,
    features: ['Contact Sync', 'Sales Pipelines', 'Inventory Management', 'Reports'],
  },
  {
    id: '4',
    name: 'Google Calendar',
    description: 'Sync appointments and availability with Google Calendar.',
    category: 'calendar',
    logo: '📅',
    status: 'installed',
    version: '3.0.0',
    lastSync: '2026-07-05T14:25:00Z',
    features: ['Event Sync', 'Availability Check', 'Reminder Setting', 'Multi-calendar'],
  },
  {
    id: '5',
    name: 'Calendly',
    description: 'Embed Calendly booking links and sync scheduled events.',
    category: 'calendar',
    logo: '📆',
    status: 'available',
    version: '2.2.0',
    lastSync: null,
    features: ['Booking Links', 'Event Sync', 'Participant Management', 'Notifications'],
  },
  {
    id: '6',
    name: 'Stripe',
    description: 'Process payments, manage subscriptions, and track revenue.',
    category: 'payments',
    logo: '💳',
    status: 'available',
    version: '1.9.0',
    lastSync: null,
    features: ['Payment Processing', 'Subscription Management', 'Invoice Generation', 'Revenue Analytics'],
  },
  {
    id: '7',
    name: 'Shopify',
    description: 'Sync products, orders, and customers with your Shopify store.',
    category: 'ecommerce',
    logo: '🛒',
    status: 'available',
    version: '2.0.0',
    lastSync: null,
    features: ['Product Sync', 'Order Import', 'Customer Sync', 'Inventory Tracking'],
  },
  {
    id: '8',
    name: 'Slack',
    description: 'Send notifications and alerts to Slack channels.',
    category: 'communication',
    logo: '💬',
    status: 'installed',
    version: '1.4.0',
    lastSync: '2026-07-05T14:20:00Z',
    features: ['New Lead Alerts', 'Escalation Notifications', 'Daily Summaries', 'Custom Commands'],
  },
  {
    id: '9',
    name: 'Gmail',
    description: 'Send and receive emails through your Gmail account.',
    category: 'email',
    logo: '📧',
    status: 'available',
    version: '2.1.0',
    lastSync: null,
    features: ['Email Sending', 'Contact Import', 'Thread Tracking', 'Auto-replies'],
  },
  {
    id: '10',
    name: 'Google Sheets',
    description: 'Export data to Google Sheets for reporting and analysis.',
    category: 'analytics',
    logo: '📊',
    status: 'available',
    version: '1.3.0',
    lastSync: null,
    features: ['Data Export', 'Scheduled Reports', 'Custom Formulas', 'Dashboard Sync'],
  },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'crm', label: 'CRM' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'payments', label: 'Payments' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'communication', label: 'Communication' },
  { value: 'email', label: 'Email' },
  { value: 'analytics', label: 'Analytics' },
];

const categoryIcons: Record<string, React.ElementType> = {
  crm: Users,
  calendar: Calendar,
  payments: CreditCard,
  ecommerce: ShoppingCart || Zap,
  communication: MessageSquare,
  email: Mail,
  analytics: BarChart3,
};

function ShoppingCart({ className }: { className?: string }) {
  return <Zap className={className} />;
}

export default function IntegrationMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIntegration, setSelectedIntegration] = useState(mockIntegrations[0]);

  const filteredIntegrations = mockIntegrations.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      int.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || int.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const installedCount = mockIntegrations.filter(i => i.status === 'installed').length;

  const formatLastSync = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Plug className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 9 — Module 4</p>
            <h1 className="text-3xl font-semibold text-white">Integration Marketplace</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          One-click integrations for Salesforce, HubSpot, Zoho, Google Calendar, Calendly, Stripe, Shopify, and more.
          Each integration includes pre-built tools and workflows. OAuth-based authentication — no API key management required.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Plug className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Total</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{mockIntegrations.length}</p>
            <p className="text-xs text-slate-500">Integrations</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Check className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Installed</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">{installedCount}</p>
            <p className="text-xs text-slate-500">Active</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Shield className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">OAuth</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{mockIntegrations.length}</p>
            <p className="text-xs text-slate-500">All supported</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Updates</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-amber-400">1</p>
            <p className="text-xs text-slate-500">Available</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Integrations List */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Available Integrations</CardTitle>
            <CardDescription className="text-slate-400">
              Click to view details and configure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <div className="space-y-3">
                {filteredIntegrations.map((int) => (
                  <div
                    key={int.id}
                    onClick={() => setSelectedIntegration(int)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      selectedIntegration.id === int.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl">
                          {int.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">{int.name}</h3>
                            {int.status === 'installed' ? (
                              <Badge className="bg-emerald-500/20 text-emerald-400">Installed</Badge>
                            ) : (
                              <Badge variant="outline" className="border-slate-700">Available</Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-400">{int.description}</p>
                        </div>
                      </div>
                      {int.status === 'installed' ? (
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button size="sm">
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Integration Detail */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Integration Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-800 text-4xl">
                  {selectedIntegration.logo}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedIntegration.name}</h3>
                  <Badge variant="outline" className="border-slate-700 capitalize">
                    {selectedIntegration.category}
                  </Badge>
                </div>
              </div>

              <p className="text-slate-300">{selectedIntegration.description}</p>

              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedIntegration.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="border-slate-700">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedIntegration.status === 'installed' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                    <div>
                      <p className="text-xs text-slate-500">Last Sync</p>
                      <p className="font-medium text-white">{formatLastSync(selectedIntegration.lastSync)}</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                    <div>
                      <p className="text-xs text-slate-500">Version</p>
                      <p className="font-medium text-white">v{selectedIntegration.version}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Update
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Sync enabled</span>
                    <Switch defaultChecked />
                  </div>
                  <Button variant="outline" className="w-full text-red-400">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect with OAuth
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    No API keys required • Secure OAuth authentication
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}