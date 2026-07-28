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
  UAE: 'ae',
  PORTUGAL: 'pt',
  GERMANY: 'de',
  SPAIN: 'es',
  TURKEY: 'tr',
  RUSSIA: 'ru'
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
  { value: REDEEM_CODE_SCOPE.UAE, label: 'UAE' },
  { value: REDEEM_CODE_SCOPE.PORTUGAL, label: 'Portugal' },
  { value: REDEEM_CODE_SCOPE.GERMANY, label: 'Germany' },
  { value: REDEEM_CODE_SCOPE.SPAIN, label: 'Spain' },
  { value: REDEEM_CODE_SCOPE.TURKEY, label: 'Turkey' },
  { value: REDEEM_CODE_SCOPE.RUSSIA, label: 'Russia' }
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
  UAE: 'uae',
  PORTUGAL: 'portugal',
  GERMANY: 'germany',
  SPAIN: 'spain',
  TURKEY: 'turkey',
  RUSSIA: 'russia'
});

export const REDEEM_ROUTE_CONFIG = Object.freeze({
  [REDEEM_ROUTE_KEY.GLOBAL]: {
    key: REDEEM_ROUTE_KEY.GLOBAL,
    path: '/fc-mobile-redeem-codes',
    scope: REDEEM_CODE_SCOPE.GLOBAL,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Global',
    navLabel: 'Global',
    locale: 'en-US',
    hreflang: 'en',
    primaryKeyword: 'fc mobile redeem codes',
    secondaryKeywords: ['fc mobile redeem code', 'latest fc mobile redeem codes', 'fc mobile codes list'],
    title: 'FC Mobile Redeem Codes',
    metaDescription:
      'FC Mobile redeem codes with active, latest, and expired tracking. Built for players in every country without fake regional exclusives.',
    h1: 'FC Mobile Redeem Codes',
    intro:
      'Use this FC Mobile redeem code tracker to check active rewards first, then copy any working code in one tap.',
    globalCodeNote:
      'Most FC Mobile redeem codes are shared worldwide. If EA marks a promotion as country-limited, we call that out directly in the listing.',
    copy: {
      eyebrow: 'Redeem code tracker',
      lastUpdatedLabel: 'List updated:'
    },
    faqEntries: [
      {
        question: 'Are these codes global or country-exclusive?',
        answer:
          'This list is primarily global. We do not claim country-exclusive codes unless EA explicitly publishes a regional restriction.'
      },
      {
        question: 'Why do country pages exist if the codes are global?',
        answer:
          'Country pages tailor context, wording, and FAQs for local players, while still using the same verified global code feed.'
      },
      {
        question: 'Can a global code still fail for some users?',
        answer:
          'Yes. Codes can expire quickly, hit redemption limits, or be limited by EA account eligibility, even when they are globally published.'
      }
    ],
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
    sharedGlobalCodes: true,
    todayOnly: true,
    countryLabel: 'Global Today',
    navLabel: 'Today',
    locale: 'en-US',
    primaryKeyword: 'fc mobile redeem codes today',
    secondaryKeywords: ['fc mobile redeem code today', 'new fc mobile redeem code', 'global fc mobile codes today', 'working fc mobile redeem codes'],
    title: 'FC Mobile Redeem Codes Today | Global Daily Updates',
    metaDescription:
      'Today-only view of global FC Mobile redeem codes. See newly published codes quickly, without claiming fake country-exclusive rewards.',
    h1: 'Global FC Mobile Redeem Codes Today',
    intro:
      'This page highlights FC Mobile codes published today from the same global code feed used across all regions.',
    globalCodeNote:
      'Daily updates are still global by default. Regional restrictions are noted only when EA publishes a promotion with country limits.',
    copy: {
      eyebrow: 'Today-only global tracker',
      lastUpdatedLabel: 'Today view updated:'
    },
    faqEntries: [
      {
        question: 'Are today codes different by country?',
        answer:
          'Usually no. Today codes are pulled from global FC Mobile drops, and we only flag country limits when EA states them.'
      },
      {
        question: 'Why can the today section be empty?',
        answer:
          'If no new code was published in the current UTC date window, the today view can be empty even while active global codes still exist.'
      },
      {
        question: 'Should I use this page or the main global page?',
        answer:
          'Use this page for same-day updates. Use the main global page when you want the full active and expired history.'
      }
    ],
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
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'India',
    navLabel: 'India',
    locale: 'en-IN',
    hreflang: 'en-IN',
    primaryKeyword: 'fc mobile redeem codes',
    secondaryKeywords: ['fc mobile redeem code india', 'fifa redeem code india', 'fc mobile global codes india', 'redeem code list india'],
    title: 'FC Mobile Redeem Codes for India | Global Working List',
    metaDescription:
      'Global FC Mobile redeem codes for players in India. Localized page copy, FAQs, and updates without pretending the code list is India-exclusive.',
    h1: 'FC Mobile Redeem Codes for India',
    intro:
      'Track global FC Mobile redeem codes in an India-focused format so you can quickly test active drops and keep older codes for reference.',
    globalCodeNote:
      'These codes are generally global, not India-only. If EA restricts a campaign by territory, we label that clearly.',
    copy: {
      eyebrow: 'India player guide',
      lastUpdatedLabel: 'Last updated for India players:'
    },
    faqEntries: [
      {
        question: 'Are these India-only FC Mobile redeem codes?',
        answer:
          'No. This page mainly lists global FC Mobile codes that India players can use, unless EA publishes a region-limited promotion.'
      },
      {
        question: 'Why keep a separate India page if codes are global?',
        answer:
          'The India page gives local wording, practical guidance, and India-specific FAQ context while keeping one shared global code source.'
      },
      {
        question: 'When can a global code fail in India?',
        answer:
          'A code may fail if it is expired, quota-limited, account-limited, or tied to an EA campaign that excludes certain regions.'
      }
    ],
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
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Indonesia',
    navLabel: 'Indonesia',
    locale: 'id-ID',
    hreflang: 'id-ID',
    primaryKeyword: 'kode redeem fc mobile',
    secondaryKeywords: [
      'redeem fc mobile',
      'code redeem fc mobile',
      'kode redeem fc mobile hari ini',
      'kode redeem fc mobile 2025',
      'fc mobile redeem'
    ],
    title: 'Kode Redeem FC Mobile Indonesia | Daftar Kode Global',
    metaDescription:
      'Halaman kode redeem FC Mobile untuk pemain Indonesia dengan daftar kode global, update status aktif/expired, dan penjelasan yang jujur.',
    h1: 'Kode Redeem FC Mobile untuk Indonesia',
    intro:
      'Pantau kode redeem FC Mobile global yang bisa dicoba pemain Indonesia, lalu salin kode aktif dengan cepat dari satu halaman.',
    globalCodeNote:
      'Mayoritas kode berlaku global, bukan khusus Indonesia. Jika EA membatasi promo per wilayah, kami tandai langsung pada entri kode.',
    copy: {
      eyebrow: 'Pusat kode pemain Indonesia',
      lastUpdatedLabel: 'Terakhir diperbarui untuk pemain Indonesia:'
    },
    faqEntries: [
      {
        question: 'Apakah ini kode redeem FC Mobile khusus Indonesia?',
        answer:
          'Tidak selalu. Daftar ini berisi kode global yang umum dipakai semua region, kecuali EA menyatakan promo khusus negara tertentu.'
      },
      {
        question: 'Kenapa ada halaman Indonesia jika kodenya global?',
        answer:
          'Halaman ini dibuat untuk konteks lokal Indonesia: bahasa, FAQ, dan panduan penggunaan, sambil tetap memakai satu sumber kode global.'
      },
      {
        question: 'Kenapa kode bisa gagal saat dipakai di Indonesia?',
        answer:
          'Biasanya karena kode sudah kedaluwarsa, kuota habis, akun tidak memenuhi syarat, atau promo dibatasi EA untuk region tertentu.'
      }
    ],
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
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Malaysia',
    navLabel: 'Malaysia',
    locale: 'en-MY',
    hreflang: 'en-MY',
    primaryKeyword: 'fc mobile redeem codes',
    secondaryKeywords: ['fc mobile redeem code malaysia', 'fc mobile codes malaysia', 'redeem code malaysia', 'ea redeem codes malaysia'],
    title: 'FC Mobile Redeem Codes Malaysia | Global Codes for MY Players',
    metaDescription:
      'Malaysia-focused FC Mobile redeem page using the same global code list, with local wording, unique FAQ content, and transparent status tracking.',
    h1: 'FC Mobile Redeem Codes for Malaysia',
    intro:
      'Use this Malaysia page to follow global FC Mobile redeem codes with cleaner local context for MY players.',
    globalCodeNote:
      'Most entries are global campaign codes. We only call a code Malaysia-limited when EA explicitly applies regional restrictions.',
    copy: {
      eyebrow: 'Malaysia player guide',
      lastUpdatedLabel: 'Last updated for Malaysia players:'
    },
    faqEntries: [
      {
        question: 'Are these FC Mobile redeem codes exclusive to Malaysia?',
        answer:
          'No. This page mostly tracks global FC Mobile drops for Malaysia players. Any EA region lock will be noted clearly.'
      },
      {
        question: 'Why does Malaysia have its own page if the list is global?',
        answer:
          'It provides Malaysian search intent, wording, and FAQ context while still keeping one shared global data source.'
      },
      {
        question: 'Can a global code fail for Malaysian accounts?',
        answer:
          'Yes. It can fail if expired, redemption-limited, account-limited, or tied to an EA campaign that excludes your eligibility region.'
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
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Vietnam',
    navLabel: 'Vietnam',
    locale: 'vi-VN',
    hreflang: 'vi-VN',
    primaryKeyword: 'code fc mobile',
    secondaryKeywords: ['code fifa mobile', 'code fifa', 'fc mobile code', 'redeem code fc mobile'],
    title: 'Code FC Mobile Việt Nam | Danh sách mã toàn cầu',
    metaDescription:
      'Trang code FC Mobile cho người chơi Việt Nam, dùng danh sách mã toàn cầu với trạng thái rõ ràng và nội dung SEO không trùng lặp máy móc.',
    h1: 'Code FC Mobile cho Việt Nam',
    intro:
      'Theo dõi code FC Mobile toàn cầu theo ngữ cảnh Việt Nam để kiểm tra mã mới nhanh hơn và lưu lịch sử mã đã hết hạn.',
    globalCodeNote:
      'Đa số mã là mã toàn cầu, không phải mã độc quyền Việt Nam. Nếu EA giới hạn theo khu vực, chúng tôi sẽ ghi chú rõ trong nội dung mã.',
    copy: {
      eyebrow: 'Trang code cho game thủ Việt',
      lastUpdatedLabel: 'Cập nhật lần cuối cho người chơi Việt Nam:'
    },
    faqEntries: [
      {
        question: 'Code trên trang này có phải chỉ dành cho Việt Nam không?',
        answer:
          'Không. Đây chủ yếu là mã toàn cầu cho FC Mobile. Chỉ khi EA thông báo giới hạn khu vực, chúng tôi mới đánh dấu mã theo vùng.'
      },
      {
        question: 'Vì sao vẫn cần trang Việt Nam nếu mã là toàn cầu?',
        answer:
          'Trang Việt Nam giúp tối ưu nội dung theo cách tìm kiếm địa phương, FAQ tiếng Việt và hướng dẫn phù hợp người chơi trong nước.'
      },
      {
        question: 'Khi nào mã toàn cầu có thể không dùng được ở Việt Nam?',
        answer:
          'Mã có thể lỗi khi đã hết hạn, hết lượt, tài khoản không đủ điều kiện, hoặc chiến dịch EA áp dụng hạn chế theo vùng.'
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
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Thailand',
    navLabel: 'Thailand',
    locale: 'th-TH',
    hreflang: 'th-TH',
    primaryKeyword: 'fc mobile code',
    secondaryKeywords: ['code fifa', 'mobile code', 'แจก รหัส ฟีฟ่า'],
    title: 'โค้ด FC Mobile ไทย | รวมโค้ดระดับโลกล่าสุด',
    metaDescription:
      'หน้าโค้ด FC Mobile สำหรับผู้เล่นไทย ใช้รายการโค้ดเดียวกับทั่วโลก พร้อมคำอธิบายชัดเจนว่าโค้ดไม่ได้พิเศษเฉพาะประเทศโดยอัตโนมัติ',
    h1: 'โค้ด FC Mobile สำหรับผู้เล่นไทย',
    intro:
      'ติดตามโค้ด FC Mobile แบบโกลบอลในหน้าเดียวที่ปรับคำอธิบายให้เหมาะกับผู้เล่นไทย เพื่อเช็กโค้ดใช้งานได้เร็วขึ้น',
    globalCodeNote:
      'โค้ดส่วนใหญ่เป็นโค้ดระดับโลก ไม่ใช่โค้ดเฉพาะไทย เว้นแต่ EA จะระบุข้อจำกัดรายภูมิภาคไว้ชัดเจน',
    copy: {
      eyebrow: 'ศูนย์รวมโค้ดสำหรับผู้เล่นไทย',
      lastUpdatedLabel: 'อัปเดตล่าสุดสำหรับผู้เล่นไทย:'
    },
    faqEntries: [
      {
        question: 'โค้ดในหน้านี้เป็นโค้ดเฉพาะประเทศไทยหรือไม่?',
        answer:
          'โดยทั่วไปไม่ใช่ โค้ดส่วนใหญ่เป็นโค้ดโกลบอลที่ผู้เล่นหลายประเทศใช้ร่วมกัน ยกเว้นกรณี EA ระบุจำกัดภูมิภาค'
      },
      {
        question: 'แล้วทำไมต้องมีหน้าสำหรับไทยถ้าใช้โค้ดเดียวกัน?',
        answer:
          'หน้าสำหรับไทยช่วยให้เนื้อหาและ FAQ ตรงกับคำค้นของผู้เล่นไทยมากขึ้น แม้ข้อมูลโค้ดยังคงมาจากชุดข้อมูลโกลบอลเดียวกัน'
      },
      {
        question: 'โค้ดโกลบอลสามารถใช้ไม่ได้ในไทยได้ไหม?',
        answer:
          'ได้ อาจเกิดจากโค้ดหมดอายุ โควตาหมด บัญชีไม่เข้าเงื่อนไข หรือมีข้อจำกัดที่ EA กำหนดไว้กับบางภูมิภาค'
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
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Philippines',
    navLabel: 'Philippines',
    locale: 'en-PH',
    hreflang: 'en-PH',
    primaryKeyword: 'ea fc mobile redeem codes',
    secondaryKeywords: ['ea fc redeem codes mobile philippines', 'ea fc mobile redeem codes today ph', 'ea sports fc mobile redeem codes ph', 'fc mobile codes philippines'],
    title: 'EA FC Mobile Redeem Codes Philippines | Global Code Feed',
    metaDescription:
      'Philippines-focused page for global EA FC Mobile redeem codes, with localized wording and honest guidance about regional eligibility.',
    h1: 'EA FC Mobile Redeem Codes for the Philippines',
    intro:
      'Check global EA FC Mobile redeem codes with Philippines-focused copy so local players can scan active rewards and redeem faster.',
    globalCodeNote:
      'Most codes are global and shared across countries. We only mark country-specific behavior when EA explicitly sets promotion limits.',
    copy: {
      eyebrow: 'Philippines player guide',
      lastUpdatedLabel: 'Last updated for Philippines players:'
    },
    faqEntries: [
      {
        question: 'Are these EA FC Mobile codes exclusive to the Philippines?',
        answer:
          'No. These are usually global EA FC Mobile codes. We do not claim PH-only rewards unless EA states a region-specific campaign.'
      },
      {
        question: 'Why keep a Philippines page if the code list is global?',
        answer:
          'It improves local relevance with Philippines wording, FAQs, and search intent while still showing the shared global code inventory.'
      },
      {
        question: 'When might a global code not work in PH accounts?',
        answer:
          'A code may fail due to expiry, redemption caps, account rules, or an EA campaign that restricts eligibility by region.'
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
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'USA',
    navLabel: 'USA',
    locale: 'en-US',
    hreflang: 'en-US',
    primaryKeyword: 'ea redeem codes',
    secondaryKeywords: ['ea redeem code usa', 'ea code redemption usa', 'redeem ea code usa', 'fc mobile global codes usa'],
    title: 'EA Redeem Codes USA | Global FC Mobile Code Tracker',
    metaDescription:
      'US-focused page for global EA/FC Mobile redeem codes with unique metadata, honest FAQ copy, and no fake country-exclusive claims.',
    h1: 'EA Redeem Codes for USA Players',
    intro:
      'Follow global EA FC Mobile redeem codes through a USA-focused page that keeps active, latest, and expired entries easy to review.',
    globalCodeNote:
      'The list is primarily global. We only label a code as US-limited when EA explicitly documents a US-only promotion rule.',
    copy: {
      eyebrow: 'USA player guide',
      lastUpdatedLabel: 'Last updated for USA players:'
    },
    faqEntries: [
      {
        question: 'Are these EA redeem codes USA-only?',
        answer:
          'Not usually. Most entries are global promotions that US players can redeem, unless EA marks campaign access by region.'
      },
      {
        question: 'Why does a USA page exist if the same codes are global?',
        answer:
          'It gives US-specific wording and clearer local context while preserving one shared global code source for consistency.'
      },
      {
        question: 'Why can a global code still fail for US accounts?',
        answer:
          'Codes can fail after expiry, redemption-cap exhaustion, account eligibility checks, or rare region-limited campaign rules from EA.'
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
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'UAE',
    navLabel: 'الإمارات',
    locale: 'ar-AE',
    hreflang: 'ar-AE',
    textDirection: 'rtl',
    primaryKeyword: 'كود فيفا',
    secondaryKeywords: ['اكواد fc mobile', 'fifa redeem code', 'كود fc mobile', 'استرداد اكواد فيفا'],
    title: 'أكواد FC Mobile للإمارات | قائمة الأكواد العالمية',
    metaDescription:
      'صفحة عربية للاعبي الإمارات تعرض أكواد FC Mobile العالمية نفسها مع شرح محلي واضح، دون ادعاء أكواد حصرية غير مؤكدة.',
    h1: 'أكواد FC Mobile للاعبي الإمارات',
    intro:
      'تابع أحدث أكواد FC Mobile العالمية بصياغة عربية موجهة للاعبي الإمارات، مع ترتيب واضح بين الأكواد الفعالة والمنتهية.',
    globalCodeNote:
      'معظم الأكواد هنا عالمية وليست حصرية للإمارات. إذا أعلنت EA عن تقييد جغرافي لحملة معينة فسنذكر ذلك بوضوح.',
    copy: {
      breadcrumbLabel: 'مسار التنقل',
      eyebrow: 'دليل الأكواد للاعبي الإمارات',
      lastUpdatedLabel: 'آخر تحديث للاعبي الإمارات:',
      browsePagesTitle: 'تصفح الصفحات الإقليمية',
      searchLabel: 'ابحث عن الكود أو العنوان',
      searchPlaceholder: 'ابحث في قائمة الأكواد',
      sectionFilterLabel: 'تصفية القسم',
      sectionAll: 'كل الأقسام',
      sectionActive: 'الفعالة فقط',
      sectionLatest: 'الأحدث فقط',
      sectionExpired: 'المنتهية فقط',
      applyButton: 'تطبيق',
      activeTitle: 'الأكواد الفعالة',
      activeCountSuffix: 'فعال',
      activeEmpty: 'لا يوجد كود فعال حاليًا.',
      latestTitle: 'أحدث الأكواد',
      latestTodayTitle: 'أحدث الأكواد المنشورة اليوم',
      latestCountSuffix: 'مدرج',
      latestEmpty: 'لا توجد أكواد حديثة مطابقة.',
      expiredTitle: 'الأكواد المنتهية',
      expiredCountSuffix: 'مؤرشف',
      expiredEmpty: 'لا توجد أكواد منتهية مؤرشفة بعد.',
      faqTitle: 'الأسئلة الشائعة',
      statusActive: 'فعال',
      statusExpired: 'منتهي',
      publishedLabel: 'تاريخ النشر',
      expiresLabel: 'تاريخ الانتهاء'
    },
    faqEntries: [
      {
        question: 'هل الأكواد في هذه الصفحة حصرية للإمارات؟',
        answer:
          'لا، في العادة هي أكواد عالمية يستخدمها اللاعبون في دول متعددة. لا نصف أي كود بأنه حصري للإمارات إلا إذا أكدت EA ذلك.'
      },
      {
        question: 'لماذا توجد صفحة الإمارات إذا كانت الأكواد عالمية؟',
        answer:
          'لتحسين تجربة البحث بالعربية وتقديم شرح محلي للاعبي الإمارات، مع الحفاظ على نفس مصدر بيانات الأكواد العالمي.'
      },
      {
        question: 'متى قد لا يعمل الكود العالمي على حسابي؟',
        answer:
          'قد يفشل الكود إذا انتهت صلاحيته، أو استُنفد الحد الأقصى، أو كانت الحملة مقيدة بالأهلية أو بالمنطقة وفق شروط EA.'
      }
    ],
    breadcrumb: [
      { name: 'الرئيسية', path: '/' },
      { name: 'أكواد FC Mobile', path: '/fc-mobile-redeem-codes' },
      { name: 'الإمارات', path: '/ae/kod-fifa' }
    ]
  },
  [REDEEM_ROUTE_KEY.PORTUGAL]: {
    key: REDEEM_ROUTE_KEY.PORTUGAL,
    path: '/pt/codigo-de-resgate-fc-mobile',
    scope: REDEEM_CODE_SCOPE.PORTUGAL,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Portugal',
    navLabel: 'Portugal',
    locale: 'pt-PT',
    hreflang: 'pt-PT',
    primaryKeyword: 'codigo de resgate fc mobile',
    secondaryKeywords: ['codigos fc mobile portugal', 'codigo de resgate fifa mobile'],
    title: 'Código de Resgate FC Mobile Portugal | Códigos Globais',
    metaDescription:
      'Página de códigos de resgate do FC Mobile para jogadores em Portugal. Lista global com atualizações de status e explicações honestas sobre disponibilidade.',
    h1: 'Códigos de Resgate FC Mobile para Portugal',
    intro:
      'Acompanhe os códigos de resgate globais do FC Mobile que os jogadores em Portugal podem testar e copie os códigos ativos rapidamente.',
    globalCodeNote:
      'A maioria dos códigos é global e não exclusiva de Portugal. Se a EA restringir uma promoção por região, informaremos claramente.',
    copy: {
      eyebrow: 'Guia de códigos para Portugal',
      lastUpdatedLabel: 'Última atualização para jogadores em Portugal:'
    },
    faqEntries: [
      {
        question: 'Estes códigos são exclusivos para Portugal?',
        answer:
          'Não. Esta página monitora principalmente os lançamentos globais do FC Mobile. Qualquer restrição de região da EA será indicada claramente.'
      },
      {
        question: 'Por que Portugal tem sua própria página se a lista é global?',
        answer:
          'Para fornecer contexto e explicações em português de Portugal, mantendo uma fonte de dados global compartilhada.'
      },
      {
        question: 'Um código global pode falhar em contas portuguesas?',
        answer:
          'Sim. Pode falhar se estiver expirado, com limite de uso atingido, conta não elegível ou se houver uma campanha com restrição regional.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Portugal', path: '/pt/codigo-de-resgate-fc-mobile' }
    ]
  },
  [REDEEM_ROUTE_KEY.GERMANY]: {
    key: REDEEM_ROUTE_KEY.GERMANY,
    path: '/de/fc-mobile-einloesecodes',
    scope: REDEEM_CODE_SCOPE.GERMANY,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Germany',
    navLabel: 'Germany',
    locale: 'de-DE',
    hreflang: 'de-DE',
    primaryKeyword: 'FC Mobile Einlösecodes',
    secondaryKeywords: ['fc mobile codes deutschland', 'ea fc mobile einlösecode'],
    title: 'FC Mobile Einlösecodes Deutschland | Globale Code-Liste',
    metaDescription:
      'FC Mobile Einlösecodes für Spieler in Deutschland. Globale Liste mit ehrlichen Erklärungen und täglichen Updates zu aktiven und abgelaufenen Codes.',
    h1: 'FC Mobile Einlösecodes für Deutschland',
    intro:
      'Verfolge globale FC Mobile Einlösecodes für deutsche Spieler. Kopiere aktive Codes schnell und prüfe, welche bereits abgelaufen sind.',
    globalCodeNote:
      'Die meisten Codes sind global und nicht exklusiv für Deutschland. Wenn EA eine Aktion regional beschränkt, weisen wir darauf hin.',
    copy: {
      eyebrow: 'Code-Guide für deutsche Spieler',
      lastUpdatedLabel: 'Zuletzt aktualisiert für Spieler in Deutschland:'
    },
    faqEntries: [
      {
        question: 'Sind diese FC Mobile Einlösecodes exklusiv für Deutschland?',
        answer:
          'Nein. Wir listen hier hauptsächlich globale FC Mobile Codes auf. Falls EA einen Code regional beschränkt, wird dies deutlich markiert.'
      },
      {
        question: 'Warum gibt es eine deutsche Seite, wenn die Codes global sind?',
        answer:
          'Sie bietet deutsche Texte, lokale Erklärungen und FAQs, nutzt aber weiterhin dieselbe globale Datenquelle für Codes.'
      },
      {
        question: 'Kann ein globaler Code in Deutschland fehlschlagen?',
        answer:
          'Ja. Ein Code kann fehlschlagen, wenn er abgelaufen ist, das Einlöselimit erreicht hat oder EA bestimmte Regionen ausschließt.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Germany', path: '/de/fc-mobile-einloesecodes' }
    ]
  },
  [REDEEM_ROUTE_KEY.SPAIN]: {
    key: REDEEM_ROUTE_KEY.SPAIN,
    path: '/es/codigos-de-canje-de-fc-mobile',
    scope: REDEEM_CODE_SCOPE.SPAIN,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Spain',
    navLabel: 'Spain',
    locale: 'es-ES',
    hreflang: 'es-ES',
    primaryKeyword: 'Códigos de Canje de FC Mobile',
    secondaryKeywords: ['codigos fc mobile españa', 'canjear codigo fc mobile'],
    title: 'Códigos de Canje de FC Mobile España | Lista Global',
    metaDescription:
      'Códigos de canje de FC Mobile para jugadores en España. Lista global con actualizaciones diarias, estado de los códigos y respuestas claras.',
    h1: 'Códigos de Canje de FC Mobile para España',
    intro:
      'Sigue los códigos de canje globales de FC Mobile para jugadores de España. Comprueba las recompensas activas y canjea rápidamente.',
    globalCodeNote:
      'La mayoría de los códigos son globales, no exclusivos de España. Si EA restringe una campaña por territorio, lo indicaremos claramente.',
    copy: {
      eyebrow: 'Guía para jugadores de España',
      lastUpdatedLabel: 'Última actualización para jugadores en España:'
    },
    faqEntries: [
      {
        question: '¿Estos códigos son exclusivos de España?',
        answer:
          'No. Esta página rastrea principalmente códigos globales de FC Mobile. Cualquier restricción regional de EA se indicará claramente.'
      },
      {
        question: '¿Por qué hay una página para España si los códigos son globales?',
        answer:
          'Para ofrecer textos y preguntas frecuentes en español de España, manteniendo la misma fuente de códigos globales.'
      },
      {
        question: '¿Puede fallar un código global en cuentas de España?',
        answer:
          'Sí. Un código puede fallar por caducidad, límite de canjes, requisitos de la cuenta o si EA excluye tu región.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Spain', path: '/es/codigos-de-canje-de-fc-mobile' }
    ]
  },
  [REDEEM_ROUTE_KEY.TURKEY]: {
    key: REDEEM_ROUTE_KEY.TURKEY,
    path: '/tr/fc-mobil-kullanim-kodlari',
    scope: REDEEM_CODE_SCOPE.TURKEY,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Turkey',
    navLabel: 'Turkey',
    locale: 'tr-TR',
    hreflang: 'tr-TR',
    primaryKeyword: 'FC Mobil Kullanım Kodları',
    secondaryKeywords: ['fc mobile promosyon kodları türkiye', 'fc mobil kodları'],
    title: 'FC Mobil Kullanım Kodları Türkiye | Küresel Kod Listesi',
    metaDescription:
      'Türkiye\'deki oyuncular için FC Mobil kullanım kodları. Güncel durum güncellemeleri ve bölgesel erişim hakkında dürüst açıklamalar içeren küresel liste.',
    h1: 'Türkiye için FC Mobil Kullanım Kodları',
    intro:
      'Türkiye\'deki oyuncuların test edebileceği küresel FC Mobil kullanım kodlarını takip edin ve aktif kodları hızla kopyalayın.',
    globalCodeNote:
      'Kodların çoğu küreseldir, Türkiye\'ye özel değildir. EA bir promosyonu bölgeyle sınırlarsa, bunu açıkça belirtiriz.',
    copy: {
      eyebrow: 'Türk oyuncu rehberi',
      lastUpdatedLabel: 'Türkiye\'deki oyuncular için son güncelleme:'
    },
    faqEntries: [
      {
        question: 'Bu kodlar sadece Türkiye\'ye mi özel?',
        answer:
          'Hayır. Bu sayfa ağırlıklı olarak küresel FC Mobil kodlarını izler. Herhangi bir EA bölge kısıtlaması açıkça belirtilecektir.'
      },
      {
        question: 'Kodlar küreselse neden Türkiye için ayrı bir sayfa var?',
        answer:
          'Türkçe açıklamalar ve SSS içeriği sunarken aynı paylaşılan küresel kod veritabanını kullanmak için.'
      },
      {
        question: 'Küresel bir kod Türkiye\'deki hesaplarda başarısız olabilir mi?',
        answer:
          'Evet. Süresi dolmuşsa, kullanım sınırına ulaşmışsa, hesabınız uygun değilse veya EA bölgenizi hariç tutmuşsa başarısız olabilir.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Turkey', path: '/tr/fc-mobil-kullanim-kodlari' }
    ]
  },
  [REDEEM_ROUTE_KEY.RUSSIA]: {
    key: REDEEM_ROUTE_KEY.RUSSIA,
    path: '/ru/fc-mobile-promo-code',
    scope: REDEEM_CODE_SCOPE.RUSSIA,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Russia',
    navLabel: 'Russia',
    locale: 'ru-RU',
    hreflang: 'ru-RU',
    primaryKeyword: 'промокод фк мобайл',
    secondaryKeywords: ['FC Mobile promo code', 'промокоды fc mobile', 'fc mobile коды россия'],
    title: 'Промокод ФК Мобайл (FC Mobile) Россия | Глобальные коды',
    metaDescription:
      'Глобальный промокод ФК Мобайл (FC Mobile) для игроков в России. Честная информация о доступности, статусе кодов и ежедневные обновления.',
    h1: 'Промокод ФК Мобайл для России',
    intro:
      'Отслеживайте глобальные промокоды FC Mobile для российских игроков. Проверяйте активные награды и быстро копируйте доступные коды.',
    globalCodeNote:
      'Большинство кодов являются глобальными, а не эксклюзивными для России. Если EA ограничит акцию по региону, мы четко укажем это.',
    copy: {
      eyebrow: 'Гид для игроков из России',
      lastUpdatedLabel: 'Последнее обновление для игроков из России:'
    },
    faqEntries: [
      {
        question: 'Эти промокоды эксклюзивны для России?',
        answer:
          'Нет. В основном здесь представлены глобальные коды FC Mobile. Любые региональные ограничения от EA будут четко отмечены.'
      },
      {
        question: 'Зачем нужна страница для России, если коды глобальные?',
        answer:
          'Она предоставляет тексты и пояснения на русском языке для удобства игроков, используя ту же глобальную базу кодов.'
      },
      {
        question: 'Может ли глобальный код не сработать на российском аккаунте?',
        answer:
          'Да. Код может не сработать из-за истечения срока действия, лимита активаций, условий аккаунта или региональных ограничений от EA.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Russia', path: '/ru/fc-mobile-promo-code' }
    ]
  }
});

export const REDEEM_LAUNCHED_LINKS = Object.freeze(
  [
    REDEEM_ROUTE_KEY.GLOBAL,
    REDEEM_ROUTE_KEY.GLOBAL_TODAY,
    REDEEM_ROUTE_KEY.INDIA,
    REDEEM_ROUTE_KEY.INDONESIA,
    REDEEM_ROUTE_KEY.MALAYSIA,
    REDEEM_ROUTE_KEY.VIETNAM,
    REDEEM_ROUTE_KEY.THAILAND,
    REDEEM_ROUTE_KEY.PHILIPPINES,
    REDEEM_ROUTE_KEY.USA,
    REDEEM_ROUTE_KEY.UAE,
    REDEEM_ROUTE_KEY.PORTUGAL,
    REDEEM_ROUTE_KEY.GERMANY,
    REDEEM_ROUTE_KEY.SPAIN,
    REDEEM_ROUTE_KEY.TURKEY,
    REDEEM_ROUTE_KEY.RUSSIA
  ].map((routeKey) => ({
    label: REDEEM_ROUTE_CONFIG[routeKey].navLabel,
    href: REDEEM_ROUTE_CONFIG[routeKey].path
  }))
);

export const REDEEM_SCOPE_TO_PUBLISHED_PATHS = Object.freeze({
  [REDEEM_CODE_SCOPE.GLOBAL]: [
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL_TODAY].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDIA].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDONESIA].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.MALAYSIA].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.VIETNAM].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.THAILAND].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.PHILIPPINES].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.USA].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.UAE].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.PORTUGAL].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GERMANY].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.SPAIN].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.TURKEY].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.RUSSIA].path
  ],
  [REDEEM_CODE_SCOPE.INDIA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDIA].path],
  [REDEEM_CODE_SCOPE.INDONESIA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDONESIA].path],
  [REDEEM_CODE_SCOPE.MALAYSIA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.MALAYSIA].path],
  [REDEEM_CODE_SCOPE.VIETNAM]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.VIETNAM].path],
  [REDEEM_CODE_SCOPE.THAILAND]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.THAILAND].path],
  [REDEEM_CODE_SCOPE.PHILIPPINES]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.PHILIPPINES].path],
  [REDEEM_CODE_SCOPE.USA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.USA].path],
  [REDEEM_CODE_SCOPE.UAE]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.UAE].path],
  [REDEEM_CODE_SCOPE.PORTUGAL]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.PORTUGAL].path],
  [REDEEM_CODE_SCOPE.GERMANY]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GERMANY].path],
  [REDEEM_CODE_SCOPE.SPAIN]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.SPAIN].path],
  [REDEEM_CODE_SCOPE.TURKEY]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.TURKEY].path],
  [REDEEM_CODE_SCOPE.RUSSIA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.RUSSIA].path]
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
