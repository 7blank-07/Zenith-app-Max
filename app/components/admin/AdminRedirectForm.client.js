'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { submitRedirectAction, deleteRedirectAction } from '../../actions/redirects';
import styles from './AdminShell.module.css';
import { useRouter } from 'next/navigation';

function SubmitButton({ isEditing }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={styles.button}>
      {pending ? 'Saving...' : (isEditing ? 'Save changes' : 'Create redirect')}
    </button>
  );
}

export default function AdminRedirectForm({ redirectData = null }) {
  const [formState, formAction] = useFormState(submitRedirectAction, null);
  const router = useRouter();

  async function handleDelete() {
    if (confirm('Are you sure you want to delete this redirect?')) {
      await deleteRedirectAction(redirectData.id);
    }
  }

  return (
    <form action={formAction} className={styles.formPanel}>
      {formState?.error && (
        <div className={styles.notice} style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
          {formState.error}
        </div>
      )}

      {redirectData && <input type="hidden" name="id" value={redirectData.id} />}

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="oldUrl">
          Old URL
          <span className={styles.helpText}>The broken or outdated path (e.g., /old-page or /blogs/old-slug)</span>
        </label>
        <input
          type="text"
          id="oldUrl"
          name="oldUrl"
          className={styles.input}
          defaultValue={redirectData?.oldUrl || ''}
          placeholder="/old-path"
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="newUrl">
          New URL
          <span className={styles.helpText}>Where the user should be redirected (e.g., /new-page)</span>
        </label>
        <input
          type="text"
          id="newUrl"
          name="newUrl"
          className={styles.input}
          defaultValue={redirectData?.newUrl || ''}
          placeholder="/new-path"
          required
        />
      </div>

      <div className={styles.formActions}>
        <Link href="/admin/redirects" className={styles.buttonGhost}>
          Cancel
        </Link>
        {redirectData && (
          <button type="button" onClick={handleDelete} className={styles.buttonDanger}>
            Delete
          </button>
        )}
        <div style={{ flex: 1 }} />
        <SubmitButton isEditing={!!redirectData} />
      </div>
    </form>
  );
}
