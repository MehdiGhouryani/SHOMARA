# راهنمای جامع پیاده‌سازی Native صفحهٔ اصلی شمارا (Harness Handoff)

**نسخه:** 3.0 · **هدف:** Android / Kotlin / Jetpack Compose · **صفحه:** مسیر یادگیری (Page Family 06)

این راهنما نقشهٔ اجرایی است، نه مجوز بازنویسی معماری پروژه. ابتدا واقعیت مخزن و کد موجود را بررسی کنید؛ سپس فقط فاصلهٔ واقعی را با طراحی پر کنید.

---

## 1. هدف محصول و سلسله‌مراتب صفحه

کودک باید در چند ثانیه چهار چیز را بفهمد: «کجا هستم؟»، «تا کجا آمده‌ام؟»، «قدم بعدی چیست؟» و «برای انجامش کجا باید بزنم؟»

ترتیب بصری پیشنهادی:

1. **Header:** عنوان کوتاه، زیرعنوان دوستانه و یک اکشن واقعی (در صورت نیاز).
2. **Chapter progress:** پایه/فصل و پیشرفت معتبر همان فصل.
3. **Continue card:** یک پیشنهاد ادامهٔ روشن و یک CTA اصلی.
4. **Learning path:** مسیر پیوسته با گره‌های وضعیت‌دار؛ فقط یک گره Current برجسته.
5. **Bottom navigation:** سه مقصد ثابت کودک: «مسیر»، «تمرین»، «من».

هیچ بخش نباید صرفاً برای پر کردن فضا نمایش داده شود. اگر دادهٔ یک بخش موجود نیست، حالت خالی/ناموجود درست نشان دهید؛ عدد یا محتوای نمایشی را در production وارد نکنید.

## 2. مرز معماری — قبل از UI

معماری جاری پروژه را حفظ کنید:

`Route / App coordinator → ViewModel → UseCase → Repository → bundled content package + local evaluator`

- اپ طبق تصمیم محصول **کاملاً آفلاین** است؛ برای دریافت درس، اعتبارسنجی پاسخ، تعیین تسلط یا بازکردن ایستگاه به API فرضی وابسته نشوید.
- بستهٔ محتوای نسخه‌دار و checksummed داخل APK و ارزیاب محلی منبع حقیقت هستند. UI فقط projection امن و immutable را نمایش می‌دهد.
- answer key، evaluator rule، threshold یا محاسبات داخلی هرگز وارد child UI state، database عمومی، log، analytics یا Compose Preview نشوند. جزئیات باز ADR-0039 دربارهٔ مدل answer-key را Harness نباید خودسرانه حل کند.
- child profile و progress محلی‌اند؛ ادعای sync، cloud backup یا بازیابی بین دستگاهی نسازید.
- feature module به `core:designsystem` و `core:model` وابسته می‌شود؛ به implementation داخلی یک feature دیگر وابسته نشود.

## 3. موجودی موجود در مخزن و سیاست Reuse

پیش از ساختن فایل جدید، این فایل‌ها را بازبینی کنید:

| قابلیت | کد مرجع در مخزن | دستور |
|---|---|---|
| Design tokens / theme | `core/designsystem/ShomaraTokens.kt`, `ShomaraTheme.kt` | منبع canonical و generator را پیدا کنید؛ token را در feature hardcode نکنید. |
| دکمه و guard | `ShomaraButton.kt` | `ShomaraButton`, `ShomaraTapGuard`, reduced-motion را reuse کنید. |
| مسیر و node geometry | `feature/path/ShomaraPathGraph.kt` | geometry، RTL winding و domain states را دوباره پیاده‌سازی نکنید. |
| Bottom navigation | `core/designsystem/ShomaraNavigation.kt` | قرارداد سه tab و semantics را حفظ کنید؛ در صورت نیاز icon slot به component مشترک اضافه کنید، نه یک سیستم رقیب. |
| Character renderer | `ShomaraCharacter.kt` | از renderer و منابع فعلی استفاده کنید؛ کد ImageView/Coil موازی نسازید مگر معماری فعلی آن را ایجاب کند. |
| Feedback / state surfaces | `ShomaraFeedback.kt`, `ShomaraStateSurface.kt` | برای loading/error/empty از primitives موجود استفاده کنید. |
| Progress & digits | `ShomaraDigits`, `ProgressBarRangeInfo` | ارقام و معنای ریاضی را با helper موجود نمایش دهید. |

**تذکر:** بعضی فایل‌های این بسته، reference adapter یا قرارداد طراحی‌اند. آن‌ها را کورکورانه کنار کد فعلی کپی نکنید. اگر API موجود همان مسئولیت را پوشش می‌دهد، adapter را حذف یا به همان API متصل کنید.

## 4. قرارداد دادهٔ UI (UDF)

Screen باید stateless باشد: داده را از `UiState` بخواند و intent/event را به ViewModel برگرداند. در Composable هیچ محاسبهٔ mastery، unlock، scoring یا next action انجام نشود.

نمونهٔ حداقلی مدل immutable در `03_ANDROID/kotlin/ShomaraHomeUiState.kt` آمده است. قرارداد موردنیاز:

- شناسهٔ پایدار station برای `key` در LazyColumn.
- عنوان/شرح و label از content projection تأییدشده.
- `nodeState` از evaluator/progress domain؛ نه از index یا رنگ.
- `currentStationId` و `continueAction` مستقل و واقعی باشند.
- `completed/total` باید با هم معتبر باشند؛ اگر total نامشخص است progress bar determinate نسازید.
- lock reason باید به شکل کامل در semantics قابل شنیدن باشد؛ label بصری می‌تواند کوتاه باشد.
- `scrollAnchor` یا restore key فقط از state واقعی/ذخیره‌شده بیاید.

نمونهٔ eventها: `ContinueStation`, `OpenStation(stationId)`, `ExplainLockedStation(stationId)`, `SelectTab(tab)`, `OpenSettings`, `ReturnToCurrent`. هر event باید مالک مشخص داشته باشد؛ callback خالی یا placeholder route پذیرفته نیست.

## 5. Compose layout و scroll

- از `Scaffold`/insets واقعی root استفاده کنید. محتوا باید `WindowInsets.safeDrawing` و gesture navigation را رعایت کند؛ ارتفاع system bar را با مقدار ثابت حدس نزنید.
- محتوای مسیر در `LazyColumn` با `key = stationId` باشد. برای nodeها index را key نکنید؛ ترتیب یا فصل ممکن است عوض شود.
- Bottom bar پایین صفحه را می‌پوشاند؛ `contentPadding` انتهای list باید ارتفاع bar + bottom inset + breathing room را رزرو کند.
- اگر FAB بازگشت به node جاری نیاز است، visibility را از scroll واقعی با `derivedStateOf` محاسبه کنید و footprint آن را در padding/semantics لحاظ کنید. note موجود `PAGE_06_IMPLEMENTATION_NOTE_FA.md` درباره overlap در 360dp را بررسی کنید.
- path connector پشت nodeها رسم شود. geometry و coordinate transformation را از `ShomaraPathGraph` بگیرید. Canvas فقط stroke را رسم کند؛ متن و semantics را داخل Canvas نکشید.
- اندازهٔ node فعلی می‌تواند بزرگ‌تر باشد، اما نباید با label card یا bottom navigation برخورد کند.
- در 600dp به بالا content را centered و محدود کنید؛ نودها را با labelهای عریض کشیده‌شده به دو لبه رها نکنید.

## 6. Design system و زبان بصری

ظاهر این handoff از تصویر مرجع الهام می‌گیرد: زمینهٔ یاسی روشن، کارت‌های سفید، گوشه‌های گرد، عمق نرم و accent بنفش. رنگ سبز برای وضعیت واقعی تکمیل و Amber فقط برای highlight کوچک است.

- `HOME_VISUAL_TOKENS.json` مختص همین صفحه و proposal است؛ فایل canonical `packages/design-system/src/tokens.json` و `ShomaraTokens.kt` را بدون بررسی codegen و تصمیم مالک تغییر ندهید.
- از یک سلسله‌مراتب عمق استفاده کنید: canvas flat، گروه hint، عنصر تعاملی soft، و فقط یک featured surface در viewport تصمیم.
- سایه‌ها blur سنگین و چندلایه نداشته باشند. pressed state باید عمق/edge را کم کند، نه اینکه bounds چیدمان را جابه‌جا کند.
- متن سایه نداشته باشد. برای خوانایی، کنتراست، فضای خالی و اندازهٔ مناسب به‌کار ببرید.
- radiusهای زیاد فقط روی cardهای بزرگ و bottom nav؛ chip کوچک باید سبک‌تر باشد.
- در حالت light/dark system، این صفحه عمداً با canvas روشن طراحی شده؛ dark theme جداگانه را global auto-recolor نکنید. رفتار system bar/contrast باید بررسی شود.

## 7. Navigation و تعامل

- دقیقاً سه tab کودک وجود دارد و ترتیب معنایی آن‌ها «مسیر / تمرین / من» است. در layout RTL، ترتیب فیزیکی را در دستگاه واقعی بررسی کنید.
- guardian/settings مسیر مستقل یا nested surface دارند و tab چهارم نیستند.
- reselect تب فعلی نباید stack جدید بسازد. rapid taps باید idempotent باشد؛ از guard مشترک پروژه استفاده کنید.
- node جاری به شروع/ادامه همان station می‌رود. completed فقط در صورت وجود مسیر review معتبر قابل بازکردن است.
- نود آینده فقط طبق state واقعی domain (معمولاً Locked یا Fresh) نمایش داده شود؛ route ساختگی نسازید.
- locked node اگر راهنمای قفل را باز می‌کند، قابل لمس و قابل‌دسترسی باقی بماند؛ semantics نباید آن را disabled معرفی کند.
- دکمه‌ها حداقل target برابر 48dp داشته باشند. آیکون تزئینی خودش action نیست؛ برای target بزرگ، parent clickable بسازید.

## 8. Node stateها

| وضعیت | ظاهر | تعامل و معنا |
|---|---|---|
| Fresh | طلایی/خنثی لطیف، نشان شروع | فقط وقتی domain state واقعاً Fresh است. |
| Current | برجستهٔ بنفش و یک CTA | تنها Current اصلی در یک صفحه؛ شروع یا ادامه. |
| Completed | سبز و check | تکمیل ثبت‌شده؛ review فقط در صورت route واقعی. |
| Perfect | تکمیل + ring ثانویهٔ ظریف | فقط وقتی evaluator صریحاً perfect داده است. |
| Locked | خنثی + lock + reason | اگر guide موجود است همچنان operable باشد. |

رنگ تنها حامل state نیست: glyph/shape، label و stateDescription هم لازم‌اند. `Perfect` به معنی جایزه یا currency نیست.

## 9. Character art و تصاویر

منابع رسمی فعلی در مخزن نگهداری می‌شوند؛ این ZIP عمداً نسخهٔ تکراری و provenance نامعلوم وارد نمی‌کند:

- Main (front): `apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_main_01.webp`
- Main (wave): `apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_main_10.webp`
- Number (front): `apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_number_01.webp`
- Number (pointing): `apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_number_17.webp`
- Fandogh (official handoff pose): `docs/design-handoff-2026-10/assets/characters/Fandogh/Fandogh_01_front_app_800.webp`

`verify_character_sources.py` وجود و hash هر پنج asset را بررسی می‌کند؛ `install_fandogh_native.py` فقط در صورت نیاز منبع Fandogh را به drawable-nodpi کپی می‌کند. Main و Number را کپی تکراری نکنید.

قواعد نمایش:
- `ContentScale.Fit` / aspect ratio ثابت؛ از crop اجباری و ماسک‌هایی که گوش/تاج/بدن را قطع کنند خودداری کنید.
- هر pose فقط در زمینهٔ مناسب: Main برای greeting/encouragement، Number کنار مفهوم عددی، Fandogh در practice/راهنما/empty state در صورت نیاز.
- هر viewport حداکثر یک شخصیت اصلی؛ چند mascot با هم فقط وقتی روایت آموزشی لازم است.
- تصاویر شخصیت‌ها بدون animation loop؛ هر pose رسمی static است. حرکت جدید یا حالت facial جدید تولید نکنید.
- Placeholder در preview را با asset واقعی جایگزین کنید؛ placeholder به APK نرود.

## 10. SVG، VectorDrawable و bitmap policy

- `02_ASSETS/svg/` منبع برداری قابل ویرایش برای design review، handoff یا ابزار طراحی است.
- `02_ASSETS/android/drawable/` نسخهٔ Android VectorDrawable برای runtime است. SVG را با SVG loader در APK رندر نکنید.
- `garden_path_footer.webp` تنها bitmap تزئینی جدید است؛ alpha دارد و در صورت نیاز به صورت `drawable-nodpi` قرار می‌گیرد. این تصویر نباید متن یا اطلاعات state داشته باشد.
- icon، node، progress و connector را با vector/Compose Canvas بسازید؛ PNGهای چندسایزی برای glyphهای ساده تولید نکنید.
- برای bitmap، ابعاد display و density را قبل از اضافه‌کردن محاسبه کنید؛ تصویر 4K برای thumbnail ممنوع.
- در صورت نیاز به WebP جدید: alpha preservation، quality، byte size، crop bounds و ظاهر روی light canvas را کنترل کنید.
- Font را در این pack کپی نکنید؛ فونت پروژه (Vazirmatn) را از منبع فعلی استفاده کنید.

## 11. Motion، feedback و reduced motion

- tap/press feedback سریع، قابل لغو و بدون layout shift باشد.
- transition کوتاه و محدود (حدود 120–220ms به عنوان baseline؛ token پروژه اولویت دارد).
- shimmer، parallax، idle bouncing یا animation پیوسته لازم نیست.
- reduced motion از `LocalShomaraReducedMotion` یا سازوکار canonical پروژه خوانده شود.
- جشن موفقیت تنها بعد از پاسخ معتبر evaluator؛ در نتیجهٔ retry یا خطا confetti و موفقیت جعلی اجرا نشود.
- Haptic/audio افزونه‌اند؛ نبود آن‌ها نباید تکمیل task را غیرممکن کند.

## 12. Accessibility، RTL و تایپوگرافی

- `Role.Tab`, `selected`, `stateDescription`, `contentDescription`, `ProgressBarRangeInfo` و traversal order باید با رفتار واقعی سازگار باشند.
- tap target حداقل 48dp؛ عناصر manipulable پایه‌های اول 72–80dp.
- متن فارسی راست‌چین و Vazirmatn. عبارات ریاضی، ارقام و نمادها direction مستقل و semantic LTR/locale direction لازم را بگیرند؛ کل صفحه را به خاطر عدد mirror نکنید.
- 360/390/412dp، font scale 1.0/1.3/2.0، TalkBack، keyboard، landscape risk و display cutout را بررسی کنید.
- عنوان/CTA/status ضروری ellipsis نشود. اگر محتوا بیش از حد بلند است، اصلاح content یا wrap درست؛ نه حذف بی‌صدا.
- متن معمولی contrast حداقل 4.5:1 و اجزای بزرگ/مرز کنترل حداقل 3:1 داشته باشند.

## 13. Performance و کیفیت کد

- دادهٔ مسیر را در ViewModel/use case آماده کنید؛ mapping سنگین و sorting در Composable تکرار نشود.
- `remember` فقط برای شیء وابسته به composition؛ `derivedStateOf` برای threshold scroll؛ `key(stationId)` برای list identity.
- برای مسیر بلند LazyColumn به کار ببرید؛ همهٔ nodeها را eagerly با Column تولید نکنید.
- Canvas path را فقط هنگام تغییر bounds/ordered nodes بازسازی کنید؛ محاسبات را جدا و deterministic نگه دارید.
- Stable immutable UI state، collectionهای بدون mutation و callbackهای مشخص داشته باشید؛ `Any`, global mutable singleton و side effect در composition ممنوع.
- هر state change باید قابل‌پیش‌بینی باشد؛ no random IDs/no random progress.
- Bitmapهای شخصیت را بی‌جهت چندبار decode نکنید؛ drawable resource یا image loader موجود را استفاده کنید. preload همهٔ poseها ممنوع.
- تعداد layerهای shadow و overdraw را بررسی کنید. Blur بزرگ و translucent overlay روی هر node هزینه‌زاست.
- هیچ I/O، hash، database read یا package parsing در main thread/Composable انجام نشود.
- log و analytics نباید اطلاعات کودک، پاسخ، correctness یا lock secrets را حمل کند.

## 14. تست‌ها و Definition of Done

### منطق و state
- reducer/ViewModel mapping برای fresh/current/completed/perfect/locked/offline/error.
- حداقل صفر یا یک Current؛ شناسه‌های پایدار و عدم تکرار station ID.
- percentage و progress range از اعداد واقعی؛ completed بیشتر از total رد شود.
- reselect tab، rapid tap، open locked guide، restore-scroll و back stack.

### UI / device
- screenshot واقعی روی 360، 390 و 412dp.
- font scale تا 200%، RTL، TalkBack، safe inset و system nav.
- node labels، CTA و bottom bar هیچ overlap یا clipping نداشته باشند.
- test با reduced motion.

### build / audit
- اول `./gradlew projects` و نام taskهای پروژه را کشف کنید؛ سپس test مربوط به feature، app assemble و checks موجود را اجرا کنید.
- drift gate برای token codegen را اجرا کنید؛ source token را دستی edit نکنید.
- lint/static checks و testهای مسیر فعلی را اجرا کنید؛ baseline failure را از failure جدید جدا کنید.
- `NATIVE_PENDING` را فقط با evidence واقعی به status معتبر تغییر دهید. preview تصویر یا Compose Preview، تست Native/device محسوب نمی‌شود.

**تحویل نهایی Harness:** کد محدود و قابل مرور، asset manifest به‌روز، testهای جدید، log build/test، screenshots دستگاه واقعی، فایل‌های تغییرکرده و دلیل هر تغییر، تصمیم‌های باز و موانع صریح.
