import dotenv from 'dotenv'
import path from 'path'
import rp from 'request-promise-native'

import Rest from './Rest'
import Limiter from './utils/Limiter';

dotenv.config({ path: path.resolve(process.cwd(), process.env.BOT_NAME ? `.env.${process.env.BOT_NAME}` : '.env') })

const toInt = (s: string) => Number.parseInt(s, undefined)

export const rest = new Rest(rp.defaults({
  auth: {
    bearer: process.env.TOKEN
  },
  baseUrl: `https://${process.env.DOMAIN}/api/v1/`,
  timeout: toInt(process.env.TIMEOUT),
  json: true
}), new Limiter(toInt(process.env.LIMIT_COUNT), toInt(process.env.LIMIT_TIME)))
export const rootStatus = process.env.ROOT_STATUS