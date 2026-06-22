# Contributing to Folio

Thanks for your interest in improving Folio! Contributions of all sizes are welcome.

## Development setup

```bash
git clone https://github.com/<your-username>/folio.git
cd folio
npm install
npm run dev      # http://localhost:3000
```

## Before you open a PR

Run the full check suite — these all run in CI and must pass:

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run test        # Vitest unit + component tests
npm run build       # production build
```

## Guidelines

- **Match the surrounding code.** Follow the existing structure, naming, and the
  Folio design language documented in [`docs/DESIGN.md`](docs/DESIGN.md).
- **Keep components focused.** Logic lives in `src/lib` and `src/hooks`; UI in
  `src/components`. Prefer small, well-bounded units.
- **Add tests** for new pure logic (stats, parsing, store actions) and for the
  rendering pipeline when relevant.
- **Respect the color law.** Ink-blue (`--primary`) is for structure/navigation;
  clay (`--accent`) is reserved for the active edit state. Don't introduce new
  accent colors into the chrome.
- **Accessibility matters.** New interactive controls should be keyboard-operable
  and have accessible names.

## Good first issues

Look for issues tagged [`good first issue`](https://github.com/<your-username>/folio/labels/good%20first%20issue).
Some ideas if none are open: new export formats, additional remark/rehype plugins,
folder organization in the Library, or a focus/zen reading mode.

## Reporting bugs

Open an issue with steps to reproduce, what you expected, and what happened.
Screenshots and the browser/OS help a lot.
