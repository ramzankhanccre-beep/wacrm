'use client';

import { useState } from 'react';
import {
  GraduationCap,
  History,
  Clock,
  TrendingUp,
  Shield,
  ChevronRight,
  RotateCcw,
  BarChart3,
  Star,
  Award,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Agent autonomy levels
const autonomyLevels = [
  { level: 1, name: 'Learning', description: 'Requires human approval for all actions', color: 'bg-red-500' },
  { level: 2, name: 'Assisted', description: 'Human reviews before sending messages', color: 'bg-amber-500' },
  { level: 3, name: 'Supervised', description: 'Auto-sends, human notified on escalations', color: 'bg-blue-500' },
  { level: 4, name: 'Autonomous', description: 'Operates independently with monitoring', color: 'bg-emerald-500' },
];

// Mock agent data with evolution history
const mockAgents = [
  {
    id: '1',
    name: 'Layla',
    currentLevel: 3,
    performanceScore: 92,
    totalConversations: 1247,
    uptime: 99.8,
    graduationProgress: 75,
    version: '2.4.1',
    lastUpdated: '2026-07-01',
    evolutionHistory: [
      { version: '2.4.1', date: '2026-07-01', change: 'Updated greeting prompt', author: 'AI Analysis' },
      { version: '2.4.0', date: '2026-06-25', change: 'Added booking skill', author: 'Human' },
      { version: '2.3.0', date: '2026-06-18', change: 'Upgraded to autonomy level 3', author: 'System' },
      { version: '2.2.0', date: '2026-06-10', change: 'Fixed pricing knowledge gap', author: 'AI Analysis' },
    ],
  },
  {
    id: '2',
    name: 'Ahmed',
    currentLevel: 2,
    performanceScore: 71,
    totalConversations: 892,
    uptime: 96.2,
    graduationProgress: 45,
    version: '1.8.2',
    lastUpdated: '2026-06-28',
    evolutionHistory: [
      { version: '1.8.2', date: '2026-06-28', change: 'Added escalation triggers', author: 'Human' },
      { version: '1.8.1', date: '2026-06-20', change: 'Reduced prompt verbosity', author: 'AI Analysis' },
      { version: '1.8.0', date: '2026-06-15', change: 'Upgraded to autonomy level 2', author: 'System' },
    ],
  },
  {
    id: '3',
    name: 'Sales Bot',
    currentLevel: 4,
    performanceScore: 96,
    totalConversations: 156,
    uptime: 99.9,
    graduationProgress: 100,
    version: '3.0.0',
    lastUpdated: '2026-07-03',
    evolutionHistory: [
      { version: '3.0.0', date: '2026-07-03', change: 'Graduated to level 4 autonomous', author: 'System' },
      { version: '2.9.0', date: '2026-06-28', change: 'Added CRM integration', author: 'Human' },
      { version: '2.8.0', date: '2026-06-22', change: 'Upgraded to autonomy level 3', author: 'System' },
    ],
  },
];

export default function AgentEvolutionPage() {
  const [selectedAgent, setSelectedAgent] = useState(mockAgents[0]);
  const [showRollback, setShowRollback] = useState(false);

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 7 — Module 2</p>
            <h1 className="text-3xl font-semibold text-white">Agent Evolution</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Track agent performance over time with detailed timelines. Version every agent configuration
          with full rollback capability. Agents can graduate to higher autonomy levels as their performance improves.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Agents</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">3</p>
            <p className="text-xs text-slate-500">Tracked</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Star className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Avg Score</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">86</p>
            <p className="text-xs text-slate-500">Performance rating</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Award className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Graduated</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">1</p>
            <p className="text-xs text-slate-500">Level 4 agents</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <History className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Versions</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">14</p>
            <p className="text-xs text-slate-500">Total configs</p>
          </div>
        </div>
      </div>

      {/* Autonomy Levels */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Autonomy Levels</CardTitle>
          <CardDescription className="text-slate-400">
            Agents graduate through levels as performance improves
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            {autonomyLevels.map((level) => (
              <div
                key={level.level}
                className={`rounded-2xl border p-4 ${
                  selectedAgent.currentLevel === level.level
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className={`h-2 w-full rounded-full ${level.color} mb-3`} />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">Level {level.level}</span>
                  <Badge variant="outline" className="border-slate-700">
                    {level.name}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-slate-500">{level.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Agent List */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Agents</CardTitle>
            <CardDescription className="text-slate-400">
              Select an agent to view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAgents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    selectedAgent.id === agent.id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{agent.name}</span>
                    <Badge className={`${
                      agent.currentLevel === 4 ? 'bg-emerald-500' :
                      agent.currentLevel === 3 ? 'bg-blue-500' :
                      agent.currentLevel === 2 ? 'bg-amber-500' : 'bg-red-500'
                    }`}>
                      L{agent.currentLevel}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>v{agent.version}</span>
                    <span>{agent.performanceScore}% score</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Graduation progress</span>
                      <span className="text-white">{agent.graduationProgress}%</span>
                    </div>
                    <Progress value={agent.graduationProgress} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent Details & History */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">{selectedAgent.name} — Version {selectedAgent.version}</CardTitle>
                <CardDescription className="text-slate-400">
                  Last updated: {selectedAgent.lastUpdated}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRollback(!showRollback)}
              >
                <RotateCcw className="mr-2 h-3 w-3" />
                Rollback
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 rounded-xl bg-slate-950 p-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-white">{selectedAgent.performanceScore}%</p>
                  <p className="text-xs text-slate-500">Performance</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-white">{selectedAgent.totalConversations}</p>
                  <p className="text-xs text-slate-500">Conversations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-emerald-400">{selectedAgent.uptime}%</p>
                  <p className="text-xs text-slate-500">Uptime</p>
                </div>
              </div>

              {/* Version History */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-white flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Version History
                </h4>
                <div className="space-y-3">
                  {selectedAgent.evolutionHistory.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        {index < selectedAgent.evolutionHistory.length - 1 && (
                          <div className="h-8 w-px bg-slate-800" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{item.version}</span>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="h-3 w-3" />
                            {item.date}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{item.change}</p>
                        <Badge variant="outline" className="mt-2 border-slate-700 text-xs">
                          {item.author}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graduation Alert */}
      {selectedAgent.graduationProgress >= 100 && selectedAgent.currentLevel < 4 && (
        <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-6">
          <div className="flex items-start gap-4">
            <Award className="h-6 w-6 text-emerald-400" />
            <div>
              <h3 className="font-semibold text-emerald-200">Ready for Graduation</h3>
              <p className="mt-1 text-sm text-emerald-100/70">
                {selectedAgent.name} has met all requirements for Level {selectedAgent.currentLevel + 1}.
                Review and approve the graduation to increase autonomy.
              </p>
              <Button className="mt-4" size="sm">
                Review Graduation <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Warning */}
      {showRollback && (
        <div className="rounded-2xl border border-amber-800/50 bg-amber-950/20 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-200">Rollback Configuration</h3>
              <p className="mt-1 text-sm text-amber-100/70">
                Rolling back will restore all agent settings, prompts, skills, and tools to the selected version.
                Current version: {selectedAgent.version}
              </p>
              <Button variant="outline" className="mt-4" size="sm">
                Select Version to Rollback
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}