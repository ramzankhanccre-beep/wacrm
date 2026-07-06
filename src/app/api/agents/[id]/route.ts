import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/agents/admin-client'

const ALLOWED_STATUSES = ['draft', 'testing', 'live', 'archived'] as const
const ALLOWED_PERSONALITIES = ['Friendly', 'Professional', 'Assertive', 'Empathetic', 'Neutral'] as const
const ALLOWED_TONES = ['Formal', 'Casual', 'Conversational', 'Technical'] as const
const ALLOWED_COMM_STYLES = ['Concise', 'Detailed', 'Bullet-led', 'Narrative'] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
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
    goal,
    personality,
    tone,
    communication_style,
    languages,
    business_context,
    instructions,
    status,
  } = body as Record<string, unknown>

  const updateData: Record<string, unknown> = {}
  if (typeof name === 'string') updateData.name = name.trim()
  if (typeof description === 'string') updateData.description = description.trim()
  if (typeof goal === 'string') updateData.goal = goal.trim()
  if (typeof personality === 'string' && ALLOWED_PERSONALITIES.includes(personality as typeof ALLOWED_PERSONALITIES[number])) {
    updateData.personality = personality
  }
  if (typeof tone === 'string' && ALLOWED_TONES.includes(tone as typeof ALLOWED_TONES[number])) {
    updateData.tone = tone
  }
  if (typeof communication_style === 'string' && ALLOWED_COMM_STYLES.includes(communication_style as typeof ALLOWED_COMM_STYLES[number])) {
    updateData.communication_style = communication_style
  }
  if (typeof languages === 'string') {
    updateData.languages = languages.split(',').map((lang) => lang.trim()).filter(Boolean)
  } else if (Array.isArray(languages)) {
    updateData.languages = languages.filter((lang): lang is string => typeof lang === 'string')
  }
  if (typeof business_context === 'string') updateData.business_context = business_context.trim()
  if (typeof instructions === 'string') updateData.instructions = instructions.trim()
  if (typeof status === 'string' && ALLOWED_STATUSES.includes(status as typeof ALLOWED_STATUSES[number])) {
    updateData.status = status
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields provided to update' },
      { status: 400 },
    )
  }

  const admin = supabaseAdmin()
  const { data: agent, error } = await admin
    .from('agents')
    .update(updateData)
    .eq('id', id)
    .eq('account_id', profile.account_id)
    .select()
    .single()

  if (error || !agent) {
    return NextResponse.json({ error: error?.message ?? 'Failed to update agent' }, { status: 500 })
  }

  return NextResponse.json({ agent })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
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
  const { data: agent, error } = await admin
    .from('agents')
    .delete()
    .eq('id', id)
    .eq('account_id', profile.account_id)
    .select()
    .single()

  if (error || !agent) {
    return NextResponse.json({ error: error?.message ?? 'Failed to delete agent' }, { status: 500 })
  }

  return NextResponse.json({ agent })
}
