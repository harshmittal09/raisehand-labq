# Product backlog

Ordered by the Product Owner. Points are the team's estimates (suggested before Sprint 0, confirmed with planning poker). The split is by screen: Harsh builds the TA side, Shivansh the student side.

| ID | Story | Points | Owner | Planned sprint |
|---|---|---|---|---|
| RH-01 | Join with name and system number | 2 | Shivansh | 1 |
| RH-02 | Raise a doubt with a short description and category | 3 | Shivansh | 1 |
| RH-03 | TA sees the queue, oldest first | 3 | Harsh | 1 |
| RH-04 | TA marks a doubt resolved | 2 | Harsh | 1 |
| RH-05 | Doubts survive a refresh or restart | 2 | Harsh | 1 |
| RH-06 | Live "You're #4" position | 5 | Shivansh | 2 |
| RH-07 | "Helping now" status the student can see | 3 | Harsh | 2 |
| RH-08 | Withdraw a doubt | 2 | Shivansh | 2 |
| RH-09 | Live demo link on Render | 2 | Harsh | 2 |
| RH-10 | TA opens a session with a join code | 5 | Harsh | 3 |
| RH-11 | End-of-session stats | 3 | Shivansh | 3 |
| RH-12 | Works on a phone | 2 | Shivansh | 3 |
| RH-13 | Fixes from the Sprint 2 review | 2 | Whoever finishes first | 3 |
| RH-14 | TA filters the queue by category | 2 | Stretch | |
| RH-15 | Alert when it's your turn | 2 | Stretch | |

Each sprint plans 12 points; each developer carries 17 across the night.

## Sprint 1: a student can raise a doubt and the TA can clear it

### RH-01 · Join with name and system number

As a student, I want to enter my name and system number once, so that the TA knows who I am and where I'm sitting.

- Given I open the student page, when I enter my name and system number and press Join, then I see the doubt form with my name on it.
- Given I've joined, when I reload the page, then I'm still joined.
- Given either field is empty, when I press Join, then I see what's missing and nothing is sent.

### RH-02 · Raise a doubt with a short description and category

As a student, I want to describe my doubt in one line and pick a category, so that the TA knows what to expect.

- Given I've joined, when I pick a category (Compile error, Logic, Viva prep, Other), write up to 140 characters and press Raise my hand, then the doubt is saved and I see that I'm in the queue.
- Given I already have an open doubt, when I try to raise another, then I'm told to wait or withdraw the first one.
- Given the description is empty or too long, when I submit, then the API returns 400 and the page says what to fix.

### RH-03 · TA sees the queue, oldest first

As a TA, I want to see every open doubt, oldest first, so that I help students in the order they asked.

- Given three open doubts, when I open the TA page, then I see them oldest first with name, system number, category, description and how long each has waited.
- Given a student raises a new doubt, when 3 seconds pass, then it appears at the bottom without a reload.

### RH-04 · TA marks a doubt resolved

As a TA, I want to mark a doubt resolved, so that it leaves the queue.

- Given a doubt in the queue, when I press Resolve, then it leaves the queue and its resolved time is saved.
- Given my doubt was resolved, when I reload the student page, then I see it was resolved and can raise a new one.

### RH-05 · Doubts survive a refresh or restart

As a TA, I want the queue kept in the database, so that a reload or a server restart never loses anyone's place.

- Given open doubts, when the server restarts, then the queue comes back unchanged and in the same order.
- Given a resolved doubt, when any page reloads, then it doesn't reappear in the queue.

## Sprint 2: students know where they stand

### RH-06 · Live "You're #4" position

As a student, I want to see my live position in the queue, so that I know whether to keep working or wait.

- Given three students raised doubts before me, when I open my page, then I see "You're #4" on the token display.
- Given someone ahead of me is resolved, when 3 seconds pass, then my position updates without a reload.
- Given my doubt is resolved, then I see that it's resolved and the doubt form comes back.

### RH-07 · "Helping now" status the student can see

As a TA, I want to mark the doubt I'm walking over to as "helping now", so that the student knows I'm on my way.

- Given a doubt in the queue, when I press Helping now, then it's highlighted on my list and the student sees that the TA is on the way.
- Given I'm already helping someone, when I press Helping now on another doubt, then the first one goes back to waiting in its original place.
- Given a doubt marked "helping now", when I press Resolve, then it's resolved as usual.

### RH-08 · Withdraw a doubt

As a student, I want to withdraw my doubt if I fix it myself, so that the TA doesn't walk over for nothing.

- Given I have an open doubt, when I press Withdraw and confirm, then it leaves the queue and everyone behind me moves up.
- Given the TA is already helping me, when I withdraw, then the TA's list drops it within 3 seconds.

### RH-09 · Live demo link on Render

As the team, we want a public link that updates on every merge to `main`, so that anyone can try the latest version.

- Given a merge to `main`, when the deploy finishes, then the live link shows the new version.
- The live link is in the README and in the Sprint 2 mail.

## Sprint 3: ready to run in a real lab

### RH-10 · TA opens a session with a join code

As a TA, I want to open a lab session and get a short join code, so that only students in my lab join my queue.

- Given I'm on the TA page, when I press Start session, then I get a 4-character code and an empty queue.
- Given a student enters a code that isn't open, when they press Join, then they see that no open session has that code.
- Given I press End session, then nobody can raise new doubts in it.

### RH-11 · End-of-session stats

As a TA, I want a summary when I end a session, so that I can see how the lab went.

- Given I end a session, then I see how many doubts were handled and withdrawn, the average wait, and the most common category.
- Given a session with no doubts, then the summary says there were none instead of showing errors or empty charts.

### RH-12 · Works on a phone

As a student on my phone, I want the student page to fit my screen, so that I can raise a doubt without a laptop.

- Given a screen 360 px wide, when I use the student page, then nothing scrolls sideways and every button is at least 44 px tall.

### RH-13 · Fixes from the Sprint 2 review

- Every fix noted in the Sprint 2 review is either done or moved back to the backlog with a reason.

## Stretch

### RH-14 · TA filters the queue by category

As a TA, I want to filter the queue by category, so that I can batch similar doubts, like viva questions.

### RH-15 · Alert when it's your turn

As a student, I want a clear alert when I'm next, so that I'm ready when the TA arrives.

- Given I become first in the queue, then my page shows a banner and the tab title changes to "You're next".
