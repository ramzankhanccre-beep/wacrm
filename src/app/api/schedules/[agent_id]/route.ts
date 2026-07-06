import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/agents/admin-client'

interface RouteParams {
  params: Promise<{ agent_id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { agent_id } = await params
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
    .select('*')
    .eq('agent_id', agent_id)
    .eq('account_id', profile.account_id)
    .order('day_of_week', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ schedules: schedules ?? [] })
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { agent_id } = await params
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

  const { schedule_id, day_of_week, start_time, end_time, is_active } = body as Record<string, unknown>

  if (!schedule_id || typeof schedule_id !== 'string') {
    return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}
  if (typeof day_of_week === 'number') updateData.day_of_week = day_of_week
  if (typeof start_time === 'string') updateData.start_time = start_time
  if (typeof end_time === 'string') updateData.end_time = end_time
  if (typeof is_active === 'boolean') updateData.is_active = is_active

  const admin = supabaseAdmin()
  const { data: schedule, error } = await admin
    .from('agent_schedules')
    .update(updateData)
    .eq('id', schedule_id)
    .eq('agent_id', agent_id)
    .eq('account_id', profile.account_id)
    .select()
    .single()

  if (error || !schedule) {
    return NextResponse.json({ error: error?.message ?? 'Failed to update schedule' }, { status: 500 })
  }

  return NextResponse.json({ schedule })
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { agent_id } = await params
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

  const { searchParams } = new URL(request.url)
  const scheduleId = searchParams.get('schedule_id')

  if (!scheduleId) {
    return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
  }

  const admin = supabaseAdmin()
  const { error } = await admin
    .from('agent_schedules')
    .delete()
    .eq('id', scheduleId)
    .eq('agent_id', agent_id)
    .eq('account_id', profile.account_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}