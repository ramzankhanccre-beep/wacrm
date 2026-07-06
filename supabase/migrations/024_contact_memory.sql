-- Add a dedicated memory store for contacts to support the Customer Digital Twin.

CREATE TABLE IF NOT EXISTS contact_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL DEFAULT 'summary' CHECK (memory_type IN ('summary', 'preference', 'objection', 'purchase_history', 'task', 'other')),
  title TEXT,
  memory_text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_memories_contact_id ON contact_memories(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_memories_account_id ON contact_memories(account_id);

ALTER TABLE contact_memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contact_memories_select ON contact_memories;
DROP POLICY IF EXISTS contact_memories_insert ON contact_memories;
DROP POLICY IF EXISTS contact_memories_update ON contact_memories;
DROP POLICY IF EXISTS contact_memories_delete ON contact_memories;

CREATE POLICY contact_memories_select ON contact_memories FOR SELECT USING (is_account_member(account_id));
CREATE POLICY contact_memories_insert ON contact_memories FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY contact_memories_update ON contact_memories FOR UPDATE USING (is_account_member(account_id, 'agent'));
CREATE POLICY contact_memories_delete ON contact_memories FOR DELETE USING (is_account_member(account_id, 'agent'));

CREATE TRIGGER set_updated_at_contact_memories
  BEFORE UPDATE ON contact_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
