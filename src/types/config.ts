import { VisibilityType } from 'mastodon'

export interface RootConfig {
    botodon: boolean
    async: boolean
    deep: boolean
    shared: boolean
    file: boolean
}
export interface Action {
    id: string,
    tags: string[]
}

export interface ActionConfig {
    botodon: boolean,
    data: ActionConfigData
    global: boolean
    followers: boolean
    followers_of: string[]
    replies: {
        to: string[]
        deep: boolean
        visibility: boolean
    }
    favourites: string[]
    visibility: VisibilityType
}

export interface ActionConfigData {
    file: boolean
    from: string[]
    deep: boolean
    shared: boolean
    tagged: string[]
    favourited: boolean
    favourites: number
    last: number
    weighted: boolean
    same: boolean
}

export const VISIBILITIES = ['public', 'unlisted', 'private', 'direct']