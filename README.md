# Botodon

A pretty simple random message bot using [Mastodon](https://joinmastodon.org) statuses as source of truth.

- **no database:** store volatile data in statuses
- **easy edit:** allows easy edit from web ui or apps.
- **community:** allows public submit with strict or community driven moderation

## Install
### Mastodon

- Create an account for this bot. Please mark it as bot in configuration page.
- In settings page, create a new application with read write permission and copy the private key.
- Create a status to store messages (could be private) and copy his id. *Called `data status` after*
- Reply to this status to add content. (Removing @acct, to limit self spam)

### Botodon

```sh
git clone <url> botodon
cd botodon
npm install
cp .env.sample .env
```

Edit `.env` at least set `INSTANCE=domain.tld`, `TOKEN={ACCOUNT_PRIVATE_KEY}` and `DATA_STATUS={STATUS_ID}`

Run `node index.js` with cron.

Enjoy

## Options

`.env` file currently contains all need options but will maybe a day be moved to mastodon statuses.

key | format | description
-- | -- | --
INSTANCE | Domain name | Mastodon instance domain name
TOKEN | Private key | Bot account application private key
DATA_STATUS | Status id | Messages storage status
VISIBILITY | [visibility](https://docs.joinmastodon.org/api/entities/#visibility) | Bot message(s) visibility
TARGET | See [Target](#target) | Define statuses targets
TARGET_STATUSES | Statuses id (comma separated) | Used with some `TARGET` options
TIMEOUT | milliseconds | API timeout
MODERATION | See [Moderation](#moderation) | Define moderation method
MODERATION_LIMIT | int | Used with `MODERATION=favourites_count`

Note: malformed `.env` could produce unexpected behaviors

### Target

Define statuses targets with `TARGET` option:

- `none`: nothing send *(default)*
- `global`: single without target
- `self`: single with self as target
- `followers`: one to each follower
- `replies`: use direct replies to `TARGET_STATUSES`
- `replies_deep`: use deep replies to `TARGET_STATUSES`
- `replies_smart`: same as `replies` but override `VISIBILITY with reply visibility`
- `favourites`: use favourites of `TARGET_STATUSES`
- `favourites_smart`: use favourites on `TARGET_STATUSES` by using tags as options

#### Favourites Smart

**WIP**

### Moderation

You could let community produce messages by making your `data status` public or unlisted.

For moderation, simply use `MODERATION` option:

- `none`: no check *(default)*
- `self`: one your messages
- `favourited`: bot account need to fav valid messages
- `favourites_count`: need at least the number of fav defined with `MODERATION_LIMIT` option

## Multiple bots

Add `.env.XXX` files and run `BOT_NAME=XXX node index.js`

## Notes
### Limits

Mastodon context API use an arbitrary limit of `4096` since [#7564](https://github.com/tootsuite/mastodon/pull/7564), it's so the limit were new replies are excluded.

Followers soft limit of `999` *(must include pagination)* and hard limit of `7500`.

## TODO

every thing
add selection mode
multiple target