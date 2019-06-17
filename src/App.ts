import { Status, VisibilityType } from 'mastodon'
import actionSource from './actions.json'
import dataSource from './database.json'
import Rest from './Rest'
import { Action, ActionConfig, ActionConfigData, RootConfig, VISIBILITIES } from './types/config'
import Logger from './utils/Logger'
import matcher from './utils/matcher'
import Selector from './utils/Selector'

export default class App {

  static filterData(replies: Status[], config: ActionConfigData) {
    return replies
      .filter(s => !config.favourited || s.favourited)
      .filter(s => s.favourites_count >= config.favourites)
      .filter(s => config.tagged.every(tag => s.tags.map(t => t.name).includes(tag)))
      .slice(0, config.last === -1 ? undefined : config.last)
  }

  constructor(private rest: Rest) { }

  async run(rootId: string) {
    this.load(rootId, this.process.bind(this))
  }

  async load(rootId: string, process: (me: string, action: Action) => Promise<any>) {
    const { id: me } = await this.login()

    const config = await this.loadRoot(rootId, me)
    Logger.debug('Root config', config)
    if (!config.botodon) {
      Logger.error('Root status requires #botodon tag')
      return
    }

    for (const action of await this.loadActions(rootId, config.deep, config.file, config.shared ? undefined : me)) {
      const promise = process(me, action)
      if (!config.async) {
        await promise
      }
    }
  }

  async login() {
    const me = await this.rest.getMe()
    Logger.debug(`Logged as ${me.acct}`)
    if (!me.bot) {
      Logger.warn('Please set account as bot !')
    }
    return me
  }

  async loadRoot(id: string, me: string) {
    const status = await this.rest.getStatus(id)
    if (status.account.id !== me) {
      Logger.warn('Root status isn\'t yours')
    }

    return matcher<RootConfig>({
      async: false,
      botodon: false,
      deep: false,
      shared: false,
      file: false
    }, status.tags.map(t => t.name).reverse())
  }

  async loadActions(id: string, deep: boolean, file: boolean, account?: string) {
    const lines: Action[] = (await this.rest.getReplies(id, deep, account))
      .map(s => ({ id: s.id, tags: s.tags.map(t => t.name) })).concat(file ? actionSource : [])

    Logger.debug(`Found ${lines.length} action(s)`)
    if (!lines.length) {
      Logger.error('Root status is empty !')
    }

    return lines
  }

  async process(me: string, action: Action) {
    const config = matcher<ActionConfig>({
      botodon: false,
      data: {
        file: false,
        from: [],
        deep: false,
        shared: false,
        tagged: [],
        favourited: false,
        favourites: 0,
        last: -1,
        weighted: false,
        same: false
      },
      global: false,
      followers: false,
      followers_of: [],
      replies: {
        to: [],
        deep: false,
        visibility: false
      },
      favourites: [],
      visibility: 'unlisted'
    }, action.tags.reverse())

    Logger.debug(`Action ${action.id} config`, config)
    if (!config.botodon) {
      Logger.error(`Action status ${action.id} requires #botodon tag`)
      return
    }
    if (!VISIBILITIES.includes(config.visibility)) {
      Logger.error(`Action status ${action.id}: invalid visibility ${config.visibility}`)
      return
    }

    // Data
    const datas = (await Promise.all(config.data.from.map(id => this.loadData(id, config.data, me))))
      .reduce((a, b) => a.concat(b), config.data.file ? this.loadDataFile(config.data) : [])
    if (!datas.length) {
      Logger.error(`Action ${action.id}: Any content`)
      return
    }
    const selector = new Selector(datas, config.data.same, s => config.data.weighted ? s.favourites_count : 1)

    // Targets
    // TODO: progressive send (limit memory usage)
    const targets: Array<{acct?: string, visibility: VisibilityType}> = []
    if (config.global) {
      targets.push({ visibility: config.visibility })
    }
    if (config.followers) {
      config.followers_of.push(me)
    }
    for await (const followers of config.followers_of.map(id => this.rest.getFollowers(id))) {
      Logger.debug(followers)
      targets.push(...followers.map(({ acct }) => ({ acct, visibility: config.visibility })))
    }
    for await (const replies of config.replies.to.map(id => this.rest.getReplies(id, config.replies.deep))) {
      targets.push(...replies.map(({ account: { acct }, visibility }) => ({
        acct, visibility: config.replies.visibility ? visibility : config.visibility
      })))
    }
    for await (const fav of config.favourites.map(id => this.rest.getFavouritedBy(id))) {
      targets.push(...fav.map(({ acct }) => ({ acct, visibility: config.visibility })))
    }
    Logger.debug(`Action ${action.id}: ${targets.length} target(s)`)
    if (!targets.length) {
      Logger.warn(`Action ${action.id}: Any target`)
    }

    for (const target of targets) {
      const next = selector.next()
      await this.rest.postStatus({
        media_ids: next.media_attachments.map(m => m.id),
        sensitive: next.sensitive,
        spoiler_text: next.spoiler_text,
        status: `${target.acct ? `@${target.acct} ` : ''}${next.content.replace(/<[^>]*>?/gm, '')}`,
        visibility: target.visibility
      })
    }
    Logger.debug(`Action ${action.id}: done`)
  }

  async loadData(id: string, config: ActionConfigData, me: string) {
    return App.filterData(await this.rest.getReplies(id, config.deep, config.shared ? undefined : me), config)
  }

  loadDataFile(config: ActionConfigData) {
    return App.filterData(dataSource.filter(s => config.deep || !s.deep).map(s => ({
      id: 'local', uri: 'file', account: { id: 'local', acct: 'file', bot: true, display_name: 'file', emojis: [] }, content: s.content || '',
      created_at: '', emojis: [], favourited: s.favourited || false, favourites_count: 0, media_attachments: (s.medias || []).map(m => ({
        id: m, description: '', url: 'file', preview_url: 'file', type: 'img'
      })), sensitive: false, reblogged: false, reblogs_count: 0,
      replies_count: 0, visibility: 'direct', tags: (s.tags || []).map(t => ({ name: t }))
    })), config)
  }

}