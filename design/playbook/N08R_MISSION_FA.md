# N08R — Native UI/UX Visual Refinement (Duolingo-level, Clay)

> **وضعیت:** سند canonical مأموریت فاز N08R. ثبت‌شده در `harness/roadmap.json` (فاز N08R، 2026-11-07).
> **منبع:** دستور مستقیم مالک پروژه (متن کامل، بدون تغییر، در بخش بعد). ثبت‌کننده: ZCode در شاخهٔ `native/n08r-ui-polish`.
> **محدودهٔ اجرا:** فقط فاز N08R — دو صفحهٔ Splash و Profile Setup محافظت‌شده مطلق؛ منطق دامنه دست‌نخورده؛ متن/asset تازه بدون تصویب مالک ممنوع. این سند جای `AGENTS.md`/`START_HERE.md` را نمی‌گیرد.

---

# SHOMARA — Native UI/UX Transformation Mission
## Duolingo-Level Product Experience & Premium Native Implementation

تو در این مأموریت نقش یک تیم ارشد متشکل از افراد زیر را بر عهده داری:

- Principal Product Designer
- Senior Mobile UI/UX Designer
- Staff Android Engineer
- Jetpack Compose Specialist
- Design System Architect
- Mobile Interaction & Motion Designer
- Accessibility Engineer
- Senior QA Engineer

هدف، صرفاً زیباتر کردن چند صفحه نیست.

هدف، تبدیل تجربه کاربری SHOMARA به یک محصول آموزشی کودکانه در سطح کیفی Duolingo است؛ محصولی که از نظر ساختار صفحات، روان بودن تعاملات، جذابیت بصری، جزئیات طراحی، بازخوردهای تعاملی و کیفیت اجرای Native، حرفه‌ای و یکپارچه باشد.

تمام تغییرات باید در راستای هویت مستقل SHOMARA انجام شوند.

---

# 1. MISSION OBJECTIVE

محصول باید به این ویژگی‌ها برسد:

1. UI کاملاً مدرن، حرفه‌ای، جذاب و کودک‌پسند باشد.
2. تجربه کاربری بسیار روان، سریع و قابل فهم باشد.
3. تعامل با تمام اجزای صفحه حس Native و طبیعی داشته باشد.
4. انیمیشن‌ها نرم، هدفمند و بدون لگ باشند.
5. رنگ‌ها هویت مشخص و هماهنگ داشته باشند.
6. مسیر یادگیری و پیشرفت کودک انگیزه‌بخش و قابل فهم باشد.
7. تمام صفحات از یک Design System واحد استفاده کنند.
8. هیچ صفحه‌ای حس یک صفحه وب معمولی یا یک نمونه اولیه ناقص نداشته باشد.
9. تمام صفحات در دستگاه واقعی Android با Jetpack Compose کیفیت مطلوب داشته باشند.
10. کیفیت نهایی در سطح یک اپلیکیشن تجاری قابل انتشار باشد.

**اصل اساسی:**

هر صفحه باید طوری طراحی شود که انگار توسط یک تیم حرفه‌ای Product Design برای یک اپلیکیشن آموزشی بین‌المللی طراحی و پیاده‌سازی شده است.

فقط ظاهر را تغییر نده. تجربه را متحول کن.

# 2. FIRST: READ THE PROJECT, DO NOT GUESS

پیش از هر تغییری، ساختار واقعی پروژه را مطالعه کن.

ترتیب اجباری:

1. AGENTS.md
2. START_HERE.md
3. ZCODE.md
4. docs/delivery/SHOMARA_FINAL_CHAT_HANDOFF.md
5. design/MASTER.md
6. design/INSPIRATION_GUARDRAILS.md
7. design/playbook/PAGE_UIUX_BLUEPRINT.md
8. design/playbook/ROUTE_REGISTRY.md
9. design/playbook/COMPONENT_READINESS.md
10. design/playbook/NATIVE_IMPLEMENTATION.md
11. design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv
12. design/playbook/quality/SCREEN_LEDGER.csv
13. Skillهای زیر:
   - skills/shomara-product-design/SKILL.md
   - skills/shomara-design-system/SKILL.md
   - skills/shomara-screen-execution/SKILL.md

همچنین باید دستورات زیر اجرا شوند:

```bash
git status --short --branch
git log -5 --oneline

node tools/harness.mjs validate
node tools/harness.mjs status
node tools/harness.mjs next
node tools/harness.mjs resume
```

تمام تغییرات فعلی Git را حفظ کن.

مستقیماً روی main کار نکن.

از معماری، قراردادها، تست‌ها و تصمیم‌های قبلی پروژه تخطی نکن.

# 3. STRICTLY PROTECTED SCREENS — DO NOT REDESIGN

این مهم‌ترین محدودیت کل مأموریت است.

دو قسمت از UI از نظر طراحی و UX تأیید شده‌اند و باید بدون هیچ تغییر بصری حفظ شوند.

## Protected Screen A — Splash / Loading

صفحه Splash و تجربه Loading ابتدایی SHOMARA تکمیل شده است.

مرجع Native:

`apps/android/core/designsystem/src/main/kotlin/com/mathlearning/core/designsystem/ShomaraSplashScreen.kt`

همراه با فایل‌های Spec و Drawable مربوط به Splash.

قوانین:

- ترکیب‌بندی صفحه تغییر نکند.
- رنگ‌ها تغییر نکنند.
- اندازه و جایگاه تصاویر تغییر نکند.
- تایپوگرافی تغییر نکند.
- لوگو و هویت بصری تغییر نکند.
- انیمیشن و رفتار Loading تغییر نکند.
- فاصله‌ها، حاشیه‌ها و نسبت تصویر تغییر نکنند.
- صرفاً برای هماهنگی با صفحات دیگر، این صفحه را بازطراحی نکن.

## Protected Screen B — Child Profile Setup

صفحه‌ای که کودک نام، آواتار و پایه تحصیلی خود را وارد می‌کند، از نظر UI/UX تأیید شده است.

مرجع Expo V2:

`apps/mobile/src/onboarding/views2/ProfileView2.tsx`

معادل Native:

`apps/android/feature/onboarding/src/main/kotlin/com/mathlearning/feature/onboarding/ProfileScreens.kt`

در Native، محدوده حفاظت شامل Composable مربوط به `ShomaraProfileScreen` است.

قوانین:

- Layout فعلی حفظ شود.
- ترتیب فیلدها و بخش‌ها تغییر نکند.
- طراحی انتخاب آواتار تغییر نکند.
- طراحی انتخاب پایه تغییر نکند.
- متن‌ها و محتوای صفحه دست‌کاری نشوند.
- اندازه‌ها، فاصله‌ها، رنگ‌ها و انیمیشن‌های این صفحه تغییر نکنند.
- اجزای مشترک این صفحه نباید با تغییرات عمومی Design System ظاهر متفاوتی پیدا کنند.

نکته: اگر فایل ProfileScreens شامل کامپوننت دیگری برای Placement باشد، ممنوعیت تغییر فقط مربوط به بخش Profile تأییدشده است؛ نه کل فایل.

### Mandatory Visual Regression

قبل از تغییر Design System، وضعیت این دو صفحه را ثبت کن.

در صورت امکان از نسخه Native و Expo تصویر واقعی بگیر.

برای صفحه‌های محافظت‌شده، Screenshot Regression تعریف کن.

در پایان:

- Splash باید از نظر بصری بدون تغییر باقی بماند.
- Profile Setup باید از نظر بصری بدون تغییر باقی بماند.
- تغییرات عمومی Theme و Token نباید ناخواسته ظاهر آن‌ها را تغییر دهند.

اگر محیط برای ثبت Screenshot واقعی آماده نیست، وضعیت را NATIVE_PENDING یا BLOCKED_ENV ثبت کن. هیچ مدرک ساختگی تولید نکن.

**هیچ دلیلی برای زیباتر کردن مجدد این دو صفحه پذیرفته نیست.**

# 4. PRODUCT DESIGN REFERENCE — DUOLINGO

Duolingo مرجع اصلی الگوهای تجربه یادگیری و تعامل است.

هدف، الگوبرداری عمیق از اصول طراحی و رفتار آن است؛ نه کپی برند.

از این ویژگی‌ها استفاده کن:

### A. Visual hierarchy

- تمرکز بصری کاملاً مشخص.
- عنصر اصلی هر صفحه سریع قابل تشخیص باشد.
- تیترها، توضیحات و CTAها سلسله‌مراتب واضح داشته باشند.
- فضای خالی به‌اندازه و حساب‌شده استفاده شود.
- از شلوغی غیرضروری جلوگیری شود.

### B. Learning journey

- مسیر یادگیری باید حس پیشرفت واقعی داشته باشد.
- موقعیت فعلی کودک واضح باشد.
- مرحله‌های تکمیل‌شده، فعلی و قفل‌شده قابل تشخیص باشند.
- حرکت در مسیر طبیعی و قابل فهم باشد.
- انتقال از مسیر به صفحه درس بدون اصطکاک انجام شود.

### C. Lesson experience

در صفحات آموزشی:

- سؤال باید مهم‌ترین عنصر صفحه باشد.
- انتخاب پاسخ باید بسیار واضح و لمسی باشد.
- پس از تعامل، بازخورد فوری و قابل فهم نمایش داده شود.
- حالت انتخاب، پاسخ صحیح، تلاش مجدد و خطا باید طراحی مشخص داشته باشند.
- انتقال میان مراحل باید نرم باشد.
- پیشرفت درس همیشه قابل درک باشد.
- هیچ بازخوردی نباید کودک را تحقیر یا مضطرب کند.

### D. Micro-interactions

از تعاملات باکیفیت استفاده کن:

- Press feedback
- Spring animation
- Smooth transitions
- Selected state animation
- Progress animation
- Subtle scale feedback
- Bottom-sheet transitions
- Tactile button feedback
- Appropriate haptic feedback

هیچ انیمیشنی صرفاً برای تزئین اضافه نشود.

هر انیمیشن باید هدف مشخصی داشته باشد.

### E. Character usage

شخصیت‌های SHOMARA باید به تجربه شخصیت بدهند.

- در موقعیت مناسب راهنمای کودک باشند.
- احساسات متناسب با وضعیت نشان دهند.
- بیش از اندازه بزرگ یا تکراری نباشند.
- فضای آموزش را از محتوای اصلی منحرف نکنند.
- از Assetهای واقعی و تأییدشده خود پروژه استفاده شود.

لوگو، شخصیت، جغد، متن، فونت و Asset اختصاصی Duolingo نباید کپی شود.

# 5. COLOR SYSTEM REDESIGN

یکی از اهداف اصلی این مأموریت، ارتقای پالت رنگی و هویت بصری SHOMARA است.

پالت فعلی را بررسی انتقادی کن.

به یک سیستم رنگی حرفه‌ای، شاد، گرم، متعادل و مناسب آموزش کودکان برس.

### Recommended visual direction

جهت هنری پیشنهادی:

**Modern Educational Garden / Premium Playful Native UI**

ویژگی‌ها:

- Warm Cream برای زمینه‌های اصلی
- Botanical Green برای رنگ اصلی و اقدامات مهم
- Soft Amber برای تأکید بصری
- Berry برای شخصیت و عناصر ثانویه
- Soft Sky Blue برای اطلاعات
- Warm Neutral برای Surfaceها
- Dark Ink برای متن و خوانایی
- Coral فقط برای خطاها و وضعیت‌های واقعاً هشداردهنده

رنگ‌ها نباید کودکانه و بیش از حد جیغ باشند.

پالت باید از نظر زیبایی، خوانایی، سازگاری و هویت برند حرفه‌ای باشد.

### مهم: Canonical Tokens

منبع اصلی توکن‌ها:

`packages/design-system/src/tokens.json`

یک اختلاف مستند میان جهت توصیف‌شده در `design/MASTER.md` و مقادیر فعلی `tokens.json` وجود دارد.

پیش از تغییر رنگ‌ها:

1. اختلاف را دقیق ثبت کن.
2. ADRها و تصمیم‌های قبلی را بررسی کن.
3. یک پالت پیشنهادی منسجم تعریف کن.
4. Contrast ratio تمام رنگ‌های مهم را محاسبه و بررسی کن.
5. رنگ متن روی زمینه و رنگ نوشته روی دکمه‌ها را ارزیابی کن.
6. اثر تغییر توکن‌ها روی دو صفحه Protected را بررسی کن.
7. سپس منبع Canonical را اصلاح کن.
8. خروجی‌های Generated را فقط از طریق Generator رسمی پروژه بساز.

هیچ Hex Color پراکنده‌ای در صفحات اضافه نکن.

در صورت نیاز، برای حفظ دقیق ظاهر صفحات Protected، از Semantic Token یا Variant مستقل و کنترل‌شده استفاده کن.

پالت جدید باید در سایر صفحات هماهنگ باشد و نباید به یک مجموعه رنگ تصادفی از صفحات متفاوت تبدیل شود.

حداقل الزامات Contrast:

- متن عادی: 4.5:1
- متن بزرگ و مرزهای کنترلی مهم: 3:1

وضعیت‌ها فقط با رنگ منتقل نشوند؛ از شکل، آیکون، متن و Semantics نیز استفاده کن.

# 6. UI/UX AREAS TO TRANSFORM

تمام صفحات غیرمحافظت‌شده باید بررسی شوند.

از قرارداد ۱۷ خانواده صفحه در:

`design/playbook/PAGE_UIUX_BLUEPRINT.md`

استفاده کن.

ترتیب اصلی اجرای پروژه مطابق Batchهای U0 تا U6 حفظ شود.

محدوده‌های بازطراحی:

## 6.1 Welcome / Onboarding / Authentication

Page Families 02 and 03

- Welcome
- مراحل ورود
- Phone
- OTP
- Progression بین مراحل
- خطاها و وضعیت‌های ورود

صفحه Welcome را با Splash اشتباه نگیر؛ فقط صفحه Splash محافظت‌شده است.

## 6.2 Child Navigation & Learning Path

Page Families 06 and 17

این بخش از مهم‌ترین نقاط تجربه محصول است.

به‌خصوص مسیر یادگیری باید از نظر بصری بسیار حرفه‌ای شود.

موارد مهم:

- ساختار فصل‌ها
- مسیر پیوسته یادگیری
- Nodeهای مسیر
- وضعیت تکمیل
- وضعیت فعلی
- قفل بودن مراحل
- Scroll experience
- Top bar
- Bottom navigation
- Active tab
- Transition بین تب‌ها
- بازگشت و Navigation behavior

سه تب کودک باید همان سه بخش قراردادی پروژه باشند:

مسیر / تمرین / من

هیچ تب اضافه‌ای بدون تصمیم محصول ساخته نشود.

## 6.3 Station Start

Page Family 07

صفحه شروع هر ایستگاه باید حرفه‌ای، خوش‌ساخت و دارای hierarchy مشخص باشد.

موارد مهم:

- معرفی هدف ایستگاه
- اطلاعات پیشرفت
- وضعیت شروع یا ادامه
- CTA اصلی
- حالت Locked
- حالت Offline
- حالت Loading
- طراحی مناسب برای اندازه‌های مختلف دستگاه

## 6.4 Lesson / Learning Experience

Page Families 08, 09, 10, 11

این بخش اولویت بسیار بالایی دارد.

چهار تجربه باید از نظر بصری یک خانواده واحد باشند:

1. Teach / Discover
2. Guided Practice
3. Assessment
4. Recovery / Result

با وجود هماهنگی، هر بخش باید شخصیت و hierarchy متناسب با هدف خودش را داشته باشد.

Assessment باید آرام‌تر و متمرکزتر از Teaching باشد.

هیچ منطق پاسخ، ارزیابی یا پیشرفت را در UI بازنویسی نکن.

## 6.5 Practice

Page Family 12

صفحه تمرین باید:

- قابل فهم باشد.
- تمرین‌های واقعی را نمایش دهد.
- وضعیت خالی مناسبی داشته باشد.
- وضعیت Locked روشن داشته باشد.
- دسترسی به تمرین‌های موجود آسان باشد.
- از کارت‌ها و لیست‌های بی‌دلیل و تکراری پرهیز کند.

داده ساختگی یا مأموریت غیرقابل‌دسترسی نمایش نده.

## 6.6 Challenge

Page Family 13

صفحه چالش باید از نظر تعامل، معرفی و نمایش Round کیفیت بالایی داشته باشد.

از حس Casino، جایزه‌بازی، Loot Box یا پاداش‌های اعتیادآور استفاده نکن.

## 6.7 Profile / Me

Page Family 14

پروفایل کودک باید:

- تمیز و خوش‌ساخت باشد.
- هویت کودک را نمایش دهد.
- پیشرفت واقعی را قابل فهم نشان دهد.
- با سایر بخش‌های اپ هماهنگ باشد.
- از اطلاعات ساختگی یا Badgeهای غیرواقعی استفاده نکند.

## 6.8 Avatar / Settings / Guardian

Page Family 15

این بخش باید از نظر ظاهری و تجربه تعامل به سطح محصولات حرفه‌ای برسد.

اما:

- اطلاعات والدین نباید وارد Shell کودک شود.
- تغییر Preference باید واقعاً ذخیره شود.
- وضعیت Save و Error واقعی باشد.
- Asset غیرواقعی اضافه نشود.
- تنظیمات دارای رفتار واقعی باشند.

## 6.9 System States

Page Family 16

تمام وضعیت‌های زیر باید طراحی یکپارچه داشته باشند:

- Loading
- Empty
- Offline
- Error
- Retry
- Disabled
- Success
- Pending Sync
- Missing Asset

هیچ Spinner بی‌نهایت یا صفحه بن‌بست نباید وجود داشته باشد.

# 7. PREMIUM NATIVE INTERACTION

مهم است که خروجی واقعاً Native باشد.

هدف Android Native با Kotlin و Jetpack Compose است.

به‌هیچ‌عنوان با اضافه کردن سایه، گوشه گرد و انیمیشن CSSمانند، حس Native را شبیه‌سازی نکن.

اصول:

- Compose-native transitions
- Smooth spring-based interaction
- State-driven UI
- Responsive layout
- Correct system-bar insets
- Proper gesture navigation
- IME-aware screens
- Native bottom sheets
- Correct focus management
- Real touch feedback
- Controlled haptics
- Reduced-motion support

دکمه‌ها باید حس لمس داشته باشند.

Cardهای انتخابی باید وضعیت انتخاب را به‌وضوح نمایش دهند.

انتقال بین صفحات نباید پرش بصری داشته باشد.

هیچ تغییر State نباید باعث Layout Shift غیرضروری شود.

تمام انیمیشن‌ها باید قابل لغو و سازگار با Reduced Motion باشند.

# 8. DESIGN SYSTEM — ONE SOURCE OF TRUTH

به‌جای اینکه هر صفحه را جداگانه طراحی کنی، ابتدا سیستم طراحی را تثبیت کن.

موارد زیر را بررسی و در صورت نیاز ارتقا بده:

- Color tokens
- Typography
- Spacing
- Radius
- Elevation
- Shadow
- Motion
- Buttons
- Cards
- Inputs
- Choice components
- Progress indicators
- Bottom navigation
- Feedback surfaces
- Dialogs
- Bottom sheets

قرارداد چهار سطح عمق Flat / Hint / Soft / Featured حفظ شود.

Clay فقط برای تأکید و حس لمسی استفاده شود.

هر صفحه نباید پر از Card و Shadow باشد.

در هر Viewport حداکثر یک سطح Featured داشته باش.

Assessment و صفحات تنظیمات باید آرام‌تر باشند.

تمام اجزای مشترک باید API مشخص، State Matrix و Accessibility Semantics داشته باشند.

# 9. ENGINEERING QUALITY

کیفیت کدنویسی به‌اندازه کیفیت طراحی اهمیت دارد.

قوانین:

1. معماری فعلی پروژه را حفظ کن.
2. از Kotlin و Jetpack Compose به‌صورت Native استفاده کن.
3. از Stateهای Immutable استفاده کن.
4. الگوی UDF را حفظ کن.
5. UI را از Domain و Data جدا نگه دار.
6. ViewModel مالک orchestration باشد.
7. صفحه‌ها مستقیماً Network یا Database را صدا نزنند.
8. منطق Business در Composable قرار نگیرد.
9. از Componentهای مشترک استفاده کن.
10. از تکرار کد جلوگیری کن.
11. Componentهای قبلی را بدون بررسی Consumerها حذف نکن.
12. وابستگی جدید غیرضروری نصب نکن.
13. API و Database را صرفاً برای تغییر UI بازنویسی نکن.
14. تست‌های موجود را حذف یا ضعیف نکن.
15. نام‌گذاری، ساختار و مسئولیت کلاس‌ها واضح باشند.

منطق زیر را دست‌کاری نکن:

- ارزیابی پاسخ
- Progression
- Mastery
- Unlock
- Station Pass
- Content lifecycle
- Authentication
- Persistence

UI فقط باید State معتبر موجود را نمایش دهد و Action مناسب صادر کند.

اگر اختلافی بین قراردادها، ADR و مستندات وجود داشت، قبل از تغییر منطق دامنه آن را ثبت کن و خودسرانه تصمیم نگیر.

# 10. ACCESSIBILITY & RESPONSIVENESS

هر صفحه باید در وضعیت‌های زیر بررسی شود:

- 360dp
- 390dp
- 412dp
- Font Scale 100%
- Font Scale 200%
- RTL
- Keyboard Open
- Offline
- Loading
- Error
- Reduced Motion
- TalkBack

حداقل اندازه Touch Target برابر 48dp باشد.

برای اشیای آموزشی پایه‌های پایین، در صورت اقتضای قرارداد صفحه، 72 تا 80dp ترجیح دارد.

متون فارسی نباید بریده شوند.

محتوای ریاضی باید جهت معنایی مستقل و صحیح داشته باشد.

CTA اصلی نباید زیر Keyboard یا System Navigation پنهان شود.

# 11. STRICT PAGE-BY-PAGE EXECUTION

این مأموریت را به‌صورت یک بازنویسی بزرگ و هم‌زمان اجرا نکن.

هر صفحه باید مستقلاً بررسی، طراحی، پیاده‌سازی و تأیید شود.

برای هر صفحه این چرخه را دقیقاً اجرا کن:

DISCOVER
→ OBSERVE
→ AUDIT
→ DESIGN
→ IMPLEMENT
→ TEST
→ CAPTURE
→ REVIEW
→ LEDGER
→ COMMIT

### Step 1 — Discover

- Route واقعی را پیدا کن.
- Composable مربوط به آن را پیدا کن.
- Stateها و Actionها را بررسی کن.
- Dependencyها و Componentهای مشترک را شناسایی کن.
- تست‌های مرتبط را مشخص کن.

### Step 2 — Observe

قبل از تغییر، UI فعلی را واقعاً اجرا و بررسی کن.

از صفحه Screenshot بگیر.

فقط با خواندن کد درباره ظاهر تصمیم نگیر.

### Step 3 — Audit

اشکالات را به سه سطح تقسیم کن:

P0: مشکل جدی در عملکرد یا دسترسی‌پذیری

P1: مشکل مهم در UX یا طراحی

P2: بهبود ظاهری، جزئیات و Micro-interaction

### Step 4 — Design

قبل از پیاده‌سازی مشخص کن:

- هدف صفحه چیست؟
- کاربر باید چه چیزی را ببیند؟
- Focal Object چیست؟
- تنها CTA اصلی کدام است؟
- سلسله‌مراتب بصری چگونه است؟
- رنگ‌ها و عمق‌ها چگونه استفاده می‌شوند؟
- چه انیمیشن‌هایی لازم هستند؟
- وضعیت‌های مختلف صفحه چگونه نمایش داده می‌شوند؟

### Step 5 — Implement

کد واقعی را پیاده‌سازی کن.

از کامپوننت‌های جدید و مشترک فقط در صورت نیاز استفاده کن.

فقط Mockup یا Preview تولید نکن.

تمام تعامل‌ها باید واقعی و متصل به منطق فعلی باشند.

### Step 6 — Test

تست‌های عملکردی، State، Navigation، Semantics و Visual Regression را اجرا کن.

### Step 7 — Capture

Screenshot قبل و بعد را ثبت کن.

اندازه دستگاه و State مورد بررسی باید مشخص باشد.

### Step 8 — Ledger

وضعیت صفحه را در:

`design/playbook/quality/SCREEN_LEDGER.csv`

به‌روزرسانی کن.

فقط در صورت وجود Evidence معتبر وضعیت آن را تغییر بده.

### Step 9 — Commit

برای هر صفحه یا Batch محدود، Checkpoint و Commit قابل بازبینی ایجاد کن.

پس از قبولی صفحه، به صفحه بعد برو.

برای هر صفحه منتظر تأیید مجدد مالک نمان؛ مگر آنکه با یک تصمیم واقعی محصول، محتوا، حریم خصوصی یا هویت بصری مواجه شوی که در اختیار مأموریت نیست.

# 12. EXECUTION ORDER

ترتیب اجرای صفحات باید با Dependencyهای موجود در Blueprint و Harness هماهنگ باشد.

ترتیب هدف:

**Batch U0 — Design Foundation**

- ممیزی و تثبیت Design Tokens
- هماهنگی Compose Theme
- بررسی Componentهای مشترک
- حفظ دو صفحه Protected

**Batch U1 — Onboarding**

- Welcome
- Authentication
- OTP
- Placement

Profile Setup محافظت‌شده است و نباید بازطراحی شود.

**Batch U2 — Main App**

- Child Navigation
- Learning Path
- Station Start

**Batch U3 — Learning Experience**

- Teach
- Guided Practice
- Assessment
- Recovery / Result

**Batch U4 — Practice**

- Practice Hub
- Challenge

**Batch U5 — Personalization**

- Profile / Me
- Avatar
- Settings
- Guardian

**Batch U6 — Final Quality**

- System States
- Cross-route Consistency
- Full Journey
- Accessibility
- Performance
- Regression Tests

هر صفحه باید Task مستقل، Acceptance Criteria و Evidence مشخص داشته باشد.

# 13. HARNESS & BRANCH GOVERNANCE

وضعیت فعلی Harness را دقیق بررسی کن.

طبق وضعیت موجود، N08-06 به تصمیم‌های N08-08 وابسته است و N09 فاز Cutover محسوب می‌شود.

این مأموریت نباید:

- N08-08 را دور بزند.
- تصمیم محتوایی را حدس بزند.
- N08-06 تا N08-12 را صوری تکمیل کند.
- N09 را زودتر شروع کند.
- Taskهای قبلی را بدون Evidence تغییر وضعیت دهد.

چون این درخواست یک مأموریت مستقل UI/UX است، ابتدا امکان ثبت یک فاز مستقل میان N08 و N09 را بررسی کن.

در صورت سازگاری با Schema و Validator، یک فاز مستقل مانند:

`N08R — Native UI/UX Visual Refinement`

با Branch مستقل:

`native/n08r-ui-polish`

تعریف کن.

این فاز باید:

- Allowed Paths مشخص داشته باشد.
- Taskهای مستقل و وابستگی‌های معتبر داشته باشد.
- برای هر خانواده صفحه Acceptance Criteria تعریف کند.
- مسیر تغییر Design Tokens و فایل‌های Generated را مجاز کند.
- از تغییر API، Database، Production Content و صفحات محافظت‌شده جلوگیری کند.

در صورت شروع فاز مستقل، currentPhase و currentTask را مطابق قرارداد Harness تنظیم کن.

اگر ثبت چنین فازی با Validator یا ساختار فعلی ناسازگار است، ساختار Harness را نشکن و یک پیشنهاد دقیق برای ثبت آن ارائه کن.

# 14. QA & DEFINITION OF DONE

یک صفحه فقط زمانی DONE است که تمام شرایط زیر برقرار باشند:

- UI واقعاً پیاده‌سازی شده باشد.
- Interactionها واقعی باشند.
- Stateهای مرتبط پوشش داده شده باشند.
- تست‌ها اجرا شده باشند.
- Navigation صحیح باشد.
- RTL بررسی شده باشد.
- Touch targetها تأیید شده باشند.
- TalkBack semantics صحیح باشد.
- Reduced Motion بررسی شده باشد.
- Screenshot واقعی ثبت شده باشد.
- Visual Regression صفحات محافظت‌شده سبز باشد.
- هیچ P0 یا P1 حل‌نشده‌ای باقی نمانده باشد.
- Ledger و Worklog به‌روز شده باشند.

تست‌های قبلی را برای گرفتن PASS ضعیف نکن.

اگر Android SDK، Emulator یا ابزار لازم موجود نیست، وضعیت را BLOCKED_ENV ثبت کن.

Screenshot ساختگی یا PASS فرضی ممنوع است.

# 15. FINAL EXPECTATION

خروجی باید این حس را ایجاد کند:

وقتی کودک اپلیکیشن SHOMARA را باز می‌کند، با محصولی مواجه شود که:

- از نظر طراحی مدرن و جذاب است.
- مسیر یادگیری بسیار واضحی دارد.
- هر تعامل سریع و طبیعی است.
- انیمیشن‌ها حرفه‌ای و نرم هستند.
- اجزای رابط یکپارچه‌اند.
- تجربه Native واقعی دارد.
- از نظر بصری کیفیتی هم‌سطح محصولات آموزشی مطرح دارد.
- هویت مستقل و قابل تشخیص SHOMARA را حفظ کرده است.

**هدف نهایی:**

Duolingo-Level Interaction Quality

Premium Native Android Execution

A Cohesive SHOMARA Design Language

Production-Grade UI/UX

---

# شروع مأموریت

از Audit و ثبت Baseline شروع کن.

دو صفحه Protected را قفل کن.

Design System و اختلاف Tokenها را بررسی کن.

فاز مستقل اجرای این مأموریت را مطابق Harness ثبت کن.

سپس صفحه‌ها را به‌ترتیب، یکی‌یکی، واقعاً پیاده‌سازی کن.

در هیچ مرحله‌ای صرفاً به تولید یک گزارش یا پیشنهاد طراحی اکتفا نکن؛ خروجی اصلی باید کد Native با کیفیت بالا، تست واقعی و Evidence قابل بررسی باشد.

**اولویت مطلق: کیفیت نهایی، نه سرعت تمام کردن تعداد صفحات.**