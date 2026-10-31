# Onboarding journey readiness — N04 (2026-10-31)

وضعیت صادقانهٔ سفر ورود (Launch → Welcome → Phone → OTP → Profile → Grade → ReadyForChildShell) در کلاینت Android Native. قرارداد مشترک: `design/playbook/COMPONENT_READINESS.md`؛ وضعیت‌ها فقط با شواهد نام‌برده تغییر می‌کنند.

## قراردادهای پیاده‌شده (Native، با شواهد)

| بخش | قرارداد | شواهد |
|---|---|---|
| UI-001 Launch/Bootstrap | `ShomaraLaunchState` (Resolving/NewUser/RestoringSession/RecoverIncompleteProfile/Offline/Error) در `:core:model`؛ نگه‌داشت fail-closed (Offline/Error → onboarding با بنر گرم؛ Resolving هیچ سطح کودکی رندر نمی‌کند) | `OnboardingContractV2Test` |
| UI-001 بدون مهمان | `ShomaraOnboardingFlow.GuestEntryAllowed = false` — ورود بدون احراز هویت ممکن نیست | `OnboardingContractTest` |
| UI-002 Welcome/Phone | نرمال‌سازی ارقام فارسی/عربی + پیشوندها → فرم `09XXXXXXXXX`؛ خطای متنی گرم؛ back map قطعی؛ CTA gated | `WelcomePhoneTest` |
| UI-003 OTP | پیشرفت LTR ارقام، paste (`fillFromCode` با سقف)، expired (`markExpired` + برچسب گرم)، throttle محلی + 429/Retry-After، timeout/offline | `ShomaraOtpApiTest`، `OnboardingContractV2Test` |
| UI-004 Profile | نام با اعتبارسنجی، انتخاب آواتار از کاتالوگ canonical (sun/leaf/cloud/moon)، ذخیرهٔ گرم با retry، draft ناقص غیرقابل‌ارسال | `ProfilePlacementTest`، `OnboardingContractV2Test` |
| UI-005 Grade/Placement | کاتالوگ G1..G6 با availability (G1 فعال)؛ پایه‌های قفل با توضیح گرم «به‌زودی اضافه می‌شود» و انتخاب‌ناپذیر؛ placement فقط رندر تصمیم سرور؛ صفر ستاره/اقتصاد | `ProfilePlacementTest`، `OnboardingContractV2Test` |
| Resume | draft ناقص در DataStore واقعی ذخیره و پس از process death با `Resume` بازمی‌گردد؛ مسیر گام از route بازسازی می‌شود (`OnboardingRoutes.stepFor`) | `OnboardingJourneyTest`، `OnboardingContractV2Test` |
| Session | token فقط با verify موفق ذخیره؛ restore fail-closed؛ expiry تخریب + clear؛ signOut همیشه پاک می‌کند | `ShomaraAuthSessionTest`، `SessionExpiryTest` |

## سفر انتها-به-انتها (N04-07)

- مسیر واقعی: `NavHost` با startDestination `ONBOARDING` + deep link؛ هر گام منطقی به route واقعی mirror می‌شود؛ ورود موفق → `FOUNDATION` با popUpTo inclusive.
- happy path با HTTP واقعی تست شده (400 سپس 200)؛ مسیرهای منفی: Offline، RateLimited (بدون فراخوانی شبکه)، SaveRetry، ProcessDeathResume (route/step restore).
- `ShomaraRuntimeConfig.otpEndpoints` تا پیکربندی backend توسط مالک `null` است و هر فراخوانی auth بدون تماس شبکه fail-closed می‌شود (L10/I2).

## ماتریس اکتشاف (N04-06)

- عرض‌ها: 360/390/412dp · font scale: 1.0/2.0 · تم روشن · RTL رابط + LTR ریاضی — از الگوی catalog فاز N03 و ترتیب TalkBack هر گام (`ShomaraOnboardingA11y.traversalFor`: عنوان اول، اکشن آخر، ارقام OTP با برچسب فارسی LTR).

## اثبات‌شده در برابر NATIVE_PENDING

- **اثبات‌شده (JVM/Gradle)**: کامپایل و lint واقعی، ۵۰ تست feature + ۱۱ network + ۶+۲ datastore/model، سیم‌کشی واقعی launch، مسیرهای منفی شبکه، fail-closed بودن همهٔ مرزهای auth.
- **NATIVE_PENDING**: TalkBack واقعی روی دستگاه، اسکرین‌شات واقعی در عرض‌های بالا (Paparazzi/device — تصمیم dependency با مالک)، `connectedCheck` (بدون AVD در این ماشین)، فونت Vazirmatn (نیازمند asset مالک، L10)، و اتصال backend واقعی OTP (I2 — مالک).
