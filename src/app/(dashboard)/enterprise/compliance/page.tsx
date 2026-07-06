'use client';

import { useState } from 'react';
import {
  Shield,
  Search,
  Download,
  Upload,
  Globe,
  Lock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Users,
  Trash2,
  Eye,
  Mail,
  Calendar,
  Server,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock GDPR requests
const mockDataRequests = [
  {
    id: '1',
    type: 'export',
    requester: 'John Smith',
    email: 'john@example.com',
    status: 'completed',
    requestedAt: '2026-07-01T10:00:00Z',
    completedAt: '2026-07-01T10:15:00Z',
  },
  {
    id: '2',
    type: 'delete',
    requester: 'Emma Wilson',
    email: 'emma@example.com',
    status: 'pending',
    requestedAt: '2026-07-04T14:30:00Z',
    completedAt: null,
  },
  {
    id: '3',
    type: 'anonymize',
    requester: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    status: 'in_progress',
    requestedAt: '2026-07-05T09:00:00Z',
    completedAt: null,
  },
];

// Data residency options
const dataResidencyOptions = [
  { value: 'uae', label: 'UAE (Dubai)', flag: '🇦🇪' },
  { value: 'eu', label: 'EU (Frankfurt)', flag: '🇪🇺' },
  { value: 'us', label: 'US (Virginia)', flag: '🇺🇸' },
];

// Compliance certifications
const certifications = [
  { id: '1', name: 'SOC 2 Type II', status: 'roadmap', targetDate: '2027-Q1' },
  { id: '2', name: 'ISO 27001', status: 'roadmap', targetDate: '2027-Q2' },
  { id: '3', name: 'GDPR Compliant', status: 'ready', targetDate: null },
  { id: '4', name: 'UAE Data Law', status: 'ready', targetDate: null },
];

export default function CompliancePage() {
  const [dataResidency, setDataResidency] = useState('uae');
  const [searchQuery, setSearchQuery] = useState('');
  const [requestFilter, setRequestFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500/20 text-emerald-400">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-400">In Progress</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400">{status}</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 8 — Module 6</p>
            <h1 className="text-3xl font-semibold text-white">Compliance Framework</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          GDPR data subject request tools, configurable data residency, end-to-end encryption, and compliance certifications.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <FileText className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Data Requests</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{mockDataRequests.length}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Pending</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-amber-400">
              {mockDataRequests.filter(r => r.status === 'pending').length}
            </p>
            <p className="text-xs text-slate-500">Action required</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Lock className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Encryption</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">AES-256</p>
            <p className="text-xs text-slate-500">End-to-end</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Globe className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Residency</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">UAE</p>
            <p className="text-xs text-slate-500">Primary region</p>
          </div>
        </div>
      </div>

      {/* Data Residency */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Data Residency</CardTitle>
          <CardDescription className="text-slate-400">
            Configure where your data is stored and processed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={dataResidency} onValueChange={setDataResidency}>
              <SelectTrigger className="w-[250px] bg-slate-950">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataResidencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="mr-2">{option.flag}</span>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Region
            </Button>
            <span className="text-sm text-slate-500 ml-auto">
              Changing data residency may take up to 24 hours
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Data Requests */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Data Subject Requests</CardTitle>
            <div className="flex gap-2">
              <Select value={requestFilter} onValueChange={setRequestFilter}>
                <SelectTrigger className="w-[150px] bg-slate-950">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="anonymize">Anonymize</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Process Request
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {mockDataRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex items-center gap-4">
                    {request.type === 'export' ? (
                      <Download className="h-5 w-5 text-blue-400" />
                    ) : request.type === 'delete' ? (
                      <Trash2 className="h-5 w-5 text-red-400" />
                    ) : (
                      <Users className="h-5 w-5 text-amber-400" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{request.requester}</span>
                        <Badge variant="outline" className="border-slate-700 capitalize">
                          {request.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">{request.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Requested</p>
                      <p className="text-sm text-white">{formatDate(request.requestedAt)}</p>
                    </div>
                    {getStatusBadge(request.status)}
                    <Button variant="outline" size="sm">
                      {request.type === 'export' ? (
                        <Download className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Encryption */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Encryption</CardTitle>
            <CardDescription className="text-slate-400">
              End-to-end encryption status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="font-medium text-white">Conversations</p>
                    <p className="text-sm text-slate-500">All message data</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Encrypted</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="font-medium text-white">Memory</p>
                    <p className="text-sm text-slate-500">Contact and business memory</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Encrypted</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="font-medium text-white">Knowledge Base</p>
                    <p className="text-sm text-slate-500">Uploaded documents</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Encrypted</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="font-medium text-white">Backups</p>
                    <p className="text-sm text-slate-500">Automated backups</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Encrypted</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Compliance Roadmap</CardTitle>
            <CardDescription className="text-slate-400">
              Certifications and compliance status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex items-center gap-3">
                    {cert.status === 'ready' ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Calendar className="h-5 w-5 text-amber-400" />
                    )}
                    <div>
                      <p className="font-medium text-white">{cert.name}</p>
                      {cert.targetDate && (
                        <p className="text-sm text-slate-500">Target: {cert.targetDate}</p>
                      )}
                    </div>
                  </div>
                  {cert.status === 'ready' ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400">Ready</Badge>
                  ) : (
                    <Badge className="bg-amber-500/20 text-amber-400">Roadmap</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Export */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Export Workspace Data</CardTitle>
          <CardDescription className="text-slate-400">
            Download a complete copy of your workspace data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export All Data
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export Contacts
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Export Conversations
            </Button>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Export Agents
            </Button>
            <span className="text-sm text-slate-500 ml-auto">
              Data exports are available for 7 days after creation
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}