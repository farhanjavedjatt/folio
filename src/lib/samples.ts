// Seed documents shown on first load. They double as a feature tour and a
// rendering test surface (tables, math, mermaid, code, task lists, footnotes…).

export interface SampleDoc {
  name: string;
  content: string;
  pinned?: boolean;
}

const WELCOME = `---
title: Welcome to Folio
author: MD Formatter
tags: [guide, getting-started]
---

# Welcome to Folio

**Folio** is a reading room for your markdown — paste a file, watch it set like a
printed page, and open as many documents side by side as you like.

> "One color reads, one color sets type." Everything structural is ink-blue;
> clay shows up only when you're editing.

## Getting started

1. Press <kbd>N</kbd> or click **New** to create a document.
2. **Paste** markdown, **drag in** \`.md\` files, or use the upload button.
3. Hit <kbd>⌘K</kbd> to search documents and run commands.
4. Use the layout switcher (top-right) to read **two or three** documents at once.

- [x] Render GitHub-flavored markdown
- [x] View multiple files in a tiling workspace
- [x] Edit with a live preview
- [ ] Read the rest of this tour 😄

## Everything renders

### Tables

| Feature        | Status | Notes                          |
| -------------- | :----: | ------------------------------ |
| GFM tables     |   ✅   | with alignment                 |
| Task lists     |   ✅   | interactive-looking checkboxes |
| Syntax themes  |   ✅   | adapt to light & dark          |

### Code, with copy buttons

\`\`\`typescript
function greet(name: string): string {
  // Inline \`code\` is styled too.
  return \`Hello, \${name}! Welcome to Folio.\`;
}
\`\`\`

\`\`\`python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
\`\`\`

### Math

Inline math like $e^{i\\pi} + 1 = 0$ renders with KaTeX, and so do blocks:

$$
\\int_{0}^{\\infty} e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}
$$

### Diagrams

\`\`\`mermaid
flowchart LR
  A[Paste markdown] --> B[Render as a page]
  B --> C{View how many?}
  C -->|One| D[Focus mode]
  C -->|Several| E[Tiling panes]
\`\`\`

### The little things

Footnotes[^1], ~~strikethrough~~, autolinks like https://nextjs.org, and
emoji shortcodes such as :rocket: :sparkles: :books:.

> [!NOTE]
> Blockquotes hang their punctuation into the margin, the way a fine press would.

---

Made for reading. Open the **Markdown Cheatsheet** next to this file to compare
source and output side by side.

[^1]: Footnotes collect themselves at the bottom of the document.
`;

const CHEATSHEET = `# Markdown Cheatsheet

A compact reference. Open it in **split view** (the ⌘ / icon in a pane header) to
see the source and the result together.

## Headings

\`\`\`markdown
# H1
## H2
### H3
\`\`\`

## Emphasis

- \`*italic*\` → *italic*
- \`**bold**\` → **bold**
- \`***bold italic***\` → ***bold italic***
- \`~~strike~~\` → ~~strike~~

## Lists

\`\`\`markdown
- unordered
  - nested
1. ordered
2. items
- [ ] todo
- [x] done
\`\`\`

## Links & images

\`\`\`markdown
[label](https://example.com)
![alt text](/folio-mark.svg)
\`\`\`

## Code

Use fenced blocks with a language for highlighting:

\`\`\`json
{
  "name": "folio",
  "multiPane": true,
  "themes": ["light", "dark"]
}
\`\`\`

## Tables

\`\`\`markdown
| Left | Center | Right |
| :--- | :----: | ----: |
| a    |   b    |     c |
\`\`\`

## Blockquotes & callouts

\`\`\`markdown
> A normal quote.
> [!NOTE]
> A note callout.
\`\`\`

## Math

\`\`\`markdown
Inline: $a^2 + b^2 = c^2$
Block:  $$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$
\`\`\`

## Horizontal rule

\`\`\`markdown
---
\`\`\`
`;

const README = `---
title: Acme CLI
version: 2.3.0
license: MIT
---

# Acme CLI

A fast, friendly command-line tool. *(This is a sample README to show how a real
project doc reads in Folio.)*

\`npm i -g @acme/cli\` · MIT · v2.3.0

## Features

- ⚡ **Fast** — sub-100ms cold start
- 🧩 **Composable** — pipe commands together
- 🛠️ **Configurable** — sensible defaults, full overrides

## Install

\`\`\`bash
npm install -g @acme/cli
acme --version
\`\`\`

## Usage

\`\`\`bash
# Initialize a project
acme init my-app

# Build for production
acme build --minify --target=es2022
\`\`\`

## Configuration

| Key          | Type      | Default     | Description                |
| ------------ | --------- | ----------- | -------------------------- |
| \`outDir\`     | \`string\`  | \`"dist"\`    | Output directory           |
| \`minify\`     | \`boolean\` | \`false\`     | Minify the output bundle   |
| \`target\`     | \`string\`  | \`"es2020"\`  | Compilation target         |

## Contributing

1. Fork the repo
2. Create a feature branch
3. Open a pull request

> Please run \`acme test\` before submitting. All checks must pass.

## License

Released under the **MIT** license.
`;

export const SAMPLE_DOCS: SampleDoc[] = [
  { name: "Welcome to Folio.md", content: WELCOME, pinned: true },
  { name: "Markdown Cheatsheet.md", content: CHEATSHEET },
  { name: "Sample README.md", content: README },
];
