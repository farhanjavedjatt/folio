# Folio — Design System

> A typesetter's reading room that works like a precision workspace: warm ink on
> paper, where **one color reads and one color sets type.**

MD Formatter is a markdown reading & multi-file workspace. The rendered document
is the hero; the chrome stays quiet, flat, and bookbinder-precise.

## The one rule: read / set-type color law

- **Ink-blue (`--primary`)** owns *everything structural*: navigation, links,
  the active-document marker, the focused-pane ring, and text selection.
- **Clay (`--accent`)** is rationed **exclusively** to the active edit state and
  the unsaved/dirty dot.

At a glance you can tell which pane the keyboard drives (ink-blue ring) and which
pane you are setting type in (clay tick). No other decorative color.

## Palette

| token | light | dark |
| --- | --- | --- |
| bg | `#F2EDE3` | `#19160F` |
| surface | `#FAF6EE` | `#211D16` |
| surfaceAlt | `#ECE5D7` | `#272219` |
| surfaceHover | `#E6DECC` | `#322B20` |
| border | `#DBD1BD` | `#393225` |
| borderStrong | `#C3B79E` | `#4A4231` |
| text | `#211D17` | `#ECE4D4` |
| textMuted | `#5C5446` | `#ABA08A` |
| textFaint | `#8C8472` | `#776E5C` |
| primary (ink-blue) | `#2A4C7D` | `#8FB2E0` |
| accent (clay) | `#B4612B` | `#D98B4E` |
| success | `#3E6B47` | `#7FB088` |
| warning | `#B07A1E` | `#D6A852` |
| danger | `#A23A2E` | `#D9786B` |
| codeBg | `#ECE5D7` | `#23201A` |
| selection | `#CBD9EC` | `#2E466A` |

Dark mode is **warm printer's-ink**, never slate or blue-gray.

## Type

- **Spectral** — display + body (rendered prose). Book gravity, warm on paper.
- **Inter** — UI labels and chrome.
- **JetBrains Mono** — code, metadata, and folio markers only. Never running prose.

Prose: 18px / 1.7, measure capped at ~68ch and centered in its pane. Headings in
Spectral with a hairline rule under H1. Links ink-blue with a 1px underline that
thickens on hover. Blockquotes carry a 2px ink-blue left rule.

## Form

- **Radius** — surfaces/panes/cards 6px; buttons/inputs/tabs 5px; pills/keycaps/
  search 8px; printed rules and the focus ring 0px. Hard ceiling 8px.
- **Elevation** — ink-on-paper: hairline borders + warm surface steps. Real
  shadow only on floating layers (⌘K palette, menus).
- **Focus** — 2px solid ink-blue ring at 2px offset, square corners.

## Workspace

- **Library sidebar** (264px, collapsible): the active doc gets a 2px ink-blue
  left bar; a 1-char mono badge shows which pane a doc is loaded in.
- **Tiling panes** (1–3, resizable): each carries a running-head bar with a mono
  folio marker (I / II / III). Exactly one pane is focused (Cmd+1/2/3) and wears a
  2px inset ink-blue ring. Reading measure stays ~68ch per pane.
- **Edit mode** splits a pane into a mono editor + live Spectral preview; the
  running-head tick travels from ink-blue → clay to signal "you are setting type."

## Avoid

Default AI editorial cream + Didone + terracotta; dev-tool near-black + acid
green; Tailwind indigo/violet; gradients; glassmorphism/blur/glow; emoji as
icons; pill buttons; radii > 8px; mono in running prose.

---

*This direction was synthesized from three competing explorations ("Recto",
"Graphite & Ember", "Quietundr"). Folio keeps Recto's warm fine-press world,
grafts Graphite & Ember's tiling-pane mechanics, and adopts Quietundr's "color
only where it carries meaning" discipline.*
