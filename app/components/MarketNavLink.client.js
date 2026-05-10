'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const MarketUnderConstructionModal = dynamic(() => import('./MarketUnderConstructionModal.client'), {
  ssr: false
});

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
