import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_INSIGHT_TYPES = [
  'at_risk_deal',
  'upsell_opportunity',
  'stalled_lead',
  'conversion_opportunity',
  'revenue_forecast',
] as const

const ALLOWED_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const

// GET /api/brain/revenue-insights - Get revenue insights
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const insightType = url.searchParams.get('type')
  const unresolvedOnly = url.searchParams.get('unresolved') === 'true'

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  let query = supabase
    .from('revenue_insights')
    .select('*')
    .eq('account_id', profile.account_id)
    .order('created_at', { ascending: false })

  if (insightType && ALLOWED_INSIGHT_TYPES.includes(insightType as typeof ALLOWED_INSIGHT_TYPES[number])) {
    query = query.eq('insight_type', insightType)
  }

  if (unresolvedOnly) {
    query = query.eq('is_resolved', false)
  }

  const { data, error } = await query.limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ insights: data ?? [] })
}

// POST /api/brain/revenue-insights - Create a revenue insight
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

  const { insight_type, title, description, contact_id, deal_id, priority, metadata } = body as Record<string, unknown>

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  if (!insight_type || typeof insight_type !== 'string') {
    return NextResponse.json({ error: 'insight_type is required' }, { status: 400 })
  }

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const safeInsightType = ALLOWED_INSIGHT_TYPES.includes(insight_type as typeof ALLOWED_INSIGHT_TYPES[number])
    ? insight_type
    : 'conversion_opportunity'

  const safePriority = ALLOWED_PRIORITIES.includes(priority as typeof ALLOWED_PRIORITIES[number])
    ? priority
    : 'medium'

  const { data, error } = await supabase.from('revenue_insights').insert({
    account_id: profile.account_id,
    insight_type: safeInsightType,
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : null,
    contact_id: typeof contact_id === 'string' ? contact_id : null,
    deal_id: typeof deal_id === 'string' ? deal_id : null,
    priority: safePriority,
    metadata: typeof metadata === 'object' ? metadata : {},
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ insight: data?.[0] ?? null }, { status: 201 })
}

// PATCH /api/brain/revenue-insights - Resolve an insight
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

  const { id, is_resolved } = body as Record<string, unknown>

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

  const { data, error } = await supabase
    .from('revenue_insights')
    .update({
      is_resolved: typeof is_resolved === 'boolean' ? is_resolved : true,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('account_id', profile.account_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ insight: data })
}