export const BLOG_FIXED_CATEGORIES = Object.freeze([
  Object.freeze({
    name: 'Reviews',
    slug: 'reviews',
    description: 'Opinionated FC Mobile reviews, player breakdowns, and release recaps.'
  }),
  Object.freeze({
    name: 'Event Guides',
    slug: 'event-guides',
    description: 'Step-by-step FC Mobile event guides, progression paths, and reward planning.'
  }),
  Object.freeze({
    name: 'Investments',
    slug: 'investments',
    description: 'FC Mobile market investing ideas, coin-making guides, and card value analysis.'
  }),
  Object.freeze({
    name: 'News',
    slug: 'news',
    description: 'Daily FC Mobile news, announcements, updates, and market-moving stories.'
  })
]);

export const BLOG_CATEGORY_SLUGS = Object.freeze(BLOG_FIXED_CATEGORIES.map((category) => category.slug));

export const BLOG_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'published',
  REJECTED: 'rejected'
});

export const BLOG_STATUS_VALUES = Object.freeze(Object.values(BLOG_STATUS));

export const BLOG_USER_ROLE = Object.freeze({
  ADMIN: 'admin',
  EDITOR: 'editor'
});

export const BLOG_USER_ROLE_VALUES = Object.freeze(Object.values(BLOG_USER_ROLE));

export const BLOG_SLUG_MAX_LENGTH = 96;
export const BLOG_EXCERPT_MAX_LENGTH = 220;
export const BLOG_META_DESCRIPTION_MAX_LENGTH = 160;
export const BLOG_DEFAULT_PAGE_SIZE = 12;
export const BLOG_MAX_PAGE_SIZE = 50;
export const BLOG_DEFAULT_ADMIN_PAGE_SIZE = 25;
export const BLOG_MAX_ADMIN_PAGE_SIZE = 100;
export const BLOG_FEATURED_HOME_LIMIT = 3;
export const BLOG_RELATED_ARTICLES_LIMIT = 4;
export const BLOG_READING_WORDS_PER_MINUTE = 200;
export const BLOG_MIN_READING_TIME_MINUTES = 1;
export const BLOG_MIGRATIONS_TABLE = 'blog_schema_migrations';
