# جذب کامپوننت‌های handoff v3 — DT-69 / فاز ۰.۲

مقایسهٔ کاتالوگ ۲۶ کامپوننت `design/handoff-home-ui-v3/01_DESIGN/COMPONENT_CATALOG_FA.md` با کد واقعی `apps/android`.

## روش

اسامی declaration های Kotlin در همهٔ فایل‌های `src/main` استخراج شد و نام هر کامپوننت به‌صورت **زیررشتهٔ نام
declaration** تطبیق داده شد.

**خطای نسخهٔ اول و دلیل تصحیح:** جدول اول با `\bWordBoundary\` کار می‌کرد، پس `ShomaraContinueStationCard` هرگز با
`ContinueStationCard` تطبیق نمی‌کرد و C05 به‌دروغ «غایب» گزارش شد — پیاده‌سازی در `ShomaraHomeCards.kt` بود. همان
الگوی تکراری این جلسه: حکمِ از باگِ نمونه‌گیری، نه از محصول.

## جدول نهایی

| C# | کامپوننت | وضعیت | شاهد در مخزن |
|---|---|---|---|
| C01 | HomeHeader | ✅ | `ShomaraHomeHeader` @ `ShomaraHomeComponents.kt` |
| C02 | SoftIconButton | ✅ | `ShomaraIconButton` @ `ClaySurface.kt` |
| C03 | GradeChip | ✅ DT-72 | `ShomaraGradeChip` @ `ShomaraHomeKit.kt` — بدون grade پیش‌فرض (قرارداد O5) |
| C04 | ChapterProgressCard | ✅ | `ShomaraChapterProgressCard` @ `ShomaraHomeCards.kt` |
| C05 | ContinueStationCard | ✅ | `ShomaraContinueStationCard` @ `ShomaraHomeCards.kt` |
| C06 | ChapterRibbon | ✅ | `ShomaraChapterBand` @ `ShomaraPathChapter.kt` |
| C07 | PathConnector | ✅ | `connectorEnterOffsetDp` @ `ShomaraPathState.kt` |
| C08 | PathNode | ✅ | `ShomaraPathNodeItem` @ `ShomaraPathNodes.kt` |
| C09 | NodeStatusLabel | ⚠️ داخل C08 | `stateLabel` در `ShomaraPathNodes.kt` — standalone نیست |
| C10 | NodeInfoCard | ⚠️ داخل C08 | جزئی در `ShomaraPathNodeItem` |
| C11 | LockedReasonSheet | ✅ | `ShomaraDialogState` @ `ShomaraDialog.kt` |
| C12 | PathReturnFab | ✅ DT-72 | `ShomaraPathReturnFab` @ `ShomaraHomeKit.kt` — نه‌چیزی رندر نمی‌کند وقتی ناپدید است |
| C13 | BottomNavBar | ✅ | `ShomaraChildTabs` @ `ShomaraNavigation.kt` |
| C14 | LessonTopicIcon | ✅ DT-72 | `ShomaraLessonTopicIcon` + `ShomaraLessonTopic` @ `ShomaraHomeKit.kt` |
| C15 | CharacterSlot | ✅ | `ShomaraCharacterSlot` @ `ShomaraCharacter.kt` |
| C16 | LoadingSurface | ✅ | `ShomaraStateSurface` |
| C17 | EmptySurface | ✅ | `ShomaraStateSurface` |
| C18 | ErrorSurface | ✅ | `ShomaraStateSurface` |
| C19 | OfflineContentSurface | ✅ | `ShomaraStateSurface` |
| C20 | SuccessFeedback | ✅ | `ShomaraFeedbackBanner` @ `ShomaraFeedback.kt` |
| C21 | ProgressIndicator | ✅ | `ShomaraSegmentedProgressRing` @ `ShomaraPathNodes.kt` |
| C22 | PageHeaderAction | ⚠️ | `ShomaraIconButton` موجود؛ ترکیب header-action ندارد |
| C23 | ContinueTopicTile | ✅ DT-72 | `ShomaraContinueTopicTile` + `ShomaraLessonTopics` @ `ShomaraHomeCards.kt` |
| C24 | ScrollRestoration | ⚠️ | `anchorIndex` در `ShomaraPathScreen` — قرارداد رسمی ندارد |
| C25 | PathSafeContentPadding | ⚠️ | padding پراکنده در صفحه‌ها — قرارداد واحد ندارد |
| C26 | ChildFriendlyDialog | ✅ | `ShomaraDialog` |

## جمع

- **۲۱ موجود کامل** — بازطراحی‌شان نمی‌کنیم، فقط از API همان‌ها مصرف می‌کنیم.
- **۴ غایب واقعی → در DT-72 ساخته شدند**: `GradeChip`، `PathReturnFab`، `LessonTopicIcon` (در
  `core/designsystem/ShomaraHomeKit.kt`) و `ContinueTopicTile` (در `feature/path/ShomaraHomeCards.kt`).
- **۵ نیمه/قراردادی**: C09/C10 (داخل PathNodeItem)، C22 (ترکیب)، C24/C25 (قرارداد صریح لازم دارند).

## تصمیم اجرایی

طبق قاعدهٔ خود v3 («وجود ردیف = مجوز کامپوننت موازی نیست»):

1. برای ۱۷ مورد موجود: **صرفاً مصرف**؛ اگر API کافی نیست، همان API گسترش می‌یابد.
2. برای ۴ غایب: کامپوننت **جديد در `core/designsystem`** ساخته می‌شود — نه duplicate.
3. دارایی‌های VectorDrawable مربوطه (nav/node/lesson/state icons) پیش از Compose مصرف‌کننده، در `res/drawable`
    درست قرار می‌گیرند (فاز ۲.۲).

## DT-72 — پیامد فاز ۲.۲ و ساخت ۴ کامپوننت

- **فاز ۲.۲ (دارایی‌ها) از قبل کامل بود:** هر ۳۲ VectorDrawable کاتالوگ پیش‌تر در
  `apps/android/core/designsystem/src/main/res/drawable` وجود داشتند (بررسی sha256: ۳۱ بایت‌به‌بایت یکسان، ۱
  تفاوت فقط `strokeColor="none"` اضافه در `shomara_ui_play.xml` با گلیف یکسان). هیچ کپی انجام نشد — «کپی
  موجود» خودش اقدام بیهوده می‌بود.
- **C03 GradeChip**: بدون مقدار پیش‌فرض؛ «unavailable» یعنی compose نشدن، نه رندر یک grade ساختگی (O5).
- **C12 PathReturnFab**: وقتی `visible=false` است *هیچ‌چیز* compose نمی‌شود — TalkBack هرگز کنترلی بی‌معنا را
  focus نمی‌کند؛ آستانهٔ اسکرول مالِ صاحب صفحه است.
- **C14 LessonTopicIcon**: چهار topic (شمارش/جمع/شکل‌ها/الگوها) با label فارسی؛ label خوانده‌شده = label دیده‌شده.
- **C23 ContinueTopicTile**: mapping فصل→topic به‌صورت جدول صریح و JVM-testable (`ShomaraLessonTopics`)، نه
  `chapter % 4` پنهان در UI؛ فصل ۵ کاتالوگ واقعی پوشش داده شد (نقشهٔ اول ۴ فصل داشت — باگ محتمل).

شواهد DT-72: `ShomaraHomeKitTest` (instrumented، ۷ تست) و `ShomaraLessonTopicsTest` (JVM، ۳ تست) +
`verify:static:all` 94/94؛ شمار کامل در جدول gate همان commit.

این سند فقط وضعیت امروز را ثبت می‌کند؛ تغییر وضعیت فقط با شاهد (build/test) انجام می‌شود.
