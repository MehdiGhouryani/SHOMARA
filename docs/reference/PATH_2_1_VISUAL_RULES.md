# Path 2.1 Visual Rules

**Status:** Canonical
**Scope:** Learner-facing Path on Web + Mobile

## Visual hierarchy

The Path is the primary learning surface. It is one continuous scroll, grouped into Units, with a single current position.

### Unit header

Show only:

- `واحد N`
- short Unit title
- completed/total count

Do not place long learning objectives or explanatory paragraphs in the header.

### Station node kinds

The station identity is communicated by the icon shape, while status is communicated by state treatment.

| Kind | Meaning | Icon treatment |
|---|---|---|
| LESSON | core learning step | book |
| PRACTICE | repeatable practice | sparkles |
| CHALLENGE | unit-end challenge | trophy |
| REVIEW | review step | refresh |

State wins over kind for the semantic status: completed = check, locked = lock, not-downloaded = download, sync-pending = sync.

### Path geometry

Station rows alternate right/left through the whole 25-station path. Connectors are diagonal/curved and there is no central vertical spine.

### Jump

Jump appears at a Unit boundary, not between arbitrary stations. It opens a five-question assessment. The server scores it. Four correct answers are required to open the target Unit's first station. Failed assessment returns the learner to the Path.

Successful jump does not mark skipped stations complete. Skipped stations remain revisit-able.

### Primary actions

Only the current station gets an inline `ادامه بده` action. Other accessible stations are opened directly; locked stations explain the prerequisite without exposing technical identifiers.

## Responsive rule

The same semantic Path is rendered on Web and Mobile. Layout may change, but order, statuses, Unit grouping, Jump rules, and station titles do not.
