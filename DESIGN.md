# Dim Sum Atlas design source of truth

## Current scan

This is a product surface for curious home cooks and dim-sum fans. The existing gallery already establishes a dark tea-house palette, jade as the action color, warm apricot for emphasis, compact editorial type, and a calm two-pane browsing layout.

## Creative north star

An evening tea table turned into a precise, searchable atlas.

## Named rules

- Surfaces stay dark and layered, never flat black.
- Jade carries interaction and focus; apricot carries food and story emphasis.
- Content stays readable at large window sizes through a centered max-width and a detail pane.
- Every action has a visible keyboard path and a non-blocking result message.
- Bilingual labels stay compact, with the factual English and Traditional Chinese dish names preserved.
- Motion is subtle by default and disappears when reduced motion is enabled.

## Tokens

The renderer owns Material 3 style tokens in `src/styles.css`. User preferences can override theme, density, seed color, font family, scale, weight, radius, and reduced motion without changing the layout contract.
