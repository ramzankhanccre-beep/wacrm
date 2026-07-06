import { NextResponse } from 'next/server';

// GET: Get workflow recommendations
export async function GET() {
  const mockRepetitiveActions = [
    {
      id: '1',
      actionName: 'Follow-up after no response',
      frequency: 45,
      timeframe: '30 days',
      performedBy: 'Human',
      lastPerformed: '2026-07-04',
      estimatedTimeSaved: '2h 15m/day',
      status: 'detected',
    },
    {
      id: '2',
      actionName: 'Manually updating lead stage',
      frequency: 78,
      timeframe: '30 days',
      performedBy: 'Human',
      lastPerformed: '2026-07-05',
      estimatedTimeSaved: '1h 30m/day',
      status: 'detected',
    },
    {
      id: '3',
      actionName: 'Sending pricing PDF to prospects',
      frequency: 32,
      timeframe: '30 days',
      performedBy: 'Human',
      lastPerformed: '2026-07-03',
      estimatedTimeSaved: '45m/day',
      status: 'recommended',
    },
  ];

  const mockWorkflowRecs = [
    {
      id: '1',
      name: 'Auto Follow-Up Sequence',
      description: 'Automatically send follow-up messages after 24h of no response',
      trigger: 'No response for 24 hours',
      actions: [
        'Send templated follow-up message',
        'Wait 2 hours',
        'If no response, escalate to human',
      ],
      timeSaved: '2h 15m/day',
      confidence: 94,
      status: 'ready',
      category: 'follow-up',
    },
    {
      id: '2',
      name: 'Lead Stage Automation',
      description: 'Automatically update lead stages based on conversation signals',
      trigger: 'Intent detected: "interested", "need more info", "not interested"',
      actions: [
        'Detect lead stage intent',
        'Update CRM lead stage',
        'Notify assigned agent',
      ],
      timeSaved: '1h 30m/day',
      confidence: 89,
      status: 'ready',
      category: 'automation',
    },
    {
      id: '3',
      name: 'Pricing PDF Auto-Send',
      description: 'Send pricing PDF automatically when customer asks for pricing',
      trigger: 'Message contains "pricing" or "price" or "cost"',
      actions: [
        'Detect pricing intent',
        'Retrieve relevant pricing document',
        'Send with personalized intro',
      ],
      timeSaved: '45m/day',
      confidence: 87,
      status: 'draft',
      category: 'content',
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      repetitiveActions: mockRepetitiveActions,
      workflowRecommendations: mockWorkflowRecs,
      summary: {
        detected: 3,
        potentialSavings: '4.5h/day',
        suggestions: 3,
        activeWorkflows: 2,
      },
    },
  });
}

// POST: Generate workflow from recommendation
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Workflow generated successfully',
    data: {
      workflowId: `wf_${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
    },
  });
}