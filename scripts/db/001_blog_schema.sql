CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'editor')),
  is_active boolean NOT NULL DEFAULT TRUE,
  session_version integer NOT NULL DEFAULT 1 CHECK (session_version >= 1),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text,
  category_id uuid NOT NULL REFERENCES blog_categories(id) ON DELETE RESTRICT,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  cover_image text,
  content_json jsonb NOT NULL DEFAULT '{"type":"doc","content":[]}'::jsonb,
  content_html text NOT NULL DEFAULT '',
  seo_keywords text[] NOT NULL DEFAULT ARRAY[]::text[],
  meta_description text,
  views integer NOT NULL DEFAULT 0 CHECK (views >= 0),
  featured boolean NOT NULL DEFAULT FALSE,
  internal_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  external_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  reading_time integer NOT NULL DEFAULT 1 CHECK (reading_time >= 1),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT blogs_published_at_consistency_ck CHECK (
    (status = 'published' AND published_at IS NOT NULL)
    OR (status <> 'published')
  )
);

CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_tag_relations (
  blog_id uuid NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blog_id, tag_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
  ON users (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS blog_categories_slug_unique_idx
  ON blog_categories (slug);

CREATE UNIQUE INDEX IF NOT EXISTS blog_tags_slug_unique_idx
  ON blog_tags (slug);

CREATE UNIQUE INDEX IF NOT EXISTS blogs_category_slug_unique_idx
  ON blogs (category_id, slug);

CREATE INDEX IF NOT EXISTS blogs_slug_idx
  ON blogs (slug);

CREATE INDEX IF NOT EXISTS blogs_status_published_at_idx
  ON blogs (status, published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS blogs_category_status_published_at_idx
  ON blogs (category_id, status, published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS blogs_featured_published_idx
  ON blogs (published_at DESC NULLS LAST)
  WHERE status = 'published' AND featured = TRUE;

CREATE INDEX IF NOT EXISTS blog_tag_relations_tag_blog_idx
  ON blog_tag_relations (tag_id, blog_id);

CREATE INDEX IF NOT EXISTS blog_tag_relations_blog_tag_idx
  ON blog_tag_relations (blog_id, tag_id);

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS blog_categories_set_updated_at ON blog_categories;
CREATE TRIGGER blog_categories_set_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS blogs_set_updated_at ON blogs;
CREATE TRIGGER blogs_set_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS blog_tags_set_updated_at ON blog_tags;
CREATE TRIGGER blog_tags_set_updated_at
  BEFORE UPDATE ON blog_tags
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();
