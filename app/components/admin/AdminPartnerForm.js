'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import styles from './AdminShell.module.css';
import { PARTNER_PLATFORM_VALUES } from '../../../src/lib/server/partners/constants.mjs';

function SubmitButton({ partnerId, isDeleting }) {
  const { pending } = useFormStatus();
  const label = partnerId ? 'Save partner changes' : 'Create new partner';

  return (
    <button
      type="submit"
      disabled={pending || isDeleting}
      className={styles.button}
      name="intent"
      value="save"
    >
      {pending && !isDeleting ? 'Processing...' : label}
    </button>
  );
}

function DeleteButton({ partnerId, isDeleting, setIsDeleting }) {
  const { pending } = useFormStatus();

  if (isDeleting) {
    return (
      <div className={styles.deleteConfirmRow}>
        <p className={styles.tableDescription}>Are you sure? This action cannot be undone.</p>
        <button
          type="submit"
          disabled={pending}
          className={styles.buttonDanger}
          name="intent"
          value="delete"
        >
          {pending ? 'Deleting...' : 'Confirm delete'}
        </button>
        <button
          type="button"
          disabled={pending}
          className={styles.buttonSecondary}
          onClick={() => setIsDeleting(false)}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      className={styles.buttonDanger}
      onClick={() => setIsDeleting(true)}
    >
      Delete partner
    </button>
  );
}

export default function AdminPartnerForm({ action, partner = {}, error: externalError }) {
  const [state, formAction] = useFormState(action, {
    error: externalError || null,
    fieldErrors: {}
  });
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <form action={formAction} className={styles.editorForm}>
      <input type="hidden" name="partnerId" value={partner.id || ''} />

      {state.error ? <div className={styles.errorBanner}>{state.error}</div> : null}

      <div className={styles.formGrid}>
        <section className={styles.formSection}>
          <h3 className={styles.tableTitle}>Basic Information</h3>
          
          <label className={styles.field}>
            <span className={styles.label}>Name *</span>
            <input
              className={styles.input}
              type="text"
              name="name"
              defaultValue={partner.name || ''}
              placeholder="e.g. Zenith Creator"
              required
            />
            {state.fieldErrors?.name ? <span className={styles.fieldError}>{state.fieldErrors.name}</span> : null}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Username</span>
            <input
              className={styles.input}
              type="text"
              name="username"
              defaultValue={partner.username || ''}
              placeholder="e.g. @zenith_fc"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Platform *</span>
            <select className={styles.select} name="platform" defaultValue={partner.platform || 'youtube'} required>
              {PARTNER_PLATFORM_VALUES.map((platform) => (
                <option key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </option>
              ))}
            </select>
            {state.fieldErrors?.platform ? <span className={styles.fieldError}>{state.fieldErrors.platform}</span> : null}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Social URL *</span>
            <input
              className={styles.input}
              type="url"
              name="socialUrl"
              defaultValue={partner.socialUrl || ''}
              placeholder="https://youtube.com/@..."
              required
            />
            {state.fieldErrors?.socialUrl ? <span className={styles.fieldError}>{state.fieldErrors.socialUrl}</span> : null}
          </label>
        </section>

        <section className={styles.formSection}>
          <h3 className={styles.tableTitle}>Media & Bio</h3>
          
          <label className={styles.field}>
            <span className={styles.label}>Avatar/Logo URL</span>
            <input
              className={styles.input}
              type="text"
              name="avatarUrl"
              defaultValue={partner.avatarUrl || ''}
              placeholder="https://..."
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Follower Count</span>
            <input
              className={styles.input}
              type="text"
              name="followerCount"
              defaultValue={partner.followerCount || ''}
              placeholder="e.g. 100K Subscribers"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Bio</span>
            <textarea
              className={styles.textarea}
              name="bio"
              defaultValue={partner.bio || ''}
              placeholder="Brief description of the partner..."
              rows={4}
            />
          </label>
        </section>

        <section className={styles.formSection}>
          <h3 className={styles.tableTitle}>Settings</h3>
          
          <div className={styles.checkboxField}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="featured"
                defaultChecked={partner.featured}
              />
              <span className={styles.label}>Featured Partner</span>
            </label>
            <p className={styles.fieldHint}>Featured partners appear first and have a premium card style.</p>
          </div>

          <div className={styles.checkboxField}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="verified"
                defaultChecked={partner.verified}
              />
              <span className={styles.label}>Verified Badge</span>
            </label>
            <p className={styles.fieldHint}>Display a verified checkmark next to the name.</p>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Display Order</span>
            <input
              className={styles.input}
              type="number"
              name="displayOrder"
              defaultValue={partner.displayOrder || 0}
            />
            <p className={styles.fieldHint}>Lower numbers appear first.</p>
          </label>
        </section>
      </div>

      <div className={styles.formActions}>
        <div className={styles.actionRow}>
          <SubmitButton partnerId={partner.id} isDeleting={isDeleting} />
          <Link href="/admin/partners" className={styles.buttonSecondary}>
            Cancel
          </Link>
        </div>

        {partner.id ? (
          <div className={styles.dangerZone}>
            <h4 className={styles.tableTitle}>Danger zone</h4>
            <DeleteButton 
              partnerId={partner.id} 
              isDeleting={isDeleting} 
              setIsDeleting={setIsDeleting} 
            />
          </div>
        ) : null}
      </div>
    </form>
  );
}
