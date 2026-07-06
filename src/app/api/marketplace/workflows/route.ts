import { NextResponse } from 'next/server';

// GET: Get marketplace workflows
export async function GET() {
  const mockWorkflows = [
    { id: '1', name: 'Lead Nurture Sequence', author: 'Brand Reach Team', rating: 4.8, installs: 1247, price: 0, nodes: 12 },
    { id: '2', name: 'Support Ticket Handler', author: 'SupportPro', rating: 4.6, installs: 567, price: 49, nodes: 6 },
  ];

  return NextResponse.json({
    success: true,
    data: {
      workflows: mockWorkflows,
      summary: { total: 6, totalInstalls: 4232 },
    },
  });
}

// POST: Install a workflow
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Workflow installed successfully',
  });
}