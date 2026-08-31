'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';
import {
  createRedirect,
  updateRedirect,
  deleteRedirect,
  getRedirectById
} from '../../src/lib/server/redirects/repository.mjs';

export async function submitRedirectAction(previousState, formData) {
  // Only admins can manage redirects
  await requireBlogSessionUser({ nextPath: '/admin', permission: 'admin-access' });

  const id = formData.get('id');
  const oldUrl = formData.get('oldUrl')?.toString()?.trim();
  const newUrl = formData.get('newUrl')?.toString()?.trim();

  if (!oldUrl || !newUrl) {
    return { error: 'Both Old URL and New URL are required.' };
  }

  if (oldUrl === newUrl) {
    return { error: 'Old URL and New URL cannot be the same.' };
  }

  try {
    if (id) {
      await updateRedirect(id, { oldUrl, newUrl });
    } else {
      await createRedirect({ oldUrl, newUrl });
    }
    
    revalidatePath('/admin/redirects');
    revalidatePath('/api/internal/redirects');
  } catch (error) {
    console.error('[actions/redirects] error saving redirect', error);
    return { error: 'Failed to save redirect. The Old URL may already be in use.' };
  }

  // Must be outside of try-catch block in Next.js!
  redirect('/admin/redirects');
}

export async function deleteRedirectAction(id) {
  await requireBlogSessionUser({ nextPath: '/admin', permission: 'admin-access' });
  
  if (!id) return { error: 'Invalid ID' };
  
  try {
    await deleteRedirect(id);
    revalidatePath('/admin/redirects');
    revalidatePath('/api/internal/redirects');
  } catch (error) {
    console.error('[actions/redirects] error deleting redirect', error);
    return { error: 'Failed to delete redirect.' };
  }

  // Must be outside of try-catch block in Next.js!
  redirect('/admin/redirects');
}
