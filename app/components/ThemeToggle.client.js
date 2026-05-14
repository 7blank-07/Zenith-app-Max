'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'zenith-color-scheme';
const DEFAULT_THEME = 'dark';

function normalizeTheme(value) {
  return value === 'light' ? 'light' : DEFAULT_THEME;
}

function applyTheme(theme) {
  const nextTheme = normalizeTheme(theme);
  document.documentElement.dataset.colorScheme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;
  return nextTheme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    const currentTheme = applyTheme(document.documentElement.dataset.colorScheme);
    setTheme(currentTheme);
  }, []);

  const isLight = theme === 'light';

  const toggleTheme = () => {
    const nextTheme = isLight ? 'dark' : 'light';
    const appliedTheme = applyTheme(nextTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, appliedTheme);
    } catch (error) {
      console.warn('[theme] Unable to save color scheme preference.', error);
    }

    setTheme(appliedTheme);
    window.dispatchEvent(new CustomEvent('zenith:color-scheme-change', { detail: { theme: appliedTheme } }));
  };

  return (
    <button
      className="theme-toggle-btn"
      type="button"
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      aria-pressed={isLight}
      title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      onClick={toggleTheme}
      suppressHydrationWarning
    >
      {isLight ? (
        <svg className="theme-toggle-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M21 14.7A8.5 8.5 0 0 1 9.3 3a7 7 0 1 0 11.7 11.7Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      ) : (
        <svg className="theme-toggle-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )}
    </button>
  );
}
