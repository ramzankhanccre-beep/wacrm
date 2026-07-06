import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/voice/tts - list TTS configurations
// POST /api/voice/tts - create TTS configuration
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
    .from('voice_tts_configs')
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

  if (body.is_default) {
    await supabase
      .from('voice_tts_configs')
      .update({ is_default: false })
      .eq('account_id', profile.account_id);
  }

  const { data, error } = await supabase
    .from('voice_tts_configs')
    .insert({
      account_id: profile.account_id,
      provider: body.provider,
      voice_id: body.voice_id,
      voice_name: body.voice_name,
      language: body.language,
      speed: body.speed ?? 1.0,
      pitch: body.pitch ?? 0,
      enable_ssml: body.enable_ssml ?? true,
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