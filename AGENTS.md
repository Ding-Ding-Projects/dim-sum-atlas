# Dim Sum Atlas contributor guidance

This public repository contains the Material 3 desktop atlas only. It reads dish metadata from the public `Ding-Ding-Projects/dim-sum-photos` catalog and resolves photos from its published `catalog-v1*` release assets.

Keep the app offline-friendly after its first successful catalog read. Never generate, scrape, download-and-commit, or vendor replacement dish photos. Mark fictional lore as fictional, preserve bilingual names exactly, and do not put credentials or private infrastructure details in source, issues, releases, or logs.

Every user-facing change needs a real runtime check, keyboard and screen-reader coverage, narrow-width validation, updated documentation, and a bilingual commit message in English and playful Hong Kong-style Cantonese. Use `npm run check` before committing.
