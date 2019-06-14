import { RequestPromiseAPI } from 'request-promise-native'
import { Account, Context, Status, StatusPost } from './types/mastodon'

export default class Rest {
  constructor(readonly api: RequestPromiseAPI) {}

  async getMe(): Promise<Account> {
    return this.api.get('accounts/verify_credentials')
  }

  async getStatus(id: string): Promise<Status> {
    return this.api.get(`statuses/${id}`)
  }

  async getContext(id: string): Promise<Context> {
    return this.api.get(`statuses/${id}/context`)
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

  async getFollowers(id: string): Promise<Account[]> {
    // TODO: use link header
    return this.api.get(`account/${id}/followers`, { qs: { limit: 999 } })
  }

  async getFavouritedBy(id: string): Promise<Account[]> {
    // TODO: use link header
    return this.api.get(`statuses/${id}/favourited_by`, { qs: { limit: 999 } })
  }

  async postStatus(status: StatusPost): Promise<Status> {
    return this.api.post('statuses', { body: status })
  }

  async deleteStatus(id: string) {
    return this.api.delete(`statuses/${id}`)
  }

}