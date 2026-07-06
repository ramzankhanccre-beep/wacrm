import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_OPPORTUNITY_TYPES = [
  'new_lead',
  'upsell',
  'cross_sell',
  'renewal',
  'referral',
  'event_interest',
] as const

const ALLOWED_STATUSES = ['discovered', 'qualified', 'pursuing', 'converted', 'lost'] as const

// GET /api/brain/opportunities - Get discovered opportunities
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  let query = supabase
    .from('discovered_opportunities')
    .select('*')
    .eq('account_id', profile.account_id)
    .order('created_at', { ascending: false })

  if (status && ALLOWED_STATUSES.includes(status as typeof ALLOWED_STATUSES[number])) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ opportunities: data ?? [] })
}

// POST /api/brain/opportunities - Create a discovered opportunity
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { contact_id, conversation_id, opportunity_type, title, description, estimated_value, probability, metadata } = body as Record<string, unknown>

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const safeType = ALLOWED_OPPORTUNITY_TYPES.includes(opportunity_type as typeof ALLOWED_OPPORTUNITY_TYPES[number])
    ? opportunity_type
    : 'new_lead'

  const { data, error } = await supabase.from('discovered_opportunities').insert({
    account_id: profile.account_id,
    contact_id: typeof contact_id === 'string' ? contact_id : null,
    conversation_id: typeof conversation_id === 'string' ? conversation_id : null,
    opportunity_type: safeType,
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : null,
    estimated_value: typeof estimated_value === 'number' ? estimated_value : null,
    probability: typeof probability === 'number' ? probability : 0.5,
    metadata: typeof metadata === 'object' ? metadata : {},
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ opportunity: data?.[0] ?? null }, { status: 201 })
}

// PATCH /api/brain/opportunities - Update opportunity status
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { id, status } = body as Record<string, unknown>

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  const safeStatus = ALLOWED_STATUSES.includes(status as typeof ALLOWED_STATUSES[number])
    ? status
    : 'discovered'

  const { data, error } = await supabase
    .from('discovered_opportunities')
    .update({ status: safeStatus })
    .eq('id', id)
    .eq('account_id', profile.account_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ opportunity: data })
}