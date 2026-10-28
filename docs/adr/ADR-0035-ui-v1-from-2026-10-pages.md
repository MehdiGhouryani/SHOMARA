# ADR-0035 — UI v1 بر پایهٔ صفحات طراحی ۲۰۲۶-۱۰

**Date:** 2026-10-14
**Status:** Accepted (owner decision, 2026-10-14)
**Supersedes (partially):** ADR-0004 (مقادیر پالت)، CHARACTER-BIBLE-v2 (بخش cast)
**Related:** ADR-0032 (بدون streak/امتیاز/جان)، CHILD_PRODUCT_SURFACE

## Context

- مالک ۱۵ صفحهٔ طراحی (`shomara-all-pages.zip`) را برای پیاده‌سازی دقیق فرستاد. مرجع: `docs/design-handoff-2026-10/pages-v1/manifest.json`.
- تناقض با قراردادهای قبلی: پالت (ADR-0004 و `tokens.json` سبز)، cast (`aria/qbo/dana/jiko` در CHARACTER-BIBLE-v2)، و نوار آمار مسیر (streak، ستاره، جان) که ADR-0032 و CHILD_PRODUCT_SURFACE ممنوع کرده‌اند.
- O-4 و O-5 در START_HERE باز بودند.

## Decision

1. صفحات `pages-v1` مرجع بصری و چیدمان Child Shell v1 (Android-first) هستند.
2. توکن‌های رنگ از راهنمای طراحی (`:root` در `15-design-guide.html`) می‌آیند: primary `#2B5C7A`، amber `#E3A33B`، canvas `#F5F7F8` و بقیه. این مقادیر جایگزین پالت سبز `tokens.json` و مقادیر ADR-0004 می‌شوند. فونت Vazirmatn.
3. شخصیت‌های نمایشی در V1: Main، Number، Dana، Fandogh، Roka. نقشه در manifest. شناسه‌های داده (`aria/qbo/dana/jiko`) در فاز ۱ بررسی می‌شوند؛ پیش‌فرض: شناسه‌های جدید و حذف شناسه‌های قدیمی بعد از بررسی وابستگی داده.
4. V1 هیچ ستاره، جان یا streak نمایش نمی‌دهد. نوار بالای مسیر فقط نشان «پایهٔ ۱» دارد. ستاره‌های رتبه‌بندی زیر گره‌های کامل حذف شدند.
5. گرهٔ درس جاری از ستاره به آیکون کتاب (همان آیکون درس در طرح قبلی) تغییر کرد. این تغییر قابل برگشت است و منتظر تأیید است.
6. «دوباره بشنو» در V1 می‌ماند. منبع صدا: TTS در ابتدا؛ فیلد صدای ضبط‌شده بعداً.
7. صفحه‌های بدون طرح (تنظیمات، والدین، جهش، ویرایش آواتار) فقط توکن‌های جدید را می‌گیرند و بازطراحی نمی‌شوند.

## Consequences

- تغییر توکن‌ها در `packages/design-system` وب را هم تغییر می‌دهد (منبع مشترک).
- حدود ۲۶ verifier به فایل‌های UI یا رنگ سبز وابسته‌اند. هر به‌روزرسانی با دلیل ثبت می‌شود و گارد ضعیف نمی‌شود (D5).
- دارایی‌های قدیمی cast در `project-design-v2` تا فاز ۸ به‌عنوان legacy می‌مانند و UI به آن‌ها ارجاع نمی‌دهد.

## Verification

- `verify-ui-v1-scope` (استاتیک): یکپارچگی `pages-v1`، نبود نشانه‌های streak/ستاره/جان در مسیر، و وجود این ADR.
- مقایسهٔ پیکسلی هر صفحه با اسکرین‌شات طرح در فازهای ۲ تا ۷.

## Addendum (Stage U2, 2026-10-14) — decisions made while building the onboarding pages

1. **Grade merged into the profile page.** The pages count six steps and ask name, avatar and grade on one page. The mobile flow goes code → profile and never visits the contract's `GRADE` step. The shared contract keeps `GRADE` because the web flow still uses it; align the web flow in Stage U8.
2. **Consent line kept.** The approved welcome page has no terms text, but tapping "start" records `consentAt`, so a small line under the button states it. It is the only addition to a page and is not part of the pixel comparison.
3. **Code page confirmation format** follows the page: `۰۹۱۲***۶۷۸۹` (first four and last four digits), replacing `۰۹۱۲ ••• •۵۶۷`. The unit test changed together with the function.
4. **Avatar colors** follow the page; `packages/design-system` `ui.avatar` is canonical and a test keeps the shared contract presets identical.
5. **Placement, result and sync** have no approved page. They keep their content and logic, share the new top bar and use the new cast (Main); their bodies take the new tokens only. Designs are needed before they are redone.
6. **Pre-existing bug fixed:** placement started at question index -1, which rendered a blank page with no way forward after the profile page. It now starts at the first question.

## Addendum (Stage U3, 2026-10-18) — decisions made while building the path

1. **One tab bar for the app.** The path page (newer) draws a 106px bar with a 68x44 pill and a 2px primary border (its CSS is content-box); pages 13 and 14 draw an 84px bar with a plain pill. The `outlined` bar is used on all three tabs; `soft` stays only to compare pages 13 and 14 until the owner confirms (U-Q9).
2. **Real data over mock copy.** The band shows the contract's world names; only chapter 1 («دره‌ی عددها») equals the mock. Chapter colors follow the page's order.
3. **Features the page does not draw.** The "now" card, rhythm card, Mission Hub entry, one-tap practice shortcut and session-time hint are no longer on the Path tab. Their code and domain verification stay; the old "Path source contains X" assertions are waived in `scripts/lib/path-waivers.mjs`, each with its restore stage. An entry point must be given to missions and the rhythm (U-Q8).
4. **Derived states** (not drawn by the page): chapter story under the band from the guide button, grade-chip note, locked-station notice, content state strip, jump offer under a chapter divider.
5. **Accessibility:** each node announces number, title and status and carries the contract's status hint; the grade chip keeps a 48px touch target while drawn 44px.

