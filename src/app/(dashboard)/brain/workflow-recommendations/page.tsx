'use client';

import { useState } from 'react';
import {
  Workflow,
  Lightbulb,
  Zap,
  ArrowRight,
  Clock,
  Repeat,
  Play,
  Check,
  X,
  BarChart3,
  Users,
  Settings,
  Plus,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock repetitive action data
const mockRepetitiveActions = [
  {
    id: '1',
    actionName: 'Follow-up after no response',
    frequency: 45,
    timeframe: '30 days',
    performedBy: 'Human',
    lastPerformed: '2026-07-04',
    estimatedTimeSaved: '2h 15m/day',
    status: 'detected',
  },
  {
    id: '2',
    actionName: 'Manually updating lead stage',
    frequency: 78,
    timeframe: '30 days',
    performedBy: 'Human',
    lastPerformed: '2026-07-05',
    estimatedTimeSaved: '1h 30m/day',
    status: 'detected',
  },
  {
    id: '3',
    actionName: 'Sending pricing PDF to prospects',
    frequency: 32,
    timeframe: '30 days',
    performedBy: 'Human',
    lastPerformed: '2026-07-03',
    estimatedTimeSaved: '45m/day',
    status: 'recommended',
  },
];

// Mock workflow recommendations
const mockWorkflowRecs = [
  {
    id: '1',
    name: 'Auto Follow-Up Sequence',
    description: 'Automatically send follow-up messages after 24h of no response',
    trigger: 'No response for 24 hours',
    actions: [
      'Send templated follow-up message',
      'Wait 2 hours',
      'If no response, escalate to human',
    ],
    timeSaved: '2h 15m/day',
    confidence: 94,
    status: 'ready',
    category: 'follow-up',
  },
  {
    id: '2',
    name: 'Lead Stage Automation',
    description: 'Automatically update lead stages based on conversation signals',
    trigger: 'Intent detected: "interested", "need more info", "not interested"',
    actions: [
      'Detect lead stage intent',
      'Update CRM lead stage',
      'Notify assigned agent',
    ],
    timeSaved: '1h 30m/day',
    confidence: 89,
    status: 'ready',
    category: 'automation',
  },
  {
    id: '3',
    name: 'Pricing PDF Auto-Send',
    description: 'Send pricing PDF automatically when customer asks for pricing',
    trigger: 'Message contains "pricing" or "price" or "cost"',
    actions: [
      'Detect pricing intent',
      'Retrieve relevant pricing document',
      'Send with personalized intro',
    ],
    timeSaved: '45m/day',
    confidence: 87,
    status: 'draft',
    category: 'content',
  },
];

export default function WorkflowRecommendationsPage() {
  const [selectedRec, setSelectedRec] = useState(mockWorkflowRecs[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 2500);
  };

  const handleGenerate = (recId: string) => {
    setGenerating(recId);
    setTimeout(() => setGenerating(null), 3000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'follow-up':
        return 'bg-blue-500';
      case 'automation':
        return 'bg-purple-500';
      case 'content':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Workflow className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 7 — Module 4</p>
            <h1 className="text-3xl font-semibold text-white">Workflow Recommendations</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Monitor repetitive manual actions taken by human agents. Suggest automation workflows
          to replace those actions. Generate workflows automatically — one-click activation.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Repeat className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Detected</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">3</p>
            <p className="text-xs text-slate-500">Repetitive actions</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Zap className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Savings</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">4.5h</p>
            <p className="text-xs text-slate-500">Potential time saved/day</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Lightbulb className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Suggestions</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">3</p>
            <p className="text-xs text-slate-500">Workflows recommended</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Play className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Active</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">2</p>
            <p className="text-xs text-slate-500">Workflows running</p>
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Analyze Human Actions</h3>
          <p className="text-sm text-slate-400">Scan conversations for repetitive manual actions</p>
        </div>
        <Button onClick={handleAnalyze} disabled={analyzing} className="min-w-[180px]">
          {analyzing ? (
            <>
              <Settings className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <BarChart3 className="mr-2 h-4 w-4" />
              Scan Actions
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Repetitive Actions */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Detected Repetitive Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Manual actions performed repeatedly by human agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {mockRepetitiveActions.map((action) => (
                  <div
                    key={action.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{action.actionName}</h4>
                      <Badge
                        variant="outline"
                        className={action.status === 'recommended' ? 'border-emerald-700 text-emerald-400' : 'border-slate-700'}
                      >
                        {action.status}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Frequency</p>
                        <p className="text-white">{action.frequency}x / {action.timeframe}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Time Saved</p>
                        <p className="text-emerald-400">{action.estimatedTimeSaved}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>Performed by: {action.performedBy}</span>
                      <span>Last: {action.lastPerformed}</span>
                    </div>
                    <Button variant="secondary" size="sm" className="mt-4 w-full">
                      <Lightbulb className="mr-2 h-3 w-3" />
                      Generate Workflow
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Workflow Recommendations */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Workflow Suggestions</CardTitle>
            <CardDescription className="text-slate-400">
              AI-generated automation workflows ready for activation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {mockWorkflowRecs.map((rec) => (
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
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getCategoryColor(rec.category)}`} />
                        <h4 className="font-medium text-white">{rec.name}</h4>
                      </div>
                      <Badge
                        className={rec.status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'}
                      >
                        {rec.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{rec.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span className="text-emerald-400">{rec.timeSaved} saved</span>
                      <span>{rec.confidence}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Selected Workflow Detail */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">{selectedRec.name}</CardTitle>
          <CardDescription className="text-slate-400">
            Review and activate this workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-400">Trigger</h4>
                <p className="mt-2 rounded-lg bg-slate-950 p-3 text-sm text-white">
                  {selectedRec.trigger}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400">Actions</h4>
                <div className="mt-2 space-y-2">
                  {selectedRec.actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">
                        {index + 1}
                      </div>
                      <p className="text-sm text-slate-300">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Time Saved</span>
                  <span className="text-lg font-semibold text-emerald-400">{selectedRec.timeSaved}</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Confidence</span>
                    <span className="text-white">{selectedRec.confidence}%</span>
                  </div>
                  <Progress value={selectedRec.confidence} className="h-2" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => handleGenerate(selectedRec.id)}
                  disabled={generating === selectedRec.id}
                >
                  {generating === selectedRec.id ? (
                    <>
                      <Settings className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Workflow
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" className="w-full text-slate-400">
                Preview in Editor <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}