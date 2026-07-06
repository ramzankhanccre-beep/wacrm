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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: memoryId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!memoryId) {
    return NextResponse.json({ error: 'Memory id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('contact_memories')
    .delete()
    .eq('id', memoryId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: memoryId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!memoryId) {
    return NextResponse.json({ error: 'Memory id is required' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { memory_type, title, memory_text } = body as Record<string, unknown>
  const updateData: Record<string, unknown> = {}

  if (
    typeof memory_type === 'string' &&
    ALLOWED_MEMORY_TYPES.includes(memory_type as MemoryType)
  ) {
    updateData.memory_type = memory_type
  }

  if (typeof title === 'string') {
    updateData.title = title.trim() || null
  }

  if (typeof memory_text === 'string' && memory_text.trim()) {
    updateData.memory_text = memory_text.trim()
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields were provided to update' },
      { status: 400 },
    )
  }

  const { data, error } = await supabase
    .from('contact_memories')
    .update(updateData)
    .eq('id', memoryId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ memory: data ?? null })
}
