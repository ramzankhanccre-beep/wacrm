import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/flows/approvals - list approval requests
// PATCH /api/flows/approvals - respond to approval
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const pending = searchParams.get('pending') === 'true';
  const flowRunId = searchParams.get('flowRunId');

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
    .from('workflow_approvals')
    .select('*, flow:flows(name), contact:contacts(name)')
    .eq('account_id', profile.account_id)
    .order('created_at', { ascending: false });

  if (pending) {
    query = query.eq('status', 'pending');
  }

  if (flowRunId) {
    query = query.eq('flow_run_id', flowRunId);
  }

  const { data: approvals, error } = await query.limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ approvals: approvals || [] });
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

  if (!body.id) {
    return NextResponse.json({ error: 'Approval ID required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('workflow_approvals')
    .update({
      status: body.status, // 'approved' or 'rejected'
      responded_at: new Date().toISOString(),
      responded_by: user.id,
      response_notes: body.notes,
    })
    .eq('id', body.id)
    .eq('account_id', profile.account_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If approved, resume the flow execution
  if (body.status === 'approved' && body.flow_run_id) {
    // Trigger flow to continue - the flow engine would pick this up
    // This is handled by the flow execution logic
  }

  return NextResponse.json({ approval: data });
}