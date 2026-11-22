# شاهد دستگاه — Native (emulator)

این سند **روش** و **نتایج** شاهدگیری روی دستگاه را نگه می‌دارد. تصاویر عمداً track نمی‌شوند،
چون قاعدهٔ موجود مخزن همین است: `**/parity/out/` و `build-reports/` بازتولیدشدنی‌اند و فقط سند
track می‌شود. تصاویر در `build-reports/android/device-evidence/` ساخته می‌شوند.

## چطور تکرار کنیم

    # 1) بوت emulator (روی PATH نیست)
    D:\SDK\emulator\emulator.exe -avd Pixel_6a -no-window -no-audio -no-boot-anim -no-snapshot -gpu swiftshader_indirect

    # 2) انتظار برای بوت
    D:\SDK\platform-tools\adb.exe wait-for-device
    D:\SDK\platform-tools\adb.exe shell getprop sys.boot_completed    # باید 1 باشد

    # 3) تست‌های instrumented
    cd apps\android
    .\gradlew.bat :core:designsystem:connectedDebugAndroidTest :feature:lesson:connectedDebugAndroidTest :feature:path:connectedDebugAndroidTest --console=plain

    # یک کلاس مشخص (آرگومان باید در کوتیشن باشد — pwsh آن را می‌شکند)
    .\gradlew.bat :feature:lesson:connectedDebugAndroidTest "-Pandroid.testInstrumentationRunnerArguments.class=com.mathlearning.feature.lesson.ShomaraStationExitSheetTest"

    # 4) اپ و اسکرین‌شات
    npm run android:assemble:debug
    adb install -r apps/android/app/build/outputs/apk/debug/app-debug.apk
    adb shell am start -n com.mathlearning.app/.MainActivity
    adb shell screencap -p /sdcard/shot.png
    adb pull /sdcard/shot.png native-412dp.png

    # 5) شاهد متنی (چیزی که مستقل از تصویر قابل خواندن است)
    adb shell uiautomator dump /sdcard/ui.xml
    adb pull /sdcard/ui.xml ui-home.xml

**هشدار روش:** `adb exec-out screencap -p > file.png` در PowerShell جریان باینری را **متنی**
می‌نویسد و PNG را خراب می‌کند (فایل اندازهٔ طبیعی دارد ولی decode نمی‌شود). همیشه
`screencap` روی دستگاه + `adb pull`.

## نتیجهٔ اجراها

- **instrumented (emulator-5554, Pixel_6a, Android 15/API 35):** ۴۸/۴۸ سبز در سه ماژول
  (`core:designsystem` ۴۰، `feature:lesson` ۶، `feature:path` ۲).
- **اپ دیباگ** نصب و اجرا شد؛ اسکرین‌شات در عرض‌های ۳۶۰/۳۹۰/۴۱۲dp، فونت ۲۰۰٪، و مسیر deep-link.
  همه ۱۰۸۰x۲۴۰۰ و با `System.Drawing` اعتبارسنجی شدند (۶۱۲–۸۲۸ رنگ متمایز ⇒ فریم واقعی).

## شاهدهای رفتاری (از درخت دسترس‌پذیری، نه از نگاه کردن)

1. **RTL واقعی است:** در انتخاب پایه، «پایه اول» در ستون راست `[583,1310][943,1385]` و «پایه دوم»
   در ستون چپ `[137,1310][498,1385]` — آیتم اول سمت راست.
2. **R-05:** deep-link `mathlearning://lesson/ST07` قفل مسیر را دور نمی‌زند؛ شیت «ایستگاه ۷ از ۲۵ —
   فصل ۲» + «این ایستگاه هنوز باز نشده؛ ایستگاه فعلی مسیر را کامل کن تا باز شود.» + «متوجه شدم».
3. **فونت ۲۰۰٪:** همان ۹ گره متنی، صفر گره بیرون از ۱۰۸۰x۲۴۰۰، ارتفاع‌ها رشد (۷۵px → ۱۲۹px) و
   چیدمان دو ستونی حفظ.

## هنوز UNVERIFIED

- **بازبینی بصری:** مدل اجراکننده ورودی تصویر ندارد؛ ابعاد/غیرخالی‌بودن/متن/مختصات بررسی شد،
  اما زیبایی و هم‌ترازی دقیق تأیید نشده. برای بستن این مورد یک بازبین با ورودی تصویر لازم است.
- **TalkBack واقعی:** فقط `uiautomator dump` (درخت دسترس‌پذیری)؛ ناوبری با اسکرین‌ریدر اجرا نشده.
- **دستگاه فیزیکی:** همهٔ شواهد بالا از emulator است؛ رفتار روی سخت‌افزار واقعی (اندازهٔ فونت
  سیستمی، velocity، پرفورمنس) سنجیده نشده.
- **SCREEN_LEDGER:** ردیف‌های ledger مربوط به مسیرهای Web/Expo هستند (`source_path` = `apps/mobile/...`)
  و ستون `native_screenshot` آن‌ها `NATIVE_PENDING` است. پر کردن آن با سطح Native دیگر، ledger را
  بی‌معنی می‌کند ⇒ دست‌نخورده ماند. **تصمیم مالک:** ردیف Native در همان ledger، یا ledger جدا برای Native.
