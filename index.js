const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), process.env.BOT_NAME ? `.env.${process.env.BOT_NAME}` : '.env') })
const rp = require('request-promise-native')

// Load env
const ENV = {
  instance: 'INSTANCE',
  token: 'TOKEN',
  data_status_id: 'DATA_STATUS',
  data_deep: 'DATA_DEEP',
  visibility: 'VISIBILITY',
  target_mode: 'TARGET',
  target_data: 'TARGET_STATUSES',
  timeout: 'TIMEOUT',
  moderation: 'MODERATION',
  moderation_limit: 'MODERATION_LIMIT'
}

function objectMap(object, mapFn) {
  return Object.keys(object).reduce(function (result, key) {
    result[key] = mapFn(object[key])
    return result
  }, {})
}

const options = objectMap(ENV, key => process.env[key])

// Setup request
const request = rp.defaults({
  auth: {
    bearer: options.token
  },
  baseUrl: `https://${options.instance}/api/v1/`,
  timeout: options.timeout,
  json: true
})

async function run(R, { data_deep, data_status_id, moderation, moderation_limit, target_mode, target_data, visibility }) {
  // verify_credentials
  const me = await R.get('accounts/verify_credentials')
  console.debug(`Logged as ${me.acct}`)
  if (!me.bot) {
    console.warn('Please set account as bot !')
  }

  // load data
  const { descendants: dataContext } = await R.get(`statuses/${data_status_id}/context`)
  const content = dataContext.filter(s => {
    if (!data_deep && s.in_reply_to_id !== data_status_id) {
      return false
    }

    switch (moderation) {
      case 'self':
        return s.account.id === me.id

      case 'favourited':
        return s.favourited

      case 'favourites_count':
        return s.favourites_count >= moderation_limit

      default:
        return true
    }
  })
  console.debug(`Found ${content.length} messages (of ${content.length})`)
  if (!content.length) {
    throw 'Any message found'
  }

  // find targets
  let targets = []
  switch (target_mode) {
    case 'global':
      targets.push({ visibility })
      break

    case 'self':
      targets.push({ acct: me.acct, visibility })
      break

    case 'followers':
      const followers = await R.get(`accounts/${me.id}/followers`, { qs: { limit: 999 } })
      targets.push(...followers.map(({ acct }) => ({ acct, visibility })))
      break

    case 'replies':
    case 'replies_deep':
    case 'replies_smart':
      const allReplies = await Promise.all(target_data.split(',').map(id => {
        console.log(id)
        return R.get(`statuses/${id}/context`)
      }))
  }

  console.log(targets)
}

run(request, options)

/*
Object.entries(process.env)
  .filter(e => e[0].startsWith(TOKEN))
  .forEach(e => {
    const lang = e[0].substring(TOKEN.length + 1)
    const visi = process.env[`${VISIBILITY}_${lang}`] || process.env[VISIBILITY]

    const M = new Mastodon({
      access_token: process.env[`${TOKEN}_${lang}`] || process.env[TOKEN],
      api_url: `${process.env[`${URL}_${lang}`] || process.env[URL]}/api/v1/`,
      timeout_ms: 60 * 1000
    })

    M.get('accounts/verify_credentials').then(
      me => {
        if (me.data.error) {
          console.error(me.data.error)
          return
        }

        M.get(`accounts/${me.data.id}/followers`, { limit: 9999 }).then(fol => {
          for (const follow of fol.data) {
            const messages = database[Math.floor(Math.random() * database.length)]
            const text = lang.length > 0 ? messages[lang] : '\n' + Object.entries(messages).map(m => `[${m[0]}] ${m[1]}`).join('\n\n')

            M.post('statuses', { status: `@${follow.acct} ${text}`, visibility: visi })
          }
        })
      })
  })
*/