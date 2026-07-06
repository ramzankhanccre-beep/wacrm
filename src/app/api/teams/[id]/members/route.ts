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

  // Verify team belongs to account
  const { data: team } = await admin
    .from('agent_teams')
    .select('id')
    .eq('id', teamId)
    .eq('account_id', profile.account_id)
    .single()

  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  // Get members with agent details
  const { data: members, error } = await admin
    .from('agent_team_members')
    .select(`
      *,
      agent:agents(*)
    `)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ members: members ?? [] })
}

export async function POST(request: Request, { params }: RouteParams) {
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

  const { agent_id, role } = body as Record<string, unknown>

  if (!agent_id || typeof agent_id !== 'string') {
    return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
  }

  const admin = supabaseAdmin()

  // Verify team belongs to account
  const { data: team } = await admin
    .from('agent_teams')
    .select('id')
    .eq('id', teamId)
    .eq('account_id', profile.account_id)
    .single()

  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  // Verify agent belongs to account
  const { data: agent } = await admin
    .from('agents')
    .select('id')
    .eq('id', agent_id)
    .eq('account_id', profile.account_id)
    .single()

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  // Add member
  const { data: member, error } = await admin
    .from('agent_team_members')
    .insert({
      team_id: teamId,
      agent_id: agent_id,
      role: role === 'lead' ? 'lead' : 'member',
    })
    .select(`
      *,
      agent:agents(*)
    `)
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Agent is already a member of this team' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ member }, { status: 201 })
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

  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get('member_id')

  if (!memberId) {
    return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
  }

  const admin = supabaseAdmin()

  // Verify team belongs to account
  const { data: team } = await admin
    .from('agent_teams')
    .select('id')
    .eq('id', teamId)
    .eq('account_id', profile.account_id)
    .single()

  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  // Delete member
  const { error } = await admin
    .from('agent_team_members')
    .delete()
    .eq('id', memberId)
    .eq('team_id', teamId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}