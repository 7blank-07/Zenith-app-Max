'use client';

import { useEffect } from 'react';

export default function SiteChromeInteractions() {
  useEffect(() => {
    const toolsButton = document.getElementById('tools-dropdown-btn');
    const toolsMenu = document.getElementById('tools-dropdown-menu');
    if (!toolsButton || !toolsMenu) return undefined;

    const toggleToolsMenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      toolsMenu.style.display = toolsMenu.style.display === 'block' ? 'none' : 'block';
    };

    const closeToolsMenu = (event) => {
      if (toolsMenu.contains(event.target) || toolsButton.contains(event.target)) return;
      toolsMenu.style.display = 'none';
    };

    toolsButton.addEventListener('click', toggleToolsMenu);
    document.addEventListener('click', closeToolsMenu);

    return () => {
      toolsButton.removeEventListener('click', toggleToolsMenu);
      document.removeEventListener('click', closeToolsMenu);
    };
  }, []);

  return null;
}
