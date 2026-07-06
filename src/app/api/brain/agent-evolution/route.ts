import { NextResponse } from 'next/server';

// GET: Get agent evolution data and version history
export async function GET() {
  const mockAgents = [
    {
      id: '1',
      name: 'Layla',
      currentLevel: 3,
      performanceScore: 92,
      totalConversations: 1247,
      uptime: 99.8,
      graduationProgress: 75,
      version: '2.4.1',
      lastUpdated: '2026-07-01',
      evolutionHistory: [
        { version: '2.4.1', date: '2026-07-01', change: 'Updated greeting prompt', author: 'AI Analysis' },
        { version: '2.4.0', date: '2026-06-25', change: 'Added booking skill', author: 'Human' },
        { version: '2.3.0', date: '2026-06-18', change: 'Upgraded to autonomy level 3', author: 'System' },
        { version: '2.2.0', date: '2026-06-10', change: 'Fixed pricing knowledge gap', author: 'AI Analysis' },
      ],
    },
    {
      id: '2',
      name: 'Ahmed',
      currentLevel: 2,
      performanceScore: 71,
      totalConversations: 892,
      uptime: 96.2,
      graduationProgress: 45,
      version: '1.8.2',
      lastUpdated: '2026-06-28',
      evolutionHistory: [
        { version: '1.8.2', date: '2026-06-28', change: 'Added escalation triggers', author: 'Human' },
        { version: '1.8.1', date: '2026-06-20', change: 'Reduced prompt verbosity', author: 'AI Analysis' },
        { version: '1.8.0', date: '2026-06-15', change: 'Upgraded to autonomy level 2', author: 'System' },
      ],
    },
    {
      id: '3',
      name: 'Sales Bot',
      currentLevel: 4,
      performanceScore: 96,
      totalConversations: 156,
      uptime: 99.9,
      graduationProgress: 100,
      version: '3.0.0',
      lastUpdated: '2026-07-03',
      evolutionHistory: [
        { version: '3.0.0', date: '2026-07-03', change: 'Graduated to level 4 autonomous', author: 'System' },
        { version: '2.9.0', date: '2026-06-28', change: 'Added CRM integration', author: 'Human' },
        { version: '2.8.0', date: '2026-06-22', change: 'Upgraded to autonomy level 3', author: 'System' },
      ],
    },
  ];

  const autonomyLevels = [
    { level: 1, name: 'Learning', description: 'Requires human approval for all actions' },
    { level: 2, name: 'Assisted', description: 'Human reviews before sending messages' },
    { level: 3, name: 'Supervised', description: 'Auto-sends, human notified on escalations' },
    { level: 4, name: 'Autonomous', description: 'Operates independently with monitoring' },
  ];

  return NextResponse.json({
    success: true,
    data: {
      agents: mockAgents,
      autonomyLevels,
      summary: {
        totalAgents: 3,
        avgPerformanceScore: 86,
        graduatedCount: 1,
        totalVersions: 14,
      },
    },
  });
}

// POST: Approve agent graduation
export async function POST() {
  // In production, this would handle graduation approval

  return NextResponse.json({
    success: true,
    message: 'Agent graduation approved successfully',
    data: {
      graduatedAt: new Date().toISOString(),
      newLevel: 3,
    },
  });
}