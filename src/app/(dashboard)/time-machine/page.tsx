'use client';

import { useState } from 'react';
import {
  History,
  Search,
  Calendar,
  Clock,
  User,
  Brain,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Eye,
  MessageSquare,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock timeline data
const mockTimeline = [
  { id: '1', date: '2026-07-05T14:30:00Z', event: 'Added preference note', type: 'memory', details: 'Prefers Arabic communication' },
  { id: '2', date: '2026-07-05T12:15:00Z', event: 'Stage changed to Proposal', type: 'crm', details: 'Lead stage: Qualified → Proposal' },
  { id: '3', date: '2026-07-04T16:45:00Z', event: 'Conversation summary', type: 'conversation', details: 'Discussed premium package pricing' },
  { id: '4', date: '2026-07-04T10:30:00Z', event: 'Added note', type: 'note', details: 'Interested in waterfront properties' },
  { id: '5', date: '2026-07-03T09:00:00Z', event: 'Created contact', type: 'contact', details: 'New lead from WhatsApp' },
];

// Mock memory at specific point in time
const mockMemorySnapshots = {
  '2026-07-05T14:30:00Z': {
    preferences: ['Prefers Arabic communication', 'Available weekends'],
    interests: ['Waterfront properties', 'Luxury apartments'],
    history: ['Discussed pricing for Basic package', 'Scheduled viewing for tomorrow'],
    stage: 'Proposal',
  },
  '2026-07-04T16:45:00Z': {
    preferences: ['Available weekends'],
    interests: ['Waterfront properties'],
    history: ['First contact - asked about pricing'],
    stage: 'Qualified',
  },
  '2026-07-03T09:00:00Z': {
    preferences: [],
    interests: [],
    history: [],
    stage: 'New',
  },
};

export default function TimeMachinePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState('John Smith');
  const [selectedTimestamp, setSelectedTimestamp] = useState(mockTimeline[0].date);
  const [selectedEvent, setSelectedEvent] = useState(mockTimeline[0]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'memory': return Brain;
      case 'crm': return User;
      case 'conversation': return MessageSquare;
      case 'note': return AlertTriangle;
      case 'contact': return User;
      default: return History;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'memory': return 'text-purple-400';
      case 'crm': return 'text-blue-400';
      case 'conversation': return 'text-primary';
      case 'note': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  const currentMemory = mockMemorySnapshots[selectedTimestamp as keyof typeof mockMemorySnapshots] || mockMemorySnapshots['2026-07-05T14:30:00Z'];

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 10 — Module 4</p>
            <h1 className="text-3xl font-semibold text-white">Memory Time Machine</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Travel back in time through the entire memory state of any customer or agent.
          Reconstruct exactly what an agent knew at any point in a conversation.
          Use cases: dispute resolution, training analysis, compliance review.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Time Points</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">847</p>
            <p className="text-xs text-slate-500">Tracked</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <User className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Contacts</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">156</p>
            <p className="text-xs text-slate-500">With history</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Eye className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Reviews</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">23</p>
            <p className="text-xs text-slate-500">This month</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Disputes</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">8</p>
            <p className="text-xs text-slate-500">Resolved</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 pl-10"
          />
        </div>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Timeline */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Timeline</CardTitle>
            <CardDescription className="text-slate-400">
              {selectedContact} — Memory events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-1">
                {mockTimeline.map((event, index) => {
                  const Icon = getEventIcon(event.type);
                  return (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedTimestamp(event.date);
                        setSelectedEvent(event);
                      }}
                      className={`w-full rounded-xl border p-4 text-left transition-all ${
                        selectedEvent.id === event.id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <Icon className={`h-4 w-4 ${getEventColor(event.type)}`} />
                          {index < mockTimeline.length - 1 && (
                            <div className="h-12 w-px bg-slate-800 mt-2" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{event.event}</p>
                          <p className="text-xs text-slate-500">{formatDate(event.date)}</p>
                          <p className="mt-1 text-sm text-slate-400">{event.details}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Memory State */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Memory State</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-slate-400">
              What the agent knew at {formatDate(selectedTimestamp)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-950 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-white">Contact Stage</span>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400">{currentMemory.stage}</Badge>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Preferences</span>
                </div>
                {currentMemory.preferences.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentMemory.preferences.map((pref, i) => (
                      <Badge key={i} variant="outline" className="border-slate-700">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No preferences recorded</p>
                )}
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-white">Interests</span>
                </div>
                {currentMemory.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentMemory.interests.map((interest, i) => (
                      <Badge key={i} variant="outline" className="border-slate-700">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No interests recorded</p>
                )}
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-white">Interaction History</span>
                </div>
                {currentMemory.history.length > 0 ? (
                  <ul className="space-y-2">
                    {currentMemory.history.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No history recorded</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                View Conversation
              </Button>
              <Button variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore This State
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}