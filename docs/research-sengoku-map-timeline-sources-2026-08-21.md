# Research Note: National Map and Timeline Boundaries

> **Purpose:** This note records the external references reviewed for the national-map and historical-timeline work. It is a research trail, not content copied into the game. The game must keep its own original UI, prose, geographic visual treatment, and data records.

## Reference findings

The reviewed **Sengoku Shogun Map** year view places a selected year on a national map and lets readers distinguish base-map, territory, battle, and event layers. Its 1570 page groups material by year and seasonal or monthly timing, then associates a summary with places and named parties. This supports an original Dust & Fire interaction pattern: a zoomed-out **National Context** view may show broad campaign context, while the current province view remains the playable map. It does **not** license copying the reference’s map artwork, territorial polygons, labels, dataset, or exact descriptive text.[1]

The site’s event index describes non-battle historical events and explicitly preserves a Japanese calendar date when a source date cannot be converted. Its battle index distinguishes battle records and warns that displayed dates follow the Western calendar, Julian before 1582. Dust & Fire’s future timeline record must therefore retain `datePrecision`, `calendarConvention`, source metadata, and a Historical Fence rather than silently inventing an exact seasonal date for every record.[2] [3]

For the campaign’s present period, the 1570 year view lists the retreat at Kanegasaki, the Battle of Anegawa, the beginning of the Ishiyama conflict, and the Noda–Fukushima fighting as separate records with different locations and timing. These examples establish a data-model requirement only: one historical year can contain multiple events whose player-facing relevance varies by campaign region. They do not turn every event into a mandatory quest or claim the campaign fiction caused the event.[1]

The 1569 year view identifies the Honkoku-ji Incident as its annual context and lists construction of a Nijō palace for Ashikaga Yoshiaki with an unknown month. The future timeline therefore needs a `precision` field: it may render a record as `year`, `season`, `month`, or `exact-date` rather than manufacturing a season when the cited source does not provide one.[4]

The battle index keeps battles separate from general events and supplies a date, location, short context, and named sides where available. Dust & Fire will preserve the separation with a `kind: "battle" | "event"` field; it will never use a historical record to decide a player’s roll total, mission result, or fictional NPC behavior automatically.[3]

## Product boundaries derived from research

| Surface | May do | Must not do |
|---|---|---|
| National Context Map | Display an original, schematic Japan silhouette; mark the campaign region and fact-card availability; toggle open/closed | Reproduce a third-party territory map, use its icons/polygons, or imply total historical coverage |
| Historical Timeline | Store cited records by year/season/date precision and show relevance to the current campaign | Make world events automatically mutate player state without a reviewed design contract |
| Narrative prose | Use `fact-supported`, `contextual-play`, `campaign-fiction`, or `insufficient-evidence` labels | Present campaign NPCs or fictional consequences as sourced history |
| Admin oversight | Show aggregate timeline coverage, source status, and content review state | Expose raw player Local Saves or private prose by default |

## References

[1] [Sengoku Shogun Map — 1570 year view](https://ufirst.jp/sengoku-map/en/1570#5.26/35.522/138.094/0/30)

[2] [Sengoku Shogun Map — Events](https://ufirst.jp/sengoku-map/en/event)

[3] [Sengoku Shogun Map — Battles](https://ufirst.jp/sengoku-map/en/battle)

[4] [Sengoku Shogun Map — 1569 year view](https://ufirst.jp/sengoku-map/en/1569)
