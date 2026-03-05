'use client';

import { useState } from 'react';
import MarketUnderConstructionModal from './MarketUnderConstructionModal.client';

export default function MarketNavLink({ children = 'Market', onClick, ...props }) {
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    setIsMarketModalOpen(true);
  };

  return (
    <>
      <a {...props} href="/market" onClick={handleClick}>
        {children}
      </a>
      <MarketUnderConstructionModal isOpen={isMarketModalOpen} onClose={() => setIsMarketModalOpen(false)} />
    </>
  );
}
