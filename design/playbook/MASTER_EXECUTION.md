# Master Execution Contract — SHOMARA Native learning UX

## 1. Goal and aesthetic
A joyful Persian mathematics playground with **restrained soft Claymorphism** (plump, gently illuminated surfaces, readable elevation, subtle materials) and **clear, tactile Duolingo-inspired learning interactions** (one purpose per activity, immediate action feedback, progressive challenges). This is *not* a clone of protected Duolingo artwork, exact screens, characters or brand colors. Android Native is the destination; Expo V2 is migration evidence only.

**Visual recipe:** warm cream canonical canvas; garden green primary; berry/sky/amber semantic accents; one obvious CTA; rounded volumetric hero and interactive objects; crisp high-contrast type; tiny purposeful motion; tangible correct/selection states. Read `design/MASTER.md`, `design/INSPIRATION_GUARDRAILS.md` and `packages/design-system/src/tokens.json`—**do not replace them with arbitrary hex or external palette output**.

## 2. Structure
- Canvas calm; hero/educational manipulative prominent; never place everything in a bulky clay container.
- 3 depth tiers: flat text/canvas; raised clickable object/card; hero/featured. Fixed press lip on primary button remains visually distinct. No globally layered blurs.
- One top-level visual hero, **but never sacrifice question/answer controls** for decoration. For assessment, the math object is the hero, not a character.
- Smaller grades 1–2: fewer words, more illustrations, obvious targets; 3–4: structured visuals; 5–6: restrained decoration + more dense problems. Respect `grade-experience.ts`; only active content may be shown.
- 5 current WebP characters: use exact repo-mapped identifiers, roles, crops and aspect ratio verified from `characters.ts`/assets. Do not assume artwork exists for every emotional pose. During Native migration, preserve verified aspect ratios and semantics; do not invent Compose assets.

## 3. Softness as behavior, not a glow filter
- Buttons: press movement, lip collapses, release with small spring; no delayed onPress.
- Answer choices: clear selected state; loading lock; single submit; stable layout when feedback appears.
- Navigation: retain orientation, disable double-trigger, preserve scroll/lesson resume, Android Back predictable, touch targets ≥48dp (ST07 spec may require 72dp targets for child activities).
- Transition durations defined by canonical tokens, reduced motion respecting OS/app settings, no continuous loops during solving, avoid simultaneous celebration + screen transition.
- Each task starts with instruction and ends with a natural next action; errors actionable, never punishing.

## 4. UX invariants
A. The child always knows *where they are, what to do, and what happens next*.
B. Only one obvious primary CTA per decision state. Avoid implicit taps on decorative cards.
C. Slow network/failed audio/offline/retry must preserve state; do not spin forever.
D. Screenreader semantics reflect **true behavior**: tappable locked node that opens explanation is not marked `disabled`; it is labeled as locked and accessible.
E. RTL is the interface direction, **not** an instruction to mirror number lines, inequality relations, shapes or arithmetic operation order.
F. Answer decisions remain on validated domain/server path. Clayed objects are visual input representations, not sources of mastery truth.
G. Avoid invisible controls, success indicated by color alone, unreadable pale text, ambiguous icon-only buttons.

## 5. Typography/contrast/responsiveness
- Vazirmatn weights registered and visually verified; canonical type scale; avoid text cut-off from long Persian strings.
- Body usually ≥16–18 for young child. Contrast ≥4.5:1 normal text, ≥3:1 large; inspect disabled/control edge cases. Use semantic tokens and a contrast calculator, not a trust statement.
- Test 360, 390, 412dp minimum, larger system fonts, keyboard and safe areas; minWidth:0 on flex text; verify no overlapping nav/hero/CTA.
- Touch targets generally 48dp minimum; educational active objects per curriculum 72–80dp preferred/required where specified; 16dp separation, 24dp edge inset for ST07 tasks.

## 6. Content integration boundary
UI audit and curriculum import are **separate workstreams**. `content-library/` documents are draft content references. Stage4 has a proposed station-to-book mapping. Stage5 defines sound/motion/15 templates. Stage6 defines an authoring format. Stage7 provides a complete ST07 pilot, **not ST01**. The proposed 5-part P1–P5 model may not equal current StationFlow; mapping requires compatibility study and owner review of curriculum behavior before any runtime write.

No content promotion to production without explicit compatibility/validation decisions. Follow `skills/shomara-learning-content/SKILL.md`, `content-library/INTEGRATION_GATE.md` and `content-library/integration/SOURCE_AUDIT.md`.

## 7. Engineering quality and stop criteria
- Preserve git dirty/untracked including current `design/`, `content-library/`, `skills/` and user plan. Read `git status` prior to modifications, use the phase branch; no force-push.
- Per-route changed paths + behavior test + screenshot + verify source; ledger status values `DISCOVERED`, `AUDITED`, `IMPLEMENTED`, `TESTED_WEB`, `TESTED_NATIVE`, `BLOCKED` (not `DONE` on browser-only claims).
- Review in small batches. Fix P0/P1 before cosmetics. Visual improvement must be observed rather than inferred from `tokens` or passing parity.
- Device QA cannot be automatically waved away when SDK unavailable; leave `NATIVE_PENDING`, document precise commands for owner to run.
- No need to stop for approval on safe UI fixes; do stop before production data mutations, schema/contract semantics, purchasing/licensing or unsupported curriculum changes.

## 8. Native migration gate

- Read `NATIVE_IMPLEMENTATION.md` for Compose/UDF/module rules.
- Lock the real Expo behavior and contract before implementing a Native route family.
- A Native screen needs immutable state, explicit events, previews, unit/semantics tests and device-pending evidence.
- Verify Android edge-to-edge, predictive back, process recreation, IME and TalkBack; browser parity cannot close these gates.
- Update the route ledger with separate behavioral parity, visual review and Native device status.

## 9. Shared component gate

- Load `skills/shomara-design-system/SKILL.md` for any token, theme or shared primitive change.
- Use `COMPONENT_READINESS.md` to define purpose, non-use cases, states, semantics and evidence before code.
- Do not solve a page inconsistency by creating a local component when the behavior belongs in the shared system.
- Do not generalize a one-page visual experiment into the Design System without at least two valid consumers or an explicit foundation requirement.
