# Eventernote Userscripts

Two independent Tampermonkey userscripts for Eventernote.

## Eventernote Lite Enhancer

- Compact list mode with hidden images and denser event rows.
- Tiny Google Maps link beside Eventernote venue links.
- Popularity highlighting on Eventernote's existing attendance count at 10, 50, and 100 attendees.
- Followed-actor highlighting with a compact pill style and a cache updated when visiting `/users`.

Visit `https://www.eventernote.com/users` once after installation to cache your followed actors.

## Eventernote Fancy UI

- Bold black-and-white navigation, typography, forms, and controls.
- Minimal three-column event rows with stronger date, title, and attendance hierarchy.
- Editorial profiles, oversized statistics, dense calendars, tabs, tables, and footer styling.
- Preserves Eventernote's original two-column page layouts.
- CSS-only implementation with no network requests or DOM observers.

## Install

Install either script independently in Tampermonkey, Violentmonkey, or another userscript manager:

- `src/eventernote-power-list.user.js`
- `src/eventernote-fancy-ui.user.js`

## Supported Pages

- `https://www.eventernote.com/*`

## Settings

Settings are stored locally in your browser with `localStorage`.

## Development

```sh
npm run check
```
