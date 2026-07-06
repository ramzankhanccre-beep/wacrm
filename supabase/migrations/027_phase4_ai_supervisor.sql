-- Phase 4 AI Supervisor Layer
-- Modules: AI Supervisor, Hallucination Detection, Compliance Monitoring, Quality Monitoring, Cost Optimisation, Escalation Control

-- ============================================
-- 4.1 Agent Quality Monitoring
-- ============================================
CREATE TABLE IF NOT EXISTS agent_quality_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  quality_score NUMERIC(5,4) CHECK (quality_score >= 0 AND quality_score <= 1),
  criteria_scores JSONB DEFAULT '{}'::jsonb,
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewed', 'flagged')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  coaching_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_quality_logs_agent ON agent_quality_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_quality_logs_account ON agent_quality_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_agent_quality_logs_conversation ON agent_quality_logs(conversation_id);

ALTER TABLE agent_quality_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_quality_logs_select ON agent_quality_logs;
DROP POLICY IF EXISTS agent_quality_logs_insert ON agent_quality_logs;
DROP POLICY IF EXISTS agent_quality_logs_update ON agent_quality_logs;
CREATE POLICY agent_quality_logs_select ON agent_quality_logs FOR SELECT USING (is_account_member(account_id));
CREATE POLICY agent_quality_logs_insert ON agent_quality_logs FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY agent_quality_logs_update ON agent_quality_logs FOR UPDATE USING (is_account_member(account_id, 'agent'));

-- ============================================
-- 4.2 Hallucination Detection
-- ============================================
CREATE TABLE IF NOT EXISTS hallucination_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  hallucination_score NUMERIC(5,4) CHECK (hallucination_score >= 0 AND hallucination_score <= 1),
  grounding_sources JSONB DEFAULT '[]'::jsonb,
  is_blocked BOOLEAN DEFAULT false,
  blocked_at TIMESTAMPTZ,
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hallucination_scores_agent ON hallucination_scores(agent_id);
CREATE INDEX IF NOT EXISTS idx_hallucination_scores_account ON hallucination_scores(account_id);
CREATE INDEX IF NOT EXISTS idx_hallucination_scores_blocked ON hallucination_scores(is_blocked) WHERE is_blocked = true;

ALTER TABLE hallucination_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hallucination_scores_select ON hallucination_scores;
DROP POLICY IF EXISTS hallucination_scores_insert ON hallucination_scores;
CREATE POLICY hallucination_scores_select ON hallucination_scores FOR SELECT USING (is_account_member(account_id));
CREATE POLICY hallucination_scores_insert ON hallucination_scores FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));

-- ============================================
-- 4.3 Compliance Rules
-- ============================================
CREATE TABLE IF NOT EXISTS compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN (
    'content_block', 'keyword_required', 'keyword_forbidden',
    'format_required', 'approval_required', 'escalation_trigger'
  )),
  rule_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  is_active BOOLEAN DEFAULT true,
  applies_to_all_agents BOOLEAN DEFAULT true,
  agent_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES compliance_rules(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  violation_details JSONB DEFAULT '{}'::jsonb,
  severity TEXT DEFAULT 'warning',
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_rules_account ON compliance_rules(account_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_account ON compliance_violations(account_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_agent ON compliance_violations(agent_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_resolved ON compliance_violations(account_id, is_resolved);

ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_violations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS compliance_rules_select ON compliance_rules;
DROP POLICY IF EXISTS compliance_rules_insert ON compliance_rules;
DROP POLICY IF EXISTS compliance_rules_update ON compliance_rules;
DROP POLICY IF EXISTS compliance_rules_delete ON compliance_rules;
CREATE POLICY compliance_rules_select ON compliance_rules FOR SELECT USING (is_account_member(account_id));
CREATE POLICY compliance_rules_insert ON compliance_rules FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY compliance_rules_update ON compliance_rules FOR UPDATE USING (is_account_member(account_id, 'agent'));
CREATE POLICY compliance_rules_delete ON compliance_rules FOR DELETE USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS compliance_violations_select ON compliance_violations;
DROP POLICY IF EXISTS compliance_violations_insert ON compliance_violations;
DROP POLICY IF EXISTS compliance_violations_update ON compliance_violations;
CREATE POLICY compliance_violations_select ON compliance_violations FOR SELECT USING (is_account_member(account_id));
CREATE POLICY compliance_violations_insert ON compliance_violations FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY compliance_violations_update ON compliance_violations FOR UPDATE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_compliance_rules
  BEFORE UPDATE ON compliance_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4.4 Cost Tracking (Per-Agent)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_cost_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  model_provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  input_cost_usd NUMERIC(10,6) DEFAULT 0,
  output_cost_usd NUMERIC(10,6) DEFAULT 0,
  total_cost_usd NUMERIC(10,6) GENERATED ALWAYS AS (input_cost_usd + output_cost_usd) STORED,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_cost_logs_agent ON agent_cost_logs(agent_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_cost_logs_account ON agent_cost_logs(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_cost_logs_conversation ON agent_cost_logs(conversation_id);

ALTER TABLE agent_cost_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_cost_logs_select ON agent_cost_logs;
DROP POLICY IF EXISTS agent_cost_logs_insert ON agent_cost_logs;
CREATE POLICY agent_cost_logs_select ON agent_cost_logs FOR SELECT USING (is_account_member(account_id));
CREATE POLICY agent_cost_logs_insert ON agent_cost_logs FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));

-- ============================================
-- 4.5 Escalation Policies (Centralized)
-- ============================================
CREATE TABLE IF NOT EXISTS escalation_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0,
  trigger_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  escalation_target_type TEXT NOT NULL CHECK (escalation_target_type IN ('user', 'agent', 'team', 'webhook')),
  escalation_target_id TEXT,
  notification_channels JSONB DEFAULT '[]'::jsonb,
  auto_escalate BOOLEAN DEFAULT true,
  escalation_delay_seconds INTEGER DEFAULT 300,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escalation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES escalation_policies(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  trigger_reason TEXT,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  target_team_id UUID REFERENCES agent_teams(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'acknowledged', 'resolved')),
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escalation_policies_account ON escalation_policies(account_id);
CREATE INDEX IF NOT EXISTS idx_escalation_events_account ON escalation_events(account_id);
CREATE INDEX IF NOT EXISTS idx_escalation_events_conversation ON escalation_events(conversation_id);
CREATE INDEX IF NOT EXISTS idx_escalation_events_status ON escalation_events(status);

ALTER TABLE escalation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS escalation_policies_select ON escalation_policies;
DROP POLICY IF EXISTS escalation_policies_insert ON escalation_policies;
DROP POLICY IF EXISTS escalation_policies_update ON escalation_policies;
DROP POLICY IF EXISTS escalation_policies_delete ON escalation_policies;
CREATE POLICY escalation_policies_select ON escalation_policies FOR SELECT USING (is_account_member(account_id));
CREATE POLICY escalation_policies_insert ON escalation_policies FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY escalation_policies_update ON escalation_policies FOR UPDATE USING (is_account_member(account_id, 'agent'));
CREATE POLICY escalation_policies_delete ON escalation_policies FOR DELETE USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS escalation_events_select ON escalation_events;
DROP POLICY IF EXISTS escalation_events_insert ON escalation_events;
DROP POLICY IF EXISTS escalation_events_update ON escalation_events;
CREATE POLICY escalation_events_select ON escalation_events FOR SELECT USING (is_account_member(account_id));
CREATE POLICY escalation_events_insert ON escalation_events FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY escalation_events_update ON escalation_events FOR UPDATE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_escalation_policies
  BEFORE UPDATE ON escalation_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4.6 Agent Supervisor Config
-- ============================================
CREATE TABLE IF NOT EXISTS agent_supervisor_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  hallucination_threshold NUMERIC(5,4) DEFAULT 0.7 CHECK (hallucination_threshold >= 0 AND hallucination_threshold <= 1),
  quality_threshold NUMERIC(5,4) DEFAULT 0.5 CHECK (quality_threshold >= 0 AND quality_threshold <= 1),
  monthly_budget_usd NUMERIC(12,2),
  enable_hallucination_detection BOOLEAN DEFAULT true,
  enable_quality_monitoring BOOLEAN DEFAULT true,
  enable_cost_tracking BOOLEAN DEFAULT true,
  enable_compliance_checking BOOLEAN DEFAULT true,
  enable_auto_escalation BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_supervisor_config_account ON agent_supervisor_config(account_id);
CREATE INDEX IF NOT EXISTS idx_agent_supervisor_config_agent ON agent_supervisor_config(agent_id);

ALTER TABLE agent_supervisor_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_supervisor_config_select ON agent_supervisor_config;
DROP POLICY IF EXISTS agent_supervisor_config_insert ON agent_supervisor_config;
DROP POLICY IF EXISTS agent_supervisor_config_update ON agent_supervisor_config;
DROP POLICY IF EXISTS agent_supervisor_config_delete ON agent_supervisor_config;
CREATE POLICY agent_supervisor_config_select ON agent_supervisor_config FOR SELECT USING (is_account_member(account_id));
CREATE POLICY agent_supervisor_config_insert ON agent_supervisor_config FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY agent_supervisor_config_update ON agent_supervisor_config FOR UPDATE USING (is_account_member(account_id, 'agent'));
CREATE POLICY agent_supervisor_config_delete ON agent_supervisor_config FOR DELETE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_agent_supervisor_config
  BEFORE UPDATE ON agent_supervisor_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();