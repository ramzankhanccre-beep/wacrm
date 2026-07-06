'use client';

import { useState } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  ChevronRight,
  Brain,
  DollarSign,
  Calendar,
  FileText,
  MessageSquare,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock safety rules
const mockSafetyRules = [
  {
    id: '1',
    name: 'Price Upper Limit',
    description: 'Never quote a price above $10,000 without human approval',
    category: 'pricing',
    severity: 'critical',
    enabled: true,
    triggerCount: 12,
    lastTriggered: '2026-07-05T14:30:00Z',
    agents: ['Layla', 'Ahmed'],
  },
  {
    id: '2',
    name: 'No Delivery Promises',
    description: 'Never promise specific delivery dates - always say "approximately"',
    category: 'commitments',
    severity: 'high',
    enabled: true,
    triggerCount: 8,
    lastTriggered: '2026-07-04T11:20:00Z',
    agents: ['Layla', 'Ahmed', 'Sales Bot'],
  },
  {
    id: '3',
    name: 'Legal Escalation',
    description: 'Always escalate to human if customer mentions legal terms, contracts, or lawyers',
    category: 'escalation',
    severity: 'critical',
    enabled: true,
    triggerCount: 3,
    lastTriggered: '2026-07-03T09:15:00Z',
    agents: ['Layla', 'Ahmed'],
  },
  {
    id: '4',
    name: 'Refund Approval',
    description: 'All refund requests require manager approval before processing',
    category: 'refunds',
    severity: 'high',
    enabled: true,
    triggerCount: 5,
    lastTriggered: '2026-07-05T10:45:00Z',
    agents: ['Support Bot'],
  },
  {
    id: '5',
    name: 'Competitor Mention',
    description: 'Log but do not engage in competitor comparisons - escalate to sales',
    category: 'competitors',
    severity: 'medium',
    enabled: false,
    triggerCount: 0,
    lastTriggered: null,
    agents: ['Sales Bot'],
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  pricing: DollarSign,
  commitments: Calendar,
  escalation: AlertTriangle,
  refunds: DollarSign,
  competitors: MessageSquare,
};

const severityColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-blue-500',
  low: 'bg-slate-500',
};

export default function SafetyLayerPage() {
  const [rules, setRules] = useState(mockSafetyRules);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedRule, setSelectedRule] = useState(mockSafetyRules[0]);

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || rule.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 8 — Module 3</p>
            <h1 className="text-3xl font-semibold text-white">Agent Safety Layer</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Define hard limits that no agent can cross under any circumstances. Safety rules are enforced at the infrastructure level — not just in prompts.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Shield className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Total Rules</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{rules.length}</p>
            <p className="text-xs text-slate-500">Defined</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Active</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">{rules.filter(r => r.enabled).length}</p>
            <p className="text-xs text-slate-500">Enforcing</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Triggered</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-amber-400">{rules.reduce((sum, r) => sum + r.triggerCount, 0)}</p>
            <p className="text-xs text-slate-500">This month</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <XCircle className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Critical</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-red-400">{rules.filter(r => r.severity === 'critical').length}</p>
            <p className="text-xs text-slate-500">Always on</p>
          </div>
        </div>
      </div>

      {/* Add Rule Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search rules..."
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
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="pricing">Pricing</SelectItem>
              <SelectItem value="commitments">Commitments</SelectItem>
              <SelectItem value="escalation">Escalation</SelectItem>
              <SelectItem value="refunds">Refunds</SelectItem>
              <SelectItem value="competitors">Competitors</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Rules List */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Safety Rules</CardTitle>
            <CardDescription className="text-slate-400">
              Configure agent boundaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredRules.map((rule) => {
                  const CategoryIcon = categoryIcons[rule.category] || Shield;
                  return (
                    <div
                      key={rule.id}
                      onClick={() => setSelectedRule(rule)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        selectedRule.id === rule.id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-slate-900`}>
                            <CategoryIcon className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{rule.name}</span>
                              <div className={`h-2 w-2 rounded-full ${severityColors[rule.severity]}`} />
                            </div>
                            <p className="text-xs text-slate-500 capitalize">{rule.category}</p>
                          </div>
                        </div>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                      </div>
                      {rule.triggerCount > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Triggered {rule.triggerCount}x</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Rule Details */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">{selectedRule.name}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-400 hover:text-red-400">
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-slate-400">Description</h4>
                <p className="mt-2 text-white">{selectedRule.description}</p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <p className="text-lg font-semibold text-white">{selectedRule.enabled ? 'Enforcing' : 'Disabled'}</p>
                </div>
                <Switch
                  checked={selectedRule.enabled}
                  onCheckedChange={() => toggleRule(selectedRule.id)}
                />
              </div>

              {/* Severity */}
              <div>
                <h4 className="text-sm font-medium text-slate-400">Severity</h4>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${severityColors[selectedRule.severity]}`} />
                  <span className="text-white capitalize">{selectedRule.severity}</span>
                  <Badge className={`${
                    selectedRule.severity === 'critical' ? 'bg-red-500' :
                    selectedRule.severity === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}>
                    {selectedRule.severity}
                  </Badge>
                </div>
              </div>

              {/* Applied Agents */}
              <div>
                <h4 className="text-sm font-medium text-slate-400">Applied To</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedRule.agents.map((agent) => (
                    <Badge key={agent} variant="outline" className="border-slate-700">
                      {agent}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Times Triggered</p>
                  <p className="mt-1 text-2xl font-semibold text-amber-400">{selectedRule.triggerCount}</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Last Triggered</p>
                  <p className="mt-1 text-lg font-semibold text-white">{formatTimestamp(selectedRule.lastTriggered)}</p>
                </div>
              </div>

              {/* Test Rule */}
              <Button className="w-full">
                <Brain className="mr-2 h-4 w-4" />
                Test Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}