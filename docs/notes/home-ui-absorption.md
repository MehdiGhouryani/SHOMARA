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
| C03 | GradeChip | ❌ **غایب** | — |
| C04 | ChapterProgressCard | ✅ | `ShomaraChapterProgressCard` @ `ShomaraHomeCards.kt` |
| C05 | ContinueStationCard | ✅ | `ShomaraContinueStationCard` @ `ShomaraHomeCards.kt` |
| C06 | ChapterRibbon | ✅ | `ShomaraChapterBand` @ `ShomaraPathChapter.kt` |
| C07 | PathConnector | ✅ | `connectorEnterOffsetDp` @ `ShomaraPathState.kt` |
| C08 | PathNode | ✅ | `ShomaraPathNodeItem` @ `ShomaraPathNodes.kt` |
| C09 | NodeStatusLabel | ⚠️ داخل C08 | `stateLabel` در `ShomaraPathNodes.kt` — standalone نیست |
| C10 | NodeInfoCard | ⚠️ داخل C08 | جزئی در `ShomaraPathNodeItem` |
| C11 | LockedReasonSheet | ✅ | `ShomaraDialogState` @ `ShomaraDialog.kt` |
| C12 | PathReturnFab | ❌ **غایب** | — |
| C13 | BottomNavBar | ✅ | `ShomaraChildTabs` @ `ShomaraNavigation.kt` |
| C14 | LessonTopicIcon | ❌ **غایب** | drawables در v3 هست، مصرف‌کنندهٔ Compose ندارد |
| C15 | CharacterSlot | ✅ | `ShomaraCharacterSlot` @ `ShomaraCharacter.kt` |
| C16 | LoadingSurface | ✅ | `ShomaraStateSurface` |
| C17 | EmptySurface | ✅ | `ShomaraStateSurface` |
| C18 | ErrorSurface | ✅ | `ShomaraStateSurface` |
| C19 | OfflineContentSurface | ✅ | `ShomaraStateSurface` |
| C20 | SuccessFeedback | ✅ | `ShomaraFeedbackBanner` @ `ShomaraFeedback.kt` |
| C21 | ProgressIndicator | ✅ | `ShomaraSegmentedProgressRing` @ `ShomaraPathNodes.kt` |
| C22 | PageHeaderAction | ⚠️ | `ShomaraIconButton` موجود؛ ترکیب header-action ندارد |
| C23 | ContinueTopicTile | ❌ **غایب** | — |
| C24 | ScrollRestoration | ⚠️ | `anchorIndex` در `ShomaraPathScreen` — قرارداد رسمی ندارد |
| C25 | PathSafeContentPadding | ⚠️ | padding پراکنده در صفحه‌ها — قرارداد واحد ندارد |
| C26 | ChildFriendlyDialog | ✅ | `ShomaraDialog` |

## جمع

- **۱۷ موجود کامل** — بازطراحی‌شان نمی‌کنیم، فقط از API همان‌ها مصرف می‌کنیم.
- **۴ غایب واقعی**: `GradeChip`، `PathReturnFab`، `LessonTopicIcon`، `ContinueTopicTile`.
- **۵ نیمه/قراردادی**: C09/C10 (داخل PathNodeItem)، C22 (ترکیب)، C24/C25 (قرارداد صریح لازم دارند).

## تصمیم اجرایی

طبق قاعدهٔ خود v3 («وجود ردیف = مجوز کامپوننت موازی نیست»):

1. برای ۱۷ مورد موجود: **صرفاً مصرف**؛ اگر API کافی نیست، همان API گسترش می‌یابد.
2. برای ۴ غایب: کامپوننت **جديد در `core/designsystem`** ساخته می‌شود — نه duplicate.
3. دارایی‌های VectorDrawable مربوطه (nav/node/lesson/state icons) پیش از Compose مصرف‌کننده، در `res/drawable`
   درست قرار می‌گیرند (فاز ۲.۲).

این سند فقط وضعیت امروز را ثبت می‌کند؛ تغییر وضعیت فقط با شاهد (build/test) انجام می‌شود.
