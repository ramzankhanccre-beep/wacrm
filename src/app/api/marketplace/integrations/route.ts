import { NextResponse } from 'next/server';

// GET: Get marketplace integrations
export async function GET() {
  const mockIntegrations = [
    { id: '1', name: 'Salesforce', category: 'crm', status: 'installed', version: '2.1.0' },
    { id: '2', name: 'HubSpot', category: 'crm', status: 'available', version: '1.8.0' },
    { id: '3', name: 'Google Calendar', category: 'calendar', status: 'installed', version: '3.0.0' },
    { id: '4', name: 'Stripe', category: 'payments', status: 'available', version: '1.9.0' },
  ];

  return NextResponse.json({
    success: true,
    data: {
      integrations: mockIntegrations,
      summary: { total: 10, installed: 3, available: 7 },
    },
  });
}

// POST: Connect an integration
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Integration connected successfully',
    data: { oauthUrl: 'https://oauth.example.com/authorize' },
  });
}