# مرز package و module در SHOMARA

## وضعیت فعلی TypeScript

- `contracts`: type/schema/policy مشترک؛ بدون UI، network client یا secret.
- `learning-runtime`: orchestration یادگیری؛ تصمیم نهایی سرور را جعل نمی‌کند.
- `challenge-runtime`: منطق challenge جدا از mastery/station pass.
- `assignment-runtime` و `adult-projections`: سطح بزرگسال؛ وارد child UI نمی‌شوند.
- `offline-sync`: queue/retry/idempotency؛ بدون وابستگی به React/Expo.
- `content-delivery`: manifest/asset delivery؛ بدون تصمیم correctness.
- `design-system`: token، اعداد فارسی و primitiveهای مستقل از feature.
- `apps/mobile`: adapter و UI legacy؛ source of truth دامنه نیست.
- `apps/web`: API/adult surface؛ از internals کلاینت import نمی‌کند.

## قواعد Native از N02

```text
feature:* -> core:model, core:designsystem, core:common
feature:* -> domain use cases (public API only)
data:*    -> core:network, core:database, core:datastore
ui        -X-> network/database implementation
feature:A -X-> feature:B implementation
```

- DTO، entity و domain model سه مفهوم جدا هستند.
- repository تنها مرز هماهنگی local/remote است.
- ViewModel state immutable و eventها explicit هستند.
- navigation argument فقط ID پایدار است، نه object بزرگ یا answer key.
- tokenهای Kotlin و TypeScript از یک JSON canonical تولید می‌شوند.
- نام package Android با `ir.shomara` نهایی نشده و قبل از N02 باید به‌عنوان تصمیم مالک ثبت شود؛ package فعلی Expo خودکار به Native منتقل نمی‌شود.

## Naming

- فایل component/view با PascalCase، utility با camelCase و test کنار source.
- واژه‌های `Manager`, `Helper`, `Utils` فقط با مسئولیت دقیق؛ نام مبهم جدید ممنوع.
- V1/V2 در نام دائمی ممنوع است؛ فقط طی migration و همراه removal task مجاز است.
- API عمومی package از entrypoint مشخص export می‌شود؛ deep import بین workspaceها ممنوع است.

## Gate تغییر مرز

هر move یا split باید این شواهد را داشته باشد:

1. consumer list قبل از تغییر؛
2. import graph بعد از تغییر؛
3. typecheck همهٔ workspaceها؛
4. unit/regression test؛
5. به‌روزرسانی file ledger و harness task.
