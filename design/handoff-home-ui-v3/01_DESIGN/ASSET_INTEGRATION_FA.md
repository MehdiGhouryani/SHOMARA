# نصب و اتصال دارایی‌ها در مخزن

## فایل‌های برداری

### Linux / macOS / Git Bash

از root مخزن اجرا کنید:

```bash
bash SHOMARA_HOME_UI_HANDOFF_v3/02_ASSETS/COPY_ANDROID_DRAWABLES.sh .
```

### Windows PowerShell

```powershell
.\SHOMARA_HOME_UI_HANDOFF_v3\02_ASSETS\COPY_ANDROID_DRAWABLES.ps1 -RepoRoot .
```

Scriptها در صورت وجود فایل هم‌نام و متفاوت، fail می‌شوند و فایل را overwrite نمی‌کنند. Conflict را دستی با resource موجود ادغام کنید.

## فایل زمینه

`02_ASSETS/backgrounds/garden_path_footer.webp` اختیاری است. اگر با screenshot واقعی ثابت شد که decorative footer مفید است، آن را در ماژول مناسب به `res/drawable-nodpi/` منتقل کنید. اگر به scrolling یا contrast لطمه می‌زند، اصلاً وارد APK نکنید.

## شخصیت‌ها

- Main و Number از قبل در native drawable-nodpi موجودند. آن‌ها را دوباره وارد ZIP یا resource folder نکنید.
- Fandogh در handoff رسمی design موجود است. اگر native drawable ندارد، از `03_ANDROID/tools/install_fandogh_native.py --repo-root .` استفاده کنید.
- script اعتبارسنجی را اجرا کنید: `python SHOMARA_HOME_UI_HANDOFF_v3/03_ANDROID/tools/verify_character_sources.py --repo-root .`

## Compose source

قبل از افزودن هر Kotlin reference:
1. فایل موجود در مخزن را بخوانید.
2. APIهای موجود را با reference تطبیق دهید.
3. فایل تکراری را وارد نکنید؛ در صورت نیاز یک adapter باریک یا icon slot به component موجود اضافه کنید.
4. importها، resources، namespace و APIهای Material3 را با نسخهٔ واقعی Gradle هماهنگ کنید.
5. compile و unit/UI tests را اجرا کنید.

این بسته به طور خودکار چیزی را به مخزن GitHub push یا commit نمی‌کند.
