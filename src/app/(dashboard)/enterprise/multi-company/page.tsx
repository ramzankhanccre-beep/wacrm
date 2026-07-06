'use client';

import { useState } from 'react';
import {
  Building2,
  Plus,
  Settings,
  Users,
  Cpu,
  BarChart3,
  MessageSquare,
  ArrowRight,
  Check,
  MoreVertical,
  DollarSign,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock companies
const mockCompanies = [
  {
    id: '1',
    name: 'Brand Reach Solutions',
    slug: 'brandreach',
    status: 'active',
    plan: 'enterprise',
    users: 24,
    agents: 5,
    conversations: 1247,
    monthlyCost: 499,
    createdAt: '2025-01-15',
    lastActive: '2026-07-05',
  },
  {
    id: '2',
    name: 'Horizon Realty',
    slug: 'horizon-realty',
    status: 'active',
    plan: 'professional',
    users: 8,
    agents: 2,
    conversations: 456,
    monthlyCost: 199,
    createdAt: '2025-06-20',
    lastActive: '2026-07-04',
  },
  {
    id: '3',
    name: 'TechFlow Marketing',
    slug: 'techflow',
    status: 'active',
    plan: 'starter',
    users: 3,
    agents: 1,
    conversations: 89,
    monthlyCost: 49,
    createdAt: '2026-01-10',
    lastActive: '2026-07-03',
  },
  {
    id: '4',
    name: 'Gulf Properties',
    slug: 'gulf-properties',
    status: 'trial',
    plan: 'professional',
    users: 5,
    agents: 2,
    conversations: 0,
    monthlyCost: 0,
    createdAt: '2026-07-01',
    lastActive: '2026-07-05',
  },
];

const planColors: Record<string, string> = {
  enterprise: 'bg-purple-500',
  professional: 'bg-blue-500',
  starter: 'bg-emerald-500',
  trial: 'bg-amber-500',
};

const planPrices: Record<string, number> = {
  enterprise: 499,
  professional: 199,
  starter: 49,
};

export default function MultiCompanyPage() {
  const [selectedCompany, setSelectedCompany] = useState(mockCompanies[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = mockCompanies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = mockCompanies.reduce((sum, c) => sum + c.monthlyCost, 0);
  const totalUsers = mockCompanies.reduce((sum, c) => sum + c.users, 0);
  const activeTrials = mockCompanies.filter(c => c.status === 'trial').length;

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 8 — Module 5</p>
            <h1 className="text-3xl font-semibold text-white">Multi-Company Support</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          A single platform account can manage multiple company workspaces. Each company has fully isolated data, agents, and settings.
          Cross-company switching with single login. Billing and usage tracked separately per company.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Building2 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Companies</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{mockCompanies.length}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Users className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Total Users</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{totalUsers}</p>
            <p className="text-xs text-slate-500">Across all</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">MRR</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">${totalRevenue}</p>
            <p className="text-xs text-slate-500">Monthly</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Trials</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-amber-400">{activeTrials}</p>
            <p className="text-xs text-slate-500">Active</p>
          </div>
        </div>
      </div>

      {/* Search & Add */}
      <div className="flex items-center justify-between">
        <div className="relative w-[300px]">
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950"
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Company List */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Companies</CardTitle>
            <CardDescription className="text-slate-400">
              Select a company to manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <div className="space-y-3">
                {filteredCompanies.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      selectedCompany.id === company.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${planColors[company.plan]}`} />
                        <span className="font-medium text-white">{company.name}</span>
                      </div>
                      <Badge
                        className={company.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}
                      >
                        {company.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">@{company.slug}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{company.users} users</span>
                      <span>${company.monthlyCost}/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">{selectedCompany.name}</CardTitle>
                <CardDescription className="text-slate-400">@{selectedCompany.slug}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-3 w-3" />
                  Settings
                </Button>
                <Button size="sm">
                  Switch to <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-slate-950 p-4">
                  <Users className="h-4 w-4 text-slate-500 mb-2" />
                  <p className="text-xl font-semibold text-white">{selectedCompany.users}</p>
                  <p className="text-xs text-slate-500">Users</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4">
                  <Cpu className="h-4 w-4 text-slate-500 mb-2" />
                  <p className="text-xl font-semibold text-white">{selectedCompany.agents}</p>
                  <p className="text-xs text-slate-500">Agents</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4">
                  <MessageSquare className="h-4 w-4 text-slate-500 mb-2" />
                  <p className="text-xl font-semibold text-white">{selectedCompany.conversations}</p>
                  <p className="text-xs text-slate-500">Conversations</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4">
                  <DollarSign className="h-4 w-4 text-slate-500 mb-2" />
                  <p className="text-xl font-semibold text-white">${selectedCompany.monthlyCost}</p>
                  <p className="text-xs text-slate-500">/month</p>
                </div>
              </div>

              {/* Plan */}
              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                <div>
                  <p className="text-sm text-slate-400">Current Plan</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-3 w-3 rounded-full ${planColors[selectedCompany.plan]}`} />
                    <span className="text-lg font-semibold text-white capitalize">{selectedCompany.plan}</span>
                  </div>
                </div>
                {selectedCompany.status === 'trial' ? (
                  <Badge className="bg-amber-500">Trial - 14 days left</Badge>
                ) : (
                  <Button variant="outline" size="sm">Change Plan</Button>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Created</p>
                  <p className="text-white mt-1">{selectedCompany.createdAt}</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Last Active</p>
                  <p className="text-white mt-1">{selectedCompany.lastActive}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" className="flex-1">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button variant="outline" className="flex-1">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Billing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Summary */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Billing Summary</CardTitle>
          <CardDescription className="text-slate-400">
            Monthly recurring revenue breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-950 p-6">
              <p className="text-sm text-slate-400">Enterprise</p>
              <p className="text-3xl font-semibold text-white mt-2">
                ${mockCompanies.filter(c => c.plan === 'enterprise').reduce((sum, c) => sum + c.monthlyCost, 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {mockCompanies.filter(c => c.plan === 'enterprise').length} companies
              </p>
            </div>
            <div className="rounded-xl bg-slate-950 p-6">
              <p className="text-sm text-slate-400">Professional</p>
              <p className="text-3xl font-semibold text-white mt-2">
                ${mockCompanies.filter(c => c.plan === 'professional').reduce((sum, c) => sum + c.monthlyCost, 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {mockCompanies.filter(c => c.plan === 'professional').length} companies
              </p>
            </div>
            <div className="rounded-xl bg-slate-950 p-6">
              <p className="text-sm text-slate-400">Starter</p>
              <p className="text-3xl font-semibold text-white mt-2">
                ${mockCompanies.filter(c => c.plan === 'starter').reduce((sum, c) => sum + c.monthlyCost, 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {mockCompanies.filter(c => c.plan === 'starter').length} companies
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}