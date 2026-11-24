# Product brief

## Problem

In a programming lab, students who are stuck raise their hands and wait. The TA has to remember who asked first, quiet students get skipped, and everyone with a hand in the air stops working while they wait.

## Users

- **Student:** stuck on something and wants help without losing their place or their time.
- **TA:** wants to help people fairly and in order, without tracking it in their head.

## Product goal

Every doubt in a lab gets handled in the order it was raised, and every student can see where they stand.

## What we ship tonight

| Sprint | Sprint goal |
|---|---|
| 1 | A student can raise a doubt and the TA can clear it |
| 2 | Students know where they stand: live position, "helping now", withdraw, a live demo link |
| 3 | Ready to run in a real lab: session join codes, end-of-session stats, works on a phone |

## Not in scope

Student accounts or passwords, chat between student and TA, notifications outside the browser, and several TAs working one queue.

## How we'll know it works

- The TA can clear doubts strictly in order, and none go missing after a refresh or a restart.
- A student's position updates within 3 seconds of a change.
- At the end of a session, the TA can see how many doubts were handled and the average wait.
