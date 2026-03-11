'use server';

import { redirect } from 'next/navigation';
import { getBlogById } from '../../src/lib/server/blog/repository.mjs';
import { requireBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';
import { revalidateBlogChange } from '../../src/lib/server/blog/revalidation.mjs';
import { validateBlogEditorSubmission } from '../../src/lib/server/blog/validation.mjs';
import { executeBlogWorkflow, resolveBlogWorkflowIntent } from '../../src/lib/server/blog/workflow.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function replaceNoticeQuery(pathValue, notice) {
  const baseUrl = 'https://zenith.local';
  const url = new URL(pathValue, baseUrl);
  url.searchParams.set('notice', notice);
  return `${url.pathname}${url.search}`;
}

export async function submitBlogEditorAction(previousState, formData) {
  const postId = toText(formData.get('postId'));
  const user = await requireBlogSessionUser({
    nextPath: postId ? `/admin/blogs/edit/${postId}` : '/admin/blogs/new',
    permission: 'edit-blogs'
  });
  const existingPost = postId ? await getBlogById(postId) : null;

  if (postId && !existingPost) {
    return {
      error: 'This article no longer exists.',
      fieldErrors: {}
    };
  }

  const intent = resolveBlogWorkflowIntent(formData.get('intent'));
  if (!intent) {
    return {
      error: 'Choose a workflow action before saving this article.',
      fieldErrors: {}
    };
  }

  const validation = validateBlogEditorSubmission(formData, {
    intent,
    existingPost,
    currentUser: user,
    rawEnv: process.env
  });

  if (!validation.ok) {
    return {
      error: validation.error,
      fieldErrors: validation.fieldErrors
    };
  }

  try {
    const result = await executeBlogWorkflow({
      intent,
      user,
      existingPost,
      input: validation.value
    });

    const revalidation = await revalidateBlogChange({
      previousPost: existingPost,
      nextPost: result.blog || null
    });

    if (revalidation.failures.length) {
      console.error('[blog-revalidation] publish/update failure', {
        redirectPath: result.redirectPath,
        failures: revalidation.failures
      });

      redirect(
        replaceNoticeQuery(
          result.redirectPath,
          `${result.notice} Some public blog paths could not be refreshed automatically.`
        )
      );
    }

    redirect(result.redirectPath);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'The blog editor could not save your changes.',
      fieldErrors: {}
    };
  }
}

