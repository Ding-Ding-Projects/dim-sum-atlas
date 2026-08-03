# Handoff

The public app source is in `src/`, its catalog preparation and validation code is in `data/`, and the release workflow is in `.github/workflows/release.yml`.

Verification command:

```powershell
npm ci
npm run check
npm run package:windows
```

The app never commits catalog images. Runtime image files belong in the user-data cache and are fetched only from the public catalog release prefix.

The in-app changelog is driven by `src/release-info.json`, with every displayed entry linked to its exact `dim-sum-atlas` commit and release notes. The manifest is current through verified `v0.1.8`; the Windows workflow rewrites it at build time with the current tag, SHA, date, release URL, code name, and photo URL so packaged notes cannot point at an invented or unrelated commit. The Yue language mode keeps the same fresh 10% non-blocking dim-sum surprise as the other modes.

Gallery Export exports the selected records when a selection exists, or the entire current filtered view when no selection exists. Release notes use each release's public catalog code name and link its published photo asset without copying that asset into this repository. The public landing page currently advertises the immutable `v0.1.8` installer from `4dbb4ebd0a993a46f34d7e9e3f30e907ffb41013`; the Pages workflow refreshes that deploy copy from the latest verified release after Windows CI succeeds.
## Release code-name uniqueness

- The Windows release workflow now resolves each code name from the public catalog using the monotonic GitHub Actions run number, derives the bilingual name from catalog metadata, and verifies the published photo asset responds before creating the release.
- This prevents future reuse; the prior Classic Har Gow notes remain immutable historical records.
