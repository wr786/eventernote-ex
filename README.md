# Eventernote Power Scripts

A small set of independent userscripts for Eventernote event list pages.

## Features

- `src/eventernote-compact-list.user.js`: dense list mode with hidden images and folded actor lists.
- `src/eventernote-keyword-filter.user.js`: keyword highlight, mute, and optional hiding for event title, venue, and actors.
- `src/eventernote-popularity-badges.user.js`: visual badges based on Eventernote note/attendance count.

## Install

Install only the `.user.js` files you want in Tampermonkey, Violentmonkey, or another userscript manager.
Each script has its own local settings and can run without the others.

## Supported Pages

- `https://www.eventernote.com/events/*`
- `https://www.eventernote.com/events`

## Settings

Open any Eventernote event list page and use the small control panels in the lower-right corner.
Settings are stored locally in your browser with `localStorage`.

## Development

```sh
node --check src/eventernote-compact-list.user.js
node --check src/eventernote-keyword-filter.user.js
node --check src/eventernote-popularity-badges.user.js
```
