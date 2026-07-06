-- Add AI Agent Studio support for Phase 1.
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  personality TEXT NOT NULL DEFAULT 'Neutral' CHECK (personality IN ('Friendly', 'Professional', 'Assertive', 'Empathetic', 'Neutral')),
  tone TEXT NOT NULL DEFAULT 'Conversational' CHECK (tone IN ('Formal', 'Casual', 'Conversational', 'Technical')),
  communication_style TEXT NOT NULL DEFAULT 'Concise' CHECK (communication_style IN ('Concise', 'Detailed', 'Bullet-led', 'Narrative')),
  languages JSONB NOT NULL DEFAULT '["en"]'::jsonb CHECK (jsonb_typeof(languages) = 'array'),
  business_context TEXT,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'testing', 'live', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_account_id ON agents(account_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agents_select ON agents;
DROP POLICY IF EXISTS agents_insert ON agents;
DROP POLICY IF EXISTS agents_update ON agents;
DROP POLICY IF EXISTS agents_delete ON agents;
CREATE POLICY agents_select ON agents FOR SELECT USING (is_account_member(account_id));
CREATE POLICY agents_insert ON agents FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY agents_update ON agents FOR UPDATE USING (is_account_member(account_id, 'agent'));
CREATE POLICY agents_delete ON agents FOR DELETE USING (is_account_member(account_id, 'agent'));

DROP TRIGGER IF EXISTS set_updated_at ON agents;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
