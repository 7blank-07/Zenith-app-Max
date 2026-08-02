import { runBlogQuery } from './blog/db.mjs';

export async function getPageSeoDashboardCounts() {
  const result = await runBlogQuery('SELECT COUNT(*) FROM page_seo');
  return {
    pagesSeoTotal: Number.parseInt(result.rows[0].count, 10)
  };
}

export async function listPageSeoEntries({ page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;
  const countResult = await runBlogQuery(`SELECT COUNT(*) FROM page_seo`);
  const total = Number.parseInt(countResult.rows[0].count, 10);

  const result = await runBlogQuery(`
    SELECT id, page_path, title, meta_description, updated_at
    FROM page_seo
    ORDER BY page_path ASC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  return {
    items: result.rows.map((row) => ({
      id: row.id,
      pagePath: row.page_path,
      title: row.title,
      metaDescription: row.meta_description,
      updatedAt: row.updated_at
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getPageSeoByPath(pagePath) {
  const result = await runBlogQuery(`
    SELECT *
    FROM page_seo
    WHERE page_path = $1
  `, [pagePath]);

  if (!result.rows[0]) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    pagePath: row.page_path,
    title: row.title,
    metaDescription: row.meta_description,
    h1Heading: row.h1_heading,
    seoKeywords: row.seo_keywords || [],
    canonicalUrl: row.canonical_url,
    ogImage: row.og_image,
    noindex: row.noindex,
    nofollow: row.nofollow,
    customJsonLd: row.custom_json_ld,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getPageSeoById(id) {
  const result = await runBlogQuery(`
    SELECT *
    FROM page_seo
    WHERE id = $1
  `, [id]);

  if (!result.rows[0]) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    pagePath: row.page_path,
    title: row.title,
    metaDescription: row.meta_description,
    h1Heading: row.h1_heading,
    seoKeywords: row.seo_keywords || [],
    canonicalUrl: row.canonical_url,
    ogImage: row.og_image,
    noindex: row.noindex,
    nofollow: row.nofollow,
    customJsonLd: row.custom_json_ld,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function upsertPageSeo(payload) {
  const {
    pagePath,
    title = null,
    metaDescription = null,
    h1Heading = null,
    seoKeywords = [],
    canonicalUrl = null,
    ogImage = null,
    noindex = false,
    nofollow = false,
    customJsonLd = null
  } = payload;

  const result = await runBlogQuery(`
    INSERT INTO page_seo (page_path, title, meta_description, h1_heading, seo_keywords, canonical_url, og_image, noindex, nofollow, custom_json_ld)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (page_path)
    DO UPDATE SET
      title = EXCLUDED.title,
      meta_description = EXCLUDED.meta_description,
      h1_heading = EXCLUDED.h1_heading,
      seo_keywords = EXCLUDED.seo_keywords,
      canonical_url = EXCLUDED.canonical_url,
      og_image = EXCLUDED.og_image,
      noindex = EXCLUDED.noindex,
      nofollow = EXCLUDED.nofollow,
      custom_json_ld = EXCLUDED.custom_json_ld
    RETURNING id
  `, [pagePath, title, metaDescription, h1Heading, seoKeywords, canonicalUrl, ogImage, noindex, nofollow, customJsonLd]);

  return result.rows[0].id;
}

export async function deletePageSeo(id) {
  await runBlogQuery('DELETE FROM page_seo WHERE id = $1', [id]);
}
