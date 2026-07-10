'use server';

import { getBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8001/api/panel'; // Prevent IPv6 resolution errors in fetch

async function requireAuth() {
  const user = await getBlogSessionUser();
  if (!user) throw new Error('Unauthorized access');
  return user;
}

export async function fetchPlaystylesAction() {
  await requireAuth();
  try {
    const res = await fetch(`${FASTAPI_URL}/playstyles`, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error('Failed to fetch playstyles');
    return await res.json();
  } catch (error) {
    console.error('fetchPlaystylesAction failed:', error);
    return { playstyles: [] };
  }
}

export async function updatePlaystyleAction(data) {
  await requireAuth();
  try {
    const res = await fetch(`${FASTAPI_URL}/playstyles/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update playstyle');
    return await res.json();
  } catch (error) {
    console.error('updatePlaystyleAction failed:', error);
    throw error;
  }
}

export async function fetchTraitsAction() {
  await requireAuth();
  try {
    const res = await fetch(`${FASTAPI_URL}/traits`, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error('Failed to fetch traits');
    return await res.json();
  } catch (error) {
    console.error('fetchTraitsAction failed:', error);
    return { traits: [] };
  }
}

export async function updateTraitAction(data) {
  await requireAuth();
  try {
    const res = await fetch(`${FASTAPI_URL}/traits/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update trait');
    return await res.json();
  } catch (error) {
    console.error('updateTraitAction failed:', error);
    throw error;
  }
}

export async function updatePlayerAction(id, data) {
  await requireAuth();
  try {
    const res = await fetch(`${FASTAPI_URL}/players/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update player');
    return await res.json();
  } catch (error) {
    console.error('updatePlayerAction failed:', error);
    throw error;
  }
}

export async function createPlayerAction(data) {
  await requireAuth();
  try {
    const res = await fetch(`${FASTAPI_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create player');
    return await res.json();
  } catch (error) {
    console.error('createPlayerAction failed:', error);
    throw error;
  }
}

export async function deletePlayerAction(id) {
  await requireAuth();
  try {
    const res = await fetch(`${FASTAPI_URL}/players/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete player');
    return await res.json();
  } catch (error) {
    console.error('deletePlayerAction failed:', error);
    throw error;
  }
}

export async function bulkDeletePlayersAction(data) {
  await requireAuth();
  try {
    const res = await fetch(`${FASTAPI_URL}/players/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to bulk delete players');
    }
    return await res.json();
  } catch (error) {
    console.error('bulkDeletePlayersAction failed:', error);
    throw error;
  }
}
