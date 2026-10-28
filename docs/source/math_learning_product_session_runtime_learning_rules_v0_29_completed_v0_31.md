<div dir="rtl" align="right">

# Session Runtime + Learning Rules — v0.29

**نسخه:** `v0.29`
**تاریخ:** ۲۴ سپتامبر ۲۰۲۶
**Status:** `READY FOR IMPLEMENTATION`
**دامنه:** Session / Attempt / Answer / Evidence / Decision / Progression / Game / Quest / Reward

</div>

# 0. Runtime Golden Rule

```text
Client action
→ idempotency validation
→ domain transaction
→ evaluator
→ Evidence candidate
→ Evidence commit (if valid)
→ State update
→ Decision
→ Plan
→ next Encounter / Result
```

Client result هرگز source of truth نهایی نیست.

# 1. Session Lifecycle

```text
CREATED
  ↓
ACTIVE
  ↓
INTERRUPTED ↔ ACTIVE
  ↓
COMPLETED
```

یا:

```text
ACTIVE → ABANDONED
```

Refresh:

```text
same Session
```

نه Session جدید.

# 2. Encounter Lifecycle

```text
PLANNED
 ↓
PRESENTED
 ↓
RESPONDED
 ↓
EVALUATED
 ↓
CLOSED
```

یا:

```text
PRESENTED → SKIPPED
```

`SKIPPED` نباید Evidence معتبر تولید کند.

# 3. Attempt Lifecycle

```text
PRESENTED
 ↓
ANSWERED
 ↓
EVALUATED
```

Duplicate submit با همان idempotency key نباید transition دوم بسازد.

# 4. Answer Evaluation

Evaluator نتیجه را به یکی از موارد زیر تبدیل می‌کند:

```text
CORRECT
INCORRECT
PARTIAL
INVALID
INCOMPLETE
```

`INVALID` باید بدون Evidence معتبر باقی بماند.

# 5. Evidence Creation Rule

```text
Accepted Answer
   ↓
Evaluator Result
   ↓
Evidence Policy
   ↓
Evidence
```

Event یا telemetry به‌تنهایی Evidence نیست.

Evidence باید حداقل:

```text
learning_identity
skill
context
content_version
encounter
provenance
occurred_at
quality
```

را داشته باشد.

# 6. Learning State Update

State از history + interpretation + current policy مشتق می‌شود.

Update باید شامل:

```text
confidence
uncertainty
status
last_evidence_at
review_need
recovery_need
```

باشد.

# 7. Candidate Generation

موتور Rule-Based ابتدا candidate می‌سازد:

```text
1. Recovery candidate
2. Due Review
3. Current Station Practice
4. New Skill / Next Station
5. Transfer / Challenge
```

سپس policy محدودیت‌ها و candidate را حل می‌کند.

Priority baseline:

```text
Recovery > Safety/Constraint > Due Review > Current Objective > New Progression > Optional Game
```

# 8. Recovery Rules

اگر Skill uncertainty یا نیاز به recovery بالا باشد:

```text
Original objective
→ representation change
→ easier difficulty
→ guided interaction
→ re-attempt
→ original objective
```

Recovery نباید فقط «سؤال قبلی با عدد دیگر» باشد؛ representation باید در صورت امکان تغییر کند.

# 9. Station Pass

V1 temporary rule:

```text
4 / 5 correct
IN TWO SEPARATE CHECKS
```

اما:

```text
Station Pass ≠ Mastery
```

Station Pass فقط progression/navigation را کنترل می‌کند.

# 10. Mastery Boundary

Mastery فقط از Mastery Contract مجزا تعیین می‌شود.

Game reward، Quest completion، XP-like score و Station completion به‌تنهایی Mastery محسوب نمی‌شوند.

# 11. Diagnostic Rules

Placement Probe:

```text
Diagnostic Probe
→ Skill-targeted evidence
→ initial state estimate
→ Starting Point
```

Wrong answer ≠ diagnosis.

V1 Diagnostic:

- کوتاه؛
- Rule-Based؛
- با uncertainty؛
- بدون توقف سخت مسیر؛
- recovery بعدی مجاز.

# 12. Mini Game Runtime

## 12.1 Start

```text
Encounter created
→ game state initialized
→ presented
```

## 12.2 Action

Client local state را update می‌کند.

برای V1، actionهای داخلی game می‌توانند تا پایان Attempt در client بمانند؛ canonical result هنگام submit ارسال می‌شود.

## 12.3 Submit

```text
Game Result
→ idempotency check
→ evaluator
→ evidence policy
→ accepted outcome
```

## 12.4 Abandon

Game abandonment:

- Evidence ناقص؛
- reward completion ندارد؛
- analytics event مجاز.

# 13. Reward Runtime

Reward فقط بعد از source event معتبر:

```text
Milestone / Quest / Achievement
        ↓
Reward policy
        ↓
Reward grant
```

`reward_grant` باید idempotent باشد.

Reward failure نباید learning transaction را rollback کند؛ در این حالت reward issuance به pending/retry state می‌رود.

# 14. Quest Runtime

Quest instance state:

```text
ACTIVE
→ COMPLETED
```

یا:

```text
ACTIVE
→ EXPIRED
```

Progress نباید از client trust شود.

Quest trigger examples:

```text
ENCOUNTER_COMPLETED
STATION_PASSED
RECOVERY_COMPLETED
GAME_COMPLETED
SKILL_REVIEW_COMPLETED
MILESTONE_REACHED
```

ممنوع:

```text
APP_OPENED
TIME_SPENT_ONLY
LOGIN_ONLY
```

# 15. Daily Quest Generation

V1:

```text
1 easy
1 skill-focused
1 progress-focused
```

اگر کودک نیاز recovery دارد، quest دوم می‌تواند recovery-oriented شود.

Quest نباید کاری را که Learning Engine برای کودک نامناسب تشخیص داده، برای reward اجباری کند.

# 16. Progression / Unlock

Unlock فقط از شرط explicit progression می‌آید:

```text
Evidence
→ State / Mastery / Milestone condition
→ Unlock
```

Quest completion به‌تنهایی نباید Station بعدی را باز کند مگر config آن را explicit کند.

# 17. Offline / Idempotency

V1 transport:

```text
At-least-once delivery
+
Idempotent domain handling
```

کلید:

```text
client_installation_id
+
client_event_id / idempotency_key
+
operation_type
```

Offline نمی‌تواند authoritative commit کند:

- final Mastery؛
- final Station Pass؛
- permission grant.

# 18. Concurrency

اگر دو client هم‌زمان action مشابه ارسال کردند:

```text
same operation + same idempotency key
→ one canonical transition
```

اگر دو تصمیم واقعاً متفاوت باشند:

```text
server transaction ordering
→ canonical state
→ deterministic next decision
```

# 19. Rule Ordering

قواعد runtime به ترتیب:

```text
A. Security / Authorization
B. Version integrity
C. Idempotency
D. Content / Evaluator validation
E. Evidence policy
F. State update
G. Recovery / Review need
H. Progression / Unlock
I. Quest progress
J. Reward grant
K. Next Encounter projection
```

# 20. Station Result

### Pass

```text
Result
→ Station progress
→ milestone evaluation
→ next decision
```

### Not Pass / Uncertain

```text
Result
→ preserve evidence
→ Recovery
→ Re-check
```

کودک نباید به‌خاطر یک Attempt ناموفق dead-end شود.

# 21. Game Result Classification

```text
LEARNING_GAME
→ possible Evidence

PRACTICE_GAME
→ Evidence with lower/default quality unless policy says otherwise

TRANSFER_GAME
→ transfer Evidence candidate

RECOVERY_GAME
→ recovery Evidence candidate

REWARD_GAME
→ no learning Evidence by default
```

# 22. Parent / Teacher Output

برای Parent:

```text
چه چیزی بهتر شد؟
چه چیزی نیاز به تمرین دارد؟
قدم بعد چیست؟
```

برای Teacher:

```text
کدام Skill؟
چه Evidence؟
چه recovery؟
آخرین re-check چه بود؟
```

Raw game telemetry نباید به‌صورت پیش‌فرض در این سطوح نمایش داده شود.

# 23. Contract Tests — Minimum

### Session
- refresh creates no duplicate session؛
- session pins grade/curriculum/graph؛
- interrupt/resume deterministic است.

### Attempt
- duplicate submit no second evaluation؛
- attempt number unique؛
- evaluator version recorded.

### Evidence
- only accepted evaluation can create evidence؛
- historical evidence immutable؛
- content version pinned.

### Learning
- prerequisite graph used for recovery;
- supporting relation cannot alone block;
- related relation cannot alone cause mastery.

### Game
- game without evaluator cannot be ACTIVE;
- reward game creates no evidence by default;
- hard timer cannot be mastery gate.

### Quest
- app open not valid trigger;
- quest completion server-derived;
- expired quest cannot later become completed.

### Reward
- reward grant idempotent;
- reward cannot alter mastery;
- reward issuance retry-safe.

# 24. Station 01 E2E Acceptance Scenario

```text
1. Create Learning Identity
2. Pin G1 curriculum + graph
3. Start Session
4. Present Instruction
5. Guided Practice
6. Start Mini Game
7. Submit Game Attempt
8. Evaluate
9. Create Evidence
10. Update SK001/SK009 state
11. Run Decision
12. Present Check
13. Submit Check
14. Pass/Not Pass
15. Update Milestone/Quest
16. Grant Reward if eligible
17. Resume same Session
```

این سناریو baseline اصلی E2E است.

# 25. v0.29 Closure

`v0.29 CLOSED` وقتی:

- lifecycleها executable شوند؛
- idempotency tests سبز باشند؛
- evidence mapping مشخص باشد؛
- decision rules deterministic باشند؛
- recovery و station pass executable باشند؛
- quest/reward runtime وصل باشند؛
- Station 01 E2E pass شود.

</div>


# COMPLETION ADDENDUM — v0.31 Parent / Teacher Runtime

## Parent actions

Parent actions are preference/constraint updates or navigation; they do not directly create Learning Truth.

## Teacher actions

```text
VIEW
SET OBJECTIVE
REQUEST RECHECK
ADD OBSERVATION
```

Teacher Objective enters the bounded learning-decision flow. Teacher Observation becomes provenance-bearing Evidence.

## Acceptance

- Parent cannot overwrite history.
- Teacher cannot manually set mastery.
- Recheck never deletes prior Evidence.
- Authorization is checked server-side.
