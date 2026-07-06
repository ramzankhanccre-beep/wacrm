'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Shield,
  Search,
  Check,
  X,
  ChevronDown,
  UserCog,
  Settings,
  MessageSquare,
  Brain,
  Cpu,
  BarChart3,
  FileText,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Roles configuration
const roles = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all features and settings',
    color: 'bg-purple-500',
    permissions: { all: true },
    userCount: 1,
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Can manage users, agents, and settings',
    color: 'bg-red-500',
    permissions: { agents: true, users: true, settings: true, analytics: true },
    userCount: 2,
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Can manage agents and view analytics',
    color: 'bg-amber-500',
    permissions: { agents: true, analytics: true, conversations: true },
    userCount: 3,
  },
  {
    id: 'supervisor',
    name: 'Agent Supervisor',
    description: 'Can supervise conversations and export data',
    color: 'bg-blue-500',
    permissions: { conversations: true, analytics: true },
    userCount: 4,
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Read-only access to analytics and reports',
    color: 'bg-emerald-500',
    permissions: { analytics: true },
    userCount: 5,
  },
  {
    id: 'readonly',
    name: 'Read-only',
    description: 'View access only - no modifications',
    color: 'bg-slate-500',
    permissions: {},
    userCount: 2,
  },
];

// Permission modules
const permissionModules = [
  { id: 'agents', name: 'AI Agents', icon: Cpu, description: 'Create, edit, and manage AI agents' },
  { id: 'conversations', name: 'Conversations', icon: MessageSquare, description: 'View and manage conversations' },
  { id: 'brain', name: 'AI Brain', icon: Brain, description: 'Access intelligence modules' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'View reports and insights' },
  { id: 'users', name: 'User Management', icon: UserCog, description: 'Invite and manage team members' },
  { id: 'settings', name: 'Settings', icon: Settings, description: 'Configure workspace and integrations' },
  { id: 'billing', name: 'Billing', icon: Key, description: 'Manage subscription and payments' },
];

// Mock team members
const mockMembers = [
  { id: '1', name: 'Ahmed Al Farsi', email: 'ahmed@brandreach.ae', role: 'owner', avatar: 'AF', status: 'active' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@brandreach.ae', role: 'admin', avatar: 'SC', status: 'active' },
  { id: '3', name: 'Mike Johnson', email: 'mike@brandreach.ae', role: 'admin', avatar: 'MJ', status: 'active' },
  { id: '4', name: 'Emma Wilson', email: 'emma@brandreach.ae', role: 'manager', avatar: 'EW', status: 'active' },
  { id: '5', name: 'Ahmed Hassan', email: 'ahmed.h@brandreach.ae', role: 'manager', avatar: 'AH', status: 'active' },
  { id: '6', name: 'Lisa Chen', email: 'lisa@brandreach.ae', role: 'manager', avatar: 'LC', status: 'active' },
  { id: '7', name: 'John Smith', email: 'john@brandreach.ae', role: 'supervisor', avatar: 'JS', status: 'active' },
  { id: '8', name: 'Anna Brown', email: 'anna@brandreach.ae', role: 'supervisor', avatar: 'AB', status: 'pending' },
];

export default function WorkspacePermissionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState(roles[1]);
  const [editingPermissions, setEditingPermissions] = useState<string | null>(null);

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.color || 'bg-slate-500';
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-100">Phase 8 — Module 4</p>
            <h1 className="text-3xl font-semibold text-white">Workspace Permissions</h1>
          </div>
        </div>

        <p className="max-w-2xl text-slate-400">
          Role-based access control with granular permissions. Roles can be set per module, per agent, and per workspace.
        </p>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Users className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Team Members</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{mockMembers.length}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Shield className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Roles</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{roles.length}</p>
            <p className="text-xs text-slate-500">Configured</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <UserCog className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Pending</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-amber-400">{mockMembers.filter(m => m.status === 'pending').length}</p>
            <p className="text-xs text-slate-500">Invitations</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Key className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Permissions</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{permissionModules.length}</p>
            <p className="text-xs text-slate-500">Modules</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px] bg-slate-950">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Team Members */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Team Members</CardTitle>
            <CardDescription className="text-slate-400">
              Manage access and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getRoleColor(member.role)} text-white text-sm font-medium`}>
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{member.name}</span>
                          {member.status === 'pending' && (
                            <Badge className="bg-amber-500/20 text-amber-400">Pending</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select defaultValue={member.role}>
                        <SelectTrigger className="w-[150px] bg-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Role Configuration */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Role Permissions</CardTitle>
            <CardDescription className="text-slate-400">
              Configure {selectedRole.name} role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-6">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      selectedRole.id === role.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${role.color}`} />
                        <span className="font-medium text-white">{role.name}</span>
                      </div>
                      <span className="text-sm text-slate-500">{role.userCount} users</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{role.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Permission Matrix */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Permission Matrix</CardTitle>
          <CardDescription className="text-slate-400">
            View what each role can access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="pb-4 text-left text-sm font-medium text-slate-400">Permission</th>
                  {roles.map((role) => (
                    <th key={role.id} className="pb-4 text-center text-sm font-medium text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${role.color}`} />
                        {role.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionModules.map((module) => (
                  <tr key={module.id} className="border-b border-slate-800">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <module.icon className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="font-medium text-white">{module.name}</p>
                          <p className="text-xs text-slate-500">{module.description}</p>
                        </div>
                      </div>
                    </td>
                    {roles.map((role) => {
                      const hasPermission = role.permissions.all || role.permissions[module.id as keyof typeof role.permissions];
                      return (
                        <td key={role.id} className="py-4 text-center">
                          {hasPermission ? (
                            <Check className="mx-auto h-5 w-5 text-emerald-400" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-slate-600" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}