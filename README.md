# Eventernote Userscripts

Independent Tampermonkey userscripts for Eventernote. Use Eventernote EX for features and Eventernote Air for the new visual theme.

## Eventernote EX

- Compact list mode with hidden images and denser event rows.
- Tiny Google Maps link beside Eventernote venue links.
- Tiny same-day event search link beside each event date.
- “我的现场” starts collapsed on your own profile; click its heading to expand/collapse. Includes: a month calendar of planned events, annual attendance recap with monthly distribution and top performers/venues, and followed-artist milestone countdowns with tentative achievement dates.
- Click “读取完整参加记录” to read all pages of your own registered events (up to 100 pages, with progress and retry). Until completion, the calendar is explicitly a homepage preview and annual statistics remain locked. Records stay in page memory; future registrations are separated from past dates using Japan time. Countdown totals are recalculated from historical events rather than adding plans to the site's potentially plan-inclusive counters.
- Personal itinerary on your own planned-event profile section, grouped by date and start time with a date selector, venues, end times, gaps, and overlap cues. Search results and followed-artist event suggestions are excluded.
- Popularity highlighting on Eventernote's existing attendance count at 10, 50, and 100 attendees.
- Event search recommendations combine up to 10 pages initially and load more on demand, ranked by the summed participation counts of followed performers; toggle back to the original page anytime.
- Followed-actor event badges and profile count capsules share one seven-tier metallic palette and capsule style. Event badges show performer names only; profile capsules show counts only. Profile artist rankings retain `[n回]`. The following cache updates when visiting `/users`.
- Profile artists switch between a refined grouped list (quiet separators, system typography, metallic rank count capsules: iron 0–9, bronze 10–29, silver 30–49, gold 50–99, black gold 100–149, black diamond 150–199, ruby 200+) and the original typography. Original mode displays `[n回]` and fits long names and counts onto one line as the column resizes; list mode truncates unusually long names with a full-name tooltip. The selection is remembered locally.

This replaces the separate [Eventernote 参加回数表示](https://greasyfork.org/ja/scripts/369760-eventernote-%E5%8F%82%E5%8A%A0%E5%9B%9E%E6%95%B0%E8%A1%A8%E7%A4%BA) userscript. Disable that copy to avoid duplicate counts.

Visit `https://www.eventernote.com/users` once after installation to cache followed actors and their participation counts.

## Eventernote Air

[Install on GreasyFork](https://greasyfork.org/zh-CN/scripts/601552-eventernote-air).

- A separate Apple-inspired theme: quiet neutral surfaces, translucent dark navigation, system typography, subtle borders and structured forms/detail tables.
- Complements Eventernote EX: keeps event row geometry, compact mode, performer metals, participation typography, hidden states, sorting and personal dashboard controls under EX's ownership.
- CSS rules are scoped to `body.ena-enabled`; the script only adds this marker and a stylesheet. No event handlers, observers, storage, external fonts or network requests.
- Preserves the site's fixed desktop two-column layout; respects reduced transparency, increased contrast, and print output. No decorative motion.
- Install alongside EX, or use Air alone. Fancy UI below is an alternative older theme; choose one visual theme at a time.

## Eventernote Fancy UI (legacy alternative)

- Material 3 Expressive-inspired color, shape, size, containment, and motion.
- Three-column event cards with rhythmic color markers and emphasized attendance.
- Expressive profiles, tri-color statistics, calendars, tabs, controls, and reduced-motion support.
- Preserves Eventernote's original two-column page layouts.
- CSS-only implementation with no network requests or DOM observers.

## Install

Install the scripts independently in Tampermonkey, Violentmonkey, or another userscript manager:

- `src/eventernote-power-list.user.js`
- `src/eventernote-air.user.js` (visual companion for EX)
- `src/eventernote-fancy-ui.user.js` (older alternative theme)

## Supported Pages

- `https://www.eventernote.com/*`

## Settings

Settings are stored locally in your browser with `localStorage`.

## Development

```sh
npm run check
```
