import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/brain/intent-predictions - Get predictions for a contact
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
    .from('intent_predictions')
    .select('*')
    .eq('account_id', profile.account_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (contactId) {
    query = query.eq('contact_id', contactId)
  }

  const { data, error } = await query.limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ predictions: data ?? [] })
}

// POST /api/brain/intent-predictions - Create a prediction
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

  const { contact_id, conversation_id, predicted_intent, confidence_score, next_best_action, metadata } = body as Record<string, unknown>

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

  if (!predicted_intent || typeof predicted_intent !== 'string') {
    return NextResponse.json({ error: 'predicted_intent is required' }, { status: 400 })
  }

  const { data, error } = await supabase.from('intent_predictions').insert({
    contact_id,
    account_id: profile.account_id,
    conversation_id: typeof conversation_id === 'string' ? conversation_id : null,
    predicted_intent: predicted_intent.trim(),
    confidence_score: typeof confidence_score === 'number' ? confidence_score : 0,
    next_best_action: typeof next_best_action === 'string' ? next_best_action.trim() : null,
    metadata: typeof metadata === 'object' ? metadata : {},
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prediction: data?.[0] ?? null }, { status: 201 })
}