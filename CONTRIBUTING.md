# Contributing

How to take a story from the board to `main`.

1. **Pick your card.** Take the top card you own in Sprint Backlog and move it to In Progress.
2. **Branch from the latest `main`.**
   ```bash
   git checkout main
   git pull
   git checkout -b feature/RH-03-ta-queue
   ```
3. **Build it, test-first where you can.** Add tests in `test/`; `test/support/server.js` starts the app with a fresh in-memory database. Use prepared statements for every SQL query.
4. **Check locally.**
   ```bash
   npm test
   npm run lint
   ```
5. **Commit with the card ID, then push.**
   ```bash
   git commit -m "feat(ta): show the queue oldest first (RH-03)"
   git push -u origin feature/RH-03-ta-queue
   ```
6. **Open a pull request** titled `RH-03: TA sees the queue, oldest first`. Fill in the template, request a review from the other developer, and move the card to In Review.
7. **Merge after review.** Once there's one approval and CI is green, use **Squash and merge** and delete the branch.
8. **Demo it at the sprint review.** The Product Owner moves the card to Done once it's accepted.

If `main` moved while you worked, bring it into your branch with `git fetch origin && git merge origin/main`, then push again.
