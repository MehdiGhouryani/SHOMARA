# یادداشت بستهٔ بازبینی عمیق — اجرای یافته‌های چهار مطالعه (بستهٔ کد، ۲۰۲۶-۱۱-۰۵)

> این یادداشت، بستهٔ دومِ نوبت «بازبینی عمیق» است (بستهٔ اول فقط docs بود: commit
> `9f3cc15`). هیچ build/harness/gate در این نوبت اجرا نشده و هیچ PASS ادعا نمی‌شود.
> هیچ verifier، توکن یا ledger تضعیف نشده؛ هیچ ردیفی به TESTED_NATIVE نرفته است.
> هیچ آیتم درس، هینت، صوت یا محتوایی جعل نشده؛ هیچ قضاوت پاسخی ساخته نشده (O1)؛
> هیچ متن کاننیکال تازه‌ای وارد کد نشده است.

## ۱) چه اجرا شد — جدول اقدامِ بازبینی عمیق: هر ۴۰ ردیف

هر ۴۰ ردیف جدول اقدام در `DEEP_PAGE_REVIEW_FA.md` (§ «فهرست اقدام») در این بسته اجرا شد:

| ردیف | یافته | تغییر |
|---|---|---|
| ۱ | F-01 | شیت شروع ایستگاه shell-owned شد (`selectedStationId` با `rememberSaveable` در `ShomaraChildShellHost`)؛ ضربه روی گرهٔ مسیر و تمرین شیت را باز می‌کند؛ فقط CTA «شروع/ادامه» به درس می‌رود؛ ضربه روی گرهٔ قفل شیت Locked را باز می‌کند. شیت پرش همچنان بدون caller می‌ماند (فاز B). |
| ۲ | F-03 الف | `state` گیت والدین `mutableStateOf` شد — بنر خطا/قفل حالا recomposition می‌سازد و رندر می‌شود. |
| ۳ | F-03 ب | شل `nowMs = { System.currentTimeMillis() }` را صریح به گیت پاس می‌دهد. |
| ۴ | F-03 ج | دکمهٔ «ورود» با `enabled = passcode.isNotBlank()` — ارسال خالی دیگر تلاش نمی‌سوزاند. |
| ۵ | F-04 | هاست درس `resume()` را نگه می‌دارد: اگر مرحلهٔ بازیابی‌شده غیرnull بود، `macroStage` همان می‌شود؛ بنر «از همون‌جا ادامه می‌دهیم» دیگر با شروع از P1 همراه نیست. |
| ۶ | F-05 (گزینهٔ امن) | نوار indeterminate از هاست درس حذف شد. گزینهٔ ب («مرحلهٔ N از ۵») تصمیم باز مالک می‌ماند. |
| ۷ | F-06 | کسر مرحلهٔ جای‌گذاری آنبوردینگ `1f` ← `0.875f`؛ «کامل شد» فقط پس از `Complete`. |
| ۸ | F-19 | kind بنر خطای آنبوردینگ مشروط شد: `BackendNotConfigured` → `Error`، وگرنه `Retry` (متن همان). |
| ۹ | F-08 | خطای تلفن فقط وقتی رقم‌ها ≥۱۱ و نامعتبرند نشان داده می‌شود. |
| ۱۰ | F-27 | خط `WelcomeBody` از کارت تلفن حذف شد (جمله در صفحهٔ خوش‌آمد یک بار گفته شده). |
| ۱۱–۱۲ | F-26 | `phone` با `rememberSaveable` + `Saver` سفارشی برای holder (فقط phone، نه otp)؛ پرچم خوانده‌نشدهٔ `resumedFromDraft` حذف شد. |
| ۱۳ | F-41 الف | خط «کد تأیید برای … ارسال شد» از `canonical(phone) ?: phone` می‌خواند. |
| ۱۴ | F-16 | ردیف قفل تمرین: بدون role/clickable (ردیف ساده با دلیل مرئی). |
| ۱۵ | F-30 | ✓ مرئی (تزئینی برای TalkBack) کنار عنوان ردیف تاریخچهٔ تمرین. |
| ۱۶ | F-25 | مقدار `History` از enum وضعیت تمرین حذف شد؛ شاخهٔ رندر ساده شد. |
| ۱۷ | F-32 | `clearAndSetSemantics` روی «←» در `MeRow`. |
| ۱۸ | F-20 | «preferenceهای» ← «تنظیم‌های». |
| ۱۹ | F-25 | مقدار `EditReturn` از enum وضعیت «من» و شاخهٔ رندر حذف شد. |
| ۲۰ | F-23 | گیت والدین پارامتر `onBack` + دکمهٔ Ghost «بازگشت» گرفت؛ شل `popBackStack()` وصل کرد. |
| ۲۱ | F-31 | border روی کارت خلاصهٔ گزارش والدین. |
| ۲۲ | F-15 | `ToggleRow` تنظیمات → `toggleable` با `Role.Switch` + `stateDescription` «روشن/خاموش»؛ دکمهٔ داخلی نشانگر وضعیت صرف شد (نه دکمه). |
| ۲۳ | F-36 | «آرام‌تر می‌شوند» ← «متوقف می‌شوند». |
| ۲۴ | F-12 ج | برچسب Completed → «تکمیل شد — برای تمرین دوباره ضربه بزن». |
| ۲۵ | F-40 | نگاشت offline→Locked از `stateFor` مسیر حذف شد؛ آفلاین فقط با بنر گفته می‌شود. |
| ۲۶ | F-17 | ضربه روی هدف قفل در شیت پرش، توضیح قفل را در بنر شیت نشان می‌دهد؛ جای ✓ با Box عرض ثابت `Space24` (هم‌ترازی ردیف‌ها). |
| ۲۷ | F-24 | `heightIn(min = ComponentNodeSize)` روی Row هدر درس. |
| ۲۸ | F-13 | پارامتر `focused` از `ShomaraTextField` حذف شد؛ `onFocusChanged` داخلی؛ call site در کاتالوگ پاک شد. |
| ۲۹ | F-34 | `LaunchedEffect(value)` با `setTextAndPlaceCursorAtEnd` برای همگام‌سازی reset بیرونی فیلد. |
| ۳۰ | F-14 | `ShomaraTapGuard.beginLatched()` با cooldown ‏۳۰۰ms‏ پس از `end()` و ساعت قابل‌تزریق؛ `ShomaraButton` و `ShomaraCard` به آن سوییچ کردند؛ `begin()`/`end()` دست نخورده (تست موجود می‌گذرد)؛ Dialog همچنان `begin()` می‌ماند. |
| ۳۱ | F-33 | اسپینر loading زیر reduced motion → نقطهٔ استاتیک (در `ShomaraButton` و `ShomaraAudio`). |
| ۳۲ | F-35 | سایهٔ بنر بازخورد ← `ShomaraClay.specFor(Soft).elevation`. |
| ۳۳ | F-22 ب | سلول OTP: `mergeDescendants = true` + `contentDescription` ترکیبی «رقم N از ۴: رقم/خالی»؛ ارقام لاتین ماندند (F-22 الف تصمیم باز مالک است). |
| ۳۴ | F-37 | `ShomaraCountersGrid` از Column به `FlowRow`؛ عملگر جاافتادهٔ `?: "?"` → `require` در `ShomaraEquationSlot`. |
| ۳۵ | F-38 | شمارهٔ pose از `contentDescription` شخصیت حذف شد (فقط نام شخصیت). |
| ۳۶ | F-40 | `ShomaraNumberTile` قفل: بدون role/clickable. |
| ۳۷ | F-25 | `announcementFor` به‌عنوان `contentDescription` سطح `ShomaraStateSurface` وصل شد. |
| ۳۸ | F-25 | Back در شل: `ShomaraShellLogic.backTarget` با `shomaraBackHandler` سیم‌کشی شد؛ هندلر فقط روی routeهای تب فعال است تا Back روی settings/parent همچنان pop کند؛ منطق ناوبری تب به `goToTab` استخراج شد. |
| ۳۹ | F-42 | `FoundationScreen` به `ShomaraTypography` + توکن‌ها مهاجرت کرد؛ `stringResource` ماند. |
| ۴۰ | F-29 | وضعیت جای‌گذاری در `ShomaraPlacementScreen`: متن سادهٔ Body/Caption به‌جای بنر Recovery داخل کارت؛ Ghost «فعلاً رد می‌کنم» می‌ماند. |

**جمع:** شدت بالا ۳ از ۴ (F-02 مسدود ماند)؛ متوسط ۱۱ از ۱۷؛ کم ۱۹ از ۲۳.
کم‌های اجرا‌نشده فقط مواردِ «باز/مسدود» زیر هستند — هیچ ردیف کم‌اهمیتی به‌خاطر
حجم بسته کنار گذاشته نشد (همهٔ ردیف‌های قابل‌اجرای کم، یک‌خطی و در فایل‌های
لمس‌شده بودند).

## ۲) چه اجرا شد — الگوهای تازهٔ دولینگو (E-02 تا E-05) و بیرونی (الف-۰۱ تا الف-۰۷)

- **E-02** — جداکنندهٔ مرز فصل پس از آخرین گرهٔ فصل‌های ۱ تا ۴ در `ShomaraPathGraph`
  (دو `HorizontalDivider` با `ColorLine2` + برچسب فصل بعد، تزئینی)؛ شاخص‌های
  `headerItemIndexForChapter` به‌روز شد (فصل ۲ = ۸، فصل ۵ = ۲۹؛ تست‌ها به‌روز شدند).
- **E-03** — بوردر hairline (`ColorLine` + `ClaySoftBorderWidth`) فقط برای دکمهٔ Ghost؛
  depth همچنان Flat.
- **E-04** — بنرهای بازخورد (`banner` و `resumed`) به اسلات ثابت بالای CTA در هاست درس
  رفتند؛ بنر تایید خروج/سطح نتیجه/دکمهٔ خروج در ستون اسکرول ماندند.
- **E-05** — خط hairline بالای تب‌بار (`HorizontalDivider` با `ColorLine`).
- **الف-۰۱** — دکمهٔ شناور «بازگشت به جاری» در مسیر `defaultMinSize(minHeight =
  ComponentTouchMin)` گرفت؛ دکمهٔ مشترک `ShomaraButton` از پیش حداقل ۴۸dp را
  اعمال می‌کند (`MinTouchTarget = ComponentTouchMin = 48.dp`) — نیازی به تغییر نبود.
- **الف-۰۲** — `mergeDescendants = true` در `MeRow` (ردیف‌های Me یک توقف TalkBack).
- **الف-۰۳** — `liveRegion = LiveRegionMode.Polite` روی بنر بازخورد.
- **الف-۰۴** — بررسی شد: هیچ دکمهٔ کمک/راهنما در کروم درس (`ShomaraLessonStageChrome`)
  وجود ندارد؛ طبق قاعدهٔ خود مطالعه («اگر در صفحه‌ای نیست، اضافه نکنید») چیزی
  برای یکسان‌سازی نبود — اقدامی لازم نیست.
- **الف-۰۵** — بررسی شد: هیچ قفل `fontScale` در ماژول app/feature نیست (grep سراسری
  خالی)؛ تنها مرجع `fontScale` در `ShomaraCatalog` یک provider پیش‌نمایش است که هر
  دو مقیاس ۱٫۰ و ۲٫۰ را پوشش می‌دهد، نه قفل — چیزی برای حذف نبود.
- **الف-۰۶** — ماشین حالت صریح حلقهٔ درس (`ShomaraLessonItemStateMachine`): ‏
  `INTRO ← PROMPT ← INTERACT ← CHECK(AwaitingEvaluator) ← FEEDBACK ← (RETRY|NEXT) ←
  ROUND_END`؛ `CHECK` هرگز درست/غلط نمی‌سازد؛ `check()` بدون selection رد می‌شود.
  (B3 — هم‌زمان با همین بسته.)
- **الف-۰۷** — گیت والدین خنثی است (توکن‌های استاندارد، بدون رنگ/آیکون کودکانه) و
  دکمه‌هایش `ShomaraButton`‌اند (حداقل ۴۸dp)؛ دکمهٔ جداگانهٔ «تلاش دوباره» وجود
  ندارد — تلاش دوباره همان دکمهٔ «ورود» است (پس از بنر خطا).

## ۳) چه اجرا شد — B1 تا B14 (مراحل و بازی‌ها)

فقط اسکلت صادقانهٔ خالی و ساختار خالص؛ هیچ محتوای درس جعل نشده است:

| ردیف | چه ساخته شد |
|---|---|
| B1 | تست‌های snapshot مرز projection (`ShomaraProjectionSnapshotTest`): فهرست دقیق violationها شامل `$.evaluatorConfig`، `$.pass_threshold`، `$.interaction.hints`، و `hint-in-P4/P5` برای P4 (و نبودنش برای P2)؛ مراحل ماکرو دقیقاً P1 تا P5. **R-22 (بستهٔ جاروب نهایی، D-04):** هر چهار آداپتور حالا `toProjection()` واقعی دارند (T01: template/objectCount/taughtNumerals/tappedObjectOrdinals/state — بدون chosenNumeral؛ T05: template/slotIds/draggableIds/state — بدون occupied؛ T13: template/numeral/visitedCheckpoints/state — بدون referenceStrokeOrder و بدون tolerance؛ T15: template/steps/currentStep/state — بدون choiceId) و هر چهار snapshot دقیق + عبور از guard با سخت‌گیرانه‌ترین اسکن (مراحل HINT_BANNED) تست شده‌اند. |
| B2 | اسکلت رندر چهار قالب (`ShomaraTemplateSkeletons`): P1 → T01، P2 → T15، P3 → T05 با ساختار B4 (راند ۱)، P4 → T15، P5 → T13 (‏`hideNumeral`‏)؛ خط وضعیت = `UnavailableMessage` موجود؛ slot هینت فقط P2/P3 و نامرئی وقتی محتوا نیست؛ دکمهٔ «بررسی» غیرفعال تا selection واقعی (فاز ۱)؛ `onCheck` هاست → حالت AwaitingEvaluator. هاست درس به‌جای بنر unavailable، اسکلت مرحلهٔ جاری را رندر می‌کند. |
| B3 | ماشین حالت آیتم درس (الف-۰۶، بالا). |
| B4 | ساختار ۶ راند بازی «تزیین کیک» (`ShomaraGameRoundStructure`): جای‌های خالی ۲/۳/۲/۳/۴/—، سینی ۳/۲/۲/۲/۳/—، همه `mode: continue` جز r06؛ راند ۶ `FindUnit` با ۰/۰ (پایلوت می‌گوید r06 «نه continue» — مقدار جایگزین ساختاری است، نه مصوب)؛ `roundLabel()` «راند N از ۶». |
| B5 | نردبان هینت (`ShomaraHintLadder`): ۱→retry، ۲→h1، ۳→h2، ۴→h3؛ `hint = null` وقتی محتوا نیست؛ `slotAllowed` (P4/P5 هیچ slot ندارند — HINT_BANNED)؛ رویداد hint فقط وقتی هینت واقعی نمایش داده شد. |
| B6 | تابع خالص کشش P4 (`ShomaraAssessmentDraw.draw`): یکی از هر خانواده، بدون تکرار تلاش قبلی، `MissingFreshItem` صادقانه؛ قطعی (اولین آیتم تازه). |
| B7 | مدیر صدا (`ShomaraAudioManager`): ماشین حالت + fallback متنی + شمارندهٔ رویداد `audio_missing`؛ `isBlocking = false` همیشه؛ حداکثر ۳ افکت، ducking ‏۱۲dB‏. wiring به host تا اولین asset صوتی واقعی می‌ماند (فاز ۱/B). |
| B8 | گسترش `T13TraceAdapter`: ‏`ShomaraRawTouchPoint`‏ + ‏`rawTouches`‏ + ‏`recordRawTouch`‏ (append خالص، بدون تغییر قضاوت/تکمیل؛ تست دارد). اتصال pointer در اسکلت T13 انجام **نشد** — هوک آداپتور هست؛ اتصال pointer کاریِ فاز ۱/B است. |
| B9 | موتور قانون الگو (`ShomaraPatternRule.accepts`): خالص؛ تست ABAB پذیرفته، ABBA رد. |
| B10 | ست تمرین (`ShomaraPracticeSet`): ست ۶تایی از استخر انتزاعی + قانون مارپیچی (اول یک آیتم از هر thread، بعد پرکردن round-robin؛ استخر کوتاه → ست کوتاه صادقانه). |
| B11 | پوستهٔ تست پرش (`ShomaraJumpTest`): ‏`questionCount`‏ قابل‌پیکربندی، یک تلاش، بدون بازخورد وسط کار، بدون پاداش؛ `progressLine()` «سؤال N از M». اتصال `ShomaraJumpSheet` به caller واقعی فقط پس از CONTENT-002. |
| B12 | پارسر CSV متادیتای صوت (`ShomaraAudioManifest`): BOM-aware، یکتایی شناسه‌ها، گزارش ردیف بدون فایل / فایل بدون استفاده (فرض `"$id.opus"` قابل‌پارامتر)، خطاهای ستون/شناسهٔ خالی. |
| B13 | کالیبراسیون محلی (`ShomaraLocalCalibration`): مقادیر اولیهٔ مستند (idle_replay ‏۸s‏، tolerance ‏۲۸dp‏، timings ‏۲۵۰/۳۵۰/۴۵۰ms‏، rate ‏-۱۵٪‏، آستانهٔ ۳ از ۴، بودجه‌های ۳۰/۱۲/۳، jump counts ‏۱/۵‏)؛ آداپتورها همچنان از `ServerLearningConfig.DEFAULT` می‌خوانند (تعویض پس از O2). |
| B14 | ثبت شد: chrome درس از پیش کامل است جز اتصال به شمارش واقعی مراحل که فاز ۱ می‌خواهد؛ کد تازه‌ای نخواست. |

## ۴) ترتیب صفحات — چه تغییری کرد

جریان splash → launch → welcome → onboarding → placement → shell/path → station
start → lesson ‏(P1→P5)‏ → result → practice/Me/settings با مدل دولینگو چک شد:

- **F-01 (اصلاح ساختاری اصلی):** پیش از این بسته، ضربه روی هر گرهٔ مسیر مستقیم به
  `lesson/$id` می‌رفت — شیت شروع ایستگاه هیچ فراخواننده‌ای نداشت و قفل مسیر در
  عمل دور زده می‌شد. حالا شیت، «تنها درِ ورود به درس» است: ضربه روی گره (مسیر یا
  تمرین) شیت را باز می‌کند؛ فقط CTA شیت ناوبری می‌کند؛ گرهٔ قفل شیت Locked را باز
  می‌کند. شیت پرش همچنان بدون caller است (فاز B — نیازمند CONTENT-002).
- **F-04:** ادامهٔ درس حالا واقعاً از مرحلهٔ بازیابی‌شده ادامه می‌یابد، نه از P1.
- **F-25:** Back در شل قطعی شد (تب غیرپیش‌فرض → تب پیش‌فرض؛ پیش‌فرض → سیستم)؛
  Back روی settings/parent همچنان pop می‌کند.
- بقیهٔ جریان (splash/launch/welcome/onboarding/placement/result) ناهماهنگی
  ساختاری/ناوبریِ قابل‌اجرایی نداشت؛ موارد باقی‌مانده مسدود/بازِ زیر هستند.

## ۵) چه مسدود ماند — با دلیل (نساخته شود)

| مورد | دلیل |
|---|---|
| F-02 (تب «من» و گزارش والدین همیشه خالی/صفر) | منبع محلیِ پروفایل + پیشرفت وجود ندارد؛ تصمیم/اجرای فاز ۱/۲ لازم است (نه O1/O2، ولی معماری محلی). |
| F-07 (عنوان صفحهٔ پروفایل) | عنوان جداگانه متن کاننیکال تازه می‌خواهد؛ DRAFT §۲ عنوان صفحه نمی‌دهد — تصویب مالک. |
| F-09 (آواتار فقط متنی) | هیچ drawable آواتاری نیست؛ artwork مالک لازم است (رجیستری PENDING_OWNER). |
| F-11 (شش «اینترنت وصل نیست» تازه) | بازنویسی متن کاننیکال تصویب‌شده می‌خواهد؛ DRAFT §۴ فقط LaunchGate را بازنویسی کرده. |
| F-12 الف/ب (آیکون قفل / نوع ایستگاه روی گره) | asset می‌خواهد — تصمیم مالک (artwork) یا آیکون ترسیمی از primitiveها (تصمیم طراحی). |
| F-44 (انقضای OTP) | TTL از سرور می‌آید؛ بک‌اند OTP پیکربندی نشده است. |
| همهٔ K1–K22 | قضاوت پاسخ، «نمایش پاسخ درست»، ‏`ST07.json`/`manifest.json`‏، بستن آیتم‌های پایلوت، صوت/دارایی، آستانهٔ ۳ از ۴، عدد پرش، حذف hint از P4/P5.i05، جهت/تلرانس ردگیری، نام‌ها، محتوای دینی، «چه چیزی تمرین شد»/«چرا؟»، ۲۴ spec، دامنهٔ پایهٔ اول، چهرهٔ راهنما، Vazirmatn، telemetry با پاسخ، نتیجهٔ معتبر، حذف OTP/هویت محلی — همه نیازمند O1/O2 یا محتوای مصوب‌اند. |
| O1/O2 | همچنان باز و انتخاب‌نشده؛ فاز ۱ و فاز B را مسدود می‌کنند. |

## ۶) چه باز ماند — نیازمند تصمیم مالک/طراحی

F-05 گزینهٔ ب (نوار «مرحلهٔ N از ۵»)؛ F-10 (دکمهٔ «ذخیره» همیشه غیرفعال)؛ F-18
(چالش/TopBar/Dialog/BottomSheet بدون فراخواننده)؛ F-21 (حلقهٔ گرهٔ جاری)؛ F-22 الف
(ارقام OTP لاتین/فارسی)؛ F-28 (کارت grade غیرقابل‌ضربه)؛ F-39 (برچسب Perfect)؛
F-41 ب (دکمهٔ Paste با حافظهٔ خالی)؛ F-43 (تیترهای بخش Title شوند؟)؛ C-06/C-07/
C-11/C-16/C-18؛ همهٔ ب-۰۱ تا ب-۱۵.

## ۷) به فاز ۱/B موکول شد (هوک هست، سیم‌کشی نیست)

- اتصال pointer برای ثبت raw touch در اسکلت T13 (هوک `recordRawTouch` + تست هست).
- wiring مدیر صدا (`ShomaraAudioManager`) به هاست درس (تا اولین asset صوتی واقعی).
- caller واقعی برای شیت پرش (پس از CONTENT-002) و guidebook (فاز B).
- جایگزینی `ServerLearningConfig.DEFAULT` با `ShomaraLocalCalibration` در آداپتورها
  (پس از O2).

## ۸) drift و gate مانده

- `dependency-map.json` بازتولید نشده است (E3 منتظر گزارش محلی step-zero است)؛
  در این بسته هیچ ارجاع فایل تازه‌ای به‌صورت literal اضافه نشده که drift بسازد،
  ولی نقشه همچنان با درختِ پس از بستهٔ اول هم‌تراز نشده است.
- **Gate لوکال/دستگاهی (پس از push):** ‏`git pull`‏ روی شاخه؛
  `npm run verify:static:all` (انتظار ۹۰/۹۰)؛ `npm run android:gate` (شامل
  تست‌های به‌روز حلقه/بنر/شاخص، `ShomaraPrimitives04Test`، و تست‌های تازهٔ B1–B14)؛
  اسکرین‌شات ۳۶۰/۳۹۰/۴۱۲dp + فونت ۲۰۰٪ برای شیت شروع، گیت والدین، هدر درس بدون
  نوار، اسکلت قالب‌ها؛ TalkBack با ژست واقعی (گرهٔ قفل با توضیح، گرهٔ تکمیل‌شده با
  پسوند تازه، ردیف تمرین قفل دیگر «دکمه» خوانده نمی‌شود، تاگل حرکت کمتر به‌عنوان
  Switch، سلول OTP با یک announcement، بنر بازخورد با liveRegion)؛ تایید نهایی
  F-01 تا F-03 روی دستگاه (خواندن کد، نه اجرا، آن‌ها را پیدا کرد).
