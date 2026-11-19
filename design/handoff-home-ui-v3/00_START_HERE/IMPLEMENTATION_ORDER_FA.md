# ترتیب اجرایی پیاده‌سازی — از Audit تا Device Evidence

## Gate 0 — محافظت از مخزن
- `git status --short`, branch و last commit را ذخیره کنید.
- هیچ تغییر uncommitted کاربر را overwrite نکنید.
- دستورالعمل‌های root مثل `AGENTS.md` را رعایت کنید.
- اگر worktree کثیف است، محدودهٔ تغییرات را جدا کنید؛ reset یا checkout مخرب نزنید.

## Gate 1 — Audit کد واقعی
- Route و owner صفحهٔ path را با جست‌وجو پیدا کنید.
- `ShomaraPathGraph`, `ShomaraNavigation`, `ShomaraButton`, character renderer و ViewModel/UseCase را کامل بخوانید.
- stateهای واقعی را با `STATE_AND_INTERACTION_MATRIX.json` تطبیق دهید.
- debtهای ثبت‌شده در `PAGE_06_IMPLEMENTATION_NOTE_FA.md` را به تصمیمِ جدید تبدیل نکنید، مگر شواهد + تصویب لازم وجود داشته باشد.
- خروجی: کوتاه‌ترین فهرست reuse/refactor/new component.

## Gate 2 — Asset integration
- فایل‌های `02_ASSETS/android/drawable/*.xml` را در module مناسب `res/drawable/` بگذارید.
- فایل‌های SVG را برای source/editing نگه دارید؛ Android runtime از VectorDrawable مصرف کند.
- `verify_character_sources.py` را روی checkout اجرا کنید.
- اگر Fandogh در drawable-nodpi موجود نیست، script مشخص را اجرا کرده و manifest منابع را به‌روز کنید.
- name collision با resources موجود را پیش از copy بررسی کنید.

## Gate 3 — Shared component reconciliation
- فقط کمبودهای واقعی را در component shared رفع کنید: icon slot در tab، semantics، reduced motion، loading/disabled و tap guard.
- implementation موازی برای Button/TabBar/PathNode/Progress نسازید.
- نمونه‌های Kotlin این بسته را با APIهای واقعی تطبیق دهید؛ فایل‌های reference را پس از بررسی یا merge هدفمند وارد کنید.

## Gate 4 — Data and state wiring
- UI projection امن از repository/evaluator تهیه شود.
- `HomePathUiState` را به state موجود map کنید یا اگر معادل دارد، همان را مصرف کنید.
- fake data فقط در preview/test fixture بماند.
- side effectها به ViewModel/UseCase برگردند.

## Gate 5 — Screen assembly
- header → chapter progress → continue → path heading/ribbon → path nodes → bottom nav.
- مسیر و connector پشت nodeها؛ `LazyColumn` و stable keys.
- content padding، safe insets و FAB footprint.
- هیچ route یا CTA بدون callback واقعی باقی نماند.

## Gate 6 — Verification
- Unit/state tests، semantics/UI tests و navigation tests.
- Build و lint پروژه.
- screenshots دستگاه واقعی 360/390/412dp.
- font scale 1.0/1.3/2.0، RTL, TalkBack, reduced motion و process recreation.
- همهٔ overlapها، clipped labels و dead interactions رفع شوند.

## Gate 7 — تحویل
- manifest/checksum دارایی‌ها را دوباره تولید کنید.
- screenshots before/after و test logs را ثبت کنید.
- تغییر فایل‌ها را همراه rationale ارائه کنید.
- هر چیزی که اجرا/تست نشده صریحاً `NOT VERIFIED` بماند.
