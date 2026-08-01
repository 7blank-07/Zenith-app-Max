'use client';

import CopyCodeButton from './CopyCodeButton.client';
import styles from './RedeemCodeHomeWidget.module.css';

export default function RedeemCodeHomeWidget({ codeEntry }) {
  const codeValue = codeEntry?.codeValue || '';

  return (
    <section className={styles.section} aria-label="Latest FC Mobile redeem code">
      <p className={styles.srOnly}>Latest FC Mobile redeem codes updated weekly.</p>
      <div className={styles.row}>
        <div className={styles.left}>
          <span className={styles.eyebrow}>
            <span className={styles.dot} />
            LIVE REDEEM CODE
          </span>
          <h2 className={styles.title}>FC Mobile Redeem Codes</h2>
          <p className={styles.subtext}>Redeem codes to earn exclusive rewards.</p>
        </div>

        <div className={styles.right}>
          {codeValue ? (
            <>
              <span className={styles.codeValue} title={codeValue} role="status" aria-label={`Active redeem code ${codeValue}`}>
                <span translate="no" className="notranslate">{codeValue}</span>
              </span>
              <CopyCodeButton codeValue={codeValue} className={styles.copyButton} copiedLabel="Copied" idleLabel="Copy" redirectHref="/fc-mobile-redeem-codes" />
            </>
          ) : (
            <p className={styles.empty}>No active redeem code currently.</p>
          )}
        </div>
      </div>
    </section>
  );
}
