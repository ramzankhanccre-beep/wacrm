import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_ENTITY_TYPES = [
  'contact',
  'company',
  'product',
  'deal',
  'conversation',
  'agent',
  'team',
  'policy',
] as const

type EntityType = (typeof ALLOWED_ENTITY_TYPES)[number]

// GET /api/brain/knowledge-graph - Get entities and relations
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const entityType = url.searchParams.get('entityType')
  const entityId = url.searchParams.get('entityId')
  const includeRelations = url.searchParams.get('relations') === 'true'

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  // Get entities
  let entitiesQuery = supabase
    .from('knowledge_graph_entities')
    .select('*')
    .eq('account_id', profile.account_id)

  if (entityType && ALLOWED_ENTITY_TYPES.includes(entityType as EntityType)) {
    entitiesQuery = entitiesQuery.eq('entity_type', entityType)
  }

  if (entityId) {
    entitiesQuery = entitiesQuery.eq('entity_id', entityId)
  }

  const { data: entities, error: entitiesError } = await entitiesQuery

  if (entitiesError) {
    return NextResponse.json({ error: entitiesError.message }, { status: 500 })
  }

  // Get relations if requested
  let relations = null
  if (includeRelations && entities && entities.length > 0) {
    const entityIds = entities.map((e) => e.id)
    const { data: rels, error: relsError } = await supabase
      .from('knowledge_graph_relations')
      .select('*')
      .in('from_entity_id', entityIds)
      .or(`to_entity_id.in.(${entityIds.join(',')})`)

    if (!relsError) {
      relations = rels
    }
  }

  return NextResponse.json({
    entities: entities ?? [],
    relations,
  })
}

// POST /api/brain/knowledge-graph - Create entity or relation
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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.account_id) {
    return NextResponse.json({ error: 'Unable to resolve account' }, { status: 403 })
  }

  // Determine if creating entity or relation
  const { entity_type, entity_id, name, description, from_entity_id, to_entity_id, relation_type } = body as Record<string, unknown>

  // Create entity
  if (entity_type && entity_id && name) {
    const safeEntityType =
      typeof entity_type === 'string' && ALLOWED_ENTITY_TYPES.includes(entity_type as EntityType)
        ? entity_type
        : 'contact'

    const { data, error } = await supabase
      .from('knowledge_graph_entities')
      .upsert({
        account_id: profile.account_id,
        entity_type: safeEntityType,
        entity_id: String(entity_id),
        name: String(name).trim(),
        description: typeof description === 'string' ? description.trim() : null,
      }, {
        onConflict: 'account_id,entity_type,entity_id'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ entity: data }, { status: 201 })
  }

  // Create relation
  if (from_entity_id && to_entity_id && relation_type) {
    const { data, error } = await supabase
      .from('knowledge_graph_relations')
      .upsert({
        account_id: profile.account_id,
        from_entity_id: String(from_entity_id),
        to_entity_id: String(to_entity_id),
        relation_type: String(relation_type),
      }, {
        onConflict: 'account_id,from_entity_id,to_entity_id,relation_type'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ relation: data }, { status: 201 })
  }

  return NextResponse.json({ error: 'Invalid request: provide entity_type+entity_id+name or from_entity_id+to_entity_id+relation_type' }, { status: 400 })
}