CREATE TABLE IF NOT EXISTS streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  youtube_id text NOT NULL,
  thumbnail text,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('live', 'upcoming', 'replay')),
  tournament_name text,
  match_stage text CHECK (match_stage IN ('Group Stage', 'Quarterfinal', 'Semifinal', 'Final', 'Community', 'Other')),
  match_date timestamptz,
  host_name text,
  participants text,
  description text,
  featured boolean NOT NULL DEFAULT FALSE,
  homepage_visible boolean NOT NULL DEFAULT TRUE,
  discord_link text,
  related_blog_id uuid REFERENCES blogs(id) ON DELETE SET NULL,
  seo_title text,
  meta_description text,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS streams_slug_unique_idx ON streams (slug);
CREATE INDEX IF NOT EXISTS streams_status_match_date_idx ON streams (status, match_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS streams_featured_idx ON streams (featured) WHERE featured = TRUE;

DROP TRIGGER IF EXISTS streams_set_updated_at ON streams;
CREATE TRIGGER streams_set_updated_at
  BEFORE UPDATE ON streams
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();
