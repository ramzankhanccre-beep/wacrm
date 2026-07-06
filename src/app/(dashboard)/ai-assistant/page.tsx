'use client';

import { useState } from 'react';
import {
  User,
  MessageSquare,
  Send,
  Bot,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Users,
  Cpu,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock conversation
const mockConversation = [
  { role: 'user', content: 'Which leads are most likely to close this week?', time: '09:00 AM' },
  { role: 'assistant', content: 'Based on my analysis of current conversations and lead scores, here are the top 3 leads likely to close this week:\n\n1. **Ahmed Hassan** - 92% score - Asked about pricing for premium package\n2. **Emma Wilson** - 87% score - Scheduled property viewing for tomorrow\n3. **John Smith** - 82% score - Requested mortgage pre-approval\n\nThese leads have shown strong intent signals in the last 48 hours.', time: '09:00 AM' },
  { role: 'user', content: 'Why did our conversion rate drop on Tuesday?', time: '09:02 AM' },
  { role: 'assistant', content: 'Good question. Let me analyze Tuesday\'s performance:\n\n**Conversion Rate: 24%** (down from 31% average)\n\n**Possible reasons identified:**\n1. **Higher volume of price inquiries** - 45% of conversations were pricing-related, with lower intent\n2. **Agent Ahmed was on pause** - 3 hours offline during peak hours\n3. **Knowledge gap** - 5 conversations about new property features had incomplete responses\n\n**Recommended actions:**\n- Add new property pricing to knowledge base\n- Review Ahmed\'s escalation handling\n- Consider increasing human agent coverage Tuesday afternoons', time: '09:03 AM' },
  { role: 'user', content: 'What is Agent Layla struggling with?', time: '09:05 AM' },
  { role: 'assistant', content: 'Agent Layla performance analysis:\n\n**Overall: 87% resolution rate** ✅\n\n**Areas of concern:**\n1. **Complex objections** - 23% failure rate when customers mention "too expensive" or "thinking elsewhere"\n2. **Follow-up closure** - Only 34% of interested leads receive booking confirmations\n3. **Language switching** - Struggles to switch between English/Arabic mid-conversation\n\n**Recommended prompt improvements:**\n- Add price objection handling sequence\n- Add explicit confirmation step before ending conversations\n- Improve language context switching\n\nWant me to generate the prompt improvements?', time: '09:05 AM' },
];

// Mock morning briefing
const morningBriefing = {
  date: 'July 5, 2026',
  summary: 'Active day with 24 new leads and 3 urgent escalations',
  metrics: {
    newLeads: { value: 24, change: '+15%', positive: true },
    resolved: { value: 156, change: '+8%', positive: true },
    escalations: { value: 3, change: '+50%', positive: false },
    avgResponse: { value: '2.3m', change: '-12%', positive: true },
  },
  urgentItems: [
    { type: 'escalation', message: 'Ahmed Hassan escalated - price negotiation stuck', priority: 'high' },
    { type: 'lead', message: 'Enterprise lead (TechCorp) requires human follow-up', priority: 'high' },
    { type: 'knowledge', message: '3 conversations hit knowledge gap - new pricing needed', priority: 'medium' },
  ],
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState(mockConversation);
  const [inputValue, setInputValue] = useState('');
  const [showBriefing, setShowBriefing] = useState(true);

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { role: 'user', content: inputValue, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 10 — Module 2</p>
            <h1 className="text-3xl font-semibold text-white">AI Executive Assistant</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Your personal AI assistant for business insights. Has full read access to all agents, conversations, and analytics.
          Ask natural language questions and get proactive morning briefings.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Queries</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">156</p>
            <p className="text-xs text-slate-500">This week</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Briefings</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">7</p>
            <p className="text-xs text-slate-500">This week</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Zap className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Insights</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-primary">23</p>
            <p className="text-xs text-slate-500">Generated</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Actions</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">18</p>
            <p className="text-xs text-slate-500">Implemented</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Chat Interface */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Ask Anything</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowBriefing(!showBriefing)}>
                {showBriefing ? 'Hide' : 'Show'} Morning Briefing
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Morning Briefing */}
            {showBriefing && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Morning Briefing — {morningBriefing.date}</span>
                </div>
                <p className="text-white mb-4">{morningBriefing.summary}</p>
                <div className="grid gap-3 sm:grid-cols-4 mb-4">
                  {Object.entries(morningBriefing.metrics).map(([key, metric]: [string, any]) => (
                    <div key={key} className="rounded-lg bg-slate-950 p-3">
                      <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-white">{metric.value}</span>
                        <span className={`text-xs ${metric.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-medium">Urgent Items:</p>
                  {morningBriefing.urgentItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className={`h-3 w-3 ${item.priority === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                      <span className="text-slate-300">{item.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary/20 text-white'
                        : 'bg-slate-800 text-white'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {msg.role === 'assistant' ? (
                          <Bot className="h-4 w-4 text-primary" />
                        ) : (
                          <User className="h-4 w-4 text-slate-400" />
                        )}
                        <span className="text-xs text-slate-500">{msg.time}</span>
                      </div>
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                className="bg-slate-950"
              />
              <Button onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Questions */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Quick Questions</CardTitle>
            <CardDescription className="text-slate-400">
              Try these examples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                'Which leads are most likely to close this week?',
                'Why did our conversion rate drop on Tuesday?',
                'What is Agent Layla struggling with?',
                'Show me today\'s revenue metrics',
                'Which customers are at risk of churning?',
                'Summarize this week\'s performance',
              ].map((question, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(question)}
                  className="w-full text-left rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-400 hover:border-slate-700 hover:text-white transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}