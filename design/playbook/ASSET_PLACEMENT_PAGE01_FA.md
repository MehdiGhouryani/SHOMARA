# جایگذاری فایل‌های تصویری صفحه ۰۱-launch — ASSET_PLACEMENT

## چرا این فایل لازم است

۱۲ فایل PNG باینری هستند و با روش push تصویری (snapshot، فقط UTF-8)
نمی‌شود آن‌ها را به گیت‌هاب فرستاد. کد به آن‌ها با نام منبع
(`R.drawable.shomara_launch_*`) ارجاع می‌دهد؛ پس **قبل از اجرای گیت‌ها**
هارنس باید فایل‌ها را به‌صورت محلی در پوشهٔ `drawable-nodpi` کپی کند و
با sha256 بررسی کند. تا وقتی PNGها کپی نشده‌اند، کد کامپایل نمی‌شود —
این مورد انتظار است و باگ نیست.

مبدأ: فایل زیپ `01-launch-assets.zip` که مالک در چت فرستاد (۱۲ PNG شفاف
RGBA + ‏`manifest.json` + ‏`preview_contact_sheet.jpg`).
مقصد: `apps/android/core/designsystem/src/main/res/drawable-nodpi/`
(پوشه از قبل وجود دارد؛ ۴ WebP شخصیت‌ها آنجاست).

## نقشهٔ دقیق کپی (نام زیپ → نام drawable)

| فایل در زیپ | فایل در drawable-nodpi | اندازهٔ اصلی | sha256 |
|---|---|---|---|
| mascot_bow_character.png | shomara_launch_mascot_bow_character.png | 743×698 | 8f2d03452fff9f730bcf4ff38f7ac60967d9ab5906ce6701236c2f202f9175b6 |
| number_1.png | shomara_launch_number_1.png | 236×304 | bb661138e5ff7acf4acb7231514a28d90b9026487ea0d3c906c5b76403b8a780 |
| number_2.png | shomara_launch_number_2.png | 241×300 | 4df69533c1b8f98882109fb2eea3d53852a1c5b9dac11341f896dca791a13229 |
| plus_sign.png | shomara_launch_plus_sign.png | 243×243 | 7d23e82599a88da76832c36c6b01a9f15c34a0b5017e33bed25723ceec4ff6c6 |
| division_sign.png | shomara_launch_division_sign.png | 220×255 | 23a2bb800d0025e0b0acbf2e909575a5b2d4d91b755dfd9ef588a0e9728cb9de |
| small_yellow_star.png | shomara_launch_small_yellow_star.png | 172×161 | 68dca175ceab4ad5344d9be8572a8df8334e430187819b83f8e97c6b0d56f3a8 |
| large_yellow_star.png | shomara_launch_large_yellow_star.png | 233×225 | 4f75a986ac2c75770d65bdb0cfdeecee94c0b802c514e566307fde96ea4b3f07 |
| top_yellow_spark.png | shomara_launch_top_yellow_spark.png | 161×169 | 7854fe246e24eed2afcd834132c5598a75473dbcfeffb10820236f8bea9c681c |
| bottom_yellow_spark.png | shomara_launch_bottom_yellow_spark.png | 196×200 | 8becb525c6e1ae53cfaca478f900f7c651fdc5512003550b688b3786420f13bc |
| white_cloud.png | shomara_launch_white_cloud.png | 253×186 | 667a9bedcbba714169beea160ae8f53fc649c71c20454acd6d4ef32a59765d74 |
| left_green_plant.png | shomara_launch_left_green_plant.png | 443×265 | 7527194994e6afb62520b373c2f0305c3498f4bfce75448725c3daca21f20a85 |
| right_green_plant.png | shomara_launch_right_green_plant.png | 461×261 | c31be50d8e2591010820b03ca4c90e477e816781178eeb22f357289791e76cf6 |

نکته‌ها:
- هیچ فایلی تغییر نام محتوایی نداده؛ فقط پیشوند `shomara_launch_` اضافه شده تا با الگوی `ShomaraCharacterDrawables` (‏`shomara_char_*`) هماهنگ باشد.
- ‏`manifest.json` و `preview_contact_sheet.jpg` کپی نمی‌شوند؛ فقط ۱۲ PNG.
- فایل splash (`shomara_splash_artwork.png`) دست نخورده می‌ماند.

## دستورهای هارنس (PowerShell، روی سیستم مالک)

مسیرها را با مسیر واقعی خودت جایگزین کن (`$ZipPath` جایی است که فایل
`01-launch-assets.zip` را ذخیره کرده‌ای؛ `$RepoRoot` ریشهٔ ریپو):

```powershell
$RepoRoot = "D:\Projects\Shomara\SHOMARA"
$ZipPath  = "$env:USERPROFILE\Downloads\01-launch-assets.zip"
$Dest     = "$RepoRoot\apps\android\core\designsystem\src\main\res\drawable-nodpi"

Expand-Archive -Path $ZipPath -DestinationPath "$env:TEMP\01-launch-assets" -Force
$Src = "$env:TEMP\01-launch-assets"

Copy-Item "$Src\mascot_bow_character.png"  "$Dest\shomara_launch_mascot_bow_character.png" -Force
Copy-Item "$Src\number_1.png"              "$Dest\shomara_launch_number_1.png" -Force
Copy-Item "$Src\number_2.png"              "$Dest\shomara_launch_number_2.png" -Force
Copy-Item "$Src\plus_sign.png"             "$Dest\shomara_launch_plus_sign.png" -Force
Copy-Item "$Src\division_sign.png"         "$Dest\shomara_launch_division_sign.png" -Force
Copy-Item "$Src\small_yellow_star.png"     "$Dest\shomara_launch_small_yellow_star.png" -Force
Copy-Item "$Src\large_yellow_star.png"     "$Dest\shomara_launch_large_yellow_star.png" -Force
Copy-Item "$Src\top_yellow_spark.png"      "$Dest\shomara_launch_top_yellow_spark.png" -Force
Copy-Item "$Src\bottom_yellow_spark.png"   "$Dest\shomara_launch_bottom_yellow_spark.png" -Force
Copy-Item "$Src\white_cloud.png"           "$Dest\shomara_launch_white_cloud.png" -Force
Copy-Item "$Src\left_green_plant.png"      "$Dest\shomara_launch_left_green_plant.png" -Force
Copy-Item "$Src\right_green_plant.png"     "$Dest\shomara_launch_right_green_plant.png" -Force

$Expected = @{
  "shomara_launch_mascot_bow_character.png" = "8f2d03452fff9f730bcf4ff38f7ac60967d9ab5906ce6701236c2f202f9175b6"
  "shomara_launch_number_1.png"            = "bb661138e5ff7acf4acb7231514a28d90b9026487ea0d3c906c5b76403b8a780"
  "shomara_launch_number_2.png"            = "4df69533c1b8f98882109fb2eea3d53852a1c5b9dac11341f896dca791a13229"
  "shomara_launch_plus_sign.png"           = "7d23e82599a88da76832c36c6b01a9f15c34a0b5017e33bed25723ceec4ff6c6"
  "shomara_launch_division_sign.png"       = "23a2bb800d0025e0b0acbf2e909575a5b2d4d91b755dfd9ef588a0e9728cb9de"
  "shomara_launch_small_yellow_star.png"   = "68dca175ceab4ad5344d9be8572a8df8334e430187819b83f8e97c6b0d56f3a8"
  "shomara_launch_large_yellow_star.png"   = "4f75a986ac2c75770d65bdb0cfdeecee94c0b802c514e566307fde96ea4b3f07"
  "shomara_launch_top_yellow_spark.png"    = "7854fe246e24eed2afcd834132c5598a75473dbcfeffb10820236f8bea9c681c"
  "shomara_launch_bottom_yellow_spark.png" = "8becb525c6e1ae53cfaca478f900f7c651fdc5512003550b688b3786420f13bc"
  "shomara_launch_white_cloud.png"         = "667a9bedcbba714169beea160ae8f53fc649c71c20454acd6d4ef32a59765d74"
  "shomara_launch_left_green_plant.png"    = "7527194994e6afb62520b373c2f0305c3498f4bfce75448725c3daca21f20a85"
  "shomara_launch_right_green_plant.png"   = "c31be50d8e2591010820b03ca4c90e477e816781178eeb22f357289791e76cf6"
}
foreach ($name in $Expected.Keys) {
  $hash = (Get-FileHash "$Dest\$name" -Algorithm SHA256).Hash.ToLower()
  if ($hash -ne $Expected[$name]) { throw "SHA256 mismatch: $name (got $hash)" }
}
Write-Host "All 12 launch PNGs copied and verified."
```

اگر هر هش ناهمخوان بود: **کپی را متوقف کن، چیزی را کامیت نکن** و خطا را
گزارش بده — یعنی فایل زیپ با فایلی که اینجا بررسی شده فرق دارد.

## ترتیب کار

1. برنچ `page-01-launch` را از `main` بساز و کد مرحله‌شده را push کن
   (فقط کد؛ PNGها با snapshot فرستاده نمی‌شوند).
2. PNGها را با دستور بالا کپی و بررسی کن.
3. بعد `verify:static:all` و `android:gate` را اجرا کن — نه قبل از کپی.
4. بعد از سبز شدن گیت‌ها، بررسی دستگاه (اسکرین‌شات ۳۶۰/۳۹۰/۴۱۲dp، فونت
   ۲۰۰٪، TalkBack) و بعد صفحهٔ بعدی.
