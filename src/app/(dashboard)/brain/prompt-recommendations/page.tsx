'use client';

import { useState } from 'react';
import {
  FileText,
  Lightbulb,
  FlaskConical,
  ArrowRight,
  Check,
  X,
  Copy,
  RefreshCw,
  GitCompare,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock successful conversation patterns
const mockConversationPatterns = [
  {
    id: '1',
    topic: 'Appointment Booking',
    successRate: 94,
    sampleCount: 156,
    winningPattern: 'Short greeting → immediate availability check → single question → confirm',
    avgMessages: 6,
  },
  {
    id: '2',
    topic: 'Lead Qualification',
    successRate: 87,
    sampleCount: 243,
    winningPattern: 'Name introduction → value proposition → open-ended question → qualify',
    avgMessages: 8,
  },
  {
    id: '3',
    topic: 'Pricing Inquiry',
    successRate: 91,
    sampleCount: 189,
    winningPattern: 'Acknowledge → offer tiered options → ask budget → recommend',
    avgMessages: 5,
  },
];

// Mock prompt recommendations
const mockRecommendations = [
  {
    id: '1',
    agentName: 'Layla',
    section: 'Greeting',
    issue: 'Greeting exceeds 3 sentences, causing early customer response',
    evidence: '67% of conversations have customer interruption within 2 messages',
    suggestion: 'Reduce greeting to 2 sentences maximum',
    suggestedText: "Hi {{contact_name}}! I'm Layla from Brand Reach Solutions. How can I help you today?",
    confidence: 92,
    testResult: null,
  },
  {
    id: '2',
    agentName: 'Ahmed',
    section: 'Objection Handling',
    issue: 'No response pattern for price objections',
    evidence: '23 escalated conversations mention "too expensive" with no resolution',
    suggestion: 'Add price objection handling sequence',
    suggestedText: "I understand budget is important. Let me share some options that might work better for your needs...",
    confidence: 88,
    testResult: {
      originalScore: 62,
      newScore: 78,
      improvement: '+16%',
    },
  },
  {
    id: '3',
    agentName: 'Sales Bot',
    section: 'Closing',
    issue: 'Missing confirmation before ending conversations',
    evidence: '14% of leads marked as "interested" but no follow-up scheduled',
    suggestion: 'Add explicit confirmation and next step before closing',
    suggestedText: "Perfect! I'll send a summary to {{phone}} and follow up tomorrow at 10am. Does that work for you?",
    confidence: 85,
    testResult: null,
  },
];

export default function PromptRecommendationsPage() {
  const [selectedRec, setSelectedRec] = useState(mockRecommendations[0]);
  const [testing, setTesting] = useState<string | null>(null);
  const [abTesting, setAbTesting] = useState<string | null>(null);

  const handleRunTest = (recId: string) => {
    setTesting(recId);
    setTimeout(() => setTesting(null), 2000);
  };

  const handleABTest = (recId: string) => {
    setAbTesting(recId);
    setTimeout(() => setAbTesting(null), 3000);
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
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 7 — Module 3</p>
            <h1 className="text-3xl font-semibold text-white">Prompt Recommendations</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          AI analyzes successful conversations and extracts patterns to generate prompt improvement
          suggestions. A/B test recommended prompts against the current version before committing changes.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Patterns</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">12</p>
            <p className="text-xs text-slate-500">Extracted this week</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Lightbulb className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Suggestions</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">3</p>
            <p className="text-xs text-slate-500">Pending review</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <GitCompare className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">A/B Tests</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">2</p>
            <p className="text-xs text-slate-500">In progress</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Applied</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">8</p>
            <p className="text-xs text-slate-500">This month</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="recommendations" className="text-slate-300">
            <Lightbulb className="mr-2 h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="patterns" className="text-slate-300">
            <FlaskConical className="mr-2 h-4 w-4" />
            Conversation Patterns
          </TabsTrigger>
          <TabsTrigger value="history" className="text-slate-300">
            <Clock className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recommendations List */}
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Prompt Improvements</CardTitle>
                <CardDescription className="text-slate-400">
                  AI-generated suggestions with supporting evidence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
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
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-slate-700 text-slate-300">
                              {rec.section}
                            </Badge>
                            <span className="text-sm text-slate-500">{rec.agentName}</span>
                          </div>
                          <span className="text-xs text-slate-500">{rec.confidence}% confidence</span>
                        </div>
                        <h4 className="mt-3 font-medium text-white">{rec.issue}</h4>
                        <p className="mt-2 text-sm text-slate-400">{rec.evidence}</p>
                        {rec.testResult && (
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-950/30 px-3 py-2">
                            <ThumbsUp className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm text-emerald-400">
                              Test shows {rec.testResult.improvement} improvement
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Selected Recommendation Detail */}
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Recommendation Detail</CardTitle>
                <CardDescription className="text-slate-400">
                  Review, test, and apply suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Issue */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">Issue</h4>
                    <p className="mt-2 text-white">{selectedRec.issue}</p>
                  </div>

                  {/* Evidence */}
                  <div className="rounded-xl bg-slate-950 p-4">
                    <h4 className="text-sm font-medium text-slate-400">Evidence</h4>
                    <p className="mt-2 text-sm text-slate-300">{selectedRec.evidence}</p>
                  </div>

                  {/* Suggested Change */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">Suggested Prompt</h4>
                    <div className="mt-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
                      <p className="text-sm text-white">{selectedRec.suggestedText}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="mr-2 h-3 w-3" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <GitCompare className="mr-2 h-3 w-3" />
                        Compare
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    <Button
                      className="w-full"
                      onClick={() => handleRunTest(selectedRec.id)}
                      disabled={testing === selectedRec.id}
                    >
                      {testing === selectedRec.id ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Running Test...
                        </>
                      ) : (
                        <>
                          <FlaskConical className="mr-2 h-4 w-4" />
                          Run Test
                        </>
                      )}
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="border-emerald-800 text-emerald-400 hover:bg-emerald-950"
                        onClick={() => handleABTest(selectedRec.id)}
                        disabled={abTesting === selectedRec.id}
                      >
                        {abTesting === selectedRec.id ? (
                          <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <GitCompare className="mr-2 h-3 w-3" />
                        )}
                        A/B Test
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-800 text-red-400 hover:bg-red-950"
                      >
                        <X className="mr-2 h-3 w-3" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Extracted Conversation Patterns</CardTitle>
              <CardDescription className="text-slate-400">
                Winning patterns identified from successful conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {mockConversationPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{pattern.topic}</h4>
                      <Badge className="bg-emerald-500">{pattern.successRate}%</Badge>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">{pattern.winningPattern}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>{pattern.sampleCount} samples</span>
                      <span>{pattern.avgMessages} avg messages</span>
                    </div>
                    <Button variant="secondary" size="sm" className="mt-4 w-full">
                      View Details <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Recommendation History</CardTitle>
              <CardDescription className="text-slate-400">
                Track all prompt changes and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-slate-950 p-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-slate-600" />
                <p className="mt-4 text-slate-400">No history yet. Run analysis to discover patterns.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}