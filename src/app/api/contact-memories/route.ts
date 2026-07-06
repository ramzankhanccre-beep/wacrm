import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_MEMORY_TYPES = [
  'summary',
  'preference',
  'objection',
  'purchase_history',
  'task',
  'other',
] as const

type MemoryType = (typeof ALLOWED_MEMORY_TYPES)[number]

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

  if (!contactId) {
    return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('contact_memories')
    .select('*')
    .eq('contact_id', contactId)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ memories: data ?? [] })
}

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

  const { contact_id, memory_type, title, memory_text } = body as Record<string, unknown>

  if (!contact_id || typeof contact_id !== 'string') {
    return NextResponse.json({ error: 'contact_id is required' }, { status: 400 })
  }

  if (!memory_text || typeof memory_text !== 'string' || !memory_text.trim()) {
    return NextResponse.json({ error: 'memory_text is required' }, { status: 400 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  const safeMemoryType =
    typeof memory_type === 'string' && ALLOWED_MEMORY_TYPES.includes(memory_type as MemoryType)
      ? memory_type
      : 'summary'

  const { data, error } = await supabase.from('contact_memories').insert({
    contact_id,
    account_id: profile.account_id,
    user_id: user.id,
    memory_type: safeMemoryType,
    title: typeof title === 'string' && title.trim() ? title.trim() : null,
    memory_text: memory_text.trim(),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ memory: data?.[0] ?? null }, { status: 201 })
}
