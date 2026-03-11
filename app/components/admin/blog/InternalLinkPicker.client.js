'use client';

import styles from './BlogEditor.module.css';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function normalizeItems(items) {
  return Array.isArray(items)
    ? items.map((item) => ({
        label: toText(item?.label),
        href: toText(item?.href),
        title: toText(item?.title)
      }))
    : [];
}

export default function InternalLinkPicker({
  name,
  label,
  description,
  placeholder,
  value = [],
  onChange
}) {
  const items = normalizeItems(value);

  function updateItem(index, key, nextValue) {
    const nextItems = items.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            [key]: nextValue
          }
        : item
    );

    onChange(nextItems);
  }

  function addItem() {
    onChange([
      ...items,
      {
        label: '',
        href: '',
        title: ''
      }
    ]);
  }

  function removeItem(index) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className={styles.listManager}>
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div className={styles.field}>
        <span className={styles.label}>{label}</span>
        <p className={styles.fieldHint}>{description}</p>
      </div>

      <div className={styles.linkRows}>
        {items.map((item, index) => (
          <div key={`${name}-${index}`} className={styles.linkRow}>
            <label className={styles.field}>
              <span className={styles.label}>Label</span>
              <input
                className={styles.input}
                value={item.label}
                onChange={(event) => updateItem(index, 'label', event.target.value)}
                placeholder="Optional label"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>URL</span>
              <input
                className={styles.input}
                value={item.href}
                onChange={(event) => updateItem(index, 'href', event.target.value)}
                placeholder={placeholder}
              />
            </label>

            <button type="button" className={styles.removeButton} onClick={() => removeItem(index)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <button type="button" className={styles.addButton} onClick={addItem}>
        Add link
      </button>
    </div>
  );
}

