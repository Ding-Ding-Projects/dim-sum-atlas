# Roadmap

## Shipped in 0.1.0

- Material 3 frameless Windows desktop shell.
- Public catalog and published-image resolver with offline cache.
- Gallery, detail view, favorites, local history, changelog, settings, regex builder, command palette, notifications, tab strip, bulk selection, exports, and archive operations.
- Fictional lore is labelled and deterministic from the public catalog record id.
- Release-aware in-app changelog with exact commit links, build-time release manifest, and a language-correct 10% surprise in all modes.

## Next

- Add a dedicated visual regression suite for 100%, 125%, 150%, and 200% display scaling.
- Add native screen-reader automation to the release gate.
- Add a runtime test that seeds each language mode and proves the startup surprise remains non-blocking and correctly named.
- [x] Resolve each future release code name from the public catalog with a monotonic run-number mapping and verify its published photo asset before release.
- [x] Refresh the packaged changelog manifest through `v0.1.11`, enforce unique bilingual code names, and make Pages resolve the latest verified installer and release-body code name after the Windows release workflow succeeds.
