import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/voice/stt - list STT configurations
// POST /api/voice/stt - create STT configuration
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
    .from('voice_stt_configs')
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

  // If this config is default, unset other defaults
  if (body.is_default) {
    await supabase
      .from('voice_stt_configs')
      .update({ is_default: false })
      .eq('account_id', profile.account_id);
  }

  const { data, error } = await supabase
    .from('voice_stt_configs')
    .insert({
      account_id: profile.account_id,
      provider: body.provider,
      model: body.model,
      language: body.language,
      enable_diarization: body.enable_diarization ?? true,
      enable_punctuation: body.enable_punctuation ?? true,
      is_default: body.is_default ?? false,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}