import { NextResponse } from 'next/server';

// GET: Get all companies
export async function GET() {
  const companies = [
    {
      id: '1',
      name: 'Brand Reach Solutions',
      slug: 'brandreach',
      status: 'active',
      plan: 'enterprise',
      users: 24,
      agents: 5,
      monthlyCost: 499,
    },
    {
      id: '2',
      name: 'Horizon Realty',
      slug: 'horizon-realty',
      status: 'active',
      plan: 'professional',
      users: 8,
      agents: 2,
      monthlyCost: 199,
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      companies,
      summary: {
        totalCompanies: 4,
        totalUsers: 40,
        monthlyRevenue: 747,
        activeTrials: 1,
      },
    },
  });
}

// POST: Create a new company
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Company created',
    data: {
      companyId: `company_${Date.now()}`,
      status: 'trial',
    },
  });
}