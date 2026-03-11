Act as a senior full-stack architect, CMS designer, and SEO engineer.

Design a production-grade blog CMS system for a Next.js (App Router) + React application using a PostgreSQL database hosted on a VPS.

The purpose of this system is to allow teammates to create blog posts daily without writing HTML or CSS.

The system must be optimized for SEO, Google indexing, and long-term organic traffic growth.

Do NOT generate implementation code yet.

First generate a structured development plan with exactly 5 phases.

------------------------------------------------

TECH STACK

Frontend
Next.js (App Router)
React

Backend
Next.js server actions and API routes

Database
PostgreSQL (already hosted on VPS)

------------------------------------------------

BLOG CATEGORIES

Editors must choose one category when creating a blog:

reviews
event-guides
investments
news

Categories must appear in the blog URL.

Example:

/blogs/investments/best-investment-in-fcmobile-march-2026

Final URL structure must be:

/blogs
/blogs/[category]
/blogs/[category]/[slug]
/blogs/tag/[tag]

This structure is required for SEO.

------------------------------------------------

EDITOR WORKFLOW

Teammates should be able to access an admin panel.

Admin routes:

/admin
/admin/blogs
/admin/blogs/new
/admin/blogs/edit/[id]
/admin/blogs/drafts
/admin/blogs/pending

Workflow:

draft → pending → published

Editors can:

create blog
edit blog
save draft
submit for review

Admin can:

approve
publish
reject
delete

------------------------------------------------

BLOG DATA FIELDS

Each blog post must support:

title
subtitle
slug
category
tags
seo_keywords
meta_description
author
cover_image
content (rich text)
internal_links
external_links
status
created_at
updated_at
published_at
reading_time

Slug must auto-generate from title.

------------------------------------------------

PUBLIC BLOG FEATURES

Create public routes:

/blogs
/blogs/[category]
/blogs/[category]/[slug]
/blogs/tag/[tag]

Public pages must include:

blog homepage
category pages
tag pages
individual blog page
related articles
pagination
reading time
author display

------------------------------------------------

SEO REQUIREMENTS

Every blog page must automatically generate:

SEO title
meta description
OpenGraph metadata
Twitter cards
Article schema (structured data)

Also implement:

dynamic sitemap.xml
robots.txt
clean URL slugs
internal linking between articles
related articles system

------------------------------------------------

RICH TEXT EDITOR

Use a modern editor so teammates do not write HTML.

Recommended editor:

Tiptap

It must support:

headings
lists
links
images
tables
code blocks
embedded media

------------------------------------------------

DATABASE DESIGN

Design PostgreSQL schema including tables:

users
blogs
blog_categories
blog_tags
blog_tag_relations

Relationships must support:

fast category queries
fast tag queries
SEO-friendly lookups

Include indexes where necessary.

------------------------------------------------

PERFORMANCE

The blog system must support:

static generation for blog pages
incremental revalidation
fast category page loading
efficient database queries

------------------------------------------------

DEVELOPMENT PLAN

Create exactly 5 phases.

Phase 1
Database schema and core architecture.

Phase 2
Public blog routes and page layouts.

Phase 3
Admin authentication and CMS dashboard.

Phase 4
Blog editor, draft workflow, and publishing system.

Phase 5
SEO optimization, sitemap generation, schema markup, tag pages, and performance improvements.

Each phase must clearly specify:

files to create
routes
components
database changes
API endpoints
important implementation notes

Only generate the development plan.

Do not write implementation code yet.