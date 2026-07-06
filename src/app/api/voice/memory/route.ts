import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/voice/memory/entries - list voice memory entries
// GET /api/voice/memory/transcripts - list voice transcripts
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'entries';

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

  if (type === 'transcripts') {
    const { data: transcripts, error } = await supabase
      .from('voice_transcripts')
      .select('*, contact:contacts(name, phone)')
      .eq('account_id', profile.account_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transcripts: transcripts || [] });
  }

  // Default: return memory entries
  const { data: entries, error } = await supabase
    .from('voice_memory_entries')
    .select('*, contact:contacts(name, phone), call:voice_calls(started_at, duration_seconds)')
    .eq('account_id', profile.account_id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entries: entries || [] });
}