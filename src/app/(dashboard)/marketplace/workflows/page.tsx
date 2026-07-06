'use client';

import { useState } from 'react';
import {
  Workflow,
  Search,
  Download,
  Eye,
  Filter,
  Star,
  Grid,
  List,
  ArrowRight,
  Clock,
  Users,
  Zap,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock workflow marketplace listings
const mockWorkflows = [
  {
    id: '1',
    name: 'Lead Nurture Sequence',
    description: 'Automated multi-step follow-up sequence for new leads. Includes email, WhatsApp, and task creation.',
    author: 'Brand Reach Team',
    authorVerified: true,
    rating: 4.8,
    reviews: 156,
    installs: 1247,
    price: 0,
    category: 'sales',
    complexity: 'intermediate',
    trigger: 'New lead created',
    nodes: 12,
    lastUpdated: '2026-07-01',
  },
  {
    id: '2',
    name: 'Support Ticket Handler',
    description: 'Create support tickets from WhatsApp messages, categorize by intent, and assign to team.',
    author: 'SupportPro',
    authorVerified: true,
    rating: 4.6,
    reviews: 89,
    installs: 567,
    price: 49,
    category: 'support',
    complexity: 'beginner',
    trigger: 'Message contains "help" or "issue"',
    nodes: 6,
    lastUpdated: '2026-06-28',
  },
  {
    id: '3',
    name: 'Booking Confirmation Flow',
    description: 'Complete booking workflow with calendar check, confirmation, reminder, and follow-up.',
    author: 'SchedulerPro',
    authorVerified: true,
    rating: 4.9,
    reviews: 234,
    installs: 2103,
    price: 79,
    category: 'booking',
    complexity: 'advanced',
    trigger: 'Booking intent detected',
    nodes: 18,
    lastUpdated: '2026-07-03',
  },
  {
    id: '4',
    name: 'Customer Onboarding',
    description: 'Welcome new customers with multi-step onboarding sequence, tasks, and progress tracking.',
    author: 'OnboardFlow',
    authorVerified: true,
    rating: 4.5,
    reviews: 67,
    installs: 234,
    price: 59,
    category: 'onboarding',
    complexity: 'intermediate',
    trigger: 'Contact added to "New Customer" list',
    nodes: 15,
    lastUpdated: '2026-06-15',
  },
  {
    id: '5',
    name: 'Abandoned Cart Recovery',
    description: 'Recover lost sales with automated follow-up sequence for abandoned carts.',
    author: 'GrowthHacker',
    authorVerified: false,
    rating: 4.7,
    reviews: 112,
    installs: 892,
    price: 39,
    category: 'sales',
    complexity: 'intermediate',
    trigger: 'No response for 24h after cart',
    nodes: 10,
    lastUpdated: '2026-07-02',
  },
  {
    id: '6',
    name: 'Feedback Collection',
    description: 'Post-conversation surveys with NPS, CSAT, and automatic follow-up on low scores.',
    author: 'FeedbackPro',
    authorVerified: false,
    rating: 4.4,
    reviews: 45,
    installs: 189,
    price: 0,
    category: 'feedback',
    complexity: 'beginner',
    trigger: 'Conversation marked resolved',
    nodes: 5,
    lastUpdated: '2026-06-20',
  },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'booking', label: 'Booking' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'feedback', label: 'Feedback' },
];

const complexityColors: Record<string, string> = {
  beginner: 'bg-emerald-500',
  intermediate: 'bg-amber-500',
  advanced: 'bg-red-500',
};

export default function WorkflowMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState(mockWorkflows[0]);

  const filteredWorkflows = mockWorkflows.filter(wf => {
    const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wf.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || wf.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Workflow className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 9 — Module 3</p>
            <h1 className="text-3xl font-semibold text-white">Workflow Marketplace</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Browse and install automation workflows built by the platform team and the community.
          Categorized by industry, use case, and complexity. Preview workflows visually before installing.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Workflow className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Total</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{mockWorkflows.length}</p>
            <p className="text-xs text-slate-500">Workflows</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Download className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Installs</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">
              {mockWorkflows.reduce((sum, wf) => sum + wf.installs, 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Layers className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Avg Nodes</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">
              {Math.round(mockWorkflows.reduce((sum, wf) => sum + wf.nodes, 0) / mockWorkflows.length)}
            </p>
            <p className="text-xs text-slate-500">Per workflow</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Zap className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Free</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {mockWorkflows.filter(wf => wf.price === 0).length}
            </p>
            <p className="text-xs text-slate-500">Workflows</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-slate-950">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Workflows List */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Available Workflows</CardTitle>
            <CardDescription className="text-slate-400">
              Click to preview and install
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <div className="space-y-3">
                {filteredWorkflows.map((wf) => (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWorkflow(wf)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      selectedWorkflow.id === wf.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{wf.name}</h3>
                          {wf.authorVerified && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">Verified</Badge>
                          )}
                          <div className={`h-2 w-2 rounded-full ${complexityColors[wf.complexity]}`} />
                          <span className="text-xs text-slate-500 capitalize">{wf.complexity}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400 line-clamp-2">{wf.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400" />
                            {wf.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {wf.nodes} nodes
                          </span>
                          <span>{wf.installs.toLocaleString()} installs</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {wf.price === 0 ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400">Free</Badge>
                        ) : (
                          <span className="text-lg font-semibold text-white">${wf.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Workflow Detail */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Workflow Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedWorkflow.name}</h3>
                <p className="text-sm text-slate-400">by {selectedWorkflow.author}</p>
              </div>

              <p className="text-slate-300">{selectedWorkflow.description}</p>

              <div className="rounded-xl bg-slate-950 p-4">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Trigger</h4>
                <p className="text-white">{selectedWorkflow.trigger}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-950 p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Layers className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Nodes</span>
                  </div>
                  <p className="text-2xl font-semibold text-white">{selectedWorkflow.nodes}</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Star className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Rating</span>
                  </div>
                  <p className="text-2xl font-semibold text-white">{selectedWorkflow.rating}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${complexityColors[selectedWorkflow.complexity]}`} />
                <span className="text-white capitalize">{selectedWorkflow.complexity}</span>
                <span className="text-slate-500">complexity</span>
              </div>

              <Button className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Preview Workflow
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Install Workflow
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Last updated: {selectedWorkflow.lastUpdated}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}