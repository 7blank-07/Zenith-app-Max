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
  INDONESIA: 'indonesia',
  MALAYSIA: 'malaysia',
  VIETNAM: 'vietnam',
  THAILAND: 'thailand',
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
    hreflang: 'id',
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
    path: '/my/kod-redeem-fc-mobile',
    scope: REDEEM_CODE_SCOPE.MALAYSIA,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Malaysia',
    navLabel: 'Malaysia',
    locale: 'ms-MY',
    hreflang: 'ms',
    primaryKeyword: 'kod redeem fc mobile',
    secondaryKeywords: ['kod redeem fc mobile malaysia', 'kod fc mobile malaysia', 'tebus kod fc mobile malaysia', 'ea kod redeem malaysia'],
    title: 'Kod Redeem FC Mobile Malaysia | Senarai Global Terkini',
    metaDescription:
      'Halaman tebus kod FC Mobile khusus untuk Malaysia. Ikuti senarai kod global dengan konteks tempatan, panduan FAQ unik, dan status kod terkini.',
    h1: 'Kod Redeem FC Mobile untuk Malaysia',
    intro:
      'Gunakan halaman Malaysia ini untuk mengikuti kod redeem FC Mobile global dengan konteks tempatan yang lebih sesuai untuk pemain MY.',
    globalCodeNote:
      'Sebahagian besar adalah kod kempen global. Kami hanya menandakan kod khas Malaysia apabila EA menetapkan sekatan serantau yang jelas.',
    copy: {
      eyebrow: 'Panduan pemain Malaysia',
      lastUpdatedLabel: 'Kemas kini terakhir untuk pemain Malaysia:'
    },
    faqEntries: [
      {
        question: 'Adakah kod redeem FC Mobile ini eksklusif untuk Malaysia?',
        answer:
          'Tidak. Halaman ini kebanyakannya memaparkan kod FC Mobile global untuk pemain Malaysia. Sebarang had kawasan EA akan dinyatakan dengan jelas.'
      },
      {
        question: 'Mengapa terdapat halaman Malaysia jika senarainya adalah global?',
        answer:
          'Ia menyediakan teks, carian dan konteks FAQ khas untuk Malaysia sambil menggunakan sumber data global yang sama.'
      },
      {
        question: 'Bolehkah kod global gagal untuk akaun pemain Malaysia?',
        answer:
          'Ya. Ia boleh gagal jika sudah tamat tempoh, had penebusan habis, dihadkan kepada akaun, atau terikat dengan kempen EA yang mengecualikan rantau kelayakan anda.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Kod Redeem FC Mobile', path: '/fc-mobile-redeem-codes' },
      { name: 'Malaysia', path: '/my/kod-redeem-fc-mobile' }
    ]
  },
  [REDEEM_ROUTE_KEY.VIETNAM]: {
    key: REDEEM_ROUTE_KEY.VIETNAM,
    path: '/vn/code-fc-mobile-vn',
    scope: REDEEM_CODE_SCOPE.VIETNAM,
    includeGlobalScope: false,
    sharedGlobalCodes: false,
    todayOnly: false,
    countryLabel: 'Vietnam',
    navLabel: 'Vietnam',
    locale: 'vi-VN',
    hreflang: 'vi',
    primaryKeyword: 'code fc mobile vn',
    secondaryKeywords: ['code fc mobile vn hôm nay', 'code fc mobile vn mới nhất'],
    title: 'Code FC Mobile VN | Cập Nhật Mới Nhất Hôm Nay (Tháng 8 2026)',
    metaDescription:
      'Tổng hợp danh sách code FC Mobile VN mới nhất hôm nay. Nhận ngay quà tặng độc quyền với các mã code chưa hết hạn trong tháng 8 2026.',
    h1: 'Code FC Mobile VN',
    intro:
      'Theo dõi các code FC Mobile VN mới nhất hôm nay. Nhanh chóng kiểm tra phần thưởng đang hoạt động và sao chép các code hiện có dành cho FC Mobile tại Việt Nam.',
    globalCodeNote: '',
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
      { name: 'Vietnam', path: '/vn/code-fc-mobile-vn' }
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
    hreflang: 'th',
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
    hreflang: 'ar',
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
    hreflang: 'pt',
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
    hreflang: 'de',
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
    hreflang: 'es',
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
    hreflang: 'tr',
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
    hreflang: 'ru',
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
    REDEEM_ROUTE_KEY.INDONESIA,
    REDEEM_ROUTE_KEY.MALAYSIA,
    REDEEM_ROUTE_KEY.VIETNAM,
    REDEEM_ROUTE_KEY.THAILAND,
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
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDONESIA].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.MALAYSIA].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.THAILAND].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.UAE].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.PORTUGAL].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GERMANY].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.SPAIN].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.TURKEY].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.RUSSIA].path
  ],
  [REDEEM_CODE_SCOPE.INDONESIA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDONESIA].path],
  [REDEEM_CODE_SCOPE.MALAYSIA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.MALAYSIA].path],
  [REDEEM_CODE_SCOPE.VIETNAM]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.VIETNAM].path],
  [REDEEM_CODE_SCOPE.THAILAND]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.THAILAND].path],
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
