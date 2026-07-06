import { NextResponse } from 'next/server';

// GET: Get marketplace skills
export async function GET() {
  const mockSkills = [
    { id: '1', name: 'Lead Qualification Pro', author: 'Brand Reach Team', rating: 4.7, installs: 567, price: 49, version: '2.1.0' },
    { id: '2', name: 'Appointment Booking', author: 'SchedulerPro', rating: 4.9, installs: 2103, price: 0, version: '3.0.0' },
  ];

  return NextResponse.json({
    success: true,
    data: {
      skills: mockSkills,
      summary: { total: 6, installed: 8, updatesAvailable: 2 },
    },
  });
}

// POST: Install a skill
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Skill installed successfully',
  });
}