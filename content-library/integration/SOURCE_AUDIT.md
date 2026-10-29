# ممیزی منبع محتوای SHOMARA

- تاریخ ممیزی: 2026-10-28
- وضعیت originals: `SOURCE_ONLY` و byte-protected
- دامنه: ۱۰ منبع اصلی، ۲۵ ایستگاه، ۱۵۰ صفحهٔ کار، ۱۰۰ مهارت پیشنهادی، ۱۵ الگوی تعامل، ۲۳۲ ردیف metadata صوت
- نتیجه: منابع برای برنامه‌ریزی و authoring بسیار ارزشمندند، اما فقط ST07 مشخصات کامل دارد و هیچ صدای قابل پخشی یا artwork نهایی تحویل نشده است.

## ۱. آنچه واقعاً در منابع وجود دارد

| منبع | خروجی قابل استفاده | مرز اعتبار |
|---|---|---|
| `shomara-stage1-study.md` | نگاشت ۲۵ بخش و ۱۵۰ صفحهٔ کار، نخستین ظهور مفهوم‌ها | جزئیات تصویر و تطابق کتاب معلم نمونه‌ای بررسی شده است |
| `shomara-external-research.md` | مقایسهٔ برنامه‌های درسی و اصول یادگیری فعال/معنادار | گزارش پژوهش است، نه requirement محصول |
| `shomara-stage2-research.md` | شواهد feedback، scaffolding، لمس کودک، صدا و game rules | بعضی عددهای زمان/صدا و دادهٔ بازار تأیید نشده‌اند |
| `shomara-stage4-architecture.md` | پیشنهاد `STk = unit k`، ۲۵ کارت ایستگاه و ۱۰۰ مهارت | نام هشت ایستگاه و پنج فصل تصمیم باز است |
| `shomara-stage5-shared-references.md` | قرارداد پیشنهادی صوت، حرکت، feedback و T01–T15 | زمان‌ها، toleranceها، voice و haptic نیازمند آزمون‌اند |
| `shomara-stage6-spec-format.md` | authoring schema، lifecycle و ۱۱ validation rule | schema نهایی runtime/API نیست |
| `shomara-stage7-pilot-ST07.md` | تنها پایلوت کامل P1–P5 و acceptance criteria | status آن `draft` است و conflictهای زیر باید حل شوند |
| دو CSV صوتی | ۱۷۹ ردیف global و ۵۳ ردیف ST07 | همه `draft`؛ فایل صوتی، duration، checksum فایل و rights ندارند |

## ۲. اصولی که باید وارد محصول شوند

1. مسیر آموزشی: ملموس ← تصویری ← نمادی، با مرور مارپیچی بین ایستگاه‌ها.
2. بازی ابزار آموزش است؛ هر interaction باید هدف آموزشی و acceptance قابل سنجش داشته باشد.
3. P1 کشف بدون نمره، P2 تمرین هدایت‌شده، P3 بازی، P4 سنجش مستقل و P5 انتقال/مرور؛ این پنج macro باید روی state machine سرور نگاشت شوند، نه جایگزین آن.
4. feedback فوری، کوتاه، تشریحی و غیرتنبیهی؛ بدون صدای منفی، قرمزِ تنها، lives یا اقتصاد پاداش.
5. دستور با صدا + تصویر/آیکون + متن کوتاه؛ audio missing هرگز lesson را قفل نمی‌کند.
6. target آموزشی کودک ترجیحاً 72–80dp، فاصلهٔ کافی و جایگزین tap برای drag.
7. RTL نباید محور عدد، جهت نماد مقایسه، عقربهٔ ساعت یا هندسه را آینه کند.
8. هیچ answer/evaluator از فایل authoring وارد child client نمی‌شود؛ correctness و next step سروری می‌ماند.

## ۳. conflict و تصمیم‌های باز

| ID | نوع | شواهد | اقدام لازم | مانع کدام gate |
|---|---|---|---|---|
| `CONTENT-001` | `SOURCE_CONFLICT` | Stage5/T13 نوشتن ۱ از پایین به بالا را می‌پذیرد؛ ST07 asset آن را بالا به پایین توصیف می‌کند | تطبیق با کتاب و تأیید متخصص آموزش؛ سپس یک stroke asset canonical | ST07 T13 validation |
| `CONTENT-002` | `SOURCE_CONFLICT` | Stage4 ارزیابی پرش را ۵ سؤال تعریف می‌کند؛ ST07 دارای `question_count: 1` و سه pool entry است | contract واحد برای station/chapter jump ثبت شود | ST07 jump test |
| `CONTENT-003` | `SOURCE_CONFLICT` | ST07 بخش ۴ را «بدون کمک» می‌داند، ولی بعضی آیتم‌های pool فیلدهای `h1/h2/h3` دارند | validator باید hint reference را در P4/P5 رد کند یا policy صریحاً تغییر کند | independent assessment |
| `CONTENT-004` | `OPEN_DECISION` | هشت نام ایستگاه و نام پنج فصل با محتوای کتاب هم‌خوان نیست | تصمیم owner قبل از انتشار path copy؛ ID ایستگاه ثابت بماند | N05 path copy |
| `CONTENT-005` | `OPEN_DECISION` | محتوای دینی ST08/ST15/ST20/ST23 و عکس‌های کتاب | بستهٔ خنثی اول یا بستهٔ فرهنگی جدا؛ artwork کتاب کپی نشود | authoring batch |
| `CONTENT-006` | `OPEN_DECISION` | voice دلارا/فرید، rate `-15%` و سبک نیمه‌رسمی فقط پیشنهادند | نمونه‌شنوی فارسی، rights و approval انسانی | audio approval |
| `CONTENT-007` | `OPEN_DECISION` | haptic پیش‌فرض و منبع SFX تعیین نشده | تصمیم settings/licensing و آزمون دستگاه | N07/N08 QA |
| `CONTENT-008` | `CONTRACT_BOUNDARY` | YAML پایلوت answer دارد؛ client مجاز به answer key نیست | authoring/evaluator فقط backend؛ client DTO باید stripped باشد | N06 schema |
| `CONTENT-009` | `MISSING_ARTIFACT` | ۴۱ asset فقط توصیف شده‌اند | coded/original/licensed assets با provenance تولید شود | ST07 visual QA |
| `CONTENT-010` | `MISSING_ARTIFACT` | ۲۳۲ CSV row فایل صوتی نیستند | CMS باید فایل، duration، checksum، version و approval بسازد | N07 audio gate |
| `CONTENT-011` | `UNVERIFIED_VALUE` | زمان motion، tolerance 28dp، replay 8s، rate و LUFS اولیه‌اند | device/child test؛ اعداد به token/config قابل تنظیم تبدیل شوند | N08 UX gate |
| `CONTENT-012` | `QUALITY_GAP` | ۲۴ ایستگاه جز ST07 spec کامل ندارند | تولید در پنج batch پس از پذیرش pilot و validator | N08 curriculum gate |
| `CONTENT-013` | `SCHEMA_GAP` | CSV فقط script metadata دارد؛ lifecycle صوت Stage5 با schema Stage6/CSV و مدل asset یکی نیست | مدل جداگانهٔ script/asset، lifecycle canonical، version/checksum/rights/review evidence | N07 audio/CMS |
| `CONTENT-014` | `UNVERIFIED_SEMANTICS` | قبولی ۳ از ۴، unlock پس از ناکامی و jump یک/پنج‌سؤالی پیشنهادهای ناسازگار یا آزمایش‌نشده‌اند | decision record و config سروری نسخه‌دار؛ child/device evidence | N06/N08 progression |
| `CONTENT-015` | `SCHEMA_GAP` | `advance` و `interaction` prose هستند؛ lifecycle کوتاه Stage6 با promotion repo و review-roleها هم‌معنا نیست | schema typed، نگاشت lifecycle و validatorهای graph/coverage/review | N06 authoring |
| `CONTENT-016` | `CURRICULUM_SCOPE` | T08 شبکهٔ ۹×۹ از ST12، ST23 مقایسهٔ دورقمی و ST25 عدد ۱۰۰ مرز پایه/بار شناختی دارند | review متخصص پایه اول و تصمیم include/modify/defer | N08 curriculum gate |
| `CONTENT-017` | `SOURCE_CONFLICT` | T11 می‌گوید صدا همیشه موجود باشد؛ سیاست سراسری نبود صدا را non-blocking می‌داند | قرارداد `audio expected, never blocking` و acceptance آفلاین/مفقود | N06/N07 audio fallback |
| `CONTENT-018` | `PRIVACY_BOUNDARY` | Stage5 رویداد `attempt` را با پاسخ خام و correctness پیشنهاد می‌کند | data minimization، منع answer key، policy retention/consent و privacy review | N06/N10 telemetry |

جزئیات نگاشت schema و CMS در `AUTHORING_CONTRACT_GAPS.md` است. هیچ عامل کدنویسی مجاز نیست این موارد را با حدس ببندد. تصمیم یا resolution باید کنار ID مربوط ثبت شود.

## ۴. الگوی الهام‌گیری

- از Duolingo: micro-loop، CTA روشن، feedback سریع، تمرین کوتاه و progression قابل فهم.
- از AVA: فقط الگوهای معماری/فرایندی اثبات‌شده؛ هیچ کد، asset یا هویت محصول کپی نمی‌شود.
- هویت نهایی SHOMARA بر کتاب درسی، فارسی/RTL، آرامش کودک و server truth استوار می‌ماند.

## ۵. تعریف Done محتوایی

یک ایستگاه تنها وقتی قابلیت `ENABLED` دارد که schema/validator، review آموزشی، asset rights، audio approval، server evaluator، offline package، accessibility/device test و owner approval همگی evidence داشته باشند. عبور static validator به‌تنهایی فقط `VALIDATED` است.
