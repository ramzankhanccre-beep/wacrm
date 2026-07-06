'use client';

import { useState } from 'react';
import {
  FileText,
  Search,
  MessageSquare,
  Brain,
  Database,
  Wrench,
  ChevronRight,
  Copy,
  Download,
  Share2,
  Clock,
  User,
  Bot,
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock conversation for explainability
const mockConversation = [
  {
    id: '1',
    role: 'customer',
    message: 'Hi, I\'m interested in your premium property package. Can you tell me more about the pricing?',
    timestamp: '2026-07-05T14:30:00Z',
  },
  {
    id: '2',
    role: 'agent',
    message: "Hi! I'd be happy to tell you about our premium package. We have three tiers: Basic at $500/month, Professional at $1,200/month, and Enterprise at $2,500/month. Each tier includes different features and support levels. Could I ask what size your team is?",
    timestamp: '2026-07-05T14:30:15Z',
  },
  {
    id: '3',
    role: 'customer',
    message: 'We\'re a team of about 15 people.',
    timestamp: '2026-07-05T14:31:00Z',
  },
  {
    id: '4',
    role: 'agent',
    message: 'Perfect! For a team of 15, I\'d recommend our Professional tier at $1,200/month. It includes unlimited projects, priority support, and advanced analytics. Would you like me to send you a detailed breakdown?',
    timestamp: '2026-07-05T14:31:20Z',
  },
];

// Mock reasoning trace for the agent's last message
const mockReasoningTrace = {
  messageId: '4',
  timestamp: '2026-07-05T14:31:20Z',
  agent: 'Layla',
  model: 'GPT-4o',
  totalTokens: 1250,
  processingTime: '2.3s',
  memoryRetrieval: {
    used: true,
    sources: [
      { type: 'contact_memory', content: 'Team size: 15', relevance: 94 },
      { type: 'business_memory', content: 'Pricing tiers: Basic $500, Professional $1200, Enterprise $2500', relevance: 98 },
    ],
  },
  knowledgeRetrieval: {
    used: true,
    sources: [
      { type: 'knowledge_base', content: 'Professional tier recommended for teams 10-25', relevance: 91, source: 'pricing_guide.pdf' },
    ],
  },
  toolCalls: [],
  intent: {
    detected: 'recommendation',
    confidence: 94,
    entities: [{ type: 'team_size', value: '15' }],
  },
  why: 'The agent detected a pricing inquiry intent, retrieved the customer\'s team size from memory, matched it against business knowledge to find the appropriate tier, and generated a personalized recommendation.',
  safetyChecks: [
    { check: 'Pricing accuracy', status: 'pass', details: 'Correct prices retrieved from business memory' },
    { check: 'No policy violations', status: 'pass', details: 'All responses within allowed guidelines' },
    { check: 'Appropriate tone', status: 'pass', details: 'Professional and helpful tone maintained' },
  ],
};

// Mock conversation list
const mockConversations = [
  { id: '1', contact: 'John Smith', lastMessage: '...pricing? Can you tell me more', timestamp: '2026-07-05T14:31:20Z', messages: 4 },
  { id: '2', contact: 'Emma Wilson', lastMessage: 'Thanks for the info!', timestamp: '2026-07-05T13:45:00Z', messages: 8 },
  { id: '3', contact: 'Ahmed Hassan', lastMessage: 'When can I schedule a demo?', timestamp: '2026-07-05T11:20:00Z', messages: 6 },
  { id: '4', contact: 'Lisa Chen', lastMessage: 'I\'ll think about it', timestamp: '2026-07-04T16:30:00Z', messages: 12 },
];

export default function ExplainabilityPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [showTrace, setShowTrace] = useState(true);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 8 — Module 2</p>
            <h1 className="text-3xl font-semibold text-white">Explainability</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          For every agent response, a full reasoning trace is available: what memory was used, what knowledge was retrieved,
          what tools were called, and why. Reasoning traces can be shared with customers in regulated industries.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Traced</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">1,247</p>
            <p className="text-xs text-slate-500">Responses today</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Brain className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Memory Hits</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">89%</p>
            <p className="text-xs text-slate-500">Retrieval rate</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Database className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Knowledge</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">67%</p>
            <p className="text-xs text-slate-500">RAG usage</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Safety</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">100%</p>
            <p className="text-xs text-slate-500">Pass rate</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Conversation List */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Conversations</CardTitle>
            <CardDescription className="text-slate-400">
              Select a conversation to view trace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockConversations.map((conv) => (
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
                    <span className="font-medium text-white">{conv.contact}</span>
                    <span className="text-xs text-slate-500">{formatTimestamp(conv.timestamp)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 truncate">{conv.lastMessage}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <MessageSquare className="h-3 w-3" />
                    <span>{conv.messages} messages</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversation & Trace */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Conversation Trace</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-3 w-3" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-3 w-3" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="conversation" className="space-y-4">
              <TabsList className="bg-slate-800">
                <TabsTrigger value="conversation" className="text-slate-300">
                  Conversation
                </TabsTrigger>
                <TabsTrigger value="trace" className="text-slate-300">
                  Reasoning Trace
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conversation" className="space-y-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {mockConversation.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 ${
                            msg.role === 'agent'
                              ? 'bg-primary/20 text-white'
                              : 'bg-slate-800 text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {msg.role === 'agent' ? (
                              <Bot className="h-4 w-4 text-primary" />
                            ) : (
                              <User className="h-4 w-4 text-slate-400" />
                            )}
                            <span className="text-xs text-slate-500">{formatTimestamp(msg.timestamp)}</span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="trace">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-6">
                    {/* Overview */}
                    <div className="rounded-xl bg-slate-950 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-white">Response Overview</h4>
                        <Badge className="bg-emerald-500/20 text-emerald-400">Grounded</Badge>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-slate-500">Model</p>
                          <p className="text-sm text-white">{mockReasoningTrace.model}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Processing Time</p>
                          <p className="text-sm text-white">{mockReasoningTrace.processingTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Tokens</p>
                          <p className="text-sm text-white">{mockReasoningTrace.totalTokens}</p>
                        </div>
                      </div>
                    </div>

                    {/* Memory */}
                    <div className="rounded-xl bg-slate-950 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-4 w-4 text-purple-400" />
                        <h4 className="font-medium text-white">Memory Retrieval</h4>
                      </div>
                      <div className="space-y-2">
                        {mockReasoningTrace.memoryRetrieval.sources.map((source, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
                            <div>
                              <p className="text-sm text-white">{source.content}</p>
                              <p className="text-xs text-slate-500">{source.type}</p>
                            </div>
                            <Badge variant="outline" className="border-purple-700 text-purple-400">
                              {source.relevance}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Knowledge */}
                    <div className="rounded-xl bg-slate-950 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Database className="h-4 w-4 text-blue-400" />
                        <h4 className="font-medium text-white">Knowledge Retrieval</h4>
                      </div>
                      <div className="space-y-2">
                        {mockReasoningTrace.knowledgeRetrieval.sources.map((source, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
                            <div>
                              <p className="text-sm text-white">{source.content}</p>
                              <p className="text-xs text-slate-500">Source: {source.source}</p>
                            </div>
                            <Badge variant="outline" className="border-blue-700 text-blue-400">
                              {source.relevance}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Intent */}
                    <div className="rounded-xl bg-slate-950 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <HelpCircle className="h-4 w-4 text-amber-400" />
                        <h4 className="font-medium text-white">Intent Detection</h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white capitalize">{mockReasoningTrace.intent.detected}</p>
                          <p className="text-xs text-slate-500">
                            Entities: {mockReasoningTrace.intent.entities.map(e => `${e.type}: ${e.value}`).join(', ')}
                          </p>
                        </div>
                        <Badge className="bg-amber-500/20 text-amber-400">
                          {mockReasoningTrace.intent.confidence}% confidence
                        </Badge>
                      </div>
                    </div>

                    {/* Why */}
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        <h4 className="font-medium text-white">Why This Response</h4>
                      </div>
                      <p className="text-sm text-slate-300">{mockReasoningTrace.why}</p>
                    </div>

                    {/* Safety */}
                    <div className="rounded-xl bg-slate-950 p-4">
                      <h4 className="font-medium text-white mb-3">Safety Checks</h4>
                      <div className="space-y-2">
                        {mockReasoningTrace.safetyChecks.map((check, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">{check.check}</span>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-400" />
                              <span className="text-xs text-slate-500">{check.details}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}