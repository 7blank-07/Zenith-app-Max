'use client';

import { useState } from 'react';
import { fixSinglePlayerImageAction } from '../../actions/admin-auto-fixer';
import styles from './AdminAutoFixer.module.css';

export default function AdminAutoFixerTool() {
  const [urlsInput, setUrlsInput] = useState('');
  const [options, setOptions] = useState({
    playerImage: true,
    cardBackground: true,
    nationFlag: false,
    clubFlag: false,
    leagueImage: false
  });
  
  const [tasks, setTasks] = useState([]);
  const [processing, setProcessing] = useState(false);

  const handleOptionChange = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStart = async () => {
    const rawUrls = urlsInput.split('\n').map(u => u.trim()).filter(Boolean);
    if (!rawUrls.length) return;

    const initialTasks = rawUrls.map(url => ({
      url,
      status: 'pending', // pending, processing, success, error
      details: null,
      errorMsg: null
    }));

    setTasks(initialTasks);
    setProcessing(true);

    for (let i = 0; i < initialTasks.length; i++) {
      const task = initialTasks[i];
      
      setTasks(prev => {
        const next = [...prev];
        next[i].status = 'processing';
        return next;
      });

      try {
        const res = await fixSinglePlayerImageAction(task.url, options);
        
        if (res.error) {
          setTasks(prev => {
            const next = [...prev];
            next[i].status = 'error';
            next[i].errorMsg = res.error;
            return next;
          });
        } else {
          setTasks(prev => {
            const next = [...prev];
            // Check if any sub-tasks failed
            const hasError = res.results.some(r => r.status === 'error');
            next[i].status = hasError ? 'error' : 'success';
            next[i].details = res.results;
            if (hasError) {
                next[i].errorMsg = 'Some images failed to upload.';
            }
            return next;
          });
        }
      } catch (err) {
        setTasks(prev => {
          const next = [...prev];
          next[i].status = 'error';
          next[i].errorMsg = err.message || 'Network error';
          return next;
        });
      }
    }

    setProcessing(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Bulk Auto-Fixer</h2>
      <p className={styles.description}>
        Paste Zenith player URLs (one per line). The system will automatically scrape the correct images from Renderz and re-upload them to fix broken card visuals.
      </p>

      <div className={styles.layout}>
        <div className={styles.inputGroup}>
          <textarea
            className={styles.textarea}
            placeholder={`https://zenithfcm.com/player/dalglish-121-9780629\nhttps://zenithfcm.com/player/isco-119-9421425`}
            value={urlsInput}
            onChange={(e) => setUrlsInput(e.target.value)}
            disabled={processing}
          />
        </div>

        <div className={styles.optionsGroup}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} checked={options.playerImage} onChange={() => handleOptionChange('playerImage')} disabled={processing} />
            Player Image
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} checked={options.cardBackground} onChange={() => handleOptionChange('cardBackground')} disabled={processing} />
            Card Background
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} checked={options.nationFlag} onChange={() => handleOptionChange('nationFlag')} disabled={processing} />
            Nation Flag
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} checked={options.clubFlag} onChange={() => handleOptionChange('clubFlag')} disabled={processing} />
            Club Flag
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} checked={options.leagueImage} onChange={() => handleOptionChange('leagueImage')} disabled={processing} />
            League Image
          </label>
        </div>

        <div className={styles.buttonRow}>
          <button 
            className={styles.startButton} 
            onClick={handleStart}
            disabled={processing || !urlsInput.trim()}
          >
            {processing ? (
              <>
                <div className={styles.spinner}></div>
                Processing...
              </>
            ) : (
              'Start Bulk Fix'
            )}
          </button>
        </div>

        {tasks.length > 0 && (
          <div className={styles.resultsList}>
            {tasks.map((task, idx) => (
              <div key={idx} className={`${styles.resultItem} ${styles[task.status]}`}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultUrl}>{task.url}</span>
                  <span className={`${styles.resultStatus} ${styles[task.status]}`}>
                    {task.status === 'processing' && <div className={styles.spinner} style={{ width: 14, height: 14, borderWidth: 2 }} />}
                    {task.status}
                  </span>
                </div>
                
                {task.errorMsg && (
                  <div className={styles.resultDetails} style={{ color: '#ef4444' }}>
                    Error: {task.errorMsg}
                  </div>
                )}

                {task.details && (
                  <div className={styles.resultDetails}>
                    {task.details.map((det, i) => (
                      <div key={i} className={styles.detailRow}>
                        <span>{det.type}</span>
                        <span className={
                          det.status === 'success' ? styles.detailSuccess : 
                          det.status === 'error' ? styles.detailError : 
                          styles.detailSkipped
                        }>
                          {det.status === 'error' ? det.reason : det.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
