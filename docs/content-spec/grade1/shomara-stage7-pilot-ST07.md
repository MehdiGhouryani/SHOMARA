# مرحلهٔ ۷ (پایلوت): مشخصات کامل ایستگاه ST07 · عددهای ۱ و ۲

**وضعیت:** نمونهٔ کامل مطابق قالب مرحلهٔ ۶ (فایل `shomara-stage6-spec-format.md`). همهٔ بخش‌ها با اعتبارسنج خودکار بررسی شده‌اند (بخش ۱۳). این فایل برای ارزیابی «آیا یک برنامه‌نویس یا مدل هوش مصنوعی می‌تواند بدون پرسش آن را پیاده کند» ساخته شده است؛ نتیجهٔ آن آزمون هنوز نیست.
**فایل‌های همراه:** `shomara-ST07-audio-manifest.csv` (خط‌های صوتی همین ایستگاه) و `shomara-global-audio-manifest.csv` (عددها، ترتیبی‌ها، واژه‌ها و خط‌های عمومی) برای وارد کردن در پنل ادمین.

## ۰. شناسنامه

```yaml
station: ST07
name: عددهای ۱ و ۲
chapter:
  number: 2
  current_name: جنگل اندازه‌ها
  note: نام فصل با محتوا نمی‌خواند؛ تصمیم مرحلهٔ ۴
book:
  unit: 7
  plate_pdf: 49
  work_pages_pdf: 50 تا 55 (U07-P02 تا U07-P07)
prerequisites:
- ST01
- ST02
- ST03
- ST04
- ST05
- ST06
skills:
- id: SK-ST07-1
  text: نوشتن ۱ و ۲ با نقطهٔ شروع و جهت درست
- id: SK-ST07-2
  text: وصل کردن نماد ۱ و ۲ به نمایش‌های مختلف (تصویر، نقطه، شیء)
- id: SK-ST07-3
  text: انتخاب عدد درست برای مجموعهٔ ۱ یا ۲ تایی
- id: SK-ST07-4
  text: ادامهٔ الگوی پیوسته (از جمله الگوی عددی ۱ و ۲)
templates:
- T01
- T05
- T13
- T15
estimated_minutes:
  P1: 1.5
  P2: 3
  P3: 3
  P4: 1.5
  P5: 1.5
  note: برآورد من؛ با آزمون کودک اصلاح شود
numerals_taught:
- 1
- 2
audio_policy:
  display_numerals_allowed:
  - 1
  - 2
  note: در متن نمایشی فقط ۱ و ۲ دیده شود؛ عددهای دیگر فقط در صدا
version: 1
status: draft
```

## ۱. قلمرو و نگاشت صفحه‌های کتاب

| صفحهٔ کتاب | محتوا | جایگاه در ایستگاه |
|---|---|---|
| U07-P02 | کیک پنج‌تکه؛ برداشته‌شده/مانده؛ مربع شگفت‌انگیز ۴×۴ رنگی | مرور تفریق: `P5.i04`؛ مربع ۴×۴: خارج از ST07 (خانوادهٔ اختیاری F6 در تمرین با T08 — در پایلوت ساخته نشد) |
| U07-P03 | عدد ۱ با نمایش‌های مختلف؛ نوشتن ۱ | `P1.s01`، `P2.i01`، `P2.i03`، `P2.i06`، `P2.i07` |
| U07-P04 | الگوی پیوسته و جدا؛ واحد تکرارشونده | `P3.r01`، `P3.r02`، `P3.r06` |
| U07-P05 | عدد ۲ با نمایش‌های مختلف؛ نوشتن ۲ | `P1.s02`، `P2.i02`، `P2.i04`، `P2.i05`، `P2.i08` |
| U07-P06 | انتخاب ۱ یا ۲؛ الگوی خطی با خط‌کش | `F2`، `F3` (استخر)، `P3.r05` (الگوی خطی؛ بدون خط‌کش واقعی) |
| U07-P07 | تقارن با شابلون در دو طرف خط | خارج از ST07 (ST06 تقارن با شابلون را دارد؛ T07 در ST09/ST10) — تصمیم لازم |

**جایگزینی محتوای تصویری کتاب:** کتاب برای «۱» نمونه‌هایی مثل قرآن، کعبه و دماوند دارد. در این طرح نمونه‌های خنثی آمده‌اند (خورشید، خانه، درخت)؛ تصمیم دربارهٔ محتوای دینی با شماست. همهٔ تصویرها ایلوستریشن تازه‌اند؛ عکس کتاب استفاده نمی‌شود.

## ۲. بخش ۱ · کشف (راهنما هدایت می‌کند)

هیچ نمره‌ای ندارد. هر قدم پس از پایان صدا یا کار کودک جلو می‌رود؛ اگر کودک ۸ ثانیه کاری نکرد، صدای آخرین دستور دوباره پخش می‌شود (بدون نمایش خطا).

```yaml
- id: ST07.P1.s00
  kind: intro
  guide:
    pose: CH.guide.encourage
    size: large
  audio:
    pr: ST07.P1.s00.pr
  advance: پس از پایان صدا
  idle_replay_s: 8
- id: ST07.P1.s01
  kind: discover
  template: T01
  params:
    mode: discover
    cards:
    - OBJ.sun
    - OBJ.house
    - OBJ.tree
    card_labels:
    - ST07.P1.s01.a
    - ST07.P1.s01.b
    - ST07.P1.s01.c
    reveal: GLYPH.1
  guide:
    pose: CH.guide.think
    size: small
  audio:
    pr: ST07.P1.s01.pr
    done: ST07.P1.s01.done
  interaction: کودک هر کارت را لمس می‌کند؛ کارت برجسته می‌شود و برچسب صوتی پخش می‌شود. پس از لمس هر سه کارت، نماد
    ۱ با انیمیشن نوشتن ظاهر می‌شود.
  advance: پس از پایان صدای done
  idle_replay_s: 8
  assets:
  - OBJ.sun
  - OBJ.house
  - OBJ.tree
  - GLYPH.1
- id: ST07.P1.s02
  kind: discover
  template: T01
  params:
    mode: discover
    cards:
    - OBJ.eyes
    - OBJ.shoes
    - OBJ.wheels
    card_labels:
    - ST07.P1.s02.a
    - ST07.P1.s02.b
    - ST07.P1.s02.c
    reveal: GLYPH.2
  guide:
    pose: CH.guide.think
    size: small
  audio:
    pr: ST07.P1.s02.pr
    done: ST07.P1.s02.done
  interaction: مانند s01 با گروه‌های دوتایی؛ در پایان نماد ۲ ظاهر می‌شود.
  advance: پس از پایان صدای done
  idle_replay_s: 8
  assets:
  - OBJ.eyes
  - OBJ.shoes
  - OBJ.wheels
  - GLYPH.2
- id: ST07.P1.s03
  kind: transition
  guide:
    pose: CH.guide.encourage
    size: large
  audio:
    pr: ST07.P1.s03.pr
  advance: پس از پایان صدا
```

## ۳. بخش ۲ · با هم تمرین می‌کنیم (۸ آیتم)

ترتیب آیتم‌ها ثابت است. بازخورد و سرنخ مطابق بخش ۵ مرجع مشترک (نردبان سرنخ). راهنما حاضر است.

```yaml
- id: ST07.P2.i01
  template: T15
  level: 1
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.ball
        count: 1
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 1
    distractor_rule: گزینهٔ دیگر عدد ۲ است
  audio:
    pr: ST07.F2.pr.top
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
    ok: ST07.P2.i01.ok
  answer:
    type: option
    value: 1
  assets:
  - OBJ.ball
  - UI.card.numeral
- id: ST07.P2.i02
  template: T15
  level: 1
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.shoe
        count: 2
        layout: pair
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 2
    distractor_rule: گزینهٔ دیگر عدد ۱ است
  audio:
    pr: ST07.F2.pr.kafsh
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
    ok: ST07.P2.i02.ok
  answer:
    type: option
    value: 2
  assets:
  - OBJ.shoe
  - UI.card.numeral
- id: ST07.P2.i03
  template: T13
  level: 1
  skill:
  - SK-ST07-1
  params:
    glyph: GLYPH.1
    arrows: true
    showStartDot: true
    baseline: true
    tolerance_dp: 28
  audio:
    pr: ST07.P2.i03.pr
    h1: ST07.S.trace.h1
    h2: ST07.S.trace.h2
    h3: ST07.S.trace.h3
    ok: ST07.P2.i03.ok
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: trace
    value: 1
  assets:
  - GLYPH.1
  - UI.baseline
- id: ST07.P2.i04
  template: T13
  level: 1
  skill:
  - SK-ST07-1
  params:
    glyph: GLYPH.2
    arrows: true
    showStartDot: true
    baseline: true
    tolerance_dp: 28
  audio:
    pr: ST07.P2.i04.pr
    h1: ST07.S.trace.h1
    h2: ST07.S.trace.h2
    h3: ST07.S.trace.h3
    ok: ST07.P2.i04.ok
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: trace
    value: 2
  assets:
  - GLYPH.2
  - UI.baseline
- id: ST07.P2.i05
  template: T15
  level: 1
  skill:
  - SK-ST07-2
  params:
    stimulus:
      numeral: 2
    options:
    - kind: picture
      count: 1
    - kind: picture
      count: 2
    - kind: picture
      count: 3
    object_kind: OBJ.flower
    correct_count: 2
    distractor_rule: عکس‌هایی با ۱ و ۳ شیء
  audio:
    pr: ST07.F3.pr.2
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
    ok: ST07.P2.i05.ok
  answer:
    type: option
    value: count=2
  assets:
  - OBJ.flower
  - UI.card.picture
- id: ST07.P2.i06
  template: T15
  level: 1
  skill:
  - SK-ST07-2
  params:
    stimulus:
      numeral: 1
    options:
    - kind: picture
      count: 2
    - kind: picture
      count: 1
    - kind: picture
      count: 3
    object_kind: OBJ.fish
    correct_count: 1
    distractor_rule: عکس‌هایی با ۲ و ۳ شیء
  audio:
    pr: ST07.F3.pr.1
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
    ok: ST07.P2.i06.ok
  answer:
    type: option
    value: count=1
  assets:
  - OBJ.fish
  - UI.card.picture
- id: ST07.P2.i07
  template: T01
  level: 1
  skill:
  - SK-ST07-2
  params:
    mode: place
    tray:
      kind: OBJ.flower
      count: 3
    target_zone: OBJ.pot
    target: 1
  audio:
    pr: ST07.P2.i07.pr
    h1: ST07.S.place.h1
    h2: ST07.S.place.h2
    h3: ST07.S.place.h3
    ok: ST07.P2.i07.ok
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: count_placed
    value: 1
  assets:
  - OBJ.flower
  - OBJ.pot
  - UI.tray
- id: ST07.P2.i08
  template: T01
  level: 1
  skill:
  - SK-ST07-2
  params:
    mode: place
    tray:
      kind: OBJ.pencil
      count: 4
    target_zone: OBJ.pencilcase
    target: 2
  audio:
    pr: ST07.P2.i08.pr
    h1: ST07.S.place.h1
    h2: ST07.S.place.h2
    h3: ST07.S.place.h3
    ok: ST07.P2.i08.ok
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: count_placed
    value: 2
  assets:
  - OBJ.pencil
  - OBJ.pencilcase
  - UI.tray
```

## ۴. بخش ۳ · بازی: «تزیین کیک» (الگوساز، T05)

کیک تولد بزرگ در صحنه است؛ حاشیهٔ آن جای‌های خالی دارد. در هر دور کودک الگو را روی حاشیه ادامه می‌دهد. بدون راهنما (نیمه‌تنه فقط هنگام سرنخ). صدا و افکت کامل (مرجع مشترک بخش ۲ و ۴). پایان بازی: جشن راهنما (`G.win.*`، `SFX.win.round`).

```yaml
game:
  id: ST07.P3
  template: T05
  theme: تزیین کیک تولد
  intro_audio: ST07.S.cake
  rounds: 6
  retry_allowed: true
  hints:
  - h1
  - h2
  end: G.win.*
rounds:
- id: ST07.P3.r01
  template: T05
  level: 1
  skill:
  - SK-ST07-4
  params:
    mode: continue
    kind: shape
    unit:
    - PAT.circle
    - PAT.square
    repeats_shown: 3
    blanks: 2
    tray:
    - PAT.circle
    - PAT.square
    - PAT.triangle
    board: OBJ.cakeborder
  audio:
    pr: ST07.S.continue
    h1: ST07.S.pat.h1
    h2: ST07.S.pat.h2
    h3: ST07.S.pat.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: rule
    value: ABAB
  assets:
  - OBJ.cakeborder
  - PAT.circle
  - PAT.square
  - PAT.triangle
- id: ST07.P3.r02
  template: T05
  level: 1
  skill:
  - SK-ST07-4
  params:
    mode: continue
    kind: color
    unit:
    - PAT.pink
    - PAT.pink
    - PAT.green
    repeats_shown: 2
    blanks: 3
    tray:
    - PAT.pink
    - PAT.green
    board: OBJ.cakeborder
  audio:
    pr: ST07.S.continue
    h1: ST07.S.pat.h1
    h2: ST07.S.pat.h2
    h3: ST07.S.pat.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: rule
    value: AAB
  assets:
  - OBJ.cakeborder
  - PAT.pink
  - PAT.green
- id: ST07.P3.r03
  template: T05
  level: 2
  skill:
  - SK-ST07-4
  - SK-ST07-2
  params:
    mode: continue
    kind: number
    unit:
    - PAT.num1
    - PAT.num2
    repeats_shown: 3
    blanks: 2
    tray:
    - PAT.num1
    - PAT.num2
    read_out: N.001,N.002 به ترتیب
  audio:
    pr: ST07.S.continueNum
    h1: ST07.S.pat.h1
    h2: ST07.S.pat.h2
    h3: ST07.S.pat.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: rule
    value: ABAB (۱ و ۲)
  assets:
  - PAT.num1
  - PAT.num2
- id: ST07.P3.r04
  template: T05
  level: 2
  skill:
  - SK-ST07-4
  - SK-ST07-2
  params:
    mode: continue
    kind: number
    unit:
    - PAT.num1
    - PAT.num1
    - PAT.num2
    repeats_shown: 2
    blanks: 3
    tray:
    - PAT.num1
    - PAT.num2
    read_out: N.001,N.001,N.002
  audio:
    pr: ST07.S.continueNum
    h1: ST07.S.pat.h1
    h2: ST07.S.pat.h2
    h3: ST07.S.pat.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: rule
    value: AAB (۱ ۱ ۲)
  assets:
  - PAT.num1
  - PAT.num2
- id: ST07.P3.r05
  template: T05
  level: 2
  skill:
  - SK-ST07-4
  params:
    mode: continue
    kind: line
    unit:
    - PAT.up
    - PAT.down
    repeats_shown: 2
    blanks: 4
    tray:
    - PAT.up
    - PAT.down
    - PAT.flat
  audio:
    pr: ST07.S.line
    h1: ST07.S.pat.h1
    h2: ST07.S.pat.h2
    h3: ST07.S.pat.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: rule
    value: بالا-پایین
  assets:
  - PAT.up
  - PAT.down
  - PAT.flat
- id: ST07.P3.r06
  template: T05
  level: 2
  skill:
  - SK-ST07-4
  params:
    mode: findUnit
    kind: shape
    sequence:
    - PAT.circle
    - PAT.square
    - PAT.circle
    - PAT.square
    - PAT.circle
    - PAT.square
    bracket: UI.bracket
  audio:
    pr: ST07.S.unit
    h1: ST07.S.pat.h1
    h2: ST07.S.pat.h2
    h3: ST07.S.pat.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: unit
    value: دایره-مربع
  assets:
  - PAT.circle
  - PAT.square
  - UI.bracket
```

## ۵. بخش ۴ · خودت انجام بده (استخر و قاعدهٔ انتخاب)

بدون کمک و بدون راهنما، یک تلاش برای هر آیتم؛ بازخورد فقط تأیید خنثی. استخر ۲۶ آیتم دارد (کمینهٔ مرحلهٔ ۴: ۱۲).

```yaml
draw_rule:
  count: 4
  one_from_each_family:
  - F1
  - F2
  - F3
  - F4
  exclude_seen_in_last_attempt: true
  recheck: آیتم‌های تازه از همان خانواده‌ها
  pass_threshold: ۳ از ۴
  skills_map:
    F1: SK-ST07-1
    F2: SK-ST07-3
    F3: SK-ST07-2
    F4: SK-ST07-4
families:
- id: F1
  template: T13
  desc: نوشتن ۱ یا ۲ بدون فلش
  size: 4
- id: F2
  template: T15
  desc: چند شیء می‌بینی؟ (۱ یا ۲)؛ ۶ نوع شیء
  size: 12
- id: F3
  template: T15
  desc: کدام عکس n تا دارد؟ (۱ یا ۲)؛ سه ترتیب
  size: 6
- id: F4
  template: T05
  desc: ادامهٔ الگوی عددی ۱ و ۲
  size: 4
```

**فهرست آیتم‌های استخر** (پارامترهای کامل هر آیتم در YAML پیوست زیر):

| شناسه | الگو | سطح | پاسخ |
|---|---|---|---|
| `ST07.F1.w1a` | T13 | 2 | 1 |
| `ST07.F1.w1b` | T13 | 2 | 1 |
| `ST07.F1.w2a` | T13 | 2 | 2 |
| `ST07.F1.w2b` | T13 | 2 | 2 |
| `ST07.F2.top1` | T15 | 2 | 1 |
| `ST07.F2.top2` | T15 | 2 | 2 |
| `ST07.F2.kafsh1` | T15 | 2 | 1 |
| `ST07.F2.kafsh2` | T15 | 2 | 2 |
| `ST07.F2.gol1` | T15 | 2 | 1 |
| `ST07.F2.gol2` | T15 | 2 | 2 |
| `ST07.F2.medad1` | T15 | 2 | 1 |
| `ST07.F2.medad2` | T15 | 2 | 2 |
| `ST07.F2.mahi1` | T15 | 2 | 1 |
| `ST07.F2.mahi2` | T15 | 2 | 2 |
| `ST07.F2.ketab1` | T15 | 2 | 1 |
| `ST07.F2.ketab2` | T15 | 2 | 2 |
| `ST07.F3.p11` | T15 | 2 | count=1 |
| `ST07.F3.p12` | T15 | 2 | count=1 |
| `ST07.F3.p13` | T15 | 2 | count=1 |
| `ST07.F3.p21` | T15 | 2 | count=2 |
| `ST07.F3.p22` | T15 | 2 | count=2 |
| `ST07.F3.p23` | T15 | 2 | count=2 |
| `ST07.F4.n1` | T05 | 2 | 1-2 |
| `ST07.F4.n2` | T05 | 2 | 2-1 |
| `ST07.F4.n3` | T05 | 2 | 1-1-2 |
| `ST07.F4.n4` | T05 | 2 | 2-2-1 |

```yaml
- id: ST07.F1.w1a
  template: T13
  level: 2
  skill:
  - SK-ST07-1
  params:
    glyph: GLYPH.1
    arrows: false
    showStartDot: true
    baseline: true
    tolerance_dp: 28
    variant: بدون فلش با نقطهٔ شروع
  audio:
    pr: ST07.F1.pr.1
    ok_generic: G.ok.*
    retry: G.retry.*
    h1: ST07.S.trace.h1
    h2: ST07.S.trace.h2
    h3: ST07.S.trace.h3
  answer:
    type: trace
    value: 1
  assets:
  - GLYPH.1
  - UI.baseline
- id: ST07.F1.w1b
  template: T13
  level: 2
  skill:
  - SK-ST07-1
  params:
    glyph: GLYPH.1
    arrows: false
    showStartDot: false
    baseline: true
    tolerance_dp: 28
    variant: فقط خط زمینه
  audio:
    pr: ST07.F1.pr.1
    ok_generic: G.ok.*
    retry: G.retry.*
    h1: ST07.S.trace.h1
    h2: ST07.S.trace.h2
    h3: ST07.S.trace.h3
  answer:
    type: trace
    value: 1
  assets:
  - GLYPH.1
  - UI.baseline
- id: ST07.F1.w2a
  template: T13
  level: 2
  skill:
  - SK-ST07-1
  params:
    glyph: GLYPH.2
    arrows: false
    showStartDot: true
    baseline: true
    tolerance_dp: 28
    variant: بدون فلش با نقطهٔ شروع
  audio:
    pr: ST07.F1.pr.2
    ok_generic: G.ok.*
    retry: G.retry.*
    h1: ST07.S.trace.h1
    h2: ST07.S.trace.h2
    h3: ST07.S.trace.h3
  answer:
    type: trace
    value: 2
  assets:
  - GLYPH.2
  - UI.baseline
- id: ST07.F1.w2b
  template: T13
  level: 2
  skill:
  - SK-ST07-1
  params:
    glyph: GLYPH.2
    arrows: false
    showStartDot: false
    baseline: true
    tolerance_dp: 28
    variant: فقط خط زمینه
  audio:
    pr: ST07.F1.pr.2
    ok_generic: G.ok.*
    retry: G.retry.*
    h1: ST07.S.trace.h1
    h2: ST07.S.trace.h2
    h3: ST07.S.trace.h3
  answer:
    type: trace
    value: 2
  assets:
  - GLYPH.2
  - UI.baseline
- id: ST07.F2.top1
  template: T15
  level: 2
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.ball
        count: 1
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 1
    distractor_rule: گزینهٔ دیگر عدد دیگر است
  audio:
    pr: ST07.F2.pr.top
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: 1
  assets:
  - OBJ.ball
  - UI.card.numeral
- id: ST07.F2.top2
  template: T15
  level: 2
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.ball
        count: 2
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 2
    distractor_rule: گزینهٔ دیگر عدد دیگر است
  audio:
    pr: ST07.F2.pr.top
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: 2
  assets:
  - OBJ.ball
  - UI.card.numeral
- id: ST07.F2.kafsh1
  template: T15
  level: 2
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.shoe
        count: 1
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 1
    distractor_rule: گزینهٔ دیگر عدد دیگر است
  audio:
    pr: ST07.F2.pr.kafsh
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: 1
  assets:
  - OBJ.shoe
  - UI.card.numeral
- id: ST07.F2.kafsh2
  template: T15
  level: 2
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.shoe
        count: 2
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 2
    distractor_rule: گزینهٔ دیگر عدد دیگر است
  audio:
    pr: ST07.F2.pr.kafsh
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: 2
  assets:
  - OBJ.shoe
  - UI.card.numeral
- id: ST07.F2.gol1
  template: T15
  level: 2
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.flower
        count: 1
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 1
    distractor_rule: گزینهٔ دیگر عدد دیگر است
  audio:
    pr: ST07.F2.pr.gol
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: 1
  assets:
  - OBJ.flower
  - UI.card.numeral
- id: ST07.F2.gol2
  template: T15
  level: 2
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.flower
        count: 2
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 2
    distractor_rule: گزینهٔ دیگر عدد دیگر است
  audio:
    pr: ST07.F2.pr.gol
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: 2
  assets:
  - OBJ.flower
  - UI.card.numeral
- id: ST07.F2.medad1
  template: T15
  level: 2
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.pencil
        count: 1
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 1
    distractor_rule: گزینهٔ دیگر عدد دیگر است
  audio:
    pr: ST07.F2.pr.medad
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: 1
  assets:
  - OBJ.pencil
  - UI.card.numeral
- id: ST07.F2.medad2
  template: T15
  level: 2
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.pencil
        count: 2
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 2
    distractor_rule: گزینهٔ دیگر عدد دیگر است
  audio:
    pr: ST07.F2.pr.medad
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: 2
  assets:
  - OBJ.pencil
  - UI.card.numeral
- id: ST07.F2.mahi1
  template: T15
  level: 2
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.fish
        count: 1
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 1
    distractor_rule: گزینهٔ دیگر عدد دیگر است
  audio:
    pr: ST07.F2.pr.mahi
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: 1
  assets:
  - OBJ.fish
  - UI.card.numeral
- id: ST07.F2.mahi2
  template: T15
  level: 2
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.fish
        count: 2
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 2
    distractor_rule: گزینهٔ دیگر عدد دیگر است
  audio:
    pr: ST07.F2.pr.mahi
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: 2
  assets:
  - OBJ.fish
  - UI.card.numeral
- id: ST07.F2.ketab1
  template: T15
  level: 2
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.book
        count: 1
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 1
    distractor_rule: گزینهٔ دیگر عدد دیگر است
  audio:
    pr: ST07.F2.pr.ketab
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: 1
  assets:
  - OBJ.book
  - UI.card.numeral
- id: ST07.F2.ketab2
  template: T15
  level: 2
  skill:
  - SK-ST07-3
  - SK-ST07-2
  params:
    stimulus:
      objects:
        kind: OBJ.book
        count: 2
        layout: scatter
    options:
    - kind: numeral
      value: 1
    - kind: numeral
      value: 2
    correct: 2
    distractor_rule: گزینهٔ دیگر عدد دیگر است
  audio:
    pr: ST07.F2.pr.ketab
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: 2
  assets:
  - OBJ.book
  - UI.card.numeral
- id: ST07.F3.p11
  template: T15
  level: 2
  skill:
  - SK-ST07-2
  params:
    stimulus:
      numeral: 1
    options:
    - kind: picture
      count: 1
    - kind: picture
      count: 2
    - kind: picture
      count: 3
    object_kind: OBJ.flower
    correct_count: 1
    distractor_rule: دو عکس دیگر با تعدادهای دیگر
  audio:
    pr: ST07.F3.pr.1
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: count=1
  assets:
  - OBJ.flower
  - UI.card.picture
- id: ST07.F3.p12
  template: T15
  level: 2
  skill:
  - SK-ST07-2
  params:
    stimulus:
      numeral: 1
    options:
    - kind: picture
      count: 3
    - kind: picture
      count: 1
    - kind: picture
      count: 2
    object_kind: OBJ.fish
    correct_count: 1
    distractor_rule: دو عکس دیگر با تعدادهای دیگر
  audio:
    pr: ST07.F3.pr.1
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: count=1
  assets:
  - OBJ.fish
  - UI.card.picture
- id: ST07.F3.p13
  template: T15
  level: 2
  skill:
  - SK-ST07-2
  params:
    stimulus:
      numeral: 1
    options:
    - kind: picture
      count: 2
    - kind: picture
      count: 3
    - kind: picture
      count: 1
    object_kind: OBJ.ball
    correct_count: 1
    distractor_rule: دو عکس دیگر با تعدادهای دیگر
  audio:
    pr: ST07.F3.pr.1
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: count=1
  assets:
  - OBJ.ball
  - UI.card.picture
- id: ST07.F3.p21
  template: T15
  level: 2
  skill:
  - SK-ST07-2
  params:
    stimulus:
      numeral: 2
    options:
    - kind: picture
      count: 1
    - kind: picture
      count: 2
    - kind: picture
      count: 3
    object_kind: OBJ.flower
    correct_count: 2
    distractor_rule: دو عکس دیگر با تعدادهای دیگر
  audio:
    pr: ST07.F3.pr.2
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: count=2
  assets:
  - OBJ.flower
  - UI.card.picture
- id: ST07.F3.p22
  template: T15
  level: 2
  skill:
  - SK-ST07-2
  params:
    stimulus:
      numeral: 2
    options:
    - kind: picture
      count: 3
    - kind: picture
      count: 1
    - kind: picture
      count: 2
    object_kind: OBJ.fish
    correct_count: 2
    distractor_rule: دو عکس دیگر با تعدادهای دیگر
  audio:
    pr: ST07.F3.pr.2
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: count=2
  assets:
  - OBJ.fish
  - UI.card.picture
- id: ST07.F3.p23
  template: T15
  level: 2
  skill:
  - SK-ST07-2
  params:
    stimulus:
      numeral: 2
    options:
    - kind: picture
      count: 2
    - kind: picture
      count: 3
    - kind: picture
      count: 1
    object_kind: OBJ.ball
    correct_count: 2
    distractor_rule: دو عکس دیگر با تعدادهای دیگر
  audio:
    pr: ST07.F3.pr.2
    h1: ST07.S.pick.h1
    h2: ST07.S.pick.h2
    h3: ST07.S.pick.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: count=2
  assets:
  - OBJ.ball
  - UI.card.picture
- id: ST07.F4.n1
  template: T05
  level: 2
  skill:
  - SK-ST07-4
  - SK-ST07-2
  params:
    mode: continue
    kind: number
    unit:
    - PAT.num1
    - PAT.num2
    repeats_shown: 3
    blanks: 2
    tray:
    - PAT.num1
    - PAT.num2
    read_out: N.001,N.002
  audio:
    pr: ST07.S.continueNum
    h1: ST07.S.pat.h1
    h2: ST07.S.pat.h2
    h3: ST07.S.pat.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: rule
    value: 1-2
  assets:
  - PAT.num1
  - PAT.num2
- id: ST07.F4.n2
  template: T05
  level: 2
  skill:
  - SK-ST07-4
  - SK-ST07-2
  params:
    mode: continue
    kind: number
    unit:
    - PAT.num2
    - PAT.num1
    repeats_shown: 3
    blanks: 2
    tray:
    - PAT.num1
    - PAT.num2
    read_out: N.002,N.001
  audio:
    pr: ST07.S.continueNum
    h1: ST07.S.pat.h1
    h2: ST07.S.pat.h2
    h3: ST07.S.pat.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: rule
    value: 2-1
  assets:
  - PAT.num1
  - PAT.num2
- id: ST07.F4.n3
  template: T05
  level: 2
  skill:
  - SK-ST07-4
  - SK-ST07-2
  params:
    mode: continue
    kind: number
    unit:
    - PAT.num1
    - PAT.num1
    - PAT.num2
    repeats_shown: 2
    blanks: 3
    tray:
    - PAT.num1
    - PAT.num2
    read_out: N.001,N.001,N.002
  audio:
    pr: ST07.S.continueNum
    h1: ST07.S.pat.h1
    h2: ST07.S.pat.h2
    h3: ST07.S.pat.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: rule
    value: 1-1-2
  assets:
  - PAT.num1
  - PAT.num2
- id: ST07.F4.n4
  template: T05
  level: 2
  skill:
  - SK-ST07-4
  - SK-ST07-2
  params:
    mode: continue
    kind: number
    unit:
    - PAT.num2
    - PAT.num2
    - PAT.num1
    repeats_shown: 2
    blanks: 3
    tray:
    - PAT.num1
    - PAT.num2
    read_out: N.002,N.002,N.001
  audio:
    pr: ST07.S.continueNum
    h1: ST07.S.pat.h1
    h2: ST07.S.pat.h2
    h3: ST07.S.pat.h3
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: rule
    value: 2-2-1
  assets:
  - PAT.num1
  - PAT.num2
```

## ۶. بخش ۵ · مهارتت را نشان بده (۵ آیتم، با دو آیتم مرور)

بدون راهنما و بدون سرنخ؛ یک تلاش. دو آیتم مرور از ایستگاه‌های قبلی (ST01 و ST05) برای ثبت «مرور مارپیچی».

```yaml
- id: ST07.P5.i01
  template: T13
  level: 3
  skill:
  - SK-ST07-1
  params:
    glyph: GLYPH.2
    arrows: false
    showStartDot: false
    baseline: true
    hideNumeral: true
    tolerance_dp: 28
  audio:
    pr: ST07.F1.pr.2
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: trace
    value: 2
  assets:
  - GLYPH.2
  - UI.baseline
  notes: عدد نمایش داده نمی‌شود؛ فقط صدا
- id: ST07.P5.i02
  template: T15
  level: 3
  skill:
  - SK-ST07-2
  params:
    stimulus:
      numeral: 1
    options:
    - kind: picture
      count: 3
    - kind: picture
      count: 2
    - kind: picture
      count: 1
    object_kind: OBJ.book
    correct_count: 1
    distractor_rule: عکس‌هایی با ۲ و ۳ شیء
  audio:
    pr: ST07.F3.pr.1
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: count=1
  assets:
  - OBJ.book
  - UI.card.picture
- id: ST07.P5.i03
  template: T05
  level: 3
  skill:
  - SK-ST07-4
  params:
    mode: continue
    kind: number
    unit:
    - PAT.num2
    - PAT.num1
    repeats_shown: 3
    blanks: 2
    tray:
    - PAT.num1
    - PAT.num2
    read_out: N.002,N.001
  audio:
    pr: ST07.S.continueNum
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: rule
    value: ۲ ۱
  assets:
  - PAT.num1
  - PAT.num2
- id: ST07.P5.i04
  template: T15
  level: 3
  skill:
  - SK-ST05-2
  params:
    stimulus:
      objects:
        kind: OBJ.cake5
        count: 5
        removed: 2
    options:
    - kind: dots
      count: 2
    - kind: dots
      count: 3
    - kind: dots
      count: 4
    correct_dots: 3
    distractor_rule: نقطه‌های ۲ و ۴ (خطای شمردن برداشته‌شده‌ها یا افزودن)
  audio:
    pr: ST07.P5.i04.pr
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: option
    value: dots=3
  assets:
  - OBJ.cake5
  - UI.dots
  notes: مرور مفهوم تفریق؛ بدون نمایش عدد؛ ST05
- id: ST07.P5.i05
  template: T01
  level: 3
  skill:
  - SK-ST01-1
  params:
    mode: place
    tray:
      kind: OBJ.ball
      count: 6
    target_zone: UI.tray
    target: 4
    target_card:
      kind: dots
      count: 4
  audio:
    pr: ST07.P5.i05.pr
    h1: ST07.S.place.h1
    h2: ST07.S.place.h2
    ok_generic: G.ok.*
    retry: G.retry.*
  answer:
    type: count_placed
    value: 4
  assets:
  - OBJ.ball
  - UI.dots
  - UI.tray
  notes: مرور شمارش؛ ST01؛ بدون نمایش عدد ۴
```

## ۷. تمرین (S14) و ارزیابی پرش (S13)

```yaml
practice:
  pool: همهٔ استخر بخش ۴ (۲۶ آیتم) + F6 اختیاری (مربع ۴×۴؛ T08؛ ساخته نشد)
  set_size: 6
  rule: دست‌کم یک آیتم مرور از نخ‌های ST01 تا ST06
  hints:
  - h1
  feedback: کامل
jump_test:
  question_count: 1
  pool:
  - id: ST07.PJ.i01
    ref: ST07.F2.top1 تا ST07.F2.ketab2 (یک مورد تصادفی)
    template: T15
    skill:
    - SK-ST07-3
  - id: ST07.PJ.i02
    ref: ST07.F3.p11 تا ST07.F3.p23 (یک مورد تصادفی)
    template: T15
    skill:
    - SK-ST07-2
  - id: ST07.PJ.i03
    ref: ST07.F4.n1 تا ST07.F4.n4 (یک مورد تصادفی)
    template: T05
    skill:
    - SK-ST07-4
  rules: یک تلاش، بدون بازخورد وسط کار، بدون راهنما و بدون پاداش
```

## ۸. جدول صدا (ST07)

همهٔ متن‌ها از قواعد ۱٫۵ مرجع مشترک پیروی می‌کنند (بدون رقم در متن گفتار). خط‌های عمومی `G.*` و عددها `N.*` در فایل CSV جهانی‌اند.

| شناسه | نوع | متن نمایشی | متن گفتار (TTS) |
|---|---|---|---|
| `ST07.P1.s00.pr` | pr | امروز با دو عدد تازه آشنا می‌شویم: ۱ و ۲. | امروز با دو عدد تازه آشنا می‌شویم: یک و دو. |
| `ST07.P1.s01.pr` | pr | اینها هر کدام یکی هستند. لمسشان کن. | اینها هر کدام یکی هستند. لمسشان کن. |
| `ST07.P1.s01.a` | label | یک خورشید. | یک خورشید. |
| `ST07.P1.s01.b` | label | یک خانه. | یک خانه. |
| `ST07.P1.s01.c` | label | یک درخت. | یک درخت. |
| `ST07.P1.s01.done` | ex | همه‌شان ۱ تا هستند. این نشانهٔ عدد ۱ است. | همه‌شان یک تا هستند. این نشانهٔ عدد یک است. |
| `ST07.P1.s02.pr` | pr | اینها هر کدام دوتا هستند. لمسشان کن. | اینها هر کدام دوتا هستند. لمسشان کن. |
| `ST07.P1.s02.a` | label | دو چشم. | دو چشم. |
| `ST07.P1.s02.b` | label | دو کفش. | دو کفش. |
| `ST07.P1.s02.c` | label | دو چرخ. | دو چرخ. |
| `ST07.P1.s02.done` | ex | همه‌شان ۲ تا هستند. این نشانهٔ عدد ۲ است. | همه‌شان دو تا هستند. این نشانهٔ عدد دو است. |
| `ST07.P1.s03.pr` | pr | حالا با هم تمرین می‌کنیم. | حالا با هم تمرین می‌کنیم. |
| `ST07.S.trace.h1` | hint | از نقطهٔ سبز شروع کن. | از نقطهٔ سبز شروع کن. |
| `ST07.S.trace.h2` | hint | اول ببین، بعد بکش. | اول ببین، بعد بکش. |
| `ST07.S.trace.h3` | hint | با هم می‌کشیم. | با هم می‌کشیم. |
| `ST07.S.pick.h1` | hint | به شکل‌ها نگاه کن و مقایسه کن. | به شکل‌ها نگاه کن و مقایسه کن. |
| `ST07.S.pick.h2` | hint | یکی از گزینه‌ها کنار رفت. | یکی از گزینه‌ها کنار رفت. |
| `ST07.S.pick.h3` | hint | ببین؛ این گزینه درست است. | ببین؛ این گزینه درست است. |
| `ST07.S.pat.h1` | hint | به قسمت اول الگو نگاه کن. | به قسمت اول الگو نگاه کن. |
| `ST07.S.pat.h2` | hint | بخش اول را دوباره نشان می‌دهم. | بخش اول را دوباره نشان می‌دهم. |
| `ST07.S.pat.h3` | hint | ببین، الگو این‌طور ادامه می‌یابد. | ببین، الگو این‌طور ادامه می‌یابد. |
| `ST07.S.place.h1` | hint | از سینی بردار و روی صحنه بگذار. | از سینی بردار و روی صحنه بگذار. |
| `ST07.S.place.h2` | hint | بشمار؛ همین‌قدر بگذار. | بشمار؛ همین‌قدر بگذار. |
| `ST07.S.place.h3` | hint | با هم می‌گذاریم و می‌شماریم. | با هم می‌گذاریم و می‌شماریم. |
| `ST07.S.continue` | pr | الگو را ادامه بده. | الگو را ادامه بده. |
| `ST07.S.continueNum` | pr | عددها را گوش کن و الگو را ادامه بده. | عددها را گوش کن و الگو را ادامه بده. |
| `ST07.S.line` | pr | خط را به همان شکل ادامه بده. | خط را به همان شکل ادامه بده. |
| `ST07.S.unit` | pr | کدام قسمت تکرار می‌شود؟ دور آن را بکش. | کدام قسمت تکرار می‌شود؟ دور آن را بکش. |
| `ST07.S.cake` | pr | کیک تولد را با الگو تزیین می‌کنیم. | کیک تولد را با الگو تزیین می‌کنیم. |
| `ST07.F1.pr.1` | pr | عدد ۱ را بنویس. | عدد یک را بنویس. |
| `ST07.F1.pr.2` | pr | عدد ۲ را بنویس. | عدد دو را بنویس. |
| `ST07.F2.pr.top` | pr | چند توپ می‌بینی؟ جواب را انتخاب کن. | چند توپ می‌بینی؟ جواب را انتخاب کن. |
| `ST07.F2.pr.kafsh` | pr | چند کفش می‌بینی؟ جواب را انتخاب کن. | چند کفش می‌بینی؟ جواب را انتخاب کن. |
| `ST07.F2.pr.gol` | pr | چند گل می‌بینی؟ جواب را انتخاب کن. | چند گل می‌بینی؟ جواب را انتخاب کن. |
| `ST07.F2.pr.medad` | pr | چند مداد می‌بینی؟ جواب را انتخاب کن. | چند مداد می‌بینی؟ جواب را انتخاب کن. |
| `ST07.F2.pr.mahi` | pr | چند ماهی می‌بینی؟ جواب را انتخاب کن. | چند ماهی می‌بینی؟ جواب را انتخاب کن. |
| `ST07.F2.pr.ketab` | pr | چند کتاب می‌بینی؟ جواب را انتخاب کن. | چند کتاب می‌بینی؟ جواب را انتخاب کن. |
| `ST07.F3.pr.1` | pr | کدام عکس ۱ تا دارد؟ | کدام عکس یک تا دارد؟ |
| `ST07.F3.pr.2` | pr | کدام عکس ۲ تا دارد؟ | کدام عکس دو تا دارد؟ |
| `ST07.P2.i03.pr` | pr | عدد ۱ را از نقطهٔ سبز بنویس. | عدد یک را از نقطهٔ سبز بنویس. |
| `ST07.P2.i04.pr` | pr | عدد ۲ را از نقطهٔ سبز بنویس. | عدد دو را از نقطهٔ سبز بنویس. |
| `ST07.P2.i07.pr` | pr | یک گل در گلدان بگذار. | یک گل در گلدان بگذار. |
| `ST07.P2.i08.pr` | pr | دو مداد در جامدادی بگذار. | دو مداد در جامدادی بگذار. |
| `ST07.P2.i01.ok` | ok | همین‌طور است؛ یک توپ. | همین‌طور است؛ یک توپ. |
| `ST07.P2.i02.ok` | ok | همین‌طور است؛ دو کفش. | همین‌طور است؛ دو کفش. |
| `ST07.P2.i03.ok` | ok | یک را درست نوشتی. | یک را درست نوشتی. |
| `ST07.P2.i04.ok` | ok | دو را درست نوشتی. | دو را درست نوشتی. |
| `ST07.P2.i05.ok` | ok | این عکس دو تا دارد. | این عکس دو تا دارد. |
| `ST07.P2.i06.ok` | ok | این عکس یک تا دارد. | این عکس یک تا دارد. |
| `ST07.P2.i07.ok` | ok | یک گل گذاشتی. | یک گل گذاشتی. |
| `ST07.P2.i08.ok` | ok | دو مداد گذاشتی. | دو مداد گذاشتی. |
| `ST07.P5.i04.pr` | pr | — | کیک پنج تکه داشت. دو تکه برداشتند. چند تکه مانده؟ |
| `ST07.P5.i05.pr` | pr | به اندازهٔ نقطه‌ها توپ بگذار. | به اندازهٔ نقطه‌ها توپ بگذار. |

## ۹. دارایی‌ها (همه تازه؛ بدون عکس کتاب)

| شناسه | نوع | توضیح |
|---|---|---|
| `OBJ.sun` | illustration | خورشید ساده و گرد، رنگ گرم، بدون صورت |
| `OBJ.house` | illustration | خانهٔ کوچک با در و پنجره |
| `OBJ.tree` | illustration | درخت با تنه و پوشش سبز گرد |
| `OBJ.eyes` | illustration | یک جفت چشم کارتونی کنار هم (روی صورت ساده) |
| `OBJ.shoes` | illustration | یک جفت کفش بچه |
| `OBJ.wheels` | illustration | دو چرخ یک دوچرخه (نمای کناری) |
| `OBJ.ball` | illustration | توپ رنگی راه‌راه |
| `OBJ.shoe` | illustration | یک لنگه کفش |
| `OBJ.flower` | illustration | گل ساده با ساقه |
| `OBJ.pencil` | illustration | مداد رنگی |
| `OBJ.fish` | illustration | ماهی کوچک |
| `OBJ.book` | illustration | کتاب بسته |
| `OBJ.pot` | illustration | گلدان باز برای گذاشتن گل |
| `OBJ.pencilcase` | illustration | جامدادی باز |
| `OBJ.cake5` | illustration | کیک گرد با پنج تکهٔ مساوی (نسخهٔ دو تکه برداشته‌شده هم لازم است) |
| `OBJ.cakeborder` | illustration | حاشیهٔ کیک با جای‌های خالی الگو |
| `GLYPH.1` | glyph | مسیر نقطه‌چین نماد ۱ با نقطهٔ شروع سبز، فلش جهت (بالا به پایین) و خط زمینه |
| `GLYPH.2` | glyph | مسیر نقطه‌چین نماد ۲ با نقطهٔ شروع سبز، فلش جهت و خط زمینه |
| `UI.card.numeral` | ui | کارت بزرگ ۸۰dp با عدد ۱ یا ۲ (قلم درشت) |
| `UI.card.picture` | ui | قاب کارت تصویر برای انتخاب گزینه |
| `UI.tray` | ui | سینی اشیا برای برداشتن |
| `UI.dots` | ui | کارت نقطه (تعداد ۱ تا ۵ نقطهٔ رنگی) |
| `UI.baseline` | ui | خط زمینه برای نوشتن نماد |
| `UI.bracket` | ui | کادر نرم برای دور زدن واحد تکرارشونده |
| `PAT.circle` | pattern | دایرهٔ رنگی |
| `PAT.square` | pattern | مربع رنگی |
| `PAT.triangle` | pattern | مثلث رنگی |
| `PAT.pink` | pattern | دایرهٔ صورتی |
| `PAT.green` | pattern | دایرهٔ سبز |
| `PAT.num1` | pattern | کاشی با عدد ۱ |
| `PAT.num2` | pattern | کاشی با عدد ۲ |
| `PAT.up` | pattern | پارهٔ خط رو به بالا |
| `PAT.down` | pattern | پارهٔ خط رو به پایین |
| `PAT.flat` | pattern | پارهٔ خط افقی |
| `CH.guide.idle` | character | راهنما، حالت idle (طبق بریف شخصیت‌ها) |
| `CH.guide.think` | character | راهنما، حالت think (طبق بریف شخصیت‌ها) |
| `CH.guide.encourage` | character | راهنما، حالت encourage (طبق بریف شخصیت‌ها) |
| `CH.guide.correct` | character | راهنما، حالت correct (طبق بریف شخصیت‌ها) |
| `CH.guide.retry` | character | راهنما، حالت retry (طبق بریف شخصیت‌ها) |
| `CH.guide.celebrate` | character | راهنما، حالت celebrate (طبق بریف شخصیت‌ها) |
| `CH.guide.half` | character | راهنما، حالت half (طبق بریف شخصیت‌ها) |

**قواعد هنری:** بدون متن و عدد داخل تصویر (به‌جز نماد ۱ و ۲ در `GLYPH.*` و `PAT.num*`)؛ بدون ستاره، تاج، سکه، جام، قلب و آتش (قرارداد محصول). رنگ‌ها طبق PALETTE.

## ۱۰. معیار تسلط و ثبت داده

- **مهارت‌ها:** `SK-ST07-1` تا `-4`؛ نگاشت آیتم‌ها در YAML هر آیتم.
- **تسلط:** در بخش ۴، ۳ از ۴ آیتم درست (یک آیتم از هر خانواده). در صورت ناکامی: بازیابی کوتاه روی خانوادهٔ ناموفق، سپس بررسی مجدد با آیتم‌های تازه.
- **داده:** رویدادهای `item_start`، `attempt`، `hint`، `replay_audio`، `item_end`، `round_end` و `audio_missing` (مرجع مشترک ۶٫۴). برای T13 علاوه بر آن: دقت مسیر، جهت و تعداد شکستگی.
- **مرور مارپیچی:** آیتم‌های `P5.i04` و `P5.i05` مهارت‌های ST05 و ST01 را ثبت می‌کنند.

## ۱۱. موارد مرزی

- کودک عدد را از جهت غلط می‌نویسد (مثلاً ۱ از پایین به بالا): بررسی جهت ⇒ دوباره امتحان؛ سرنخ `trace.h2` انیمیشن قلم را نشان می‌دهد.
- کودک نقطهٔ سبز را رد می‌کند و از جای دیگر شروع می‌کند: مسیر با تلرانس ۲۸dp بررسی می‌شود؛ شروع نادرست = دوباره.
- در `P2.i07` و `P2.i08` سینی بیش از هدف شیء دارد (۳ گل، ۴ مداد)؛ اگر بیشتر از هدف گذاشت ⇒ دوباره؛ اگر کمتر ⇒ دکمهٔ «تمام» فعال نمی‌شود.
- در `P3.r03` و `P3.r04` اگر صدا هنوز عددها را می‌خواند و کودک لمس کند، صدا قطع نمی‌شود و لمس ثبت می‌شود.
- صدای یک خط موجود نیست: متن نمایشی نشان داده شود، بی‌صدا ادامه یابد، رویداد `audio_missing` ثبت شود.
- حالت کاهش حرکت: انیمیشن نوشتن عدد در `P1` حذف و نماد کامل نشان داده شود؛ `P3` الگو بدون حرکت پرش جای می‌گیرد.
- قطع برنامه وسط ایستگاه: از ابتدای همان بخش ادامه (نه آیتم) تا نتیجهٔ ناقص ثبت نشود.
- نمایش عددهای بزرگ‌تر از ۲ در متن نمایشی ممنوع است (در `P5.i04` و `P5.i05` فقط نقطه و تصویر).

## ۱۲. آزمون پذیرش ایستگاه

1. `P1` بدون لمس کودک: صدای دستور ۸ ثانیه بعد دوباره پخش می‌شود و ادامه نمی‌یابد.
2. همهٔ ۸ آیتم `P2` با پاسخ درست ⇒ ۸ بار تأیید و عبور به `P3`.
3. در `P2.i01` سه اشتباه پیاپی ⇒ `retry`، سپس `h1`+نبض، سپس `h2`؛ آیتم «کمک‌شده» ثبت شود و در تسلط نیاید.
4. در `P3` با پاسخ‌های سازگار قانون ولی متفاوت از نمونه (مثلاً دایره/مربع جایگزین) پذیرفته شود فقط اگر الگو را حفظ کند.
5. بخش ۴ همیشه ۴ آیتم، یکی از هر خانواده، بدون تکرار آیتم‌های تلاش قبلی.
6. بخش ۴ و ۵: هیچ سرنخ، هیچ راهنما و هیچ `SFX.win` دیده نشود.
7. تأیید صوتی: هیچ متن گفتار شامل رقم نیست؛ هیچ واژهٔ «غلط/اشتباه» در صدا نیست.
8. آفلاین: همهٔ خط‌های ST07 و `N.001`، `N.002` از حافظه بارگیری می‌شوند.
9. نمایش: هدف‌های لمسی ≥ ۷۲dp؛ فاصلهٔ ≥ ۱۶dp؛ دور از لبه ≥ ۲۴dp.
10. کاهش حرکت: هیچ انیمیشن حلقوی یا پرشی؛ رفتار معادل برقرار.

## ۱۳. گزارش اعتبارسنجی خودکار

- خطاهای اعتبارسنجی: **0**
- خط‌های ST07: 53؛ خط‌های بدون ارجاع: 0
- آیتم‌های صریح: بخش ۲: 8؛ بخش ۳: 6؛ استخر بخش ۴: 26؛ بخش ۵: 5؛ پرش: 3
- آیتم یکتا: 45 (بودجهٔ مرحلهٔ ۴: حدود ۵۰)
- قواعد بررسی‌شده: رقم در متن گفتار، حروف لاتین، واژه‌های ممنوع («غلط»، «اشتباه»)، طول متن (≤ ۱۰ واژه؛ روایت ≤ ۱۴)، عدد نمایشی آموزش‌داده‌نشده، یکتایی شناسه‌ها، وجود الگو، وجود خط صوتی و دارایی ارجاع‌شده، عناصر هنری ممنوع.

## ۱۴. یافته‌های پایلوت و به‌روزرسانی مرجع مرحلهٔ ۵

- الگوی T01 به حالت‌های `discover` (کشف بدون ارزیابی) و `place` («بگذار») نیاز داشت و `mode` به پارامترها اضافه شد.
- T13 به پارامترهای `arrows` و `hideNumeral` (نوشتن از روی صدا بدون دیدن عدد) نیاز داشت.
- T15 باید دو گزینه را هم بپذیرد (ST07: فقط ۱ و ۲) و انواع گزینه `numeral`، `picture`، `dots` و محرک `stimulus` را تعریف کند.
- قاعدهٔ «در متن نمایشی فقط عددهای آموزش‌داده‌شده» به اعتبارسنج و مرجع افزوده شد.
- برای مرور مارپیچی باید بتوان در بخش ۵ مهارت ایستگاه‌های قبل را ثبت کرد؛ `skill` می‌تواند شناسهٔ ایستگاه دیگر باشد.
- خط‌های پرتکرار (سرنخ‌ها) در فضای `ST07.S.*` مشترک شدند تا تعداد فایل‌های TTS کم شود.
- مرور مارپیچی بدون نمایش عدد (نقطه و تصویر) انجام شد، چون کودک هنوز عددهای بزرگ‌تر از ۲ را ننوشته است؛ این الگو برای ایستگاه‌های ۷ تا ۱۰ تکرار شود.
