import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/agents/admin-client'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id: teamId } = await params
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
    return NextResponse.json(
      { error: 'Unable to resolve account information' },
      { status: 403 },
    )
  }

  const admin = supabaseAdmin()

  // Get team
  const { data: team, error } = await admin
    .from('agent_teams')
    .select('*')
    .eq('id', teamId)
    .eq('account_id', profile.account_id)
    .single()

  if (error || !team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  // Get team members with agent details
  const { data: members, error: membersError } = await admin
    .from('agent_team_members')
    .select(`
      *,
      agent:agents(*)
    `)
    .eq('team_id', teamId)

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 })
  }

  // Get member count
  const { count } = await admin
    .from('agent_team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId)

  return NextResponse.json({ team: { ...team, member_count: count ?? 0, members: members ?? [] } })
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id: teamId } = await params
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
    return NextResponse.json(
      { error: 'Unable to resolve account information' },
      { status: 403 },
    )
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, description, color, is_active } = body as Record<string, unknown>

  const updateData: Record<string, unknown> = {}

  if (typeof name === 'string') {
    updateData.name = name.trim()
  }
  if (typeof description === 'string') {
    updateData.description = description.trim()
  }
  if (typeof color === 'string' && color.match(/^#[0-9A-Fa-f]{6}$/)) {
    updateData.color = color
  }
  if (typeof is_active === 'boolean') {
    updateData.is_active = is_active
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const admin = supabaseAdmin()
  const { data: team, error } = await admin
    .from('agent_teams')
    .update(updateData)
    .eq('id', teamId)
    .eq('account_id', profile.account_id)
    .select()
    .single()

  if (error || !team) {
    return NextResponse.json({ error: error?.message ?? 'Failed to update team' }, { status: 500 })
  }

  return NextResponse.json({ team })
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id: teamId } = await params
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
    return NextResponse.json(
      { error: 'Unable to resolve account information' },
      { status: 403 },
    )
  }

  const admin = supabaseAdmin()

  // Check if team exists
  const { data: existing, error: checkError } = await admin
    .from('agent_teams')
    .select('id')
    .eq('id', teamId)
    .eq('account_id', profile.account_id)
    .single()

  if (checkError || !existing) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  // Delete team (cascades to members, skills, knowledge bases)
  const { error } = await admin
    .from('agent_teams')
    .delete()
    .eq('id', teamId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}