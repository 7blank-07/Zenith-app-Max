import Link from 'next/link';
import styles from './BlogLayout.module.css';

export default function BlogCategoryTabs({ categories = [], activeCategorySlug = '' }) {
  const normalizedActive = String(activeCategorySlug || '').trim().toLowerCase();

  return (
    <nav className={styles.categoryTabs} aria-label="Blog categories">
      <Link
        href="/blogs"
        className={`${styles.categoryTab} ${!normalizedActive ? styles.categoryTabActive : ''}`.trim()}
      >
        All posts
      </Link>

      {categories.map((category) => (
        <Link
          key={category.id || category.slug}
          href={`/blogs/${encodeURIComponent(category.slug)}`}
          className={`${styles.categoryTab} ${normalizedActive === category.slug ? styles.categoryTabActive : ''}`.trim()}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
