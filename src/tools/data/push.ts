import fs from 'fs'
import { rest, rootStatus } from '../../prepare'
import Logger from '../../utils/Logger'

async function run() {
  const [,, file, title] = process.argv
  if (!file) {
    Logger.error('require file')
    return
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  const ok =  data.map((l: any) => Object.entries(l).map(([lang, message]) => `[${lang}] ${message}`).join('\n'))
  Logger.info('data', ok)
  /*
  const status = await rest.postStatus({
    in_reply_to_id: rootStatus,
    status: content,
    visibility: 'private'
  })
  Logger.info('action added', { id: status.id, tags: status.tags.map(t => t.name).reverse() })*/
}
run()