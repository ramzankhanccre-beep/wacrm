'use client';

import { useState } from 'react';
import {
  Brain,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Lightbulb,
  FileText,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data for agent performance analysis
const mockAgentPerformance = [
  {
    id: '1',
    name: 'Layla',
    status: 'Live',
    totalConversations: 1247,
    avgResponseTime: 2.3,
    resolutionRate: 87.5,
    escalationRate: 12.5,
    failedIntents: 23,
    weekOverWeek: +5.2,
  },
  {
    id: '2',
    name: 'Ahmed',
    status: 'Live',
    totalConversations: 892,
    avgResponseTime: 3.1,
    resolutionRate: 72.3,
    escalationRate: 27.7,
    failedIntents: 45,
    weekOverWeek: -2.1,
  },
  {
    id: '3',
    name: 'Sales Bot',
    status: 'Testing',
    totalConversations: 156,
    avgResponseTime: 1.8,
    resolutionRate: 91.2,
    escalationRate: 8.8,
    failedIntents: 8,
    weekOverWeek: +12.4,
  },
];

const mockImprovementRecommendations = [
  {
    id: '1',
    agentName: 'Layla',
    category: 'Prompt',
    severity: 'high',
    title: 'Prompt section 3 caused 12 incorrect responses this week',
    description: 'The greeting section is too verbose and customers are responding before the agent finishes introducing itself.',
    suggestion: 'Shorten greeting to 2 sentences max. Consider adding a pause before asking questions.',
    affectedConversations: 12,
    confidence: 94,
  },
  {
    id: '2',
    agentName: 'Ahmed',
    category: 'Knowledge',
    severity: 'medium',
    title: 'Missing pricing information in knowledge base',
    description: '3 customers asked about premium tier pricing but agent could not retrieve the information.',
    suggestion: 'Add premium tier pricing document to the knowledge base.',
    affectedConversations: 3,
    confidence: 88,
  },
  {
    id: '3',
    agentName: 'Ahmed',
    category: 'Tool',
    severity: 'high',
    title: 'Lead creation tool not triggered for 8 qualified leads',
    description: 'Agent correctly identified leads but failed to create CRM records automatically.',
    suggestion: 'Add explicit tool call trigger when lead score exceeds 70.',
    affectedConversations: 8,
    confidence: 91,
  },
];

export default function SelfImprovementPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-950/30 border-red-800';
      case 'medium':
        return 'text-amber-400 bg-amber-950/30 border-amber-800';
      default:
        return 'text-blue-400 bg-blue-950/30 border-blue-800';
    }
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 7 — Module 1</p>
            <h1 className="text-3xl font-semibold text-white">AI Self-Improvement</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Agents analyze their own performance metrics, failed intents, and escalations to generate
          actionable improvement reports. Every recommendation requires your approval before deployment.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Total Analyses</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">3</p>
            <p className="text-xs text-slate-500">Active agents tracked</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Open Issues</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">3</p>
            <p className="text-xs text-slate-500">Recommendations pending</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Resolved</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">12</p>
            <p className="text-xs text-slate-500">Issues resolved this month</p>
          </div>
        </div>
      </div>

      {/* Run Analysis Button */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Run Performance Analysis</h3>
          <p className="text-sm text-slate-400">Analyze all agent performance metrics and generate new recommendations</p>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="min-w-[180px]"
        >
          {analyzing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Agent Performance Table */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Agent Performance</CardTitle>
            <CardDescription className="text-slate-400">
              Current performance metrics across all agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {mockAgentPerformance.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      selectedAgent === agent.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-white">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{agent.name}</p>
                          <p className="text-xs text-slate-500">{agent.status}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        agent.weekOverWeek >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {agent.weekOverWeek >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span>{Math.abs(agent.weekOverWeek)}%</span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-slate-500">Conversations</p>
                        <p className="text-lg font-semibold text-white">{agent.totalConversations}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Resolution</p>
                        <p className="text-lg font-semibold text-emerald-400">{agent.resolutionRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Escalations</p>
                        <p className="text-lg font-semibold text-amber-400">{agent.escalationRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Improvement Recommendations</CardTitle>
            <CardDescription className="text-slate-400">
              AI-generated suggestions with confidence scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {mockImprovementRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`rounded-2xl border p-4 ${getSeverityColor(rec.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-slate-700 text-slate-300">
                          {rec.category}
                        </Badge>
                        <span className="text-xs text-slate-500">{rec.agentName}</span>
                      </div>
                      <span className="text-xs text-slate-500">{rec.confidence}% confidence</span>
                    </div>
                    <h4 className="mt-3 font-medium text-white">{rec.title}</h4>
                    <p className="mt-2 text-sm text-slate-400">{rec.description}</p>
                    <div className="mt-4 rounded-xl bg-slate-950 p-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Lightbulb className="h-4 w-4" />
                        <span className="text-sm font-medium">Suggested Fix</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{rec.suggestion}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Affects {rec.affectedConversations} conversations
                      </span>
                      <Button size="sm" variant="secondary">
                        Review <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Critical Rule */}
      <div className="rounded-2xl border border-amber-800/50 bg-amber-950/20 p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-amber-400" />
          <div>
            <h3 className="font-semibold text-amber-200">Human Approval Required</h3>
            <p className="mt-1 text-sm text-amber-100/70">
              No self-improvement change is ever deployed automatically. Every recommendation
              requires explicit user approval. Agents present, humans decide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}