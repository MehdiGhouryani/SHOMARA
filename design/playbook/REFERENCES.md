# Sources, scope and trust distinctions

- UI/UX Pro Max (official repo): https://github.com/nextlevelbuilder/ui-ux-pro-max-skill — *inspiration for searchable style + master/page-specific files, UX guidelines, no random style decisions*. We are NOT distributing its source/database or claiming skill installation. The PLAYBOOK is an original project-local workflow.
- Pro Max `skill-content.md` on GitHub: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/src/ui-ux-pro-max/templates/base/skill-content.md — master + page overrides, review targets and stack distinction.
- Duolingo Method whitepaper (2023), Math learning by doing, multiple representations, manipulative virtual tools: https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_duolingo_method_2023.pdf — inspired principles only, no protected illustration copying.
- WCAG 2.2: https://www.w3.org/TR/WCAG22/ — accessible contrast, focus, dragging alternatives, reduced motion, target sizing. 48dp/72dp targets in our app are project goals, NOT an assertion that WCAG AA mandates those exact dp numbers.
- Android Native: use the official AGP release/compatibility table, Compose setup, built-in Kotlin migration, Android 16 behavior changes and AndroidX release notes; pin versions and do not infer API availability. https://developer.android.com/build/releases/gradle-plugin · https://developer.android.com/develop/ui/compose/setup-compose-dependencies-and-compiler · https://developer.android.com/build/migrate-to-built-in-kotlin · https://developer.android.com/about/versions/16/behavior-changes-16
- React Native/Expo remains a migration reference: consult the installed SDK docs for current behavior rather than assuming APIs. https://docs.expo.dev/ and https://reactnative.dev/docs/accessibility
- `content-library/originals`: user-supplied study, research, architecture and pilot documents. **Not externally verified by this package**, and several explicitly state draft/review pending. Keep source claims distinct from independent official research.

## License and sourcing constraints
Original user-provided documents are preserved verbatim. No third-party diagrams, screenshots, character artwork or Rive files are bundled. Do not download or generate external assets without the owner's art brief and rights check.
