# Changelog

Notable changes, grouped by release. Each sprint ends with a release.

## [Unreleased]

## [1.1.0]

### Added

- RH-14: the TA can filter the queue by category.
- RH-15: a student sees a "You're next" banner and tab title when they reach the front.

## [1.0.0]

### Added

- RH-10: TAs open lab sessions with 4-character join codes. Each session has its own queue, and TA actions need the session's secret.
- RH-11: an end-of-session summary with doubts handled and withdrawn, the average wait and the most common category.
- RH-12: the student page fits phone screens.

## [0.2.0]

### Added

- RH-06: students see their live place in the queue, refreshed every 3 seconds.
- RH-07: the TA marks one doubt "helping now", and the student sees that the TA is on the way.
- RH-08: students withdraw their own doubt.
- RH-09: a Render blueprint and the live demo link.

## [0.1.0]

### Added

- RH-01: students join with their name and system number.
- RH-02: students raise a doubt with a category and a one-line description.
- RH-03: the TA sees open doubts, oldest first, refreshed every 3 seconds.
- RH-04: the TA resolves doubts, and the student sees it after a reload.
- RH-05: the queue survives a server restart.
- Sprint 0 setup: product brief, team charter, how-we-work guide, architecture note, wireframes and product backlog.
- CI that runs lint and tests on every pull request and on `main`.
- Starter app: Express server with a health check, the SQLite tables for sessions and doubts, and empty student and TA pages.
