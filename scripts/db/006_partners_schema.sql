CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  username text,
  platform text NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'twitter', 'discord', 'website')),
  bio text,
  avatar_url text,
  follower_count text,
  social_url text NOT NULL,
  featured boolean NOT NULL DEFAULT FALSE,
  verified boolean NOT NULL DEFAULT FALSE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS partners_platform_idx ON partners (platform);
CREATE INDEX IF NOT EXISTS partners_featured_idx ON partners (featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS partners_display_order_idx ON partners (display_order ASC);

DROP TRIGGER IF EXISTS partners_set_updated_at ON partners;
CREATE TRIGGER partners_set_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();
