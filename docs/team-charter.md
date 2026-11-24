# Team charter

## Team and roles

| Person | Role | Owns |
|---|---|---|
| Harsh | Product Owner, developer | Backlog order, sprint goals, accepting stories, the demo. Builds the TA side. |
| Shivansh | Scrum Master, developer | Timeboxes, standups, retros, keeping the board accurate. Builds the student side. |

## Timeline (IST)

We run Scrum as three timeboxed micro-sprints in one night. The Scrum Guide caps a sprint at one month and sets no minimum.

| Block | Time | What happens |
|---|---|---|
| Sprint 0: setup | Tue 24 Nov, 6:00–7:30 pm | Kickoff, backlog walkthrough, planning poker, both of us run the app locally |
| Sprint 1: raise and resolve | 7:30–10:30 pm | Planning 15 min, build, standup at 8:45, review 20 min, retro 10 min |
| Break | 10:30–11:00 pm | |
| Sprint 2: live queue | 11:00 pm–2:00 am | Planning 15 min, build, standup at 12:15, review and deploy check 20 min, retro 10 min |
| Sprint 3: lab-ready | Wed 25 Nov, 2:00–4:30 am | Planning 10 min, build, standup at 3:00, final review with the demo recording and v1.0.0 tag 25 min, retro 15 min |

If we start late, everything shifts by the same amount. If Sprint 3 would run past 5 am, the Product Owner cuts RH-11 and RH-12 first.

## Working agreement

1. Every change goes through a pull request. Nobody pushes to `main` or merges their own pull request.
2. When the other person asks for a review, do it within 10 minutes.
3. In Progress holds at most two cards per person. Finish before starting something new.
4. Post the standup in the team chat at each sprint's halfway mark: done since planning, next, blockers.
5. Say you're blocked the moment you are. Don't wait for the standup.
6. Timeboxes are hard stops. The Scrum Master calls time.
7. Unfinished stories go back to the Product Backlog at the end of a sprint and don't count toward velocity.

## Definition of Done

A story is done when all of these are true:

- Every acceptance criterion in [the backlog](backlog.md) is met.
- Tests cover the new behaviour, and CI (lint and tests) is green.
- The other developer reviewed and approved the pull request.
- It's merged to `main` through the pull request.
- It works in the latest Chrome on a laptop, and on a phone after RH-12.
- The Product Owner accepted it at the sprint review.
