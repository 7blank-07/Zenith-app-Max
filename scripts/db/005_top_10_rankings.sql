-- Top 10 Rankings Schema
CREATE TABLE IF NOT EXISTS top_10_rankings (
  id BIGSERIAL PRIMARY KEY,
  position VARCHAR(10) NOT NULL,
  rank INTEGER NOT NULL,
  player_id TEXT NOT NULL,
  archetype TEXT, -- e.g. "Meta Beast", "Clinical Finisher"
  status VARCHAR(20) DEFAULT 'draft' NOT NULL, -- draft, live
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by TEXT,
  UNIQUE(position, rank, status)
);

-- Index for faster retrieval by position and status
CREATE INDEX IF NOT EXISTS idx_top_10_rankings_pos_status ON top_10_rankings(position, status);
