# چک‌لیست پذیرش نهایی UI شمارا

## طراحی / ساختار
- [ ] header، chapter progress، continue card، path، bottom nav در سلسله‌مراتب درست‌اند.
- [ ] bottom nav دقیقاً سه تب مسیر/تمرین/من دارد.
- [ ] در viewport تصمیم فقط یک featured surface داریم.
- [ ] ظاهر یاسی/سفید/بنفش بدون کپی محتوا یا brand خارجی؛ سبز معنای progress واقعی دارد.
- [ ] no fake star/coin/streak/reward/leaderboard/lives/loot-box.

## رفتار و داده
- [ ] currentStationId، completion، perfect، unlock، progress و CTA از real immutable state می‌آید.
- [ ] هیچ mastery logic یا answer key در UI وجود ندارد.
- [ ] locked node با lock reason کامل semantics درست دارد؛ اگر راهنما باز می‌کند tappable باقی می‌ماند.
- [ ] سریع tap/double tap، route reselect، Back، deep-link و scroll restoration آزموده شده‌اند.
- [ ] error/retry action فقط وقتی واقعی است نمایش داده می‌شود؛ loading layout را جابه‌جا نمی‌کند.

## اندازه و نمایش
- [ ] 360dp، 390dp، 412dp و حداقل یک tablet width بررسی شده‌اند.
- [ ] 100%, 130%, 200% font scale؛ عنوان/CTA/lock reason truncate نشده‌اند.
- [ ] system bars، gesture inset، display cutout و bottom nav overlap ندارند.
- [ ] node labels و connector در RTL cut یا mirror اشتباه ندارند.
- [ ] math/numbers/expressions در semantic LTR subtree تست شده‌اند.

## Accessibility
- [ ] target حداقل 48dp و gap مناسب.
- [ ] TalkBack ترتیب، label، role، selected/current/completed/locked و progress را اعلام می‌کند.
- [ ] معنی state فقط به رنگ متکی نیست.
- [ ] contrast متن معمولی حداقل 4.5:1 و large text/UI boundary حداقل 3:1.
- [ ] focus indicator برای keyboard/switch access قابل مشاهده.

## Motion / Performance
- [ ] press depth بدون bounds/layout shift تغییر می‌کند.
- [ ] motion کوتاه و reduced-motion friendly است.
- [ ] Canvas path فقط وقتی inputs تغییر می‌کنند invalidate می‌شود؛ node list stable key دارد.
- [ ] بدون nested shadow سنگین، infinite shimmer یا infinite mascot animation.
- [ ] bottom image در WebP alpha و assetها به اندازهٔ واقعی/مورد نیازند.

## Evidence
- [ ] unit/logic tests pass.
- [ ] semantics tests pass.
- [ ] instrumentation/navigation tests pass.
- [ ] Gradle assembleDebug pass.
- [ ] screenshots واقعی device/emulator و test logs ذخیره شده‌اند.
- [ ] backlog/ledger فقط با شواهد واقعی به‌روزرسانی شده است.
