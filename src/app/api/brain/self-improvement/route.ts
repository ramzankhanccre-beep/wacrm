import { NextResponse } from 'next/server';

// GET: Analyze agent performance and generate improvement recommendations
export async function GET() {
  // In production, this would analyze real agent metrics from the database

  const mockRecommendations = [
    {
      id: '1',
      agentName: 'Layla',
      category: 'Prompt',
      severity: 'high',
      title: 'Prompt section 3 caused 12 incorrect responses this week',
      description: 'The greeting section is too verbose and customers are responding before the agent finishes introducing itself.',
      suggestion: 'Shorten greeting to 2 sentences max. Consider adding a pause before asking questions.',
      affectedConversations: 12,
      confidence: 94,
    },
    {
      id: '2',
      agentName: 'Ahmed',
      category: 'Knowledge',
      severity: 'medium',
      title: 'Missing pricing information in knowledge base',
      description: '3 customers asked about premium tier pricing but agent could not retrieve the information.',
      suggestion: 'Add premium tier pricing document to the knowledge base.',
      affectedConversations: 3,
      confidence: 88,
    },
    {
      id: '3',
      agentName: 'Ahmed',
      category: 'Tool',
      severity: 'high',
      title: 'Lead creation tool not triggered for 8 qualified leads',
      description: 'Agent correctly identified leads but failed to create CRM records automatically.',
      suggestion: 'Add explicit tool call trigger when lead score exceeds 70.',
      affectedConversations: 8,
      confidence: 91,
    },
  ];

  const mockAgentPerformance = [
    {
      id: '1',
      name: 'Layla',
      status: 'Live',
      totalConversations: 1247,
      avgResponseTime: 2.3,
      resolutionRate: 87.5,
      escalationRate: 12.5,
      failedIntents: 23,
      weekOverWeek: 5.2,
    },
    {
      id: '2',
      name: 'Ahmed',
      status: 'Live',
      totalConversations: 892,
      avgResponseTime: 3.1,
      resolutionRate: 72.3,
      escalationRate: 27.7,
      failedIntents: 45,
      weekOverWeek: -2.1,
    },
    {
      id: '3',
      name: 'Sales Bot',
      status: 'Testing',
      totalConversations: 156,
      avgResponseTime: 1.8,
      resolutionRate: 91.2,
      escalationRate: 8.8,
      failedIntents: 8,
      weekOverWeek: 12.4,
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      recommendations: mockRecommendations,
      agentPerformance: mockAgentPerformance,
      summary: {
        totalAgents: 3,
        openIssues: mockRecommendations.length,
        resolvedThisMonth: 12,
      },
    },
  });
}

// POST: Run analysis on agent performance
export async function POST() {
  // In production, this would trigger a real analysis job
  // For now, return a mock response indicating analysis is complete

  return NextResponse.json({
    success: true,
    message: 'Analysis completed. Found 3 new recommendations.',
    data: {
      analyzedAt: new Date().toISOString(),
      newRecommendations: 3,
    },
  });
}