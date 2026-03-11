'use client';

import { useEffect } from 'react';

export default function SiteChromeInteractions() {
  useEffect(() => {
    const toolsButton = document.getElementById('tools-dropdown-btn');
    const toolsMenu = document.getElementById('tools-dropdown-menu');
    const toolsWrapper = toolsButton?.closest('.tools-dropdown-wrapper');
    if (!toolsButton || !toolsMenu || !toolsWrapper) return undefined;

    let pinnedOpen = false;

    const syncToolsMenu = () => {
      const shouldOpen = pinnedOpen || toolsWrapper.matches(':hover');
      toolsMenu.style.display = shouldOpen ? 'block' : 'none';
      toolsButton.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    };

    const toggleToolsMenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      pinnedOpen = !pinnedOpen;
      syncToolsMenu();
    };

    const closeToolsMenu = (event) => {
      if (toolsMenu.contains(event.target) || toolsButton.contains(event.target)) return;
      pinnedOpen = false;
      syncToolsMenu();
    };

    const handleHoverChange = () => {
      syncToolsMenu();
    };

    toolsButton.addEventListener('click', toggleToolsMenu);
    document.addEventListener('click', closeToolsMenu);
    toolsWrapper.addEventListener('mouseenter', handleHoverChange);
    toolsWrapper.addEventListener('mouseleave', handleHoverChange);

    return () => {
      toolsButton.removeEventListener('click', toggleToolsMenu);
      document.removeEventListener('click', closeToolsMenu);
      toolsWrapper.removeEventListener('mouseenter', handleHoverChange);
      toolsWrapper.removeEventListener('mouseleave', handleHoverChange);
    };
  }, []);

  return null;
}
