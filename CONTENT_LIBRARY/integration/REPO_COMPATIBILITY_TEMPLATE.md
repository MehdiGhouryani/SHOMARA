# Compatibility review worksheet (run against ACTUAL repository)

| Domain | Files in repo | Source section | Current behavior | Proposed behavior | Status | Risk/test |
|---|---|---|---|---|---|---|
| Station identifiers | discover | Stage4 §1 | unknown until inspected | ST01–25 book-section mapping | NOT_VERIFIED | may rename active stations |
| Lesson phases | discover StationFlow | Stage5 §5.3 and ST07 P1–P5 | server phases | proposed content parts | NOT_VERIFIED | stage mismatch |
| Game templates | discover question renderer | Stage5 §7 T01–T15 | existing type list | opt-in templates | NOT_VERIFIED | answer semantics |
| Authoritative answers | contracts/runtime | Stage5 §6.2 | server | item authoring shape | NOT_VERIFIED | client cheating |
| Narration | admin/web/mobile audio | Stage5 §1 and CSV | unknown | draft import | NOT_VERIFIED | missing audio binaries |
| Offline station | offline-sync | Stage5 §6.4 | existing logic | ST07 content preload | NOT_VERIFIED | storage/sync |
| Asset mapping | mobile character map | ST07 §9 | existing 5 WebP chars | CH.guide mapping | NOT_VERIFIED | wrong characters |
| Numerals and math geometry | existing renderer | Stage6 §5, ST07 §11 | unknown | taught-only numerals | NOT_VERIFIED | curriculum mismatch |

Use diff/line-level repo evidence; do not fill 'Current behavior' from memory. Permission to stage drafts is not permission to replace production curriculum.
