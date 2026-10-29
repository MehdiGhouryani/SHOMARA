# نقشهٔ نهایی UI/UX صفحه‌ها — Native V3

این سند قرارداد اجرایی همهٔ خانواده‌های صفحه است. هدف آن حذف تصمیم‌گیری تکراری در زمان مهاجرت Compose است؛ **evidence پیاده‌سازی Native نیست**. تا عبور واقعی `N02-07` همهٔ ردیف‌ها `NATIVE_PENDING` می‌مانند.

## قواعد سراسری چیدمان

- صفحه از بالا به پایین: orientation کوتاه → focal object یا task → کنترل‌های تصمیم → یک CTA اصلی → feedback/system state.
- canvas و متن `flat`، گروه‌بندی غیرتعاملی `hint`، کنترل تعاملی `soft` و فقط یک focal/CTA در viewport تصمیم `featured` است.
- CTA پایین صفحه باید با IME، gesture navigation و 200% font scale برخورد نکند؛ scroll محتوا نباید CTA یا feedback را پنهان کند.
- فارسی/RTL جهت shell است؛ شماره، OTP، عبارت ریاضی، محور و ترتیب عملیات جهت معنایی مستقل دارند.
- حداقل target برابر 48dp است؛ manipulativeهای پایه‌های اول ترجیحاً 72–80dp با فاصلهٔ 16dp و inset کناری 24dp.
- هر state تصمیم فقط یک CTA اصلی دارد. CTA در `loading` قفل و idempotent است، اما layout جابه‌جا نمی‌شود.
- animation کوتاه، هدفمند و قابل لغو است؛ reduced-motion نسخهٔ بدون حرکت دارد. feedback معنایی فقط رنگ/سایه نیست.
- پاسخ، mastery، unlock و Station Pass از repository/server می‌آید؛ UI هیچ answer key یا ارزیابی محلی تازه‌ای نمی‌سازد.

## طرح خانواده‌های صفحه

| ID | خانواده / مقصد Native | outcome کودک | focal object و composition | CTA اصلی | depth | stateهای الزامی | reject مشخص |
|---|---|---|---|---|---|---|---|
| 01 | Launch/Welcome · `feature:onboarding` | بفهمد ورود جدید است یا ادامهٔ امن | hero گرم و کوتاه؛ character کوچک؛ ابتدا session resolution | «شروع» یا «ادامه» متناسب با session | flat + یک featured | resolving/new/returning/offline/error | flash ورود، splash حلقه‌ای، ادعای جایزه |
| 02 | Onboarding · `feature:onboarding` | هر بار یک مفهوم و جایگاه مرحله را بفهمد | illustration محدود + عنوان یک‌خطی + progress متنی/دیداری | «ادامه»؛ skip فقط با مجوز محصول | hint + soft CTA | first/resume/back/save/loading/error | carousel شلوغ، چند CTA هم‌وزن، dark pattern |
| 03 | Phone/OTP · `feature:auth` | شماره یا کد را بدون ابهام وارد کند | label پایدار، input LTR و error نزدیک فیلد | «دریافت کد» / «تأیید» | flat form + soft CTA | empty/focused/invalid/sending/code/paste/expired/cooldown/offline | log کد، error صرفاً قرمز، CTA زیر keyboard |
| 04 | Profile setup · `feature:onboarding` | حداقل اطلاعات لازم را بسازد | یک پرسش در هر view؛ avatar کوچک و واقعی | «ذخیره و ادامه» | hint + soft controls | empty/invalid/saving/save-fail/resume | پروفایل اجتماعی، دادهٔ اضافه، avatar غالب |
| 05 | Grade/Placement · `feature:placement` | پایهٔ قابل‌دسترسی را انتخاب و تعیین‌سطح را بفهمد | cardهای پایه با locked/unavailable صریح؛ assessment آرام | «ادامه» / «شروع تعیین‌سطح» | soft cards؛ assessment flat | selected/locked/unavailable/loading/exit/resume/error | نمایش پایهٔ غیرفعال به‌عنوان موجود، mastery محلی |
| 06 | Learning path · `feature:path` | جای فعلی و گام بعدی را در مسیر ببیند | ribbon فصل + current node واحد + tooltip انتخابی | CTA همان node انتخاب‌شده | canvas flat؛ current featured؛ nodes soft | fresh/current/completed/perfect/locked/offline/error/restore-scroll | glow همهٔ nodeها، disabled غلط برای locked tappable |
| 07 | Station start · `feature:learning-player` | هدف کوتاه ایستگاه را بداند و شروع/ادامه دهد | lesson aim + character محدود + metadata واقعی | «شروع» یا «ادامه» | یک featured hero/CTA | loading/ready/resume/locked/offline/error/starting | CTA تکراری، success جعلی، hero مزاحم در 360dp |
| 08 | Teach/Discover · `feature:learning-player` | مفهوم را با مشاهده/تعامل کشف کند | manipulative ریاضی hero؛ متن کوتاه؛ audio اختیاری | «ادامه» پس از شرط معتبر | focal featured؛ chrome flat | ready/interactive/audio-unavailable/loading/playing/failed/reduced-motion | character بزرگ‌تر از مفهوم، قفل‌شدن به صوت، animation پیوسته |
| 09 | Guided practice · `feature:learning-player` | با راهنمایی پاسخ دهد و راه بعدی را بفهمد | objectهای بزرگ + انتخاب واضح + feedback پایدار | «بررسی» سپس «ادامه/دوباره» | choices soft؛ feedback hint | idle/selected/submitting/correct/retry/recovery/offline/error | drag بدون tap alternative، submit دوگانه، hint ساختگی |
| 10 | Assessment · `feature:learning-player` / `feature:placement` | مستقل و بدون افشای پاسخ مسئله را حل کند | صورت مسئله dominant؛ decoration حداقلی؛ choiceها جدا | «بررسی پاسخ» | canvas flat؛ choices soft | idle/selected/submitting/result/disconnect/resume/expired | hint/audio افشاگر، celebration پیش از نتیجهٔ معتبر، grade محلی |
| 11 | Recovery/Result · `feature:learning-player` | بدون شرم بداند چگونه اصلاح کند یا بعد کجاست | feedback sheet ثابت؛ celebration فقط پس از success سرور | «دوباره تلاش کن» / «ادامه مسیر» | sheet soft؛ success featured محدود | correct/retry/recovery/pass/fail/offline/resume | shake خشن، دوباره‌شماری progress، اجبار تماشای مجدد |
| 12 | Practice tab · `feature:practice` | تمرین واقعاً موجود را پیدا و ادامه دهد | recent/topic rows واقعی؛ empty state راهنما | «شروع/ادامه تمرین» | rows soft؛ shell flat | loading/list/empty/locked/offline/error/history | grid placeholder، mission پنهان را زنده‌کردن، دادهٔ ساختگی |
| 13 | Challenge · `feature:learning-player` | قانون چالش و round جاری را روشن بفهمد | intro کوتاه؛ در round سؤال همیشه focal | «شروع چالش» / «ثبت پاسخ» | intro featured؛ round flat/soft | unavailable/intro/round/submitting/retry/result/offline | casino reward، answer leak، player قدیمی داخل shell جدید |
| 14 | Profile/Me · `feature:profile` | هویت و پیشرفت واقعی خود را ساده ببیند | header گرم + آواتار واقعی + facts قابل‌فهم | action متناسب با row؛ بدون CTA مصنوعی | header hint؛ rows soft | loading/ready/empty/offline/error/edit-return | dashboard تاریک، badge/streak ساختگی، log دادهٔ کودک |
| 15 | Avatar/Settings/Guardian · `feature:profile/settings/guardian` | ظاهر و preference واقعی را امن تغییر دهد | grid پنج asset واقعی؛ setting rows سبک؛ guardian جدا از shell | «ذخیره» فقط در صورت نیاز | selected soft؛ dialog featured محدود | owned/equipped/locked/saving/toggle-fail/restart/re-auth/error | avatar خیالی، toggle جعلی، پاک‌کردن بدون confirm، guardian داخل tab کودک |
| 16 | System states · shared | علت توقف و اقدام بعدی را بفهمد | layout پایدار + پیام کوتاه + action واقعی | «تلاش دوباره» یا fallback معتبر | flat/hint؛ CTA soft | loading/empty/offline/error/permission/missing-asset/pending-sync | spinner بی‌انتها، متن فنی برای کودک، retry بی‌اثر |
| 17 | Navigation · app shell | همیشه بداند کجاست و Back چه می‌کند | سه tab ثابت «مسیر/تمرین/من»؛ active marker روشن | destination tap؛ بدون CTA محتوایی جدید | shell flat؛ selected hint | selected/reselect/deep-link/nested/back/modal/IME/restoration | tab چهارم پنهان، duplicate navigation، overlay روی کنترل |

## ترتیب اجرایی وابسته به ریسک

| Batch | بعد از gate | خروجی | صفحات | شرط خروج |
|---|---|---|---|---|
| U0 | `N02-07` سبز | token codegen، Theme، type/math direction، primitives و fixtureها | مشترک | drift صفر؛ component contract و semantics test |
| U1 | U0 | root coordinator، onboarding/auth/profile setup | 01–05, 16 | fresh/returning/OTP/IME/process recreation؛ screenshot 360/390/412 |
| U2 | U0 + navigation primitives | shell و مسیر تا start ایستگاه | 06, 07, 17 | deep link/Back/scroll restore/locked semantics |
| U3 | U2 + content schema boundary | player state machine: teach → guided → assessment → recovery/result | 08–11 | reducer/use-case test؛ single-submit؛ offline/resume؛ بدون answer key |
| U4 | U3 | challenge و practice | 12–13 | round recovery و empty/offline واقعی؛ `missions` همچنان unreachable |
| U5 | U1/U2 | profile، avatar، settings و guardian | 14–15 | persistence/re-auth/privacy؛ asset crop device check |
| U6 | همه | hardening cross-route | 01–17 | TalkBack، 200% font، predictive Back، process death، performance و child/education QA |

هیچ Batch با screenshot تنها بسته نمی‌شود. Compose source/preview برابر `TESTED_NATIVE` نیست؛ evidence level باید جداگانه در ledger ثبت شود.

## Definition of Ready هر route

1. route/data owner و state machine فعلی از Expo/API کشف و در `ROUTE_REGISTRY.md` قفل شده باشد.
2. contract همین خانواده و `COMPONENT_READINESS.md` خوانده شده باشد؛ outcome/focal/CTA/depth/anti-pattern ثبت شود.
3. stateهای قابل‌اعمال در `NATIVE_IMPLEMENTATION_BACKLOG.csv` بدون `TBD` مشخص باشند.
4. نیازمندی content/audio از staged contract بیاید؛ نبود صوت lesson را مسدود نکند.
5. reducer/use-case و navigation acceptance پیش از جزئیات بصری نوشته شود.

## Definition of Done هر route

- immutable `UiState` + explicit `Action/Effect`، state restoration و idempotency؛
- unit/ViewModel/semantics tests و screenshotهای 360/390/412 + large text؛
- بررسی RTL/math direction، IME/safe area، offline/error/resume و rapid taps؛
- device evidence برای predictive Back، TalkBack، audio/haptic و process recreation؛
- امتیازهای بحرانی rubric حداقل 3، P0/P1 صفر، ledger و backlog به‌روز؛
- zero-consumer proof پیش از حذف implementation قبلی.
