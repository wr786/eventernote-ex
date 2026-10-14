# Eventernote Userscripts

Two independent Tampermonkey userscripts for Eventernote.

## Eventernote Lite Enhancer

- Compact list mode with hidden images and denser event rows.
- Tiny Google Maps link beside Eventernote venue links.
- Tiny same-day event search link beside each event date.
- Popularity highlighting on Eventernote's existing attendance count at 10, 50, and 100 attendees.
- Event search recommendations combine up to 10 pages initially and load more on demand, ranked by the summed participation counts of followed performers; toggle back to the original page anytime.
- Followed-actor highlights keep the original orange/red/gold milestones with jewel-toned gradients that deepen by participation count, switching to black and champagne gold at 100+ appearances; profile artist rankings show `[n回]` beside each name. The cache updates when visiting `/users`.

This replaces the separate [Eventernote 参加回数表示](https://greasyfork.org/ja/scripts/369760-eventernote-%E5%8F%82%E5%8A%A0%E5%9B%9E%E6%95%B0%E8%A1%A8%E7%A4%BA) userscript. Disable that copy to avoid duplicate counts.

Visit `https://www.eventernote.com/users` once after installation to cache followed actors and their participation counts.

## Eventernote Fancy UI

- Material 3 Expressive-inspired color, shape, size, containment, and motion.
- Three-column event cards with rhythmic color markers and emphasized attendance.
- Expressive profiles, tri-color statistics, calendars, tabs, controls, and reduced-motion support.
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
