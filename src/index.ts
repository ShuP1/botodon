import App from './App'
import { rest, rootStatus } from './prepare'

const app = new App(rest)
app.run(rootStatus)