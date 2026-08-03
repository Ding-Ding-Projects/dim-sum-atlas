# Dim Sum Atlas

Dim Sum Atlas is a Material 3 Windows desktop atlas for the public `Ding-Ding-Projects/dim-sum-photos` catalog. It keeps bilingual names and factual metadata intact, labels its deterministic fictional lore, and caches approved published images in application data rather than tracking copies.

## Quick start

```powershell
npm ci
npm start
```

Run `npm run check` for syntax and catalog validation. Run `npm run package:windows` to create a portable Windows package.

## Surface index

- [Landing page](https://ding-ding-projects.github.io/dim-sum-atlas/)
- [Public catalog source](https://github.com/Ding-Ding-Projects/dim-sum-photos)
- [Roadmap](ROADMAP.md)
- [Handoff](HANDOFF.md)
- [Release manifest contract](docs/release-manifest.md)

<details><summary>Data and privacy contract</summary>

Dish metadata comes from the public catalog. Images resolve only from its published `catalog-v1*` release assets. The app never generates, scrapes, vendors, or commits replacement photos. Offline cache data belongs to the user-data directory.

</details>
