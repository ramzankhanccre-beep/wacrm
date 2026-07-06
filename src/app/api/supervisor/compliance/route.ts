import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/supervisor/compliance - list rules
// POST /api/supervisor/compliance - create rule
// PATCH /api/supervisor/compliance - update rule/violation

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const violations = searchParams.get('violations') === 'true';
  const unresolved = searchParams.get('unresolved') === 'true';
  const ruleId = searchParams.get('ruleId');

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

  if (violations) {
    let query = supabase
      .from('compliance_violations')
      .select('*, rule:compliance_rules(name, rule_type), agent:agents(name)')
      .eq('account_id', profile.account_id)
      .order('created_at', { ascending: false });

    if (unresolved) {
      query = query.eq('is_resolved', false);
    }

    const { data: violationsData, error } = await query.limit(100);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ violations: violationsData || [] });
  }

  // Return compliance rules
  let query = supabase
    .from('compliance_rules')
    .select('*')
    .eq('account_id', profile.account_id)
    .order('created_at', { ascending: false });

  if (ruleId) {
    query = query.eq('id', ruleId);
  }

  const { data: rules, error } = await query.limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rules: rules || [] });
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
    .from('compliance_rules')
    .insert({
      account_id: profile.account_id,
      name: body.name,
      description: body.description,
      rule_type: body.rule_type,
      rule_config: body.rule_config || {},
      severity: body.severity || 'warning',
      is_active: body.is_active ?? true,
      applies_to_all_agents: body.applies_to_all_agents ?? true,
      agent_ids: body.agent_ids || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rule: data });
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

  // Handle rule update
  if (body.rule_id) {
    const { data, error } = await supabase
      .from('compliance_rules')
      .update({
        name: body.name,
        description: body.description,
        rule_type: body.rule_type,
        rule_config: body.rule_config,
        severity: body.severity,
        is_active: body.is_active,
        applies_to_all_agents: body.applies_to_all_agents,
        agent_ids: body.agent_ids,
      })
      .eq('id', body.rule_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ rule: data });
  }

  // Handle violation resolution
  if (body.violation_id) {
    const { data, error } = await supabase
      .from('compliance_violations')
      .update({
        is_resolved: true,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
        resolution_notes: body.resolution_notes,
      })
      .eq('id', body.violation_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ violation: data });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const ruleId = searchParams.get('ruleId');

  if (!ruleId) {
    return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });
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
    .from('compliance_rules')
    .delete()
    .eq('id', ruleId)
    .eq('account_id', profile.account_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}