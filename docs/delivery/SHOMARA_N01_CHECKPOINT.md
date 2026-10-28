# SHOMARA N01 delivery checkpoint

```yaml
snapshot: SNAP-20261028-NATIVE-N01-FINAL
date: 2026-10-28
branch: chore/n01-clean-architecture
baseline_commit: ef35ce24fb8023ce0d247d1281cf0166bffb2140
archive_method: git archive from clean committed HEAD
archive_prefix: SHOMARA/
next_phase: N02
next_task: N02-01
```

## دامنهٔ تحویل

- پاک‌سازی root artifactها و نخستین dead-code batch با قابلیت بازیابی از Git.
- Node 22.22 pin، repository map، package boundaries و Design System migration plan.
- هارنس مستقل با ۱۱ فاز، ۸۲ task، dependency graph، file ledger، worklog و resume protocol.
- چک‌لیست انسانی تمام فازها و دستور ادامه در `ZCODE.md`.

## نتیجهٔ gateها

| Gate | نتیجه |
|---|---|
| Node 22.22 build packages | PASS |
| Typecheck تمام ۹ workspace | PASS |
| Vitest | PASS — 65 file / 502 test |
| Repository harness | PASS — 82 task / 37 ledger entry |
| Dependency drift | PASS — 518 file / 1780 edge |
| Mobile release verifier | PASS |
| Static verifiers | 76/81 PASS |
| Browser flows/parity | BLOCKED_ENV — Chromium در runner موجود نیست |
| Android Native build | NOT_STARTED — شروع در N02 پس از HG-01 |

## محدودیت صریح

این checkpoint APK/AAB یا ادعای production readiness ندارد. پنج failure مجموعهٔ static فقط `flow-path-run`, `flow-run`, `flow-station-run`, `flow-tabs-run` و `parity-run` هستند که به Chromium نیاز دارند. هیچ gate برای عبور ظاهری ضعیف نشده است.

## روش ادامه

1. `AGENTS.md`، `START_HERE.md` و `ZCODE.md` را بخوانید.
2. `node tools/harness.mjs validate` و سپس `node tools/harness.mjs next` را اجرا کنید.
3. برای N02-01، پیش از ایجاد پروژهٔ Android، human gate مربوط به `applicationId` و `minSdk` را ببندید.
