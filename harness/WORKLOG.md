# SHOMARA execution worklog

این فایل append-only است. وضعیت جاری در `START_HERE.md` و وضعیت ماشینی در `roadmap.json` قرار دارد.

## 2026-10-28 — N00 / SNAP-20261028-NATIVE-P00-01

- baseline commit: `ef35ce2`
- branch: `chore/p00-repository-baseline`
- output: حذف 125 فایل `parity-out-expo`، canonical docs، roadmap Native، release verifier scope fix، OTP test network isolation.
- gates: Node 22.22 build/typecheck PASS؛ Vitest 503/503؛ release verifier PASS؛ static 75/80.
- blocker: پنج browser gate؛ Playwright Chromium download در runner به فایل 0-byte/ZIP ناقص رسید.
- commit: `f43bb02`

## 2026-10-28 — N01 checkpoint 1

- branch: `chore/n01-clean-architecture`
- output: حذف چهار root artifact منسوخ؛ Node 22.22 pin؛ repository map؛ package boundaries؛ file ledger؛ roadmap harness و resume protocol.
- next task: `N01-05` dependency/consumer map برای V1/V2 و packageها.
- unverified until final N01 gate: browser flows/parity و Android device.

## 2026-10-28 — N01 checkpoint 2

- dependency audit: 518 source file، 1780 import edge، 107 workspace edge و صفر deep workspace import.
- migration evidence: هر یک از V1 و V2 هنوز 22 consumer خارجی دارند؛ حذف کامل V1 مجاز نیست.
- dead-code batch: فقط `apps/mobile/src/path/PathBanner.tsx` پس از zero-consumer proof حذف شد؛ چهار candidate دیگر به‌علت verifier/string consumption حفظ شدند.
- docs: index، phase checklist و Design System migration plan اضافه شد.
- next task: `N01-10` اجرای gateهای نهایی و package checkpoint؛ `N01-09` با Chromium/consumer migration مسدود است.

## 2026-10-28 — N01 final / SNAP-20261028-NATIVE-N01-FINAL

- gates: Node 22.22 build/typecheck PASS؛ Vitest 65 file / 502 test PASS؛ repository، release و dependency verifier PASS.
- static: 76/81 PASS؛ پنج flow/parity gate فقط به‌علت Chromium unavailable در وضعیت `BLOCKED_ENV` باقی ماند.
- outcome: `N01 DONE_WITH_BLOCKER`؛ هیچ threshold یا assertion تضعیف نشد.
- handoff: manifest تحویل در `docs/delivery/SHOMARA_N01_CHECKPOINT.md`؛ task بعدی `N02-01` در انتظار HG-01 مالک برای applicationId/minSdk.
