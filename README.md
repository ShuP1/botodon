# Botodon

A pretty simple random message bot using [Mastodon](https://joinmastodon.org) statuses as source of truth.

- **no database:** store volatile data in statuses
- **easy edit:** allows easy edit from web ui or apps.
- **community:** allows public submit with strict or community driven moderation

## Install
### Mastodon

- Create an account for this bot. Please mark it as bot in configuration page.
- In settings page, create a new application with `read write` permission and copy the private key.
  - Or `read:accounts read:statuses write:statuses write:media`
  - Could use `npm run token-add` *(requires `DOMAIN` in `.env`)*
- Create a status to store actions (could be private) containing `#botodon` and copy its id. *Called `root status` after*
- Create a status to store content (could be private) and copy its id. *Called `data status` after*
  - Reply to this status to add content. (Removing @acct, to limit self spam)
- Reply to `root status` with options tags *(See `action status`)* like `#botodon #global #data_from_{DATA_STATUS_ID}`

### Botodon

Download folder from [releases](https://git.wadza.fr/me/botodon/releases).

In `.env` set
- `DOMAIN={INSTANCE_DOMAIN}`
- `TOKEN={PRIVATE_KEY}`
- `ROOT_STATUS={ROOT_STATUS_ID}`

Run `node index.js` with cron.

Enjoy

## Main ideas

It uses statuses tags as configuration like `#xxx_yyy`. So content doesn't really matter except obviously for `content statuses`

There is 3 *types* of statuses:

- *The* `root status` contains global options. See [Root status](#root-status)
- `action status` contains action to run and is descendant of `root status`. See [Action status](#action-status)
- `data status` is a data source like a folder containing `content statuses`
- `content status` is a *normal* status its content *(including medias)* will send

### Root status

Its a folder containing `action statuses` and global options as tags.

tag | description
--- | ---
botodon | **Required** Enable tags processing
async | Enable actions parallel processing
deep | Use replies to actions as actions
shared | **Unsafe** Include other users actions
file | Also load actions from `actions.json` 

### Action status

It describe an action to run

#### Sample

```
#botodon #global #data_from_xxxxxxxxxxxx
```

Send standard status with random content from `xxxxxxxxxxxx` status

#### Options

tag | default | description
--- | --- | ---
botodon | false | **Required** Enable tags processing
**Data source** | | content send
data_file | empty | Use `database.json` as source *(See database.sample.json)*
data_from_**ID** | empty | Add a source of content: `data status` id
data_deep | false | Use replies to content as content
data_shared | false | **Warning** Include other users content
data_tagged_**TAG** | empty | Require content to have this tag *(Tags are lowercase on backend)*
data_favourited | false | Require content to be fav by bot account
data_favourites_**N** | false | Require at least N favourites
data_last_**N** | disabled | Only include  N last statuses
data_weighted | false | Use `favourites_count` as promotional random weight
data_same | false | Send same content for all targets
**Targets** | | target accounts
global | false | Send without target
followers | false | Send to each followers
followers_of_**ID** | empty | Send to each followers of given account id **Don't be evil**
replies_to_**ID** | empty | Send to each repliers of given status id
replies_deep | false | Include replies to replies
replies_visibility | false | Use reply visibility
favourites_**ID** | empty | Send to each use who fav given status id
visibility | unlisted | Visibility to use. One of `public`, `unlisted`, `private`, `direct`


## Multiple bots

Add `.env.XXX` files and run `BOT_NAME=XXX node index.js`

## Limits

Mastodon context API use an arbitrary limit of `4096` since [#7564](https://github.com/tootsuite/mastodon/pull/7564), it's so the limit were new replies are excluded.

Mastodon api limit to 300 requests within 5 minutes. Using a rate limiter at 150 requests for 5 minutes.

Followers soft limit of `999` *(must include pagination)* and hard limit of `7500`.

### Pleroma

It supports Mastodon API but uses case-sensitive ids which can't be stored as tag.

You have to use actions and database json files as fallback.

## Tools

`tools` folder contains some useful script which could be as helpful as dangerous.

## TODO

- Add abstract and inherit on deep actions
- Add actions time validators
- Use followers pagination
- Add options on `data status`
- Add move pick options
- Handle errors
- Move to Go ?
