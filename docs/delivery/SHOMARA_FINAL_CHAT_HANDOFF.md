# تحویل نهایی این گفت‌وگو — SHOMARA Native

این فایل برای ادامه بدون تاریخچهٔ چت کافی است. وضعیت ماشینی همیشه بر متن این فایل اولویت دارد.

بازبینی نهایی 2026-10-28: بستهٔ `76e4cf7` با checksum اصلی بازیابی شد. Git history جزو source ZIP نبود؛ baseline محلی جدید ایجاد شده است و commit جدید ادامهٔ مستقیم تاریخچهٔ GitHub نیست. اصلاحات نهایی شامل یکسان‌سازی Java/SDK میان preflight و wrapper، رد flag ناشناخته و ثبت FAILED هنگام crash preflight است. شش تست مستقل build و verifierهای مرتبط PASS شدند؛ نتایج 502 تست و static suite پایین، مربوط به checkpoint پیشین‌اند. Native compile/APK همچنان به SDK 37 وابسته است.

## نقطهٔ شروع قطعی

- repository: `SHOMARA`
- branch: `native/n02-foundation`
- محصول فعال: فقط SHOMARA؛ AVA بسته و صرفاً منبع درس‌های فرایندی است.
- فاز: N02، تعداد 11 از 12 task تکمیل؛ task جاری `N02-07` در `BLOCKED_ENV`.
- target: Android Native با Kotlin/Jetpack Compose؛ Expo V2 فقط مرجع رفتاری تا cutover.
- APK ساخته نشده است؛ debug APK اکنون با task `N02-12` مجاز و pipeline آن آماده است، اما release/AAB/signing تا N10/HG-05 ممنوع می‌ماند.

## آنچه اکنون قفل و قابل اتکاست

1. clean/repository harness، canonical docs، dependency map و resume protocol.
2. Android foundation چهارماژوله، wrapper/checksum و version catalog پین‌شده، CI کم‌دسترسی و preflight fail-closed.
3. Design System direction واحد، چهار depth tier، ۹ component family و Skillهای مستقل پروژه.
4. ممیزی byte-protected ده original، ۱۵۰ صفحه، ۱۰۰ skill، ۱۵ pattern، ۲۳۲ metadata صوت draft و صفر binary صوت.
5. جداسازی authoring/published/client و lifecycle محتوای متنی/صوت/CMS؛ هیچ draft به runtime promote نشده است.
6. قرارداد UI/UX تمام ۱۷ خانواده صفحه با outcome، focal، CTA، depth، states و rejectها در `design/playbook/PAGE_UIUX_BLUEPRINT.md`.
7. ترتیب U0–U6 و ۲۰ work item وابسته در `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv`؛ همه صادقانه `NATIVE_PENDING`.
8. Build harness واحد با `doctor/gate/assemble-debug`، CI هم‌مسیر، گزارش JSON و SHA-256 برای debug APK موفق.

## تنها blocker قبل از N03

`npm run android:doctor` در runner فعلی JDK 17 را PASS می‌کند، اما Android SDK/platform 37 موجود نیست. بنابراین compile/lint/unit و APK اجرا نشده‌اند و static source checks جای آن‌ها را نمی‌گیرد.

در محیط سالم:

```bash
npm run android:doctor
npm run android:gate
```

فقط با exit code صفر:

1. evidence دقیق فرمان/محیط را در roadmap/worklog ثبت کن؛
2. `N02-07` و N02 را ببند؛
3. شاخهٔ `native/n03-design-system` را بساز؛
4. از U0 و `N03-01` شروع کن، نه از کدنویسی مستقیم صفحه.

## شواهد regression این checkpoint

| gate | نتیجه |
|---|---|
| harness | PASS؛ 99 task / 11 phase؛ N02 برابر 11/12 |
| design governance | PASS؛ 17 page family / 20 Native UI work item |
| project skills | PASS؛ پنج Skill مستقل و metadata معتبر |
| repository harness | PASS؛ 59 ledger entry / 1813 dependency edge |
| package build | PASS |
| typecheck | PASS؛ هر 9 workspace |
| Vitest | PASS؛ 65 file / 502 test |
| static suite | 82/87؛ فقط پنج flow/parity نیازمند Chromium در `BLOCKED_ENV` |
| Android build harness | PASS؛ doctor/gate/debug APK و CI واحد؛ environment برابر `BLOCKED_ENV` |

## ترتیب UI/UX که نباید تغییر کند

| ترتیب | scope | دلیل |
|---|---|---|
| U0 | token codegen، Theme، type/math direction، primitives | جلوگیری از Design System دوگانه و magic value |
| U1 | launch/onboarding/auth/profile/grade | تثبیت session، IME، restoration و privacy |
| U2 | tab shell/path/station start | تثبیت navigation، locked semantics و scroll restore |
| U3 | teach/guided/assessment/recovery/result | پرریسک‌ترین state machine و مرز server truth |
| U4 | practice/challenge | استفاده از player تثبیت‌شده؛ missions همچنان unreachable |
| U5 | profile/avatar/settings/guardian | persistence، re-auth، asset و privacy |
| U6 | TalkBack/200% font/back/process death/QA | gate cross-route؛ نه کار تزئینی آخر پروژه |

## فرمان‌های شروع در چت بعدی

```bash
git status --short --branch
git log -3 --oneline
cat AGENTS.md
cat START_HERE.md
cat docs/delivery/SHOMARA_FINAL_CHAT_HANDOFF.md
node tools/harness.mjs validate
node tools/harness.mjs status
node tools/harness.mjs next
node tools/harness.mjs resume
node tools/harness.mjs task N02-07
npm run android:doctor
```

## خط قرمزهای ادامه

- N03 پیش از compile/lint/unit واقعی شروع نشود.
- هیچ route به‌خاطر screenshot یا source-only، `TESTED_NATIVE` نشود.
- هیچ answer key/evaluator یا mastery/unlock محلی وارد child client نشود.
- original، metadata صوت draft یا URL صوت hardcode/auto-approve نشود.
- V1/V2/Expo فقط بعد از replacement gate و zero-consumer proof حذف شوند.
- UI شامل lives، punitive streak، currency، loot box، store یا leaderboard نشود.
- guardian خارج از shell کودک؛ shell کودک همان «مسیر/تمرین/من» بماند.

## فایل‌های مرجع کمینه

1. `AGENTS.md` و `START_HERE.md`
2. `harness/roadmap.json` و `harness/WORKLOG.md`
3. `design/MASTER.md` و `design/INSPIRATION_GUARDRAILS.md`
4. `design/playbook/PAGE_UIUX_BLUEPRINT.md`
5. `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv`
6. `design/playbook/COMPONENT_READINESS.md` و `NATIVE_IMPLEMENTATION.md`
7. matching page contract در `design/playbook/pages/`
8. Skill مرتبط در `skills/`
9. برای محتوا/CMS: `content-library/integration/SOURCE_AUDIT.md` و `AUTHORING_CONTRACT_GAPS.md`

## تعریف انتقال موفق

عامل بعدی نباید از حافظه یا حدس استفاده کند: `harness next` task را تعیین می‌کند، blueprint UI تصمیم صفحه را می‌دهد، backlog dependency/evidence را می‌دهد، و ledger فقط با شواهد واقعی تغییر می‌کند.
