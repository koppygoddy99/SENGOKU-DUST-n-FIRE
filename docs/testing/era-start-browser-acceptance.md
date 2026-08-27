# Era-start browser acceptance log

## 2026-08-27 — Preview runtime check

The managed development server restarted successfully and its own captured preview showed the existing Campaign Command screen. A subsequent My Browser visit loaded the application title but returned no interactive DOM elements or extracted content, and the browser screenshot upload failed. This is **not** browser acceptance for the New Campaign flow.

Next: inspect development logs and the rendered root DOM, resolve any runtime issue, then verify era selection, permitted paths, hidden manual controls, hidden profile alternatives, opening assignment, and the first Main Thread in a browser.

## 2026-08-27 — Retry after restart

My Browser still rendered an empty root after a server restart, a cache-busting navigation, and a hard refresh. The console reports that the browser-loaded `/src/lib/game.ts` lacks `activeMainMission`, although the current development-server response contains that named export and TypeScript/tests resolve it. Browser acceptance remains blocked pending a Vite/module-resolution repair or an equivalent verified workaround.

The Home and Play Scene imports were changed to namespace imports, and the public preview proxy was verified to serve the new Home source and a game module containing the requested export. Clearing `node_modules/.vite` and restarting did not clear the My Browser error. The managed preview screenshot continues to render the existing Campaign Command screen. The discrepancy is isolated to My Browser's live-preview module loading rather than the tested source; no New Campaign interaction was performed through that browser session.

## 2026-08-27 — Browser-runner acceptance passed

The project’s headless Chromium acceptance runner completed the New Campaign flow from `?review=start`: it chose Late Unification, confirmed that an ineligible Village Scribe option was absent, selected the Sakai boat-crew path, confirmed that no editable Origin control existed, waited for the hidden profile assignment, started the campaign, and verified one opening Main Thread labelled as campaign fiction. The existing visible two-dice Play Scene flow also passed in the same run. My Browser’s separate live-preview module-cache issue is still recorded above, but it does not reproduce in a clean Chromium browser run against the local development server.
