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
    return NextResponse.json(
      { error: 'Unable to resolve account information' },
      { status: 403 },
    )
  }

  const admin = supabaseAdmin()

  // Get teams with member counts
  const { data: teams, error } = await admin
    .from('agent_teams')
    .select('*')
    .eq('account_id', profile.account_id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get member counts for each team
  const teamsWithCounts = await Promise.all(
    (teams ?? []).map(async (team) => {
      const { count } = await admin
        .from('agent_team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id)

      return { ...team, member_count: count ?? 0 }
    })
  )

  return NextResponse.json({ teams: teamsWithCounts })
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
    return NextResponse.json(
      { error: 'Unable to resolve account information' },
      { status: 403 },
    )
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, description, color } = body as Record<string, unknown>

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
  }

  const admin = supabaseAdmin()
  const { data: team, error } = await admin
    .from('agent_teams')
    .insert({
      account_id: profile.account_id,
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : null,
      color: typeof color === 'string' && color.match(/^#[0-9A-Fa-f]{6}$/) ? color : '#6366f1',
    })
    .select()
    .single()

  if (error || !team) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create team' }, { status: 500 })
  }

  return NextResponse.json({ team }, { status: 201 })
}