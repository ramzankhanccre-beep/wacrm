import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const conversationId = searchParams.get('conversationId');
  const unresolved = searchParams.get('unresolved');

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's account membership
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id, account_role')
    .eq('user_id', user.id)
    .single();

  if (!profile?.account_id) {
    return NextResponse.json({ error: 'No account found' }, { status: 403 });
  }

  let query = supabase
    .from('agent_quality_logs')
    .select('*, agent:agents(name), conversation:conversations(id)')
    .eq('account_id', profile.account_id)
    .order('created_at', { ascending: false });

  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  if (conversationId) {
    query = query.eq('conversation_id', conversationId);
  }

  if (unresolved === 'true') {
    query = query.eq('review_status', 'pending');
  }

  const { data: logs, error } = await query.limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ logs: logs || [] });
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

  // Check role permission
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
    .from('agent_quality_logs')
    .insert({
      account_id: profile.account_id,
      agent_id: body.agent_id,
      conversation_id: body.conversation_id,
      message_id: body.message_id,
      quality_score: body.quality_score,
      criteria_scores: body.criteria_scores || {},
      metadata: body.metadata || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log: data });
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

  const { data, error } = await supabase
    .from('agent_quality_logs')
    .update({
      review_status: body.review_status,
      review_notes: body.review_notes,
      coaching_notes: body.coaching_notes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log: data });
}