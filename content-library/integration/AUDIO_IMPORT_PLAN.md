# Audio metadata / TTS integration (draft-only)

Files: `originals/shomara-global-audio-manifest.csv` + `originals/shomara-ST07-audio-manifest.csv`.

They contain text and fields `id,kind,text_display,text_tts,voice,rate,status,used_by,notes`, **not playable audio**. `rate=-15%` and `fa-IR-DilaraNeural` in input are drafts, not a signed-off voice.

The import target is an **audio script** record. A generated or uploaded file creates a separate versioned `AudioAsset` with duration/checksum/format/source/rights/moderation/review evidence. The two records must never share one ambiguous status field; see `AUTHORING_CONTRACT_GAPS.md`.

- Read repository's existing admin upload schema, storage, permissions, playback and offline prefetch before choosing destination.
- Validate CSV encoding UTF-8, column names, nonempty/unique IDs, supported kinds, text existence, draft statuses, and safe import repeat behavior; log only IDs, no PII.
- Import to staging/draft only if an existing compatible admin pipeline exists and is authorized. Avoid blind DB writes.
- Generate TTS externally only after owner selects a voice, has service credentials and grants authorization. Check rights/terms for voices, verify pronunciation of numerals and ambiguous Persian words with a native speaker.
- Test missing asset fallback and offline prefetch. Add no `play()` calls for rows with no audio URL.
- Voice, ambient music, SFX and haptics are independently configurable; music confined to path if enabled.
- Preserve status transitions and trace audio ID to station/item; never automatically assign a global encouragement to assessments where no hints are allowed.
- Require RBAC, actor/time audit trail, impact analysis before shared-line edits, orphan/missing reports and reversible publish/rollback.
