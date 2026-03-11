'use client';

import { useState } from 'react';
import styles from './BlogEditor.module.css';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

export default function TagSelector({
  name,
  label,
  values = [],
  placeholder,
  hint,
  onChange
}) {
  const [draftValue, setDraftValue] = useState('');

  function commitValue(value) {
    const nextValue = toText(value);
    if (!nextValue) return;

    const deduped = new Map(values.map((entry) => [entry.toLowerCase(), entry]));
    if (!deduped.has(nextValue.toLowerCase())) {
      deduped.set(nextValue.toLowerCase(), nextValue);
      onChange([...deduped.values()]);
    }
    setDraftValue('');
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ',') {
      return;
    }

    event.preventDefault();
    commitValue(draftValue);
  }

  function removeValue(value) {
    onChange(values.filter((entry) => entry.toLowerCase() !== value.toLowerCase()));
  }

  return (
    <div className={styles.listManager}>
      <input type="hidden" name={name} value={JSON.stringify(values)} />

      <label className={styles.field}>
        <span className={styles.label}>{label}</span>
        <div className={styles.linkRowCompact}>
          <input
            className={styles.input}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
          />
          <button type="button" className={styles.addButton} onClick={() => commitValue(draftValue)}>
            Add
          </button>
        </div>
      </label>

      {hint ? <p className={styles.fieldHint}>{hint}</p> : null}

      {values.length ? (
        <div className={styles.chipList}>
          {values.map((value) => (
            <span key={value} className={styles.chip}>
              {value}
              <button type="button" className={styles.chipButton} onClick={() => removeValue(value)} aria-label={`Remove ${value}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

