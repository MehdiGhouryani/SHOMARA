<div dir="rtl" align="right">

# Content Contract — v0.28

**نسخه:** `v0.28`
**تاریخ:** ۲۴ سپتامبر ۲۰۲۶
**Status:** `READY FOR IMPLEMENTATION`
**دامنه:** Grade Package / Content / Mini Game / QA

</div>

<div dir="rtl" align="right">

# 0. Canonical Principle

Content Version یک artifact اجرایی نسخه‌دار است که باید بتواند از لحظه انتخاب تا evaluation و Evidence به‌صورت deterministic بازسازی شود.

حداقل trace:

```text
Grade
→ Curriculum Version
→ Station
→ Skill
→ Content Artifact
→ Content Version
→ Encounter
→ Attempt
→ Answer
→ Evaluator
→ Evidence
```

</div>

# 1. Content Artifact Types

```text
QUESTION
REPRESENTATION
HINT
INSTRUCTION
EXPERIENCE
AUDIO
```

`EXPERIENCE` می‌تواند subtypeهای زیر داشته باشد:

```text
STORY
PUZZLE
CHALLENGE
BOSS
BUILD_EXPLORE
CONVERSATION
MINI_GAME
ADVENTURE_NODE
```

# 2. Interaction Types V1

Set قبلی حفظ می‌شود:

```text
MULTIPLE_CHOICE
TAP
DRAG_DROP
SORT
COUNT
COLOR
NUMBER_LINE
MATCH
```

افزوده:

```text
MINI_GAME
```

یک Mini Game باید evaluator contract مستقل داشته باشد.

# 3. Canonical Content JSON

```json
{
  "artifact_code": "G1-ST01-GAME-001",
  "artifact_type": "EXPERIENCE",
  "version": 1,
  "status": "ACTIVE",
  "grade_code": "G1",
  "curriculum_version": "G1-CURR-1",
  "station_code": "G1-ST01",
  "interaction_type": "MINI_GAME",
  "experience_form": "MINI_GAME",
  "learning_role": "GUIDED_PRACTICE",
  "primary_skill_ids": ["G1-SK001", "G1-SK009"],
  "supporting_skill_ids": ["G1-SK002"],
  "objective_ids": [],
  "instructions": {
    "visual": {},
    "audio_fa": {}
  },
  "game": {
    "game_code": "G1-GAME-001",
    "state_schema": {},
    "action_schema": {},
    "success_policy": {},
    "timer_policy": "NONE",
    "difficulty_policy": {},
    "attempt_limit": 1
  },
  "answer_schema": {},
  "evaluator_config": {
    "evaluator_id": "pattern-path-v1"
  },
  "feedback_config": {},
  "hint_config": {},
  "assets": [],
  "metadata": {
    "locale": "fa-IR",
    "age_band": "GRADE_1",
    "reading_load": "LOW"
  },
  "provenance": {
    "author": "internal",
    "source_reference": "internal-grade-package"
  }
}
```

# 4. Evaluator Contract

```ts
interface ContentEvaluator<TResponse, TResult> {
  evaluatorId: string;
  version: string;
  evaluate(input: {
    contentVersion: unknown;
    response: TResponse;
  }): TResult;
}
```

Result minimum:

```ts
{
  outcome: "CORRECT" | "INCORRECT" | "PARTIAL" | "INVALID" | "INCOMPLETE";
  score?: number;
  signals: Record<string, unknown>;
  feedbackCode?: string;
  evidenceCandidate?: {
    valid: boolean;
    skillRefs: string[];
    quality: "LOW" | "MEDIUM" | "HIGH";
  };
}
```

Evaluator نباید خودش Mastery یا Reward را commit کند.

# 5. Feedback Contract

سطوح:

```text
ACKNOWLEDGE
GUIDE
HINT
CORRECTIVE_REPRESENTATION
RECOVERY
```

بازخورد باید تا حد ممکن مشخص کند «چه کاری کمک می‌کند» نه فقط «غلط است».

# 6. Hint Contract

```text
HINT_1 → visual cue
HINT_2 → representation
HINT_3 → worked micro-example
```

Hint استفاده‌شده در Attempt ثبت می‌شود و می‌تواند در Evidence Quality اثر policy-driven داشته باشد.

# 7. QA Workflow

```text
DRAFT
 ↓
REVIEW
 ↓
QA
 ↓
PILOT
 ↓
ACTIVE
```

QA باید حداقل این موارد را بررسی کند:

- correctness؛
- evaluator؛
- Skill targeting؛
- age suitability؛
- language/RTL؛
- accessibility؛
- asset existence؛
- answer schema؛
- recovery path؛
- analytics event map.

# 8. Content Compatibility

Content Version فعال نباید به Skill یا Station retired بدون compatibility rule reference دهد.

Historical Encounter/Evidence باید Content Version استفاده‌شده را حفظ کند.

# 9. Station 01 Vertical Slice — Minimum Content Pack

برای اولین E2E:

```text
G1-ST01
├── Instruction x 2
├── Guided Practice x 4
├── Mini Game x 2
├── Independent Practice x 3
├── Check x 5
├── Recovery x 2
└── Re-check x 2
```

Skill coverage minimum:

```text
SK001
SK002
SK003
SK009
SK010
SK011
SK048
```

این pack باید به‌جای ساخت تمام ۲۵ Station، Vertical Slice را قابل‌اجرا کند.

# 10. Game Content Examples

## G1-ST01 / Pattern Path

```text
Target: SK009
Input: visual pattern
Action: choose next tile
Evaluator: exact pattern continuation
```

## G1-ST01 / Count Catch

```text
Target: SK001 / SK002
Input: 1..5 objects
Action: tap each object / choose total
Evaluator: cardinality + correspondence
```

# 11. Contract Tests

- هر Active Content Version حداقل یک Skill یا Objective reference معتبر دارد.
- هر MINI_GAME evaluator دارد.
- هر MINI_GAME game_code معتبر دارد.
- هر content version دقیقاً یک interaction type اصلی دارد.
- ACTIVE content immutable است.
- Content بدون asset معتبر وارد ACTIVE نمی‌شود.
- Contentهای Game و Reward Game role خود را explicit می‌کنند.
- Reward Game به‌طور پیش‌فرض evidence-bearing نیست.

# 12. Acceptance Gate

`v0.28 CLOSED` وقتی:

- JSON shape تصویب شود؛
- evaluator interface تصویب شود؛
- Mini Game contract تست شود؛
- Station 01 content pack قابل seed باشد؛
- QA states قابل‌اجرا باشند؛
- content-to-skill references بدون ambiguity باشند.

</div>


# COMPLETION ADDENDUM — v0.31 Adult Projection Contract

Content itself remains child-learning focused. Parent and Teacher clients consume projections and action contracts; they do not require a duplicate content authoring model in V1.

Teacher Objective content may reference Skill / Station / Learning Objective identifiers but does not define a custom question bank in V1.
