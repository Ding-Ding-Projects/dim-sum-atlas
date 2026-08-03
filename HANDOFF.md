# Handoff

The public app source is in `src/`, its catalog preparation and validation code is in `data/`, and the release workflow is in `.github/workflows/release.yml`.

Verification command:

```powershell
npm ci
npm run check
npm run package:windows
```

The app never commits catalog images. Runtime image files belong in the user-data cache and are fetched only from the public catalog release prefix.
