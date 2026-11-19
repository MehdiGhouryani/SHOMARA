# معیارهای پیشرفتهٔ کدنویسی، روانی و کارایی

## Compose architecture
- Screen composable فقط `UiState` immutable دریافت کند و callbackهای intent را emit کند؛ data fetch، persistence، unlock یا evaluator در composable انجام نشود.
- LazyColumn items با `key = station.id` و `contentType` ثابت؛ list و node modelها از قبل map شوند و داخل composition expensive transformation نداشته باشند.
- Canvas connector از همان geometry helper فعلی تغذیه شود؛ مختصات node و path یک source of truth داشته باشند.
- از derivedStateOf برای scroll threshold / visibility استفاده کن؛ `remember` فقط برای محاسبات pure با keys درست.
- از `graphicsLayer`/shadow فقط برای لایه‌های لازم؛ چند shadow بزرگ روی هر node ممنوع.
- resource vectorها cache طبیعی Compose/Resources دارند؛ SVG runtime parser وارد نکن.
- `Painter` و `ImageBitmap` هرگز داخل هر recomposition decode نشوند؛ از `painterResource` یا existing character API.
- `animateColorAsState` یا `updateTransition` برای حالت‌های محدود؛ animation infinite، per-item loop و random timing نداشته باش.

## State and event discipline
- UI event: `OnNodeClicked(id)`, `OnStartCurrent`, `OnTabSelected(tab)`, `OnReturnToCurrent`, `OnSettingsClicked`.
- ViewModel action باید idempotent باشد؛ tap guard در سطح app/design system موجود را reuse کن.
- progress only display; state transitions and evaluator authoritative.
- locked reason, error details and current id را از state بگیر؛ هیچ route slug یا station id را از label بساز.

## Smoothness target
- target 60fps روی دستگاه مرجع baseline؛ scrolling باید با تعداد nodeهای چند فصل jank قابل‌مشاهده نداشته باشد.
- هنگام اسکرول path connector را per-frame با تعداد زیاد path objects نساز؛ geometry در data/layout update محاسبه و رسم ساده شود.
- raster character cameo اندازهٔ مناسب داشته باشد؛ full-res WebP در list تکرار نشود.
- overdraw کم؛ background ساده و card transparent effects محدود.
- در debug از Layout Inspector، Compose recomposition counts و Android Studio Profiler برای مشکل‌یابی استفاده کن.

## Quality gates
- ktlint/detekt یا lintهای repo؛ no new warnings.
- UI tests for semantics plus screenshot snapshots.
- no hardcoded dp/colors in feature when an existing semantic token exists; screen-local overlay values should be consolidated in one object then reconciled with global tokens.
- no `!!`, global mutable state, work in composition, or blocking I/O in main thread.
