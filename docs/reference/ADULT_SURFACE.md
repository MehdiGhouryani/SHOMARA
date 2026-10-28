# Adult Surface

## Status
Current supporting adult-surface contract; child onboarding authentication remains phone OTP only.

## Purpose
The adult surface exists to help a parent understand and support learning. It is not a second learner dashboard.

## Child shell rule
The child product exposes exactly three primary destinations: مسیر / تمرین / من.
Teacher login, teacher portal, assignments, leaderboard, friends, and learning currencies do not appear in the child shell.

## Parent report sections
1. Today
2. Current progress
3. Skills needing attention / building / strength
4. Recent learning
5. One simple activity for home

## Deliberate removals
The parent report does not expose teacher workflows, assignment management, ranking, social feed, or controls that directly change learning truth.

## Authorization
Parent access is a UX boundary, not a second authentication mechanism in the child onboarding flow. Server endpoints must authorize the parent account and child relationship independently.

## Settings
Settings are child-secondary and contain only learning and accessibility preferences. Account/teacher/subscription/product-management surfaces are not mixed into the child Settings page.

## Teacher
Teacher authentication and teacher workflow are not part of the child product or the current parent report. Existing teacher APIs are preserved for a possible separate Teacher product.
