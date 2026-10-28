# ADR-0001 — No Unity in V1

Date: 2026-09-24
Status: LOCKED

## Decision

Unity is **not** part of the V1 architecture.

The child experience uses:

- React Native + Expo + TypeScript
- React Native New Architecture + Hermes
- Reanimated for UI/gesture/transition motion
- Rive for the main character and interactive 2D animation/state machines
- Optional React Native Skia only for a specific mini-game that genuinely needs custom canvas rendering

There is no Unity project, Unity runtime, Unity-specific content pipeline, or Unity dependency in the repository.

## Product interpretation

The product is **exercise-first and game-like**, not a separate game application.

```text
Learning Objective
      ↓
Encounter
      ↓
Game-like interaction
      ↓
Attempt / Answer
      ↓
Evaluator
      ↓
Evidence
      ↓
Learning State
```

A mini-game is an Experience Form around a real learning encounter. The game layer may provide movement, drag/drop, timing, collection, exploration, character reaction, sounds, effects, and progression feedback, but it must not become a second learning engine.

## Why

The architecture stays close to the existing React Native client, keeps content modular, avoids adding a heavyweight game-engine runtime, and preserves the rule that Learning Truth belongs to the shared learning platform.

## Reference pattern

Official Duolingo engineering material describes Rive as a cross-platform animation solution used for Math, including interactive visual experiences and unique exercise types. Duolingo also describes its broader lessons as gamified bite-sized exercises rather than requiring a standalone game engine.

This is an architectural reference pattern, not a claim that our implementation copies Duolingo.
