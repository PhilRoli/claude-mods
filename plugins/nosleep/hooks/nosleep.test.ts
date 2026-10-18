import { test, expect } from 'claude-code/testing'

test('/nosleep on runs pmset disablesleep 1 and /nosleep off undoes it', async ($, on) => {
  const argvs: string[][] = []
  const stored = new Map<string, unknown>()
  on('process.run', async (_$, e) => {
    argvs.push([...e.argv])
    return { value: { exitCode: 0, stdout: '', stderr: '' } }
  })
  on('store.get', async (_$, e) => ({ value: stored.get(e.key) }))
  on('store.set', async (_$, e) => (stored.set(e.key, e.value), { value: undefined }))
  on('store.delete', async (_$, e) => (stored.delete(e.key), { value: undefined }))
  on('ui.status', async () => ({ value: undefined }))

  await $.command.run({ command: 'nosleep', args: 'on' })
  await $.command.run({ command: 'nosleep', args: 'off' })

  expect(argvs[0]?.slice(-2)).toEqual(['disablesleep', '1'])
  expect(argvs[1]?.slice(-2)).toEqual(['disablesleep', '0'])
})
