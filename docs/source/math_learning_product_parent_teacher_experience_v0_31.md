# Parent Lite + Teacher Lite Experience Contract — v0.31

تاریخ: ۲۴ سپتامبر ۲۰۲۶

## 0. Decision

V1 سه سطح تجربه دارد:

1. Child Core — تجربه اصلی یادگیری
2. Parent Lite — تجربه اعتماد، مشاهده پیشرفت و حمایت خانگی
3. Teacher Lite — تجربه مشاهده کلاس و مداخله سبک

Parent و Teacher هیچ Learning Engine یا Learning Truth مستقلی ندارند؛ هر دو Projectionهای متفاوت از Shared Platform Core هستند.

## 1. Parent Lite

### 1.1 Goal

Parent باید در کمتر از یک دقیقه بفهمد:

- امروز چه اتفاقی افتاد؟
- کودک در چه چیزی بهتر شده؟
- الان روی چه چیزی کار می‌کند؟
- قدم بعدی چیست؟
- والد چه کمک کوچکی می‌تواند بکند؟

### 1.2 V1 Screens

- Home / Today
- Progress
- Skills Snapshot
- Next Step
- Recent Learning
- Simple Home Activity
- Settings / Preferences

### 1.3 Parent cannot

- Learning State را مستقیماً تغییر دهد.
- Mastery را manually set کند.
- Path را دستی باز/قفل کند.
- Evidence تاریخی را حذف یا overwrite کند.

### 1.4 Parent Constraints

زمان، طول جلسه، زمان‌های مجاز و ترجیح پیام می‌توانند constraint باشند؛ این‌ها فقط Orchestration را تحت تأثیر قرار می‌دهند.

## 2. Teacher Lite

### 2.1 Goal

Teacher باید بتواند بدون مدیریت موتور آموزشی:

- کلاس خود را ببیند.
- فهرست دانش‌آموزان را ببیند.
- دانش‌آموزان نیازمند Review / Attention را پیدا کند.
- پروفایل آموزشی یک دانش‌آموز را بررسی کند.
- یک Objective ساده برای دانش‌آموز/گروه اعلام کند.
- Recheck را درخواست کند.
- Observation ثبت کند.

### 2.2 V1 Screens

- Teacher Home
- Class List
- Student List
- Student Learning Snapshot
- Needs Review / Needs Attention
- Simple Objective / Assignment
- Recheck Queue

### 2.3 Student Snapshot

نمای حداقلی:

- Current Station / Path position
- Skills: Strength / Building / Needs Review
- Recent evidence summary
- Current learning decision
- Recommended next action
- Recent intervention / recheck

### 2.4 Teacher Actions

`VIEW → SET OBJECTIVE → REQUEST RECHECK → ADD OBSERVATION`

Teacher نباید در V1 سؤال یا Path سفارشی بسازد.

### 2.5 Teacher Objective

Teacher می‌تواند WHAT را تعیین کند؛ Engine HOW را انتخاب می‌کند، در محدوده اعلام‌شده.

نمونه:

```text
Teacher: جمع تا ۵ را مرور کنید.
        ↓
Shared Platform
        ↓
Practice / Mini Game / Recovery / Review
        ↓
Evidence
        ↓
Recheck
```

### 2.6 Teacher Observation

Observation منبع Evidence با provenance است و diagnosis قطعی نیست.

```text
Teacher Observation
→ Evidence + Provenance
→ Interpretation
→ Learning Decision
```

## 3. Authorization

Parent فقط related child را می‌بیند.
Teacher فقط students مربوط به Class/Relationship خود را می‌بیند.
Teacher به class دیگر دسترسی ندارد.
UI هرگز مرجع نهایی authorization نیست؛ server-side authorization و RLS مرجع هستند.

## 4. Data Boundary

برای Parent Lite جدول canonical جدید لازم نیست؛ views/projections از:

- Evidence
- Learning State
- Decision / Plan
- Session / Attempt
- Progression / Unlock
- Quest / Reward

ساخته می‌شوند.

برای Teacher Lite نیز V1 تا حد ممکن از همان canonical records و projectionها استفاده می‌کند. ساخت Assignment entity مستقل تا زمانی که workflow واقعی ضرورت آن را اثبات نکند deferred می‌ماند.

## 5. V1 Non-goals

- Parent analytics پیچیده
- export
- teacher gradebook کامل
- group diagnosis پیشرفته
- assignment builder کامل
- manual mastery editing
- manual path editing
- direct editing of learning history

## 6. Acceptance Criteria

### Parent

- Parent فقط child مرتبط را می‌بیند.
- Progress و Next Step با Shared Learning Truth سازگار است.
- refresh باعث ایجاد learning record جدید نمی‌شود.
- Parent action نمی‌تواند Evidence/State تاریخی را overwrite کند.

### Teacher

- Teacher فقط students کلاس‌های مجاز خود را می‌بیند.
- Student Snapshot از canonical state ساخته می‌شود.
- Teacher Objective traceable است.
- Observation provenance دارد.
- Recheck باعث حذف Evidence قبلی نمی‌شود.
- Teacher نمی‌تواند Learning State را دستی overwrite کند.

## 7. Build Priority

Parent Lite و Teacher Lite بعد از کامل‌شدن Child Station 01 Core ساخته می‌شوند؛ اما قرارداد API / authorization از ابتدای backend باید آن‌ها را در نظر بگیرد.

Preferred order:

```text
Child Core
→ Parent Lite
→ Teacher Lite
→ Pilot feedback
→ expand only where evidence demands
```
