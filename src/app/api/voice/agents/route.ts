import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/voice/agents - list voice agents
// POST /api/voice/agents - create voice agent
export async function GET(request: Request) {
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

  const { data: agents, error } = await supabase
    .from('voice_agents')
    .select('*, agent:agents(name)')
    .eq('account_id', profile.account_id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ agents: agents || [] });
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

  const body = await request.json();

  const { data, error } = await supabase
    .from('voice_agents')
    .insert({
      account_id: profile.account_id,
      name: body.name,
      description: body.description,
      agent_id: body.agent_id || null,
      stt_config_id: body.stt_config_id || null,
      tts_config_id: body.tts_config_id || null,
      enable_inbound: body.enable_inbound ?? true,
      enable_outbound: body.enable_outbound ?? false,
      max_duration_minutes: body.max_duration_minutes ?? 30,
      silence_timeout_seconds: body.silence_timeout_seconds ?? 10,
      interruption_sensitivity: body.interruptionSensitivity || 'medium',
      greeting_message: body.greeting_message || null,
      fallback_message: body.fallback_message || null,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ agent: data });
}