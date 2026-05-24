'use server';

import { redirect } from 'next/navigation';
import { requireBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';
import {
  createPartner,
  deletePartner,
  getPartnerById,
  updatePartner
} from '../../src/lib/server/partners/repository.mjs';
import { PARTNER_PLATFORM_VALUES } from '../../src/lib/server/partners/constants.mjs';
import { revalidatePath } from 'next/cache';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function replaceNotice(pathValue, notice) {
  const url = new URL(pathValue, 'https://zenith.local');
  url.searchParams.set('notice', notice);
  return `${url.pathname}${url.search}`;
}

function validateEditorForm(formData) {
  const fieldErrors = {};
  const name = toText(formData.get('name'));
  const username = toText(formData.get('username'));
  const platform = toText(formData.get('platform')).toLowerCase();
  const bio = toText(formData.get('bio'));
  const avatarUrl = toText(formData.get('avatarUrl'));
  const followerCount = toText(formData.get('followerCount'));
  const socialUrl = toText(formData.get('socialUrl'));
  const featured = formData.get('featured') === 'on' || formData.get('featured') === 'true';
  const verified = formData.get('verified') === 'on' || formData.get('verified') === 'true';
  const displayOrder = parseInt(toText(formData.get('displayOrder')), 10) || 0;

  if (!name) {
    fieldErrors.name = 'A partner name is required.';
  }

  if (!PARTNER_PLATFORM_VALUES.includes(platform)) {
    fieldErrors.platform = 'Select a valid platform.';
  }

  if (!socialUrl) {
    fieldErrors.socialUrl = 'A social URL is required.';
  }

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      fieldErrors,
      error: 'Please fix the highlighted fields and try again.'
    };
  }

  return {
    ok: true,
    value: {
      name,
      username,
      platform,
      bio,
      avatarUrl,
      followerCount,
      socialUrl,
      featured,
      verified,
      displayOrder
    }
  };
}

export async function submitPartnerEditorAction(previousState, formData) {
  const partnerId = toText(formData.get('partnerId'));
  const intent = toText(formData.get('intent'), 'save');
  
  await requireBlogSessionUser({
    nextPath: partnerId ? `/admin/partners/edit/${partnerId}` : '/admin/partners/new',
    permission: 'edit-blogs'
  });

  const existing = partnerId ? await getPartnerById(partnerId) : null;

  if (partnerId && !existing) {
    return {
      error: 'This partner was removed and can no longer be edited.',
      fieldErrors: {}
    };
  }

  if (intent === 'delete') {
    if (!existing) {
      return {
        error: 'Only existing partners can be deleted.',
        fieldErrors: {}
      };
    }

    await deletePartner(existing.id);
    revalidatePath('/partners');
    revalidatePath('/admin/partners');
    redirect(`/admin/partners?notice=${encodeURIComponent('Partner deleted successfully.')}`);
  }

  const validation = validateEditorForm(formData);
  if (!validation.ok) {
    return {
      error: validation.error,
      fieldErrors: validation.fieldErrors
    };
  }

  try {
    const saved = existing
      ? await updatePartner(existing.id, validation.value)
      : await createPartner(validation.value);

    revalidatePath('/partners');
    revalidatePath('/admin/partners');
    
    const notice = 'Partner saved successfully.';
    redirect(replaceNotice(`/admin/partners/edit/${encodeURIComponent(saved.id)}`, notice));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'The partner could not be saved.',
      fieldErrors: {}
    };
  }
}
