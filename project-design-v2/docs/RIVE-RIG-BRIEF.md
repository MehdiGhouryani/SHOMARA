# بریف ریگ Rive برای cast v2

هدف: چهار فایل `aria.riv`، `qbo.riv`، `dana.riv`، `jiko.riv` که جای انیمیشن CSS/اسپرایت فعلی را بگیرند. SVGهای `assets/characters/*` با همین نام‌های لایه مستقیم در Rive import می‌شوند.

## قرارداد هر فایل
- Artboard: `Character` (۲۲۴×۲۵۶)، و Artboard دوم `Bust` (مربع).
- State machine: `Companion`.
- Inputs: `state` (Number: 0 idle، 1 think، 2 encourage، 3 correct، 4 celebrate، 5 recovery)، `reducedMotion` (Boolean)، `lessonMode` (Boolean)، `lookX`/`lookY` (Number، −۱ تا ۱، فقط برای چشم).
- هر state یک pose کلیدی دارد که دقیقاً همان SVG استاتیک همان state است (پس fallback و Rive هم‌معنا می‌مانند).
- زمان‌بندی‌ها، easing و تعداد تکرار: `specs/motion-v2.json`. Rive حرکت کمتر را خودش اعمال نمی‌کند؛ اپ باید `reducedMotion` را بفرستد.

## استخوان‌ها / گروه‌ها
| شخصیت | گروه‌های متحرک (id در SVG) | نکته |
|---|---|---|
| آریا | `body-group`، `head`، `arm-l`، `arm-r`، `wing-l`، `wing-r`، `tail`، `eye-l/r`، `mouth` | دم با ۳ استخوان زنجیره‌ای؛ بال‌ها فقط ±۸ درجه |
| کیوبو | `body-group`، `head`، `antenna`، `arm-l/r` (هر کدام ۳ مکعب)، `float-cube`، `screen` | چهره روی صفحه با Solo/visibility عوض می‌شود؛ حالت «شکستن به مکعب» یک Nested Artboard جدا برای تمرین‌های تجزیه |
| دانا | `body-group`، `head`، `ear-l/r`، `arm-l/r`، `tail`، `tail-pattern`، `magnifier` | الگوی دم = dash روی stroke؛ در Rive با trim path یا بافت تکرارشونده |
| جیکو | `body-group`، `head`، `crest`، `wing-l/r`، `beak`، `legs` | کاکل با فنر (spring) ثانویه؛ بال‌ها تا ۱۱۵ درجه در جشن |

## ممنوعیت‌ها
لرزش/سر تکان دادن «نه»، اشاره یا نگاه به گزینهٔ جواب، دندان/چنگال/آتش، حلقهٔ بی‌پایان در سؤال. حجم هدف هر فایل زیر ۲۰۰KB؛ روی گوشی ضعیف اندازه‌گیری شود (این بسته اندازه‌گیری دستگاه ندارد).

## اتصال به کد
- موبایل: `AnimatedCharacter` prop `source` را می‌گیرد؛ وقتی فایل .riv در `apps/mobile/assets/rive/` قرار گرفت آن را پاس بدهید. بدون آن، PNGهای v2 نمایش داده می‌شوند.
- وب: `CharacterArt` تا قبل از افزودن `@rive-app/react-canvas` همان SVG + CSS می‌ماند.
