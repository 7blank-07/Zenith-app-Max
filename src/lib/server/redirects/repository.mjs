import { runBlogQuery } from '../blog/db.mjs';

const LIST_REDIRECTS_QUERY = `
  SELECT id, old_url, new_url, created_at, updated_at
  FROM url_redirects
  ORDER BY created_at DESC
`;

const GET_REDIRECT_BY_ID_QUERY = `
  SELECT id, old_url, new_url, created_at, updated_at
  FROM url_redirects
  WHERE id = $1
`;

const GET_REDIRECT_BY_OLD_URL_QUERY = `
  SELECT id, old_url, new_url, created_at, updated_at
  FROM url_redirects
  WHERE old_url = $1
`;

const INSERT_REDIRECT_QUERY = `
  INSERT INTO url_redirects (old_url, new_url)
  VALUES ($1, $2)
  RETURNING id, old_url, new_url, created_at, updated_at
`;

const UPDATE_REDIRECT_QUERY = `
  UPDATE url_redirects
  SET old_url = $1, new_url = $2, updated_at = NOW()
  WHERE id = $3
  RETURNING id, old_url, new_url, created_at, updated_at
`;

const DELETE_REDIRECT_QUERY = `
  DELETE FROM url_redirects
  WHERE id = $1
`;

function serializeRedirectRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    oldUrl: row.old_url,
    newUrl: row.new_url,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
  };
}

export async function listRedirects() {
  const result = await runBlogQuery(LIST_REDIRECTS_QUERY);
  return result.rows.map(serializeRedirectRow);
}

export async function getRedirectById(id) {
  const result = await runBlogQuery(GET_REDIRECT_BY_ID_QUERY, [id]);
  return serializeRedirectRow(result.rows[0]);
}

export async function getRedirectByOldUrl(oldUrl) {
  const result = await runBlogQuery(GET_REDIRECT_BY_OLD_URL_QUERY, [oldUrl]);
  return serializeRedirectRow(result.rows[0]);
}

function normalizeUrlPath(input) {
  let urlStr = input.trim();
  
  // If user pastes a domain without http:// (e.g. zenithfcm.com/path or localhost:3000/path)
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://') && !urlStr.startsWith('/')) {
    if (urlStr.includes('localhost') || urlStr.includes('.com') || urlStr.includes('.net') || urlStr.includes('zenithfcm')) {
      urlStr = `http://${urlStr}`;
    }
  }

  if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
    try {
      const parsed = new URL(urlStr);
      return parsed.pathname;
    } catch (e) {
      // fallback
    }
  }
  
  if (!urlStr.startsWith('/')) {
    urlStr = `/${urlStr}`;
  }
  
  // strip query params or hashes to ensure strict pathname matching in middleware
  const qIndex = urlStr.indexOf('?');
  if (qIndex !== -1) {
    urlStr = urlStr.substring(0, qIndex);
  }
  
  const hashIndex = urlStr.indexOf('#');
  if (hashIndex !== -1) {
    urlStr = urlStr.substring(0, hashIndex);
  }

  return urlStr;
}

function normalizeNewUrl(input) {
  let urlStr = input.trim();
  
  if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
    try {
      const parsed = new URL(urlStr);
      if (parsed.hostname.includes('zenithfcm.com') || parsed.hostname.includes('localhost')) {
        return parsed.pathname;
      }
      return urlStr; // External link
    } catch (e) {}
  }

  if (!urlStr.startsWith('http') && !urlStr.startsWith('/')) {
    if (urlStr.includes('zenithfcm.com') || urlStr.includes('localhost')) {
      return normalizeUrlPath(urlStr); // Extract path for internal domains
    } else if (urlStr.includes('.com') || urlStr.includes('.net') || urlStr.includes('.org')) {
      return `https://${urlStr}`; // Assume external link
    } else {
      return `/${urlStr}`; // Assume relative path
    }
  }

  return urlStr;
}

export async function createRedirect({ oldUrl, newUrl }) {
  const normalizedOld = normalizeUrlPath(oldUrl);
  const normalizedNew = normalizeNewUrl(newUrl);

  // Before inserting, check if oldUrl already exists and update if so, or just let DB handle unique constraint error
  try {
    const existing = await getRedirectByOldUrl(normalizedOld);
    if (existing) {
      return await updateRedirect(existing.id, { oldUrl: normalizedOld, newUrl: normalizedNew });
    }

    const result = await runBlogQuery(INSERT_REDIRECT_QUERY, [normalizedOld, normalizedNew]);
    return serializeRedirectRow(result.rows[0]);
  } catch (error) {
    throw new Error(`Failed to create redirect: ${error.message}`);
  }
}

export async function updateRedirect(id, { oldUrl, newUrl }) {
  const normalizedOld = normalizeUrlPath(oldUrl);
  const normalizedNew = normalizeNewUrl(newUrl);

  const result = await runBlogQuery(UPDATE_REDIRECT_QUERY, [normalizedOld, normalizedNew, id]);
  return serializeRedirectRow(result.rows[0]);
}

export async function deleteRedirect(id) {
  await runBlogQuery(DELETE_REDIRECT_QUERY, [id]);
  return true;
}
