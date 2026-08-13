import { BLOG_USER_ROLE } from './constants.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function resolveRole(input) {
  if (input && typeof input === 'object') {
    return input.role;
  }

  return input;
}

export function isBlogAdmin(input) {
  return toText(resolveRole(input)).toLowerCase() === BLOG_USER_ROLE.ADMIN;
}

export function isBlogEditor(input) {
  const role = toText(resolveRole(input)).toLowerCase();
  return role === BLOG_USER_ROLE.ADMIN || role === BLOG_USER_ROLE.EDITOR;
}

export function canAccessBlogAdmin(user) {
  return Boolean(user?.isActive) && isBlogEditor(user);
}

export function canEditBlogPosts(user) {
  return canAccessBlogAdmin(user);
}

export function canReviewBlogPosts(user) {
  return Boolean(user?.isActive) && isBlogAdmin(user);
}

export function getBlogRoleDescription(role) {
  return isBlogAdmin(role)
    ? 'Admins can review submissions, publish articles, reject posts, and delete content.'
    : 'Editors can build drafts, update their content, submit articles for review, and publish articles.';
}

export function assertBlogPermission(user, permission) {
  if (permission === 'admin-access' && canAccessBlogAdmin(user)) {
    return;
  }

  if (permission === 'edit-blogs' && canEditBlogPosts(user)) {
    return;
  }

  if (permission === 'review-blogs' && canReviewBlogPosts(user)) {
    return;
  }

  throw new Error(`Permission "${permission}" was denied for the current blog admin user.`);
}
