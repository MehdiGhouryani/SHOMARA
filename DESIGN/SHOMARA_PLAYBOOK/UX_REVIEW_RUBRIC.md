# UX + Visual Review Rubric (apply to EVERY route and state)

Evaluate each dimension 0–4 (0 broken, 1 weak, 2 usable but deficient, 3 good, 4 excellent), with a concrete source path or screenshot for each number. Scores guide work, **not** a substitute for actual acceptance tests.

| Dimension | To examine | Evidence that counts |
|---|---|---|
| Orientation | Where am I / what do I do / what next? | 3-second first-glance review, label + CTA |
| Task clarity | Instructions understandable for target age | user flow, readable Persian copy |
| Flow friction | unnecessary taps, repeated confirmations, dead ends | end-to-end interaction trace |
| Feedback | success/retry/loading/offline states | visual states + functional tests |
| Visual composition | focal point, consistency, breathing room | before/after screenshots |
| Clay craft | cohesive contours/lip/soft depth without blur clutter | screenshots in normal/pressed state |
| Motion & haptics | purposeful, immediate, cancelable, reduced motion | on-device or explicit limited browser test |
| Accessibility | labels, touch sizes, focus, TalkBack semantic | a11y tree and real-device test when possible |
| Responsiveness | 360/390/412dp, text scale, keyboard | screenshots and overflow probe |
| Curriculum integrity | correct math representations and answer evaluation | contract tests + station content source |
| Robustness | resume, fast taps, offline, errors, images unavailable | negative-path tests |

**Acceptance for each route:** all critical dimensions ≥3 where verified; zero P0/P1; blockers remain open; visual judgement based on inspected screenshots. Do not fake a number for untested Native or children-in-the-loop UX. `UNVERIFIED` is a permitted result, not a defect to hide.

## Screen observation protocol
1. Capture initial screenshot at 360 and 390dp, normal font size.
2. Describe top 3 observed issues and rank P0–P3.
3. Inspect actual JSX/styles/tokens/data flow and relevant DESIGN page spec.
4. Modify the *screen and reusable components* without blindly wrapping V1 in ClaySurface.
5. Capture after (same viewport/state); compare visually, fix overlaps and visual hierarchy.
6. Exercise every meaningful state: loading, disabled, correct/retry, back, offline, empty and error **as applicable**.
7. Test touch, a11y, state persistence, one-full-journey. Run gates.
8. Update `SCREEN_LEDGER.csv`, record tests and open Android gate.

## Clay anti-pattern reject list
- Single large embossed panel swallowing every item; excessive blur/elevation everywhere.
- Low-contrast text atop milky clay; icon-only CTA without label.
- Character larger than math objective; too many bouncing elements.
- Mixed icon stroke weights; flat CTAs beside raised CTAs without semantic intent.
- Press lip animation that displaces neighboring layout; slow/hard-to-cancel motion.
- Decorations representing mathematical shapes incorrectly.
- Legacy appearance leaking through navigation to a V2 page.
