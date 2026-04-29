'use client';

import { useFormState } from 'react-dom';
import { submitRedeemCodeEditorAction } from '../../../actions/redeem-code-editor';
import styles from '../AdminShell.module.css';

const INITIAL_FORM_STATE = Object.freeze({
  error: '',
  fieldErrors: {}
});

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function RedeemCodeEditor({ entry = null, scopeOptions = [], notice = '' }) {
  const [formState, formAction] = useFormState(submitRedeemCodeEditorAction, INITIAL_FORM_STATE);

  return (
    <section className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <h2 className={styles.tableTitle}>{entry ? 'Edit redeem code' : 'Publish redeem code'}</h2>
          <p className={styles.tableDescription}>
            Publishing an active code automatically expires the previous active code in the same scope.
          </p>
        </div>
      </div>

      {notice ? <div className={styles.noticeBanner}>{notice}</div> : null}
      {formState.error ? <p className={styles.error}>{formState.error}</p> : null}

      <form action={formAction} className={styles.form}>
        <input type="hidden" name="redeemCodeId" value={entry?.id || ''} />

        <label className={styles.field}>
          <span className={styles.label}>Redeem code name</span>
          <input className={styles.input} name="title" defaultValue={entry?.title || ''} required />
          {formState.fieldErrors?.title ? <p className={styles.error}>{formState.fieldErrors.title}</p> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Redeem code</span>
          <input className={styles.input} name="codeValue" defaultValue={entry?.codeValue || ''} required />
          {formState.fieldErrors?.codeValue ? <p className={styles.error}>{formState.fieldErrors.codeValue}</p> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Country scope</span>
          <select className={styles.select} name="scope" defaultValue={entry?.scope || 'global'}>
            {scopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formState.fieldErrors?.scope ? <p className={styles.error}>{formState.fieldErrors.scope}</p> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Status</span>
          <select className={styles.select} name="status" defaultValue={entry?.status || 'active'}>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          {formState.fieldErrors?.status ? <p className={styles.error}>{formState.fieldErrors.status}</p> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Publish date</span>
          <input className={styles.input} type="datetime-local" name="publishedAt" defaultValue={toDateTimeLocal(entry?.publishedAt)} required />
          {formState.fieldErrors?.publishedAt ? <p className={styles.error}>{formState.fieldErrors.publishedAt}</p> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Expiry date</span>
          <input className={styles.input} type="datetime-local" name="expiresAt" defaultValue={toDateTimeLocal(entry?.expiresAt)} />
          {formState.fieldErrors?.expiresAt ? <p className={styles.error}>{formState.fieldErrors.expiresAt}</p> : null}
        </label>

        <div className={styles.filterActions}>
          <button type="submit" name="intent" value="save" className={styles.button}>
            {entry ? 'Update code' : 'Publish code'}
          </button>
          {entry ? (
            <button type="submit" name="intent" value="delete" className={styles.buttonSecondary}>
              Delete code
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
