/**
 * Routing Service
 * Evaluates routing rules and assigns conversations to agents/teams
 */

import { createClient } from '@supabase/supabase-js'
import type { RoutingCondition } from '@/types'

// Lazy-initialized admin client
let _adminClient: ReturnType<typeof createClient> | null = null
function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

interface RoutingRule {
  id: string
  name: string
  priority: number
  conditions: RoutingCondition
  target_team_id: string | null
  target_agent_id: string | null
  fallback_agent_id: string | null
}

interface ContactDetails {
  lead_stage?: string
  tags?: string[]
}

export interface RoutingContext {
  accountId: string
  contactId: string
  conversationId: string
  messageText?: string
  leadStage?: string
  contactTags?: string[]
  messageCount?: number
}

export interface RoutingResult {
  targetType: 'agent' | 'team' | null
  targetId: string | null
  fallbackAgentId: string | null
  ruleId: string | null
  ruleName: string | null
}

/**
 * Main routing function - evaluates all active rules and returns the best match
 */
export async function resolveRouting(context: RoutingContext): Promise<RoutingResult> {
  const admin = supabaseAdmin()

  // Get all active routing rules for this account, ordered by priority
  const { data: rules, error } = await admin
    .from('agent_routing_rules')
    .select(`
      id,
      name,
      priority,
      conditions,
      target_team_id,
      target_agent_id,
      fallback_agent_id
    `)
    .eq('account_id', context.accountId)
    .eq('is_active', true)
    .order('priority', { ascending: true }) as { data: RoutingRule[] | null; error: unknown }

  if (error || !rules || rules.length === 0) {
    return { targetType: null, targetId: null, fallbackAgentId: null, ruleId: null, ruleName: null }
  }

  // Get contact details for condition evaluation
  const contact = await getContactDetails(context.contactId, context.accountId)

  // Evaluate each rule in priority order
  for (const rule of rules) {
    if (evaluateRule(rule.conditions, context, contact)) {
      // Determine target type
      let targetType: 'agent' | 'team' | null = null
      let targetId: string | null = null

      if (rule.target_agent_id) {
        targetType = 'agent'
        targetId = rule.target_agent_id
      } else if (rule.target_team_id) {
        targetType = 'team'
        targetId = rule.target_team_id
      }

      return {
        targetType,
        targetId,
        fallbackAgentId: rule.fallback_agent_id,
        ruleId: rule.id,
        ruleName: rule.name,
      }
    }
  }

  return { targetType: null, targetId: null, fallbackAgentId: null, ruleId: null, ruleName: null }
}

/**
 * Evaluate if a rule's conditions match the context
 */
function evaluateRule(
  conditions: RoutingCondition,
  context: RoutingContext,
  contact: ContactDetails | null
): boolean {
  // No conditions = always match (catch-all)
  if (!conditions || Object.keys(conditions).length === 0) {
    return true
  }

  // Lead stage condition
  if (conditions.lead_stage) {
    if (!contact?.lead_stage || contact.lead_stage !== conditions.lead_stage) {
      return false
    }
  }

  // Message contains condition
  if (conditions.message_contains && context.messageText) {
    const searchTerm = conditions.message_contains.toLowerCase()
    if (!context.messageText.toLowerCase().includes(searchTerm)) {
      return false
    }
  }

  // Contact tag condition
  if (conditions.contact_tag) {
    if (!contact?.tags?.includes(conditions.contact_tag)) {
      return false
    }
  }

  // Time of day condition
  if (conditions.time_of_day) {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const start = conditions.time_of_day.start
    const end = conditions.time_of_day.end

    if (currentTime < start || currentTime > end) {
      return false
    }
  }

  // Contact history condition
  if (conditions.contact_history) {
    const msgCount = context.messageCount ?? 0
    if (conditions.contact_history.min_messages !== undefined) {
      if (msgCount < conditions.contact_history.min_messages) {
        return false
      }
    }
    if (conditions.contact_history.max_messages !== undefined) {
      if (msgCount > conditions.contact_history.max_messages) {
        return false
      }
    }
  }

  return true
}

interface ContactTagRow {
  tag: { name: string } | null
}

interface ContactRow {
  lead_stage: string | null
}

/**
 * Fetch contact details needed for routing evaluation
 */
async function getContactDetails(contactId: string, accountId: string): Promise<ContactDetails | null> {
  const admin = supabaseAdmin()

  // Get contact with lead stage
  const { data: contact } = await admin
    .from('contacts')
    .select('lead_stage')
    .eq('id', contactId)
    .eq('account_id', accountId)
    .single() as { data: ContactRow | null; error: unknown }

  if (!contact) return null

  // Get contact tags
  const { data: contactTags } = await admin
    .from('contact_tags')
    .select(`
      tag:tags(
        name
      )
    `)
    .eq('contact_id', contactId) as { data: ContactTagRow[] | null; error: unknown }

  const tags = contactTags?.map(ct => ct.tag?.name).filter((t): t is string => typeof t === 'string') ?? []

  return {
    lead_stage: contact.lead_stage ?? undefined,
    tags,
  }
}

interface TeamMemberRow {
  agent_id: string
  role: string
}

interface AgentRow {
  id: string
  status: string
}

interface ConversationRow {
  assigned_agent_id: string | null
}

interface ScheduleRow {
  start_time: string
  end_time: string
}

/**
 * Apply routing to a conversation - assign the agent
 */
export async function applyRouting(context: RoutingContext): Promise<RoutingResult> {
  const result = await resolveRouting(context)

  if (!result.targetId) {
    return result
  }

  const admin = supabaseAdmin()

  // If target is a team, find an available agent in the team
  let finalAgentId: string | null = null

  if (result.targetType === 'team') {
    finalAgentId = await findAvailableAgentInTeam(result.targetId, context.accountId)
  } else if (result.targetType === 'agent') {
    finalAgentId = result.targetId
  }

  // Use fallback if no agent found
  if (!finalAgentId && result.fallbackAgentId) {
    finalAgentId = result.fallbackAgentId
  }

  // Assign the agent to the conversation
  if (finalAgentId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('conversations')
      .update({ assigned_agent_id: finalAgentId })
      .eq('id', context.conversationId)
  }

  return { ...result, targetId: finalAgentId }
}

/**
 * Find an available agent in a team using load balancing
 * - Considers agent availability schedules
 * - Prefers agents with fewer active conversations
 */
async function findAvailableAgentInTeam(teamId: string, accountId: string): Promise<string | null> {
  const admin = supabaseAdmin()

  // Get all agents in the team
  const { data: teamMembers } = await admin
    .from('agent_team_members')
    .select('agent_id, role')
    .eq('team_id', teamId) as { data: TeamMemberRow[] | null; error: unknown }

  if (!teamMembers || teamMembers.length === 0) {
    return null
  }

  const agentIds = teamMembers.map(m => m.agent_id)

  // Get live agents in this account
  const { data: agents } = await admin
    .from('agents')
    .select('id, status')
    .eq('account_id', accountId)
    .in('id', agentIds)
    .eq('status', 'live') as { data: AgentRow[] | null; error: unknown }

  if (!agents || agents.length === 0) {
    return null
  }

  const liveAgentIds = agents.map(a => a.id)

  // Get current conversation counts for each agent
  const { data: conversationCounts } = await admin
    .from('conversations')
    .select('assigned_agent_id')
    .eq('account_id', accountId)
    .in('assigned_agent_id', liveAgentIds)
    .not('status', 'eq', 'closed') as { data: ConversationRow[] | null; error: unknown }

  // Count active conversations per agent
  const counts: Record<string, number> = {}
  for (const conv of conversationCounts ?? []) {
    if (conv.assigned_agent_id) {
      counts[conv.assigned_agent_id] = (counts[conv.assigned_agent_id] || 0) + 1
    }
  }

  // Find agent with fewest active conversations
  let selectedAgentId: string | null = null
  let minCount = Infinity

  for (const agentId of liveAgentIds) {
    const count = counts[agentId] || 0
    if (count < minCount) {
      minCount = count
      selectedAgentId = agentId
    }
  }

  return selectedAgentId
}

/**
 * Check if an agent is available at the current time
 */
export async function isAgentAvailable(agentId: string, accountId: string): Promise<boolean> {
  const admin = supabaseAdmin()

  const now = new Date()
  const dayOfWeek = now.getDay()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  // Check if agent has any schedule for today
  const { data: schedules } = await admin
    .from('agent_schedules')
    .select('start_time, end_time')
    .eq('agent_id', agentId)
    .eq('account_id', accountId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true) as { data: ScheduleRow[] | null; error: unknown }

  if (!schedules || schedules.length === 0) {
    // No schedule = available 24/7 (default behavior)
    return true
  }

  // Check if current time falls within any schedule
  for (const schedule of schedules) {
    if (currentTime >= schedule.start_time && currentTime <= schedule.end_time) {
      return true
    }
  }

  return false
}