'use server';

import { redirect } from 'next/navigation';
import { requireBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';
import {
  createRedeemCode,
  deleteRedeemCode,
  getRedeemCodeById,
  updateRedeemCode
} from '../../src/lib/server/redeem-codes/repository.mjs';
import {
  REDEEM_CODE_SCOPE_VALUES,
  REDEEM_CODE_STATUS_VALUES
} from '../../src/lib/server/redeem-codes/constants.mjs';
import { buildRedeemRevalidationPaths } from '../../src/lib/server/redeem-codes/revalidation.mjs';
import { revalidateAppPaths } from '../../src/lib/server/blog/revalidation.mjs';
import { triggerAutoExpire } from '../../src/lib/server/redeem-codes/auto-expire.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function normalizeDateTime(value) {
  const text = toText(value);
  if (!text) return null;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function replaceNotice(pathValue, notice) {
  const url = new URL(pathValue, 'https://zenith.local');
  url.searchParams.set('notice', notice);
  return `${url.pathname}${url.search}`;
}

function validateEditorForm(formData) {
  const fieldErrors = {};
  const title = toText(formData.get('title'));
  const codeValue = toText(formData.get('codeValue'));
  const scope = toText(formData.get('scope')).toLowerCase();
  const status = toText(formData.get('status')).toLowerCase();
  const publishedAt = normalizeDateTime(formData.get('publishedAt'));
  const expiresAt = normalizeDateTime(formData.get('expiresAt'));

  if (!title) {
    fieldErrors.title = 'A redeem code title is required.';
  }

  if (!codeValue) {
    fieldErrors.codeValue = 'A redeem code value is required.';
  }

  if (!REDEEM_CODE_SCOPE_VALUES.includes(scope)) {
    fieldErrors.scope = 'Select a valid country scope.';
  }

  if (!REDEEM_CODE_STATUS_VALUES.includes(status)) {
    fieldErrors.status = 'Select a valid status.';
  }

  if (!publishedAt) {
    fieldErrors.publishedAt = 'Publish date is required.';
  }

  if (toText(formData.get('expiresAt')) && !expiresAt) {
    fieldErrors.expiresAt = 'Expiry date is invalid.';
  }

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      fieldErrors,
      error: 'Please fix the highlighted redeem code fields and try again.'
    };
  }

  return {
    ok: true,
    value: {
      title,
      codeValue,
      scope,
      status,
      publishedAt,
      expiresAt
    }
  };
}

export async function submitRedeemCodeEditorAction(previousState, formData) {
  const codeId = toText(formData.get('redeemCodeId'));
  const intent = toText(formData.get('intent'), 'save');
  await requireBlogSessionUser({
    nextPath: codeId ? `/admin/redeem-codes/edit/${codeId}` : '/admin/redeem-codes/new',
    permission: 'edit-blogs'
  });

  const existing = codeId ? await getRedeemCodeById(codeId) : null;

  if (codeId && !existing) {
    return {
      error: 'This redeem code was removed and can no longer be edited.',
      fieldErrors: {}
    };
  }

  if (intent === 'delete') {
    if (!existing) {
      return {
        error: 'Only existing redeem codes can be deleted.',
        fieldErrors: {}
      };
    }

    await deleteRedeemCode(existing.id);
    const revalidation = await revalidateAppPaths(
      buildRedeemRevalidationPaths({
        previousCode: existing
      })
    );
    const notice = revalidation.failures.length
      ? 'Redeem code deleted. Some public pages did not refresh automatically.'
      : 'Redeem code deleted successfully.';
    redirect(`/admin/redeem-codes?notice=${encodeURIComponent(notice)}`);
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
      ? await updateRedeemCode(existing.id, validation.value)
      : await createRedeemCode(validation.value);

    // If a code was just changed to EXPIRED, fire the background auto-expire task
    if (existing && existing.status !== 'expired' && saved.status === 'expired') {
        try {
            await triggerAutoExpire(saved.codeValue);
        } catch (e) {
            console.error(e);
        }
    }

    const revalidation = await revalidateAppPaths(
      buildRedeemRevalidationPaths({
        previousCode: existing,
        nextCode: saved
      })
    );

    const notice = revalidation.failures.length
      ? 'Redeem code saved, but some public pages did not refresh automatically.'
      : 'Redeem code saved successfully.';
    redirect(replaceNotice(`/admin/redeem-codes/edit/${encodeURIComponent(saved.id)}`, notice));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'The redeem code could not be saved.',
      fieldErrors: {}
    };
  }
}
