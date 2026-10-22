import type { Register, SessionRateLimit } from 'claude-code'

const WRAP_UP_PERCENT = 95
const IGNORE_IF_RESET_WITHIN_MIN = 5

const LABELS: Record<string, string> = { five_hour: '5-hour session', seven_day: 'weekly', spend_limit: 'spend' }

const resetsSoon = (l: SessionRateLimit, nowMs: number) =>
  l.resetsAt !== undefined && Date.parse(l.resetsAt) - nowMs <= IGNORE_IF_RESET_WITHIN_MIN * 60_000

export const nearLimit = (limits: SessionRateLimit[], nowMs: number): SessionRateLimit | undefined =>
  limits
    .filter(l => l.percentUsed >= WRAP_UP_PERCENT && !resetsSoon(l, nowMs))
    .sort((a, b) => b.percentUsed - a.percentUsed)[0]

const describe = (l: SessionRateLimit) => {
  const label = LABELS[l.kind] ?? l.kind
  const reset = l.resetsAt ? ` (resets ${new Date(l.resetsAt).toLocaleTimeString()})` : ''
  return `${label} limit ${Math.round(l.percentUsed)}% used${reset}`
}

export const register: Register = on => {
  on('session.measure', async ($, e, next) => {
    const hit = nearLimit(e.rateLimits, await $.clock.now())
    $.ui.status(hit ? `⏳ ${describe(hit)} — wrap up` : undefined)
    return next(e)
  })

  // prompt.compose is bypassed by cc-plugin-sec-default, so attach the nudge as hidden prompt context
  on('prompt.submit', async ($, e, next) => {
    const hit = nearLimit((await $.session.usage()).rateLimits, await $.clock.now())
    if (!hit) return next(e)
    const text =
      `The user's ${describe(hit)}; they are about to be cut off. ` +
      `Do not start new work. Finish the current step only if it can be done in a minute or two, leave the code in a ` +
      `consistent, working state (no half-applied edits), commit or note progress if appropriate, then stop and tell ` +
      `the user briefly what is done and what remains so they can resume after the limit resets.`
    return next({ ...e, context: [...(e.context ?? []), text] })
  })
}
