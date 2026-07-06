'use client';

import { useState } from 'react';
import {
  Play,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Cpu,
  Zap,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowRight,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock change types
const changeTypes = [
  { id: 'prompt', label: 'Prompt Update', icon: Cpu },
  { id: 'skill', label: 'Add Skill', icon: Zap },
  { id: 'workflow', label: 'Workflow Change', icon: Activity },
  { id: 'model', label: 'Model Switch', icon: Settings },
];

// Mock simulation result
const mockResult = {
  resolutionRate: { current: 87, predicted: 91, change: '+4%' },
  escalationRate: { current: 12.5, predicted: 8.2, change: '-34%' },
  avgResponseTime: { current: '2.3s', predicted: '1.9s', change: '-17%' },
  costPerConversation: { current: 0.042, predicted: 0.038, change: '-10%' },
  customerSatisfaction: { current: 4.7, predicted: 4.9, change: '+4%' },
  confidence: 87,
  sampleConversations: 156,
  warnings: [
    'Model switch may affect complex reasoning',
    '2 test cases showed knowledge retrieval gaps',
  ],
};

export default function AISimulatorPage() {
  const [step, setStep] = useState<'configure' | 'simulating' | 'results'>('configure');
  const [changeType, setChangeType] = useState('');
  const [changeDetails, setChangeDetails] = useState('');

  const handleSimulate = () => {
    setStep('simulating');
    setTimeout(() => setStep('results'), 3000);
  };

  const getChangeIcon = (id: string) => {
    const type = changeTypes.find(t => t.id === id);
    return type?.icon || Cpu;
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Play className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 10 — Module 3</p>
            <h1 className="text-3xl font-semibold text-white">AI Workforce Simulator</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Before deploying changes, simulate their impact on the entire AI workforce.
          Test proposed agent changes, prompt updates, skill additions, or workflow modifications against real historical conversations.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Play className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Simulations</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">42</p>
            <p className="text-xs text-slate-500">Run this month</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Activity className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Accuracy</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">87%</p>
            <p className="text-xs text-slate-500">Prediction accuracy</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Samples</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">12.4k</p>
            <p className="text-xs text-slate-500">Conversations replayed</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Avg Improvement</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-primary">+23%</p>
            <p className="text-xs text-slate-500">Post-deploy</p>
          </div>
        </div>
      </div>

      {/* Configuration */}
      {step === 'configure' && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white">Configure Simulation</CardTitle>
            <CardDescription className="text-slate-400">
              Select the change you want to simulate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-white">Change Type</label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {changeTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setChangeType(type.id)}
                    className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                      changeType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <type.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium text-white">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white">Change Details</label>
              <textarea
                value={changeDetails}
                onChange={(e) => setChangeDetails(e.target.value)}
                placeholder="Describe the change you want to simulate (e.g., 'Add price objection handling to Layla's prompt')..."
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 p-4 text-white placeholder:text-slate-500"
                rows={4}
              />
            </div>

            <Button className="w-full" onClick={handleSimulate} disabled={!changeType || !changeDetails}>
              <Play className="mr-2 h-4 w-4" />
              Run Simulation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Simulating */}
      {step === 'simulating' && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-xl font-semibold text-white">Running Simulation...</p>
            <p className="mt-2 text-slate-400">Testing against {mockResult.sampleConversations} historical conversations</p>
            <Progress value={65} className="mt-6 w-full max-w-md" />
            <p className="mt-2 text-sm text-slate-500">Analyzing conversation patterns...</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {step === 'results' && (
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Simulation Results</CardTitle>
              <CardDescription className="text-slate-400">
                Predicted impact based on {mockResult.sampleConversations} sample conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Metrics */}
                <div className="space-y-4">
                  {Object.entries(mockResult).filter(([k]) => !['confidence', 'sampleConversations', 'warnings'].includes(k)).map(([key, data]: [string, any]) => (
                    <div key={key} className="rounded-xl bg-slate-950 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <Badge className={data.change.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : data.change.startsWith('-') && key.includes('Rate') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                          {data.change}
                        </Badge>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-semibold text-white">{data.current}</span>
                        <ArrowRight className="h-4 w-4 text-slate-600 mb-1" />
                        <span className="text-2xl font-semibold text-primary">{data.predicted}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Confidence */}
                <div className="rounded-xl bg-slate-950 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-medium">Confidence Score</span>
                    <Badge className="bg-primary/20 text-primary">{mockResult.confidence}%</Badge>
                  </div>
                  <Progress value={mockResult.confidence} className="h-3" />
                  <p className="mt-4 text-sm text-slate-400">
                    Based on {mockResult.sampleConversations} sample conversations from the past 30 days.
                  </p>
                </div>

                {/* Warnings */}
                <div className="rounded-xl bg-slate-950 p-6">
                  <h4 className="font-medium text-white mb-4">Warnings</h4>
                  <div className="space-y-3">
                    {mockResult.warnings.map((warning, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
                        <span className="text-sm text-slate-300">{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-run Simulation
            </Button>
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Deploy Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}