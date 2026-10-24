# شمارا — Math Learning Product

شمارا یک پلتفرم یادگیری ریاضی فارسی، Android-first و server-authoritative برای کودک است.

## وضعیت فعلی

فازهای تاریخی مهندسی در این snapshot دیگر منبع برنامه‌ریزی نیستند. وضعیت اجرایی و کارهای باقی‌مانده فقط در `START_HERE.md` (ریشهٔ ریپو) نگه‌داری می‌شود؛ `ROADMAP_PHASES.md` دفتر رسمی gateها و وضعیت محصول (P00–P14) است و فقط بخش‌های لازمش خوانده می‌شود.

**Current roadmap:** `P00 PASS → P01/P02 IN_PROGRESS (build-unblocked) → P03–P09 IMPLEMENTED → P10 IN_PROGRESS (seeds) · P11 IMPLEMENTED → P12+ PENDING` (BUILD_FIRST; live/device/child gates in ROADMAP §13.5)

## معماری فعلی

- TypeScript monorepo
- Next.js / React برای Web
- React Native / Expo برای Mobile
- PostgreSQL + Supabase Auth/Storage
- Server-authoritative Learning Runtime
- Rive + Reanimated برای animation
- Modular monolith
- بدون Unity / Unreal / Godot در نسخه فعلی
- Android-first با target API 36+

## مرزهای مهم محصول

- Phone OTP تنها auth production در onboarding است.
- ParentGate جداگانه حذف شده است.
- مسیر موجود 25 ایستگاهی Grade 1 حفظ می‌شود.
- Grade 1 فعلاً 64 Skill و 25 Station دارد.
- 14 reusable game template در قرارداد Game/Engagement تعریف شده است.
- primary child shell نهایی روی Android است؛ Web فقط demo/dev harness است.
- primary child shell فعلاً `مسیر / تمرین / من` است.
- Reward نباید Learning Truth را بسازد.
- Challenge نباید به جای Mastery Check استفاده شود.

## از کجا شروع کنیم؟

`AGENTS.md` (قوانین ثابت برای هر عامل کدنویسی) سپس `START_HERE.md` (وضعیت و کار بعدی)؛ از `ROADMAP_PHASES.md` فقط بخش‌های لازم را بخوان. پرامپت‌های آمادهٔ تحویل کار: `docs/handoff/PROMPTS.md`.

برای جزئیات domain از `docs/source/`، برای contractهای اجرایی از `docs/reference/` و `docs/api/` و برای معماری قفل‌شده از `docs/adr/` استفاده کنید. `docs/history/` فقط trace تاریخی است و منبع تصمیم جاری نیست.

## وضعیت verification

`npm run verify:static:all` (بعد از `npm run build:packages`) همهٔ verifierهای static/regression را اجرا می‌کند و همهٔ آن‌ها باید سبز باشند (عدد جاری در `START_HERE.md` §3). Static verificationهای موجود برخی بخش‌ها را سبز نشان می‌دهند، اما این snapshot هنوز نباید production-ready تلقی شود؛ live Supabase/Auth/RLS/RPC، build/device و child/educational gates باید طبق P02–P14 اجرا و ثبت شوند.

## Documentation

- **وضعیت پروژه:** `START_HERE.md` در ریشهٔ ZIP تنها فایل وضعیت و handoff است
 rule

یک roadmap و یک منبع canonical برای هر قرارداد نگه می‌داریم. نسخه‌های قدیمی و متناقض باید حذف یا از چرخهٔ تصمیم‌گیری جاری خارج شوند، نه اینکه در کنار سند فعلی به‌عنوان مرجع رقابتی باقی بمانند.
