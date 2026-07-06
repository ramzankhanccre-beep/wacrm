'use client';

import { useState } from 'react';
import {
  Command,
  Search,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  Cpu,
  MessageSquare,
  Users,
  BarChart3,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Settings,
  Plus,
  X,
  Send,
  ChevronRight,
  Activity,
  Bot,
  TrendingUp,
  DollarSign,
  Eye,
  Shield,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock active conversations
const mockActiveConversations = [
  { id: '1', contact: 'John Smith', agent: 'Layla', status: 'active', messages: 8, lastMessage: '2m ago', sentiment: 'positive' },
  { id: '2', contact: 'Emma Wilson', agent: 'Ahmed', status: 'active', messages: 12, lastMessage: '5m ago', sentiment: 'neutral' },
  { id: '3', contact: 'Ahmed Hassan', agent: 'Sales Bot', status: 'escalated', messages: 15, lastMessage: '1m ago', sentiment: 'negative' },
  { id: '4', contact: 'Lisa Chen', agent: 'Layla', status: 'active', messages: 4, lastMessage: '30s ago', sentiment: 'positive' },
  { id: '5', contact: 'Mike Johnson', agent: 'Support Bot', status: 'active', messages: 6, lastMessage: '3m ago', sentiment: 'neutral' },
];

// Mock agent statuses
const mockAgentStatuses = [
  { id: '1', name: 'Layla', status: 'active', conversations: 24, resolutionRate: 87, avgResponseTime: '2.3s' },
  { id: '2', name: 'Ahmed', status: 'active', conversations: 18, resolutionRate: 72, avgResponseTime: '3.1s' },
  { id: '3', name: 'Sales Bot', status: 'active', conversations: 32, resolutionRate: 91, avgResponseTime: '1.8s' },
  { id: '4', name: 'Support Bot', status: 'paused', conversations: 0, resolutionRate: 85, avgResponseTime: '2.0s' },
];

// Mock metrics
const mockMetrics = {
  activeConversations: 78,
  totalResolved: 1247,
  avgResolutionTime: '4.2m',
  escalationRate: 12.5,
  customerSatisfaction: 4.7,
  dailyCost: 145.20,
};

// Mock command suggestions
const commandSuggestions = [
  { command: 'Pause all outbound messages until 9am tomorrow', description: 'Stop automated messages during off-hours' },
  { command: 'Escalate all conversations from Company X to Ahmed', description: 'Route company conversations to specific agent' },
  { command: 'Show me every conversation where a customer mentioned a competitor', description: 'Filter conversations by keyword' },
  { command: 'Pause Agent Layla', description: 'Temporarily disable an agent' },
  { command: 'Create a report of today\'s performance', description: 'Generate performance summary' },
];

export default function CommandCenterPage() {
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [selectedConversation, setSelectedConversation] = useState(mockActiveConversations[0]);

  const handleCommand = (command: string) => {
    setCommandInput(command);
    setCommandHistory([...commandHistory, command]);
  };

  const handleSendCommand = () => {
    if (commandInput.trim()) {
      setCommandHistory([...commandHistory, commandInput]);
      setCommandInput('');
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-400';
      case 'negative': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'escalated': return 'bg-amber-500';
      case 'paused': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Command className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 10 — Module 5</p>
            <h1 className="text-3xl font-semibold text-white">AI Command Center</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Unified operations dashboard for the entire AI workforce. Live view of all active conversations, agent statuses, and performance metrics.
          Control the platform with natural language commands.
        </p>

        <div className="grid gap-4 sm:grid-cols-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Active</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{mockMetrics.activeConversations}</p>
            <p className="text-xs text-slate-500">Conversations</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Activity className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Resolved</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">{mockMetrics.totalResolved}</p>
            <p className="text-xs text-slate-500">Today</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Avg Time</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{mockMetrics.avgResolutionTime}</p>
            <p className="text-xs text-slate-500">Resolution</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Escalation</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-amber-400">{mockMetrics.escalationRate}%</p>
            <p className="text-xs text-slate-500">Rate</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">CSAT</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{mockMetrics.customerSatisfaction}</p>
            <p className="text-xs text-slate-500">/ 5</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Cost</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">${mockMetrics.dailyCost}</p>
            <p className="text-xs text-slate-500">/ day</p>
          </div>
        </div>
      </div>

      {/* Command Bar */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="p-6">
          <div className="relative">
            <Command className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Type a command... (e.g., 'Pause all outbound messages until 9am')"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
              className="bg-slate-950 pl-14 pr-24 py-6 text-lg"
            />
            <Button
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleSendCommand}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500">Try:</span>
            {commandSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleCommand(suggestion.command)}
                className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-400 hover:border-slate-500 hover:text-white transition-colors"
              >
                {suggestion.command}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Agent Status */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Agent Status</CardTitle>
            <CardDescription className="text-slate-400">
              Real-time agent performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              <div className="space-y-3">
                {mockAgentStatuses.map((agent) => (
                  <div key={agent.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="font-medium text-white">{agent.name}</span>
                      </div>
                      <div className={`h-2 w-2 rounded-full ${agent.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Active Chats</p>
                        <p className="text-white">{agent.conversations}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Resolution</p>
                        <p className="text-white">{agent.resolutionRate}%</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {agent.status === 'active' ? (
                        <Button variant="outline" size="sm" className="flex-1 text-amber-400">
                          <Pause className="mr-1 h-3 w-3" />
                          Pause
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="flex-1 text-emerald-400">
                          <Play className="mr-1 h-3 w-3" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Active Conversations */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Active Conversations</CardTitle>
            <CardDescription className="text-slate-400">
              {mockActiveConversations.length} conversations in progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              <div className="space-y-2">
                {mockActiveConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      selectedConversation.id === conv.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(conv.status)}`} />
                        <div>
                          <p className="font-medium text-white">{conv.contact}</p>
                          <p className="text-xs text-slate-500">{conv.agent} • {conv.messages} messages</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${getSentimentColor(conv.sentiment)} capitalize`}>{conv.sentiment}</p>
                        <p className="text-xs text-slate-500">{conv.lastMessage}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      {conv.status === 'escalated' && (
                        <Button size="sm" className="flex-1">
                          Take Over
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Pause className="mr-2 h-4 w-4" />
                Pause All Agents
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="mr-2 h-4 w-4" />
                Force Sync
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Command History */}
      {commandHistory.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Command History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {commandHistory.map((cmd, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-slate-950 p-3">
                  <Command className="h-4 w-4 text-primary" />
                  <span className="text-white">{cmd}</span>
                  <Badge className="ml-auto bg-emerald-500/20 text-emerald-400">Executed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}