# SHOMARA Design Master — Native V3 direction

This is the canonical brand and experience contract. Machine-readable values remain canonical in `packages/design-system/src/tokens.json`; this document explains how to apply them.

## 1. Product character

SHOMARA is a calm, joyful Persian mathematics garden for children. It should feel tactile and warm without becoming toy-like noise. The child must understand within three seconds:

1. where they are;
2. what they should do now;
3. what happens after the action.

Duolingo is the UI model (ADR-0039): page layouts, path geometry, lesson loop, feedback and component system are copied, adapted to Persian RTL and SHOMARA v2 tokens; learning-by-doing, one clear task, immediate feedback, multiple representations, gradual difficulty and system-level craft carry over. AVA contributes only verified architecture/process lessons. UI/UX Pro Max contributes a design-system-first decision method. Brand imitation (logo, the owl, brand colours/font/text, assets) and external design dependencies are forbidden; `design/INSPIRATION_GUARDRAILS.md` is binding.


Sync with ADR-0039 (2026-11-05): the source of truth is the versioned, checksummed, signed content package inside the APK + the local evaluator; Duolingo structure/behaviour is the UI model, brand is not copied. Open owner decisions (not decided here): O1 answer-key model — (1) key in the APK inside a separate evaluator layer; (2) evaluator without an extractable key, proven per template; (3) evaluator from item parameters at runtime. O2 package format — ADR-0039 §4 proposal (manifest.json + stations/*.json + audio/*.opus + images/*.webp; three models + separate evaluator layer), confirm or replace.

## 2. Visual language

- Canvas: warm cream `v2.color.canvas` (`#FFF8EF`).
- Primary action and progress: garden green `v2.color.primary` with `primaryDark` for tactile depth.
- Support accents: amber for attention/featured action, berry for personality, sky for information.
- Text: `ink`/`ink2`/`muted`; danger is reserved for actual destructive/error meaning.
- Depth has four semantic levels: flat, hint, soft and featured. A screen normally has at most one featured surface.
- Clay is a behavior and hierarchy tool, not a blur filter. Pressed controls move without shifting neighboring layout.
- Text never receives decorative depth, and depth is never the only carrier of state or meaning.
- Vazirmatn is the interface typeface. Numeric/math content uses semantic LTR isolation where required.

Do not duplicate these values in Compose or page code. N03 codegen will produce Kotlin and TypeScript outputs from the token source.

## 3. Layout and hierarchy

- Use one focal learning object or hero, followed by the task and one primary CTA.
- Keep 24dp preferred screen inset, with adaptive reduction only when verified at 360dp.
- Respect system bars, display cutouts, IME and edge-to-edge layout.
- Body content may scroll; critical CTA must remain reachable without obscuring content or keyboard.
- Characters support orientation and emotion. They never dominate an assessment or reveal an answer.
- Maintain geometry of the five existing WebP characters until Native asset ownership is approved.

## 4. Interaction states

Every interactive component defines: default, pressed, focused, selected, disabled, loading and error where applicable. Learning choices additionally define checked/correct/retry states without relying on color alone.

- Prevent double navigation and duplicate submit.
- Keep layout stable when feedback appears.
- Preserve work through retry, offline transitions and process recreation where the feature contract requires it.
- Motion is short, cancelable and reduced-motion aware. Celebration follows authoritative success only.
- Haptics and audio are enhancements; the task remains understandable when either is unavailable.

## 5. Learning and child-safety rules

- No lives, punitive streaks, stars as currency, coins, loot boxes, stores or leaderboards.
- Wrong answers receive warm, actionable recovery—not shame, violent motion or loss framing.
- Assessment is visually quieter than teaching and practice.
- Provide tap/select alternatives for drag interactions.
- Never expose answer keys, guardian data, internal errors or sensitive identifiers. The answer key lives only in the local evaluator layer (ADR-0039) and never enters the child lesson projection, the database, logs, or telemetry.
- Apply curriculum rules through `skills/shomara-learning-content/SKILL.md`; a draft never overrides the versioned local content package or becomes enabled merely because UI references it.

## 6. Accessibility and RTL

- Minimum control target: 48dp; preferred early-grade manipulative: 72–80dp.
- Normal text contrast: at least 4.5:1; large text/control boundaries: at least 3:1.
- Verify TalkBack role, label, state, traversal and announcements against real behavior.
- Verify 360/390/412dp, font scale up to 200%, keyboard, landscape risk and long Persian strings.
- A locked item that opens an explanation remains operable and is announced as locked, not disabled.
- Do not mirror number lines, inequalities, arithmetic order or meaningful geometry merely because the UI is RTL.

## 7. Native architecture boundary

Compose screens render immutable state and emit intents. ViewModels coordinate use cases; repositories own local data (bundled content package, Room/DataStore). UI code never decides mastery, station completion or answer correctness; those decisions come from the local evaluator over the versioned bundled content package (ADR-0039), not from a server, and the UI renders what the evaluator returns. Feature modules depend on public core/domain APIs and never on another feature's implementation.

## 8. Audio and CMS-ready surfaces

Audio UI must expose unavailable, loading, playing, paused, failed and cached/offline states. Runtime receives versioned content/audio descriptors from the bundled local package; it does not hardcode administrator-controlled URLs or copy. Authoring and publishing require provenance, rights, moderation, checksum and activation gates defined in N07. "Offline" is the normal state of the product, not an error (ADR-0039).

The current source inventory proposes 25 stations and 15 interaction patterns, but only ST07 is a complete draft pilot. Do not generalize ST07 numeral visibility, timing or assets to every station.

## 9. Definition of acceptable screen work

A screen advances only when its real route and states are inventoried, critical dimensions score at least 3 in the review rubric, no P0/P1 remains, relevant tests pass, and unresolved device/content decisions are recorded honestly. A browser screenshot is never Native proof.

Before implementation, record the outcome, focal object, design dials, anti-patterns and permitted depth tiers. `design/playbook/PAGE_UIUX_BLUEPRINT.md` locks these decisions and the Native batch order for all 17 page families; `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` tracks their honest evidence status. Shared components must satisfy `design/playbook/COMPONENT_READINESS.md`; page-local visual systems are not accepted.
