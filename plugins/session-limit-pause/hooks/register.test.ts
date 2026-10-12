import { test, expect } from 'claude-code/testing'
import { nearLimit } from './register'

const now = Date.parse('2026-10-12T12:00:00Z')
const at = (min: number) => new Date(now + min * 60_000).toISOString()

test('nearLimit picks the most-used window at or above the threshold', () => {
  expect(nearLimit([{ kind: 'five_hour', percentUsed: 50, resetsAt: at(120) }], now)).toBeUndefined()
  expect(nearLimit([{ kind: 'five_hour', percentUsed: 96, resetsAt: at(120) }, { kind: 'seven_day', percentUsed: 99, resetsAt: at(3000) }], now)?.kind).toBe('seven_day')
})

test('a window resetting within 5 minutes is ignored', () => {
  expect(nearLimit([{ kind: 'five_hour', percentUsed: 98, resetsAt: at(4) }], now)).toBeUndefined()
  expect(nearLimit([{ kind: 'five_hour', percentUsed: 98, resetsAt: at(6) }], now)?.kind).toBe('five_hour')
  expect(nearLimit([{ kind: 'five_hour', percentUsed: 98 }], now)?.kind).toBe('five_hour')
})
