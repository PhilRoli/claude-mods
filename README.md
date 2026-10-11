# traintracker-claude

A [Claude Code](https://claude.com/claude-code) mod for [TrainTracker](https://github.com/PhilRoli/traintracker).
Shortly before your tracked train arrives (default: 10 minutes), every Claude Code session is told to stop
starting new work, leave the code in a consistent state and report what's done and what remains, so you can
switch locations or turn off wifi without cutting a session off mid-task.

## Install

```
/plugin install train-pause --marketplace PhilRoli/traintracker-claude
```

Requires TrainTracker (≥ 1.3.0), which writes the arrival time to `~/.traintracker/arrival.json`
(`{"arrival": <epoch seconds, delay included>}`) while a train is tracked. Idle sessions pick up the
instruction on their next prompt; the status line shows a countdown.

Change the window with `WRAP_UP_MINUTES` in `hooks/register.ts`.
