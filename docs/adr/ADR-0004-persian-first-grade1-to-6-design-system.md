# ADR 0004 — Persian-First Primary Math Design System & Grade 1-6 Architecture

## Status
Accepted & Locked (2026-09-25)

## Context & Principles
Based on product reconciliation and the child-centered visual direction established for the primary math learning platform:

1. **Persian-First & Full RTL Standard**:
   - All child-facing UI is natively Persian and RTL.
   - All instructional numbers use Persian digits (`۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹`).
   - Button labels adhere to standard friendly terminology: «ادامه»، «شروع»، «تمرین»، «بررسی کن»، «دوباره تلاش کن».
   - Typography is standardized on **Vazirmatn** (Body: 500, Button: 600, Heading: 700, Hero/Reward: 800).
   - Parent & Teacher Lite portals are fully Persian and maintain dignified, non-judgmental language.

2. **Grade 1 to 6 Architectural Shell with Grade 1 Vertical Focus**:
   - The platform architecture natively represents grades ۱ through ۶.
   - Initial production execution and vertical depth focus exclusively on **Grade 1 (پایه اول)** with 25 Stations and 64 Skills.
   - Station 01 («شمارش و الگوها ۰ تا ۱۰») serves as the benchmark vertical slice.
   - Progression complexity scales with age: Grade 1 features high visual affordance, tactile controls, and active character companionship; upper grades feature mature layouts, multi-step problem solving, and analytical representations.

3. **Four Core Interactive Companion Characters (V1)**:
   - **آریا (Aria)**: Main guide and caring dragon companion.
   - **کیوبو (Qbo)**: Math assistant and problem-solving robot.
   - **جیکو (Jiko)**: Playful emotional responder for wins and friendly encouragement.
   - **دانا (Dana)**: Nature explorer guiding patterns and spatial reasoning.

4. **Strict Separation of Learning Engine & Animation Layer**:
   ```
   Learning Engine (Authoritative)
         ↓  emits semantic events
   Semantic Animation Controller
         ↓  maps to visual state machine
   Character Runtime (Rive / Visual Canvas)
   ```
   - Characters never evaluate answers, assign scores, or modify learner mastery state.
   - Characters serve as the **Experience & Emotional Layer**, reacting to `ANSWER_CORRECT`, `ANSWER_WRONG`, `HINT_OPENED`, `RECOVERY`, `STATION_PASS`, and `NEW_LEVEL`.
   - Characters actively participate in Grade 1 learning activities (e.g. looking at empty pattern slots, counting items together) without violating runtime invariants.

5. **Visual Hierarchy & Cognitive Load Discipline**:
   - Palette: Calming light sky/cream background (`#F8FAFC` / `#FFFDF9`), energetic primary blue (`#2563EB`), warm tactile secondary tones (amber, emerald, coral, violet).
   - Soft high-radius cards (`rounded-3xl`), thick tactile 3D buttons (`rounded-2xl`).
   - Anti-distraction rule: One visual hero per screen. Characters, questions, options, and progress indicators never compete simultaneously for cognitive focus.
