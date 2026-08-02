ALTER TABLE page_seo ADD COLUMN IF NOT EXISTS noindex boolean NOT NULL DEFAULT false;
ALTER TABLE page_seo ADD COLUMN IF NOT EXISTS nofollow boolean NOT NULL DEFAULT false;
ALTER TABLE page_seo ADD COLUMN IF NOT EXISTS custom_json_ld text;
