# نقشهٔ استفاده از Main، Number و Fandogh

| نقش | دارایی | صفحه/جایگاه | اندازهٔ مرجع | ممنوعیت |
|---|---|---|---|---|
| Main / پوفی | Main_01 front و Main_10 wave موجود در Native | cameo کنار heading/header | 72dp (Native Inline slot) | hero تمام‌قد، تکرار در کنار هر node، pose جدید |
| Number | Number_01 front و Number_17 pointing موجود در Native | کارت ادامه/تمرین عددی | 72dp (Inline) یا 84dp (Lesson) | استفادهٔ عمومی در هر فصل بدون ارتباط محتوایی |
| Fandogh / سنجاب | Fandogh_01 front از handoff رسمی | empty/practice guide یا کنار یک راهنمایی | 56–72dp | استخراج از screenshot یا تولید off-model |

اصل composition: 0 تا 2 شخصیت در viewport؛ در بیشتر حالات فقط یک cameo. در nodeها از آیکون topic و state symbol استفاده شود. ImageContentScale.Fit و transparent padding باید حفظ شود؛ crop فقط با bounding box رسمی asset registry.

در Native، Main و Number را با `ShomaraCharacterImage` و `ShomaraCharacterSlot.Inline` (72dp) رندر کنید؛ در Header از `forContentWidth()` برای انتخاب Hero بزرگ استفاده نکنید، چون این محل عمداً cameo است. Fandogh هنوز عضو enum/renderer Native `ShomaraCharacter` نیست؛ پس از اجرای installer با resource رسمی `shomara_char_fandogh_01` و `ContentScale.Fit` استفاده شود، یا قبل از افزودن به renderer برای او ADR/registry رسمی ثبت گردد.
