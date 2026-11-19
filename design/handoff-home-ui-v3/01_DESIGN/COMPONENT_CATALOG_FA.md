# کاتالوگ جامع کامپوننت‌های Home / Learning Path شمارا

این کاتالوگ سطح نیاز UI و قرارداد interaction را مشخص می‌کند. مسیر Native فعلی پنج وضعیت رسمی Fresh / Current / Completed / Perfect / Locked دارد؛ «ایستگاه بعدی» عنوان محتوایی است، نه state مستقل. وجود یک ردیف در جدول به معنی مجاز بودن ساخت component موازی نیست؛ ابتدا component مشترک موجود را reuse یا با یک API واحد توسعه دهید.

| ID | Component | ورودی‌های کلیدی | حالت‌ها | تعامل/معیار | منبع |
|---|---|---|---|---|---|
| C01 | HomeHeader | title, subtitle, character?, settingsAction? | ready, loading, compact | عنوان wrap شود؛ settings فقط route واقعی | `ui_settings.svg` / vector |
| C02 | SoftIconButton | icon, semanticLabel, callback | default, pressed, focused, disabled, loading | target حداقل 48dp | ui icon vectors |
| C03 | GradeChip | grade label | default, unavailable | فقط grade واقعی؛ بدون badge ارزگونه | Compose shape/text |
| C04 | ChapterProgressCard | grade, chapter, progress, spokenLabel | determinate, indeterminate, unavailable, error | progress از ViewModel؛ range semantics | book/progress vector |
| C05 | ContinueStationCard | stationId, eyebrow, title, description, actionLabel, isResume | fresh, resume, current, loading, unavailable | eyebrow و CTA باید از isResume/domain تعیین شوند؛ یک CTA اصلی؛ action idempotent | topic icon / button |
| C06 | ChapterRibbon | chapterId, title, theme color | normal, loading | یک بار در مرز فصل؛ متن همیشه accessible | `chapter_ribbon.svg` |
| C07 | PathConnector | ordered node coordinates | completed/active/locked | پشت nodeها؛ continuous; از `ShomaraPathGraph` | Compose Canvas |
| C08 | PathNode | stationId, order, state, title, lockReason | fresh, current, completed, perfect, locked | state domain-owned؛ stable ID | node SVG / vector |
| C09 | NodeStatusLabel | status label | normal, largeText | متن وضعیت، نه صرفاً رنگ | Compose Text |
| C10 | NodeInfoCard | title, description, status | normal, expanded | wrap؛ عدم overlap با node/CTA | Surface |
| C11 | LockedReasonSheet | title, full reason, dismiss action | open, closed | reason از domain؛ guide action واقعی | lock/close vectors |
| C12 | PathReturnFab | visible, currentStationId | hidden, visible, loading | فقط پس از scroll threshold واقعی؛ safe-area-aware | arrow vector |
| C13 | BottomNavBar | selectedTab, onSelect | path/practice/me × active/inactive | دقیقاً ۳ تب؛ route owner در coordinator | ۶ nav vectors |
| C14 | LessonTopicIcon | topic type | default, selected, disabled | counting/addition/shapes/patterns | lesson SVG/VectorDrawable |
| C15 | CharacterSlot | character, pose, size | static pose only | Main/Number/Fandogh source رسمی؛ Fit; بدون pose جعلی | character source files |
| C16 | LoadingSurface | semantic description | loading | ثابت؛ بدون shimmer اجباری | Compose primitive |
| C17 | EmptySurface | title, helper, optional action | empty | empty واقعی؛ action فقط با callback | state_empty |
| C18 | ErrorSurface | child-facing message, retryAction? | error | retry فقط اگر واقعی است | state_error |
| C19 | OfflineContentSurface | content availability, retry/back? | local content unavailable | offline برای محصول حالت عادی است؛ banner سراسری نسازید | state_offline |
| C20 | SuccessFeedback | evaluator result | completed, perfect | فقط بعد از evaluator success | state_success |
| C21 | ProgressIndicator | fraction, range, spokenLabel | determinate, indeterminate | 0..1 معتبر؛ range semantics | progress SVG / Compose |
| C22 | PageHeaderAction | settings/help/back | enabled, disabled, pressed | back فقط با route واقعی | settings/help/chevron vectors |
| C23 | ContinueTopicTile | topicId, icon, number/label | current, preview | فقط محتوا و identity واقعی | lesson vectors |
| C24 | ScrollRestoration | anchor id, list state | restore, unavailable | key از stationId/chapter؛ after content measure | state/ViewModel |
| C25 | PathSafeContentPadding | nav height, bottom inset, fab | compact, standard | no overlap with bottom nav / gesture bar | Compose layout |
| C26 | ChildFriendlyDialog | title, body, positive/negative callbacks | open, busy, dismissed | callback واقعی؛ focus/Back semantics | Compose Dialog |

## قرارداد stateهای Node

| State | نشان بصری | TalkBack / متن | مجاز بودن action |
|---|---|---|---|
| Fresh | نشان شروع و زمینهٔ warm | «آمادهٔ شروع» | فقط route شروع واقعی |
| Current | حلقه/سطح بنفش برجسته | «ایستگاه فعلی» | شروع/ادامه همان station |
| Completed | check و سبز | «تکمیل‌شده» | review فقط با route واقعی |
| Perfect | check + ring دوم باریک | «با عملکرد کامل تکمیل‌شده» | review فقط با route واقعی |
| Locked | lock و neutral | قفل + علت کامل | اگر guide/detail وجود دارد، clickable بماند |

## ماتریس وضعیت تعاملی

هر عنصر تعاملی باید حالت‌های Default, Pressed, Focused, Selected, Disabled, Loading و Error را متناسب با ماهیت خودش داشته باشد. همهٔ حالت‌ها لازم نیست در هر کامپوننت وجود داشته باشند؛ state نامربوط را اختراع نکنید.

## قرارداد ظاهری و accessibility

- آیکون در Navigation: 24–28dp؛ node استاندارد 72dp و Current حدود 84dp؛ manipulatives آموزشی 72–80dp.
- hit target همهٔ actionها حداقل 48dp؛ visual icon می‌تواند کوچک‌تر باشد اما target والد باید بزرگ باشد.
- text مهم در 200% font scale wrap شود و حذف نشود.
- selected/current/completed/locked هم در visual و هم در semantics مشخص باشند.
- `locked` در صورت action توضیحی نباید disabled semantics بگیرد.
- آیکون‌های SVG source هستند؛ در Android از VectorDrawable استفاده کنید.

## Reuse map

قبل از اضافه کردن implementation برای C01–C26 APIهای `ShomaraTopBar`, `ShomaraTabBar`, `ShomaraButton`, `ShomaraPathGraph`, `ShomaraFeedbackBanner`, `ShomaraStateSurface`, `ShomaraCharacterImage` و `ShomaraDigits` را بررسی کنید. اگر API موجود نیازمند icon slot یا semantics بهتر است، همان را گسترش دهید و duplicate را حذف کنید.
