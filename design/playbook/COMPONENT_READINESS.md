# Component readiness contract — Native Design System V3

این سند قرارداد state/API و acceptance خانواده‌های Native است؛ وضعیت implementation را با gate validation اشتباه نگیرید.

## واژگان وضعیت

- `SPECIFIED`: قرارداد/API/state matrix ثبت شده است.
- `SOURCE_IMPLEMENTED`: کد Compose/logic مربوط در مخزن وجود دارد.
- `LOGIC_TESTED`: تست JVM یا domain logic سبز است؛ به معنی Compose semantics یا device pass نیست.
- `NATIVE_PENDING`: semantics/instrumentation، screenshot و device/TalkBack evidence هنوز ثبت نشده است.
- `NATIVE_VALIDATED`: فقط پس از اجرای semantics + screenshot در 360/390/412dp و 200% font + device/TalkBack و ثبت artifact/SHA قابل استفاده است.

**نکتهٔ جاری:** چند خانواده در کد و تست JVM پیاده‌سازی شده‌اند؛ هیچ‌کدام صرفاً با وجود کد یا preview، `NATIVE_VALIDATED` نمی‌شوند. گیت Android Native روی branch در حال حاضر فقط Unit + Lint + app debug compile است، نه instrumented/device UI validation.

## وضعیت واقعی خانواده‌ها در baseline نیتیو (2026-11-17)

| خانواده | Source | Logic tests | وضعیت Native | مسیرهای اصلی |
|---|---|---|---|---|
| Button | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraButton.kt`, `ShomaraPrimitives03Test.kt` |
| TextField/OTP | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraTextField.kt`, `ShomaraOtp.kt`, `ShomaraPrimitives03Test.kt` |
| Card/Choice | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraCard.kt`, `ShomaraPrimitives04Test.kt` |
| Feedback | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraFeedback.kt`, `ShomaraPrimitives04Test.kt` |
| Progress | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraProgress.kt`, `ShomaraPrimitives04Test.kt` |
| TopBar/TabBar | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraNavigation.kt`, `ShomaraPrimitives05Test.kt` |
| Dialog/Sheet | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraDialog.kt`, `ShomaraPrimitives05Test.kt` |
| AudioControl | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraAudio.kt`, `ShomaraPrimitives05Test.kt` |
| Manipulative | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraManipulative.kt`, `ShomaraManipulativeTest.kt` |
| Theme / Clay | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraTheme.kt`, `ClaySurface.kt`, `ShomaraThemeTest.kt`, `ClayContractTest.kt` |

این ماتریس وضعیت implementation و JVM test را ثبت می‌کند؛ تمام سلول‌های Native عمداً `NATIVE_PENDING` هستند تا شواهد دستگاهی واقعی ضمیمه شود.

## قرارداد مشترک هر component

هر component قبل از کدنویسی باید این قرارداد را داشته باشد:

- purpose و موارد عدم استفاده؛
- API semantic و slotهای مجاز؛
- state matrix و transitionهای معتبر؛
- geometry از token canonical، بدون magic value؛
- role/label/state/action و ترتیب TalkBack؛
- رفتار RTL و math-direction؛
- reduced-motion، audio/haptic fallback؛
- loading/error/disabled و duplicate-action policy؛
- preview fixture قطعی؛
- unit/semantics/screenshot/device evidence متناسب.

## ماتریس componentهای N03

| خانواده | stateهای الزامی | نکتهٔ آموزشی/دسترس‌پذیری | gate اصلی |
|---|---|---|---|
| Button | default/pressed/focused/disabled/loading | action یکتا، target حداقل 48dp، loading بدون پرش | semantics + fast tap |
| TextField/OTP | empty/focused/filled/invalid/disabled/loading | label پایدار، خطای متنی، keyboard/IME فارسی | input + font scale |
| Card/Choice | default/pressed/selected/checked/correct/retry/disabled | status فقط با رنگ منتقل نشود | state screenshot |
| Feedback | correct/retry/recovery/error | layout ثابت و متن قابل‌اقدام؛ بدون سرزنش | server-result mapping |
| Progress | determinate/indeterminate/paused/offline | mastery را حدس نزند؛ announcement کنترل‌شده | state source test |
| TopBar/TabBar | default/selected/locked/badge-free | Back واقعی، route ثابت، بدون duplicate navigation | navigation semantics |
| Dialog/Sheet | open/busy/error/dismiss-blocked | focus trap، close policy و state restoration | back/process test |
| AudioControl | unavailable/loading/playing/paused/failed/cached | text fallback؛ lesson هرگز با نبود صوت قفل نشود | missing/offline test |
| Manipulative | idle/active/dragging/accepted/retry/locked | target ترجیحاً 72–80dp و tap alternative | math/RTL + child QA pending |

## depth contract برای Clay

| tier | کاربرد مجاز | ممنوع |
|---|---|---|
| flat | canvas، متن، assessment background | سایه برای متن |
| hint | grouping ملایم یا وضعیت غیرتعاملی | وانمودکردن به clickable بودن |
| soft | کنترل یا card تعاملی | چند سطح تو در تو |
| featured | فقط focal object یا CTA همان state | بیش از یک featured surface در viewport تصمیم |

pressed state باید depth را کاهش دهد و feedback لمسی بدهد، بدون جابه‌جایی layout یا تأخیر در action. Depth هیچ‌گاه تنها حامل معنا نیست.

## ترتیب پیاده‌سازی N03

1. schema و codegen token با drift gate؛
2. theme، type و math-direction primitives؛
3. Button/Input/OTP؛
4. Card/Choice/Feedback/Progress؛
5. Navigation/Dialog/Audio؛
6. manipulativeهای content-aware؛
7. screenshot catalog و owner gate.

componentی که فقط preview یا source/JVM logic test دارد `NATIVE_PENDING` می‌ماند؛ `TESTED_NATIVE` یا `NATIVE_VALIDATED` بدون instrumentation, screenshot و device evidence ممنوع است.
