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

  // Get routing rules with target team/agent info
  const { data: rules, error } = await admin
    .from('agent_routing_rules')
    .select(`
      *,
      target_team:agent_teams(id, name),
      target_agent:agents(id, name),
      fallback_agent:agents(id, name)
    `)
    .eq('account_id', profile.account_id)
    .order('priority', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rules: rules ?? [] })
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

  const {
    name,
    description,
    priority,
    conditions,
    target_team_id,
    target_agent_id,
    fallback_agent_id,
    is_active,
  } = body as Record<string, unknown>

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Rule name is required' }, { status: 400 })
  }

  // Validate that at least one target is set
  if (!target_team_id && !target_agent_id) {
    return NextResponse.json({ error: 'Must specify target team or agent' }, { status: 400 })
  }

  const admin = supabaseAdmin()

  // Get next priority if not specified
  let nextPriority = 0
  if (priority === undefined) {
    const { data: lastRule } = await admin
      .from('agent_routing_rules')
      .select('priority')
      .eq('account_id', profile.account_id)
      .order('priority', { ascending: false })
      .limit(1)
      .single()
    nextPriority = (lastRule?.priority ?? -1) + 1
  }

  const { data: rule, error } = await admin
    .from('agent_routing_rules')
    .insert({
      account_id: profile.account_id,
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : null,
      priority: typeof priority === 'number' ? priority : nextPriority,
      conditions: typeof conditions === 'object' ? conditions : {},
      target_team_id: typeof target_team_id === 'string' ? target_team_id : null,
      target_agent_id: typeof target_agent_id === 'string' ? target_agent_id : null,
      fallback_agent_id: typeof fallback_agent_id === 'string' ? fallback_agent_id : null,
      is_active: typeof is_active === 'boolean' ? is_active : true,
    })
    .select()
    .single()

  if (error || !rule) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create routing rule' }, { status: 500 })
  }

  return NextResponse.json({ rule }, { status: 201 })
}