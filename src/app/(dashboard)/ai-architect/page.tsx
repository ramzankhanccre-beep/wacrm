'use client';

import { useState } from 'react';
import {
  Brain,
  Building2,
  Users,
  DollarSign,
  Target,
  Cpu,
  Zap,
  Workflow,
  ChevronRight,
  Check,
  RefreshCw,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock analysis result
const mockAnalysisResult = {
  businessType: 'Real Estate',
  teamSize: '10-25 employees',
  currentAgents: 2,
  recommendedAgents: 4,
  recommendedSkills: ['Lead Qualification', 'Appointment Booking', 'CRM Sync', 'Follow-up Automation'],
  recommendedWorkflows: ['Lead Nurture Sequence', 'Booking Confirmation Flow', 'Post-showing Follow-up'],
  estimatedMonthlyCost: 799,
  projectedImprovement: {
    leadsQualified: '+35%',
    bookingsScheduled: '+50%',
    responseTime: '-40%',
    customerSatisfaction: '+15%',
  },
};

const agentRecommendations = [
  {
    role: 'Sales Agent',
    name: 'Primary Sales',
    description: 'Handle inbound inquiries, qualify leads, and pitch properties',
    priority: 'high',
    skills: ['Lead Qualification', 'Property Matching', 'CRM Sync'],
    monthlyCost: 199,
  },
  {
    role: 'Booking Agent',
    name: 'Scheduling Specialist',
    description: 'Manage property viewings, schedule appointments, send reminders',
    priority: 'high',
    skills: ['Appointment Booking', 'Calendar Sync', 'Reminder Automation'],
    monthlyCost: 149,
  },
  {
    role: 'Support Agent',
    name: 'Property Support',
    description: 'Handle property inquiries, neighborhood questions, amenities info',
    priority: 'medium',
    skills: ['FAQ Handling', 'Knowledge Base', 'Escalation'],
    monthlyCost: 149,
  },
  {
    role: 'Follow-up Agent',
    name: 'Nurture Specialist',
    description: 'Re-engage cold leads, post-viewing follow-ups, check-in calls',
    priority: 'medium',
    skills: ['Follow-up Automation', 'Lead Scoring', 'Notification'],
    monthlyCost: 149,
  },
];

export default function AIArchitectPage() {
  const [step, setStep] = useState<'input' | 'analyzing' | 'results'>('input');
  const [businessDescription, setBusinessDescription] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [budget, setBudget] = useState('');

  const handleAnalyze = () => {
    setStep('analyzing');
    setTimeout(() => setStep('results'), 2500);
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
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 10 — Module 1</p>
            <h1 className="text-3xl font-semibold text-white">Workspace AI Architect</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          An AI that analyses your entire workspace and designs the optimal AI workforce structure.
          Input your business description, goals, team size, and budget. Get recommended agent team design, skill configuration, workflow map, and cost estimate.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Building2 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Business Types</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">15+</p>
            <p className="text-xs text-slate-500">Analyzed</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Brain className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Architects</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">24</p>
            <p className="text-xs text-slate-500">Designed</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Avg Improvement</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">+42%</p>
            <p className="text-xs text-slate-500">Performance</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Avg Savings</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">$2.4k</p>
            <p className="text-xs text-slate-500">/ month</p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      {step === 'input' && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white">Design Your AI Workforce</CardTitle>
            <CardDescription className="text-slate-400">
              Answer a few questions about your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-white">Business Description</label>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="Describe your business, products, services, and target customers..."
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 p-4 text-white placeholder:text-slate-500"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white">Team Size</label>
              <Select value={teamSize} onValueChange={setTeamSize}>
                <SelectTrigger className="mt-2 bg-slate-950">
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5">1-5 employees</SelectItem>
                  <SelectItem value="6-10">6-10 employees</SelectItem>
                  <SelectItem value="10-25">10-25 employees</SelectItem>
                  <SelectItem value="25-50">25-50 employees</SelectItem>
                  <SelectItem value="50+">50+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-white">Monthly Budget</label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger className="mt-2 bg-slate-950">
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-100">Under $100/month</SelectItem>
                  <SelectItem value="100-300">$100-300/month</SelectItem>
                  <SelectItem value="300-500">$300-500/month</SelectItem>
                  <SelectItem value="500-1000">$500-1000/month</SelectItem>
                  <SelectItem value="1000+">$1000+/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleAnalyze}>
              <Brain className="mr-2 h-4 w-4" />
              Analyze and Design
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analyzing */}
      {step === 'analyzing' && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-xl font-semibold text-white">Analyzing your workspace...</p>
            <p className="mt-2 text-slate-400">Designing optimal AI workforce structure</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {step === 'results' && (
        <div className="space-y-8">
          {/* Summary */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">AI Workforce Design</CardTitle>
              <CardDescription className="text-slate-400">
                Recommended configuration based on your business needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                    <div>
                      <p className="text-sm text-slate-400">Current Agents</p>
                      <p className="text-3xl font-semibold text-white">{mockAnalysisResult.currentAgents}</p>
                    </div>
                    <ChevronRight className="h-8 w-8 text-slate-600" />
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Recommended</p>
                      <p className="text-3xl font-semibold text-primary">{mockAnalysisResult.recommendedAgents}</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">Estimated Monthly Cost</p>
                    <p className="text-3xl font-semibold text-white">${mockAnalysisResult.estimatedMonthlyCost}</p>
                    <p className="text-xs text-slate-500">vs ${mockAnalysisResult.currentAgents * 150} current</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Projected Improvements</h4>
                  {Object.entries(mockAnalysisResult.projectedImprovement).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <Badge className="bg-emerald-500/20 text-emerald-400">{value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Recommendations */}
          <div className="grid gap-4 lg:grid-cols-2">
            {agentRecommendations.map((agent, i) => (
              <Card key={i} className="border-slate-800 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-white">{agent.role}</h3>
                        <Badge className={agent.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>
                          {agent.priority}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{agent.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">${agent.monthlyCost}</p>
                      <p className="text-xs text-slate-500">/ month</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-2">Recommended Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="border-slate-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="mt-4 w-full">
                    <Check className="mr-2 h-4 w-4" />
                    Add {agent.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Workflows & Skills Summary */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Recommended Skills & Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Skills</h4>
                  <div className="space-y-2">
                    {mockAnalysisResult.recommendedSkills.map((skill) => (
                      <div key={skill} className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span className="text-white">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Workflows</h4>
                  <div className="space-y-2">
                    {mockAnalysisResult.recommendedWorkflows.map((workflow) => (
                      <div key={workflow} className="flex items-center gap-2">
                        <Workflow className="h-4 w-4 text-blue-400" />
                        <span className="text-white">{workflow}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}