import { NextResponse } from 'next/server';

// GET: Get workspace permissions and roles
export async function GET() {
  const roles = [
    { id: 'owner', name: 'Owner', permissions: { all: true }, userCount: 1 },
    { id: 'admin', name: 'Admin', permissions: { agents: true, users: true, settings: true }, userCount: 2 },
    { id: 'manager', name: 'Manager', permissions: { agents: true, analytics: true }, userCount: 3 },
  ];

  const members = [
    { id: '1', name: 'Ahmed Al Farsi', email: 'ahmed@brandreach.ae', role: 'owner', status: 'active' },
    { id: '2', name: 'Sarah Chen', email: 'sarah@brandreach.ae', role: 'admin', status: 'active' },
  ];

  return NextResponse.json({
    success: true,
    data: {
      roles,
      members,
      summary: {
        totalMembers: 17,
        totalRoles: 6,
        pendingInvitations: 2,
      },
    },
  });
}

// POST: Invite a new member
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Invitation sent',
    data: {
      memberId: `member_${Date.now()}`,
      status: 'pending',
    },
  });
}