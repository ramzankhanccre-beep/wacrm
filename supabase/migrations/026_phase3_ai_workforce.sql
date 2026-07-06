-- Phase 3 AI Workforce Platform
-- Modules: Agent Teams, Routing, Shared Memory/Skills/Knowledge, Agent Operating System

-- ============================================
-- 3.1 Agent Teams
-- ============================================
CREATE TABLE IF NOT EXISTS agent_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES agent_teams(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('lead', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_teams_account ON agent_teams(account_id);
CREATE INDEX IF NOT EXISTS idx_agent_team_members_team ON agent_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_agent_team_members_agent ON agent_team_members(agent_id);

ALTER TABLE agent_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agent_teams_select ON agent_teams;
DROP POLICY IF EXISTS agent_teams_insert ON agent_teams;
DROP POLICY IF EXISTS agent_teams_update ON agent_teams;
DROP POLICY IF EXISTS agent_teams_delete ON agent_teams;
CREATE POLICY agent_teams_select ON agent_teams FOR SELECT USING (is_account_member(account_id));
CREATE POLICY agent_teams_insert ON agent_teams FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY agent_teams_update ON agent_teams FOR UPDATE USING (is_account_member(account_id, 'agent'));
CREATE POLICY agent_teams_delete ON agent_teams FOR DELETE USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS agent_team_members_select ON agent_team_members;
DROP POLICY IF EXISTS agent_team_members_insert ON agent_team_members;
DROP POLICY IF EXISTS agent_team_members_delete ON agent_team_members;
CREATE POLICY agent_team_members_select ON agent_team_members FOR SELECT USING (
  is_account_member((SELECT account_id FROM agent_teams WHERE id = team_id))
);
CREATE POLICY agent_team_members_insert ON agent_team_members FOR INSERT WITH CHECK (
  is_account_member((SELECT account_id FROM agent_teams WHERE id = team_id), 'agent')
);
CREATE POLICY agent_team_members_delete ON agent_team_members FOR DELETE USING (
  is_account_member((SELECT account_id FROM agent_teams WHERE id = team_id), 'agent')
);

CREATE TRIGGER set_updated_at_agent_teams
  BEFORE UPDATE ON agent_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3.2 Agent Routing Rules
-- ============================================
CREATE TABLE IF NOT EXISTS agent_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  target_team_id UUID REFERENCES agent_teams(id) ON DELETE SET NULL,
  target_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  fallback_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_routing_rules_account ON agent_routing_rules(account_id);
CREATE INDEX IF NOT EXISTS idx_agent_routing_rules_priority ON agent_routing_rules(account_id, priority);

ALTER TABLE agent_routing_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_routing_rules_select ON agent_routing_rules;
DROP POLICY IF EXISTS agent_routing_rules_insert ON agent_routing_rules;
DROP POLICY IF EXISTS agent_routing_rules_update ON agent_routing_rules;
DROP POLICY IF EXISTS agent_routing_rules_delete ON agent_routing_rules;
CREATE POLICY agent_routing_rules_select ON agent_routing_rules FOR SELECT USING (is_account_member(account_id));
CREATE POLICY agent_routing_rules_insert ON agent_routing_rules FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY agent_routing_rules_update ON agent_routing_rules FOR UPDATE USING (is_account_member(account_id, 'agent'));
CREATE POLICY agent_routing_rules_delete ON agent_routing_rules FOR DELETE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_agent_routing_rules
  BEFORE UPDATE ON agent_routing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3.3 Agent Queue (for load balancing)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'in_progress', 'completed', 'failed')),
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_queues_agent ON agent_queues(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_queues_conversation ON agent_queues(conversation_id);

ALTER TABLE agent_queues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_queues_select ON agent_queues;
DROP POLICY IF EXISTS agent_queues_insert ON agent_queues;
DROP POLICY IF EXISTS agent_queues_update ON agent_queues;
CREATE POLICY agent_queues_select ON agent_queues FOR SELECT USING (is_account_member(account_id));
CREATE POLICY agent_queues_insert ON agent_queues FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY agent_queues_update ON agent_queues FOR UPDATE USING (is_account_member(account_id, 'agent'));

-- ============================================
-- 3.4 Shared Skills (team-level)
-- ============================================
CREATE TABLE IF NOT EXISTS team_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES agent_teams(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_team_skills_team ON team_skills(team_id);

ALTER TABLE team_skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS team_skills_select ON team_skills;
DROP POLICY IF EXISTS team_skills_insert ON team_skills;
DROP POLICY IF EXISTS team_skills_update ON team_skills;
DROP POLICY IF EXISTS team_skills_delete ON team_skills;
CREATE POLICY team_skills_select ON team_skills FOR SELECT USING (is_account_member(account_id));
CREATE POLICY team_skills_insert ON team_skills FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY team_skills_update ON team_skills FOR UPDATE USING (is_account_member(account_id, 'agent'));
CREATE POLICY team_skills_delete ON team_skills FOR DELETE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_team_skills
  BEFORE UPDATE ON team_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3.5 Shared Knowledge (team-level)
-- ============================================
CREATE TABLE IF NOT EXISTS team_knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES agent_teams(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  knowledge_base_id UUID NOT NULL,
  access_level TEXT DEFAULT 'read' CHECK (access_level IN ('read', 'write')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, knowledge_base_id)
);

CREATE INDEX IF NOT EXISTS idx_team_kb_team ON team_knowledge_bases(team_id);

ALTER TABLE team_knowledge_bases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS team_kb_select ON team_knowledge_bases;
DROP POLICY IF EXISTS team_kb_insert ON team_knowledge_bases;
DROP POLICY IF EXISTS team_kb_delete ON team_knowledge_bases;
CREATE POLICY team_kb_select ON team_knowledge_bases FOR SELECT USING (is_account_member(account_id));
CREATE POLICY team_kb_insert ON team_knowledge_bases FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY team_kb_delete ON team_knowledge_bases FOR DELETE USING (is_account_member(account_id, 'agent'));

-- ============================================
-- 3.6 Agent Availability Schedule
-- ============================================
CREATE TABLE IF NOT EXISTS agent_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_schedules_agent ON agent_schedules(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_schedules_account ON agent_schedules(account_id);

ALTER TABLE agent_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_schedules_select ON agent_schedules;
DROP POLICY IF EXISTS agent_schedules_insert ON agent_schedules;
DROP POLICY IF EXISTS agent_schedules_update ON agent_schedules;
DROP POLICY IF EXISTS agent_schedules_delete ON agent_schedules;
CREATE POLICY agent_schedules_select ON agent_schedules FOR SELECT USING (is_account_member(account_id));
CREATE POLICY agent_schedules_insert ON agent_schedules FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY agent_schedules_update ON agent_schedules FOR UPDATE USING (is_account_member(account_id, 'agent'));
CREATE POLICY agent_schedules_delete ON agent_schedules FOR DELETE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_agent_schedules
  BEFORE UPDATE ON agent_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();