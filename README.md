# Eventernote Lite Enhancer

A Tampermonkey userscript for Eventernote event list pages.

## Features

- Compact list mode with hidden images and denser event rows.
- Tiny Google Maps link beside Eventernote venue links.
- Popularity highlighting on Eventernote's existing attendance count at 10, 50, 80, and 100 attendees.
- Followed-actor highlighting with a compact pill style and a cache updated when visiting `/users`.

Visit `https://www.eventernote.com/users` once after installation to cache your followed actors.

## Install

Install `src/eventernote-power-list.user.js` in Tampermonkey, Violentmonkey, or another userscript manager.
The script applies enhancements automatically after installation.

## Supported Pages

- `https://www.eventernote.com/*`

## Settings

Settings are stored locally in your browser with `localStorage`.

## Development

```sh
node --check src/eventernote-power-list.user.js
```
