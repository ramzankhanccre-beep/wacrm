import { NextResponse } from 'next/server';

// GET: Get marketplace agents
export async function GET() {
  const mockAgents = [
    { id: '1', name: 'Sales Pro Agent', author: 'Brand Reach Team', rating: 4.8, installs: 1247, price: 99, category: 'sales' },
    { id: '2', name: 'Support Bot Premium', author: 'TechCorp', rating: 4.6, installs: 567, price: 0, category: 'support' },
    { id: '3', name: 'Booking Master', author: 'SchedulerPro', rating: 4.9, installs: 2103, price: 49, category: 'booking' },
  ];

  return NextResponse.json({
    success: true,
    data: {
      agents: mockAgents,
      summary: {
        total: mockAgents.length,
        totalInstalls: mockAgents.reduce((sum, a) => sum + a.installs, 0),
      },
    },
  });
}

// POST: Install an agent
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Agent installed successfully',
    data: {
      installId: `install_${Date.now()}`,
    },
  });
}