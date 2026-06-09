# Eventernote Power List

A Tampermonkey userscript for Eventernote event list pages.

## Features

- Compact list mode with hidden images and folded actor lists.
- Clickable actor expansion for hidden compact-list actors.
- Keyword highlight, mute, and optional hiding for event title, venue, and actors.
- Popularity badges based on Eventernote note/attendance count.
- Followed-actor density badges when `Eventernote following highlight` cache is available.

## Install

Install `src/eventernote-power-list.user.js` in Tampermonkey, Violentmonkey, or another userscript manager.
The script includes separate toggles for compact list, keyword rules, and popularity badges.

## Supported Pages

- `https://www.eventernote.com/*`

## Settings

Open any Eventernote page and use the `Power List` panel in the lower-right corner.
Settings are stored locally in your browser with `localStorage`.

## Development

```sh
node --check src/eventernote-power-list.user.js
```
