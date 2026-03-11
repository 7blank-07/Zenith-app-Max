'use client';

import { useFormState, useFormStatus } from 'react-dom';
import styles from './AdminShell.module.css';

const INITIAL_STATE = Object.freeze({
  email: '',
  error: ''
});

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.button} disabled={pending}>
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  );
}

export default function AdminLoginForm({ action, nextPath = '/admin/blogs' }) {
  const [state, formAction] = useFormState(action, INITIAL_STATE);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="next" value={nextPath} />

      <label className={styles.field}>
        <span className={styles.label}>Admin email</span>
        <input
          className={styles.input}
          type="email"
          name="email"
          defaultValue={state.email}
          autoComplete="email"
          placeholder="editor@zenithfcm.com"
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Password</span>
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          required
        />
      </label>

      {state.error ? (
        <p className={styles.error}>{state.error}</p>
      ) : (
        <p className={styles.note}>Use the seeded admin or editor credentials to open the CMS dashboard.</p>
      )}

      <SubmitButton />
    </form>
  );
}
