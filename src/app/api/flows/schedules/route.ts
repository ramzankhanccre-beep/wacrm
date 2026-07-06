import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/flows/schedules - list schedules
// POST /api/flows/schedules - create schedule
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const flowId = searchParams.get('flowId');
  const active = searchParams.get('active');

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  if (!profile?.account_id) {
    return NextResponse.json({ error: 'No account found' }, { status: 403 });
  }

  let query = supabase
    .from('workflow_schedules')
    .select('*, flow:flows(name)')
    .eq('account_id', profile.account_id)
    .order('created_at', { ascending: false });

  if (flowId) {
    query = query.eq('flow_id', flowId);
  }

  if (active === 'true') {
    query = query.eq('is_active', true);
  }

  const { data: schedules, error } = await query.limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ schedules: schedules || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  if (!profile?.account_id) {
    return NextResponse.json({ error: 'No account found' }, { status: 403 });
  }

  // Check permissions
  const { data: member } = await supabase
    .from('account_members')
    .select('role')
    .eq('account_id', profile.account_id)
    .eq('user_id', user.id)
    .single();

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const body = await request.json();

  // Validate cron expression
  const cronRegex = /^(\*|([0-9]|([0-9][0-9]))|(\*\/[0-9]+)) (\*|([0-9]|([0-9][0-9]))|(\*\/[0-9]+)) (\*|([0-9]|([0-9][0-9]))|(\*\/[0-9]+)) (\*|([0-9]|([0-9][0-9]))|(\*\/[0-9]+)) (\*|([0-9]|([0-9][0-9]))|(\*\/[0-9]+))$/;
  if (!cronRegex.test(body.cron_expression)) {
    return NextResponse.json({ error: 'Invalid cron expression' }, { status: 400 });
  }

  // Calculate next run
  const nextRun = calculateNextRun(body.cron_expression, body.timezone || 'UTC');

  const { data, error } = await supabase
    .from('workflow_schedules')
    .insert({
      flow_id: body.flow_id,
      account_id: profile.account_id,
      cron_expression: body.cron_expression,
      timezone: body.timezone || 'UTC',
      next_run_at: nextRun,
      is_active: body.is_active ?? true,
      metadata: body.metadata || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ schedule: data });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  if (!profile?.account_id) {
    return NextResponse.json({ error: 'No account found' }, { status: 403 });
  }

  const body = await request.json();

  const updates: Record<string, unknown> = {};

  if (body.cron_expression !== undefined) updates.cron_expression = body.cron_expression;
  if (body.timezone !== undefined) updates.timezone = body.timezone;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.metadata !== undefined) updates.metadata = body.metadata;

  // Recalculate next run if cron changed
  if (body.cron_expression) {
    updates.next_run_at = calculateNextRun(body.cron_expression, body.timezone || 'UTC');
  }

  const { data, error } = await supabase
    .from('workflow_schedules')
    .update(updates)
    .eq('id', body.id)
    .eq('account_id', profile.account_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ schedule: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const scheduleId = searchParams.get('id');

  if (!scheduleId) {
    return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  if (!profile?.account_id) {
    return NextResponse.json({ error: 'No account found' }, { status: 403 });
  }

  const { error } = await supabase
    .from('workflow_schedules')
    .delete()
    .eq('id', scheduleId)
    .eq('account_id', profile.account_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Simple cron parser - calculates next run time
function calculateNextRun(cron: string, timezone: string): Date {
  const now = new Date();
  const parts = cron.split(' ');

  if (parts.length < 5) {
    // Default to daily at 9am
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }

  const [min, hour, dayOfMonth, month, dayOfWeek] = parts;

  const next = new Date(now);
  next.setSeconds(0, 0);

  // Simple implementation - find next matching time
  // For more complex cron, use a library like cron-parser
  if (min !== '*') next.setMinutes(parseInt(min));
  else next.setMinutes(0);

  if (hour !== '*') next.setHours(parseInt(hour));
  else next.setHours(0);

  if (dayOfMonth !== '*') next.setDate(parseInt(dayOfMonth));
  if (month !== '*') next.setMonth(parseInt(month) - 1);
  if (dayOfWeek !== '*') {
    // Adjust to the correct day of week - this is complex because setDate sets day of month, not day of week
    const currentDay = next.getDay();
    const targetDay = parseInt(dayOfWeek);
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    next.setDate(next.getDate() + daysUntilTarget);
  }

  // If time has passed, add a day
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}