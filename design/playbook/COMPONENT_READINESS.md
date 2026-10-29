# Component readiness contract — Native Design System V3

این سند ورودی اجرایی N03 است، نه evidence تکمیل N03. تا بسته‌شدن `N02-07` هیچ component این فهرست `IMPLEMENTED_NATIVE` محسوب نمی‌شود.

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

componentی که فقط preview یا source test دارد با `NATIVE_PENDING` ثبت می‌شود، نه `TESTED_NATIVE`.
