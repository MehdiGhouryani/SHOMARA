# SHOMARA inspiration guardrails

این سند ترجمهٔ منابع الهام به تصمیم‌های قابل اجراست. منبع حقیقت بصری همچنان `design/MASTER.md` و tokenهای canonical هستند؛ هیچ منبع بیرونی به runtime یا build وابستگی ایجاد نمی‌کند.

## تقدم تصمیم‌ها

ایمنی کودک، قرارداد محصول و server truth ← محتوای تأییدشده ← Design System SHOMARA ← اصول الهام ← سلیقهٔ صفحه.

اگر الهام با دسترس‌پذیری، وضوح آموزشی، فارسی/RTL یا قرارداد دامنه تعارض داشت، کنار گذاشته می‌شود.

## ماتریس adopt / adapt / reject

| منبع | می‌پذیریم | برای SHOMARA تطبیق می‌دهیم | رد می‌کنیم |
|---|---|---|---|
| Duolingo | learning-by-doing، micro-loop، feedback فوری، hierarchy روشن، craft و consistency | جلسهٔ کوتاه بدون اقتصاد اعتیادآور؛ assessment آرام‌تر از teaching | کپی صفحه/رنگ/کاراکتر/متن، lives، streak تنبیهی، leaderboard و currency |
| AVA | درس‌آموخته‌های معماری، فرایند QA و تفکیک محتوا از runtime | فقط پس از تطبیق با قراردادهای SHOMARA | کد، asset، هویت، نام‌گذاری یا رفتار ناسازگار با SHOMARA |
| UI/UX Pro Max | design-system-first، انتخاب آگاهانهٔ pattern/style/type/motion، ثبت anti-pattern و pre-delivery review | جست‌وجوی گزینه‌ها به decision record داخلی و tokenهای موجود محدود می‌شود | نصب generator، palette/font تصادفی، dependency یا override منبع canonical |
| Claymorphism | عمق برای hierarchy، سطح لمسی، press feedback و focus | clay محدود و semantic؛ assessment تخت‌تر و آرام‌تر | blur فراگیر، سایهٔ کم‌کنتراست، depth روی متن، container برای همه‌چیز |

## design dials پیش‌فرض

این اعداد requirement بصری نیستند؛ نقطهٔ شروع review هستند و هر انحراف باید دلیل داشته باشد.

| سطح | Variance | Motion | Density | توضیح |
|---|---:|---:|---:|---|
| teaching/discovery | 5/10 | 4/10 | 3/10 | یک manipulative برجسته، حرکت کوتاه و فضای تنفس زیاد |
| guided practice | 4/10 | 3/10 | 4/10 | تمرکز روی task و feedback، decoration محدود |
| assessment | 2/10 | 2/10 | 3/10 | کمترین حواس‌پرتی؛ object ریاضی hero است |
| child shell/path | 4/10 | 3/10 | 4/10 | مسیر قابل فهم، hierarchy ثابت، وضعیت قفل روشن |
| parent/settings | 2/10 | 2/10 | 5/10 | کاربردی، متنی‌تر و بدون clay تزئینی |

## تصمیم اجباری قبل از UI

برای هر route یا component موارد زیر را در review card ثبت کن:

1. outcome کودک و state دقیق؛
2. focal object و تنها CTA اصلی؛
3. اطلاعاتی که با type، color، shape و depth منتقل می‌شوند؛
4. stateهای loading/offline/error/empty/disabled/pressed/selected؛
5. نقش Clay و دلیل وجود هر depth tier؛
6. anti-patternهای مختص صفحه؛
7. اثر فارسی/RTL، math direction، TalkBack و font scale؛
8. evidence لازم برای ادعای پیاده‌سازی یا آزمون.

## آزمون «حذف کن و ببین»

هر decoration، card یا animation را موقتاً حذف کن. اگر task واضح‌تر یا دسترس‌پذیرتر شد، آن عنصر برنمی‌گردد. اگر hierarchy از بین رفت، عنصر باید با token semantic و کمترین شدت لازم بازگردد.

## منابع پژوهشی، نه dependency

- UI/UX Pro Max: `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`
- Duolingo design craft: `https://blog.duolingo.com/core-tabs-redesign/`
- W3C accessibility guidance: `https://www.w3.org/TR/wcag3/`

هیچ نسخه، آمار، palette یا snippet خارجی در این سند قرارداد runtime محسوب نمی‌شود.
