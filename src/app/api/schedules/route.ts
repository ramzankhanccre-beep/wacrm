import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/agents/admin-client'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  const admin = supabaseAdmin()
  const { data: schedules, error } = await admin
    .from('agent_schedules')
    .select(`
      *,
      agent:agents(id, name)
    `)
    .eq('account_id', profile.account_id)
    .order('day_of_week', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ schedules: schedules ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { agent_id, day_of_week, start_time, end_time, is_active } = body as Record<string, unknown>

  if (!agent_id || typeof agent_id !== 'string') {
    return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
  }
  if (typeof day_of_week !== 'number' || day_of_week < 0 || day_of_week > 6) {
    return NextResponse.json({ error: 'Day of week (0-6) is required' }, { status: 400 })
  }
  if (!start_time || typeof start_time !== 'string') {
    return NextResponse.json({ error: 'Start time is required' }, { status: 400 })
  }
  if (!end_time || typeof end_time !== 'string') {
    return NextResponse.json({ error: 'End time is required' }, { status: 400 })
  }

  const admin = supabaseAdmin()

  // Check agent belongs to account
  const { data: agent } = await admin
    .from('agents')
    .select('id')
    .eq('id', agent_id)
    .eq('account_id', profile.account_id)
    .single()

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  const { data: schedule, error } = await admin
    .from('agent_schedules')
    .insert({
      agent_id,
      account_id: profile.account_id,
      day_of_week,
      start_time,
      end_time,
      is_active: typeof is_active === 'boolean' ? is_active : true,
    })
    .select()
    .single()

  if (error || !schedule) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create schedule' }, { status: 500 })
  }

  return NextResponse.json({ schedule }, { status: 201 })
}