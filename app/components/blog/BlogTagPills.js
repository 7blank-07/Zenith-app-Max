import Link from 'next/link';
import styles from './BlogLayout.module.css';

export default function BlogTagPills({ tags = [] }) {
  if (!Array.isArray(tags) || !tags.length) return null;

  return (
    <div className={styles.tagPills}>
      {tags.map((tag) => (
        <Link key={tag.id || tag.slug} href={`/blogs/tag/${encodeURIComponent(tag.slug)}`} className={styles.tagPill}>
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
