export const REDEEM_CODE_STATUS = Object.freeze({
  ACTIVE: 'active',
  EXPIRED: 'expired'
});

export const REDEEM_CODE_STATUS_VALUES = Object.freeze(Object.values(REDEEM_CODE_STATUS));

export const REDEEM_CODE_SCOPE = Object.freeze({
  GLOBAL: 'global',
  INDIA: 'in',
  INDONESIA: 'id',
  MALAYSIA: 'my',
  VIETNAM: 'vn',
  THAILAND: 'th',
  PHILIPPINES: 'ph',
  USA: 'us',
  UAE: 'ae'
});

export const REDEEM_CODE_SCOPE_VALUES = Object.freeze(Object.values(REDEEM_CODE_SCOPE));

export const REDEEM_ROUTE_REVALIDATE_SECONDS = 60 * 60;
export const REDEEM_DEFAULT_PAGE_SIZE = 20;
export const REDEEM_MAX_PAGE_SIZE = 100;

export const REDEEM_CODE_SCOPE_OPTIONS = Object.freeze([
  { value: REDEEM_CODE_SCOPE.GLOBAL, label: 'Global' },
  { value: REDEEM_CODE_SCOPE.INDIA, label: 'India' },
  { value: REDEEM_CODE_SCOPE.INDONESIA, label: 'Indonesia' },
  { value: REDEEM_CODE_SCOPE.MALAYSIA, label: 'Malaysia' },
  { value: REDEEM_CODE_SCOPE.VIETNAM, label: 'Vietnam' },
  { value: REDEEM_CODE_SCOPE.THAILAND, label: 'Thailand' },
  { value: REDEEM_CODE_SCOPE.PHILIPPINES, label: 'Philippines' },
  { value: REDEEM_CODE_SCOPE.USA, label: 'USA' },
  { value: REDEEM_CODE_SCOPE.UAE, label: 'UAE' }
]);

export const REDEEM_ROUTE_KEY = Object.freeze({
  GLOBAL: 'global',
  GLOBAL_TODAY: 'global-today',
  INDIA: 'india',
  INDONESIA: 'indonesia',
  MALAYSIA: 'malaysia',
  VIETNAM: 'vietnam',
  THAILAND: 'thailand',
  PHILIPPINES: 'philippines',
  USA: 'usa',
  UAE: 'uae'
});

export const REDEEM_ROUTE_CONFIG = Object.freeze({
  [REDEEM_ROUTE_KEY.GLOBAL]: {
    key: REDEEM_ROUTE_KEY.GLOBAL,
    path: '/fc-mobile-redeem-codes',
    scope: REDEEM_CODE_SCOPE.GLOBAL,
    includeGlobalScope: true,
    todayOnly: false,
    countryLabel: 'Global',
    navLabel: 'Global',
    primaryKeyword: 'fc mobile redeem codes',
    secondaryKeywords: [
      'fc mobile redeem code',
      'redeem code fc mobile',
      'fc mobile redeem codes today',
      'latest fc mobile redeem codes'
    ],
    title: 'FC Mobile Redeem Codes | Latest Working Codes',
    metaDescription:
      'FC Mobile redeem codes updated weekly with one-tap copy support, active and expired tracking, and fresh working code lists.',
    h1: 'FC Mobile Redeem Codes',
    intro:
      'Find fc mobile redeem codes in one place, track active rewards first, and copy every code instantly without leaving Zenith.',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' }
    ]
  },
  [REDEEM_ROUTE_KEY.GLOBAL_TODAY]: {
    key: REDEEM_ROUTE_KEY.GLOBAL_TODAY,
    path: '/fc-mobile-redeem-codes-today',
    scope: REDEEM_CODE_SCOPE.GLOBAL,
    includeGlobalScope: true,
    todayOnly: true,
    countryLabel: 'Global Today',
    navLabel: 'Today',
    primaryKeyword: 'fc mobile redeem codes today',
    secondaryKeywords: [
      'fc mobile redeem code today',
      'new fc mobile redeem code',
      'latest fc mobile redeem codes',
      'working fc mobile redeem codes'
    ],
    title: 'FC Mobile Redeem Codes Today | New Working Codes',
    metaDescription:
      'FC mobile redeem codes today with freshness-first updates, copy-ready code cards, and active versus expired breakdowns.',
    h1: 'FC Mobile Redeem Codes Today',
    intro:
      'Check fc mobile redeem codes today to find newly published rewards quickly and copy each working code in one tap.',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Today', path: '/fc-mobile-redeem-codes-today' }
    ]
  },
  [REDEEM_ROUTE_KEY.INDIA]: {
    key: REDEEM_ROUTE_KEY.INDIA,
    path: '/in/fc-mobile-redeem-codes',
    scope: REDEEM_CODE_SCOPE.INDIA,
    includeGlobalScope: true,
    todayOnly: false,
    countryLabel: 'India',
    navLabel: 'India',
    primaryKeyword: 'fc mobile redeem codes',
    secondaryKeywords: [
      'fc mobile redeem code',
      'fifa redeem code',
      'fifa redeem',
      'redeem code list'
    ],
    title: 'FC Mobile Redeem Codes India | Latest Redeem Code List',
    metaDescription:
      'FC mobile redeem codes for India with active-first sorting, instant copy buttons, and updated redeem code list tracking.',
    h1: 'FC Mobile Redeem Codes India',
    intro:
      'Get fc mobile redeem codes for India with a clean redeem code list that keeps active rewards at the top and archived entries below.',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'India', path: '/in/fc-mobile-redeem-codes' }
    ]
  },
  [REDEEM_ROUTE_KEY.INDONESIA]: {
    key: REDEEM_ROUTE_KEY.INDONESIA,
    path: '/id/kode-redeem-fc-mobile',
    scope: REDEEM_CODE_SCOPE.INDONESIA,
    includeGlobalScope: true,
    todayOnly: false,
    countryLabel: 'Indonesia',
    navLabel: 'Indonesia',
    primaryKeyword: 'kode redeem fc mobile',
    secondaryKeywords: [
      'redeem fc mobile',
      'code redeem fc mobile',
      'kode redeem fc mobile hari ini',
      'kode redeem fc mobile 2025',
      'fc mobile redeem'
    ],
    title: 'Kode Redeem FC Mobile | Kode Aktif Terbaru Hari Ini',
    metaDescription:
      'Kode redeem FC Mobile terbaru untuk Indonesia, lengkap dengan tombol copy cepat, urutan kode aktif, dan arsip kode expired.',
    h1: 'Kode Redeem FC Mobile Indonesia',
    intro:
      'Temukan kode redeem fc mobile terbaru untuk Indonesia, salin kode sekali klik, dan pantau kode aktif maupun expired dengan cepat.',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Indonesia', path: '/id/kode-redeem-fc-mobile' }
    ]
  },
  [REDEEM_ROUTE_KEY.MALAYSIA]: {
    key: REDEEM_ROUTE_KEY.MALAYSIA,
    path: '/my/fc-mobile-redeem-codes',
    scope: REDEEM_CODE_SCOPE.MALAYSIA,
    includeGlobalScope: true,
    todayOnly: false,
    countryLabel: 'Malaysia',
    navLabel: 'Malaysia',
    primaryKeyword: 'fc mobile redeem codes',
    secondaryKeywords: [
      'fc mobile redeem code',
      'fc mobile codes',
      'redeem code',
      'redeem codes',
      'ea redeem codes'
    ],
    title: 'FC Mobile Redeem Codes Malaysia | Latest FC Mobile Codes',
    metaDescription:
      'FC mobile redeem codes for Malaysia with fresh fc mobile codes, one-tap copy buttons, and tracked redeem code history from active to expired.',
    h1: 'FC Mobile Redeem Codes Malaysia',
    intro:
      'Use this fc mobile redeem codes Malaysia hub to grab each fc mobile redeem code quickly, discover new redeem codes, and monitor trusted ea redeem codes.',
    faqEntries: [
      {
        question: 'Where can I find the latest fc mobile redeem code and fc mobile codes in Malaysia?',
        answer:
          'This page tracks fc mobile redeem codes for Malaysia with active entries first, so you can copy each fc mobile redeem code and review recently added fc mobile codes quickly.'
      },
      {
        question: 'Are these redeem code and redeem codes entries verified before they appear?',
        answer:
          'Yes. Every redeem code is reviewed before publishing, then moved across active and expired sections so older redeem codes remain visible for reference.'
      },
      {
        question: 'How do ea redeem codes relate to FC Mobile rewards in Malaysia?',
        answer:
          'Some EA campaigns publish ea redeem codes that overlap with FC Mobile promotions. We surface those updates in the same timeline when they are relevant to Malaysia players.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Malaysia', path: '/my/fc-mobile-redeem-codes' }
    ]
  },
  [REDEEM_ROUTE_KEY.VIETNAM]: {
    key: REDEEM_ROUTE_KEY.VIETNAM,
    path: '/vn/code-fc-mobile',
    scope: REDEEM_CODE_SCOPE.VIETNAM,
    includeGlobalScope: true,
    todayOnly: false,
    countryLabel: 'Vietnam',
    navLabel: 'Vietnam',
    primaryKeyword: 'code fc mobile',
    secondaryKeywords: ['code fifa mobile', 'code fifa', 'fc mobile code', 'redeem code fc mobile'],
    title: 'Code FC Mobile Vietnam | Latest Code FIFA Mobile Updates',
    metaDescription:
      'Code fc mobile updates for Vietnam with quick copy actions, code fifa mobile freshness tracking, and clear active versus expired sections.',
    h1: 'Code FC Mobile Vietnam',
    intro:
      'Follow code fc mobile updates for Vietnam, copy each code fifa mobile instantly, and track every redeem code fc mobile from active rewards to archived history.',
    faqEntries: [
      {
        question: 'How often is code fc mobile refreshed for Vietnam players?',
        answer:
          'The listing is updated whenever a new code fifa mobile is published, with the newest fc mobile code highlighted in active and latest sections first.'
      },
      {
        question: 'Can I use older code fifa entries from previous events?',
        answer:
          'You can test older code fifa entries, but many become invalid quickly. That is why expired items remain archived separately from active rewards.'
      },
      {
        question: 'Is redeem code fc mobile usage the same across all regions?',
        answer:
          'Not always. Redeem code fc mobile campaigns can vary by region, so this Vietnam page prioritizes entries that are most likely to work for local players.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Vietnam', path: '/vn/code-fc-mobile' }
    ]
  },
  [REDEEM_ROUTE_KEY.THAILAND]: {
    key: REDEEM_ROUTE_KEY.THAILAND,
    path: '/th/fc-mobile-code',
    scope: REDEEM_CODE_SCOPE.THAILAND,
    includeGlobalScope: true,
    todayOnly: false,
    countryLabel: 'Thailand',
    navLabel: 'Thailand',
    primaryKeyword: 'fc mobile code',
    secondaryKeywords: ['code fifa', 'mobile code', 'แจก รหัส ฟีฟ่า'],
    title: 'FC Mobile Code Thailand | Latest Code FIFA Drops',
    metaDescription:
      'FC mobile code updates for Thailand with instant copy UX, code fifa freshness tracking, and active and expired reward sections.',
    h1: 'FC Mobile Code Thailand',
    intro:
      'Use this fc mobile code hub for Thailand to follow every code fifa release, copy each mobile code quickly, and track แจก รหัส ฟีฟ่า updates in one page.',
    faqEntries: [
      {
        question: 'Where do I find the newest fc mobile code for Thailand?',
        answer:
          'This page highlights the newest fc mobile code at the top of active and latest sections so Thailand players can copy and redeem faster.'
      },
      {
        question: 'How is code fifa different from other mobile code promotions?',
        answer:
          'Code fifa campaigns are tied to FC Mobile events. Some mobile code entries expire quickly, so we separate active rewards from archived expired results.'
      },
      {
        question: 'Does the page include แจก รหัส ฟีฟ่า style community updates?',
        answer:
          'Yes. We monitor แจก รหัส ฟีฟ่า style updates and publish matching entries when they align with verified FC Mobile redemption campaigns.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Thailand', path: '/th/fc-mobile-code' }
    ]
  },
  [REDEEM_ROUTE_KEY.PHILIPPINES]: {
    key: REDEEM_ROUTE_KEY.PHILIPPINES,
    path: '/ph/ea-fc-mobile-redeem-codes',
    scope: REDEEM_CODE_SCOPE.PHILIPPINES,
    includeGlobalScope: true,
    todayOnly: false,
    countryLabel: 'Philippines',
    navLabel: 'Philippines',
    primaryKeyword: 'ea fc mobile redeem codes',
    secondaryKeywords: [
      'ea fc redeem codes mobile',
      'ea fc mobile redeem codes today',
      'ea fc mobile free redeem codes',
      'ea sports fc mobile redeem codes',
      'ea fc mobile redeem codes new'
    ],
    title: 'EA FC Mobile Redeem Codes Philippines | New Working Codes',
    metaDescription:
      'EA fc mobile redeem codes for the Philippines with one-tap copy, active and expired tracking, and daily updates for fresh rewards.',
    h1: 'EA FC Mobile Redeem Codes Philippines',
    intro:
      'Get ea fc mobile redeem codes for the Philippines, track ea sports fc mobile redeem codes by status, and copy ea fc mobile redeem codes today in one tap.',
    faqEntries: [
      {
        question: 'Where can I find ea fc redeem codes mobile updates for the Philippines?',
        answer:
          'This page publishes ea fc redeem codes mobile entries in an active-first order, followed by latest updates and archived expirations for quick scanning.'
      },
      {
        question: 'Does this hub track ea fc mobile redeem codes today and new releases?',
        answer:
          'Yes. We keep ea fc mobile redeem codes today and ea fc mobile redeem codes new updates in the latest section as soon as they are published.'
      },
      {
        question: 'Are ea fc mobile free redeem codes and event rewards listed separately?',
        answer:
          'All verified ea fc mobile free redeem codes and event rewards appear in one timeline, with status labels so you can identify what is still active.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Philippines', path: '/ph/ea-fc-mobile-redeem-codes' }
    ]
  },
  [REDEEM_ROUTE_KEY.USA]: {
    key: REDEEM_ROUTE_KEY.USA,
    path: '/us/ea-redeem-codes',
    scope: REDEEM_CODE_SCOPE.USA,
    includeGlobalScope: true,
    todayOnly: false,
    countryLabel: 'USA',
    navLabel: 'USA',
    primaryKeyword: 'ea redeem codes',
    secondaryKeywords: [
      'ea redeem code',
      'redeem code ea',
      'ea code redemption',
      'ea redemption code',
      'redeem ea code'
    ],
    title: 'EA Redeem Codes USA | Latest EA Redemption Code Updates',
    metaDescription:
      'EA redeem codes for USA players with copy-ready rewards, active versus expired sections, and fast tracking for each new ea redemption code.',
    h1: 'EA Redeem Codes USA',
    intro:
      'Follow ea redeem codes for USA players, copy every ea redeem code instantly, and check each ea code redemption update in active, latest, and expired sections.',
    faqEntries: [
      {
        question: 'How often are ea redeem codes refreshed for USA players?',
        answer:
          'We update the list whenever a verified ea redeem code is published, so you can quickly see fresh rewards and older redeem ea code entries in one place.'
      },
      {
        question: 'What is the difference between redeem code ea and ea code redemption?',
        answer:
          'Both terms refer to entering the same promotional value. We keep each redeem code ea item with date and status to make ea code redemption easier to track.'
      },
      {
        question: 'Can expired ea redemption code entries still appear in search?',
        answer:
          'Yes. Expired ea redemption code items remain archived for transparency, while active rewards always stay at the top of the list.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'USA', path: '/us/ea-redeem-codes' }
    ]
  },
  [REDEEM_ROUTE_KEY.UAE]: {
    key: REDEEM_ROUTE_KEY.UAE,
    path: '/ae/kod-fifa',
    scope: REDEEM_CODE_SCOPE.UAE,
    includeGlobalScope: true,
    todayOnly: false,
    countryLabel: 'UAE',
    navLabel: 'UAE',
    locale: 'ar-AE',
    textDirection: 'rtl',
    primaryKeyword: 'كود فيفا',
    secondaryKeywords: ['fifa redeem code', 'fifa redeem', 'منتدى فيفا', 'موقع فيفا موبايل'],
    title: 'كود فيفا للإمارات | أحدث أكواد FC Mobile الفعالة',
    metaDescription:
      'كود فيفا المحدث للإمارات مع نسخ سريع، ترتيب الأكواد الفعالة أولاً، وأرشيف واضح للأكواد المنتهية في FC Mobile.',
    h1: 'كود فيفا للإمارات',
    intro:
      'تابع كود فيفا المخصص للإمارات، انسخ fifa redeem code بسرعة، وراجع تحديثات fifa redeem من موقع فيفا موبايل ومصادر منتدى فيفا الموثوقة.',
    faqEntries: [
      {
        question: 'كيف يتم تحديث كود فيفا في صفحة الإمارات؟',
        answer:
          'نحدّث كود فيفا مباشرة عند نشر أي حملة جديدة، ثم نرتب الأكواد حسب الحالة حتى تظهر الأكواد الفعالة قبل الأكواد المنتهية.'
      },
      {
        question: 'هل يمكن استخدام fifa redeem code نفسه في كل المناطق؟',
        answer:
          'ليس دائمًا. بعض حملات fifa redeem تكون مرتبطة بمنطقة معينة، لذلك تركز هذه الصفحة على الأكواد الأقرب للاستخدام داخل الإمارات.'
      },
      {
        question: 'هل يتم الاعتماد على موقع فيفا موبايل أو منتدى فيفا فقط؟',
        answer:
          'نراجع التحديثات المنشورة عبر موقع فيفا موبايل وقنوات منتدى فيفا، ثم نعرض الأكواد التي تم التحقق منها مع التاريخ والحالة.'
      }
    ],
    breadcrumb: [
      { name: 'الرئيسية', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'الإمارات', path: '/ae/kod-fifa' }
    ]
  }
});

export const REDEEM_LAUNCHED_LINKS = Object.freeze([
  { label: 'Global', href: REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL].path },
  { label: 'Today', href: REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL_TODAY].path },
  { label: 'India', href: REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDIA].path },
  { label: 'Indonesia', href: REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDONESIA].path },
  { label: 'Malaysia', href: REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.MALAYSIA].path },
  { label: 'Vietnam', href: REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.VIETNAM].path },
  { label: 'Thailand', href: REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.THAILAND].path },
  { label: 'Philippines', href: REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.PHILIPPINES].path },
  { label: 'USA', href: REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.USA].path },
  { label: 'UAE', href: REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.UAE].path }
]);

export const REDEEM_SCOPE_TO_PUBLISHED_PATHS = Object.freeze({
  [REDEEM_CODE_SCOPE.GLOBAL]: [
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL_TODAY].path
  ],
  [REDEEM_CODE_SCOPE.INDIA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDIA].path],
  [REDEEM_CODE_SCOPE.INDONESIA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDONESIA].path],
  [REDEEM_CODE_SCOPE.MALAYSIA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.MALAYSIA].path],
  [REDEEM_CODE_SCOPE.VIETNAM]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.VIETNAM].path],
  [REDEEM_CODE_SCOPE.THAILAND]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.THAILAND].path],
  [REDEEM_CODE_SCOPE.PHILIPPINES]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.PHILIPPINES].path],
  [REDEEM_CODE_SCOPE.USA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.USA].path],
  [REDEEM_CODE_SCOPE.UAE]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.UAE].path]
});

export const REDEEM_SECTION_FILTER_OPTIONS = Object.freeze([
  { value: 'all', label: 'All sections' },
  { value: 'active', label: 'Active only' },
  { value: 'latest', label: 'Latest only' },
  { value: 'expired', label: 'Expired only' }
]);

export function getRedeemScopeLabel(scope) {
  return REDEEM_CODE_SCOPE_OPTIONS.find((entry) => entry.value === scope)?.label || 'Unknown scope';
}

export function getRedeemRouteConfigByKey(routeKey) {
  return REDEEM_ROUTE_CONFIG[routeKey] || null;
}
