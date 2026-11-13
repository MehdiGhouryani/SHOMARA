# UX Architecture Map و Journey Contracts — SHOMARA Native (P12/ADR-0048)

- **تاریخ:** 2026-11-14 · **شاخه:** `infra/p12-ux-architecture` · **نوع فاز:** معماری تجربه/سفر؛ **بدون بازطراحی بصری Home و بدون تغییر کد**
- **منبع ممنوعیت‌ها:** ADR-0039 §6 (مدل ساختاری Duolingo؛ هیچ Brand Asset/Copy/Font/Color/Icon/Sound/Character وارد نشود)، ADR-0040، PAGE_UIUX_BLUEPRINT.md (۱۷ خانواده)، SCREEN_LEDGER.csv، NATIVE_IMPLEMENTATION_BACKLOG.csv، ROUTE_REGISTRY.md
- **قرار Home:** طراحی نهایی Home در چت جداگانه انجام می‌شود؛ **فایل handoff نهایی Home در repo موجود نیست → Home (بصری) = BLOCKED**؛ این سند فقط **قرارداد داده/Interaction/State** لازم برای Home را تعریف می‌کند (§7) و هیچ طرح جایگزینی نمی‌سازد.

---

## 1. UX Architecture Map

```text
Shell سه‌تب (Family 17): مسیر | تمرین | من     ← فقط سه تب؛ RTL؛ active pill
├─ مسیر (Family 06 = Home ساختاری در مدل Duolingo) ← visual: BLOCKED (handoff جدا)
│    ├─ node انتخاب‌شده → Station Start (07) → درس
│    └─ unit headers/guidebook → unit detail (ROUTE_REGISTRY: unit/[unitId])
├─ تمرین (Family 12): practice واقعی + review مارپیچی → entry به درس
├─ من (Family 14): Profile/Me → Avatar/Settings (15) → Guardian (15/16، خارج shell)
جریان درس (learning-player؛ Families 08–11,13):
   Station Start → P1 Teach/Discover (08) → P2 Guided (09) → P3 Game (13)
   → P4 Assessment (10) → P5 Transfer → Result/Recovery (11) → بازگشت به مسیر
جریان ورود (01–05): Launch → Onboarding → Profile setup → Grade/Placement (calibration)
   → اولین درس → shell
System states (16): cross-route loading/empty/error/missing-asset
```

## 2. Journey diagram (سفر کل محصول)

```text
[A] Cold start → Launch(01): resolving → new? onboarding : returning? Path : offline/error
[B] Onboarding(02) → Profile setup(04) → Grade/Placement(05=calibration) → first lesson(07→08)
[C] Path(06) → انتخاب node → Station Start(07) →
      P1 Discover(08) → P2 Guided(09) → P3 Game(13) → P4 Assessment(10)
      → P5 Transfer → Result(11 pass/fail) → Recovery(11) → Mistake Review → Path(06)
[D] Practice tab(12): review/spiral از mistakes واقعی → entry درس → بازگشت Path
[E] Me(14) → Avatar(15) / Settings(15) / Guardian(15+16, re-auth fail-closed)
Back در هر سطح: §5 (دقیق، شامل confirm خروج درس و resume)
```

## 3. Screen contract matrix (۱۷ خانواده — تمام فیلدهای مأموریت)

نماد وضعیت‌ها: **L**=loading، **E**=empty، **R**=error، **K**=locked، **Y**=ready، **C**=completed. CTA = «فقط یک» primary در هر state.

| # | Family | entry → exit | هدف | CTA per state | states | Back/Resume | دادهٔ لازم | ViewModel contract (UiState / Events) | a11y focus order | motion intent |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | Launch/Welcome | cold start → session resolve | فهم ورود جدید/ادامه | resolving:∅ · new/returning: «شروع/ادامه» · offline: «تلاش دوباره» · error: fallback | resolving/new/returning/offline/error | Back=سیستم؛ resume=خودکار از session | launch state، profile-exists، package status | `LaunchUiState(resolving/new/returning/offline/error)` / `Retry`, `Continue` | لوگو→وضعیت→CTA | fade کوتاه؛ بدون splash حلقه‌ای |
| 02 | Onboarding | first-run → profile setup | هر بار یک مفهوم | «ادامه» (skip فقط محصولی) | first/resume/back/save/L/R | Back=گام قبل؛ resume=همان گام | onboarding step، draft | `OnboardingUiState(step, draft)` / `Next`, `Back`, `Save` | عنوان→illustration→CTA | transition یک‌گام؛ قابل لغو |
| 03 | Phone/OTP — **در مدل آفلاین حذف (ADR-0039؛ Phase 2)** | — | — | — | — | — | — | حذف از journey؛ این ردیف فقط مرجع تاریخی | — | — |
| 04 | Profile setup | onboarding → placement | حداقل داده | «ذخیره و ادامه» | empty/invalid/saving/save-fail/resume | Back=گام قبل؛ resume=draft | name/avatar/grade | `ProfileSetupUiState(fields, errors)` / `Save`, `PickAvatar`, `PickGrade` | پرسش→field→error→CTA | خطا بدون shake خشن |
| 05 | Grade/Placement (calibration) | profile → اولین درس | پایهٔ قابل‌دسترس | «ادامه»/«شروع تعیین‌سطح» | selected/locked/unavailable/L/exit/resume/R | Back=profile؛ resume=انتخاب | grade catalog، placement items | `PlacementUiState(grades, selected, assessment?)` / `Select`, `StartAssessment`, `Continue` | عنوان→cards→CTA | انتخاب = highlight نرم؛ assessment بی‌انیمیشن اضافی |
| 06 | Learning Path (**Home ساختاری**) | shell → station start | جای فعلی و گام بعدی | CTA همان node انتخاب‌شده | fresh/current/completed/perfect/K/L/R/restore-scroll | Back=tab سیستم؛ **scroll restore** | progress محلی، station catalog، unlock | `PathUiState(nodes, currentId, scrollPx)` / `SelectNode`, `StartStation`, `RetryLoad` | ribbon→current node→nodeها به ترتیب مسیر→CTA | ripple نرم؛ pulse فقط Current (بدون pulse طبق ADR-0040) |
| 07 | Station Start | path → درس | هدف کوتاه + شروع/ادامه | «شروع»/«ادامه» | L/ready/resume/K/R/starting | Back=path؛ resume=checkpoint درس | station meta واقعی، checkpoint، package status | `StationStartUiState(meta, resumePoint, ready)` / `Start`, `Resume`, `Back` | عنوان→aim→CTA | ظهور کوتاه؛ بدون success جعلی |
| 08 | Teach/Discover (P1) | start → guided | کشف با مشاهده/تعامل | «ادامه» پس از شرط معتبر | ready/interactive/audio-unavailable/L/playing/failed/reduced-motion | Back=confirm خروج؛ resume=گام فعلی | projection P1، audio index، asset refs | `DiscoverUiState(steps, currentStep, revealed)` / `TapCard`, `Continue`, `Replay` | پرامپت→manipulativeها→reveal→CTA | reveal مفهومی کوتاه؛ reduced-motion نسخهٔ ایستا |
| 09 | Guided Practice (P2) | discover → game | پاسخ هدایت‌شده + راه بعدی | «بررسی» → «ادامه/دوباره» | idle/selected/submitting/correct/retry/recovery/L/R | Back=confirm؛ resume=آیتم/تلاش | projection P2 items، evaluator outcome | `GuidedUiState(item, selected, submitting, feedback)` / `Select`, `Check`, `Continue`, `Retry` | پرامپت→manipulative/گزینه‌ها→feedback→CTA | feedback فوری پایدار؛ بدون drag-only |
| 10 | Assessment (P4) | guided/game → result | مستقل، بدون افشا | «بررسی پاسخ» | idle/selected/submitting/result/disconnect/resume/expired | Back=confirm صریح؛ resume=آیتم جاری | projection P4، evaluator | `AssessmentUiState(items, answers, submitting, result)` / `Select`, `Check`, `Next` | صورت مسئله→choices→CTA | متمرکزترین stage: بدون celebration/hint |
| 11 | Result/Recovery (پایان P5 / خطا) | آخرین stage → path | بدون شرم: راه اصلاح | pass:«ادامه مسیر» · retry:«دوباره تلاش کن» · recovery:«مرور اشتباه‌ها» | correct/retry/recovery/pass/fail/L/resume | Back=path؛ resume=خیر (نتیجه قطعی ارزیاب) | outcome ارزیاب محلی، mistakes | `ResultUiState(outcome, mistakes)` / `Continue`, `Retry`, `StartRecovery` | نتیجه→گام اصلاح→CTA | celebration محدود پس از success معتبر؛ بدون shake |
| 12 | Practice tab | tab → درس | تمرین واقعی + مرور | «شروع/ادامه تمرین» | L/list/E/K/R/history | Back=tab؛ resume=لیست | mistakes واقعی، review items | `PracticeUiState(rows, empty)` / `StartPractice`, `OpenReview` | عنوان→rows→empty guide | ورود row = نرم؛ بدون grid ساختگی |
| 13 | Challenge (P3) | guided → result | قانون و round جاری | intro:«شروع چالش» · round:«ثبت پاسخ» | unavailable/intro/round/submitting/retry/result/L/R | Back=intro (در round confirm)؛ resume=round | projection game، pattern rule | `ChallengeUiState(intro, round, submitting)` / `Start`, `Submit`, `Retry` | قوانین→round→CTA | intro کوتاه؛ round بدون مزاحمت |
| 14 | Profile/Me | tab → rows | هویت و پیشرفت واقعی | action هر row (بدون CTA مصنوعی) | L/ready/E/R/edit-return | Back=tab؛ resume=لیست | profile واقعی، progress واقعی | `MeUiState(profile, facts)` / `OpenAvatar`, `OpenSettings`, `OpenGuardian` | header→facts→rows | بدون badge/streak ساختگی |
| 15 | Avatar/Settings/Guardian | me → save/exit | تغییر امن preferenceها | «ذخیره» فقط با تغییر | owned/equipped/K/saving/toggle-fail/restart/re-auth/R | Back=me؛ guard=تغییر ذخیره‌نشده | avatar catalog، settings، guardian auth | `SettingsUiState(owned, equipped, toggles, dirty)` / `Equip`, `Toggle`, `Save`, `ReAuth` | grid→rows→dialog→CTA | equip = swap فوری؛ بدون avatar خیالی |
| 16 | System states | هرجا توقف | علت + اقدام بعدی | «تلاش دوباره»/fallback معتبر | L/E/R/permission/missing-asset | Back=مقصد قبلی؛ resume=پس از رفع | علت واقعی، action واقعی | `SystemUiState(cause, retryable)` / `Retry`, `Fallback` | پیام→علت→action | بدون spinner بی‌انتها؛ بدون متن فنی |
| 17 | Navigation shell | always → always | همیشه بداند کجاست/Back چه | destination tap فقط | selected/reselect/deep-link/nested/back/modal/IME/restoration | Back=tab hierarchy (§5)؛ resume=selected tab | selected tab | `ShellUiState(selectedTab)` / `SelectTab` | tab bar آخر؛ active marker | pill جابه‌جایی نرم |

## 4. State/event catalog (مشترک درس — دقیق‌ترین ماشین)

```text
LessonUiState = (stage: P1|P2|P3|P4|P5, encounterId, item?, selected?, feedback?,
                 attempts: Map<encounterId,Int>, mistakes: [encounterId], sessionState)
Events: PresentEncounter(eid) · Select(choiceId) · Check(attemptKey) · Continue
        · Retry(attemptKey) · RequestHint(index) [فقط P1..P3] · Suspend · Resume · ExitRequest
Effects (engine→UI): FeedbackShown(correct/retry) · AttemptRecorded(key) · StageAdvanced ·
                     SessionSuspended(checkpoint) · EvaluationRefused(reason)  [O1 gate]
قواعد: Check فقط بعد از Present و با single-flight (duplicate=no-op)؛ Continue فقط پس از
feedback؛ Hint در P4/P5 ممنوع (ShomaraMacroStages.HINT_BANNED)؛ Advance فقط دستی.
```

## 5. Navigation / Back / Resume contract (shell + درس)

| سطح | Back | Resume |
|---|---|---|
| Tab | hierarchy: هر tab خودش root است؛ Back از tab → خروج برنامه (استاندارد) | selected tab + scroll position هر لیست |
| Path | سیستم | scroll restore + current node |
| Station Start | Path | checkpoint یا از نو (انتخاب کاربر) |
| درس (P1..P5) | گام ۱: confirm «خروج؟ پیشرفت ذخیره می‌ماند» → گام ۲: suspend+checkpoint → Path | resume از checkpoint (IDs + stage)؛ content از package |
| Assessment | خروج صریح‌تر (طبق قرارداد 10؛ بدون hint/audio افشاگر) | آیتم جاری؛ زمان‌سنج فقط اگر قرارداد محتوا داشته باشد |
| Guardian | خروج به Me فقط پس از re-auth موفق؛ fail-closed | — |
| Deep link | همان مقصد مستقیم؛ locked → Station Start locked sheet | — |
| Process death | SavedState + checkpoint DataStore | resume از checkpoint؛ خواندن Room برای attempts |

## 6. قرارداد Home (فقط data/interaction/state — visual BLOCKED)

- **BLOCKED (بصری):** فایل handoff نهایی Home در repo نیست؛ هیچ طرح جایگزینی ساخته نمی‌شود.
- **Data:** progress واقعی (Room)، station catalog از پکیج فعال، unlock از ProgressionEngine (گیت CONTENT-014)، mistakes واقعی.
- **Interaction:** tap node → Station Start؛ CTA فقط node انتخاب‌شده؛ deep link همان مسیر؛ بدون هیچ CTA ساختگی.
- **State:** fresh/current/completed/perfect/locked + offline/error/restore-scroll (طبق قرارداد 06).
- **ممنوع:** lives/streak/currency/loot/shop/leaderboard (تغییرناپذیر مگر ADR).

## 7. Gap list (واقعیت فعلی → این قرارداد)

1. **Engine→UI wiring صفر است** — LocalLessonEngine/Registry/Checkpoint (P6) به هیچ ViewModel وصل نشده؛ U3 contracts همین سند را پیاده می‌کنند.
2. **Home visual = BLOCKED** (handoff نهایی در چت جداگانه)؛ فقط قرارداد §6 الزامی است.
3. **Family 03 (Phone/OTP)** از journey حذف شده (ADR-0039؛ Phase 2) — journey فعلی هنوز launch gate سرور-محور دارد؛ حذف = P2-program (O3/O5).
4. **P3 Game evaluator**: فقط T05-pattern قطعی؛ بقیه roundها به O1 وابسته‌اند.
5. **P4/P5 projection transcribe نشده** (P8) — assessment/transfer contracts آماده‌اند ولی content واقعی نمی‌آید (بدون جعل).
6. **Practice tab review/spiral**: نیازمند mistakes واقعی از engine — پس از wiring.
7. **Guardian**: PIN محلی (P10) باید جای re-auth سرور-محور بنشیند (O3/O5).
8. **missions** مسیر legacy-unreachable باقی است (D-010) تا تصمیم مالک.
9. **TalkBack focus order و predictive Back**: قرارداد ثبت شد؛ evidence دستگاهی = U6.
