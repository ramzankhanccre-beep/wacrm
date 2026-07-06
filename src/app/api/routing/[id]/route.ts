import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/agents/admin-client'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id: ruleId } = await params
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

  const { data: rule, error } = await admin
    .from('agent_routing_rules')
    .select(`
      *,
      target_team:agent_teams(id, name),
      target_agent:agents(id, name),
      fallback_agent:agents(id, name)
    `)
    .eq('id', ruleId)
    .eq('account_id', profile.account_id)
    .single()

  if (error || !rule) {
    return NextResponse.json({ error: 'Routing rule not found' }, { status: 404 })
  }

  return NextResponse.json({ rule })
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id: ruleId } = await params
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

  const updateData: Record<string, unknown> = {}

  if (typeof name === 'string') {
    updateData.name = name.trim()
  }
  if (typeof description === 'string') {
    updateData.description = description.trim()
  }
  if (typeof priority === 'number') {
    updateData.priority = priority
  }
  if (typeof conditions === 'object') {
    updateData.conditions = conditions
  }
  if (target_team_id !== undefined) {
    updateData.target_team_id = target_team_id ? target_team_id : null
  }
  if (target_agent_id !== undefined) {
    updateData.target_agent_id = target_agent_id ? target_agent_id : null
  }
  if (fallback_agent_id !== undefined) {
    updateData.fallback_agent_id = fallback_agent_id ? fallback_agent_id : null
  }
  if (typeof is_active === 'boolean') {
    updateData.is_active = is_active
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const admin = supabaseAdmin()
  const { data: rule, error } = await admin
    .from('agent_routing_rules')
    .update(updateData)
    .eq('id', ruleId)
    .eq('account_id', profile.account_id)
    .select()
    .single()

  if (error || !rule) {
    return NextResponse.json({ error: error?.message ?? 'Failed to update routing rule' }, { status: 500 })
  }

  return NextResponse.json({ rule })
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id: ruleId } = await params
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

  const { error } = await admin
    .from('agent_routing_rules')
    .delete()
    .eq('id', ruleId)
    .eq('account_id', profile.account_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}