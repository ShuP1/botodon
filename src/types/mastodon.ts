export interface Emoji {
    shortcode: string
    static_url: string
}

export interface Account {
    id: string
    acct: string
    bot: boolean
    display_name: string
    emojis: Emoji[]
}

export type VisibilityType = 'public' | 'unlisted' | 'private' | 'direct'

export interface Status {
    id: string
    uri: string
    account: Account
    content: string
    created_at: string
    emojis: Emoji[]
    favourited: boolean
    favourites_count: number
    media_attachments: Media[]
    sensitive: boolean
    reblogged: boolean
    reblogs_count: number
    replies_count: number
    in_reply_to_id?: string
    reblog?: Status
    spoiler_text?: string
    card?: Card
    poll?: Poll
    tags: Tag[]
    visibility: VisibilityType
}

export interface StatusPost {
    status: string
    in_reply_to_id?: string
    media_ids?: string[]
    sensitive?: boolean
    spoiler_text?: string
    visibility: VisibilityType
}

export type CardType = 'link' | 'photo' | 'video' | 'rich'
export interface Card {
    url: string
    title: string
    description: string
    image?: string
    type: CardType
    author_name?: string
    author_url?: string
    provider_name?: string
    provider_url?: string
}

export interface PollOption {
    title: string
    votes_count?: number
}
export interface Poll {
    id: string
    expires_at?: string
    expired: boolean
    multiple: boolean
    votes_count: number
    options: PollOption[]
    voted?: boolean
}

export interface PollVote {
    id: number
    poll: string
    choices: string[]
}

export interface Tag {
    name: string
}

export interface Media {
    id: string
    description: string
    url: string
    preview_url: string
    type: string
}

export interface Context {
    ancestors: Status[]
    descendants: Status[]
}