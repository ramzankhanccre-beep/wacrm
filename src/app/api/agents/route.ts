import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/agents/admin-client'

const ALLOWED_STATUSES = ['draft', 'testing', 'live', 'archived'] as const
const ALLOWED_PERSONALITIES = ['Friendly', 'Professional', 'Assertive', 'Empathetic', 'Neutral'] as const
const ALLOWED_TONES = ['Formal', 'Casual', 'Conversational', 'Technical'] as const
const ALLOWED_COMM_STYLES = ['Concise', 'Detailed', 'Bullet-led', 'Narrative'] as const

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
  const { data, error } = await admin
    .from('agents')
    .select('*')
    .eq('account_id', profile.account_id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ agents: data ?? [] })
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
    goal,
    personality,
    tone,
    communication_style,
    languages,
    business_context,
    instructions,
    status,
  } = body as Record<string, unknown>

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
  }

  const safeStatus = typeof status === 'string' && ALLOWED_STATUSES.includes(status as typeof ALLOWED_STATUSES[number])
    ? status
    : 'draft'
  const safePersonality = typeof personality === 'string' && ALLOWED_PERSONALITIES.includes(personality as typeof ALLOWED_PERSONALITIES[number])
    ? personality
    : 'Neutral'
  const safeTone = typeof tone === 'string' && ALLOWED_TONES.includes(tone as typeof ALLOWED_TONES[number])
    ? tone
    : 'Conversational'
  const safeCommunicationStyle = typeof communication_style === 'string' && ALLOWED_COMM_STYLES.includes(communication_style as typeof ALLOWED_COMM_STYLES[number])
    ? communication_style
    : 'Concise'
  const safeLanguages = Array.isArray(languages)
    ? languages.filter((lang): lang is string => typeof lang === 'string')
    : typeof languages === 'string'
      ? languages.split(',').map((lang) => lang.trim()).filter(Boolean)
      : ['en']

  const admin = supabaseAdmin()
  const { data: agent, error } = await admin
    .from('agents')
    .insert({
      user_id: user.id,
      account_id: profile.account_id,
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : null,
      goal: typeof goal === 'string' ? goal.trim() : null,
      personality: safePersonality,
      tone: safeTone,
      communication_style: safeCommunicationStyle,
      languages: safeLanguages.length > 0 ? safeLanguages : ['en'],
      business_context: typeof business_context === 'string' ? business_context.trim() : null,
      instructions: typeof instructions === 'string' ? instructions.trim() : null,
      status: safeStatus,
    })
    .select()
    .single()

  if (error || !agent) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create agent' }, { status: 500 })
  }

  return NextResponse.json({ agent }, { status: 201 })
}
