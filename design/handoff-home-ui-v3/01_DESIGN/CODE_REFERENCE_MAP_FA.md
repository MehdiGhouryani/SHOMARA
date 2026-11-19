# نقشهٔ اتصال فایل‌های handoff به مخزن SHOMARA

| فایل در بسته | مقصد/مالک احتمالی در مخزن | اقدام Harness |
|---|---|---|
| `02_ASSETS/android/drawable/shomara_nav_*.xml` | `apps/android/core/designsystem/src/main/res/drawable/` | merge resource names پس از بررسی collision |
| `02_ASSETS/android/drawable/shomara_node_*.xml` | همان بالا | افزودن حالت‌های Fresh/Perfect در کنار state mapping واقعی |
| `02_ASSETS/android/drawable/shomara_lesson_*.xml` | همان بالا | مصرف در topic tiles/lesson cards؛ نه تزئین بی‌معنا |
| `02_ASSETS/android/drawable/shomara_state_*.xml` | همان بالا | در صورت نیاز به تصویرسازی error/empty/offline؛ اول state surface موجود را بررسی کنید |
| `02_ASSETS/backgrounds/garden_path_footer.webp` | `drawable-nodpi/` یا asset module مناسب | فقط وقتی screenshot واقعی ثابت کرد مفید است؛ حذف آن بهتر از overdraw است |
| `03_ANDROID/kotlin/ShomaraHomeUiTokens.kt` | `apps/android/feature/path/...` یا theme semantic layer | sample محلی؛ پس از owner review و جلوگیری از token drift |
| `03_ANDROID/kotlin/ShomaraHomeUiState.kt` | `feature/path/presentation/model` یا package جاری | اگر معادل موجود نیست سازگار کنید؛ duplicate model نسازید |
| `03_ANDROID/kotlin/ShomaraHomeBottomBar.kt` | `feature/path` یا shared design system | فقط اگر tab API موجود icon slot ندارد؛ state/navigation owner بیرون component است |
| `03_ANDROID/kotlin/ShomaraHomeComponents.kt` | `feature/path/ui/components` | reference implementation؛ API موجود را reuse کنید |
| `03_ANDROID/tools/verify_character_sources.py` | dev tooling / handoff tools | script read-only |
| `03_ANDROID/tools/install_fandogh_native.py` | dev tooling / handoff tools | کپی رسمی Fandogh فقط در صورت نبودن native drawable |

**مهم:** این بسته source code را به checkout مخزن commit یا patch نمی‌کند. Harness باید از branch و repository فعلی استفاده کند و فایل‌ها را با architecture موجود ادغام کند.
