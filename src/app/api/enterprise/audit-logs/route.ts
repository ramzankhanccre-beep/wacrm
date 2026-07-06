import { NextResponse } from 'next/server';

// GET: Get audit logs
export async function GET() {
  const mockLogs = [
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
  ];

  return NextResponse.json({
    success: true,
    data: {
      logs: mockLogs,
      summary: {
        totalLogs: 12847,
        activeUsers: 24,
        warningsThisWeek: 3,
      },
    },
  });
}

// POST: Export audit logs
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Export initiated',
    data: {
      exportId: `exp_${Date.now()}`,
      format: 'json',
      status: 'processing',
    },
  });
}