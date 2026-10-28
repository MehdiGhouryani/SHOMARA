# Master Execution Contract — Clay × Duolingo-inspired SHOMARA

## 1. Goal and aesthetic
A joyful Persian mathematics playground with **restrained soft Claymorphism** (plump, gently illuminated surfaces, readable elevation, subtle materials) and **clear, tactile Duolingo-inspired learning interactions** (one purpose per activity, immediate action feedback, progressive challenges). This is *not* a clone of protected Duolingo artwork, exact screens, characters or brand colors.

**Visual recipe:** warm cream neutral canvas from current V2; existing garden green as primary; secondary canonical berry/sky/amber semantic accents; one obvious CTA; rounded volumetric hero and interactive objects; crisp high-contrast type; tiny purposeful motion; tangible correct/selection states. Read actual current `DESIGN/` tokens — **do not replace with arbitrary new hex**.

## 2. Structure
- Canvas calm; hero/educational manipulative prominent; never place everything in a bulky clay container.
- 3 depth tiers: flat text/canvas; raised clickable object/card; hero/featured. Fixed press lip on primary button remains visually distinct. No globally layered blurs.
- One top-level visual hero, **but never sacrifice question/answer controls** for decoration. For assessment, the math object is the hero, not a character.
- Smaller grades 1–2: fewer words, more illustrations, obvious targets; 3–4: structured visuals; 5–6: restrained decoration + more dense problems. Respect `grade-experience.ts`; only active content may be shown.
- 5 current WebP characters: use exact repo-mapped identifiers, roles, crops and aspect ratio verified from `characters.ts`/assets. Do not assume artwork exists for every emotional pose. Use only appropriate existing image and subtle Reanimated positioning where necessary.

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
UI audit and curriculum import are **separate workstreams**. `CONTENT_LIBRARY/` documents are draft content references. Stage4 has a proposed station-to-book mapping. Stage5 defines sound/motion/15 templates. Stage6 defines an authoring format. Stage7 provides a complete ST07 pilot, **not ST01**. The proposed 5-part P1–P5 model may not equal current StationFlow; mapping requires compatibility study and owner review of curriculum behavior before any runtime write.

No content promotion to production without explicit compatibility/validation decisions. See `CONTENT_LIBRARY/INTEGRATION_GATE.md`.

## 7. Engineering quality and stop criteria
- Preserve git dirty/untracked including current DESIGN and user plan. Read `git status` prior to modifications, use feature branch from current approved branch; no force-push.
- Per-route changed paths + behavior test + screenshot + verify source; ledger status values `DISCOVERED`, `AUDITED`, `IMPLEMENTED`, `TESTED_WEB`, `TESTED_NATIVE`, `BLOCKED` (not `DONE` on browser-only claims).
- Review in small batches. Fix P0/P1 before cosmetics. Visual improvement must be observed rather than inferred from `tokens` or passing parity.
- Device QA cannot be automatically waved away when SDK unavailable; leave `NATIVE_PENDING`, document precise commands for owner to run.
- No need to stop for approval on safe UI fixes; do stop before production data mutations, schema/contract semantics, purchasing/licensing or unsupported curriculum changes.
