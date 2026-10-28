<div dir="rtl" align="right">

# Game + Engagement + Quest + Reward Specification — پلتفرم یادگیری شخصی ریاضی دبستان

**نسخه:** `v0.28-GEQR`
**نوع سند:** V1 Product / Experience / Engagement Contract
**تاریخ:** ۲۴ سپتامبر ۲۰۲۶
**دامنه:** Shared Platform Core + Grade 1 V1
**Status:** `READY FOR IMPLEMENTATION`

> این سند برای بستن شکاف بین Product Core، Child Experience، Content Contract و Session Runtime نوشته شده است. بازی، Quest و Reward باید به تجربه یادگیری متصل باشند، اما هیچ‌کدام نباید Learning Truth مستقل بسازند.

</div>

<div dir="rtl" align="right">

# 0. وضعیت اعتماد و مرز تصمیم

| وضعیت | معنی |
|---|---|
| `LOCKED` | قرارداد V1 که implementation باید رعایت کند. |
| `SOURCE-DERIVED` | ایده/الگو از منبع بیرونی یا artifact موجود استخراج شده است. |
| `PRODUCT-DECISION` | تصمیم اختصاصی این محصول. |
| `HYPOTHESIS` | باید در pilot اندازه‌گیری شود، اما مانع implementation پایه نیست. |
| `OPEN` | خارج از V1 یا نیازمند تصمیم بعدی. |

### منابع بیرونی مورد استفاده

Duolingo در طراحی Path، Practice، Quests و Adventures از تجربه مرحله‌ای، تمرین درون Path، فعالیت‌های کوتاه و تجربه‌های بازی‌مانند استفاده کرده است. در Math نیز چهار بازی کوتاه با مکانیک‌های متفاوت ارائه کرده است. این‌ها **الهام طراحی** هستند، نه قرارداد محصول ما. 

- Duolingo — The Science Behind Duolingo's Home Screen Redesign: https://blog.duolingo.com/new-duolingo-home-screen-design/
- Duolingo — Math Puzzles and Games: https://blog.duolingo.com/math-puzzles-games/
- Duolingo — Adventures: https://blog.duolingo.com/adventures/
- Duolingo — Time Spent Learning Well: https://blog.duolingo.com/time-spent-learning-well/
- Duolingo — Math App / Quests across subjects: https://blog.duolingo.com/duolingo-launches-math-app/

</div>

<div dir="rtl" align="right">

# 1. Thesis

## 1.1 اصل مرکزی

> **هر بازی باید یا فهم، تمرین، انتقال یا جمع‌آوری Evidence را بهتر کند؛ و هر Reward باید نتیجه پیشرفت آموزشی باشد، نه جایگزین آن.**

## 1.2 سه لایه

```text
LEARNING CORE
Skill → Evidence → State → Decision

EXPERIENCE LAYER
Station → Mission → Encounter → Game / Practice / Story

ENGAGEMENT LAYER
Quest → Reward → Visible Progress → Return
```

Engagement Layer به Learning Core متصل است، اما source of truth آن نیست.

## 1.3 چیزهایی که در V1 عمداً نداریم

- leaderboard رقابتی کودکانه؛
- خرید درون‌برنامه‌ای یا اقتصاد پول‌مانند؛
- جریمه برای از دست دادن روز؛
- reward صرفاً برای login یا زمان سپری‌شده؛
- gameهای مستقل و بدون Skill target؛
- XP farming که با بازی بی‌ربط قابل انجام باشد؛
- timer اجباری در Check آموزشی.

`LOCKED`

</div>

<div dir="rtl" align="right">

# 2. Experience Taxonomy

## 2.1 Experience Form

Experience Form فعلی حفظ می‌شود و یک form جدید برای بازی اضافه می‌شود:

```text
STORY
PUZZLE
CHALLENGE
BOSS
BUILD_EXPLORE
CONVERSATION
MINI_GAME        ← NEW
```

`MINI_GAME` شکل تجربه است، نه Learning Role.

## 2.2 Learning Role

Learning Role موجود بدون تغییر باقی می‌ماند:

```text
DIAGNOSTIC_PROBE
INSTRUCTION
GUIDED_PRACTICE
INDEPENDENT_PRACTICE
REVIEW
TRANSFER
MASTERY_CHECK
```

بنابراین یک بازی می‌تواند مثلاً:

```text
Learning Role = REVIEW
Experience Form = MINI_GAME
```

یا:

```text
Learning Role = TRANSFER
Experience Form = MINI_GAME
```

باشد.

## 2.3 Game Classes

### A — Learning Game

هدف اصلی: ساخت یا اندازه‌گیری مفهوم.

Evidence: `YES`، در صورت داشتن evaluator معتبر.

### B — Practice Game

هدف اصلی: تکرار و تثبیت.

Evidence: `YES` ولی quality تابع evaluator و context است.

### C — Transfer Game

هدف: استفاده از Skill در موقعیت جدید.

Evidence: `YES` و برای Mastery/Transfer مهم‌تر از صرفاً repetition است.

### D — Recovery Game

هدف: تغییر representation / difficulty / strategy پس از خطا یا uncertainty.

Evidence: `YES` در صورت پاسخ قابل‌تفسیر.

### E — Reward Game

هدف: engagement بعد از learning milestone.

Evidence: `NO` به‌صورت پیش‌فرض.

Reward Game هرگز نباید Learning State را به‌تنهایی تغییر دهد.

### F — Adventure Mission

یک Mission چند Encounterی است که چند game / story / choice را در یک روایت ترکیب می‌کند.

Evidence در Encounterهای تعریف‌شده تولید می‌شود؛ روایت به‌تنهایی Evidence نیست.

</div>

<div dir="rtl" align="right">

# 3. Mini-Game Contract

هر Mini Game باید حداقل این قرارداد را داشته باشد:

```yaml
mini_game:
  game_code: G1-GAME-001
  content_version_id: <uuid>
  learning_role: REVIEW
  primary_skill_ids: [G1-SK009]
  supporting_skill_ids: [G1-SK010]
  objective: "تشخیص و ادامه الگو"
  state_schema: <JSON schema>
  action_schema: <JSON schema>
  evaluator: <versioned evaluator>
  success_policy: <policy ref>
  evidence_policy: <policy ref>
  feedback_policy: <policy ref>
  hint_policy: <policy ref>
  accessibility: <config>
  timer_policy: NONE
  reward_policy: <optional reward ref>
```

## 3.1 Server authority

- Client rendering و local interaction را انجام می‌دهد.
- Server تصمیم canonical برای نتیجه قابل‌اعتبار، Evidence و reward را ثبت می‌کند.
- Client نمی‌تواند `is_correct`, `mastery`, `unlock` یا `reward_granted` را authoritative تعیین کند.

## 3.2 State

Game state می‌تواند transient باشد؛ source of truth تاریخی Answer/Evidence است.

برای بازی‌های کوتاه V1:

```text
Game State → Attempt raw_response → Evaluator → Evidence
```

`game_actions` table مستقل تا زمانی که نیاز واقعی اثبات نشده است، ساخته نمی‌شود؛ action trace در event/attempt payload قابل نگهداری است.

## 3.3 Timer

سه حالت:

```text
NONE
SOFT
HARD
```

- `NONE`: پیش‌فرض برای آموزش و Check.
- `SOFT`: زمان فقط feedback/pace را تغییر می‌دهد؛ شکست آموزشی ایجاد نمی‌کند.
- `HARD`: فقط در Game/Challenge غیر-Mastery مجاز است و باید explicit باشد.

## 3.4 Difficulty

Difficulty مستقل از Skill identity است.

موتور می‌تواند این موارد را تغییر دهد:

- number range؛
- distractor count؛
- visual complexity؛
- action count؛
- representation؛
- hint level.

اما تغییر difficulty نباید بدون policy باعث تغییر Skill target شود.

</div>

<div dir="rtl" align="right">

# 4. Grade 1 Game Catalog

| Code | نام داخلی | مکانیک | Skillهای نمونه |
|---|---|---|---|
| `G1-GAME-001` | مسیر الگو | انتخاب مسیر مطابق pattern | SK009–SK015 |
| `G1-GAME-002` | شکار شمارش | tap / drag اشیا و شمارش | SK001–SK008 |
| `G1-GAME-003` | کارخانه عدد | ساخت عدد با چند نمایش | SK020–SK024 |
| `G1-GAME-004` | شهر شکل‌ها | ساخت و دسته‌بندی شکل | SK041–SK044 |
| `G1-GAME-005` | آینه جادویی | تکمیل تقارن | SK045–SK046 |
| `G1-GAME-006` | ربات مقایسه | انتخاب کمتر/بیشتر/برابر | SK035–SK040 |
| `G1-GAME-007` | پرش روی محور | حرکت روی number line | SK007, SK034 |
| `G1-GAME-008` | تعمیر ساعت | ساخت ساعت و ترتیب زمانی | SK052–SK055 |
| `G1-GAME-009` | شکار تقویم | پیدا کردن روز/ترتیب | SK056 |
| `G1-GAME-010` | فروشگاه کوچولو | خرید و مسئله‌های عددی | SK022, SK025, SK029, SK057 |
| `G1-GAME-011` | کارخانه ده‌تایی | گروه‌بندی ده‌تایی و یکی | SK022–SK024 |
| `G1-GAME-012` | جدول جادویی | جدول/مربع و استدلال | SK015, SK060 |
| `G1-GAME-013` | کارآگاه اطلاعات | کافی/ناکافی بودن اطلاعات | SK061 |
| `G1-GAME-014` | ماموریت چندمرحله‌ای | چند گام تصمیمی | SK062–SK064 |

### اصل reuse

یک game template می‌تواند در چند Station استفاده شود، اما هر Content Version باید Skill/Station targeting خودش را داشته باشد.

این از duplication بی‌دلیل game engine جلوگیری می‌کند.

</div>

<div dir="rtl" align="right">

# 5. Station ↔ Game Mapping Baseline

| Station | Experience اضافه‌شونده V1 |
|---|---|
| ST01 | شکار شمارش + مسیر الگو |
| ST02 | grid / direction puzzle |
| ST03 | کارخانه عدد |
| ST04 | شهر شکل‌ها |
| ST05 | شمارنده جمع/تفریق |
| ST06 | game انگشت/شمارنده + آینه جادویی |
| ST07 | match عدد و مقدار |
| ST08 | اندازه‌گیری مقایسه‌ای |
| ST09 | آینه جادویی |
| ST10 | ربات مقایسه |
| ST11 | برابر بودن/جفت‌سازی |
| ST12 | ربات مقایسه |
| ST13 | کارخانه عدد |
| ST14 | پرش روی محور |
| ST15 | کارخانه ده‌تایی / جدول جادویی |
| ST16 | تعمیر ساعت |
| ST17 | فروشگاه کوچولو / تخمین |
| ST18 | مسیر الگو / تعمیر ساعت |
| ST19 | فروشگاه کوچولو |
| ST20 | کارخانه ده‌تایی |
| ST21 | grid عدد و اندازه‌گیری |
| ST22 | شکار تقویم |
| ST23 | پرش روی محور |
| ST24 | ماموریت چندمرحله‌ای |
| ST25 | کارآگاه اطلاعات |

این Mapping یک **Experience Coverage Baseline** است، نه تغییر Skill Graph.

</div>

<div dir="rtl" align="right">

# 6. Engagement Contract

## 6.1 سه محرک اصلی

```text
CURIOSITY
COMPETENCE
AGENCY
```

کودک باید بداند:

- مرحله بعد چیست؛
- در چه چیزی بهتر شده؛
- در تجربه چگونه می‌تواند عمل کند.

## 6.2 Progress visibility

پیشرفت باید بیشتر در این موارد دیده شود:

- مسیر بازشده؛
- Milestone؛
- Skill growth؛
- world element؛
- character reaction؛

و کمتر در عددهای خام و leaderboard.

## 6.3 Learning Rhythm

V1 به‌جای Streak تنبیهی، مفهوم **Learning Rhythm** را نگه می‌دارد:

- تعداد روزهای یادگیری در هفته؛
- آخرین بازگشت معنادار؛
- milestone هفتگی.

قطع یک روز نباید reward قبلی را پس بگیرد و نباید پیام guilt ایجاد کند.

`LOCKED`

## 6.4 Notification tone

مجاز:

> «یک مرحله کوتاه آماده داری.»

نامجاز:

> «امروز نیایی، زحماتت از بین می‌رود!»

</div>

<div dir="rtl" align="right">

# 7. Quest Contract

## 7.1 Quest چیست؟

Quest یک هدف کوتاه‌مدت برای هدایت رفتار یادگیری است.

Quest نباید هدف Learning را عوض کند؛ فقط مسیر انجام آن را قابل‌فهم‌تر و جذاب‌تر می‌کند.

## 7.2 Quest Types

```text
PATH_PROGRESS
SKILL_REVIEW
RECOVERY
GAME_PRACTICE
TRANSFER
MILESTONE
```

## 7.3 Daily Quest Set

V1 حداکثر ۳ Quest فعال هم‌زمان دارد:

```text
Q1 — Easy Start
Q2 — Skill Builder
Q3 — Meaningful Progress
```

ترتیب از آسان به معنادار طراحی می‌شود.

هدف اصلی این است که Questها کودک را به Path/learning برگردانند، نه اینکه او را به farming وقت یا XP تشویق کنند.

## 7.4 Quest examples

```text
«یک تمرین کوتاه را کامل کن.»

«دو بازی آموزشی درباره عدد انجام بده.»

«مهارتی را که دیروز نیاز به تمرین داشت مرور کن.»

«یک مرحله از مسیرت را جلو ببر.»
```

## 7.5 Quest completion

Quest فقط وقتی complete می‌شود که trigger معتبر ثبت شده باشد.

مثلاً:

```text
Station completed
```

معتبر است.

اما:

```text
App opened
```

معتبر نیست.

</div>

<div dir="rtl" align="right">

# 8. Reward Contract

## 8.1 Reward classes

```text
STAR_PROGRESS
MILESTONE_BADGE
CHARACTER_REACTION
WORLD_ELEMENT
CHARACTER_COSMETIC
PATH_REVEAL
STICKER
```

## 8.2 V1 economy

در V1:

- خرید reward نداریم؛
- currency قابل‌معامله نداریم؛
- reward آموزشی/زیبایی است؛
- reward نباید قابلیت unfair برای حل سؤال بدهد؛
- reward قابل‌جمع‌آوری است، ولی Learning State نیست.

## 8.3 Reward sources

```text
MILESTONE
QUEST
STATION_PROGRESS
LEARNING_ACHIEVEMENT
ADVENTURE_COMPLETION
```

## 8.4 Reward idempotency

برای هر `(learning_identity, source_type, source_ref, reward_id)` فقط یک Grant فعال ایجاد می‌شود.

## 8.5 Reward ≠ Mastery

هرگز:

```text
reward_granted → mastery=true
```

بلکه:

```text
Evidence → Mastery policy
Evidence/Milestone → Reward policy
```

این دو خروجی هم‌زمان ولی مستقل هستند.

</div>

<div dir="rtl" align="right">

# 9. Adventure Contract

Adventure یک Mission چندEncounterی است.

مثال:

### Adventure — «جشن ربات»

```text
Encounter 1 — شمارش بادکنک‌ها
        ↓
Encounter 2 — خرید لیوان‌ها
        ↓
Encounter 3 — تقسیم کیک
        ↓
Encounter 4 — انتخاب زمان جشن
        ↓
Milestone / Reward
```

فقط Encounterهای دارای Learning Role مناسب می‌توانند Evidence تولید کنند.

این مدل از ساختار Adventures در Duolingo الهام گرفته شده، اما در محصول ما Adventure همچنان یک experience است و Learning Truth در Encounter/Evidence باقی می‌ماند. citeturn588787search1

</div>

<div dir="rtl" align="right">

# 10. Safety / Child Experience Guardrails

- شکست game ≠ شکست کودک.
- اشتباه باعث از دست رفتن reward قبلی نمی‌شود.
- timer در Check آموزشی پیش‌فرض نیست.
- animation نباید پاسخ درست را از بازخورد یادگیری مهم‌تر کند.
- sound باید قابل خاموش‌کردن باشد.
- motion باید قابل‌درک و non-overwhelming باشد.
- Quest نباید کودک را برای ورود روزانه شرمنده کند.
- reward نباید نیاز آموزشی را دور بزند.
- هیچ leaderboard اجتماعی در V1 child core وجود ندارد.

</div>

<div dir="rtl" align="right">

# 11. Analytics Contract

Engagement eventهای قابل ثبت:

```text
game_started
game_completed
game_abandoned
quest_presented
quest_progressed
quest_completed
reward_presented
reward_claimed
milestone_reached
learning_rhythm_updated
```

Event با Evidence یکی نیست.

هر event باید بتواند provenance، learning_identity، session/encounter و client context را نگه دارد، ولی فقط mappingهای مجاز می‌توانند Evidence بسازند.

## Key metrics

### Learning
- Skill progression;
- evidence quality;
- recovery success;
- transfer performance.

### Experience
- encounter completion;
- game completion;
- recovery re-entry;
- session return.

### Engagement
- meaningful return;
- Quest completion;
- Learning Rhythm;
- path progression.

`time_spent` به‌تنهایی success metric نیست.

</div>

<div dir="rtl" align="right">

# 12. Contract Tests

1. هر Mini Game حداقل یک Skill target دارد.
2. Reward Game هیچ Evidence مستقیم نمی‌سازد مگر policy صریح.
3. هر Learning Game evaluator version دارد.
4. Quest فقط با trigger معتبر complete می‌شود.
5. App Open هرگز Quest معتبر برای Progress نیست.
6. Reward grant idempotent است.
7. Reward grant mastery را تغییر نمی‌دهد.
8. Mini Game بدون Station/Skill target در Grade Package فعال نمی‌شود.
9. HARD timer در Mastery Check مجاز نیست.
10. بازی می‌تواند reuse شود، اما Content Version targeting باید explicit باشد.
11. Game result بدون accepted Attempt وارد Learning Truth نمی‌شود.
12. Adventure بدون Encounter آموزشی نمی‌تواند mastery ایجاد کند.

</div>

<div dir="rtl" align="right">

# 13. V1 Decision Summary

### LOCKED

- Mini Game به‌عنوان Experience Form
- game/evidence separation
- quest → learning behavior
- reward → progress outcome
- no punitive streak
- no child leaderboard
- no paid currency
- max 3 Daily Quests
- reward idempotency
- Adventure as Mission-level experience

### HYPOTHESIS

- دقیق‌ترین Quest mix؛
- optimal reward frequency؛
- تعداد game encounters در هر Session؛
- میزان animation؛
- dosage روزانه/هفتگی.

### OPEN / Later

- Friends Quest / co-op
- social feed
- premium economy
- marketplace
- user-generated games

</div>


# COMPLETION ADDENDUM — v0.31 Parent / Teacher Integration

- Parent rewards and progress are projections, never new learning truth.
- Teacher Objectives can trigger the same learning loop as system decisions while preserving teacher provenance.
- Teacher Review/Recheck must use canonical Evidence and cannot create a second learning history.
- Quest/Reward UI visible to adults is summary-only; child-facing motivation remains primary.
