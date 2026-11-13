# خط تولید محتوای SHOMARA — اسکیما، lifecycle، نگاشت و شکاف‌ها (P7/ADR-0045)

- **تاریخ:** 2026-11-13 · **اجرا:** `npm run content:pipeline -- <validate|promote|build-package|status>` یا `gradlew contentPipelineValidate` (فقط validate، فلگ `--machine-only`)
- **مرز:** فقط **ST07 pilot** به‌عنوان نمونهٔ اولیه؛ تألیف ۲۴ ایستگاه دیگر فاز بعدی است. Originals بایت‌محافظت‌شده‌اند و pipeline فقط **می‌خواند**.

## 1. مدل‌های چهارگانه (جدا مطلق)

| لایه | محل | محتوا | پیاده‌سازی |
|---|---|---|---|
| **AuthoringStation** | `content-library/authoring/stations/ST07.json` | کامل نویسنده+reviewer: evaluatorConfig (شامل pilotAnswerAnchor/answer blockها)، passThreshold DRAFT، provenance (source hash، taught numerals، شمارش آیتم‌ها، وضعیت حقوق) | قرارداد `AuthoringStation` در packages/contracts/content-projection.ts |
| **PublishedStationPackage** | خروجی pipeline (`authoring/build/ST07/<v>/published.json`) | فقط APPROVED/ENABLED + نسخه + checksum + asset refs؛ evaluator فقط به‌صورت server-ref | `publishForDelivery` (رفتار throw روی lifecycle غیرمجاز) |
| **ChildLessonProjection** | `child-projection.json` | prompt/options/interactionConfig/audioPolicy/accessibility — **صفر** answer/correctness/threshold/reviewer/provenance (`projectionViolations` + scan رشته‌های کودک‌رو) | `projectForChild` |
| **LocalEvaluatorDefinition** | مطابق **O1** — هنوز OPEN | سه گزینهٔ ADR-0039 §3؛ درز در `LocalLessonEvaluator` (ADR-0044) | refactor-proof: پاسخ‌ها فقط با anchor به originals |

**جریان اعتماد:** Authoring → `publishForDelivery` → Published → `projectForChild` → Child Projection → (P5 engine) Package manifest → امضای مالک → APK.

## 2. Lifecycle و Gateها (اجرا در `promote.mjs` + ledger append-only)

```text
SOURCE_ONLY → MAPPED_TO_REPO → STAGED → VALIDATED → HUMAN_REVIEWED → APPROVED → ENABLED
```

| گذار | Gate | Evidence الزامی |
|---|---|---|
| SOURCE_ONLY→MAPPED_TO_REPO | artifact تایپ‌شده + source hash منطبق (`derived/source-sha256.json`) + anchorهای پاسخ در سورس | ledger: transcription |
| →STAGED | validator (بدون خطای machine) | ledger tool-run |
| →VALIDATED | اجرای پاکِ machine (review-roles/rights اینجا blocker نیستند — گیتِ مرحلهٔ انسانی‌اند) | ledger tool-run |
| →HUMAN_REVIEWED | **فایل evidence انسانی** `authoring/review/<id>.review.json` با ۴ نقش متمایز (curriculum/persian_pronunciation/accessibility/rights_moderation) + `rightsModeration=APPROVED` — **ابزار هرگز نمی‌تواند این فایل را بسازد** | فایل review |
| →APPROVED | همان evidence کامل (reviewRoleViolations=∅) | فایل review |
| →ENABLED | **marker امضاشدهٔ مالک** `authoring/packages/<id>.signed.json` (signature+manifestSha256) — pipeline هرگز امضا نمی‌کند | marker |

Ledger: `content-library/authoring/promotion-ledger.json` — append-only، هر گذار با at/actor/evidence. ترتیب سخت sequential؛ skip → refuse.

## 3. فهرست بررسی Validator → شواهد

| بررسی | قانون (rule id) | تست |
|---|---|---|
| schema/required fields | `schema-missing-field`, `schema-lifecycle` | ST07 + fixtures |
| یکتایی IDها | `id-duplicate`, `id-station-shape` | duplicate-id fixture |
| station/skill/template refs | `ref-item-station`, `ref-template` (+whitelist T01/T05/T11/T13/T15), `ref-stage` | unknown-template fixture |
| prerequisite graph + cycle | `prerequisite-graph` (قرارداد: self-edge/unknown/cycle) | prereq-cycle + prereq-unknown |
| taught-numeral constraints | `taught-numeral` | taught-numeral fixture |
| item count + stage coverage | `item-count-stage-coverage` | item-count-drift fixture |
| hint/assessment policy | `hint-policy` (قرارداد HINT_BANNED) | تست‌های قرارداد |
| answer stripping | `answer-stripping` (projectForChild + projectionViolations + scan کودک‌رو) | leaked-projection fixture |
| audio/image refs | `audio-refs` (row count، DRAFT-only، NOT_DELIVERED) | ST07 + gates |
| review roles/evidence | `review-roles` (۴ نقش) | gate HUMAN_REVIEWED |
| rights/moderation | `rights-moderation` | gate HUMAN_REVIEWED |
| package compatibility | `package-compatibility` (PROPOSED ADR-0043) | gate |
| provenance/source hash | `provenance-source-hash` (re-hash + anchorها) | source-hash-drift fixture |

## 4. نگاشت Source → Published (ST07 prototype)

| منبع (originals — read-only) | مقصد artifact |
|---|---|
| `shomara-stage7-pilot-ST07.md` §3 (۸ آیتم + answer blockها) | `evaluatorConfig.items` با `pilotAnswerAnchor` (هویت پاسخ = anchor، نه کپی) |
| §0/§2 (کشف، ۴ گام) | declaredItemCounts.section2_P1_DISCOVER_steps |
| §4 (بازی T05) | declaredItemCounts.section4_P3_GAME_T05 |
| §5 (استخر) / §6 (۵ آیتم) | declaredItemCounts.section5/6 |
| §7 (S13/S14) | declaredItemCounts.section7 |
| §8 (جدول صدا) | audioManifest (CSV) → asset-manifest.json (53 ردیف DRAFT، صفر باینری) |
| §9 (دارایی‌ها) | assetPolicy + assetDelivery=NOT_DELIVERED (CONTENT-009) |
| §10 (معیار تسلط) | passThreshold (DRAFT — CONTENT-014/011) |
| derived/source-sha256.json | provenance.sourceSha256File (حافظت بایت) |

## 5. گزارش شکاف‌ها (gap report)

| شکاف | اثر بر pipeline | مالک/مسدودکننده |
|---|---|---|
| **O1** | LocalEvaluatorDefinition تعریف نهایی ندارد؛ items با correctRef=null برای T13/T01 | O1 |
| **O2** | نام فیلدهای manifest نهایی نیست (PROPOSED در ADR-0043 §2) | O2 |
| **O7** | سقف‌های حجم PROPOSED هستند (256KiB/8MiB/64MiB) | O7 |
| **CONTENT-009/010** | صفر تصویر و صفر باینری صوت؛ asset-manifest فقط اعلام «not delivered» می‌کند | خط تولید دارایی |
| **CONTENT-014/011** | passThreshold و معیار تسلط DRAFT؛ MasteryEngine gated | مالک |
| **stage-mapping confirmation** | نگاشت بخش‌های pilot به P1..P5/S13/S14 تأیید مالک را می‌خواهد | مالک |
| **review evidence** | فایل evidence انسانی وجود ندارد (درست است — بازبینی انسانی رخ نداده) | فرایند انسانی |
| **rights review** | rightsModeration=PENDING_RIGHTS_REVIEW | فرایند حقوقی |
| **signed release** | هیچ marker امضایی وجود ندارد؛ ENABLED مسدود | HG-05/O2 |

## 6. اجرای تکرارپذیر

```bash
npm run content:pipeline -- validate ST07            # validator کامل (خروجی: violations JSON)
npm run content:pipeline -- validate ST07 --machine-only   # فقط بررسی‌های ماشینی (Gradle-friendly)
npm run content:pipeline -- promote ST07 VALIDATED operator
npm run content:pipeline -- build-package ST07 1
npm run content:pipeline -- status ST07
gradlew contentPipelineValidate                       # همان validate با --machine-only
```

Gate استاتیک: `scripts/verify-content-pipeline.mjs` (در verify:static:all) — artifact واقعی، gates روی ledger موقت، ۷ fixture منفی، leak-guard، original-hashها.
