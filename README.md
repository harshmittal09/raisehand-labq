# RaiseHand Lab.Q

A digital hand-raise queue for programming labs. Students join the queue from their system instead of waving at the TA. The TA works through doubts oldest first, and every student can see their live position.

Built by a two-person Scrum team for our Agile lab, as three timeboxed micro-sprints on the night of 24–25 November 2026.

## Team

| Person | Scrum role | Builds |
|---|---|---|
| Harsh | Product Owner, developer | TA side |
| Shivansh | Scrum Master, developer | Student side |

## Links

- Board: added once the board is set up
- Live demo: [raisehand-labq.onrender.com](https://raisehand-labq.onrender.com). It runs on a free instance, so the first visit after a quiet spell takes about a minute.
- Backlog: [docs/backlog.md](docs/backlog.md)
- Sprint logs: [docs/sprints](docs/sprints)

## Run it locally

You need Node.js 22.13 or newer, because the app uses Node's built-in SQLite module. Check with `node -v`.

```bash
npm install
npm start        # http://localhost:3000
npm run dev      # same, but restarts when you save a file
npm test
npm run lint
```

Open http://localhost:3000/student.html for the student view and http://localhost:3000/ta.html for the TA view. On Node 22 the server prints an `ExperimentalWarning` about SQLite when it starts; that's expected.

Start a session in the TA view first, then join from the student view with its code.

The database lives in `data/raisehand.db`, which Git ignores. Delete it to start with an empty queue.

## Deploy

`render.yaml` describes the live service: Node on Render's free instance in Singapore, `npm ci` to build, `npm start` to run, and a health check on `/api/health`. The current service deploys from the public repo, so after merging to `main`, redeploy it from the Render dashboard with Manual Deploy, then Deploy latest commit.

## How we work

- [Team charter](docs/team-charter.md): roles, tonight's timeline, working agreement, Definition of Done
- [How we work](docs/how-we-work.md): board, branches, commits, pull requests, meetings
- [Contributing](CONTRIBUTING.md): the steps for taking a story to `main`
- [Product brief](docs/product-brief.md), [architecture](docs/architecture.md) and [wireframes](docs/wireframes)
- [Changelog](CHANGELOG.md)
