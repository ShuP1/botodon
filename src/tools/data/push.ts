import fs from 'fs'
import { rest, rootStatus } from '../../prepare'
import Logger from '../../utils/Logger'

async function run() {
  const [,, file, title, visibility] = process.argv
  if (!file) {
    Logger.error('require file')
    return
  }

  const post = async (in_reply_to_id: string, status: string) => rest.postStatus({
    in_reply_to_id, status,
    visibility: visibility as any || 'direct'
  }).then(s => s.id)

  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  const folder = await post(rootStatus, title || file)
  for (const row of data) {
    if (typeof row === 'string') {
      await post(folder, row)
    } else if (typeof row === 'object') {
      const content = '\n' + Object.entries(row).map(([lang, message]) => `[${lang}] ${message}`).join('\n\n')
      const global = await post(folder, content)
      for (const [lang, message] of Object.entries(row)) {
        await post(global, `${message} #${lang}`)
      }
    } else {
      throw new Error('bad type ' + typeof row)
    }
  }
  Logger.info('data added', folder)
}
run()