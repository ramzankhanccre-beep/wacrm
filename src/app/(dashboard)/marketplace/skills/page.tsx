'use client';

import { useState } from 'react';
import {
  Zap,
  Search,
  Download,
  Eye,
  Filter,
  Star,
  GitCompare,
  Clock,
  Check,
  ArrowRight,
  Wrench,
  RefreshCw,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock skill marketplace listings
const mockSkills = [
  {
    id: '1',
    name: 'Lead Qualification Pro',
    description: 'Advanced lead scoring using BANT and custom criteria. Automatically qualifies and routes leads.',
    author: 'Brand Reach Team',
    authorVerified: true,
    rating: 4.7,
    reviews: 89,
    installs: 567,
    price: 49,
    version: '2.1.0',
    category: 'qualification',
    features: ['BANT Scoring', 'Custom Criteria', 'Auto-routing', 'CRM Sync'],
    lastUpdated: '2026-07-01',
  },
  {
    id: '2',
    name: 'Appointment Booking',
    description: 'Complete booking flow with calendar integration, timezone handling, and confirmations.',
    author: 'SchedulerPro',
    authorVerified: true,
    rating: 4.9,
    reviews: 234,
    installs: 2103,
    price: 0,
    version: '3.0.0',
    category: 'booking',
    features: ['Calendar Sync', 'Timezone Support', 'Email Confirmations', 'Reminder Notifications'],
    lastUpdated: '2026-07-03',
  },
  {
    id: '3',
    name: 'Sentiment Analysis',
    description: 'Real-time sentiment detection for conversations. Triggers escalations on negative sentiment.',
    author: 'AI Labs',
    authorVerified: true,
    rating: 4.5,
    reviews: 67,
    installs: 345,
    price: 29,
    version: '1.4.0',
    category: 'analytics',
    features: ['Real-time Detection', 'Escalation Triggers', 'Sentiment History', 'Custom Thresholds'],
    lastUpdated: '2026-06-28',
  },
  {
    id: '4',
    name: 'CRM Auto-Sync',
    description: 'Automatically sync contacts, leads, and activities with your CRM.',
    author: 'IntegrateHub',
    authorVerified: false,
    rating: 4.3,
    reviews: 45,
    installs: 234,
    price: 79,
    version: '1.2.0',
    category: 'integration',
    features: ['Contact Sync', 'Lead Creation', 'Activity Logging', 'Field Mapping'],
    lastUpdated: '2026-06-20',
  },
  {
    id: '5',
    name: 'Multi-Language Support',
    description: 'Automatic language detection and translation for multilingual conversations.',
    author: 'PolyglotAI',
    authorVerified: true,
    rating: 4.6,
    reviews: 78,
    installs: 456,
    price: 39,
    version: '2.0.0',
    category: 'language',
    features: ['Auto Detection', '12 Languages', 'Translation Memory', 'Language Switching'],
    lastUpdated: '2026-07-02',
  },
  {
    id: '6',
    name: 'Survey Collection',
    description: 'Collect NPS, CSAT, and custom surveys after conversations.',
    author: 'FeedbackPro',
    authorVerified: false,
    rating: 4.4,
    reviews: 34,
    installs: 178,
    price: 0,
    version: '1.1.0',
    category: 'feedback',
    features: ['NPS Surveys', 'CSAT Collection', 'Custom Forms', 'Analytics Dashboard'],
    lastUpdated: '2026-06-25',
  },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'booking', label: 'Booking' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'integration', label: 'Integration' },
  { value: 'language', label: 'Language' },
  { value: 'feedback', label: 'Feedback' },
];

export default function SkillMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState(mockSkills[0]);

  const filteredSkills = mockSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 9 — Module 2</p>
            <h1 className="text-3xl font-semibold text-white">Skill Marketplace</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Install individual skills from the marketplace into any agent or workspace. Verified and community-contributed
          skills with versioning and automatic updates.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Zap className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Total Skills</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{mockSkills.length}</p>
            <p className="text-xs text-slate-500">Available</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Package className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Installed</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">8</p>
            <p className="text-xs text-slate-500">In workspace</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Updates</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-amber-400">2</p>
            <p className="text-xs text-slate-500">Available</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Download className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Free</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {mockSkills.filter(s => s.price === 0).length}
            </p>
            <p className="text-xs text-slate-500">Skills</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-slate-950">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Check Updates
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Skills List */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Available Skills</CardTitle>
            <CardDescription className="text-slate-400">
              Click a skill to view details and install
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <div className="space-y-3">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      selectedSkill.id === skill.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{skill.name}</h3>
                          {skill.authorVerified && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">Verified</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{skill.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400" />
                            {skill.rating}
                          </span>
                          <span>v{skill.version}</span>
                          <span>{skill.installs} installs</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {skill.price === 0 ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400">Free</Badge>
                        ) : (
                          <span className="text-lg font-semibold text-white">${skill.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Skill Detail */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Skill Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{selectedSkill.name}</h3>
                  {selectedSkill.authorVerified && (
                    <Badge className="bg-blue-500/20 text-blue-400">Verified</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-400">by {selectedSkill.author}</p>
              </div>

              <p className="text-slate-300">{selectedSkill.description}</p>

              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSkill.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="border-slate-700">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                <div>
                  <p className="text-xs text-slate-500">Version</p>
                  <p className="font-medium text-white">v{selectedSkill.version}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="font-medium text-white">{selectedSkill.lastUpdated}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Install Skill
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <h4 className="text-sm font-medium text-white mb-3">Changelog</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5" />
                    <span className="text-slate-400">v{selectedSkill.version} - Bug fixes and performance improvements</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5" />
                    <span className="text-slate-400">v1.x - Initial release</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}