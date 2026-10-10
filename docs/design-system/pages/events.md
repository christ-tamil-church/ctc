# Page design: Events (`/events`)

Events is a standalone discovery page built from the shared `churchEvents` data. It combines the leader-approved homepage hero language with the event-discovery reference: a light split hero with bilingual kicker, large hospitality-led headline, and Sunday information card; then a centered “Upcoming at CTC” introduction and one spacious vertical list of horizontal image-and-copy event rows.

The page follows the CTC design template: green-led editorial typography, restrained brass labels, a bronze primary action, generous white space, warm photography, and page-scoped reveal motion. Event rows use a 16:9 image beside title, schedule, location, description, and action. At 620px the rows become intentionally stacked image-first stories, matching the reference’s mobile reading order.

The current data describes recurring schedules rather than dated calendar instances. For that reason, the page says “gatherings” and displays the supplied cadence/date language without implying chronological order. When church leadership adds exact dates, registration URLs, or event-specific alt text to the shared data model, the cards can surface them without changing the page structure.

## Featured event

One current event can be featured at a time: a quiet notice line under "I'm New" in the homepage hero links to a cream band at the top of this page (`/events#featured`) that shows the whole flyer.

**Changing it each week** (all names are generic; only values change):

1. `powershell -ExecutionPolicy Bypass -File scripts/featured-flyer.ps1 "path\to\flyer.jpg"` writes the flyer into its fixed slot (`src/assets/images/featured-event-flyer.jpg`, an 800px copy for phones, and its pixel size).
2. Edit `featuredEvent` in `src/data/site.ts`: title, `startsOn`/`endsOn` (YYYY-MM-DD, Chicago dates), time, location, summary, and `flyerAlt` (what the flyer says, for screen readers).
3. No event this week: set `featuredEvent = null`. The hero and this page then look exactly as they do without the feature.

**Rules**

- The flyer is never cropped. Wide banners (3:1 and similar) span the band with the details below; portrait or square flyers sit beside the details.
- The flyer's text is unreadable on phones, so every fact (date, time, place, summary) is repeated as real text, and the flyer links to its full-size file.
- `flyer: null` shows a lettered poster (deep green, date block, Fraunces title) in the flyer's place; it is `aria-hidden` because the same facts follow as text.
- Homepage placement: on tablets and desktops the event is a small sibling card of "This Sunday" under "I'm New" (warm white, hairline, a "Featured Event · date" label, Fraunces title, bronze arrow). On phones (≤620px) it moves inside the "This Sunday" card as a second row under a hairline: a sage calendar leaf (month over a Fraunces day), the title and a bronze arrow, with no label, so the phone hero carries one card instead of two. Neither is ever a bronze button: "I'm New" stays the one primary CTA. On short phones (≤700px tall, e.g. iPhone SE) the card condenses to two slim lines: "This Sunday 10:30 AM" with a map-pin directions button (as on the floating Sunday bar), then a one-line "OCT 11" chip and title. Below 600px tall (Safari toolbars showing) the hero spacing tightens a little more.
- Expiry: an event disappears the day after `endsOn`. Prerendered pages judge this from the build date (`__BUILD_DATE__`), the browser re-checks the real date after load, and a daily scheduled deploy refreshes the static HTML.
