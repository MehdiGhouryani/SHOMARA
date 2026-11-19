# اتصال شخصیت‌های شمارا به Home UI

## منبع رسمی

| شخصیت | کاربرد پیشنهادی | فایل رسمی در checkout |
|---|---|---|
| Main | همراه کوچک در header یا پیام ادامه | `apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_main_01.webp` و `shomara_char_main_10.webp` |
| Number | همراه مفهوم عدد، شمارش یا manipulatives | `apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_number_01.webp` و `shomara_char_number_17.webp` |
| Fandogh | hint یا empty state تمرین، در صورت ارتباط | `docs/design-handoff-2026-10/assets/characters/Fandogh/Fandogh_01_front_app_800.webp` |

موجودی دقیق و provenance در `apps/mobile/assets/characters-v1/PROVENANCE.json` نیز ثبت شده است. `Main_...` و `Number_...` Native فعلی را تکرار نکنید. اگر Fandogh در drawable-nodpi وجود ندارد، `install_fandogh_native.py` فایل رسمی را copy می‌کند.

## قرارداد نمایش

- فقط pose تأییدشده و static؛ pose جدید را با transform یا redraw نسازید.
- `ContentScale.Fit`; بدون crop غیرضروری و بدون برش نقاط هویتی کاراکتر.
- اندازهٔ header character slot برابر 72dp و مطابق `ShomaraCharacterSlot.Inline`؛ کاراکتر هیچ‌گاه بزرگ‌تر از focal learning task نباشد.
- تصویر باید decorative semantics داشته باشد (`contentDescription = null`) وقتی متن کنار آن پیام را کامل می‌کند؛ اگر شخصیت تنها حامل پیام است، label توصیفی کوتاه بدهید.
- character art را داخل Canvas رسم نکنید و به عنوان background scroll نکنید.
- در screen preview، placeholder صرفاً slot را نشان می‌دهد؛ در اپ واقعی باید با source واقعی پروژه جایگزین شود.

## عدم مجاز بودن

- هیچ pose یا expression جدید با ImageGen ساخته نشود و به عنوان asset canonical جا زده نشود.
- Fandogh را با animal clipart تصادفی جایگزین نکنید.
- character را برای پوشاندن نبود content یا خطای داده نمایش ندهید.

## نمونهٔ اتصال Native تأییدشده

برای Main در Header، pose رسمی 01 را با slot دقیق Inline (72dp) بدهید:

```kotlin
ShomaraHomeHeader(
    title = state.title,
    subtitle = state.subtitle,
    onSettings = { onEvent(ShomaraHomePathEvent.OpenSettings) },
    characterSlot = {
        ShomaraCharacterImage(
            character = ShomaraCharacter.Main,
            poseId = 1,
            slot = ShomaraCharacterSlot.Inline,
            decorative = true,
        )
    },
)
```

برای Number کنار محتوای شمارش، pose front برابر 01 و pose اشاره‌گر رسمی برابر 17 است. نمونهٔ pose اشاره‌گر:

```kotlin
ShomaraCharacterImage(
    character = ShomaraCharacter.Number,
    poseId = 17,
    slot = ShomaraCharacterSlot.Inline,
    decorative = true,
)
```

هر دو باید با slot موجود پروژه و `ContentScale.Fit` نمایش داده شوند. `ShomaraCharacterImage` فقط poseهایی را نشان می‌دهد که در `ShomaraCharacterDrawables` whitelist شده‌اند؛ داشتن فایل handoff به‌تنهایی به معنی shipped native pose نیست.

Fandogh هنوز در enum فعلی `ShomaraCharacter` نیست. پس از `install_fandogh_native.py` می‌توان resource `R.drawable.shomara_char_fandogh_01` را با `Image(painterResource(...), contentScale = ContentScale.Fit)` استفاده کرد؛ contentDescription فقط وقتی لازم است که خود تصویر به‌تنهایی معنا منتقل کند. تا زمان تصمیم registry، او را به `ShomaraCharacterImage` نسبت ندهید.
