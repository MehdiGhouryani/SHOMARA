# Animation & Visual Runtime Specification — v0.32

**تاریخ:** ۲۴ سپتامبر ۲۰۲۶  
**دامنه:** Child Mobile App / Shared Experience Architecture  
**Status:** `LOCKED BASELINE`

## 0. هدف

Child App باید از نظر تجربه بصری به یک محصول کودکانه بازی‌محور نزدیک باشد: یک شخصیت کارتونی اصلی، انیمیشن‌های متعدد در طول مسیر، micro-interaction، reaction، progress reveal و animationهای آموزشی؛ اما بدون تبدیل شدن به یک game engine سنگین یا بسته حجیم.

## 1. Reference Direction — الهام از Duolingo

این سند Duolingo را به‌عنوان reference experience می‌گیرد، نه الگوی کپی‌برداری.

Duolingo در پروژه Math خود پس از محدودیت‌های پیاده‌سازی programmatic، برای Android به سمت Rive رفت تا animationهای cross-platform و interactive را با فشار توسعه کمتر و تعاملات پیچیده‌تر پوشش دهد. Duolingo همچنین برای World Characters از Rive State Machine استفاده کرده و هدف را اجرای animationهای تعاملی، قابل‌کنترل با runtime و کم‌حجم عنوان کرده است.

Duolingo ABC نیز برای کودکان ۳ تا ۸ سال animation را هم برای توضیح مفهوم و هم برای ایجاد انگیزه و delight در تجربه استفاده می‌کند.

## 2. Canonical Mobile Stack

### Locked

- React Native
- Expo
- TypeScript
- Expo Router
- React Native New Architecture
- EAS
- Hermes
- `react-native-reanimated` برای UI / transition / gesture animation
- **Rive Runtime** برای character و interactive 2D animation

### Optional / Deferred

- React Native Skia فقط در صورتی که یک Mini Game واقعاً به rendering سفارشی، sprite/atlas یا Canvas نیاز داشته باشد.
- Unity / Unreal / Godot در V1 ممنوع؛ برای این محصول در V1 توجیه architectural ندارند.

## 3. چرا Rive؟

Rive برای این پروژه انتخاب baseline است چون:

1. فایل animation و logic state را می‌تواند در یک runtime artifact نگه دارد.
2. State Machine اجازه می‌دهد animationها با input و transition کنترل شوند.
3. یک asset می‌تواند به‌صورت interactive توسط کد کنترل شود.
4. برای React Native runtime دارد.
5. برای animationهایی که باید هم ظاهر و هم رفتار داشته باشند، مناسب‌تر از ویدیو/GIF است.
6. مدل برداری و runtime-driven معمولاً اجازه می‌دهد تعداد زیادی حالت را با asset مشترک بسازیم، به‌جای ذخیره تعداد زیادی فایل ویدئویی.

## 4. Animation Architecture

```text
Child App
   |
   +-- UI Animation
   |      └── Reanimated
   |
   +-- Character Animation
   |      └── Rive
   |
   +-- Interactive Learning Animation
   |      └── Rive + app inputs
   |
   +-- Mini Game Rendering
   |      └── React Native first
   |      └── Skia only when justified
   |
   +-- Audio Sync
          └── server/content timing metadata + client playback
```

## 5. Main Character Contract

یک شخصیت اصلی canonical در V1 وجود دارد.

Character باید حداقل این stateها را داشته باشد:

```text
IDLE
LISTEN
THINK
HAPPY
CELEBRATE
ENCOURAGE
CONFUSED
TEACH
POINT
SLEEP / REST
INTRO
OUTRO
```

### Character behavior rules

- Character نباید دائماً animate شود.
- Idle کوتاه و کم‌هزینه باشد.
- Reaction به نتیجه باید واضح باشد.
- انیمیشن correct / incorrect نباید Learning Moment را مختل کند.
- Character در Explain می‌تواند حرکت کند، اما motion نباید جایگزین فهم مفهوم شود.
- Character باید بتواند به eventهای domain مثل `ANSWER_CORRECT`, `RECOVERY_STARTED`, `STATION_PASSED`, `MILESTONE_UNLOCKED` واکنش نشان دهد.

## 6. Secondary Animation Library

علاوه بر شخصیت اصلی:

- skill icons
- progress path
- stars / particles
- unlock effects
- number transitions
- object movement
- shape morphs
- success burst
- gentle error feedback
- world/environment loops
- mini-game object animations

این‌ها باید تا حد امکان reusable باشند.

## 7. Animation Roles

هر animation باید حداقل یکی از این چهار نقش را داشته باشد:

### Explain
مفهوم ریاضی را قابل‌دیدن می‌کند.

### React
به عملکرد کودک پاسخ می‌دهد.

### Reveal Progress
پیشرفت، unlock یا milestone را قابل‌دیدن می‌کند.

### Delight
لذت بصری ایجاد می‌کند ولی learning truth را تغییر نمی‌دهد.

Animation بدون نقش باید در QA حذف یا ساده شود.

## 8. Character + Learning Engine Boundary

```text
Learning Engine
      |
      | semantic event
      v
Animation Controller
      |
      v
Rive State Machine
```

Learning Engine نباید نام animation را بشناسد.

مثلاً به‌جای:

`play_duo_happy_03()`

باید event معنایی ارسال شود:

`ANSWER_CORRECT`

و animation layer تعیین کند که چه motion مناسبی پخش شود.

## 9. Content / Animation Contract

Content Version می‌تواند به یک یا چند visual/animation asset reference داشته باشد.

```yaml
animation_ref:
  asset_id: <uuid>
  runtime: RIVE
  artboard: child_character
  state_machine: main
  triggers:
    - ANSWER_CORRECT
    - ANSWER_WRONG
    - HINT_OPENED
```

Animation asset باید versioned باشد و بعد از ACTIVE immutable بماند.

## 10. Audio / Lip Sync

V1 به lip-sync کامل نیاز ندارد.

اما asset contract باید از آینده پشتیبانی کند:

```text
Audio
 + timing metadata
 + semantic phrase events
 → Character state machine
```

بعداً می‌توان phoneme/viseme timing اضافه کرد بدون شکستن model فعلی.

Duolingo برای characterهای خود از Rive State Machine و timing اطلاعات صوتی/viseme استفاده کرده است؛ این architecture نشان می‌دهد که چنین توسعه‌ای بهتر است از ابتدا با semantic/timing boundary قابل‌پشتیبانی باشد.

## 11. File Size Policy

### V1 guardrails

- Animationهای Character با Rive، نه GIF/MP4.
- Backgroundهای متحرک سنگین به‌صورت ویدئویی در V1 ممنوع مگر در استثناء approved.
- Assets باید lazy-load شوند.
- Character file به bundle اصلی فقط در صورت نیاز preload شود.
- Animationهای Station بعدی نباید از ابتدا دانلود شوند.
- از embedding فونت‌های غیرضروری داخل animation asset خودداری شود.
- یک فایل Rive غول‌آسا برای تمام جهان ساخته نشود.
- state machineها modular و قابل نگهداری باشند.

## 12. Performance Budget

### Target

- هدف اصلی: 60 FPS روی دستگاه‌های supported baseline.
- در تجربه‌های غیرتعامل‌محور 30 FPS قابل‌قبول است اگر کیفیت پایدار بماند.
- UI thread نباید با animation logic سنگین blocked شود.
- هم‌زمانی چند animation سنگین باید محدود شود.
- preload فقط برای assetهایی انجام شود که در 1–2 interaction بعدی احتمال مصرف دارند.

## 13. Skia Decision

Skia در V1 dependency اجباری نیست.

دلیل: خود React Native Skia یک dependency native قابل‌توجه اضافه می‌کند؛ مستندات فعلی آن افزایش تقریبی ۴MB در Android و ۶MB در iOS را برای baseline package گزارش می‌کنند. بنابراین برای animationهای عادی، Rive + Reanimated کفایت دارد و Skia فقط برای بازی‌هایی که واقعاً به Canvas/custom rendering نیاز دارند فعال می‌شود.

## 14. Mini Game Rendering Strategy

### Level 1 — Default
React Native primitives + Rive + Reanimated.

### Level 2 — Custom Canvas
Skia برای:
- تعداد زیاد sprite
- مسیرهای گرافیکی سفارشی
- rendering real-time خاص
- atlas/sprite systems

### Level 3 — Full game engine
در V1 ممنوع.

## 15. Asset Pipeline

```text
Illustrator / Figma / Rive Editor
        ↓
Character / Scene / Icon
        ↓
Rive asset + static assets
        ↓
QA: size + FPS + memory + interaction
        ↓
Content Version
        ↓
Supabase Storage / packaged critical assets
```

## 16. Animation QA

هر animation قبل از ACTIVE شدن باید:

- size check
- first-render check
- FPS check
- low-end Android check
- low-end iOS check
- offline/local playback check برای critical assets
- orientation/responsive check
- accessibility / motion reduction check

را عبور کند.

## 17. Accessibility

- animation نباید تنها حامل معنی باشد.
- critical feedback باید semantic/text/audio alternative داشته باشد.
- برای Reduce Motion، loopها و non-essential motion باید ساده یا خاموش شوند.
- flashing سریع ممنوع.

## 18. Station 01 Animation Set

حداقل V0 برای Vertical Slice:

### Main Character
- idle
- introduce
- happy
- encourage
- thinking
- celebrate
- recovery support

### Learning animation
- شمارش اشیاء
- highlight pattern
- object snap
- correct response
- gentle incorrect response

### Path
- node active
- node completed
- next unlock

### Reward
- star burst
- reward reveal

## 19. Architecture Decision Record

**Decision:** React Native + Expo + TypeScript + Reanimated + Rive.

**Rationale:**
- animation-heavy child UX;
- interactive state-driven character;
- cross-platform Android/iOS;
- manageable asset size;
- designer/engineer handoff;
- no full game engine required.

**Rejected as V1 default:**
- Unity
- Unreal
- video-based character animation
- GIF-based primary animation system
- Skia as mandatory base runtime

## 20. Integration with Existing Product Core

Existing semantic contract remains unchanged:

```text
Evidence
 ↓
Learning State
 ↓
Learning Decision
 ↓
Learning Plan
 ↓
Encounter
 ↓
Semantic UI / Animation Event
 ↓
Character / Visual Response
```

Animation never becomes Learning Truth.

## 21. Readiness Impact

Before Station 01 implementation, the following must be added to the technical baseline:

- Rive runtime integration spike
- animation asset loading policy
- asset/version references
- semantic animation event map
- performance profiling screen
- reduced-motion behavior
- Station 01 animation package

## 22. Final Principle

> **Animation is part of the learning experience, not decoration.**

اما animation باید به‌اندازه‌ای سبک و modular طراحی شود که رشد محتوا از 25 Station به Grades 1–6 باعث رشد انفجاری bundle size و complexity نشود.
