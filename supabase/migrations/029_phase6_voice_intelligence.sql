-- Phase 6: Voice Intelligence Platform
-- Migration for Voice STT, TTS, Agents, Sentiment, and Memory tables

-- ============================================================
-- Voice Speech-to-Text Configurations
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_stt_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'openai',
  model TEXT NOT NULL DEFAULT 'whisper-1',
  language TEXT NOT NULL DEFAULT 'auto',
  enable_diarization BOOLEAN NOT NULL DEFAULT true,
  enable_punctuation BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_stt_configs_account ON voice_stt_configs(account_id);

-- ============================================================
-- Voice Text-to-Speech Configurations
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_tts_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'openai',
  voice_id TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en-US',
  speed DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  pitch INTEGER NOT NULL DEFAULT 0,
  enable_ssml BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_tts_configs_account ON voice_tts_configs(account_id);

-- ============================================================
-- Voice Agents
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  stt_config_id UUID REFERENCES voice_stt_configs(id) ON DELETE SET NULL,
  tts_config_id UUID REFERENCES voice_tts_configs(id) ON DELETE SET NULL,
  enable_inbound BOOLEAN NOT NULL DEFAULT true,
  enable_outbound BOOLEAN NOT NULL DEFAULT false,
  max_duration_minutes INTEGER NOT NULL DEFAULT 30,
  silence_timeout_seconds INTEGER NOT NULL DEFAULT 10,
  interruption_sensitivity TEXT NOT NULL DEFAULT 'medium',
  greeting_message TEXT,
  fallback_message TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_agents_account ON voice_agents(account_id);

-- ============================================================
-- Voice Sentiment Configurations
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_sentiment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'openai',
  enable_real_time BOOLEAN NOT NULL DEFAULT true,
  negative_threshold DECIMAL(3,2) NOT NULL DEFAULT 0.30,
  auto_escalate_on_negative BOOLEAN NOT NULL DEFAULT true,
  alert_channels TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_sentiment_configs_account ON voice_sentiment_configs(account_id);

-- ============================================================
-- Voice Sentiment Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_sentiment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  call_id UUID,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  sentiment_score DECIMAL(4,3) NOT NULL,
  emotion TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,
  transcript_segment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_sentiment_logs_account ON voice_sentiment_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_voice_sentiment_logs_call ON voice_sentiment_logs(call_id);

-- ============================================================
-- Voice Transcripts
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  call_id UUID,
  audio_url TEXT,
  transcript TEXT NOT NULL,
  summary TEXT,
  key_phrases TEXT[] NOT NULL DEFAULT '{}',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'en',
  speakers_detected INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_transcripts_account ON voice_transcripts(account_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_contact ON voice_transcripts(contact_id);

-- ============================================================
-- Voice Memory Entries
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  call_id UUID,
  entry_type TEXT NOT NULL,
  content TEXT NOT NULL,
  importance INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_memory_entries_account ON voice_memory_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_voice_memory_entries_contact ON voice_memory_entries(contact_id);
CREATE INDEX IF NOT EXISTS idx_voice_memory_entries_type ON voice_memory_entries(entry_type);

-- ============================================================
-- Voice Calls (for tracking calls)
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  voice_agent_id UUID REFERENCES voice_agents(id) ON DELETE SET NULL,
  direction TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'initiated',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  transcript_id UUID REFERENCES voice_transcripts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_calls_account ON voice_calls(account_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_contact ON voice_calls(contact_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_status ON voice_calls(status);

-- RLS Policies for voice tables
ALTER TABLE voice_stt_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_tts_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sentiment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sentiment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;

-- Account-scoped policies
CREATE POLICY "Users can view voice_stt_configs for their account"
  ON voice_stt_configs FOR SELECT
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert voice_stt_configs for their account"
  ON voice_stt_configs FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update voice_stt_configs for their account"
  ON voice_stt_configs FOR UPDATE
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete voice_stt_configs for their account"
  ON voice_stt_configs FOR DELETE
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

-- TTS
CREATE POLICY "Users can view voice_tts_configs for their account"
  ON voice_tts_configs FOR SELECT
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert voice_tts_configs for their account"
  ON voice_tts_configs FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update voice_tts_configs for their account"
  ON voice_tts_configs FOR UPDATE
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete voice_tts_configs for their account"
  ON voice_tts_configs FOR DELETE
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

-- Voice Agents
CREATE POLICY "Users can view voice_agents for their account"
  ON voice_agents FOR SELECT
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert voice_agents for their account"
  ON voice_agents FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update voice_agents for their account"
  ON voice_agents FOR UPDATE
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete voice_agents for their account"
  ON voice_agents FOR DELETE
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

-- Sentiment Configs
CREATE POLICY "Users can view voice_sentiment_configs for their account"
  ON voice_sentiment_configs FOR SELECT
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert voice_sentiment_configs for their account"
  ON voice_sentiment_configs FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update voice_sentiment_configs for their account"
  ON voice_sentiment_configs FOR UPDATE
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete voice_sentiment_configs for their account"
  ON voice_sentiment_configs FOR DELETE
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

-- Sentiment Logs
CREATE POLICY "Users can view voice_sentiment_logs for their account"
  ON voice_sentiment_logs FOR SELECT
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert voice_sentiment_logs for their account"
  ON voice_sentiment_logs FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

-- Transcripts
CREATE POLICY "Users can view voice_transcripts for their account"
  ON voice_transcripts FOR SELECT
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert voice_transcripts for their account"
  ON voice_transcripts FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

-- Memory Entries
CREATE POLICY "Users can view voice_memory_entries for their account"
  ON voice_memory_entries FOR SELECT
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert voice_memory_entries for their account"
  ON voice_memory_entries FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete voice_memory_entries for their account"
  ON voice_memory_entries FOR DELETE
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

-- Calls
CREATE POLICY "Users can view voice_calls for their account"
  ON voice_calls FOR SELECT
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert voice_calls for their account"
  ON voice_calls FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update voice_calls for their account"
  ON voice_calls FOR UPDATE
  USING (account_id IN (SELECT account_id FROM profiles WHERE user_id = auth.uid()));