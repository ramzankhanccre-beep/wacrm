-- Phase 5 Workflow Automation Platform
-- Modules: Workflow Builder, AI-Generated Workflows, Human Approval Nodes, Multi-Agent Workflows, Scheduled Workflows

-- ============================================
-- 5.1 Human Approval Nodes
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_run_id UUID NOT NULL REFERENCES flow_runs(id) ON DELETE CASCADE,
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  node_key TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  response_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_approvals_flow_run ON workflow_approvals(flow_run_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_account ON workflow_approvals(account_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_status ON workflow_approvals(status);

ALTER TABLE workflow_approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workflow_approvals_select ON workflow_approvals;
DROP POLICY IF EXISTS workflow_approvals_insert ON workflow_approvals;
DROP POLICY IF EXISTS workflow_approvals_update ON workflow_approvals;
CREATE POLICY workflow_approvals_select ON workflow_approvals FOR SELECT USING (is_account_member(account_id));
CREATE POLICY workflow_approvals_insert ON workflow_approvals FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY workflow_approvals_update ON workflow_approvals FOR UPDATE USING (is_account_member(account_id));

-- ============================================
-- 5.2 Workflow Templates (Marketplace)
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN (
    'sales', 'support', 'onboarding', 'marketing', 'operations', 'custom'
  )),
  icon TEXT,
  node_count INTEGER DEFAULT 0,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  is_premium BOOLEAN DEFAULT false,
  price_usd NUMERIC(10,2),
  author_name TEXT,
  author_url TEXT,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed some default templates
INSERT INTO workflow_templates (slug, name, description, category, icon, node_count, trigger_type, nodes, edges) VALUES
('lead-qualification', 'Lead Qualification Flow', 'Qualify incoming leads with questions and tag based on responses', 'sales', 'UserPlus', 6, 'keyword',
  '[{"node_key":"start","node_type":"start","config":{}},{"node_key":"q1","node_type":"collect_input","config":{"question":"What service are you interested in?","save_to_var":"service"}},{"node_key":"q2","node_type":"collect_input","config":{"question":"What is your budget?","save_to_var":"budget"}},{"node_key":"condition_budget","node_type":"condition","config":{"subject":"var:budget","operator":"contains","value":"500"}},{"node_key":"tag_hot","node_type":"set_tag","config":{"tag_name":"Hot Lead"}},{"node_key":"tag_warm","node_type":"set_tag","config":{"tag_name":"Warm Lead"}},{"node_key":"handoff","node_type":"handoff","config":{}}]',
  '[{"id":"e1","source":"start","target":"q1"},{"id":"e2","source":"q1","target":"q2"},{"id":"e3","source":"q2","target":"condition_budget"},{"id":"e4","source":"condition_budget","target":"tag_hot","source_handle":"true"},{"id":"e5","source":"condition_budget","target":"tag_warm","source_handle":"false"},{"id":"e6","source":"tag_hot","target":"handoff"},{"id":"e7","source":"tag_warm","target":"handoff"}]'
),
('support-triage', 'Support Triage', 'Route support requests to the right team based on topic', 'support', 'Inbox', 5, 'keyword',
  '[{"node_key":"start","node_type":"start","config":{}},{"node_key":"question","node_type":"send_buttons","config":{"header":"How can we help?","buttons":[{"id":"billing","label":"Billing"},{"id":"technical","label":"Technical Support"},{"id":"other","label":"Other"}]}},{"node_key":"condition","node_type":"condition","config":{"subject":"reply_button_id","operator":"equals","value":"billing"}},{"node_key":"route_billing","node_type":"handoff","config":{"note":"Billing inquiry - priority"}},{"node_key":"route_tech","node_type":"handoff","config":{"note":"Technical support - standard"}}]',
  '[{"id":"e1","source":"start","target":"question"},{"id":"e2","source":"question","target":"condition"},{"id":"e3","source":"condition","target":"route_billing","source_handle":"true"},{"id":"e4","source":"condition","target":"route_tech","source_handle":"false"}]'
),
('welcome-onboarding', 'Welcome Onboarding', 'Welcome new contacts and collect key information', 'onboarding', 'MessageCircle', 4, 'first_inbound_message',
  '[{"node_key":"start","node_type":"start","config":{}},{"node_key":"welcome","node_type":"send_message","config":{"body":"Welcome! We''re glad to have you. To get started, can you share your name?"}},{"node_key":"collect_name","node_type":"collect_input","config":{"question":"What''s your name?","save_to_var":"name"}},{"node_key":"confirm","node_type":"send_message","config":{"body":"Thanks {{name}}! We''ll be in touch soon."}}]',
  '[{"id":"e1","source":"start","target":"welcome"},{"id":"e2","source":"welcome","target":"collect_name"},{"id":"e3","source":"collect_name","target":"confirm"}]'
),
('appointment-reminder', 'Appointment Reminder', 'Send appointment reminders and confirm attendance', 'marketing', 'Calendar', 3, 'scheduled',
  '[{"node_key":"start","node_type":"start","config":{}},{"node_key":"reminder","node_type":"send_message","config":{"body":"Reminder: Your appointment is tomorrow. Reply YES to confirm or NO to reschedule."}},{"node_key":"condition","node_type":"condition","config":{"subject":"body","operator":"contains","value":"YES"}},{"node_key":"confirm","node_type":"send_message","config":{"body":"Great! Your appointment is confirmed."}}]',
  '[{"id":"e1","source":"start","target":"reminder"},{"id":"e2","source":"reminder","target":"condition"}]'
);

CREATE INDEX IF NOT EXISTS idx_workflow_templates_slug ON workflow_templates(slug);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);

-- Public read access to templates (no RLS needed for marketplace)
-- ============================================
-- 5.3 Enhanced Triggers
-- ============================================
-- Add new trigger types to existing flows table
-- Already handled by JSONB in trigger_config, just documenting here:
-- - webhook: trigger via HTTP POST
-- - lead_created: trigger when new lead is created
-- - stage_changed: trigger when deal stage changes
-- - scheduled: cron-like scheduled execution

-- ============================================
-- 5.4 Multi-Agent Workflow Nodes
-- ============================================
-- Add agent_call node type support (already in flows.nodes JSONB)
-- Agents can be called sequentially or in parallel
-- ============================================
-- Note: Node type "agent" is already handled via "handoff" node
-- Parallel execution tracked in flow_runs.metadata

-- ============================================
-- 5.5 Scheduled Workflow Executions
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  cron_expression TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_schedules_flow ON workflow_schedules(flow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_account ON workflow_schedules(account_id);
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_next_run ON workflow_schedules(next_run_at) WHERE is_active = true;

ALTER TABLE workflow_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workflow_schedules_select ON workflow_schedules;
DROP POLICY IF EXISTS workflow_schedules_insert ON workflow_schedules;
DROP POLICY IF EXISTS workflow_schedules_update ON workflow_schedules;
DROP POLICY IF EXISTS workflow_schedules_delete ON workflow_schedules;
CREATE POLICY workflow_schedules_select ON workflow_schedules FOR SELECT USING (is_account_member(account_id));
CREATE POLICY workflow_schedules_insert ON workflow_schedules FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY workflow_schedules_update ON workflow_schedules FOR UPDATE USING (is_account_member(account_id, 'agent'));
CREATE POLICY workflow_schedules_delete ON workflow_schedules FOR DELETE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_workflow_schedules
  BEFORE UPDATE ON workflow_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5.6 AI Workflow Generation Log
-- ============================================
CREATE TABLE IF NOT EXISTS ai_workflow_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  generated_flow JSONB NOT NULL,
  used_tokens INTEGER,
  model_used TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_workflow_generations_account ON ai_workflow_generations(account_id);
CREATE INDEX IF NOT EXISTS idx_ai_workflow_generations_created ON ai_workflow_generations(created_at);

ALTER TABLE ai_workflow_generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_workflow_generations_select ON ai_workflow_generations;
DROP POLICY IF EXISTS ai_workflow_generations_insert ON ai_workflow_generations;
CREATE POLICY ai_workflow_generations_select ON ai_workflow_generations FOR SELECT USING (is_account_member(account_id));
CREATE POLICY ai_workflow_generations_insert ON ai_workflow_generations FOR INSERT WITH CHECK (is_account_member(account_id));