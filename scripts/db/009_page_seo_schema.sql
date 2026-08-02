CREATE TABLE IF NOT EXISTS page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL UNIQUE,
  title text,
  meta_description text,
  h1_heading text,
  seo_keywords text[] NOT NULL DEFAULT ARRAY[]::text[],
  canonical_url text,
  og_image text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS page_seo_path_idx
  ON page_seo (page_path);

DROP TRIGGER IF EXISTS page_seo_set_updated_at ON page_seo;
CREATE TRIGGER page_seo_set_updated_at
  BEFORE UPDATE ON page_seo
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();
