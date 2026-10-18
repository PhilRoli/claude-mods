import type { Register } from 'claude-code'

const SLEEP = ['sudo', '-n', '/usr/bin/pmset', '-a', 'disablesleep']

async function setDisabled($: any, isDisabled: boolean) {
  const { exitCode, stderr } = await $.process.run([...SLEEP, isDisabled ? '1' : '0'])
  if (exitCode !== 0) return stderr.trim() || `pmset exited ${exitCode}`
  isDisabled ? await $.store.set('active', true) : await $.store.delete('active')
  $.ui.status(isDisabled ? 'lid-closed awake' : undefined)
  return undefined
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'nosleep',
      description: 'Keep the Mac awake with the lid closed until this session ends',
      argumentHint: '[on|off]',
    })
    // a crashed session can leave disablesleep on; undo it
    if (await $.store.get('active')) await setDisabled($, false)
    return next(e)
  })

  on('command.run', { command: 'nosleep' }, async ($, e) => {
    const isOn = Boolean(await $.store.get('active'))
    const want = e.args.trim() === 'on' ? true : e.args.trim() === 'off' ? false : !isOn
    const error = await setDisabled($, want)
    if (error) {
      return {
        text: `nosleep failed: ${error}\nAllow it once: echo "$USER ALL=(root) NOPASSWD: /usr/bin/pmset -a disablesleep *" | sudo tee /etc/sudoers.d/nosleep`,
      }
    }
    return { text: want ? 'Lid-closed sleep disabled until this session ends (or /nosleep off).' : 'Sleep restored.' }
  })

  on('session.end', async ($, e, next) => {
    if (await $.store.get('active')) await setDisabled($, false)
    return next(e)
  })
}
