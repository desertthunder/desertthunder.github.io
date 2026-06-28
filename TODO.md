# Start Page TODO

## Spec

Build a local-first start page for links, feeds, saved knowledge, and lightweight date
context.

We stay focused on the personal web:

- Where do I go?
- What should I check?
- What have I saved or curated elsewhere?
- What day, week, or month context am I in?

This should not become a generic productivity dashboard.

### Packaging

- Web version: hosted static site for demos and users who manually set a homepage.
- PWA: installable app icon and offline shell with no store dependency.
- Browser extension: primary package, replacing the browser new tab page.
- Portable config: import/export settings as JSON so users can move between browsers
  without accounts.

### Core features

- Reordering: users can reorder links within a group and reorder groups.
- RSS: users can add feeds and read normalized feed items from the start page.
- Bookmarks: local bookmarks remain fast and offline, with optional
  Semble + ATProtocol integration as an external saved-knowledge source.
- Calendar utility: show useful date context without becoming a planning or
  event-tracking tool.

RSS should use an npm library for parsing instead of custom feed parsing.

Fetching is the hard part: many feeds will fail from a static web/PWA build because
of CORS.

The browser extension can provide better feed support with host permissions.

A feed proxy can come later if the web/PWA version needs broader feed compatibility.

Semble + ATProtocol should start as an optional source, not a replacement for local bookmarks:

- Local bookmarks stay canonical for the start page.
- Semble collections can be imported or mirrored into local groups.
- Later, authenticated save/sync can write Cards back to Semble/ATProtocol.
- The browser extension can eventually add "save current tab" flows for local bookmarks
  and Semble.

The calendar should stay utility-only:

- Month grid with today highlighted.
- Week number.
- Day of year and days left in the year.
- Relative date lookup.
- Optional local holidays if it can be done without account integration or heavy
  dependencies.

## Tasks

1. Reordering
   - [ ] Add stable IDs or another simple ordering mechanism for link groups and links.
   - [ ] Support reordering links within a group.
   - [ ] Support reordering groups.
   - [ ] Persist order in the existing local settings object.
   - [ ] Add focused state tests for migration and persistence.

2. Portable config
   - [ ] Add JSON export for current settings.
   - [ ] Add JSON import with validation and migration.
   - [ ] Preserve existing settings if import fails.
   - [ ] Add tests for valid import, invalid import, and old config migration.

3. Browser extension package
   - [ ] Add a minimal WebExtension manifest that overrides the new tab page.
   - [ ] Reuse the existing built app as the extension page.
   - [ ] Keep permissions minimal at first.
   - [ ] Document local extension loading for Chrome/Chromium and Firefox.

4. PWA package
   - [ ] Add a web app manifest.
   - [ ] Add app icons.
   - [ ] Add an offline shell with a service worker.
   - [ ] Verify the hosted build still works as a plain static site.

5. RSS
   - [ ] Pick a small installed npm RSS/Atom parser.
   - [ ] Define a normalized feed item shape.
   - [ ] Add local feed list storage.
   - [ ] Render a compact feed section on the start page.
   - [ ] Add refresh/error/loading states.
   - [ ] Handle CORS limitations explicitly in the web/PWA build.
   - [ ] Add extension-backed feed fetching after the extension shell exists.

6. Calendar utility
   - Avoid event creation, reminders, scheduling, or account integrations.
   - [ ] Add a compact calendar view.
   - [ ] Highlight today.
   - [ ] Show week number, day of year, and days left in the year.
   - [ ] Add relative date lookup if it stays small.

7. Semble + ATProtocol bookmarks
   - Review Semble's current data model and ATProtocol integration points before implementation.
   - [ ] Define how Semble Collections map to local bookmark groups.
   - [ ] Add read/import support first.
   - [ ] Add manual refresh.
   - [ ] Keep local bookmarks usable offline.
   - [ ] Add authenticated save/sync only after read/import is working.
