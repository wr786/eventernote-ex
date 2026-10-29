# Eventernote EX

[简体中文](README.md) · **English** · [日本語](README.ja.md)

Make event discovery, personal plans, and attendance recaps easier on [Eventernote](https://www.eventernote.com/).

[Install](https://greasyfork.org/en/scripts/583130-eventernote-ex) · [Source](src/eventernote-power-list.user.js) · [Report an issue](https://github.com/wr786/eventernote-ex/issues)

## Quick start

1. Install a userscript manager such as Tampermonkey or Violentmonkey in your browser.
2. Open the [GreasyFork page](https://greasyfork.org/en/scripts/583130-eventernote-ex) and install **Eventernote EX**.
3. Sign in to Eventernote and visit [your own profile](https://www.eventernote.com/users) once to cache followed performers and the site's participation counts.

You can then use “按关注推荐” in event search, switch participation display modes, or expand “我的现场” on your profile. Revisit your profile to refresh the cache after follows or counts change.

> If you also use the separate [Eventernote 参加回数表示](https://greasyfork.org/ja/scripts/369760) script, disable it to avoid duplicate counters.

## Event discovery and browsing

| Feature | Behavior and scope |
| --- | --- |
| Recommendations across pages | In event search and monthly listings, “按关注推荐” ranks events by the sum of your participation counts for followed performers appearing in them. The first batch combines up to 10 pages; “加载更多推荐” reads up to 10 more each time. Includes deduplication, progress, retry, and restoring the original order. |
| Followed-performer badges | Performer badges share the profile counters' seven metallic tiers. Event badges show names only, without counts or tier labels. |
| Event popularity | Highlights the site's attendee counts at 10 / 50 / 100 people, separately from your personal participation counts. |
| Venue maps | The `map` link beside a venue opens a Google Maps search. |
| Same-day search | The `all` link beside a date finds other events that day. |
| Compact browsing | Reduces spacing and hides thumbnails on applicable event lists. |

## Your profile

### Participation display modes

Choose a mode beside the performer list. Your preference is saved locally:

- **徽章模式 — badge mode:** uniform typography, subtle separators, and right-aligned metallic count capsules displaying only `126回`. Long names are truncated to one line; hover for the full name.
- **原版模式— original mode:** preserves the site's size hierarchy and colors, with counts formatted as `[126回]`. Long names and counts shrink to fit on one line.

Performer ranking pages also show `[n回]` beside names.

On your own profile, **Count scope** switches between all site registrations (including future plans) and through today. The latter reads the complete history, excludes future events using the Japan date, deduplicates events, and updates counts, metal tiers and descending order in either display mode. Today is included regardless of event end times. Switching back restores the original values and order; a failed load keeps the previous statistics. History is shared with My Live Journal and cached only for the current page.

### Seven metallic tiers

Event performer badges and profile count capsules share these thresholds. Tier names below describe the palette; they are not displayed on the badges.

| Site participation count | Tier |
| ---: | --- |
| 0–9 | Iron |
| 10–29 | Bronze |
| 30–49 | Silver |
| 50–99 | Gold |
| 100–149 | Black gold |
| 150–199 | Black diamond |
| 200+ | Ruby |

### My Live Journal — 我的现场

Available on your own profile and **collapsed by default**. Click its heading to expand or collapse it. Collapsing keeps records already loaded in the current page.

| View | Contents |
| --- | --- |
| Planned-event calendar | Browse your registered plans from today onward by month. Select a date to see its events, times, and venues. |
| Annual recap | Select a year to view registrations through today, event days, venue counts, monthly distribution, and top performers and venues. Future plans are counted separately. |
| Milestone countdowns | Recalculates followed performers' historical appearances from complete records, shows the remaining events to the next goal, and uses future plans to suggest a possible milestone date and event. Goals are 10 / 20 / 30 / 50 / 100 / 150 / 200 appearances, then every 50. |

Click **“读取完整参加记录”** to load your records page by page, up to 100 pages, with progress, source-total validation, event deduplication, and retry. Until loading finishes, the calendar is only a preview of plans on the profile; recaps and countdowns do not produce statistics from partial records.

### Planned-event itinerary

Open it in your profile's planned-event section to group events by date and start time. Filter dates, view venues, doors-open and end times, gaps and overlap cues, or return to the list.

This itinerary uses **only your own plans currently listed on the profile**. Search results and followed-performer event suggestions are excluded. Its scope differs from the calendar backed by complete records.

## Data and limitations

- Settings and the followed-performer cache use browser `localStorage`. Complete journal records stay only in the current page's memory and must be loaded again after a refresh. Pagination requests go to Eventernote itself.
- Recaps and countdowns separate past dates from future dates using **Japan time**. Events today are not checked for completion. Registration does not establish actual attendance.
- Profile counters default to the site's totals; through-today counts and countdowns use deduplicated historical events, so totals may differ. Predictions assume all future plans are attended and do not represent milestones already achieved.
- Gaps **exclude travel time**. Unknown times, overnight events, and end times not updated by the site need manual confirmation.
- Site markup changes may affect functionality. There is no dedicated mobile layout.

## Development

```text
src/eventernote-power-list.user.js  # Eventernote EX
README.md                         # Chinese documentation (default)
README.en.md                      # English
README.ja.md                      # Japanese
```

Supported pages: `https://www.eventernote.com/*`.

```sh
npm run check
```

This command checks the EX userscript's JavaScript syntax. No build step is required.

Historical filenames, userscript namespaces, and storage keys remain stable for existing installations and preferences. These README translations do not change the script's interface language.

## License

[MIT](LICENSE)
