# How we work

## The board

Lists, left to right: **Product Backlog → Sprint Backlog → In Progress → In Review → Done**.

- At sprint planning, the stories we commit to move from Product Backlog to Sprint Backlog.
- Move your card to In Progress when you start it, and to In Review when you open the pull request.
- The Product Owner moves it to Done after accepting it at the review.
- Card titles carry the ID and points, like `RH-03 · TA sees the queue, oldest first [3]`.

## Branches, commits and pull requests

The step-by-step version is in [CONTRIBUTING.md](../CONTRIBUTING.md).

- One branch per card: `feature/RH-03-ta-queue`, `fix/RH-13-position-off-by-one`, `chore/…`, `docs/…`.
- Commit messages follow Conventional Commits with the card ID: `feat(ta): show the queue oldest first (RH-03)`.
- Pull request titles start with the card ID: `RH-03: TA sees the queue, oldest first`. Fill in the template, including the Definition of Done checklist.
- `main` is protected: merging needs a pull request, one approval from the other developer and a green CI run. We merge with **Squash and merge**.

## Meetings

| Meeting | Length tonight | Agenda |
|---|---|---|
| Sprint planning | 10–15 min | The PO states the sprint goal. We pull stories from the top of the Product Backlog up to last sprint's velocity and confirm owners. The SM writes the plan into the sprint log. |
| Standup (written) | 5 min | Each of us posts: done since planning, next, blockers. |
| Sprint review | 20–25 min | Demo each story against its acceptance criteria. The PO accepts or rejects it. Feedback becomes new backlog items. We tag the release. |
| Retrospective | 10–15 min | Sprint 1: Start / Stop / Continue. Sprint 2: Mad / Sad / Glad. Sprint 3: Liked / Learned / Lacked / Longed for. We pick one action and add it as a card to the next sprint. |

## Estimation

Story points on the Fibonacci scale: 1, 2, 3, 5, 8. We estimate together with planning poker in Sprint 0. Tonight, anything over 5 points gets split.

## Releases

| After | Tag |
|---|---|
| Sprint 1 | v0.1.0 |
| Sprint 2 | v0.2.0 |
| Sprint 3 | v1.0.0 |

Release notes go in [CHANGELOG.md](../CHANGELOG.md).

## Sprint mails

Sent to the team at each boundary: a kickoff mail before Sprint 0, then one mail after each sprint covering that sprint's review and the next sprint's plan. The last one carries the v1.0.0 release and the demo recording.
