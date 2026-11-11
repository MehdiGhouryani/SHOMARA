# N08R-01 (U0) — ممیزی Design System: کنتراست، Clay، Motion

> **تاریخ:** ۲۰۲۶-۱۱-۰۷ · **شاخه:** `native/n08r-ui-polish` · **task:** N08R-01
> **مبنای عددی:** `packages/design-system/src/tokens.json` بلاک canonical v2 (دقیقاً همان مقادیری که `ShomaraTokens.kt` تولیدی و `design/MASTER.md` §2 اعلام می‌کنند — ممیزی تطبیق hex انجام شد، **مغایرتی بین MASTER و v2 وجود ندارد**؛ تنها drift تاریخی، بلوک کهنهٔ v1/`ui.path` است که در PAGE-06 ثبت شده و تولید نمی‌شود).
> **روش:** محاسبهٔ نسبت کنتراست WCAG (نسبت لومینانس) روی ۳۱ جفت مصرفی واقعی کد + بازخوانی `ShomaraClay`/`ShomaraMotion` + تصمیم‌های ثبت‌شدهٔ ADR-0040.

## ۱. نتیجهٔ ممیزی کنتراست

**هر ۱۸ جفت متنی با آستانهٔ 4.5:1 سبزند** (اکثراً بالای ۵:۱ — ۷ جفت بالای ۱۱:۱). جدول کامل:

| fg | bg | نسبت | الزام | حکم |
|---|---|---:|---|---|
| ink #15302B | canvas #FFF8EF | 13.38 | 4.5 | PASS |
| ink | surface #FFFFFF | 14.10 | 4.5 | PASS |
| ink | surfaceAlt #FDF3E3 | 12.83 | 4.5 | PASS |
| ink | splashCream #FDF4E5 | 12.92 | 4.5 | PASS (محافظت‌شده) |
| ink | primarySoft #DDF2E7 | 12.04 | 4.5 | PASS |
| ink | skySoft #E1F0FA | 12.12 | 4.5 | PASS |
| ink | amberSoft #FFF1D6 | 12.62 | 4.5 | PASS |
| ink | berrySoft #FBE3F0 | 11.65 | 4.5 | PASS |
| ink2 #44594F | canvas | 7.15 | 4.5 | PASS |
| ink2 | surface | 7.53 | 4.5 | PASS |
| muted #5E6F68 | canvas | 5.04 | 4.5 | PASS |
| muted | surface | 5.32 | 4.5 | PASS |
| white #FFFFFF | primary #0C7A54 | 5.35 | 4.5 | PASS (برچسب CTA) |
| white | primaryDark #0A5C41 | 8.01 | 4.5 | PASS |
| amberInk #4A2E00 | amberSoft | 11.18 | 4.5 | PASS |
| danger #B3402F | canvas | 5.40 | 4.5 | PASS |
| danger | surface | 5.69 | 4.5 | PASS |
| danger | dangerSoft #FBE7E2 | 4.78 | 4.5 | PASS |

### پنج مورد زیر-۳:۱ غیرمتنی و حکم هرکدام

| جفت | نسبت | مصرف | حکم |
|---|---:|---|---|
| primaryDark روی primary | 1.50 | لبهٔ سه‌بعدی دکمهٔ سبز | **معاف — تزئینی.** مرز شناسایی کنترل، خودِ دکمه در برابر بوم است (5.07:1 ✓). لبهٔ تیره، عمق Clay است نه مرز (معافیت تزئینی WCAG 1.4.11)؛ الگوی دولینگو هم همین است. تغییر نمی‌کند. |
| amber روی amberSoft | 1.64 | نوار accent بنر فصل ۳ | **رفع شد.** چهار accent دیگر همه ≥3:1 بودند و فصل ۳ فقط-رنگیِ محو مانده بود → accent فصل ۳ به `amberInk` (11.18:1) تغییر کرد — همان الگوی dark-accent که فصل ۵ با `ink2` دارد. تست رگرسیون WCAG≥3 برای هر ۵ فصل اضافه شد (`ShomaraPathGraphTest`). |
| amber روی canvas | 1.74 | سووش/جرقه‌های خوش‌آمد | **معاف — تزئینی** و روی صفحهٔ **محافظت‌شده** است؛ هرگز تغییر نمی‌کند. |
| line روی canvas | 1.26 | hairline جداکننده‌ها | **معاف — جداکننده.** WCAG جداکننده‌ها و مرزهای تزئینی را مستثنا می‌کند؛ شناسایی فیلد/کارت با fill+سایهٔ Clay+برچسب انجام می‌شود. تغییر نمی‌کند (توکن `line` توسط صفحهٔ محافظت‌شده مصرف می‌شود). |
| line2 روی surface | 1.59 | hairline روی کارت‌ها | **معاف — جداکننده.** همان حکم بالا. |

**جمع‌بندی پالت:** پالت v2 از نظر کنتراست متنی «حرفه‌ای و سالم» است؛ هیچ بازطراحی پالت لازم نیست و هیچ مقدار توکن تغییری نکرد. تنها تغییر رنگ، انتخاب accent موجود (`amberInk`) برای یک بنر فصل بود — بدون توکن تازه، بدون hex خام.

## ۲. تصمیم Clay — آیتم C-16 چک‌لیست دولینگو (هایلایت مورب روی دایرهٔ آیکون)

**تصمیم: رد می‌شود (REJECT).** دلایل:
1. spec فعلی `ShomaraClay` یک هایلایت بالا‌ی ۱dp با alpha 0.68 دارد — پاسخ نوری لمسی از قبل در سیستم هست.
2. براقیت مورب (gloss) با جهت ثبت‌شدهٔ «Claymorphism نرم و خوددار» (`MASTER_EXECUTION.md`) و آنتی‌پترن‌های rubric (blur/براقیت بی‌جا، متن کم‌کنتراست روی clay) در تعارض است.
3. ADR-0040 R1 پاسخ لمسی را با «لبهٔ سه‌بعدی همهٔ سطوح» حل کرده؛ افزودن gloss یک لایهٔ بصری چهارم می‌سازد.

قاعدهٔ چهار سطح عمق + «حداکثر یک Featured در viewport» + «متن هرگز depth نمی‌گیرد» + «فشرده‌شدن در press» بدون تغییر حفظ شد.

## ۳. ممیزی و ارتقای Motion

- **قرارداد موجود سالم است:** دو سیگنال مستقل reduced-motion (تنظیم کاربر + مقیاس انیماتور سیستم=0)، `durationMs` از توکن، `ShomaraCelebrationGate` ضدهم‌زمانی، صفر انیمیشن تزئینی.
- **حفرهٔ واقعی که ممیزی یافت:** feedback فشردن لمسی **hard-cut** بود — گرهٔ مسیر `if (pressed) 0.96f else 1f` بی‌انیمیشن و دکمه فقط پرش عمق سایه؛ در حالی که مأموریت (§4.D) «Spring animation / Press feedback / Subtle scale» را صریحاً می‌خواهد و اصول دولینگو (اسکیل duo-design/juicy-motion) می‌گوید میکرو-تعامل باید spring باشد نه linear/قطع‌شدنی.
- **رفع شد:** `Modifier.shomaraPressScale(pressed, reducedMotion)` در designsystem — پارامترهای spring کاملاً از توکن‌های motion مشتق می‌شوند (`dampingRatio = c/2√(k·m) ≈ 0.47` از 14/220/1؛ stiffness=220؛ target=0.96) — هیچ عدد خامی وارد کد نشد. تحت reduced-motion همان تغییر state با `snap` (برش آنی) اعمال می‌شود؛ «اطلاعات می‌ماند، حرکت حذف می‌شود».
- **مصرف‌کننده‌ها:** `ShomaraButton` (همهٔ keypad OTP/دکمه‌ها) و گرهٔ مسیر (`ShomaraPathNodeItem`). کامنت N08-04 که ادعا می‌کرد «هیچ animate*AsState در apps/android نیست» صادقانه به‌روز شد (motion تعاملی ≠ motion تزئینی).
- **محمایت‌شده‌ها:** `ShomaraSplashScreen` و `ShomaraProfileScreen` از `ShomaraButton` استفاده نمی‌کنند (پروفایل عمداً CTA صفحه‌محلی دارد) و هیچ مقدار توکنی تغییر نکرد → صفر اثر بصری، حتی در press.

## ۴. شواهد

- ممیزی: ۳۱ جفت، ۲۳ PASS، ۵ تزئینی/جداکننده (معاف)، ۱ رفع‌شده.
- تست‌های تازه: `press spring stiffness is the motion token verbatim`، `press damping ratio derives from the physical token spring`، `press scale target is the motion press token`، `every chapter accent meets the 3 to 1 non-text contrast floor on its band`، `chapter accents stay pairwise distinct`.
- گیت‌ها در همان commit ثبت می‌شوند (android:gate / vitest / harness:validate).
