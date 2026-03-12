'use client';

import { useEffect } from 'react';

export default function SiteChromeInteractions() {
  useEffect(() => {
    const toolsButton = document.getElementById('tools-dropdown-btn');
    const toolsMenu = document.getElementById('tools-dropdown-menu');
    const toolsWrapper = toolsButton?.closest('.tools-dropdown-wrapper');
    if (!toolsButton || !toolsMenu || !toolsWrapper) return undefined;

    let pinnedOpen = false;
    let closeTimerId = null;

    const clearCloseTimer = () => {
      if (closeTimerId == null) return;
      window.clearTimeout(closeTimerId);
      closeTimerId = null;
    };

    const syncToolsMenu = () => {
      const shouldOpen = pinnedOpen || toolsWrapper.matches(':hover') || toolsWrapper.contains(document.activeElement);
      toolsMenu.style.display = shouldOpen ? 'block' : 'none';
      toolsWrapper.classList.toggle('is-open', shouldOpen);
      toolsButton.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    };

    const openToolsMenu = () => {
      clearCloseTimer();
      syncToolsMenu();
    };

    const scheduleClose = () => {
      clearCloseTimer();
      closeTimerId = window.setTimeout(() => {
        if (pinnedOpen) return;
        syncToolsMenu();
      }, 180);
    };

    const toggleToolsMenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      pinnedOpen = !pinnedOpen;
      clearCloseTimer();
      syncToolsMenu();
    };

    const closeToolsMenu = (event) => {
      if (toolsMenu.contains(event.target) || toolsButton.contains(event.target)) return;
      pinnedOpen = false;
      clearCloseTimer();
      syncToolsMenu();
    };

    const handleFocusOut = () => {
      window.requestAnimationFrame(() => {
        if (toolsWrapper.contains(document.activeElement)) return;
        if (pinnedOpen) return;
        syncToolsMenu();
      });
    };

    toolsButton.addEventListener('click', toggleToolsMenu);
    document.addEventListener('click', closeToolsMenu);
    toolsWrapper.addEventListener('mouseenter', openToolsMenu);
    toolsWrapper.addEventListener('mouseleave', scheduleClose);
    toolsWrapper.addEventListener('focusin', openToolsMenu);
    toolsWrapper.addEventListener('focusout', handleFocusOut);

    return () => {
      clearCloseTimer();
      toolsButton.removeEventListener('click', toggleToolsMenu);
      document.removeEventListener('click', closeToolsMenu);
      toolsWrapper.removeEventListener('mouseenter', openToolsMenu);
      toolsWrapper.removeEventListener('mouseleave', scheduleClose);
      toolsWrapper.removeEventListener('focusin', openToolsMenu);
      toolsWrapper.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return null;
}
