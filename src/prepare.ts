import dotenv from 'dotenv'
import path from 'path'
import rp from 'request-promise-native'

import Rest from './Rest'

dotenv.config({ path: path.resolve(process.cwd(), process.env.BOT_NAME ? `.env.${process.env.BOT_NAME}` : '.env') })

export const rest = new Rest(rp.defaults({
  auth: {
    bearer: process.env.TOKEN
  },
  baseUrl: `https://${process.env.DOMAIN}/api/v1/`,
  timeout: Number.parseInt(process.env.TIMEOUT, undefined),
  json: true
}))
export const rootStatus = process.env.ROOT_STATUS