'use server';

import { redirect } from 'next/navigation';
import { requireBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';
import {
  createStream,
  deleteStream,
  getStreamById,
  updateStream
} from '../../src/lib/server/streams/repository.mjs';
import {
  STREAM_STATUS_VALUES,
  STREAM_MATCH_STAGE_VALUES
} from '../../src/lib/server/streams/constants.mjs';
import { buildStreamRevalidationPaths } from '../../src/lib/server/streams/revalidation.mjs';
import { revalidateAppPaths } from '../../src/lib/server/blog/revalidation.mjs';

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
  const slug = toText(formData.get('slug'));
  const youtubeId = toText(formData.get('youtubeId'));
  const thumbnail = toText(formData.get('thumbnail'));
  const status = toText(formData.get('status')).toLowerCase();
  const tournamentName = toText(formData.get('tournamentName'));
  const matchStage = toText(formData.get('matchStage'));
  const matchDate = normalizeDateTime(formData.get('matchDate'));
  const hostName = toText(formData.get('hostName'));
  const participants = toText(formData.get('participants'));
  const description = toText(formData.get('description'));
  const featured = formData.get('featured') === 'on' || formData.get('featured') === 'true';
  const homepageVisible = formData.get('homepageVisible') === 'on' || formData.get('homepageVisible') === 'true';
  const discordLink = toText(formData.get('discordLink'));
  const relatedBlogId = toText(formData.get('relatedBlogId')) || null;
  const seoTitle = toText(formData.get('seoTitle'));
  const metaDescription = toText(formData.get('metaDescription'));
  
  // Basic tag extraction from comma-separated string
  const tagsString = toText(formData.get('tags'));
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

  if (!title) {
    fieldErrors.title = 'A stream title is required.';
  }

  if (!youtubeId) {
    fieldErrors.youtubeId = 'A YouTube Video/Live ID is required.';
  }

  if (!STREAM_STATUS_VALUES.includes(status)) {
    fieldErrors.status = 'Select a valid status.';
  }

  if (matchStage && !STREAM_MATCH_STAGE_VALUES.includes(matchStage)) {
    fieldErrors.matchStage = 'Select a valid match stage.';
  }

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      fieldErrors,
      error: 'Please fix the highlighted stream fields and try again.'
    };
  }

  return {
    ok: true,
    value: {
      title,
      slug,
      youtubeId,
      thumbnail,
      status,
      tournamentName,
      matchStage,
      matchDate,
      hostName,
      participants,
      description,
      featured,
      homepageVisible,
      discordLink,
      relatedBlogId,
      seoTitle,
      metaDescription,
      tags
    }
  };
}

export async function submitStreamEditorAction(previousState, formData) {
  const streamId = toText(formData.get('streamId'));
  const intent = toText(formData.get('intent'), 'save');
  
  await requireBlogSessionUser({
    nextPath: streamId ? `/admin/streaming/edit/${streamId}` : '/admin/streaming/new',
    permission: 'edit-blogs'
  });

  const existing = streamId ? await getStreamById(streamId) : null;

  if (streamId && !existing) {
    return {
      error: 'This stream was removed and can no longer be edited.',
      fieldErrors: {}
    };
  }

  if (intent === 'delete') {
    if (!existing) {
      return {
        error: 'Only existing streams can be deleted.',
        fieldErrors: {}
      };
    }

    await deleteStream(existing.id);
    const revalidation = await revalidateAppPaths(
      buildStreamRevalidationPaths({
        previousStream: existing
      })
    );
    const notice = revalidation.failures.length
      ? 'Stream deleted. Some public pages did not refresh automatically.'
      : 'Stream deleted successfully.';
    redirect(`/admin/streaming?notice=${encodeURIComponent(notice)}`);
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
      ? await updateStream(existing.id, validation.value)
      : await createStream(validation.value);

    const revalidation = await revalidateAppPaths(
      buildStreamRevalidationPaths({
        previousStream: existing,
        nextStream: saved
      })
    );

    const notice = revalidation.failures.length
      ? 'Stream saved, but some public pages did not refresh automatically.'
      : 'Stream saved successfully.';
    redirect(replaceNotice(`/admin/streaming/edit/${encodeURIComponent(saved.id)}`, notice));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'The stream could not be saved.',
      fieldErrors: {}
    };
  }
}
