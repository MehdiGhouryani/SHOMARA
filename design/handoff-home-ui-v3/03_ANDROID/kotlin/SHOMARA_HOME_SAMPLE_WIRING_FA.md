# نمونهٔ سیم‌کشی Home UI — قرارداد، نه ViewModel آماده

## دادهٔ صفحه

`ShomaraHomePathUiState` در `ShomaraHomeUiState.kt` فقط یک projection نمایشی است. آن را از ViewModel واقعی map کنید. اگر پروژه مدل معادل دارد، از همان استفاده کنید؛ دو state store همزمان نسازید.

- `loadState`: Loading / Ready / Empty / ContentUnavailable / Error
- `progress`: مقدار واقعی فصل و label قابل خواندن
- `continueStation`: station ID و CTA واقعی؛ از `isResume` برای تعیین eyebrow کارت (fresh/resume) استفاده کن.
- `nodes`: station ID یکتا، ordinal، title، state، lock reason و `canOpen`
- `scrollAnchorStationId`: فقط در صورت پشتیبانی واقعی از restoration

## الگوی Composable

```kotlin
@Composable
fun HomePathRoute(viewModel: HomePathViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    HomePathScreen(
        state = state,
        onEvent = viewModel::onEvent,
    )
}

@Composable
fun HomePathScreen(
    state: ShomaraHomePathUiState,
    onEvent: (ShomaraHomePathEvent) -> Unit,
) {
    // Render only. No repository call, no evaluator call, no unlock calculation here.
    // Reuse ShomaraPathGraph for actual path geometry and node state semantics.
}
```

نمونه به شکل schematic است؛ نام ViewModel/route را با واقعیت checkout جایگزین کنید.

## Continue card mapping (important for Persian RTL)

- `eyebrow = if (continueStation.isResume) "از آخرین نقطه ادامه بده" else "اولین ایستگاه آماده است"`.
- `actionLabel` باید از قرارداد واقعی station/session بیاید؛ برای نمونهٔ شروع می‌تواند «شروع ایستگاه» و برای ادامه «ادامه مسیر» باشد.
- در Row راست‌به‌چپ، ستون متن/CTA را قبل از `leadingContent` قرار دهید تا illustration/Number در سمت چپ card قرار بگیرد.

## Event mapping

| UI gesture | Event | Owner |
|---|---|---|
| Tap CTA ادامه | `ContinueStation` | ViewModel → active station route |
| Tap node قابل‌دسترسی | `OpenStation(stationId)` | Route coordinator / ViewModel |
| Tap قفل برای توضیح | `ExplainLockedStation(stationId)` | guide sheet/state؛ بدون unlock mutation |
| Tap tab | `SelectTab(tab)` | app shell coordinator |
| Tap setting | `OpenSettings` | actual settings route |
| Tap return-to-current | `ReturnToCurrentStation` | list state + current station anchor |

## خط قرمز

اگر state source یا route واقعی در checkout وجود ندارد، UI نباید با fake data آن را زنده نشان دهد. blocker را گزارش کنید و Surface ناموجود/خالی را نشان دهید.
