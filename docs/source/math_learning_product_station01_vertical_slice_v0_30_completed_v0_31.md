# Station 01 Vertical Slice — v0.30

تاریخ: ۲۴ سپتامبر ۲۰۲۶
Status: `IMPLEMENTATION BASELINE`

## 1. Goal

اولین نمونه End-to-End باید این زنجیره را ثابت کند:

`Child → Session → Station → Learn → Practice → Game → Check → Evidence → State → Decision → Quest → Reward → Resume`

## 2. Skill Scope

Primary / evidence-bearing baseline:

```text
G1-SK001  شمارش اشیاء تا ۵
G1-SK002  تناظر یک‌به‌یک
G1-SK003  کاردینالیته
G1-SK004  تشخیص سریع مقدار کوچک
G1-SK005  نمایش کمیت با انگشتان
G1-SK009  تشخیص الگوی تکرارشونده
G1-SK010  ادامه/کپی الگو
G1-SK011  قانون الگو
G1-SK048  ردیف/ستون/اول/وسط/کنار/بین
```

## 3. Encounter Inventory

| Seq | Code | Role | Form | Target | Evidence |
|---:|---|---|---|---|---|
| 1 | ST01-E01 | INSTRUCTION | STORY | SK001/SK009 | No |
| 2 | ST01-E02 | GUIDED_PRACTICE | TAP | SK001/SK002 | Yes |
| 3 | ST01-E03 | GUIDED_PRACTICE | MINI_GAME | SK009/SK010 | Yes |
| 4 | ST01-E04 | GUIDED_PRACTICE | MINI_GAME | SK001/SK002/SK003 | Yes |
| 5 | ST01-E05 | INDEPENDENT_PRACTICE | PUZZLE | SK003/SK048 | Yes |
| 6 | ST01-E06 | REVIEW | MINI_GAME | SK009/SK010 | Yes |
| 7 | ST01-E07 | CHECK | CHALLENGE | SK001/SK003 | Yes |
| 8 | ST01-E08 | CHECK | CHALLENGE | SK009/SK011 | Yes |
| 9 | ST01-E09 | RECOVERY | BUILD_EXPLORE | weakest target skill | Yes |
| 10 | ST01-E10 | RE-CHECK | MINI_GAME | recovered skill | Yes |
| 11 | ST01-E11 | TRANSFER | MINI_GAME | SK003/SK011 | Yes |
| 12 | ST01-E12 | MASTERY_CHECK | MINI_GAME | selected skill | Yes |

## 4. Game Definitions

### G1-GAME-001 — مسیر الگو

Input:

```text
🟡 🔵 🟡 🔵 ?
```

Child action: choose next tile.

Targets: SK009, SK010.

Evaluator: exact pattern continuation.

### G1-GAME-002 — شکار شمارش

Input: 1–5 visual objects.

Child action: tap objects one by one / choose total.

Targets: SK001, SK002, SK003.

Evaluator: count sequence + final cardinality.

### G1-GAME-003 — ردیف جادویی

Child action: arrange items by requested order/position.

Targets: SK048.

### G1-GAME-004 — انتخاب راهبرد

Child chooses whether to count, group, or use visual pattern.

Target: SK005 and SK058-style representation signal where applicable.

## 5. Check Policy

Station Pass baseline:

```text
Check A: 4/5 correct
+
Check B on a separate encounter: 4/5 correct
```

Failure:

```text
Preserve evidence
→ identify uncertainty / recovery need
→ recovery
→ re-check
```

## 6. Recovery Map

### SK001 / SK002 weak

`COUNT` → `TAP/ONE-TO-ONE` → `COUNT WITH VISUAL GUIDE` → `RE-CHECK`

### SK003 weak

`TOTAL QUESTION` → `GROUP VISUAL` → `FINAL NUMBER REPRESENTS WHOLE` → `RE-CHECK`

### SK009 / SK010 weak

`PATTERN` → `COLOR-HIGHLIGHTING` → `COPY` → `CONTINUE` → `RE-CHECK`

### SK011 weak

`PATTERN CONTINUATION` → `COMPARE TWO EXAMPLES` → `STATE THE RULE` → `RE-CHECK`

## 7. Quest Seed

```text
G1-Q-001  شروع خوب
Trigger: complete any Station 01 learning Encounter
Reward: STAR_PROGRESS x1

G1-Q-002  شکار الگو
Trigger: complete 2 valid Pattern game/practice encounters
Reward: STICKER-PATTERN x1

G1-Q-003  یک قدم جلو
Trigger: Station 01 PASS
Reward: PATH_REVEAL + CHARACTER_REACTION
```

No Quest is based solely on login/app open.

## 8. Reward Seed

```text
G1-R-001  STAR_PROGRESS
G1-R-002  STICKER_PATTERN
G1-R-003  CHARACTER_CHEER
G1-R-004  PATH_REVEAL_ST02
```

## 9. E2E Acceptance Assertions

1. Guest or registered child can enter Station 01.
2. Session pins G1 curriculum + graph versions.
3. Encounter sequence persists.
4. Game content loads from Content Version.
5. Game result is server-evaluated.
6. Accepted result creates Evidence.
7. Learning State changes deterministically.
8. Recovery is selected when policy requires it.
9. Check Pass does not directly set Mastery.
10. Quest progress is triggered server-side.
11. Reward grant is idempotent.
12. Session can resume after interruption.
13. Historical content version remains traceable.
14. RTL/audio/touch interactions work on baseline devices.

## 10. Pilot Instrumentation

Track:

```text
station_entry
encounter_started
encounter_completed
answer_submitted
game_started
game_completed
game_abandoned
recovery_started
recheck_completed
station_passed
quest_completed
reward_granted
session_resumed
```

Learning analytics must distinguish these events from Evidence records.

## 11. Exit Criteria

Station 01 is not accepted until:

- Unit tests for evaluators pass;
- integration test verifies Evidence;
- E2E verifies pass/recovery;
- duplicate submit test passes;
- resume test passes;
- reward idempotency test passes;
- basic child usability review passes;
- educational review signs off the content.


# COMPLETION ADDENDUM — v0.31 Adult Smoke Acceptance

After Station 01 completion, two adult smoke checks are required:

1. Parent can see a coherent `Today → Progress → Next Step` projection.
2. Teacher can inspect a permitted student, see the same canonical learning state, set one bounded objective, and request recheck.

No adult action may alter historical Evidence directly.
