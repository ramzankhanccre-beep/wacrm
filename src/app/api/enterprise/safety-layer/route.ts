import { NextResponse } from 'next/server';

// GET: Get safety rules
export async function GET() {
  const mockRules = [
    {
      id: '1',
      name: 'Price Upper Limit',
      description: 'Never quote a price above $10,000 without human approval',
      category: 'pricing',
      severity: 'critical',
      enabled: true,
      triggerCount: 12,
    },
    {
      id: '2',
      name: 'No Delivery Promises',
      description: 'Never promise specific delivery dates',
      category: 'commitments',
      severity: 'high',
      enabled: true,
      triggerCount: 8,
    },
    {
      id: '3',
      name: 'Legal Escalation',
      description: 'Always escalate if legal terms mentioned',
      category: 'escalation',
      severity: 'critical',
      enabled: true,
      triggerCount: 3,
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      rules: mockRules,
      summary: {
        totalRules: 5,
        activeRules: 4,
        triggeredThisMonth: 23,
        criticalRules: 2,
      },
    },
  });
}

// POST: Create or update a safety rule
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Safety rule created',
    data: {
      ruleId: `rule_${Date.now()}`,
    },
  });
}