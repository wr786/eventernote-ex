# Eventernote Power List

A Tampermonkey userscript for Eventernote event list pages.

## Features

- Compact list mode with hidden images and denser event rows.
- Keyword highlight, mute, and optional hiding for event title, venue, and actors.
- Popularity highlighting on Eventernote's existing note/attendance count.
- Followed-actor highlighting with a compact pill style, also using the `Eventernote following highlight` cache.

## Install

Install `src/eventernote-power-list.user.js` in Tampermonkey, Violentmonkey, or another userscript manager.
The script includes separate toggles for compact list, keyword rules, popularity highlighting, and followed-actor highlighting.

## Supported Pages

- `https://www.eventernote.com/*`

## Settings

Open any Eventernote page and use the `Power List` panel in the lower-right corner.
Settings are stored locally in your browser with `localStorage`.

## Development

```sh
node --check src/eventernote-power-list.user.js
```
