# Dim Sum Atlas contributor guidance

This public repository contains the Material 3 desktop atlas only. It reads dish metadata from the public `Ding-Ding-Projects/dim-sum-photos` catalog and resolves photos from its published `catalog-v1*` release assets.

Keep the app offline-friendly after its first successful catalog read. Never generate, scrape, download-and-commit, or vendor replacement dish photos. Mark fictional lore as fictional, preserve bilingual names exactly, and do not put credentials or private infrastructure details in source, issues, releases, or logs.

Every user-facing change needs a real runtime check, keyboard and screen-reader coverage, narrow-width validation, updated documentation, and a bilingual commit message in English and playful Hong Kong-style Cantonese. Use `npm run check` before committing.

## Agent conversation vocabulary

Agents working in this repository use the shared private conversation vocabulary defined in
the maintainer's canonical agent instructions for every reply, including chat prose, visible
reasoning, status lines, and task or session titles. Read those instructions and apply them
in full. They are deliberately not restated here, because this file is part of this
repository's public record.

That vocabulary never appears in anything published. Keep it out of commit messages, branch
names, code, code comments, test names, documentation, this file, issues, pull requests,
discussions, release notes, published sites, logs, and every other file in this repository.
Published writing uses ordinary professional English, and exact technical identifiers always
keep their literal spelling. The single documented public-safe exception is named in those
canonical instructions; do not infer any other.

Scan any text bound for a public surface against that vocabulary before publishing it. A
reviewer cannot tell a correct release note from a leaking one by reading it, so the scan is
a step, not a habit.
