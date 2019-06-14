import App from '../../App'
import { rest, rootStatus } from '../../prepare'

async function run() {
  const app = new App(rest)
  app.load(rootStatus, (_, { id }) => rest.deleteStatus(id))
}
run()