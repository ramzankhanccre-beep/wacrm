import { NextResponse } from 'next/server';

// GET: Get prompt recommendations
export async function GET() {
  const mockRecommendations = [
    {
      id: '1',
      agentName: 'Layla',
      section: 'Greeting',
      issue: 'Greeting exceeds 3 sentences, causing early customer response',
      evidence: '67% of conversations have customer interruption within 2 messages',
      suggestion: 'Reduce greeting to 2 sentences maximum',
      suggestedText: "Hi {{contact_name}}! I'm Layla from Brand Reach Solutions. How can I help you today?",
      confidence: 92,
    },
    {
      id: '2',
      agentName: 'Ahmed',
      section: 'Objection Handling',
      issue: 'No response pattern for price objections',
      evidence: '23 escalated conversations mention "too expensive" with no resolution',
      suggestion: 'Add price objection handling sequence',
      suggestedText: "I understand budget is important. Let me share some options that might work better for your needs...",
      confidence: 88,
    },
    {
      id: '3',
      agentName: 'Sales Bot',
      section: 'Closing',
      issue: 'Missing confirmation before ending conversations',
      evidence: '14% of leads marked as "interested" but no follow-up scheduled',
      suggestion: 'Add explicit confirmation and next step before closing',
      suggestedText: "Perfect! I'll send a summary to {{phone}} and follow up tomorrow at 10am. Does that work for you?",
      confidence: 85,
    },
  ];

  const mockPatterns = [
    {
      id: '1',
      topic: 'Appointment Booking',
      successRate: 94,
      sampleCount: 156,
      winningPattern: 'Short greeting → immediate availability check → single question → confirm',
      avgMessages: 6,
    },
    {
      id: '2',
      topic: 'Lead Qualification',
      successRate: 87,
      sampleCount: 243,
      winningPattern: 'Name introduction → value proposition → open-ended question → qualify',
      avgMessages: 8,
    },
    {
      id: '3',
      topic: 'Pricing Inquiry',
      successRate: 91,
      sampleCount: 189,
      winningPattern: 'Acknowledge → offer tiered options → ask budget → recommend',
      avgMessages: 5,
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      recommendations: mockRecommendations,
      patterns: mockPatterns,
      summary: {
        patternsExtracted: 12,
        pendingSuggestions: 3,
        abTestsInProgress: 2,
        appliedThisMonth: 8,
      },
    },
  });
}

// POST: Run test on a recommendation
export async function POST(request: Request) {
  // In production, this would run actual tests
  // For now, return mock test results

  return NextResponse.json({
    success: true,
    message: 'Test completed successfully',
    data: {
      testId: `test_${Date.now()}`,
      result: {
        originalScore: 62,
        newScore: 78,
        improvement: '+16%',
      },
    },
  });
}