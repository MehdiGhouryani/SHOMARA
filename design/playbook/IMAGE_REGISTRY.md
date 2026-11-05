# Image Registry — SHOMARA (separate list, owner-delivered)

Status: REGISTRY ONLY. No image in this list is shipped to runtime by
this file, and no generated image was added to any `drawable` folder
in Stage 4. Every row is `PENDING_OWNER` until the owner delivers it
or explicitly approves a high-quality generated version — and even
then it is reviewed before it ships. The splash file
(`shomara_splash_artwork.png`) is never replaced by any row here.

Common rules for every prompt below (negative rules, binding):
- NO text of any kind inside the image (no Persian, no Latin, no digits).
- NO copy of Duolingo artwork, pages, colours, characters, or text.
- NO stars, coins, gems, hearts, flames, crowns, chests, loot boxes,
  or any score / reward / currency motif, in original or reskinned form.
- NO real child's face, NO real child's photo, NO textbook artwork.
- Calm SHOMARA style only: warm cream canvas `#FFF8EF`, garden green
  `#0C7A54` as the main accent, amber `#FFB020` only for attention,
  berry `#C13A7C` / sky `#1D6FA8` only in pale form if needed.
- Generous empty space: the subject must never fill the frame edge
  to edge, and any centre area that a UI element will cover must be
  kept empty (see the per-row empty-space note).
- If a row needs a character, it must use the approved ADR-0035 cast
  (Main / Number / Dana / Fandogh / Roka) in its approved geometry.
  A generated character that is off-model is rejected, not shipped.

## P1 — Welcome hero background (from the zero-to-hundred plan)

- Page / family: 01 Welcome / Launch
- Size / format: WebP (or PNG) 1440x1800, landscape-safe calm scene
- Status: PENDING_OWNER
- Prompt (EN): "A calm, warm, hand-drawn-style garden illustration for a
  Persian children's maths app: soft cream background (#FFF8EF), a
  gentle green garden path curving through low bushes and round
  friendly trees, a few large soft counting stones and leaves in the
  foreground, generous empty sky and empty lower third for UI text,
  no text, no numbers, no characters, no reward symbols, soft
  daylight, flat warm colours, no busy detail, no dark shadows."
- Prompt (FA, short): «تصویر آرام باغ برای صفحه خوش‌آمد: پس‌زمینه
  کرم گرم، مسیر سبز ملایم، درختان گرد و سنگ‌های شمارش بزرگ و نرم،
  آسمان خالی و یک‌سوم پایینی خالی برای متن، بدون هیچ متنی، بدون
  عدد، بدون شخصیت، بدون نماد پاداش.»
- Note: This is a separate image from the splash artwork. The splash
  file stays untouched.

## P2 — Path ribbon strip (from the zero-to-hundred plan)

- Page / family: 06 Learning Path
- Size / format: WebP 1440x320, wide strip
- Status: PENDING_OWNER
- Prompt (EN): "A very calm, wide, low garden ribbon strip for a
  children's learning path screen: cream background (#FFF8EF), a
  single gentle green winding path from right to left, small round
  bushes and soft leaves, at least 60% of the strip kept as plain
  cream empty space so path nodes can sit on top, no text, no
  numbers, no characters, no stars or coins, flat warm colours."
- Note: The strip is decoration only; node state is never carried by
  this image (state comes from labels and shapes in code).

## P3 — ST07 station-start frame (from the zero-to-hundred plan)

- Page / family: 07 Station Start, ST07 only
- Size / format: WebP 1440x900
- Status: PENDING_OWNER
- Prompt (EN): "A calm garden frame illustration for a station-start
  screen about the numbers 1 and 2: cream background (#FFF8EF),
  soft green garden border with leaves and two large soft counting
  objects at the sides, the centre at least 60% completely empty
  for the title and the single start button, no text, no digits,
  no characters, no reward symbols, flat warm colours, generous
  breathing room."
- Note: No unauthored station is given a frame by copying this one.

## P4 — Restrained result / celebration image (from the zero-to-hundred plan)

- Page / family: 11 Recovery / Result
- Size / format: WebP with alpha 800x800
- Status: PENDING_OWNER
- Prompt (EN): "A restrained, calm celebration illustration with
  transparent background: soft green leaves and a few gentle warm
  confetti shapes in cream and garden green, no text, no numbers,
  no stars, no coins, no crowns, no chests, no flames, no
  character unless the owner supplies approved character artwork
  separately, quiet and skippable in feeling, flat warm colours."
- Note: If a character is wanted here, it must be an approved
  Main/Number pose supplied by the owner, not a generated look-alike.
  That is why this row is NOT a generation candidate (see §Candidates).

## P5 — Optional offline / system-state image (from the zero-to-hundred plan)

- Page / family: 16 States
- Size / format: WebP with alpha 800x800
- Status: PENDING_OWNER (optional — the StateSurface placeholder
  already covers this state without an image)
- Prompt (EN): "A calm, friendly offline illustration with
  transparent background: a small soft garden scene with a sleeping
  leaf and a gentle cloud, cream and garden green, no text, no
  numbers, no characters, no warning symbols in red, no reward
  symbols, quiet and reassuring, flat warm colours."
- Note: Optional only. If the owner does not deliver it, the state
  surface stays as it is; no placeholder image is invented.

## P6 — Optional profile header (from the zero-to-hundred plan, re-confirmed in Stage 4)

- Page / family: 14 Profile / Me
- Size / format: WebP 1440x720
- Status: PENDING_OWNER (optional)
- Prompt (EN): "A calm, wide, low garden header for a child's profile
  screen: cream background (#FFF8EF), soft green bushes and leaves
  along the bottom edge only, the upper two thirds completely
  empty for the name and progress text, no text, no numbers, no
  characters, no badges, no stars, no streak symbols, flat warm
  colours, generous empty space."
- Note: The header is decoration behind text, never a dashboard and
  never a progress display by itself. The current Me header card
  (PrimarySoft, token colours) is the shipped fallback until this
  row is delivered.

## P7 — Practice empty-state image (new in Stage 4, optional)

- Page / family: 12 Practice Tab, empty state only
- Size / format: WebP with alpha 800x800
- Status: PENDING_OWNER (optional — the warm empty guide text
  already covers this state without an image)
- Prompt (EN): "A calm, friendly empty-state illustration with
  transparent background for a practice tab: a small open garden
  path with soft green leaves and one large soft counting stone,
  cream and garden green, no text, no numbers, no characters, no
  lock or sad symbols, no reward symbols, inviting but quiet,
  flat warm colours, generous empty space around the subject."
- Prompt (FA, short): «تصویر آرام حالت خالی تمرین: مسیر باغ باز با
  برگ‌های سبز نرم و یک سنگ شمارش بزرگ، بدون متن، بدون عدد، بدون
  شخصیت، بدون نماد قفل یا ناراحتی، بدون نماد پاداش.»

## P8 — Manipulative icons for templates T01–T15 (new, from the path deep review + readiness cards)

- Page / family: 06 Learning Path (per-station visual identity) + 08/09/10 (template rendering, when the local package exists)
- Size / format: WebP with alpha 800x800, one icon per template (T01–T15, 15 icons)
- Status: PENDING_OWNER
- Prompt (EN): "A set of 15 calm, flat, single-manipulative icons for a Persian children's maths app, each on a transparent background: one icon per template (counting objects, tally marks, counters, pattern blocks, number line, clock, and the other template manipulatives exactly as defined in the template specs in content-library). Each icon shows only its own manipulative, large and centred, in cream (#FFF8EF) and garden green (#0C7A54) with amber (#FFB020) only for attention, generous empty space around the subject, no text, no digits, no numbers as content, no characters, no stars, no coins, no reward symbols, flat warm colours, no busy detail."
- Prompt (FA, short): «۱۵ آیکون دست‌ورزی برای قالب‌های T01 تا T15: هر آیکون فقط دست‌ورزِ قالب خودش را نشان می‌دهد (طبق مشخصات قالب در content-library)، بزرگ و در مرکز، پس‌زمینه شفاف، کرم و سبز باغ، بدون هیچ متن و عدد، بدون شخصیت، بدون نماد پاداش.»
- Note: Each icon must depict exactly its own template's manipulative — a wrong manipulative teaches the wrong thing, so the owner/designer checks each icon against the template spec before approval. No icon is shipped until its template's manipulative is defined in the approved content (today only ST07's templates are specced; the other stations' templates are not). Until then this row stays PENDING_OWNER and the path keeps the chapter band (Phase A) as its visual identity.
- Generation: candidate (character-free, simple shapes), with the per-template check above — generation is not shipping; the owner reviews each icon against the negative rules and its template spec before the row moves to APPROVED.

## S1 — Settings / guardian calm image: NOT NEEDED

- Page / family: 15 Avatar / Settings / Guardian
- Size / format: —
- Status: NOT NEEDED — built with canvas and Compose primitives.
- Reason: Parent/settings dial is 2/2/5 (calm, textual, denser).
  A decorative image would add noise to an adult, functional
  surface and would compete with the passcode field and the
  avatar-selection state. If a future owner decision changes this,
  a new registry row must be added first; no image is to be
  dropped into the settings screen without one.

## NOT REQUESTED (explicitly, do not create)

- Any hero image for families 08 / 09 / 10: the manipulative or the
  problem itself is the hero.
- Any challenge image until CONTENT-016 scope is decided.
- Any new avatar, any new character, any reskinned character.
- Any busy child-page background for a learning screen.
- Any image containing a score, a star, a coin, a heart, a flame,
  a crown, a chest, a leaderboard, or a day counter.

## Generation candidates (high quality only, owner approval still required)

Candidates for high-quality generation, because they are
character-free scenes with simple shapes and the negative rules
above are easy to check visually: P1, P2, P3, P5, P7, P8 (with the
per-template manipulative check in the P8 row).
NOT candidates (owner must deliver from approved artwork):
P4 (celebration — a generated character would be off-model, and a
generated celebration easily drifts into reward motifs) and P6
(profile header — it sits behind the child's name and progress, so
an off-palette or busy header would hurt readability; owner
delivery is safer).
Even for candidates, generation is not shipping: the owner reviews
the image against the negative rules above before it is added to
any drawable folder, and the registry row status changes from
PENDING_OWNER to APPROVED only then, with the delivered file's
sha256 recorded in a follow-up note.
