import { RequestPromise, RequestPromiseAPI } from 'request-promise-native'
import { Account, Context, Status, StatusPost } from './types/mastodon'
import Limiter from './utils/Limiter'
import Logger from './utils/Logger';

export default class Rest {
  constructor(private api: RequestPromiseAPI, private limiter: Limiter) {}

  async getMe() {
    return this.get<Account>('accounts/verify_credentials')
  }

  async getStatus(id: string) {
    return this.get<Status>(`statuses/${id}`)
  }

  async getContext(id: string) {
    return this.get<Context>(`statuses/${id}/context`)
  }

  async getDescendants(id: string) {
    return this.getContext(id)
      .then(context => context.descendants)
  }

  async getReplies(id: string, deep: boolean, account?: string) {
    return this.getDescendants(id).then(replies => replies
        .filter(s => deep || s.in_reply_to_id === id)
        .filter(s => !account || s.account.id === account))
  }

  async getFollowers(id: string) {
    // TODO: use link header
    return this.get<Account[]>(`accounts/${id}/followers`, { limit: 999 })
  }

  async getFavouritedBy(id: string) {
    // TODO: use link header
    return this.get<Account[]>(`statuses/${id}/favourited_by`, { limit: 999 })
  }

  async postStatus(status: StatusPost) {
    return this.post<Status>('statuses', status)
  }

  async deleteStatus(id: string) {
    return this.delete<void>(`statuses/${id}`)
  }

  async postApp(redirectUri: string, scopes: string) {
    return this.post<{ client_id: string, client_secret: string }>('/apps', {
      client_name: 'botodon',
      redirect_uris: redirectUri, scopes,
      website: 'https://git.wadza.fr/me/botodon'
    })
  }

  protected async call<T>(promise: RequestPromise) {
    return this.limiter.promise<T>(promise.catch(err => {
      Logger.error(`Rest: ${err.message} on ${err.options.uri}`)
      throw err
    }) as undefined as Promise<T>)
  }

  protected async get<T>(url: string, qs: object = {}) {
    return this.call<T>(this.api.get(url, { qs }))
  }

  protected async post<T>(url: string, body: any) {
    return this.call<T>(this.api.post(url, { body }))
  }

  protected async delete<T>(url: string) {
    return this.call<T>(this.api.delete(url))
  }

}