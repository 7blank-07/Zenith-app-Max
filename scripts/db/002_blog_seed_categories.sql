INSERT INTO blog_categories (name, slug, description)
VALUES
  ('Reviews', 'reviews', 'Opinionated FC Mobile reviews, player breakdowns, and release recaps.'),
  ('Event Guides', 'event-guides', 'Step-by-step FC Mobile event guides, progression paths, and reward planning.'),
  ('Investments', 'investments', 'FC Mobile market investing ideas, coin-making guides, and card value analysis.'),
  ('News', 'news', 'Daily FC Mobile news, announcements, updates, and market-moving stories.')
ON CONFLICT (slug)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();
