'use client';

import { useFormState } from 'react-dom';
import { submitStreamEditorAction } from '../../../actions/stream-editor';
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

export default function StreamEditor({ entry = null, notice = '' }) {
  const [formState, formAction] = useFormState(submitStreamEditorAction, INITIAL_FORM_STATE);

  return (
    <section className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <h2 className={styles.tableTitle}>{entry ? 'Edit stream' : 'Create stream'}</h2>
          <p className={styles.tableDescription}>
            Manage stream details. Set to &quot;Live&quot; and check &quot;Featured&quot; to show on the homepage.
          </p>
        </div>
      </div>

      {notice ? <div className={styles.noticeBanner}>{notice}</div> : null}
      {formState.error ? <p className={styles.error}>{formState.error}</p> : null}

      <form action={formAction} className={styles.form}>
        <input type="hidden" name="streamId" value={entry?.id || ''} />

        <label className={styles.field}>
          <span className={styles.label}>Stream Title</span>
          <input className={styles.input} name="title" defaultValue={entry?.title || ''} required />
          {formState.fieldErrors?.title ? <p className={styles.error}>{formState.fieldErrors.title}</p> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Slug (optional, auto-generated from title)</span>
          <input className={styles.input} name="slug" defaultValue={entry?.slug || ''} />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>YouTube Video/Live ID</span>
          <input className={styles.input} name="youtubeId" defaultValue={entry?.youtubeId || ''} required />
          <span className={styles.helpText}>Just the ID (e.g. &quot;dQw4w9WgXcQ&quot;), not the full URL.</span>
          {formState.fieldErrors?.youtubeId ? <p className={styles.error}>{formState.fieldErrors.youtubeId}</p> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Status</span>
          <select className={styles.select} name="status" defaultValue={entry?.status || 'upcoming'}>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="replay">Replay</option>
          </select>
          {formState.fieldErrors?.status ? <p className={styles.error}>{formState.fieldErrors.status}</p> : null}
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label className={styles.field}>
            <span className={styles.label}>Tournament / Event Name</span>
            <input className={styles.input} name="tournamentName" defaultValue={entry?.tournamentName || ''} />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Match Stage</span>
            <select className={styles.select} name="matchStage" defaultValue={entry?.matchStage || ''}>
              <option value="">Select stage...</option>
              <option value="Group Stage">Group Stage</option>
              <option value="Quarterfinal">Quarterfinal</option>
              <option value="Semifinal">Semifinal</option>
              <option value="Final">Final</option>
              <option value="Community">Community</option>
              <option value="Other">Other</option>
            </select>
            {formState.fieldErrors?.matchStage ? <p className={styles.error}>{formState.fieldErrors.matchStage}</p> : null}
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label className={styles.field}>
            <span className={styles.label}>Match Date & Time</span>
            <input className={styles.input} type="datetime-local" name="matchDate" defaultValue={toDateTimeLocal(entry?.matchDate)} />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Host / Streamer</span>
            <input className={styles.input} name="hostName" defaultValue={entry?.hostName || ''} />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Participants (e.g. Player A vs Player B)</span>
          <input className={styles.input} name="participants" defaultValue={entry?.participants || ''} />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Description</span>
          <textarea className={styles.textarea} name="description" defaultValue={entry?.description || ''} rows={4} />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Discord Invite/Join Link</span>
          <input className={styles.input} name="discordLink" defaultValue={entry?.discordLink || ''} />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Tags (comma-separated)</span>
          <input className={styles.input} name="tags" defaultValue={entry?.tags?.join(', ') || ''} />
        </label>

        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <label className={styles.checkboxLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" name="featured" defaultChecked={entry?.featured} />
            <span className={styles.label}>Featured (Hero section)</span>
          </label>
          <label className={styles.checkboxLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" name="homepageVisible" defaultChecked={entry?.homepageVisible ?? true} />
            <span className={styles.label}>Visible on Homepage</span>
          </label>
        </div>

        <div className={styles.filterActions}>
          <button type="submit" name="intent" value="save" className={styles.button}>
            {entry ? 'Update stream' : 'Create stream'}
          </button>
          {entry ? (
            <button type="submit" name="intent" value="delete" className={styles.buttonSecondary} style={{ color: 'red' }}>
              Delete stream
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
