'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const ARABIC_REDEEM_PATH = '/ae/kod-fifa';

function isArabicRedeemRoute(pathname) {
  return pathname === ARABIC_REDEEM_PATH || pathname.startsWith(`${ARABIC_REDEEM_PATH}/`);
}

export default function HtmlLanguageController() {
  const pathname = usePathname() || '';

  useEffect(() => {
    const html = document.documentElement;
    if (!html) return;

    if (isArabicRedeemRoute(pathname)) {
      html.lang = 'ar';
      html.dir = 'rtl';
      return;
    }

    html.lang = 'en';
    html.removeAttribute('dir');
  }, [pathname]);

  return null;
}
