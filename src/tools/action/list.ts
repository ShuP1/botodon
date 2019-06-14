import App from '../../App'
import { rest, rootStatus } from '../../prepare'
import Logger from '../../utils/Logger'

async function run() {
  const app = new App(rest)
  app.load(rootStatus, (_, action) => {
    Logger.info(JSON.stringify(action))
    return Promise.resolve()
  })
}
run()