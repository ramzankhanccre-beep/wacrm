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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('business_memories')
    .select('*')
    .eq('id', id)
    .eq('account_id', profile.account_id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ memory: data })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  const { memory_category, title, content, metadata, is_active } = body as Record<string, unknown>

  const updateData: Record<string, unknown> = {}

  if (typeof memory_category === 'string' && ALLOWED_CATEGORIES.includes(memory_category as CategoryType)) {
    updateData.memory_category = memory_category
  }

  if (typeof title === 'string') {
    updateData.title = title.trim()
  }

  if (typeof content === 'string') {
    updateData.content = content.trim()
  }

  if (typeof metadata === 'object') {
    updateData.metadata = metadata
  }

  if (typeof is_active === 'boolean') {
    updateData.is_active = is_active
  }

  const { data, error } = await supabase
    .from('business_memories')
    .update(updateData)
    .eq('id', id)
    .eq('account_id', profile.account_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ memory: data })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  const { error } = await supabase
    .from('business_memories')
    .delete()
    .eq('id', id)
    .eq('account_id', profile.account_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}