# Child Product Surface

**Status:** Current supporting contract
**Date:** 2026-10-03
**Scope:** learner-facing Web + Mobile UI

## Product rule

The child experience should answer three questions immediately:

1. Where do I learn next? → **مسیر**
2. Where do I practise? → **تمرین**
3. What have I earned and who am I? → **من**

Primary navigation is intentionally limited to three destinations.

| Primary destination | Purpose | Active screens |
|---|---|---|
| مسیر | guided learning path, unit, station and lesson | S07–S13 |
| تمرین | short repeatable practice grounded in the path | S14 |
| من | identity, real progress, achievements, appearance, settings and parent access | S17–S21 |

## Profile surface

Profile is a compact identity surface with exactly four groups:

- Identity: avatar, name, grade.
- Progress: completed stations and unlocked achievements.
- Achievements: the current five-item milestone baseline; the authoritative achievement registry expands in roadmap P07.
- Actions: `تغییر ظاهر`, `تنظیمات` and protected `والدین`.

Achievement detail (S18) is secondary and uses a dialog/sheet from Profile. Appearance (S20) is a secondary child route entered from Profile.

## Secondary / embedded learning surfaces

- **دستاوردها (S17)** stays on Profile; it is not a primary tab.
- **دستاورد جزئیات (S18)** is a secondary detail dialog/sheet.
- **مهارت‌ها (S15)** is learning evidence, not a separate navigation destination.
- **مرور مفهومی (S16)** belongs inside learning/practice context, not a parallel curriculum.
- **تنظیمات (S21)** is a secondary child surface. **والدین** remains outside the child screen taxonomy and stays behind an adult gate.

## Removed from the child product shell

These must not create learner-facing navigation entries:

- Teacher login / teacher portal
- Leaderboards / leagues / rankings
- School assignments
- Friends feed / social gallery
- Companion gallery
- Animation lab / developer demos
- Persistent streak, XP, gems or daily-goal widgets
- Spendable reward currency
- Standalone Treasure/Backpack surface

Backend services for adult/teacher workflows may remain. Their existence must never create a child-visible entry.

## Achievements

Achievements are meaningful learning milestones. The current Profile implementation exposes a five-item baseline. Roadmap P07 will replace this limited registry with the authoritative achievement registry while preserving Profile as the primary collection surface.

| ID | Title | Unlocks when |
|---|---|---|
| A01 | شمارش‌گر | ST01 complete |
| A02 | جهت‌یاب | ST02 complete |
| A03 | عددساز | ST03 complete |
| A04 | شکل‌شناس | ST04 complete |
| A05 | حسابگر | ST05 complete |

No XP, gems, streak, league, rank, mastery tier, or fabricated percentage is displayed.

## Avatar

S20 is a secondary route from Profile. It intentionally stays small:

`Preview → choose preset → save / cancel`

Avatar identity is separate from the Companion cast.

## Station naming / header

Learner-facing names are fixed:

| ID | Name |
|---|---|
| ST01 | شمارش و الگو |
| ST02 | جایگاه و جهت |
| ST03 | عدد و جمع |
| ST04 | شکل‌ها و ویژگی‌ها |
| ST05 | جمع و تفریق |
| ST06 | جمع با مهره‌ها |
| ST07 | عددهای ۱ و ۲ |
| ST08 | عددهای ۳ و ۴ |
| ST09 | صفر و ۵ |
| ST10 | عددهای ۶ و ۷ |
| ST11 | برابری و عدد ۸ |
| ST12 | مقایسه و عدد ۹ |
| ST13 | نشانهٔ جمع |
| ST14 | تفریق و طول |
| ST15 | گروه‌بندی |
| ST16 | ساعت و عددها |
| ST17 | جمع چندبخشی |
| ST18 | الگو و زمان |
| ST19 | ده‌تایی‌ها و خرید |
| ST20 | عددهای دو رقمی |
| ST21 | عددهای ۱ تا ۱۰۰ |
| ST22 | تقویم و شمارش |
| ST23 | شمارش گروهی |
| ST24 | مسئله‌های چندمرحله‌ای |
| ST25 | عدد ۱۰۰ |

Station header content is limited to:

`ایستگاه N` → `station.title` → `{minutes} دقیقه`

Generic lead-ins and long subtitles do not compete with the title.

## Visual principles

This product follows the broad documented Duolingo principles of simplified intentional navigation, consistent purposeful headers, a small type hierarchy, and milestone achievements collected on Profile. It does not reuse Duolingo's branded artwork, copy, or proprietary assets.
