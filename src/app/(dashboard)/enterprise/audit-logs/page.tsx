'use client';

import { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Clock,
  Settings,
  Trash2,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock audit log data
const mockAuditLogs = [
  {
    id: '1',
    timestamp: '2026-07-05T14:32:00Z',
    user: 'Ahmed Al Farsi',
    userEmail: 'ahmed@brandreach.ae',
    action: 'agent_update',
    resource: 'Agent: Layla',
    details: 'Updated prompt section 3 - greeting',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: '2',
    timestamp: '2026-07-05T14:28:45Z',
    user: 'Sarah Chen',
    userEmail: 'sarah@brandreach.ae',
    action: 'workflow_activate',
    resource: 'Workflow: Auto Follow-Up',
    details: 'Activated workflow from draft state',
    ipAddress: '192.168.1.105',
    status: 'success',
  },
  {
    id: '3',
    timestamp: '2026-07-05T14:15:22Z',
    user: 'System',
    userEmail: 'system@brandreach.ae',
    action: 'tool_call',
    resource: 'Tool: Create Lead',
    details: 'Tool executed by agent Layla - contact: john@example.com',
    ipAddress: 'N/A',
    status: 'success',
  },
  {
    id: '4',
    timestamp: '2026-07-05T13:55:10Z',
    user: 'Mike Johnson',
    userEmail: 'mike@brandreach.ae',
    action: 'login',
    resource: 'Auth',
    details: 'User logged in successfully',
    ipAddress: '192.168.1.110',
    status: 'success',
  },
  {
    id: '5',
    timestamp: '2026-07-05T13:42:33Z',
    user: 'Ahmed Al Farsi',
    userEmail: 'ahmed@brandreach.ae',
    action: 'memory_write',
    resource: 'Memory: contact_456',
    details: 'Added preference note: prefers Arabic communication',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: '6',
    timestamp: '2026-07-05T12:30:00Z',
    user: 'Sarah Chen',
    userEmail: 'sarah@brandreach.ae',
    action: 'crm_edit',
    resource: 'Contact: lead_789',
    details: 'Updated lead stage from Qualified to Proposal',
    ipAddress: '192.168.1.105',
    status: 'success',
  },
  {
    id: '7',
    timestamp: '2026-07-05T11:15:45Z',
    user: 'Ahmed Al Farsi',
    userEmail: 'ahmed@brandreach.ae',
    action: 'agent_delete',
    resource: 'Agent: Test Bot',
    details: 'Archived agent - moved to inactive',
    ipAddress: '192.168.1.100',
    status: 'warning',
  },
  {
    id: '8',
    timestamp: '2026-07-05T10:00:00Z',
    user: 'System',
    userEmail: 'system@brandreach.ae',
    action: 'escalation',
    resource: 'Conversation: conv_1234',
    details: 'Conversation escalated to human agent - sentiment: negative',
    ipAddress: 'N/A',
    status: 'info',
  },
];

const actionTypes = [
  { value: 'all', label: 'All Actions' },
  { value: 'agent_create', label: 'Agent Created' },
  { value: 'agent_update', label: 'Agent Updated' },
  { value: 'agent_delete', label: 'Agent Deleted' },
  { value: 'workflow_activate', label: 'Workflow Activated' },
  { value: 'workflow_deactivate', label: 'Workflow Deactivated' },
  { value: 'tool_call', label: 'Tool Called' },
  { value: 'memory_write', label: 'Memory Written' },
  { value: 'crm_edit', label: 'CRM Edit' },
  { value: 'login', label: 'User Login' },
  { value: 'logout', label: 'User Logout' },
  { value: 'escalation', label: 'Escalation' },
];

const resourceTypes = [
  { value: 'all', label: 'All Resources' },
  { value: 'agent', label: 'Agents' },
  { value: 'workflow', label: 'Workflows' },
  { value: 'tool', label: 'Tools' },
  { value: 'memory', label: 'Memory' },
  { value: 'contact', label: 'Contacts' },
  { value: 'auth', label: 'Authentication' },
];

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [retentionPeriod, setRetentionPeriod] = useState('90');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <FileText className="h-4 w-4 text-blue-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Success</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Info</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
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
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 8 — Module 1</p>
            <h1 className="text-3xl font-semibold text-white">Audit Logs</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Immutable log of every action taken on the platform. Exportable in JSON and CSV for compliance teams.
          Retention period is configurable from 90 days to indefinite.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <FileText className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Total Logs</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">12,847</p>
            <p className="text-xs text-slate-500">This month</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <User className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Active Users</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">24</p>
            <p className="text-xs text-slate-500">Tracked</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Warnings</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-amber-400">3</p>
            <p className="text-xs text-slate-500">This week</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Retention</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{retentionPeriod}d</p>
            <p className="text-xs text-slate-500">Configurable</p>
          </div>
        </div>
      </div>

      {/* Retention Settings */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Retention Settings</CardTitle>
          <CardDescription className="text-slate-400">
            Configure how long audit logs are retained
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
              <SelectTrigger className="w-[200px] bg-slate-950">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Apply
            </Button>
            <span className="text-sm text-slate-500 ml-auto">
              Logs older than {retentionPeriod === 'indefinite' ? 'indefinitely' : `${retentionPeriod} days`} will be automatically purged
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search logs by user, action, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px] bg-slate-950">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-[180px] bg-slate-950">
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-slate-950">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px] bg-slate-950">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Today</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Activity Log</CardTitle>
          <CardDescription className="text-slate-400">
            Complete history of all platform actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {mockAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-slate-700 transition-colors"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(log.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{log.action.replace(/_/g, ' ')}</span>
                          {getStatusBadge(log.status)}
                        </div>
                        <p className="text-sm text-slate-500">{log.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-white">{log.user}</p>
                        <p className="text-xs text-slate-500">{log.resource}</p>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        <p>{formatTimestamp(log.timestamp)}</p>
                      </div>
                      {expandedLog === log.id ? (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                  </div>
                  {expandedLog === log.id && (
                    <div className="mt-4 rounded-lg bg-slate-900 p-4">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-slate-500">User Email</p>
                          <p className="text-sm text-white">{log.userEmail}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">IP Address</p>
                          <p className="text-sm text-white">{log.ipAddress}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Timestamp (UTC)</p>
                          <p className="text-sm text-white">{log.timestamp}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-3 w-3" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-3 w-3" />
                          Export
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}