import { NextResponse } from 'next/server';

// GET: Get cost recommendations
export async function GET() {
  const mockAgentUsage = [
    {
      id: '1',
      name: 'Layla',
      model: 'GPT-4o',
      dailyTokens: 1250000,
      dailyCost: 45.5,
      avgResponseTokens: 850,
      conversations: 1247,
      status: 'optimal',
    },
    {
      id: '2',
      name: 'Ahmed',
      model: 'GPT-4 Turbo',
      dailyTokens: 890000,
      dailyCost: 28.9,
      avgResponseTokens: 620,
      conversations: 892,
      status: 'optimizable',
    },
    {
      id: '3',
      name: 'Sales Bot',
      model: 'GPT-4o',
      dailyTokens: 2100000,
      dailyCost: 78.0,
      avgResponseTokens: 1200,
      conversations: 156,
      status: 'high',
    },
  ];

  const mockRecommendations = [
    {
      id: '1',
      agentName: 'Ahmed',
      currentModel: 'GPT-4 Turbo',
      recommendedModel: 'GPT-3.5 Turbo',
      reason: 'Simple conversation patterns with minimal complexity',
      projectedSavings: 18.7,
      savingsPercent: 65,
      impact: 'Low - Most conversations are straightforward FAQ and booking',
      risk: 'low',
    },
    {
      id: '2',
      agentName: 'Sales Bot',
      currentModel: 'GPT-4o',
      recommendedModel: 'GPT-4o Mini',
      reason: 'High volume, low complexity interactions',
      projectedSavings: 52.0,
      savingsPercent: 67,
      impact: 'Medium - May struggle with complex multi-step negotiations',
      risk: 'medium',
    },
    {
      id: '3',
      agentName: 'Layla',
      currentModel: 'GPT-4o',
      recommendedModel: 'GPT-4o',
      reason: 'Already on optimal model for conversation type',
      projectedSavings: 0,
      savingsPercent: 0,
      impact: 'None - Current model is ideal for conversation complexity',
      risk: 'none',
    },
  ];

  const modelOptions = [
    { name: 'GPT-4o', context: '128k', inputPrice: 0.03, outputPrice: 0.06 },
    { name: 'GPT-4o Mini', context: '128k', inputPrice: 0.006, outputPrice: 0.024 },
    { name: 'GPT-4 Turbo', context: '128k', inputPrice: 0.03, outputPrice: 0.06 },
    { name: 'GPT-3.5 Turbo', context: '16k', inputPrice: 0.0015, outputPrice: 0.002 },
    { name: 'Claude 3.5 Sonnet', context: '200k', inputPrice: 0.015, outputPrice: 0.075 },
    { name: 'Claude 3 Haiku', context: '200k', inputPrice: 0.00025, outputPrice: 0.00125 },
  ];

  const totalProjectedSavings = mockRecommendations
    .filter(r => r.id !== '3')
    .reduce((sum, r) => sum + r.projectedSavings, 0);

  return NextResponse.json({
    success: true,
    data: {
      agentUsage: mockAgentUsage,
      recommendations: mockRecommendations,
      modelOptions,
      summary: {
        dailyCost: 152.4,
        dailyTokens: 4240000,
        potentialSavings: totalProjectedSavings,
        optimizationsAvailable: 2,
      },
    },
  });
}

// POST: Simulate model switch impact
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Simulation completed',
    data: {
      simulationId: `sim_${Date.now()}`,
      results: {
        originalDailyCost: 28.9,
        newDailyCost: 10.2,
        savings: 18.7,
        savingsPercent: 65,
        projectedMonthlySavings: 561,
        projectedYearlySavings: 6831,
        riskLevel: 'low',
        potentialIssues: [],
      },
    },
  });
}