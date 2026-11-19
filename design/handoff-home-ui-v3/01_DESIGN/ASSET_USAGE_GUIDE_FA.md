# راهنمای استفاده از هر نوع فایل

## SVG source
در `02_ASSETS/svg/` برای Figma/Illustrator و preview نگهداری می‌شود. در Android runtime آن را با SVG loader به UI اضافه نکنید؛ VectorDrawable متناظر را استفاده کنید. هر تصویر فقط glyph دارد؛ متن label/semantics در Compose بماند.

## Android VectorDrawable XML
`02_ASSETS/android/drawable/*.xml` را در `apps/android/core/designsystem/src/main/res/drawable/` کپی کنید. resource nameها lowercase و underscore هستند. نسخه active/inactive آیکون bottom nav از دو resource مجزا استفاده می‌کند؛ tint runtime روی رنگ‌های طراحی‌شده overwrite نشود، مگر که کد پروژه این الگو را ایجاب کند.

## WebP background
`02_ASSETS/backgrounds/garden_path_footer.webp` فقط تزئین bottom/edge است؛ content-bearing نیست و نباید زیر text مهم قرار بگیرد. alpha دارد و برای scale width با ContentScale.FillWidth استفاده شود. اگر render آن گران شد یا در preview اندازهٔ خوبی نداشت، SVG fallback `garden_path_footer.svg` قابل استفاده است.

## Character WebP
از resourceهای رسمی repo استفاده کنید؛ فایل‌های تکراری را وارد ZIP یا APK نکنید. مسیر exact در `CHARACTER_PLACEMENT_FA.md` و ابزار verify آمده.

## Kotlin reference
فایل‌های `03_ANDROID/kotlin` الگوی reference هستند. قبل از کپی: package/imports، نسخه Compose، APIs فعلی، design token source، resource namespace، navigation owner و test conventions را با repo تطبیق دهید. همهٔ composableهای screen باید stateless باشند و state/side effect در ViewModel باشد.

## JSON specs
`HOME_VISUAL_TOKENS.json` توکن محلی visual layer؛ `RESPONSIVE_LAYOUT_SPEC.json` ابعاد و breakpoint؛ `STATE_AND_INTERACTION_MATRIX.json` state machine و interaction. هیچ کدام مجوز hardcode کردن progress یا curriculum نیست.
