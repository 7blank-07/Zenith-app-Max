export function buildStreamRevalidationPaths({ previousStream = null, nextStream = null } = {}) {
  const paths = new Set();
  paths.add('/');
  paths.add('/streaming');

  if (previousStream?.slug) {
    paths.add(`/streaming/${previousStream.slug}`);
  }

  if (nextStream?.slug) {
    paths.add(`/streaming/${nextStream.slug}`);
  }

  return [...paths];
}
