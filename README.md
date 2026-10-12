# claude-mods

Small [Claude Code](https://claude.com/claude-code) mods.

```
/plugin marketplace add PhilRoli/claude-mods
```

## train-pause

For [TrainTracker](https://github.com/PhilRoli/traintracker). Shortly before your tracked train arrives
(default: 10 minutes), every session is told to stop starting new work, leave the code in a consistent state and
report what's done and what remains, so you can switch locations or turn off wifi without cutting a session off
mid-task.

```
/plugin install train-pause@claude-mods
```

Requires TrainTracker (≥ 1.3.0), which writes the arrival time to `~/.traintracker/arrival.json`
(`{"arrival": <epoch seconds, delay included>}`) while a train is tracked. Idle sessions pick up the
instruction on their next prompt; the status line shows a countdown. Change the window with `WRAP_UP_MINUTES`
in `plugins/train-pause/hooks/register.ts`.

## session-limit-pause

Same idea for usage limits: once the 5-hour or weekly window is ≥ 95% used, the session is told to wrap up.
A window that resets within 5 minutes is ignored. Needs a subscription (the engine reports no limits otherwise).

```
/plugin install session-limit-pause@claude-mods
```

Tune with `WRAP_UP_PERCENT` and `IGNORE_IF_RESET_WITHIN_MIN` in `plugins/session-limit-pause/hooks/register.ts`.
