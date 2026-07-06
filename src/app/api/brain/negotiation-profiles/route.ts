import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_RISK_TOLERANCE = ['low', 'medium', 'high'] as const
const ALLOWED_PRICE_SENSITIVITY = ['low', 'medium', 'high'] as const

// GET /api/brain/negotiation-profiles - Get negotiation profiles
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const contactId = url.searchParams.get('contactId')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  let query = supabase
    .from('negotiation_profiles')
    .select('*')
    .eq('account_id', profile.account_id)

  if (contactId) {
    query = query.eq('contact_id', contactId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profiles: data ?? [] })
}

// POST /api/brain/negotiation-profiles - Create or update negotiation profile
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

  const { contact_id, risk_tolerance, price_sensitivity, decision_timeline, preferred_concession, objection_history, negotiation_strategy, metadata } = body as Record<string, unknown>

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  if (!contact_id || typeof contact_id !== 'string') {
    return NextResponse.json({ error: 'contact_id is required' }, { status: 400 })
  }

  const safeRiskTolerance = ALLOWED_RISK_TOLERANCE.includes(risk_tolerance as typeof ALLOWED_RISK_TOLERANCE[number])
    ? risk_tolerance
    : 'medium'

  const safePriceSensitivity = ALLOWED_PRICE_SENSITIVITY.includes(price_sensitivity as typeof ALLOWED_PRICE_SENSITIVITY[number])
    ? price_sensitivity
    : 'medium'

  const { data, error } = await supabase
    .from('negotiation_profiles')
    .upsert({
      contact_id,
      account_id: profile.account_id,
      risk_tolerance: safeRiskTolerance,
      price_sensitivity: safePriceSensitivity,
      decision_timeline: typeof decision_timeline === 'string' ? decision_timeline : null,
      preferred_concession: typeof preferred_concession === 'string' ? preferred_concession : null,
      objection_history: Array.isArray(objection_history) ? objection_history : [],
      negotiation_strategy: typeof negotiation_strategy === 'string' ? negotiation_strategy : null,
      metadata: typeof metadata === 'object' ? metadata : {},
    }, {
      onConflict: 'contact_id,account_id'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data }, { status: 201 })
}