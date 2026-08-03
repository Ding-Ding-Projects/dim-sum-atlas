# Handoff

The public app source is in `src/`, its catalog preparation and validation code is in `data/`, and the release workflow is in `.github/workflows/release.yml`.

Verification command:

```powershell
npm ci
npm run check
npm run package:windows
```

The app never commits catalog images. Runtime image files belong in the user-data cache and are fetched only from the public catalog release prefix.

The in-app changelog is driven by `src/release-info.json`, with every displayed entry linked to its exact `dim-sum-atlas` commit and release notes. The Windows workflow rewrites that manifest at build time with the current tag, SHA, date, and release URL so packaged notes cannot point at an invented or unrelated commit. The Yue language mode keeps the same fresh 10% non-blocking dim-sum surprise as the other modes.

Gallery Export exports the selected records when a selection exists, or the entire current filtered view when no selection exists. Release notes use the public catalog's `Classic Har Gow · 蝦餃` code name and link its published photo asset without copying that asset into this repository.
