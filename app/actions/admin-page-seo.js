'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';
import { upsertPageSeo, deletePageSeo } from '../../src/lib/server/page-seo.mjs';

function parseFormDataString(formData, key) {
  const value = formData.get(key);
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export async function adminPageSeoAction(prevState, formData) {
  await requireBlogSessionUser();

  const intent = formData.get('intent');
  const pageSeoId = parseFormDataString(formData, 'pageSeoId');
  const pagePath = parseFormDataString(formData, 'pagePath');
  
  if (intent === 'delete' && pageSeoId) {
    try {
      await deletePageSeo(pageSeoId);
    } catch (error) {
      return { error: 'Failed to delete page SEO configuration.', fieldErrors: {} };
    }

    revalidatePath('/', 'layout');
    redirect('/admin/pages-seo?notice=Page+SEO+deleted');
  }

  if (intent === 'save') {
    if (!pagePath || !pagePath.startsWith('/')) {
      return { error: 'Validation failed', fieldErrors: { pagePath: 'Page path is required and must start with /' } };
    }

    const title = parseFormDataString(formData, 'title');
    const metaDescription = parseFormDataString(formData, 'metaDescription');
    const h1Heading = parseFormDataString(formData, 'h1Heading');
    const canonicalUrl = parseFormDataString(formData, 'canonicalUrl');
    const ogImage = parseFormDataString(formData, 'ogImage');
    const customJsonLd = parseFormDataString(formData, 'customJsonLd');
    const noindex = formData.get('noindex') === 'on';
    const nofollow = formData.get('nofollow') === 'on';
    
    const keywordsStr = parseFormDataString(formData, 'seoKeywords');
    const seoKeywords = keywordsStr
      ? keywordsStr.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

    try {
      await upsertPageSeo({
        pagePath,
        title,
        metaDescription,
        h1Heading,
        seoKeywords,
        canonicalUrl,
        ogImage,
        noindex,
        nofollow,
        customJsonLd
      });
    } catch (error) {
      if (error.code === '23505') {
        return { error: 'Validation failed', fieldErrors: { pagePath: 'A configuration for this path already exists.' } };
      }
      return { error: 'Failed to save page SEO configuration.', fieldErrors: {} };
    }

    revalidatePath('/', 'layout');
    redirect('/admin/pages-seo?notice=Page+SEO+saved+successfully');
  }

  return { error: 'Unknown action intent.', fieldErrors: {} };
}
