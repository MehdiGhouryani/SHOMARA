# بستهٔ تصمیم مالک — O5: هویت محلی تک‌پروفایل یا چندپروفایل

- تاریخ تهیه: 2026-11-18
- وضعیت: **برای تصمیم مالک؛ هیچ گزینه‌ای در این سند تصویب نشده است.**
- حاکم: `docs/architecture/INFRASTRUCTURE_OWNER_DECISIONS_FA.md`، بخش O5.
- قرارداد محصول: ADR-0039 (Accepted, 2026-11-05) — کاملاً آفلاین، بدون حساب/سرور؛ هویت کودک و PIN والد کاملاً محلی.
- هدف: جلوگیری از migration سنگین progress و حفظ privacy و جداسازی دادهٔ کودکان.

## 1. تصمیم موردنیاز

O5 می‌پرسد launch اپ برای یک کودک محلی است یا چند کودک با انتخاب پروفایل در launch.

| گزینه | تجربه | مزیت | هزینه/ریسک |
|---|---|---|---|
| A — تک‌پروفایل در نسخهٔ اول | یک پروفایل محلی فعال؛ بدون صفحهٔ انتخاب پروفایل در launch | ساده‌ترین onboarding، کمترین احتمال ورود به دادهٔ کودک دیگر، مسیر کوتاه‌تر برای cutover آفلاین | خانوادهٔ چندکودکی باید در یک پروفایل مشترک بماند یا تا پشتیبانی چندپروفایل صبر کند |
| B — چندپروفایل با انتخاب در launch | فهرست نام/آواتار؛ انتخاب کودک پیش از نمایش Home و هر progress | مناسب مدرسه/خانوادهٔ چندکودکی، جداسازی درست پیشرفت و تنظیمات | صفحهٔ انتخاب و مدیریت پروفایل، switch/reset/delete flows و تست‌های cross-profile لازم؛ انتخاب اشتباه می‌تواند دادهٔ کودک دیگری را نمایش دهد |

**متن منبع O5:** پیشنهاد مهندسی موجود برای نسخهٔ اول گزینهٔ A است، با schema دارای `childProfileId` از روز اول تا B بعداً بدون migration تخریبی باز بماند. این پیشنهاد مالکانه تصویب نشده است.

## 2. شواهد فعلی مخزن

| محل | وضعیت فعلی | پیامد |
|---|---|---|
| `PreferencesProfileDraftStore` | DataStore draft شامل name/avatarId/gradeId؛ فقط برای resume فرم ناقص | این draft، پروفایل واقعی/فعال نیست و identity پایدار تولید نمی‌کند |
| `progress_projections` | Room PK = (learningIdentityId, stationId)؛ مدل دامنه آن را آخرین projection تأییدشده تعریف می‌کند | هنوز identity محلی کودک به آن متصل نیست؛ استفاده از token یا نام کودک به‌عنوان ID مجاز نیست |
| `LearningEntities.kt` | comment و schema صریحاً جدول profile را به O5 موکول کرده‌اند | افزودن جدول پیش از رأی O5 برخلاف قرارداد فعلی schema است |
| `ParentPinManager` | PBKDF2-HMAC-SHA256 + salt و lockout روی interface | concrete local profile store و ParentGate wiring هنوز اثبات نشده |
| `ShomaraChildShellHost` | progress default به حالت unresolved fail-closed تغییر کرده؛ Path و Practice تا resolve شدن snapshot، Loading می‌مانند | این guard مانع نمایش Fresh/Locked ساختگی است، اما local identity/progress هنوز تولید نمی‌کند |

## 3. توصیهٔ مهندسی غیرمصوب

**گزینه A برای release اول، با قابلیت مهاجرت به B از طریق شناسهٔ پروفایل در schema.**

دلایل:
1. تصمیم صریح محصول ADR-0039، local-only است؛ حساب یا بازیابی سروری راه‌حل نیست.
2. ساده‌سازی اولین اجرا برای کودک و والد مهم‌تر از ورود زودهنگام به مدیریت خانوادهٔ چندپروفایلی است.
3. schema باید از ابتدا هر ردیف progress/session/attempt را به یک `childProfileId` پایدار نسبت دهد؛ در آینده می‌توان چند ردیف پروفایل را بدون انتقال progress از شناسه‌های مبهم وارد کرد.
4. تا وقتی پروفایل محلی واقعی ساخته و بازیابی نشده، Home باید در Loading بماند؛ پیشرفت صفر به معنی کودک جدید نیست.

این توصیه تصمیم مالک نیست و فقط پس از پاسخ صریح O5 قابل اجراست.

## 4. اثر معماری گزینهٔ A

### دادهٔ پیشنهادی (پس از تصویب)
- Room: جدول `child_profiles` با `childProfileId` تصادفی و پایدار، `name`, `avatarId`, `gradeId`, `createdAtMs`, `updatedAtMs`, `isDeleted`/lifecycle.
- Room: progress، session، attempt، mastery و history به `childProfileId` متصل شوند؛ هیچ join یا lookup با نام کودک انجام نشود.
- DataStore: فقط `activeChildProfileId` و تنظیمات سبک/غیرحساس؛ نام و progress در DataStore انباشته نشود.
- Profile draft فعلی فقط draft باقی بماند؛ پس از validation، به رکورد پایدار Room تبدیل شود و draft در یک transaction/flow کنترل‌شده پاک شود.
- اگر migration از دیتای قبلی لازم شد، fallback destructive ممنوع است؛ پیشرفت بدون owner identity باید quarantined/legacy بماند، نه اینکه به پروفایل فرضی متصل شود.

### Launch / lifecycle
1. خواندن `activeChildProfileId` از DataStore.
2. resolve کردن همان شناسه در Room؛ نبود/خرابی reference باید به Recovery/Onboarding برود، نه fallback خاموش به پروفایل دیگر.
3. اگر پروفایل وجود ندارد: onboarding محلی و ذخیرهٔ پروفایل.
4. اگر وجود دارد: load کردن progress با همان `childProfileId`، سپس عبور از Loading به Home Ready.
5. Sign-out سروری حذف می‌شود؛ مسیر ParentGate با PIN محلی باز و بسته می‌شود.

### امنیت و privacy
- Parent PIN فقط hash+salt و پارامتر نسخه‌دار؛ plaintext یا PIN در logs/analytics/Room profile row ذخیره نشود.
- `childProfileId` یک شناسهٔ تصادفی باشد؛ از شماره تلفن، نام یا شناسهٔ قابل حدس استفاده نشود.
- حذف پروفایل باید در یک use case واحد، profile و تمام progress/session/attempt/cache متعلق را پاک کند؛ فایل‌های media مشترک فقط وقتی پاک شوند که reference دیگری نداشته باشند.
- اگر حذف تنها پروفایل انجام شود، اپ باید به onboarding برگردد و دادهٔ قبلی را به پروفایل جدید نسبت ندهد.

## 5. اگر مالک گزینهٔ B را انتخاب کند

- مدل دادهٔ بالا همچنان معتبر است؛ تفاوت در تعداد رکوردها و UX انتخاب/مدیریت است.
- قبل از هر deep link، Home، Practice، Profile، Settings یا Parent screen باید active profile resolve شود.
- switching profile باید active ID را اتمیک تغییر دهد و تمام screen state، navigation back stack، pending deep links، sheet، ViewModel و cached flows را به هویت جدید تعویض کند.
- تست اجباری: A→B switch، process death، B delete، duplicate display names، orphan progress، PIN parent, cross-profile isolation و deep-link while switching.
- هیچ snapshot متعلق به پروفایل قبلی پس از switch نباید در یک frame یا restore state به کودک جدید نشان داده شود.

## 6. تصمیم‌های وابسته و مستقل

| تصمیم | وابستگی |
|---|---|
| O3 — fate of LessonGateway | برای حذف کامل server transport در Phase 2 نیازمند رأی جداگانه است |
| O1/O2 — evaluator/content schema | برای package و lesson progression باز است؛ O5 آن‌ها را خودکار تصویب نمی‌کند |
| O6 — CMS/authoring | مستقل از انتخاب تک/چندپروفایل |
| O4 — Room/DataStore | قبلاً APPROVED؛ تغییر نمی‌کند |
| ADR-0039 — offline/no-server | قبلاً ACCEPTED؛ O5 آن را باز نمی‌کند |

## 7. گیت پذیرش O5

- مالک صریحاً A یا B را انتخاب کند، همراه تاریخ.
- پاسخ در `INFRASTRUCTURE_OWNER_DECISIONS_FA.md` ثبت و یک ADR/decision log تکمیل شود.
- Schema migration و privacy/deletion threat model پیش از پیاده‌سازی تثبیت شود.
- تست‌های profile lifecycle، Room migration، cross-profile isolation و process restore نوشته شوند.
- سپس Phase 2 local identity/OTP retirement شروع شود.

**تا زمان رأی مالک:** O5 = OPEN؛ هیچ table/selection UI/cutover تخریبی ساخته نمی‌شود. Home و Practice فقط از حالت unresolved استفاده می‌کنند و هیچ پیشرفت ساختگی نشان نمی‌دهند.
