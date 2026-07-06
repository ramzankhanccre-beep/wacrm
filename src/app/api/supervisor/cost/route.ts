import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const summary = searchParams.get('summary') === 'true';

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

  let query = supabase
    .from('agent_cost_logs')
    .select('*, agent:agents(name)')
    .eq('account_id', profile.account_id)
    .order('created_at', { ascending: false });

  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data: logs, error } = await query.limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (summary && logs?.length) {
    // Calculate summary stats
    const byAgent = logs.reduce((acc, log) => {
      const agentName = log.agent?.name || 'Unknown';
      if (!acc[agentName]) {
        acc[agentName] = { inputTokens: 0, outputTokens: 0, cost: 0 };
      }
      acc[agentName].inputTokens += log.input_tokens || 0;
      acc[agentName].outputTokens += log.output_tokens || 0;
      acc[agentName].cost += parseFloat(log.total_cost_usd) || 0;
      return acc;
    }, {} as Record<string, { inputTokens: number; outputTokens: number; cost: number }>);

    const totalCost = logs.reduce((sum, log) => sum + (parseFloat(log.total_cost_usd) || 0), 0);
    const totalInputTokens = logs.reduce((sum, log) => sum + (log.input_tokens || 0), 0);
    const totalOutputTokens = logs.reduce((sum, log) => sum + (log.output_tokens || 0), 0);

    return NextResponse.json({
      summary: {
        totalCost,
        totalInputTokens,
        totalOutputTokens,
        byAgent,
        logCount: logs.length,
      },
    });
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

  const { data, error } = await supabase
    .from('agent_cost_logs')
    .insert({
      account_id: profile.account_id,
      agent_id: body.agent_id,
      conversation_id: body.conversation_id,
      model_provider: body.model_provider,
      model_name: body.model_name,
      input_tokens: body.input_tokens || 0,
      output_tokens: body.output_tokens || 0,
      input_cost_usd: body.input_cost_usd || 0,
      output_cost_usd: body.output_cost_usd || 0,
      metadata: body.metadata || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log: data });
}