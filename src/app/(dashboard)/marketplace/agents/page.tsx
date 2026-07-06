'use client';

import { useState } from 'react';
import {
  Cpu,
  Search,
  Star,
  Download,
  Eye,
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  Check,
  Sparkles,
  ArrowRight,
  Grid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock agent marketplace listings
const mockAgents = [
  {
    id: '1',
    name: 'Sales Pro Agent',
    description: 'Enterprise-grade sales agent with lead qualification, objection handling, and closing skills.',
    author: 'Brand Reach Team',
    authorVerified: true,
    rating: 4.8,
    reviews: 156,
    installs: 1247,
    price: 99,
    category: 'sales',
    features: ['Lead Qualification', 'Objection Handling', 'CRM Integration', 'Multi-language'],
    image: '🤖',
    lastUpdated: '2026-07-01',
  },
  {
    id: '2',
    name: 'Support Bot Premium',
    description: 'Advanced customer support agent with FAQ handling, ticket creation, and escalation workflows.',
    author: 'TechCorp',
    authorVerified: true,
    rating: 4.6,
    reviews: 89,
    installs: 567,
    price: 0,
    category: 'support',
    features: ['FAQ Handling', 'Ticket Creation', 'Sentiment Analysis', '24/7 Availability'],
    image: '🎧',
    lastUpdated: '2026-06-28',
  },
  {
    id: '3',
    name: 'Booking Master',
    description: 'Specialized appointment booking agent with calendar integration and confirmation flows.',
    author: 'SchedulerPro',
    authorVerified: false,
    rating: 4.9,
    reviews: 234,
    installs: 2103,
    price: 49,
    category: 'booking',
    features: ['Calendar Sync', 'Timezone Handling', 'Confirmation Emails', 'Reminders'],
    image: '📅',
    lastUpdated: '2026-07-03',
  },
  {
    id: '4',
    name: 'Onboarding Specialist',
    description: 'Guide new customers through product setup with interactive walkthroughs and checks.',
    author: 'OnboardFlow',
    authorVerified: true,
    rating: 4.5,
    reviews: 67,
    installs: 234,
    price: 79,
    category: 'onboarding',
    features: ['Interactive Steps', 'Progress Tracking', 'Email Sequences', 'Slack Notifications'],
    image: '🚀',
    lastUpdated: '2026-06-15',
  },
  {
    id: '5',
    name: 'Collections Agent',
    description: 'Automated collections agent for managing payment reminders and follow-ups.',
    author: 'FinanceLabs',
    authorVerified: true,
    rating: 4.3,
    reviews: 45,
    installs: 189,
    price: 129,
    category: 'collections',
    features: ['Payment Reminders', 'Escalation Logic', 'Payment Links', 'Reporting'],
    image: '💳',
    lastUpdated: '2026-06-20',
  },
  {
    id: '6',
    name: 'Lead Magnet',
    description: 'Capture and qualify leads with interactive quizzes and assessments.',
    author: 'GrowthHacker',
    authorVerified: false,
    rating: 4.7,
    reviews: 112,
    installs: 892,
    price: 0,
    category: 'sales',
    features: ['Quiz Builder', 'Score Tracking', 'CRM Sync', 'Email Capture'],
    image: '🧲',
    lastUpdated: '2026-07-02',
  },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'booking', label: 'Booking' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'collections', label: 'Collections' },
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

export default function AgentMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAgent, setSelectedAgent] = useState(mockAgents[0]);

  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || agent.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
      />
    ));
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 9 — Module 1</p>
            <h1 className="text-3xl font-semibold text-white">Agent Marketplace</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Browse, preview, and install pre-built, ready-to-deploy AI agents. Find agents for sales, support,
          booking, onboarding, and collections. Built by the platform team, verified partners, and community developers.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Cpu className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Total Agents</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{mockAgents.length}</p>
            <p className="text-xs text-slate-500">Available</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Download className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Total Installs</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">
              {mockAgents.reduce((sum, a) => sum + a.installs, 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Across all agents</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Star className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Average Rating</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-amber-400">
              {(mockAgents.reduce((sum, a) => sum + a.rating, 0) / mockAgents.length).toFixed(1)}
            </p>
            <p className="text-xs text-slate-500">Out of 5</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Free Agents</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {mockAgents.filter(a => a.price === 0).length}
            </p>
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
              placeholder="Search agents..."
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
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-slate-950">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode('grid')}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Agent Grid/List */}
        <div className={`${viewMode === 'grid' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  selectedAgent.id === agent.id
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
                    {agent.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">{agent.name}</h3>
                      {agent.price === 0 ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400">Free</Badge>
                      ) : (
                        <span className="text-lg font-semibold text-white">${agent.price}</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">{agent.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {renderStars(agent.rating)}
                        <span className="text-slate-400">({agent.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Download className="h-3 w-3" />
                        <span>{agent.installs.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Detail */}
        {viewMode === 'list' && (
          <Card className="border-slate-800 bg-slate-900/50 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Selected Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <AgentDetailCard agent={selectedAgent} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Agent Detail Modal View for Grid Mode */}
      {viewMode === 'grid' && selectedAgent && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-6">
            <AgentDetailCard agent={selectedAgent} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AgentDetailCard({ agent }: { agent: typeof mockAgents[0] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-4xl">
          {agent.image}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
            {agent.authorVerified && (
              <Badge className="bg-blue-500/20 text-blue-400">Verified</Badge>
            )}
          </div>
          <p className="text-sm text-slate-400">by {agent.author}</p>
        </div>
      </div>

      <p className="text-slate-300">{agent.description}</p>

      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-2">Features</h4>
        <div className="flex flex-wrap gap-2">
          {agent.features.map((feature) => (
            <Badge key={feature} variant="outline" className="border-slate-700">
              {feature}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-950 p-4">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Star className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Rating</span>
          </div>
          <p className="text-2xl font-semibold text-white">{agent.rating}</p>
        </div>
        <div className="rounded-xl bg-slate-950 p-4">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Download className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Installs</span>
          </div>
          <p className="text-2xl font-semibold text-white">{agent.installs.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Install Agent
        </Button>
        <Button variant="outline">
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Last updated: {agent.lastUpdated}
      </p>
    </div>
  );
}