import querystring from 'querystring'
import readline from 'readline'
import rp from 'request-promise-native'
import { rest } from '../../prepare'
import Logger from '../../utils/Logger'

async function run() {
  try {
    Logger.info('Checking current token')
    const { acct: me } = await rest.getMe()
    Logger.info(`Already logged as ${me}`)
  } catch (error) {
    Logger.info('Trying to get token')
    const redirectUri = 'urn:ietf:wg:oauth:2.0:oob'
    const scopes = 'read:accounts read:statuses write:statuses write:media'

    const { client_id, client_secret } = await rest.postApp(redirectUri, scopes)

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    Logger.info(`Please visit: https://${process.env.DOMAIN}/oauth/authorize?scope=${querystring.escape(scopes)}&redirect_uri=${redirectUri}&response_type=code&client_id=${client_id} to validate your token`)
    rl.question('And then paste token here: ', async code => {
      const { access_token } = await rp.post(`https://${process.env.DOMAIN}/oauth/token`, {
        json: true,
        body: {
          client_id, client_secret,
          grant_type: 'authorization_code',
          code, redirect_uri: redirectUri
        }
      })
      rl.write(`Put TOKEN=${access_token} in .env`)
      rl.close()
    })
  }
}
run()