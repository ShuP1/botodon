import { rest, rootStatus } from '../../prepare'
import Logger from '../../utils/Logger'

async function run() {
  const content = process.argv[2]
  if (!content) {
    Logger.error('require content')
    return
  }
  Logger.info(`adding action: "${content}"`)
  const status = await rest.postStatus({
    in_reply_to_id: rootStatus,
    status: content,
    visibility: 'private'
  })
  Logger.info('action added', { id: status.id, tags: status.tags.map(t => t.name).reverse() })
}
run()