import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/voice/sentiment - list sentiment configurations
// POST /api/voice/sentiment - create sentiment configuration
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

  const { data: configs, error } = await supabase
    .from('voice_sentiment_configs')
    .select('*')
    .eq('account_id', profile.account_id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ configs: configs || [] });
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
    .from('voice_sentiment_configs')
    .insert({
      account_id: profile.account_id,
      name: body.name,
      provider: body.provider,
      enable_real_time: body.enable_real_time ?? true,
      negative_threshold: body.negative_threshold ?? 0.3,
      auto_escalate_on_negative: body.auto_escalate_on_negative ?? true,
      alert_channels: body.alert_channels || [],
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}