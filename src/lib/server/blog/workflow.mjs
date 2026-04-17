import { BLOG_STATUS, BLOG_USER_ROLE } from './constants.mjs';
import { deleteBlog, updateBlog, createBlog } from './repository.mjs';

export const BLOG_WORKFLOW_INTENT = Object.freeze({
  SAVE_DRAFT: 'save-draft',
  SUBMIT_REVIEW: 'submit-review',
  APPROVE: 'approve',
  PUBLISH: 'publish',
  REJECT: 'reject',
  DELETE: 'delete'
});

const BLOG_WORKFLOW_VALUES = Object.freeze(Object.values(BLOG_WORKFLOW_INTENT));

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

export function resolveBlogWorkflowIntent(value) {
  const normalized = toText(value);
  return BLOG_WORKFLOW_VALUES.includes(normalized) ? normalized : '';
}

export function canEditBlogPost(user, post) {
  if (!user?.id) {
    return false;
  }

  if (user.role === BLOG_USER_ROLE.ADMIN) {
    return true;
  }

  if (!post) {
    return user.role === BLOG_USER_ROLE.EDITOR;
  }

  return post.authorId === user.id;
}

export function getBlogEditorCapabilities(user, post = null) {
  const canEdit = canEditBlogPost(user, post);
  const isAdmin = user?.role === BLOG_USER_ROLE.ADMIN;
  const currentStatus = post?.status || BLOG_STATUS.DRAFT;

  return {
    canEdit,
    canSaveDraft: canEdit,
    canSubmitReview: canEdit,
    canApprove: isAdmin && currentStatus === BLOG_STATUS.PENDING,
    canPublish: isAdmin && currentStatus !== BLOG_STATUS.PENDING,
    canReject: isAdmin && Boolean(post),
    canDelete: isAdmin && Boolean(post),
    canFeature: isAdmin,
    canManageCategories: isAdmin
  };
}

export function buildBlogEditorPath(blogId) {
  return `/admin/blogs/edit/${encodeURIComponent(blogId)}`;
}

function buildNotice(intent) {
  switch (intent) {
    case BLOG_WORKFLOW_INTENT.SAVE_DRAFT:
      return 'Draft saved successfully.';
    case BLOG_WORKFLOW_INTENT.SUBMIT_REVIEW:
      return 'Article submitted for review.';
    case BLOG_WORKFLOW_INTENT.APPROVE:
      return 'Article approved and published.';
    case BLOG_WORKFLOW_INTENT.PUBLISH:
      return 'Article published successfully.';
    case BLOG_WORKFLOW_INTENT.REJECT:
      return 'Article rejected and moved out of the review queue.';
    case BLOG_WORKFLOW_INTENT.DELETE:
      return 'Article deleted.';
    default:
      return 'Article updated.';
  }
}

function assertWorkflowPermission(user, post, intent) {
  const capabilities = getBlogEditorCapabilities(user, post);

  if (
    (intent === BLOG_WORKFLOW_INTENT.SAVE_DRAFT && capabilities.canSaveDraft) ||
    (intent === BLOG_WORKFLOW_INTENT.SUBMIT_REVIEW && capabilities.canSubmitReview) ||
    (intent === BLOG_WORKFLOW_INTENT.APPROVE && capabilities.canApprove) ||
    (intent === BLOG_WORKFLOW_INTENT.PUBLISH && capabilities.canPublish) ||
    (intent === BLOG_WORKFLOW_INTENT.REJECT && capabilities.canReject) ||
    (intent === BLOG_WORKFLOW_INTENT.DELETE && capabilities.canDelete)
  ) {
    return capabilities;
  }

  throw new Error('You are not allowed to perform that editorial workflow action.');
}

function resolveStatusForIntent(intent, existingPost) {
  if (intent === BLOG_WORKFLOW_INTENT.SAVE_DRAFT) {
    return BLOG_STATUS.DRAFT;
  }

  if (intent === BLOG_WORKFLOW_INTENT.SUBMIT_REVIEW) {
    return BLOG_STATUS.PENDING;
  }

  if (intent === BLOG_WORKFLOW_INTENT.REJECT) {
    return BLOG_STATUS.REJECTED;
  }

  if (intent === BLOG_WORKFLOW_INTENT.APPROVE || intent === BLOG_WORKFLOW_INTENT.PUBLISH) {
    return BLOG_STATUS.PUBLISHED;
  }

  return existingPost?.status || BLOG_STATUS.DRAFT;
}

export async function executeBlogWorkflow({ intent, user, existingPost = null, input } = {}) {
  const normalizedIntent = resolveBlogWorkflowIntent(intent);

  if (!normalizedIntent) {
    throw new Error('Choose a valid workflow action before saving this post.');
  }

  assertWorkflowPermission(user, existingPost, normalizedIntent);

  if (normalizedIntent === BLOG_WORKFLOW_INTENT.DELETE) {
    if (!existingPost?.id) {
      throw new Error('Only existing articles can be deleted.');
    }

    await deleteBlog(existingPost.id);

    return {
      notice: buildNotice(normalizedIntent),
      redirectPath: `/admin/blogs?notice=${encodeURIComponent(buildNotice(normalizedIntent))}`
    };
  }

  const status = resolveStatusForIntent(normalizedIntent, existingPost);
  const payload = {
    ...input,
    status,
    authorId: existingPost?.authorId || user.id,
    featured: user.role === BLOG_USER_ROLE.ADMIN ? Boolean(input.featured) : existingPost?.featured || false
  };

  const blog = existingPost?.id
    ? await updateBlog(existingPost.id, payload)
    : await createBlog(payload);

  const notice = buildNotice(normalizedIntent);
  return {
    blog,
    notice,
    redirectPath: `${buildBlogEditorPath(blog.id)}?notice=${encodeURIComponent(notice)}`
  };
}

