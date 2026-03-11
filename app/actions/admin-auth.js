'use server';

import { redirect } from 'next/navigation';
import {
  authenticateBlogUser,
  clearBlogSession,
  createBlogSession,
  getBlogAuthAvailability
} from '../../src/lib/server/blog/auth.mjs';
import { normalizeAdminNextPath } from '../../src/lib/server/blog/session.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

export async function loginAdminAction(previousState, formData) {
  const email = toText(formData.get('email'));
  const password = toText(formData.get('password'));
  const nextPath = normalizeAdminNextPath(formData.get('next'), '/admin/blogs');

  if (!getBlogAuthAvailability().isConfigured) {
    return {
      email,
      error: 'Blog admin auth is not configured yet. Set the required environment variables first.'
    };
  }

  if (!email || !password) {
    return {
      email,
      error: 'Enter both email and password to continue.'
    };
  }

  const user = await authenticateBlogUser({ email, password });

  if (!user) {
    return {
      email,
      error: 'Invalid email or password.'
    };
  }

  await createBlogSession(user);
  redirect(nextPath);
}

export async function logoutAdminAction() {
  await clearBlogSession();
  redirect('/admin');
}
