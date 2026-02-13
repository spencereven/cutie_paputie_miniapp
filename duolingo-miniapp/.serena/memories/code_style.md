# Code Style & Conventions

## General
- Native Mini Program project (WXML/WXSS/JS), no framework.
- Use camelCase naming for JS data and handlers.
- Keep WXML templates clean and reuse styles; avoid hard-coded colors/sizes when possible.

## Styling
- Global theme tokens live in `app.wxss` (colors, spacing, radius).
- Prefer consistent spacing and rounded corners (iOS-style).
- Use responsive layout techniques and avoid excessive nesting.

## Files
- Each page has `*.wxml`, `*.js`, `*.wxss`, and sometimes `*.json` for page config.
- Components follow the same pattern in `components/`.
