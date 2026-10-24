# Grade 1 Skill Graph + Station Contract — v0.27

**نسخه:** `v0.27`  
**نوع سند:** Grade-Specific Learning Artifact / Skill Graph + Station Contract  
**تاریخ:** ۲۴ سپتامبر ۲۰۲۶  
**دامنه:** Grade 1 V1 / Shared Platform Core برای Grades 1–6

> این سند نخستین artifact اجرایی Grade 1 است که Skill و Station را از placeholder به قرارداد قابل seed/test تبدیل می‌کند. ساختار ۲۵ Station و ترتیب آن‌ها `SOURCE-DERIVED` است؛ taxonomy دقیق ۶۴ Skill، خانواده‌ها و نگاشت دقیق در این سند `PROVISIONAL / DERIVED` هستند تا review آموزشی انجام شود.

---

## 0. وضعیت اعتماد

| Label | معنی |
|---|---|
| `LOCKED` | قرارداد دامنه/فنی که runtime و database باید رعایت کنند. |
| `SOURCE-DERIVED` | از ساختار/فعالیت منبع C105 یا صفحه رسمی معرفی کتاب استخراج/تلخیص شده است. |
| `PROVISIONAL / DERIVED` | decomposition یا نام‌گذاری داخلی ما؛ منبع رسمی آن را به‌عنوان taxonomy canonical 64تایی ارائه نکرده است. |
| `OPEN` | در v0.28/v0.29 یا review آموزشی تعیین می‌شود. |

### Gate این نسخه

- `25 Stations` و sequence `1..25` → `SOURCE-DERIVED`
- `64 Skills` → `PROVISIONAL / DERIVED` تا review
- relation vocabulary و persistence shape → `LOCKED` مطابق v0.22/v0.23
- Station Contract مشترک → `LOCKED`
- mastery/pass threshold → خارج از scope، deferred به v0.29

---

## 1. هدف سند

این سند چهار ambiguity را می‌بندد:

1. taxonomy و identity مهارت‌ها؛
2. پوشش 25 Station و نقش PRIMARY/SUPPORTING؛
3. prerequisite graph قابل‌تست؛
4. قرارداد Station بدون تبدیل Station به source of truth یادگیری.

```text
Station = experience / navigation boundary
Skill   = learning / evidence / decision unit
```

---

## 2. مبنای منبع

- صفحه رسمی رشد، کتاب ریاضی اول دبستان را دارای 25 بخش معرفی می‌کند و برای هر بخش یک صفحه آغازین تصویری و 6 صفحه آموزشی توضیح می‌دهد. `SOURCE-DERIVED`.
- متن/اسکن C105 برای توالی و هدف/فعالیت هر بخش استفاده شده است؛ متن/تصویر کتاب در این artifact کپی نمی‌شود. `SOURCE-DERIVED`.
- در v0.21–v0.26 عدد «64 Skill» موجود بود، اما list canonical داخل artifactها وجود نداشت؛ بنابراین list این فایل یک decomposition داخلی است و باید review شود.

---

## 3. Grade 1 Package Contract

```text
GradePackage
├── GradeDefinition
├── CurriculumVersion
├── SkillGraphVersion
│   ├── Skill (64)
│   ├── SkillFamily (8)
│   └── SkillRelation
├── Station (25)
│   └── StationSkill
├── DiagnosticSet        → v0.29
├── ContentCatalog        → v0.28
├── PassPolicy            → v0.29
├── RecoveryPolicy        → v0.29
├── AgeProfile
└── ProgressionConfig
```

هر Session باید حداقل `grade_id + curriculum_version_id + skill_graph_version_id` را pin کند. Graph version جدید historical evidence را overwrite نمی‌کند.

---

## 4. Skill Families — 8 خانواده

| Family | English | فارسی | Count |
|---|---|---|---:|
| `F01` `COUNT` | Counting & Cardinality | شمارش و کاردینالیته | 8 |
| `F02` `PATTERN` | Patterns & Structure | الگو و ساختار | 7 |
| `F03` `NUM` | Number Representation & Place Value | بازنمایی عدد و ارزش مکانی | 9 |
| `F04` `ADD` | Addition & Subtraction | جمع و تفریق | 10 |
| `F05` `COMPARE` | Comparison & Equality | مقایسه و برابری | 6 |
| `F06` `GEO` | Geometry, Spatial & Symmetry | هندسه، فضا و تقارن | 8 |
| `F07` `MEASURE` | Measurement & Time | اندازه‌گیری و زمان | 8 |
| `F08` `PROBLEM` | Problem Solving, Reasoning & Representation | حل مسئله، استدلال و بازنمایی | 8 |
| **Total** | | | **64** |

> Family یک policy boundary است، نه سطح mastery. thresholdها در v0.29 می‌آیند.

---

## 5. Canonical Skill Catalogue — 64 Skills

| Code | Family | Skill title | Primary Station | Status |
|---|---|---|---|---|
| `G1-SK001` | `F01` شمارش و کاردینالیته | شمارش اشیاء تا ۵ با ترتیب پایدار | `G1-ST01` | `PROVISIONAL / DERIVED` |
| `G1-SK002` | `F01` شمارش و کاردینالیته | تناظر یک‌به‌یک بین اشیاء و شمارش | `G1-ST01` | `PROVISIONAL / DERIVED` |
| `G1-SK003` | `F01` شمارش و کاردینالیته | درک کاردینالیته و اینکه عدد آخر بیانگر کل کمیت است | `G1-ST01` | `PROVISIONAL / DERIVED` |
| `G1-SK004` | `F01` شمارش و کاردینالیته | تشخیص سریع کمیت‌های کوچک بدون شمارش تک‌به‌تک (تا ۴) | `G1-ST01` | `PROVISIONAL / DERIVED` |
| `G1-SK005` | `F01` شمارش و کاردینالیته | نمایش کمیت با انگشتان | `G1-ST01` | `PROVISIONAL / DERIVED` |
| `G1-SK006` | `F01` شمارش و کاردینالیته | ترکیب و تفکیک کمیت‌های کوچک | `G1-ST03` | `PROVISIONAL / DERIVED` |
| `G1-SK007` | `F01` شمارش و کاردینالیته | شمارش رو به جلو و عقب در بازه ۰ تا ۲۰ | `G1-ST16` | `PROVISIONAL / DERIVED` |
| `G1-SK008` | `F01` شمارش و کاردینالیته | شمارش چندتایی و گروهی بر اساس الگو (۲، ۵، ۶، ۷، ۸، ۱۰) | `G1-ST23` | `PROVISIONAL / DERIVED` |
| `G1-SK009` | `F02` الگو و ساختار | تشخیص الگوی تکرارشونده تصویری | `G1-ST01` | `PROVISIONAL / DERIVED` |
| `G1-SK010` | `F02` الگو و ساختار | ادامه و کپی الگوی تصویری | `G1-ST01` | `PROVISIONAL / DERIVED` |
| `G1-SK011` | `F02` الگو و ساختار | بیان و تشخیص قانون الگو | `G1-ST01` | `PROVISIONAL / DERIVED` |
| `G1-SK012` | `F02` الگو و ساختار | تکمیل الگوهای شطرنجی و جدولی | `G1-ST02` | `PROVISIONAL / DERIVED` |
| `G1-SK013` | `F02` الگو و ساختار | تشخیص و ادامه دنباله عددی/الگوی عددی | `G1-ST18` | `PROVISIONAL / DERIVED` |
| `G1-SK014` | `F02` الگو و ساختار | ارتباط الگوی عددی و الگوی هندسی | `G1-ST18` | `PROVISIONAL / DERIVED` |
| `G1-SK015` | `F02` الگو و ساختار | تکمیل نظام‌مند جدول یا الگوی دارای خانه خالی | `G1-ST15` | `PROVISIONAL / DERIVED` |
| `G1-SK016` | `F03` بازنمایی عدد و ارزش مکانی | تشخیص نمادهای ۰ تا ۵ | `G1-ST07` | `PROVISIONAL / DERIVED` |
| `G1-SK017` | `F03` بازنمایی عدد و ارزش مکانی | نوشتن و بازنمایی نمادهای ۰ تا ۵ | `G1-ST07` | `PROVISIONAL / DERIVED` |
| `G1-SK018` | `F03` بازنمایی عدد و ارزش مکانی | تشخیص و نوشتن نمادهای ۶ تا ۹ | `G1-ST10` | `PROVISIONAL / DERIVED` |
| `G1-SK019` | `F03` بازنمایی عدد و ارزش مکانی | نمایش و نوشتن اعداد ۱۰ تا ۲۰ | `G1-ST16` | `PROVISIONAL / DERIVED` |
| `G1-SK020` | `F03` بازنمایی عدد و ارزش مکانی | نمایش یک عدد به چند صورت: شیء، تصویر، انگشت، چوب‌خط و نماد | `G1-ST03` | `PROVISIONAL / DERIVED` |
| `G1-SK021` | `F03` بازنمایی عدد و ارزش مکانی | تجزیه و ترکیب عددهای ۲ تا ۱۰ به جمع‌های سازنده | `G1-ST13` | `PROVISIONAL / DERIVED` |
| `G1-SK022` | `F03` بازنمایی عدد و ارزش مکانی | ساخت و تفسیر گروه‌های ده‌تایی و یکی | `G1-ST19` | `PROVISIONAL / DERIVED` |
| `G1-SK023` | `F03` بازنمایی عدد و ارزش مکانی | خواندن و نوشتن اعداد دو رقمی ۱۰ تا ۹۹ با ده‌تایی و یکی | `G1-ST20` | `PROVISIONAL / DERIVED` |
| `G1-SK024` | `F03` بازنمایی عدد و ارزش مکانی | نمایش و تفسیر عدد ۱۰۰ با مدل ارزش مکانی | `G1-ST25` | `PROVISIONAL / DERIVED` |
| `G1-SK025` | `F04` جمع و تفریق | درک جمع به‌عنوان ترکیب دو مقدار | `G1-ST03` | `PROVISIONAL / DERIVED` |
| `G1-SK026` | `F04` جمع و تفریق | حل جمع تا ۵ با اشیا و مدل عینی | `G1-ST05` | `PROVISIONAL / DERIVED` |
| `G1-SK027` | `F04` جمع و تفریق | حل جمع تا ۱۰ با اشیا و انگشت | `G1-ST06` | `PROVISIONAL / DERIVED` |
| `G1-SK028` | `F04` جمع و تفریق | نوشتن تساوی جمع متناظر با یک مدل | `G1-ST13` | `PROVISIONAL / DERIVED` |
| `G1-SK029` | `F04` جمع و تفریق | یافتن ترکیب‌هایی که یک عدد هدف تا ۱۰ را می‌سازند | `G1-ST13` | `PROVISIONAL / DERIVED` |
| `G1-SK030` | `F04` جمع و تفریق | جمع چندین مقدار یا ترکیب چندبخشی | `G1-ST17` | `PROVISIONAL / DERIVED` |
| `G1-SK031` | `F04` جمع و تفریق | درک تفریق به‌عنوان برداشتن/کم‌کردن | `G1-ST05` | `PROVISIONAL / DERIVED` |
| `G1-SK032` | `F04` جمع و تفریق | حل تفریق تا ۵ با اشیا و انگشت | `G1-ST06` | `PROVISIONAL / DERIVED` |
| `G1-SK033` | `F04` جمع و تفریق | نوشتن تساوی تفریق متناظر با یک مدل | `G1-ST14` | `PROVISIONAL / DERIVED` |
| `G1-SK034` | `F04` جمع و تفریق | اجرای جمع و تفریق روی محور اعداد تا ۱۰ | `G1-ST14` | `PROVISIONAL / DERIVED` |
| `G1-SK035` | `F05` مقایسه و برابری | مقایسه تعداد با تناظر یک‌به‌یک | `G1-ST10` | `PROVISIONAL / DERIVED` |
| `G1-SK036` | `F05` مقایسه و برابری | مقایسه عددها با کمتر/بیشتر و نشانه‌های < و > | `G1-ST12` | `PROVISIONAL / DERIVED` |
| `G1-SK037` | `F05` مقایسه و برابری | درک برابری به‌عنوان یکسان بودن مقدار/تعداد | `G1-ST11` | `PROVISIONAL / DERIVED` |
| `G1-SK038` | `F05` مقایسه و برابری | مقایسه مستقیم طول/قد با زبان بلندتر، کوتاه‌تر و هم‌اندازه | `G1-ST14` | `PROVISIONAL / DERIVED` |
| `G1-SK039` | `F05` مقایسه و برابری | مقایسه طول با استفاده از واحدهای غیراستاندارد | `G1-ST14` | `PROVISIONAL / DERIVED` |
| `G1-SK040` | `F05` مقایسه و برابری | مقایسه حاصل عبارت‌ها یا نتایج با <، > و = | `G1-ST12` | `PROVISIONAL / DERIVED` |
| `G1-SK041` | `F06` هندسه، فضا و تقارن | تشخیص شکل‌های هندسی پایه در محیط و تصویر | `G1-ST04` | `PROVISIONAL / DERIVED` |
| `G1-SK042` | `F06` هندسه، فضا و تقارن | تشخیص گوشه و ضلع | `G1-ST04` | `PROVISIONAL / DERIVED` |
| `G1-SK043` | `F06` هندسه، فضا و تقارن | رده‌بندی و تفکیک شکل بر اساس ویژگی‌ها | `G1-ST04` | `PROVISIONAL / DERIVED` |
| `G1-SK044` | `F06` هندسه، فضا و تقارن | ساخت/رسم شکل با شابلون و خط‌کش | `G1-ST04` | `PROVISIONAL / DERIVED` |
| `G1-SK045` | `F06` هندسه، فضا و تقارن | تشخیص تقارن نسبت به یک خط | `G1-ST06` | `PROVISIONAL / DERIVED` |
| `G1-SK046` | `F06` هندسه، فضا و تقارن | تکمیل نیمه قرینه یک شکل | `G1-ST09` | `PROVISIONAL / DERIVED` |
| `G1-SK047` | `F06` هندسه، فضا و تقارن | درک موقعیت‌های چپ/راست/بالا/پایین/جلو/پشت | `G1-ST02` | `PROVISIONAL / DERIVED` |
| `G1-SK048` | `F06` هندسه، فضا و تقارن | درک ردیف، ستون، اول، وسط، کنار و بین | `G1-ST01` | `PROVISIONAL / DERIVED` |
| `G1-SK049` | `F07` اندازه‌گیری و زمان | اجرای اندازه‌گیری طول با واحدهای غیراستاندارد | `G1-ST08` | `PROVISIONAL / DERIVED` |
| `G1-SK050` | `F07` اندازه‌گیری و زمان | تخمین طول با واحد یا مرجع مناسب | `G1-ST17` | `PROVISIONAL / DERIVED` |
| `G1-SK051` | `F07` اندازه‌گیری و زمان | مقایسه طول‌های اندازه‌گیری‌شده و بیان رابطه | `G1-ST21` | `PROVISIONAL / DERIVED` |
| `G1-SK052` | `F07` اندازه‌گیری و زمان | تشخیص ساعت دقیق | `G1-ST16` | `PROVISIONAL / DERIVED` |
| `G1-SK053` | `F07` اندازه‌گیری و زمان | چینش و نوشتن اعداد روی صفحه ساعت | `G1-ST16` | `PROVISIONAL / DERIVED` |
| `G1-SK054` | `F07` اندازه‌گیری و زمان | ارتباط صفحه ساعت با الگوی عددی/محور شمارش | `G1-ST18` | `PROVISIONAL / DERIVED` |
| `G1-SK055` | `F07` اندازه‌گیری و زمان | درک ترتیب زمانی و فاصله زمانی تقریبی | `G1-ST24` | `PROVISIONAL / DERIVED` |
| `G1-SK056` | `F07` اندازه‌گیری و زمان | استفاده از تقویم و ترتیب روزها/زمان‌ها | `G1-ST22` | `PROVISIONAL / DERIVED` |
| `G1-SK057` | `F08` حل مسئله، استدلال و بازنمایی | حل مسئله‌های ساده جمعی و تفریقی با مدل | `G1-ST14` | `PROVISIONAL / DERIVED` |
| `G1-SK058` | `F08` حل مسئله، استدلال و بازنمایی | انتخاب یا ساخت نمایش مناسب: اشیا، رسم، چوب‌خط یا محور | `G1-ST03` | `PROVISIONAL / DERIVED` |
| `G1-SK059` | `F08` حل مسئله، استدلال و بازنمایی | تبدیل بین مدل و عبارت نمادی | `G1-ST13` | `PROVISIONAL / DERIVED` |
| `G1-SK060` | `F08` حل مسئله، استدلال و بازنمایی | حل جدول/مربع شگفت‌انگیز با حدس، آزمون و استدلال | `G1-ST03` | `PROVISIONAL / DERIVED` |
| `G1-SK061` | `F08` حل مسئله، استدلال و بازنمایی | تشخیص کافی یا ناکافی بودن اطلاعات مسئله | `G1-ST25` | `PROVISIONAL / DERIVED` |
| `G1-SK062` | `F08` حل مسئله، استدلال و بازنمایی | حل مسئله چندمرحله‌ای در محدوده پایه اول | `G1-ST24` | `PROVISIONAL / DERIVED` |
| `G1-SK063` | `F08` حل مسئله، استدلال و بازنمایی | توضیح قانون یک الگو یا راه‌حل با زبان کودک | `G1-ST18` | `PROVISIONAL / DERIVED` |
| `G1-SK064` | `F08` حل مسئله، استدلال و بازنمایی | انتخاب راهبرد مناسب بین مدل عینی، تصویری، محور و نمادین | `G1-ST24` | `PROVISIONAL / DERIVED` |

### 5.1 Skill contract

- identity = کد پایدار؛
- learning_intent = توانایی/تصمیم آموزشی، نه متن سؤال؛
- family = policy context؛
- prerequisite = رابطه قابل استفاده برای decision/recovery؛
- station coverage = محل‌های جمع‌آوری evidence؛
- state = در Learning State runtime، نه داخل Skill record.

---

## 6. Skill Relation Contract

| Relation | Runtime meaning | Blocking؟ |
|---|---|---|
| `PREREQUISITE` | source برای اتکا به target پایه‌تر وابسته است. | بله، بالقوه |
| `SUPPORTING` | پشتیبان/تقویت‌کننده است، نه gate. | خیر |
| `RELATED` | نزدیکی مفهومی/انتقالی برای review/interleave. | خیر |

Direction: `source --PREREQUISITE--> target` یعنی source به target وابسته است.

### 6.1 Runtime use

- V1 Learning Engine عمدتاً prerequisite را برای Candidate/Recovery مصرف می‌کند.
- supporting/related نباید به‌تنهایی path را block کنند.
- related از نظر معنایی symmetric است؛ persistence می‌تواند یک جهت canonical نگه دارد.

---

## 7. Prerequisite Graph

| Source | Prerequisite target(s) |
|---|---|
| `G1-SK002` | `G1-SK001` |
| `G1-SK003` | `G1-SK002` |
| `G1-SK004` | `G1-SK001` |
| `G1-SK005` | `G1-SK001` |
| `G1-SK006` | `G1-SK003` |
| `G1-SK007` | `G1-SK003` |
| `G1-SK008` | `G1-SK007` |
| `G1-SK010` | `G1-SK009` |
| `G1-SK011` | `G1-SK009`, `G1-SK010` |
| `G1-SK012` | `G1-SK009` |
| `G1-SK013` | `G1-SK007` |
| `G1-SK014` | `G1-SK013`, `G1-SK010` |
| `G1-SK015` | `G1-SK013`, `G1-SK011` |
| `G1-SK016` | `G1-SK003` |
| `G1-SK017` | `G1-SK016` |
| `G1-SK018` | `G1-SK017` |
| `G1-SK019` | `G1-SK007`, `G1-SK017` |
| `G1-SK020` | `G1-SK003` |
| `G1-SK021` | `G1-SK020`, `G1-SK003` |
| `G1-SK022` | `G1-SK001`, `G1-SK008` |
| `G1-SK023` | `G1-SK022` |
| `G1-SK024` | `G1-SK023` |
| `G1-SK025` | `G1-SK003` |
| `G1-SK026` | `G1-SK025`, `G1-SK003` |
| `G1-SK027` | `G1-SK026`, `G1-SK005` |
| `G1-SK028` | `G1-SK027`, `G1-SK017` |
| `G1-SK029` | `G1-SK021` |
| `G1-SK030` | `G1-SK029` |
| `G1-SK031` | `G1-SK003` |
| `G1-SK032` | `G1-SK031`, `G1-SK005` |
| `G1-SK033` | `G1-SK032`, `G1-SK017` |
| `G1-SK034` | `G1-SK007`, `G1-SK027`, `G1-SK032` |
| `G1-SK035` | `G1-SK002`, `G1-SK003` |
| `G1-SK036` | `G1-SK017`, `G1-SK003`, `G1-SK035` |
| `G1-SK037` | `G1-SK035` |
| `G1-SK039` | `G1-SK049`, `G1-SK038` |
| `G1-SK040` | `G1-SK028`, `G1-SK033`, `G1-SK036` |
| `G1-SK042` | `G1-SK041` |
| `G1-SK043` | `G1-SK041`, `G1-SK042` |
| `G1-SK044` | `G1-SK041`, `G1-SK042` |
| `G1-SK045` | `G1-SK041` |
| `G1-SK046` | `G1-SK045` |
| `G1-SK048` | `G1-SK047` |
| `G1-SK049` | `G1-SK038` |
| `G1-SK050` | `G1-SK049` |
| `G1-SK051` | `G1-SK049` |
| `G1-SK053` | `G1-SK052` |
| `G1-SK054` | `G1-SK052`, `G1-SK013` |
| `G1-SK055` | `G1-SK052` |
| `G1-SK056` | `G1-SK055` |
| `G1-SK057` | `G1-SK025`, `G1-SK031` |
| `G1-SK058` | `G1-SK020`, `G1-SK047` |
| `G1-SK059` | `G1-SK028`, `G1-SK033` |
| `G1-SK060` | `G1-SK009`, `G1-SK012`, `G1-SK015` |
| `G1-SK061` | `G1-SK057` |
| `G1-SK062` | `G1-SK057`, `G1-SK058`, `G1-SK059` |
| `G1-SK063` | `G1-SK011`, `G1-SK059` |
| `G1-SK064` | `G1-SK058`, `G1-SK062` |

### 7.1 Structural validation

- nodes = `64`; prerequisite edges = `89`; self-loop = `0`; cycles = `0`.
- این فقط structural validation است؛ pedagogical validity هنوز review می‌خواهد.

### 7.2 Supporting Relations

| Source | Supporting target |
|---|---|
| `G1-SK004` | `G1-SK009` |
| `G1-SK005` | `G1-SK020` |
| `G1-SK008` | `G1-SK013` |
| `G1-SK009` | `G1-SK047` |
| `G1-SK012` | `G1-SK015` |
| `G1-SK020` | `G1-SK025` |
| `G1-SK021` | `G1-SK030` |
| `G1-SK034` | `G1-SK057` |
| `G1-SK038` | `G1-SK051` |
| `G1-SK041` | `G1-SK058` |
| `G1-SK045` | `G1-SK060` |
| `G1-SK047` | `G1-SK063` |
| `G1-SK053` | `G1-SK054` |
| `G1-SK055` | `G1-SK056` |
| `G1-SK060` | `G1-SK063` |
| `G1-SK064` | `G1-SK058` |

### 7.3 Related Relations

| Canonical source | Related target |
|---|---|
| `G1-SK001` | `G1-SK007` |
| `G1-SK009` | `G1-SK013` |
| `G1-SK021` | `G1-SK029` |
| `G1-SK028` | `G1-SK059` |
| `G1-SK033` | `G1-SK059` |
| `G1-SK041` | `G1-SK043` |
| `G1-SK045` | `G1-SK046` |
| `G1-SK052` | `G1-SK054` |
| `G1-SK055` | `G1-SK056` |
| `G1-SK061` | `G1-SK062` |

---

## 8. Station Contract

### 8.1 Shared lifecycle

```text
Station Entry
  ↓
LEARN → GUIDED PRACTICE → CHECK → RESULT
                         │
                         └─ NOT PASS / UNCERTAIN → RECOVERY → RE-CHECK
```

### 8.2 Invariants

- Station = experience boundary؛ Learning State در Skill/Identity context باقی می‌ماند.
- Station Pass ≠ Mastery.
- `4/5 in two separate Checks` operational rule است و implementation/calibration در v0.29 است.
- Recovery هدف آموزشی را نگه می‌دارد و می‌تواند representation/difficulty/path را تغییر دهد.
- sequence فقط source/navigation order است؛ content selection درون Station می‌تواند adaptive باشد.

### 8.3 Definition shape

```yaml
station:
  id: G1-ST01
  grade_id: G1
  curriculum_version_id: <pinned>
  code: G1-ST01
  sequence: 1
  source_reference: C105-Section-01
  opening_board: true
  instructional_page_count: 6
  station_skills:
    - skill_id: G1-SK001
      mapping_role: PRIMARY
      is_decision_target: true
  pass_policy_ref: G1-PASS-V1
  recovery_policy_ref: G1-RECOVERY-V1
  status: ACTIVE
```

> policy refs در این نسخه فقط reference هستند؛ خود policy در v0.29 تعریف می‌شود.

---

## 9. Station Catalogue — 25 Stations

| Seq | Code | Working focus | Source basis | Page model |
|---:|---|---|---|---|
| 1 | `G1-ST01` | الگو، موقعیت و شمارش تا ۵ | C105 Section 1 | opener + pp. `1–6` |
| 2 | `G1-ST02` | جهت و ساختارهای شبکه‌ای | C105 Section 2 | opener + pp. `7–12` |
| 3 | `G1-ST03` | جمع‌های آغازین و نمایش عدد | C105 Section 3 | opener + pp. `13–18` |
| 4 | `G1-ST04` | شکل‌ها، ضلع و گوشه | C105 Section 4 | opener + pp. `19–24` |
| 5 | `G1-ST05` | جمع و تفریق با چوب‌خط | C105 Section 5 | opener + pp. `25–30` |
| 6 | `G1-ST06` | جمع و تفریق با انگشت و شمارنده | C105 Section 6 | opener + pp. `31–36` |
| 7 | `G1-ST07` | عددهای ۱ و ۲ | C105 Section 7 | opener + pp. `37–42` |
| 8 | `G1-ST08` | عددهای ۳ و ۴ و اندازه‌گیری قد | C105 Section 8 | opener + pp. `43–48` |
| 9 | `G1-ST09` | صفر و ۵ و تقارن | C105 Section 9 | opener + pp. `49–54` |
| 10 | `G1-ST10` | ۶ و ۷ و مقایسه مجموعه‌ها | C105 Section 10 | opener + pp. `55–60` |
| 11 | `G1-ST11` | مجموعه‌های مساوی و عدد ۸ | C105 Section 11 | opener + pp. `61–66` |
| 12 | `G1-ST12` | مقایسه عددها و عدد ۹ | C105 Section 12 | opener + pp. `67–72` |
| 13 | `G1-ST13` | نشانه جمع و ترکیب‌های عددی | C105 Section 13 | opener + pp. `73–78` |
| 14 | `G1-ST14` | تفریق و مقایسه طول | C105 Section 14 | opener + pp. `79–84` |
| 15 | `G1-ST15` | گروه‌بندی و ارزش مکانی | C105 Section 15 | opener + pp. `85–90` |
| 16 | `G1-ST16` | ساعت و عددهای ۱۰ تا ۲۰ | C105 Section 16 | opener + pp. `91–96` |
| 17 | `G1-ST17` | جمع چندبخشی و تقریب | C105 Section 17 | opener + pp. `97–102` |
| 18 | `G1-ST18` | الگوهای عددی و زمان دقیق | C105 Section 18 | opener + pp. `103–108` |
| 19 | `G1-ST19` | ده‌تایی‌ها و مسئله‌های خرید | C105 Section 19 | opener + pp. `109–114` |
| 20 | `G1-ST20` | عددهای دو رقمی و ارزش مکانی | C105 Section 20 | opener + pp. `115–120` |
| 21 | `G1-ST21` | جدول ۱ تا ۱۰۰ و اندازه‌گیری | C105 Section 21 | opener + pp. `121–126` |
| 22 | `G1-ST22` | الگوهای شمارش و تقویم | C105 Section 22 | opener + pp. `127–132` |
| 23 | `G1-ST23` | شمارش ۸تایی، ۵تایی و مسئله | C105 Section 23 | opener + pp. `133–138` |
| 24 | `G1-ST24` | مسئله چندمرحله‌ای و زمان تقریبی | C105 Section 24 | opener + pp. `139–144` |
| 25 | `G1-ST25` | عدد ۱۰۰ و کفایت اطلاعات | C105 Section 25 | opener + pp. `145–150` |

> Working focusها label داخلی هستند، نه نام رسمی کتاب.

---

## 10. Station ↔ Skill Mapping

| Station | Primary skills | Supporting/review skills |
|---|---|---|
| `G1-ST01` | `G1-SK001`, `G1-SK002`, `G1-SK003`, `G1-SK004`, `G1-SK005`, `G1-SK009`, `G1-SK010`, `G1-SK011`, `G1-SK048` | `G1-SK041` |
| `G1-ST02` | `G1-SK012`, `G1-SK047` | `G1-SK002`, `G1-SK003`, `G1-SK009`, `G1-SK010`, `G1-SK048` |
| `G1-ST03` | `G1-SK006`, `G1-SK020`, `G1-SK025`, `G1-SK058`, `G1-SK060` |  |
| `G1-ST04` | `G1-SK041`, `G1-SK042`, `G1-SK043`, `G1-SK044` |  |
| `G1-ST05` | `G1-SK026`, `G1-SK031` | `G1-SK001`, `G1-SK003`, `G1-SK006` |
| `G1-ST06` | `G1-SK027`, `G1-SK032`, `G1-SK045` | `G1-SK004`, `G1-SK025`, `G1-SK026`, `G1-SK031` |
| `G1-ST07` | `G1-SK016`, `G1-SK017` | `G1-SK001`, `G1-SK005`, `G1-SK020` |
| `G1-ST08` | `G1-SK049` | `G1-SK003`, `G1-SK016`, `G1-SK038`, `G1-SK047` |
| `G1-ST09` | `G1-SK046` | `G1-SK001`, `G1-SK004`, `G1-SK005`, `G1-SK010`, `G1-SK041`, `G1-SK042`, `G1-SK043`, `G1-SK044`, `G1-SK045` |
| `G1-ST10` | `G1-SK018`, `G1-SK035` | `G1-SK002`, `G1-SK003`, `G1-SK005`, `G1-SK016`, `G1-SK017`, `G1-SK020` |
| `G1-ST11` | `G1-SK037` | `G1-SK003`, `G1-SK012`, `G1-SK015`, `G1-SK035` |
| `G1-ST12` | `G1-SK036`, `G1-SK040` | `G1-SK002`, `G1-SK016`, `G1-SK017`, `G1-SK035`, `G1-SK037` |
| `G1-ST13` | `G1-SK021`, `G1-SK028`, `G1-SK029`, `G1-SK059` | `G1-SK006`, `G1-SK017`, `G1-SK020`, `G1-SK025`, `G1-SK026`, `G1-SK027`, `G1-SK031`, `G1-SK032`, `G1-SK058` |
| `G1-ST14` | `G1-SK033`, `G1-SK034`, `G1-SK038`, `G1-SK039`, `G1-SK057` | `G1-SK004`, `G1-SK027`, `G1-SK028`, `G1-SK029`, `G1-SK031`, `G1-SK032`, `G1-SK035`, `G1-SK036`, `G1-SK041`, `G1-SK042`, `G1-SK043`, `G1-SK044`, `G1-SK046`, `G1-SK047`, `G1-SK058`, `G1-SK059`, `G1-SK064` |
| `G1-ST15` | `G1-SK015` | `G1-SK008`, `G1-SK013`, `G1-SK039`, `G1-SK048`, `G1-SK049`, `G1-SK060` |
| `G1-ST16` | `G1-SK007`, `G1-SK019`, `G1-SK052`, `G1-SK053` | `G1-SK004`, `G1-SK018`, `G1-SK020`, `G1-SK041`, `G1-SK055` |
| `G1-ST17` | `G1-SK030`, `G1-SK050` | `G1-SK006`, `G1-SK014`, `G1-SK021`, `G1-SK025`, `G1-SK026`, `G1-SK027`, `G1-SK028`, `G1-SK029`, `G1-SK031`, `G1-SK033`, `G1-SK034`, `G1-SK038`, `G1-SK049`, `G1-SK057`, `G1-SK058`, `G1-SK059`, `G1-SK064` |
| `G1-ST18` | `G1-SK013`, `G1-SK014`, `G1-SK054`, `G1-SK063` | `G1-SK007`, `G1-SK008`, `G1-SK009`, `G1-SK010`, `G1-SK011`, `G1-SK012`, `G1-SK034`, `G1-SK041`, `G1-SK043`, `G1-SK045`, `G1-SK046`, `G1-SK052`, `G1-SK053`, `G1-SK055`, `G1-SK060` |
| `G1-ST19` | `G1-SK022` | `G1-SK024`, `G1-SK025`, `G1-SK029`, `G1-SK030`, `G1-SK057` |
| `G1-ST20` | `G1-SK023` | `G1-SK008`, `G1-SK014`, `G1-SK017`, `G1-SK018`, `G1-SK019`, `G1-SK020`, `G1-SK022`, `G1-SK036`, `G1-SK037`, `G1-SK040` |
| `G1-ST21` | `G1-SK051` | `G1-SK007`, `G1-SK012`, `G1-SK014`, `G1-SK015`, `G1-SK022`, `G1-SK024`, `G1-SK030`, `G1-SK035`, `G1-SK036`, `G1-SK038`, `G1-SK039`, `G1-SK044`, `G1-SK048`, `G1-SK049`, `G1-SK050`, `G1-SK054`, `G1-SK060` |
| `G1-ST22` | `G1-SK056` | `G1-SK007`, `G1-SK013`, `G1-SK034`, `G1-SK052`, `G1-SK053`, `G1-SK054`, `G1-SK055` |
| `G1-ST23` | `G1-SK008` | `G1-SK007`, `G1-SK011`, `G1-SK013`, `G1-SK020`, `G1-SK021`, `G1-SK025`, `G1-SK028`, `G1-SK029`, `G1-SK030`, `G1-SK031`, `G1-SK033`, `G1-SK041`, `G1-SK042`, `G1-SK057`, `G1-SK058`, `G1-SK059`, `G1-SK063`, `G1-SK064` |
| `G1-ST24` | `G1-SK055`, `G1-SK062`, `G1-SK064` | `G1-SK023`, `G1-SK030`, `G1-SK034`, `G1-SK043`, `G1-SK044`, `G1-SK045`, `G1-SK046`, `G1-SK049`, `G1-SK050`, `G1-SK052`, `G1-SK056`, `G1-SK057`, `G1-SK058`, `G1-SK061`, `G1-SK063` |
| `G1-ST25` | `G1-SK024`, `G1-SK061` | `G1-SK007`, `G1-SK008`, `G1-SK019`, `G1-SK022`, `G1-SK023`, `G1-SK036`, `G1-SK037`, `G1-SK040`, `G1-SK047`, `G1-SK051`, `G1-SK056`, `G1-SK057`, `G1-SK059`, `G1-SK060`, `G1-SK062`, `G1-SK063` |

### Mapping invariants

- هر 25 Station حداقل یک PRIMARY دارد.
- هر 64 Skill دقیقاً یک PRIMARY Station دارد.
- Supporting mapping برای review/interleaving مجاز است.
- mapping چندبه‌چند است؛ sequence به‌تنهایی learning path نیست.

---

## 11. Detailed Station Contracts

### G1-ST01 — الگو، موقعیت و شمارش تا ۵

- Source anchor: C105 Section 1; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK001, G1-SK002, G1-SK003, G1-SK004, G1-SK005, G1-SK009, G1-SK010, G1-SK011, G1-SK048
- Supporting/review: G1-SK041
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST02 — جهت و ساختارهای شبکه‌ای

- Source anchor: C105 Section 2; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK012, G1-SK047
- Supporting/review: G1-SK002, G1-SK003, G1-SK009, G1-SK010, G1-SK048
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST03 — جمع‌های آغازین و نمایش عدد

- Source anchor: C105 Section 3; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK006, G1-SK020, G1-SK025, G1-SK058, G1-SK060
- Supporting/review: —
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST04 — شکل‌ها، ضلع و گوشه

- Source anchor: C105 Section 4; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK041, G1-SK042, G1-SK043, G1-SK044
- Supporting/review: —
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST05 — جمع و تفریق با چوب‌خط

- Source anchor: C105 Section 5; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK026, G1-SK031
- Supporting/review: G1-SK001, G1-SK003, G1-SK006
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST06 — جمع و تفریق با انگشت و شمارنده

- Source anchor: C105 Section 6; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK027, G1-SK032, G1-SK045
- Supporting/review: G1-SK004, G1-SK025, G1-SK026, G1-SK031
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST07 — عددهای ۱ و ۲

- Source anchor: C105 Section 7; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK016, G1-SK017
- Supporting/review: G1-SK001, G1-SK005, G1-SK020
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST08 — عددهای ۳ و ۴ و اندازه‌گیری قد

- Source anchor: C105 Section 8; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK049
- Supporting/review: G1-SK003, G1-SK016, G1-SK038, G1-SK047
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST09 — صفر و ۵ و تقارن

- Source anchor: C105 Section 9; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK046
- Supporting/review: G1-SK001, G1-SK004, G1-SK005, G1-SK010, G1-SK041, G1-SK042, G1-SK043, G1-SK044, G1-SK045
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST10 — ۶ و ۷ و مقایسه مجموعه‌ها

- Source anchor: C105 Section 10; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK018, G1-SK035
- Supporting/review: G1-SK002, G1-SK003, G1-SK005, G1-SK016, G1-SK017, G1-SK020
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST11 — مجموعه‌های مساوی و عدد ۸

- Source anchor: C105 Section 11; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK037
- Supporting/review: G1-SK003, G1-SK012, G1-SK015, G1-SK035
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST12 — مقایسه عددها و عدد ۹

- Source anchor: C105 Section 12; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK036, G1-SK040
- Supporting/review: G1-SK002, G1-SK016, G1-SK017, G1-SK035, G1-SK037
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST13 — نشانه جمع و ترکیب‌های عددی

- Source anchor: C105 Section 13; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK021, G1-SK028, G1-SK029, G1-SK059
- Supporting/review: G1-SK006, G1-SK017, G1-SK020, G1-SK025, G1-SK026, G1-SK027, G1-SK031, G1-SK032, G1-SK058
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST14 — تفریق و مقایسه طول

- Source anchor: C105 Section 14; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK033, G1-SK034, G1-SK038, G1-SK039, G1-SK057
- Supporting/review: G1-SK004, G1-SK027, G1-SK028, G1-SK029, G1-SK031, G1-SK032, G1-SK035, G1-SK036, G1-SK041, G1-SK042, G1-SK043, G1-SK044, G1-SK046, G1-SK047, G1-SK058, G1-SK059, G1-SK064
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST15 — گروه‌بندی و ارزش مکانی

- Source anchor: C105 Section 15; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK015
- Supporting/review: G1-SK008, G1-SK013, G1-SK039, G1-SK048, G1-SK049, G1-SK060
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST16 — ساعت و عددهای ۱۰ تا ۲۰

- Source anchor: C105 Section 16; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK007, G1-SK019, G1-SK052, G1-SK053
- Supporting/review: G1-SK004, G1-SK018, G1-SK020, G1-SK041, G1-SK055
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST17 — جمع چندبخشی و تقریب

- Source anchor: C105 Section 17; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK030, G1-SK050
- Supporting/review: G1-SK006, G1-SK014, G1-SK021, G1-SK025, G1-SK026, G1-SK027, G1-SK028, G1-SK029, G1-SK031, G1-SK033, G1-SK034, G1-SK038, G1-SK049, G1-SK057, G1-SK058, G1-SK059, G1-SK064
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST18 — الگوهای عددی و زمان دقیق

- Source anchor: C105 Section 18; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK013, G1-SK014, G1-SK054, G1-SK063
- Supporting/review: G1-SK007, G1-SK008, G1-SK009, G1-SK010, G1-SK011, G1-SK012, G1-SK034, G1-SK041, G1-SK043, G1-SK045, G1-SK046, G1-SK052, G1-SK053, G1-SK055, G1-SK060
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST19 — ده‌تایی‌ها و مسئله‌های خرید

- Source anchor: C105 Section 19; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK022
- Supporting/review: G1-SK024, G1-SK025, G1-SK029, G1-SK030, G1-SK057
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST20 — عددهای دو رقمی و ارزش مکانی

- Source anchor: C105 Section 20; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK023
- Supporting/review: G1-SK008, G1-SK014, G1-SK017, G1-SK018, G1-SK019, G1-SK020, G1-SK022, G1-SK036, G1-SK037, G1-SK040
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST21 — جدول ۱ تا ۱۰۰ و اندازه‌گیری

- Source anchor: C105 Section 21; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK051
- Supporting/review: G1-SK007, G1-SK012, G1-SK014, G1-SK015, G1-SK022, G1-SK024, G1-SK030, G1-SK035, G1-SK036, G1-SK038, G1-SK039, G1-SK044, G1-SK048, G1-SK049, G1-SK050, G1-SK054, G1-SK060
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST22 — الگوهای شمارش و تقویم

- Source anchor: C105 Section 22; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK056
- Supporting/review: G1-SK007, G1-SK013, G1-SK034, G1-SK052, G1-SK053, G1-SK054, G1-SK055
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST23 — شمارش ۸تایی، ۵تایی و مسئله

- Source anchor: C105 Section 23; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK008
- Supporting/review: G1-SK007, G1-SK011, G1-SK013, G1-SK020, G1-SK021, G1-SK025, G1-SK028, G1-SK029, G1-SK030, G1-SK031, G1-SK033, G1-SK041, G1-SK042, G1-SK057, G1-SK058, G1-SK059, G1-SK063, G1-SK064
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST24 — مسئله چندمرحله‌ای و زمان تقریبی

- Source anchor: C105 Section 24; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK055, G1-SK062, G1-SK064
- Supporting/review: G1-SK023, G1-SK030, G1-SK034, G1-SK043, G1-SK044, G1-SK045, G1-SK046, G1-SK049, G1-SK050, G1-SK052, G1-SK056, G1-SK057, G1-SK058, G1-SK061, G1-SK063
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

### G1-ST25 — عدد ۱۰۰ و کفایت اطلاعات

- Source anchor: C105 Section 25; opener + six instructional pages. `SOURCE-DERIVED`
- Primary: G1-SK024, G1-SK061
- Supporting/review: G1-SK007, G1-SK008, G1-SK019, G1-SK022, G1-SK023, G1-SK036, G1-SK037, G1-SK040, G1-SK047, G1-SK051, G1-SK056, G1-SK057, G1-SK059, G1-SK060, G1-SK062, G1-SK063
- Experience contract: Learn → Guided Practice → Check → Result; Recovery → Re-check when needed. `LOCKED`
- Decision target: primary skill(s) are default evidence-bearing targets; supporting skill only when useful to interpretation/recovery. `LOCKED`
- Exit: operational progress; never direct `MASTERED`. `LOCKED`

---

## 12. Source-to-Skill Interpretation

| Source pattern | Product interpretation |
|---|---|
| موضوع در چند بخش بازمی‌گردد | یک Skill با چند Station mapping، نه skill duplicate |
| یک بخش چند مفهوم دارد | چند Skill در یک Station با PRIMARY/SUPPORTING |
| مفهوم قدیمی در بخش جدید تمرین می‌شود | Evidence جدید روی همان Skill + supporting/review mapping |
| مسئله چند نمایش دارد | یک Skill/Objective با چند representation در v0.28 |

---

## 13. Learning Engine Integration

```text
Learning State + Recent Evidence + Skill Graph + Grade Package
                ↓
        Candidate Skill / Step
                ↓
          Station coverage
                ↓
          Content selection
                ↓
              Encounter
                ↓
            New Evidence
```

- اگر Skill هدف در Station فعلی mapping ندارد، engine باید coverage مناسب را پیدا کند؛ UI نباید mapping را جعل کند.
- PRIMARY برای evidence-bearing decision اولویت دارد.
- SUPPORTING برای representation/recovery/review است.
- RELATED به‌تنهایی demotion یا mastery را فعال نمی‌کند.
- Guided Path یک projection باقی می‌ماند.

### Anti-patterns

- `if station == X then skill == Y` در UI؛
- dependency بر اساس sequence به‌جای graph؛
- mastery بر اساس حضور/تعداد Station؛
- content linkage با text matching.

---

## 14. Diagnostic Boundary

```text
Diagnostic Probe → Skill-targeted Evidence → Starting-point inference → Initial Plan
```

- هر Probe باید target معتبر در G1-SK001..064 داشته باشد.
- wrong answer به‌تنهایی diagnosis نیست.
- placement یک starting-point assessment است، نه diagnosis کامل.

---

## 15. Content Boundary — v0.28

Content Version باید حداقل بتواند `grade_id`, `curriculum_version_id`, `skill_id`, `station_id`, `content_artifact_id`, `version`, `interaction_type`, `answer_schema`, `evaluator`, `feedback`, `asset refs`, `provenance/QA` را trace کند.

Content نباید به Skill/Station retired بدون compatibility rule متصل بماند.

---

## 16. Cross-Grade Extension

- Skill می‌تواند `owning_grade_id` داشته باشد.
- Grade packageها مستقل version می‌شوند.
- cross-grade prerequisite در صورت نیاز ممکن است، ولی باید explicit/versioned باشد.

```text
G1 Graph v1 + G2 Graph v1 + explicit cross-grade relations
```

Grade transition ≠ MASTERED all prior skills؛ Grade-2 placement/state contract تصمیم می‌گیرد.

---

## 17. Contract Tests

| `G1-SG-001` | دقیقاً 64 active skill در Graph Version |
| `G1-SG-002` | 8 family و count جمعاً 64 |
| `G1-SG-003` | 25 station با sequence 1..25 |
| `G1-SG-004` | هر skill دقیقاً یک PRIMARY mapping |
| `G1-SG-005` | هر station حداقل یک PRIMARY |
| `G1-SG-006` | بدون duplicate mapping |
| `G1-SG-007` | بدون self-loop |
| `G1-SG-008` | prerequisite graph acyclic |
| `G1-SG-009` | supporting/related blocking نیستند |
| `G1-SG-010` | sequence با source order سازگار است |
| `G1-SG-011` | content refs فقط به active skill/station |
| `G1-SG-012` | version تاریخی overwrite نمی‌شود |
| `G1-SG-013` | Diagnostic Probe target معتبر |
| `G1-SG-014` | هیچ pass/mastery threshold در Graph seed |

### Example assertions

```ts
expect(activeSkills).toHaveLength(64);
expect(activeStations).toHaveLength(25);
expect(primaryMappingsPerSkill.every(x => x === 1)).toBe(true);
expect(graphHasCycle(prerequisiteEdges)).toBe(false);
```

---

## 18. Seed Contract

```text
1. Grade 1 / Curriculum Version
2. Skill Graph Version
3. 8 Skill Families
4. 64 Skills
5. 25 Stations
6. Graph Nodes
7. Skill Relations
8. StationSkill mappings
9. Contract tests
10. Freeze active graph version
```

Seed production فقط بعد از educational approval؛ meaningful change = Graph Version جدید.

---

## 19. Open Questions

- review متخصص curriculum برای تأیید/ادغام/تفکیک taxonomy 64تایی؛
- diagnostic probe coverage؛
- content template per skill؛
- mastery/retention calibration در v0.29؛
- تعیین اینکه skillهای حل مسئله canonical skill باشند یا cross-cutting evidence construct؛
- legal review برای asset/voice/image مرتبط با C105.

---

## 20. Verification Notes

### P0
- 64 Skill identity/family/title/primary mapping اکنون explicit است.
- 25 Station Contract و mapping اکنون explicit است.
- prerequisite graph explicit و acyclic شده است.
- Pass/Mastery عمداً خارج از Graph مانده است.

### P1
- taxonomy 64تایی رسمی C105 نیست؛ decomposition دامنه‌ای ماست.
- برخی skillها (تقارن، زمان، حل مسئله، بازنمایی) cross-cutting هستند و ممکن است در review ادغام/تفکیک شوند.
- mapping اولیه برای seed/test مناسب است، نه هنوز truth آموزشی نهایی.

### P2
- exact content JSON، evaluator، session transition، pass calibration و diagnostic scoring در v0.28/v0.29.

---

## 21. Source Register

| Source | Use | Status |
|---|---|---|
| رشد — https://www.roshd.ir/riazi/Content/کتاب-ریاضی-اول-دبستان | 25 sections + opener + 6 instructional pages | SOURCE-DERIVED |
| C105 — https://www.scribd.com/document/808750787/C105 | section sequence and activity themes | SOURCE-DERIVED; secondary hosting |
| v0.21 Product Core | Station/Skill, pass/mastery, evidence/decision semantics | LOCKED internal source |
| v0.22 Implementation Spec | Grade Package + Skill Graph intent | LOCKED internal source |
| v0.23 Database Schema | skills/relations/stations/station_skills persistence | LOCKED internal source |
| v0.24 Child App Experience | Station four-stage child journey | LOCKED internal source |
| v0.25 Technical Architecture | runtime/API/versioning | LOCKED internal source |
| v0.26 Auth/Permission/RLS | authorization boundary | LOCKED internal source |

---

## 22. وضعیت نهایی v0.27

### CLOSED
- Skill/Station boundary
- 25-station sequence contract
- 64-skill artifact shape and identifiers
- relation vocabulary
- mapping semantics
- structural contract tests
- cross-grade extension rules

### PROVISIONAL / REQUIRES EDUCATIONAL REVIEW
- exact 64-skill taxonomy
- titles/family assignment
- prerequisite semantics
- primary/supporting mapping

### NEXT
- `v0.28 Content Contract`
- `v0.29 Session Runtime + Learning Rules`
- سپس seed freeze + Station 01 vertical slice after verification.

> architecture نباید برای ambiguity محتوایی دوباره شکسته شود؛ ambiguity باقی‌مانده باید در Grade Package / Content / Learning Rules حل شود مگر contradiction واقعی با Core/DB/Auth کشف شود.


---

<div dir="rtl" align="right">

# COMPLETION ADDENDUM — v0.30 Experience Coverage Addendum

**Historical source:** Grade 1 Skill Graph v0.27 remains the canonical educational artifact and retains its `PROVISIONAL / DERIVED` status where declared.

## 1. Experience coverage does not change Skill identity

The new Game specification adds experience coverage without creating new Skills.

```text
Skill identity
    ↓
Station mapping
    ↓
Content / Experience coverage
    ↓
Encounter
```

## 2. Grade 1 Game Templates

```text
G1-GAME-001 Pattern Path
G1-GAME-002 Count Catch
G1-GAME-003 Number Factory
G1-GAME-004 Shape City
G1-GAME-005 Magic Mirror
G1-GAME-006 Comparison Robot
G1-GAME-007 Number Line Jump
G1-GAME-008 Clock Repair
G1-GAME-009 Calendar Hunt
G1-GAME-010 Mini Shop
G1-GAME-011 Tens Factory
G1-GAME-012 Magic Grid
G1-GAME-013 Information Detective
G1-GAME-014 Multi-step Mission
```

## 3. Coverage rule

Every active Mini Game content version must reference:

- one Grade;
- one active Station or approved multi-Station scope;
- at least one Skill;
- one Learning Role;
- one evaluator version.

## 4. Station 01 priority

Station 01 is the first game implementation target and must cover at minimum:

```text
SK001 counting
SK002 one-to-one correspondence
SK003 cardinality
SK009 pattern recognition
SK010 pattern continuation
SK011 pattern rule
SK048 spatial ordering
```

## 5. Structural invariants

The existing 64-Skill / 25-Station contract is unchanged:

- every Skill keeps one PRIMARY Station;
- every Station keeps at least one PRIMARY Skill;
- Game mappings do not alter prerequisite edges;
- Game mappings do not create mastery thresholds;
- Reward/Quest references do not become Skill relations.

## 6. Educational review remains required

The exact 64-Skill taxonomy, family assignment, prerequisite semantics and primary/supporting mapping remain provisional as already declared by v0.27. Game coverage is therefore an implementation layer over the existing graph, not evidence that the taxonomy itself is educationally final.

</div>


# COMPLETION ADDENDUM — v0.31 Client Scope Alignment

Grade 1 Skill Graph remains unchanged by Parent/Teacher Lite. Adult clients consume Skill/Station state through projections; they do not introduce new Skill identities or graph edges.
