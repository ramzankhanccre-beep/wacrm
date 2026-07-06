-- Phase 2 Intelligence Layer - Complete implementation
-- Modules: AI Business Brain, Knowledge Graph, Intent Prediction, Revenue Intelligence, Autonomous Follow-Up

-- ============================================
-- 2.2 AI Business Brain (workspace-level context)
-- ============================================
CREATE TABLE IF NOT EXISTS business_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  memory_category TEXT NOT NULL DEFAULT 'company_info' CHECK (memory_category IN (
    'company_info', 'products_services', 'team_members', 'policies', 'business_rules', 'goals', 'other'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_memories_account_id ON business_memories(account_id);
CREATE INDEX IF NOT EXISTS idx_business_memories_category ON business_memories(account_id, memory_category);

ALTER TABLE business_memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_memories_select ON business_memories;
DROP POLICY IF EXISTS business_memories_insert ON business_memories;
DROP POLICY IF EXISTS business_memories_update ON business_memories;
DROP POLICY IF EXISTS business_memories_delete ON business_memories;

CREATE POLICY business_memories_select ON business_memories FOR SELECT USING (is_account_member(account_id));
CREATE POLICY business_memories_insert ON business_memories FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY business_memories_update ON business_memories FOR UPDATE USING (is_account_member(account_id, 'agent'));
CREATE POLICY business_memories_delete ON business_memories FOR DELETE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_business_memories
  BEFORE UPDATE ON business_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2.3 Universal Knowledge Graph (entity relationships)
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_graph_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'contact', 'company', 'product', 'deal', 'conversation', 'agent', 'team', 'policy'
  )),
  entity_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  properties JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS knowledge_graph_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  from_entity_id UUID NOT NULL REFERENCES knowledge_graph_entities(id) ON DELETE CASCADE,
  to_entity_id UUID NOT NULL REFERENCES knowledge_graph_entities(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, from_entity_id, to_entity_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_kg_entities_account ON knowledge_graph_entities(account_id);
CREATE INDEX IF NOT EXISTS idx_kg_entities_type ON knowledge_graph_entities(account_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_kg_relations_from ON knowledge_graph_relations(from_entity_id);
CREATE INDEX IF NOT EXISTS idx_kg_relations_to ON knowledge_graph_relations(to_entity_id);

ALTER TABLE knowledge_graph_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_graph_relations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kg_entities_select ON knowledge_graph_entities;
DROP POLICY IF EXISTS kg_entities_insert ON knowledge_graph_entities;
CREATE POLICY kg_entities_select ON knowledge_graph_entities FOR SELECT USING (is_account_member(account_id));
CREATE POLICY kg_entities_insert ON knowledge_graph_entities FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS kg_relations_select ON knowledge_graph_relations;
DROP POLICY IF EXISTS kg_relations_insert ON knowledge_graph_relations;
CREATE POLICY kg_relations_select ON knowledge_graph_relations FOR SELECT USING (is_account_member(account_id));
CREATE POLICY kg_relations_insert ON knowledge_graph_relations FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_kg_entities
  BEFORE UPDATE ON knowledge_graph_entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2.4 Intent Prediction Engine
-- ============================================
CREATE TABLE IF NOT EXISTS intent_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  predicted_intent TEXT NOT NULL,
  confidence_score NUMERIC(5,4) DEFAULT 0,
  next_best_action TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intent_predictions_contact ON intent_predictions(contact_id);
CREATE INDEX IF NOT EXISTS idx_intent_predictions_account ON intent_predictions(account_id);

ALTER TABLE intent_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS intent_predictions_select ON intent_predictions;
DROP POLICY IF EXISTS intent_predictions_insert ON intent_predictions;
CREATE POLICY intent_predictions_select ON intent_predictions FOR SELECT USING (is_account_member(account_id));
CREATE POLICY intent_predictions_insert ON intent_predictions FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));

-- ============================================
-- 2.5 Revenue Intelligence Engine
-- ============================================
CREATE TABLE IF NOT EXISTS revenue_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'at_risk_deal', 'upsell_opportunity', 'stalled_lead', 'conversion_opportunity', 'revenue_forecast'
  )),
  title TEXT NOT NULL,
  description TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_insights_account ON revenue_insights(account_id);
CREATE INDEX IF NOT EXISTS idx_revenue_insights_type ON revenue_insights(account_id, insight_type);
CREATE INDEX IF NOT EXISTS idx_revenue_insights_resolved ON revenue_insights(account_id, is_resolved);

ALTER TABLE revenue_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS revenue_insights_select ON revenue_insights;
DROP POLICY IF EXISTS revenue_insights_insert ON revenue_insights;
DROP POLICY IF EXISTS revenue_insights_update ON revenue_insights;
CREATE POLICY revenue_insights_select ON revenue_insights FOR SELECT USING (is_account_member(account_id));
CREATE POLICY revenue_insights_insert ON revenue_insights FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY revenue_insights_update ON revenue_insights FOR UPDATE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_revenue_insights
  BEFORE UPDATE ON revenue_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2.6 Opportunity Discovery Engine
-- ============================================
CREATE TABLE IF NOT EXISTS discovered_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN (
    'new_lead', 'upsell', 'cross_sell', 'renewal', 'referral', 'event_interest'
  )),
  title TEXT NOT NULL,
  description TEXT,
  estimated_value NUMERIC(12,2),
  probability NUMERIC(5,4) DEFAULT 0.5,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'discovered' CHECK (status IN ('discovered', 'qualified', 'pursuing', 'converted', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discovered_opportunities_account ON discovered_opportunities(account_id);
CREATE INDEX IF NOT EXISTS idx_discovered_opportunities_status ON discovered_opportunities(account_id, status);

ALTER TABLE discovered_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS discovered_opportunities_select ON discovered_opportunities;
DROP POLICY IF EXISTS discovered_opportunities_insert ON discovered_opportunities;
DROP POLICY IF EXISTS discovered_opportunities_update ON discovered_opportunities;
CREATE POLICY discovered_opportunities_select ON discovered_opportunities FOR SELECT USING (is_account_member(account_id));
CREATE POLICY discovered_opportunities_insert ON discovered_opportunities FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY discovered_opportunities_update ON discovered_opportunities FOR UPDATE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_discovered_opportunities
  BEFORE UPDATE ON discovered_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2.7 Negotiation Engine
-- ============================================
CREATE TABLE IF NOT EXISTS negotiation_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  risk_tolerance TEXT DEFAULT 'medium' CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  price_sensitivity TEXT DEFAULT 'medium' CHECK (price_sensitivity IN ('low', 'medium', 'high')),
  decision_timeline TEXT,
  preferred_concession TEXT,
  objection_history JSONB DEFAULT '[]'::jsonb,
  negotiation_strategy TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contact_id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_negotiation_profiles_contact ON negotiation_profiles(contact_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_profiles_account ON negotiation_profiles(account_id);

ALTER TABLE negotiation_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS negotiation_profiles_select ON negotiation_profiles;
DROP POLICY IF EXISTS negotiation_profiles_insert ON negotiation_profiles;
DROP POLICY IF EXISTS negotiation_profiles_update ON negotiation_profiles;
CREATE POLICY negotiation_profiles_select ON negotiation_profiles FOR SELECT USING (is_account_member(account_id));
CREATE POLICY negotiation_profiles_insert ON negotiation_profiles FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY negotiation_profiles_update ON negotiation_profiles FOR UPDATE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_negotiation_profiles
  BEFORE UPDATE ON negotiation_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2.8 Autonomous Follow-Up Engine
-- ============================================
CREATE TABLE IF NOT EXISTS follow_up_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT CHECK (trigger_event IN (
    'conversation_ended', 'no_response', 'stage_changed', 'tag_added', 'manual', 'scheduled'
  )),
  conditions JSONB DEFAULT '{}'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES follow_up_sequences(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled', 'approved')),
  message_content TEXT,
  approval_requested BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_up_sequences_account ON follow_up_sequences(account_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_contact ON follow_up_tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_scheduled ON follow_up_tasks(scheduled_at) WHERE status = 'pending';

ALTER TABLE follow_up_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS follow_up_sequences_select ON follow_up_sequences;
DROP POLICY IF EXISTS follow_up_sequences_insert ON follow_up_sequences;
DROP POLICY IF EXISTS follow_up_sequences_update ON follow_up_sequences;
DROP POLICY IF EXISTS follow_up_sequences_delete ON follow_up_sequences;
CREATE POLICY follow_up_sequences_select ON follow_up_sequences FOR SELECT USING (is_account_member(account_id));
CREATE POLICY follow_up_sequences_insert ON follow_up_sequences FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY follow_up_sequences_update ON follow_up_sequences FOR UPDATE USING (is_account_member(account_id, 'agent'));
CREATE POLICY follow_up_sequences_delete ON follow_up_sequences FOR DELETE USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS follow_up_tasks_select ON follow_up_tasks;
DROP POLICY IF EXISTS follow_up_tasks_insert ON follow_up_tasks;
DROP POLICY IF EXISTS follow_up_tasks_update ON follow_up_tasks;
CREATE POLICY follow_up_tasks_select ON follow_up_tasks FOR SELECT USING (is_account_member(account_id));
CREATE POLICY follow_up_tasks_insert ON follow_up_tasks FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY follow_up_tasks_update ON follow_up_tasks FOR UPDATE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_follow_up_sequences
  BEFORE UPDATE ON follow_up_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
