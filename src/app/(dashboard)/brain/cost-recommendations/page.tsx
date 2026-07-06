'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Brain,
  BarChart3,
  Settings,
  ArrowRight,
  Calculator,
  Zap,
  Clock,
  Check,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock token usage data
const mockAgentUsage = [
  {
    id: '1',
    name: 'Layla',
    model: 'GPT-4o',
    dailyTokens: 1250000,
    dailyCost: 45.50,
    avgResponseTokens: 850,
    conversations: 1247,
    status: 'optimal',
  },
  {
    id: '2',
    name: 'Ahmed',
    model: 'GPT-4 Turbo',
    dailyTokens: 890000,
    dailyCost: 28.90,
    avgResponseTokens: 620,
    conversations: 892,
    status: 'optimizable',
  },
  {
    id: '3',
    name: 'Sales Bot',
    model: 'GPT-4o',
    dailyTokens: 2100000,
    dailyCost: 78.00,
    avgResponseTokens: 1200,
    conversations: 156,
    status: 'high',
  },
];

// Mock cost recommendations
const mockRecommendations = [
  {
    id: '1',
    agentName: 'Ahmed',
    currentModel: 'GPT-4 Turbo',
    recommendedModel: 'GPT-3.5 Turbo',
    reason: 'Simple conversation patterns with minimal complexity',
    projectedSavings: 18.70,
    savingsPercent: 65,
    impact: 'Low - Most conversations are straightforward FAQ and booking',
    risk: 'low',
    modelDetails: {
      current: { context: '128k', pricePer1k: 0.03 },
      recommended: { context: '16k', pricePer1k: 0.0015 },
    },
  },
  {
    id: '2',
    agentName: 'Sales Bot',
    currentModel: 'GPT-4o',
    recommendedModel: 'GPT-4o Mini',
    reason: 'High volume, low complexity interactions',
    projectedSavings: 52.00,
    savingsPercent: 67,
    impact: 'Medium - May struggle with complex multi-step negotiations',
    risk: 'medium',
    modelDetails: {
      current: { context: '128k', pricePer1k: 0.03 },
      recommended: { context: '128k', pricePer1k: 0.006 },
    },
  },
  {
    id: '3',
    agentName: 'Layla',
    currentModel: 'GPT-4o',
    recommendedModel: 'GPT-4o',
    reason: 'Already on optimal model for conversation type',
    projectedSavings: 0,
    savingsPercent: 0,
    impact: 'None - Current model is ideal for conversation complexity',
    risk: 'none',
    modelDetails: null,
  },
];

// Model options for reference
const modelOptions = [
  { name: 'GPT-4o', context: '128k', inputPrice: 0.03, outputPrice: 0.06 },
  { name: 'GPT-4o Mini', context: '128k', inputPrice: 0.006, outputPrice: 0.024 },
  { name: 'GPT-4 Turbo', context: '128k', inputPrice: 0.03, outputPrice: 0.06 },
  { name: 'GPT-3.5 Turbo', context: '16k', inputPrice: 0.0015, outputPrice: 0.002 },
  { name: 'Claude 3.5 Sonnet', context: '200k', inputPrice: 0.015, outputPrice: 0.075 },
  { name: 'Claude 3 Haiku', context: '200k', inputPrice: 0.00025, outputPrice: 0.00125 },
];

export default function CostRecommendationsPage() {
  const [selectedRec, setSelectedRec] = useState(mockRecommendations[0]);
  const [simulating, setSimulating] = useState<string | null>(null);

  const handleSimulate = (recId: string) => {
    setSimulating(recId);
    setTimeout(() => setSimulating(null), 2000);
  };

  const totalProjectedSavings = mockRecommendations
    .filter(r => r.id !== '3')
    .reduce((sum, r) => sum + r.projectedSavings, 0);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-emerald-400 bg-emerald-950/30 border-emerald-800';
      case 'medium':
        return 'text-amber-400 bg-amber-950/30 border-amber-800';
      case 'none':
        return 'text-blue-400 bg-blue-950/30 border-blue-800';
      default:
        return 'text-slate-400 bg-slate-950/30 border-slate-800';
    }
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 7 — Module 5</p>
            <h1 className="text-3xl font-semibold text-white">Cost Recommendations</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Monitor token usage patterns across all agents. Identify over-provisioned agents and
          recommend lower-cost models. Simulate cost impact of model switches before applying changes.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Daily Cost</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">$152.40</p>
            <p className="text-xs text-slate-500">All agents</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Brain className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Tokens/Day</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">4.24M</p>
            <p className="text-xs text-slate-500">All agents</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Potential Save</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">${totalProjectedSavings.toFixed(2)}</p>
            <p className="text-xs text-slate-500">Per day</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Zap className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Optimizations</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">2</p>
            <p className="text-xs text-slate-500">Available</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Agent Usage */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Agent Token Usage</CardTitle>
            <CardDescription className="text-slate-400">
              Current daily costs per agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <div className="space-y-3">
                {mockAgentUsage.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => {
                      const rec = mockRecommendations.find(r => r.agentName === agent.name);
                      if (rec) setSelectedRec(rec);
                    }}
                    className="cursor-pointer rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{agent.name}</span>
                      <Badge
                        className={agent.status === 'optimal' ? 'bg-emerald-500' : agent.status === 'optimizable' ? 'bg-amber-500' : 'bg-red-500'}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{agent.model}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">${agent.dailyCost}</p>
                        <p className="text-xs text-slate-500">/day</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">{(agent.dailyTokens / 1000000).toFixed(2)}M</p>
                        <p className="text-xs text-slate-500">tokens</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recommendations List */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Cost Optimization Recommendations</CardTitle>
            <CardDescription className="text-slate-400">
              Model switches that can reduce costs without significant impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <div className="space-y-4">
                {mockRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRec(rec)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      selectedRec.id === rec.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{rec.agentName}</h4>
                        <p className="text-sm text-slate-500">{rec.reason}</p>
                      </div>
                      <div className="text-right">
                        {rec.projectedSavings > 0 ? (
                          <p className="text-lg font-semibold text-emerald-400">
                            -${rec.projectedSavings.toFixed(2)}/day
                          </p>
                        ) : (
                          <p className="text-lg font-semibold text-blue-400">Optimal</p>
                        )}
                        <p className="text-xs text-slate-500">{rec.savingsPercent}% savings</p>
                      </div>
                    </div>
                    {rec.projectedSavings > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="outline" className="border-slate-700">
                          {rec.currentModel} → {rec.recommendedModel}
                        </Badge>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(rec.risk)}`}>
                          {rec.risk} risk
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Selected Recommendation Detail */}
      {selectedRec.projectedSavings > 0 && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">
              Cost Simulation: {selectedRec.agentName}
            </CardTitle>
            <CardDescription className="text-slate-400">
              Review impact before applying model change
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Comparison */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-400">Model Comparison</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-950 p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Current</p>
                    <p className="mt-2 text-lg font-semibold text-white">{selectedRec.currentModel}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      ${selectedRec.modelDetails?.current.pricePer1k}/1k tokens
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Context: {selectedRec.modelDetails?.current.context}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-4">
                    <p className="text-xs text-emerald-400 uppercase tracking-wider">Recommended</p>
                    <p className="mt-2 text-lg font-semibold text-white">{selectedRec.recommendedModel}</p>
                    <p className="mt-1 text-sm text-emerald-400">
                      ${selectedRec.modelDetails?.recommended.pricePer1k}/1k tokens
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Context: {selectedRec.modelDetails?.recommended.context}
                    </p>
                  </div>
                </div>
              </div>

              {/* Impact */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-400">Expected Impact</h4>
                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-300">{selectedRec.impact}</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Risk Level</span>
                    <span className={`text-sm font-medium ${selectedRec.risk === 'low' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {selectedRec.risk.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-400">Actions</h4>
                <div className="rounded-xl bg-slate-950 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Daily Savings</span>
                    <span className="text-xl font-semibold text-emerald-400">
                      ${selectedRec.projectedSavings.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Monthly</span>
                    <span className="text-lg font-semibold text-emerald-400">
                      ${(selectedRec.projectedSavings * 30).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Yearly</span>
                    <span className="text-lg font-semibold text-emerald-400">
                      ${(selectedRec.projectedSavings * 365).toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleSimulate(selectedRec.id)}
                  disabled={simulating === selectedRec.id}
                >
                  {simulating === selectedRec.id ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Simulate Impact
                    </>
                  )}
                </Button>
                <Button variant="outline" className="w-full">
                  Apply Change <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Recommendation */}
      {selectedRec.projectedSavings === 0 && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Check className="h-12 w-12 text-emerald-400" />
            <p className="mt-4 text-lg font-medium text-white">Already Optimal</p>
            <p className="mt-2 text-slate-400 text-center max-w-md">
              {selectedRec.agentName} is using the optimal model for their conversation type.
              No cost savings available without impacting quality.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}