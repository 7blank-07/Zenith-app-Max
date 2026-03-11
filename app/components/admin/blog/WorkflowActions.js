'use client';

import { useFormStatus } from 'react-dom';
import styles from './BlogEditor.module.css';

function ActionButton({ intent, label, tone = 'secondary', confirmMessage }) {
  const { pending } = useFormStatus();
  const className =
    tone === 'primary'
      ? styles.actionButton
      : tone === 'danger'
        ? styles.dangerButton
        : styles.secondaryButton;

  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      className={className}
      disabled={pending}
      onClick={
        confirmMessage
          ? (event) => {
              if (!window.confirm(confirmMessage)) {
                event.preventDefault();
              }
            }
          : undefined
      }
    >
      {pending ? 'Saving...' : label}
    </button>
  );
}

export default function WorkflowActions({
  status,
  capabilities,
  hasExistingPost,
  publicHref
}) {
  return (
    <section className={styles.card}>
      <div className={styles.workflowBody}>
        <div className={styles.workflowHeader}>
          <div>
            <h2 className={styles.cardTitle}>Workflow actions</h2>
            <p className={styles.cardDescription}>
              Move this article through the editorial flow without leaving the editor.
            </p>
          </div>
          <span className={styles.statusPill}>{status || 'draft'}</span>
        </div>

        <div className={styles.workflowActions}>
          {capabilities.canSaveDraft ? <ActionButton intent="save-draft" label="Save draft" tone="secondary" /> : null}
          {capabilities.canSubmitReview ? <ActionButton intent="submit-review" label="Submit for review" tone="primary" /> : null}
          {capabilities.canApprove ? <ActionButton intent="approve" label="Approve" tone="primary" /> : null}
          {capabilities.canPublish ? (
            <ActionButton
              intent="publish"
              label={status === 'published' ? 'Publish updates' : 'Publish'}
              tone="primary"
            />
          ) : null}
          {capabilities.canReject ? <ActionButton intent="reject" label="Reject" tone="danger" /> : null}
          {capabilities.canDelete && hasExistingPost ? (
            <ActionButton
              intent="delete"
              label="Delete"
              tone="danger"
              confirmMessage="Delete this article permanently?"
            />
          ) : null}
        </div>

        {publicHref ? (
          <div className={styles.publicLinkRow}>
            <a href={publicHref} target="_blank" rel="noreferrer" className={styles.linkButton}>
              Open public article
            </a>
            <span className={styles.fieldHint}>Published articles stay live on the public blog routes immediately because those pages are dynamic right now.</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

