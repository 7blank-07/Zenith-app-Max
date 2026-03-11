'use server';

import { redirect } from 'next/navigation';
import { getBlogById } from '../../src/lib/server/blog/repository.mjs';
import { requireBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';
import { validateBlogEditorSubmission } from '../../src/lib/server/blog/validation.mjs';
import { executeBlogWorkflow, resolveBlogWorkflowIntent } from '../../src/lib/server/blog/workflow.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
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

    redirect(result.redirectPath);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'The blog editor could not save your changes.',
      fieldErrors: {}
    };
  }
}

