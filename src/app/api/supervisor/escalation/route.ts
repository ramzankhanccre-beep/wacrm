import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/supervisor/escalation - list policies or events
// POST /api/supervisor/escalation - create policy or trigger escalation
// PATCH /api/supervisor/escalation - update policy or acknowledge event
// DELETE /api/supervisor/escalation - delete policy

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const events = searchParams.get('events') === 'true';
  const pending = searchParams.get('pending') === 'true';
  const policyId = searchParams.get('policyId');

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id, account_role')
    .eq('user_id', user.id)
    .single();

  if (!profile?.account_id) {
    return NextResponse.json({ error: 'No account found' }, { status: 403 });
  }

  if (events) {
    let query = supabase
      .from('escalation_events')
      .select('*, policy:escalation_policies(name), conversation:conversations(id)')
      .eq('account_id', profile.account_id)
      .order('created_at', { ascending: false });

    if (pending) {
      query = query.in('status', ['pending', 'notified']);
    }

    const { data: eventsData, error } = await query.limit(100);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ events: eventsData || [] });
  }

  // Return escalation policies
  let query = supabase
    .from('escalation_policies')
    .select('*')
    .eq('account_id', profile.account_id)
    .order('priority', { ascending: true });

  if (policyId) {
    query = query.eq('id', policyId);
  }

  const { data: policies, error } = await query.limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ policies: policies || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id, account_role')
    .eq('user_id', user.id)
    .single();

  if (!profile?.account_id) {
    return NextResponse.json({ error: 'No account found' }, { status: 403 });
  }

  // Create escalation policy
  if (body.createPolicy) {
    const { data: member } = await supabase
      .from('account_members')
      .select('role')
      .eq('account_id', profile.account_id)
      .eq('user_id', user.id)
      .single();

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('escalation_policies')
      .insert({
        account_id: profile.account_id,
        name: body.name,
        description: body.description,
        priority: body.priority || 0,
        trigger_conditions: body.trigger_conditions || {},
        escalation_target_type: body.escalation_target_type,
        escalation_target_id: body.escalation_target_id,
        notification_channels: body.notification_channels || [],
        auto_escalate: body.auto_escalate ?? true,
        escalation_delay_seconds: body.escalation_delay_seconds || 300,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ policy: data });
  }

  // Trigger escalation event
  const { data, error } = await supabase
    .from('escalation_events')
    .insert({
      account_id: profile.account_id,
      policy_id: body.policy_id,
      conversation_id: body.conversation_id,
      trigger_reason: body.trigger_reason,
      target_user_id: body.target_user_id,
      target_agent_id: body.target_agent_id,
      target_team_id: body.target_team_id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id, account_role')
    .eq('user_id', user.id)
    .single();

  if (!profile?.account_id) {
    return NextResponse.json({ error: 'No account found' }, { status: 403 });
  }

  // Update policy
  if (body.policy_id) {
    const { data, error } = await supabase
      .from('escalation_policies')
      .update({
        name: body.name,
        description: body.description,
        priority: body.priority,
        trigger_conditions: body.trigger_conditions,
        escalation_target_type: body.escalation_target_type,
        escalation_target_id: body.escalation_target_id,
        notification_channels: body.notification_channels,
        auto_escalate: body.auto_escalate,
        escalation_delay_seconds: body.escalation_delay_seconds,
        is_active: body.is_active,
      })
      .eq('id', body.policy_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ policy: data });
  }

  // Acknowledge or resolve escalation event
  if (body.event_id) {
    const { data, error } = await supabase
      .from('escalation_events')
      .update({
        status: body.status,
        acknowledged_by: body.status === 'acknowledged' ? user.id : undefined,
        acknowledged_at: body.status === 'acknowledged' ? new Date().toISOString() : undefined,
        resolved_at: body.status === 'resolved' ? new Date().toISOString() : undefined,
        notes: body.notes,
      })
      .eq('id', body.event_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ event: data });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const policyId = searchParams.get('policyId');

  if (!policyId) {
    return NextResponse.json({ error: 'Policy ID required' }, { status: 400 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id, account_role')
    .eq('user_id', user.id)
    .single();

  if (!profile?.account_id) {
    return NextResponse.json({ error: 'No account found' }, { status: 403 });
  }

  const { error } = await supabase
    .from('escalation_policies')
    .delete()
    .eq('id', policyId)
    .eq('account_id', profile.account_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}