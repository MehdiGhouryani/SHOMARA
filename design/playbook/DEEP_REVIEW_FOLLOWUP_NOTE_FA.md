# یادداشت بستهٔ تکمیلی بازبینی عمیق — اصلاح‌های بازبین + تست‌های جاافتاده + تیک چک‌لیست (۲۰۲۶-۱۱-۰۵)

> این یادداشت، بستهٔ تکمیلیِ commit ‏`3626542` است (بستهٔ کد بازبینی عمیق؛ یادداشت آن
> `DEEP_REVIEW_BATCH_NOTE_FA.md`). هیچ build/harness/gate در این نوبت اجرا نشده و هیچ PASS
> ادعا نمی‌شود. هیچ verifier، توکن یا ledger تضعیف نشده؛ هیچ ردیفی به TESTED_NATIVE نرفته
> است. هیچ آیتم درس، هینت، صوت یا محتوایی جعل نشده؛ هیچ متن کاننیکال تازه‌ای وارد کد نشده است.

## ۱) چرا این بسته لازم شد

بستهٔ `3626542` پیش از push فقط‌خواندنی بازبینی شد (diff کامل + ۲۲ فایل untracked، هانک‌به‌هانک).
بازبین ۸ مورد پیدا کرد؛ ۷ مورد در این بسته اصلاح شد و ۱ مورد (محدودهٔ تک‌commit) تصمیم ثبت‌شده
است، نه اصلاح. فایل‌های تست جاافتاده هم در این بسته نوشته شدند و چک‌لیست برای آیتم‌های
اجراشده تیک خورد.

## ۲) هشت اصلاح بازبین — وضعیت

| # | مورد | وضعیت در این بسته |
|---|---|---|
| ۱ | F-03(c) ناقص بود: فقط دکمه غیرفعال شده بود و `verify("")` همچنان یک تلاش می‌سوزاند | **اصلاح شد** — `ShomaraParentBoundary.kt`: ‏`verify()` روی رمز خالی early-return می‌کند (پس از رسیدگی به انقضای قفل، پیش از هر شمارش خطا)؛ کامنت دکمه به هر دو لایه اشاره می‌کند. تست JVM: «blank passcode never burns an attempt». |
| ۲ | Back + شیت باز: هندلر Back شل فقط `backTarget` تب را می‌دید؛ با شیت باز، تب عوض می‌شد | **اصلاح شد** — `ShomaraChildShellHost.kt`: هندلر وقتی شیت باز است فعال است و اول `selectedStationId = null` می‌کند؛ وگرنه به تب می‌رسد. |
| ۳ | T13 یک طرف تضاد CONTENT-001 را به‌عنوان واقعیت کد کرده بود (نقطهٔ شروع + پیکان + کامنت «top → bottom») | **اصلاح شد** — `ShomaraTemplateSkeletons.kt`: نقطه/پیکان/کامنت ادعا حذف شد؛ فقط مسیر نقطه‌چین + خط پایه، با کامنت صریح که CONTENT-001 حل‌نشده است (§۷ مرحلهٔ ۵ در برابر §۹ پایلوت). `import Path` حذف شد. |
| ۴ | دکمهٔ «بررسی» اسکلت همیشه `enabled = false` بود ولی `onCheck` در host ‏`awaitingServerStage = true` می‌کرد — سیم‌کشی مرده | **توضیح داده شد، نه سیم‌کشی تازه** — کامنت `ShomaraLessonHost.kt` و KDoc اسکلت روشن کردند: امروز check اسکلت غیرفعال است پس lambda نمی‌تواند آتش بگیرد؛ `onCheck` قلاب فاز ۱ است، نه مسیر زنده. |
| ۵ | نام گمراه‌کننده: کلاس production در `ShomaraJumpTest.kt` نام `...Test` داشت | **تغییر نام کلاس انجام شد** — `ShomaraJumpAssessment` (+ ‏`ShomaraJumpAssessmentShell`؛ تست → ‏`ShomaraJumpAssessmentTest`؛ ارجاع KDoc در `ShomaraLocalCalibration.kt`). **نام فایل‌ها ماند** چون snapshot-push حذف/تغییرنام را پشتیبانی نمی‌کند. |
| ۶ | قرعهٔ ارزیابی با pool کوتاه، بی‌صدا مجموعهٔ کوتاه‌تر برمی‌گرداند | **اصلاح شد** — `ShomaraAssessmentDraw.kt`: ‏`require(pool.size >= count)` + KDoc + تست «a pool with fewer families than the count is refused». |
| ۷ | الف-۰۲ ناقص: فقط PracticeRow/MeRow ‏mergeDescendants داشتند | **تکمیل شد** — `ShomaraLessonStageChrome.kt`: هدر `mergeDescendants` گرفت؛ سطح نتیجه عمداً merge نشد (دکمهٔ واقعی دارد، merge عملش را می‌بلعد)؛ `ShomaraSettingsScreen.kt`: ‏`AvatarTile` ‏`mergeDescendants` گرفت. ممیزی تصاویر تزئینی: هیچ `Image(` خامی در main نیست؛ همه از `ShomaraCharacterImage` می‌گذرند. |
| ۸ | B1–B13 در یک commit آمدند؛ ۸ فایل main خوابیده‌اند و AGENTS.md ‏۵/۶ با ADR-0039 در تعارض است | **تصمیم ثبت‌شده، نه اصلاح** — ‏`3626542` بازنویسی نمی‌شود (reset/force-push ممنوع). فایل‌های خوابیده تا فاز ۱/B فراخواننده نگیرند همان‌طور می‌مانند؛ تعارض AGENTS.md با ADR-0039 در `COPY_CHECKLIST_APPLICATION_NOTE.md` ثبت شد و جهت آن باید با مالک/ADR روشن شود. |

## ۳) ممیزی‌های الف-۰۱/الف-۰۴/الف-۰۵/الف-۰۷ — نتیجه

- **الف-۰۱ (کف ۴۸dp):** ممیزی کامل شد، کدی لازم نبود — `ShomaraButton` کف را اعمال می‌کند؛ کنترل صوت `defaultMinSize(ComponentTouchMin)` دارد؛ هیچ `IconButton`/‏`clickable` برهنهٔ پوشش‌نداده‌ای نماند؛ هیچ `.height(` ثابتی در main نیست.
- **الف-۰۴:** دکمهٔ کمک در chrome درس وجود ندارد — «اگر در صفحه‌ای نیست، اضافه نکن».
- **الف-۰۵:** هیچ قفل `fontScale` در ماژول‌های app/feature نیست (فقط provider پیش‌نمایش در `ShomaraCatalog` با ۱٫۰ و ۲٫۰)؛ کانتینر با ارتفاع ثابت برای متن نیست؛ برش در فونت ۲۰۰٪ فقط روی دستگاه ثابت می‌شود (gate).
- **الف-۰۷:** gate خنثی است، دکمه‌ها ≥۴۸dp، retry همان دکمهٔ ورود است.

## ۴) الف-۰۶ / A3 — ماشین حالت ساخته شد، به host وصل نشد (تصمیم ثبت‌شده)

`ShomaraLessonItemStateMachine.kt` ساخته و تست شد (Intro → Prompt → Interact → Check →
Feedback → Retry/Next → RoundEnd؛ ‏`check()` بدون selection رد می‌کند؛ CHECK هرگز به verdict
نمی‌رسد) ولی **به `ShomaraLessonHost` وصل نشد**: امروز `choiceId` همیشه null است و ماشین چیزی
زنده برای راندن ندارد؛ وصل‌کردن کورکورانه (بدون امکان compile-check) ریسک شکستن
submit/close/result را دارد. وصل‌کردن به فاز ۱/B موکول شد، وقتی گزینه‌های واقعی هست و gate
محلی هست. الف-۰۶ **تیک نخورد**.

## ۵) تست‌های تازه در این بسته

همهٔ تست‌ها فقط‌خواندنیِ APIهای واقعی‌اند؛ هیچ API حدس‌زده نشده و هیچ رشته‌ای جعل نشده است
(هر رشته/امضا پیش از نوشتن تست با grep در production تایید شد).

| فایل | تست‌ها |
|---|---|
| `ShomaraParentBoundaryTest.kt` (JVM) | «blank passcode never burns an attempt» (F-03c)؛ «lockout expires with real time» (F-03b: سه خطا در ‏`nowMs = 1_000_000` → ‏`LockedOut(untilMs = 1_060_000)`؛ در ‏`1_060_001` دوباره authenticate). |
| `ShomaraStationStartTest.kt` (JVM) | «locked jump target can never confirm and explains itself with the locked text» (F-17؛ با یادداشت صادقانه که رهگیری ضربه در composable است، نه در `select()`). |
| `OnboardingJourneyTest.kt` (JVM) | «grade placement progress announces three quarters — never complete» (F-06: ‏`announcementFor(0.875f)` = ‏«سه‌چهارم راه»؛ ‏`progressWords(1f)` = ‏«کامل شد»). |
| `WelcomePhoneTest.kt` (JVM) | «partial number shows no error — eleven invalid digits do» (F-08: ‏«۰۹» دو رقم، بدون خطا؛ ۱۱ رقم نامعتبر، با خطا؛ «۰۹۱۲۳۴۵۶۷۸۹» معتبر). |
| `OnboardingContractTest.kt` (JVM) | «backend-not-configured and network errors produce distinct banner texts» (F-19؛ با یادداشت صادقانه که `bannerKindFor` ‏private است و kind در سطح holder قابل تست نیست — نیازمند Compose test یا internal visibility). |
| `ShomaraStationSheetTest.kt` (androidTest تازه، :app) | ضربه روی گره → شیت باز، مسیر زنده، فقط CTA به `lesson/ST07` می‌رود؛ ضربهٔ قفل → شیت Locked، هرگز navigate نمی‌شود. |
| `ShomaraParentGateScreenTest.kt` (androidTest تازه، :feature/parent) | بنر خطا پس از یک تلاش غلط بدون تایپ اضافه؛ بنر قفل پس از ۳ تلاش؛ دکمهٔ ورود با رمز خالی غیرفعال و بدون click action. گیت با verifier واقعی `{ it == "1234" }` ساخته شد، هرگز null. |
| `ShomaraLessonHostResumeTest.kt` (androidTest تازه، :feature/lesson) | با checkpoint ‏P3، هدر «مرحلهٔ بازی» دیده می‌شود، نه «کشف»؛ بنر «از همون‌جا ادامه می‌دهیم» هم هست. gateway واقعی با submitUrl ‏null است (هیچ تماسی در resume نمی‌رسد). |

**وابستگی تست که اضافه شد:** ‏`feature/parent` و `feature/lesson` هیچ
`androidTestImplementation` برای کتابخانه‌های تست Compose نداشتند؛ همان ۴ خط :app به هر دو
`build.gradle.kts` اضافه شد — فقط وابستگی تست، بدون اثر runtime.

## ۶) چک‌لیست — ۹ آیتم تیک خورد

۳۲۰ آیتم: **۱۳ → ۲۲ تیک‌خورده، ۲۹۸ باز** (با grep تایید شد). تیک‌ها: خانوادهٔ ۰۶ Locked و
Completed، خانوادهٔ ۰۷ چیدمان sheet، خانوادهٔ ۱۷ Back یکپارچه، ‏C-01 (اصلاح متن قفل، ‏`9f3cc15`)،
‏C-05 (‏E-02)، ‏C-10 (‏E-05)، ‏C-12 (‏E-03)، ‏C-15 (‏E-04) — همه با commit در چک‌لیست و با
«معیار قبولیِ دستگاهی همچنان باز است». دو آیتم تیک نخوردند ولی یادداشتشان به‌روز شد (آفلاین
خانوادهٔ ۰۶: F-40 جزئی؛ jump خانوادهٔ ۰۷: F-17 جزئی). جزئیات کامل در
`COPY_CHECKLIST_APPLICATION_NOTE.md`، بخش «نوبت بازبینی عمیق — بستهٔ کد + بستهٔ تکمیلی».

## ۷) چه مسدود ماند (خلاصه؛ کامل در APPLICATION_NOTE)

F-02 (منبع محلی پروفایل/پیشرفت — فاز ۱/۲)؛ O1/O2 (فاز ۱)؛ CONTENT-004 (نام/هدف واقعی)؛
متن‌های کاننیکال DRAFT؛ wiring پرش و guidebook (فاز B، ‏CONTENT-002)؛ تضاد آیکون قفل
F-12(a) در برابر N-02/C-02 (تصمیم مالک)؛ تصمیم‌های باز F-05(b)، F-10، F-21، F-22(a)،
F-28، F-39، F-41(b)، F-43، C-20، ب-۰۶ تا ب-۱۵؛ حذف مسیر P1–P6؛ E3 (تا گزارش محلی step-zero).

## ۸) gate لوکال/دستگاهی لازم برای این بسته

- `git pull` روی شاخه؛ `npm run verify:static:all` (انتظار ۹۰/۹۰)؛ `npm run android:gate` —
  شامل تست‌های تازهٔ JVM و سه androidTest تازه + تست‌های `3626542`.
- اسکرین‌شات‌های ۳۶۰/۳۹۰/۴۱۲dp + فونت ۲۰۰٪: شیت شروع/قفل، جداکنندهٔ مرز فصل، hairline
  تب‌بار و دکمهٔ Ghost، پنل بازخورد چسبیده، گیت والدین (بنر خطا/قفل)، هدر درس با مرحلهٔ
  بازیابی‌شده.
- TalkBack با ژست واقعی: ضربه روی گره → شیت باز می‌شود (قفل «قفل» خوانده می‌شود، نه
  «غیرفعال»)؛ بنر خطا/قفل گیت پس از تلاش غلط و رها شدن قفل پس از ۶۰ ثانیه؛ resume درس از
  مرحلهٔ ذخیره‌شده؛ توقف‌های تکیِ mergeDescendants؛ Back شیت را اول می‌بندد؛ ردیف پرش
  انتخاب‌شده یک بار «انتخاب شد».
- نتیجهٔ re-run مربوط به `android:gate` پس از `c19460b` هنوز گزارش نشده است؛ gateهای فاز ۰/A
  و بسته‌های `0354cf64`/`5595ca69`/`9f3cc15` هم هنوز بازند.
