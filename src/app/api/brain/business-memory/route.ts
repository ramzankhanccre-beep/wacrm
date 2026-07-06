import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_CATEGORIES = [
  'company_info',
  'products_services',
  'team_members',
  'policies',
  'business_rules',
  'goals',
  'other',
] as const

type CategoryType = (typeof ALLOWED_CATEGORIES)[number]

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  const activeOnly = url.searchParams.get('active') !== 'false'

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  let query = supabase
    .from('business_memories')
    .select('*')
    .eq('account_id', profile.account_id)

  if (category && ALLOWED_CATEGORIES.includes(category as CategoryType)) {
    query = query.eq('memory_category', category)
  }

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

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

  const { memory_category, title, content, metadata, is_active } = body as Record<string, unknown>

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  const safeCategory =
    typeof memory_category === 'string' && ALLOWED_CATEGORIES.includes(memory_category as CategoryType)
      ? memory_category
      : 'company_info'

  const { data, error } = await supabase.from('business_memories').insert({
    account_id: profile.account_id,
    user_id: user.id,
    memory_category: safeCategory,
    title: title.trim(),
    content: content.trim(),
    metadata: typeof metadata === 'object' ? metadata : {},
    is_active: typeof is_active === 'boolean' ? is_active : true,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ memory: data?.[0] ?? null }, { status: 201 })
}