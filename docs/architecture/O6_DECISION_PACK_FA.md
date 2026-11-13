# O6 Decision Pack — سرنوشت Backend/Supabase/apps-web (P11)

- **تاریخ:** 2026-11-14 · **وضعیت O6:** **OPEN** — طبق مأموریت صریح مالک، **فقط این Decision Pack تهیه شد؛ هیچ حذف، هیچ گسترش production و هیچ تغییری در runtime کودک انجام نشده**.
- **وضعیت child runtime (بی‌تغییر در هر سه گزینه):** کلاینت کودک صفر وابستگی Backend دارد (URLها null، بدون INTERNET permission، موتور + پکیج‌انجین آفلاین در P5/P6/P8 اثبات شدند). این Decision Pack فقط سمت authoring/server را تعیین تکلیف می‌کند.
- **Inventory ماشین‌خوان:** `docs/architecture/o6-pack/inventory.json` — **۴۹ API route · ۷۴ migration · ۸ فایل InMemory repo** (تولید با `node tools/o6-inventory.mjs`).

---

## گزینهٔ A — Retain Backend/CMS as independent authoring service

**مفهوم:** Supabase + apps/web به‌عنوان سرویس authoring/مدیریت بزرگسال زنده می‌مانند؛ child runtime کاملاً مستقل می‌ماند (آماده است).

**کارهای لازم (endpoint-by-endpoint / migration-by-migration):**
1. **Persistence:** جایگزینی ۸ فایل InMemory repo (adult-projections/assignment-runtime/challenge-runtime/offline-sync/admin-audio/learning-runtime/teacher-applications) با repoهای persistent روی Supabase — با Integration test روی Local Supabase.
2. **Audio admin:** جداسازی audio metadata/versions/audit trail از باینری؛ Object Storage واقعی + signed upload/download + size/type validation + checksum verification (الگوی sha256 آماده در P5/P7).
3. **امنیت سراسری:** RBAC (۴ نقش موجود در contracts) + RLS برای هر جدول + session expiry + CSRF + rate limit سراسری + audit logging — با Integration test برای Admin/Teacher/Parent/Child.
4. **Migrations:** اجرای ۷۴ migration روی Local Supabase (migration-by-migration) سپس Staging/Prod با deploy separation.
5. **Backup/Restore** + محیط‌های Dev/Staging/Prod جدا.
6. **حفظ مشروط:** APIهای child learning فقط به‌عنوان ابزار بزرگسال/مدیریت حفظ می‌شوند؛ **استفاده در lesson runtime ممنوع می‌ماند** (ADR-0039).

**برآورد واقعی:** بزرگ‌ترین گزینه — یک برنامهٔ backend کامل (معادل چند فاز). برای محصولِ کاملاً آفلاینِ کودک، value کمتر از هزینه است مگر CMS سازمانی/چند-مدرسه‌ای هدف باشد.

## گزینهٔ B — Authoring محلی/offline + پکیج امضاشدهٔ exportable؛ بازنشستگی مسیرهای runtime سرور  ⭐ پیشنهاد فنی

**مفهوم:** Supabase/apps/web runtime مسیر بازنشسته می‌شوند؛ authoring محلی با خروجی پکیج امضاشده — **زیرساختش از P7 آماده است**: `tools/content-pipeline` (typed ST07 artifact + validator ۱۳ rule + promotion gate ۷ مرحله‌ای با ledger + PackageBuilder).

**کارهای باقی‌مانده برای تکمیل B:**
1. Authoring Workflow UI حداقلی (CLI فعلی کافی برای مراحل ماشین؛ فرم انسانی برای review evidence).
2. **Export Package** با امضا: PackageBuilder موجود خروجی می‌دهد؛ گام امضا = مالک با کلید خصوصی خارج از repo (ADR-0043 §1) — ابزار `sign` CLI اضافه می‌شود (کلید فقط محیط مالک).
3. Archive: `apps/web` + `packages/*-runtime` runtime paths + `supabase/migrations` به `archive/backend-2026/` (git mv؛ بدون حذف) + deprecation README per item.
4. Dependency map: `tools/o6-inventory.mjs` هر اجرا به‌روز می‌شود؛ verifier R11 اضافه می‌شود: هیچ import از archive/** در کد زنده.
5. Retire ترتیبی (فقط پس از تأیید مالک، هر گام یک commit قابل بازبینی): auth/otp → learning/* → sync/batch → missions/worlds/collection → teacher/* → admin/audio → content packages (نگه‌داشت اگر authoring به آن‌ها سوخت‌رسانی می‌کند).
6. ۷۴ migration: archive + نگه‌داشت در repo (هیچ SQL پاک نمی‌شود)؛ retirement plan per-table در همین pack.

**ریسک:** نگه‌داری دو استک موقت تا اتمام retire؛ تیم authoring باید با CLI کار کند.

## گزینهٔ C — بازنشستگی کامل Supabase/apps/web با migration/archival plan مصوب

**مفهوم:** مانند B ولی بدون ابزار authoring محلی داخلی — authoring خارجی/دستی + فقط loader/validator در repo.

**کارها:** archive کامل apps/web + supabase (دوگانهٔ B-3/B-4) + حذف packages runtime-related با consumer-proof؛ pipeline P7 به‌عنوان تنها مسیر content می‌ماند.

**ریسک:** بزرگ‌ترین حذف؛ بازگشت‌ناپذیرترین؛ needs the same review infra بدون ابزار.

---

## ماتریس تصمیم

| معیار | A (retain) | B (local authoring) ⭐ | C (retire all) |
|---|---|---|---|
| هم‌راستایی با ADR-0039 (کاملاً آفلاین) | جزئی | کامل | کامل |
| هزینهٔ مهندسی باقی‌مانده | بسیار زیاد | کم (زیرساخت آماده) | کم |
| نگه‌داری دائمی | دو استک | تک-استک | تک-استک |
| ابزار authoring برای ۲۴ ایستگاه آینده | وب CMS کامل | CLI + gate (کافی برای مراحل machine؛ review انسانی فایل-محور) | خارج repo |
| امنیت سطح بزرگسال | backlog بزرگ (RLS/rate/CSRF/…) | حذف سطح حمله | حذف کامل |

**توصیهٔ فنی (غیرمصوب):** **B** — زیرساخت آن (pipeline P7 + P5 + Room v3) طی P5–P8 ساخته و اثبات شده؛ B کمترین کار باقی‌مانده و کامل‌ترین هم‌راستایی با ADR-0039 را دارد. تصمیم نهایی فقط با مالک.

## قانون اجرا پس از تصمیم

هر گزینه یک فاز مستقل با branch شاخه‌ای خودش می‌شود؛ گام‌ها در بالای هر گزینه فهرست شده‌اند؛ هیچ حذفی بدون گام‌به‌گام تأیید مالک؛ verifierهای جدید (R11 archive-import ban) همراه اولین commit گزینه ثبت می‌شوند.

## منابع Decision Pack

- `docs/architecture/o6-pack/inventory.json` (۴۹ route · ۷۴ migration · ۸ InMemory repo)
- gap register G-23/G-24 · ADR-0039 §8-O6 · `INFRASTRUCTURE_OWNER_DECISIONS_FA.md` §O6
