# Contributing to Coco

Coco is a Video.js v10 skin. Contributions are welcome — bug reports, design ideas, and pull requests.

## Getting started

```sh
npm install
npm run dev
```

The preview mounts the skin alone at `/`. Its settings live in the URL —
`/?width=384&ratio=9:16&dir=rtl&locale=ar` — and the stage otherwise fills
the viewport.

## Before you send a PR

- `npm run typecheck` and `npm run build` must stay clean.
- Keep `AGENTS.md` and `README.md` in sync with what the skin actually does.
- Don't commit build output (`dist/`), test media, or local tooling state.

## Ground rules

- No automated verification on the user's behalf — make the change and ask the
  maintainer to test it.
- Keep the file structure tidy: the active skin lives in `src/video/` plus
  `src/components/ui/`. Don't resurrect the removed sand/ocean/settings files
  without a reason.

## License

By contributing, you agree that your contributions will be licensed under the
MIT License (see `LICENSE`).
