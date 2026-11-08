---
name: figma-design-system
description: Build, import or extend a design system natively in Figma through the figma-console MCP - Variables (primitives and semantic tokens with Light/Dark modes), text and effect styles, components with variants and properties, and a brand-book cover and guideline pages. Use when the user asks to create a design system, token set, style guide, UI kit or component library in Figma, to import one from a codebase or brand files, or names figma-design-system. Not for only auditing an existing system, or for designing screens (figma-canvas).
---

# Figma design system

The deliverable is a design system living in a Figma Design file: Variables, styles, components
and documentation pages. No tokens.json, CSS or bundle on disk unless the user asks for an export.
Before the first Figma call read `../_shared/figma-workflow.md` and install
`../_shared/figma-snippets.js`. Extra tools for the same ToolSearch call:
`figma_get_variables`, `figma_get_styles`, `figma_get_text_styles`, `figma_setup_design_tokens`,
`figma_batch_create_variables`, `figma_batch_update_variables`, `figma_create_component_set`,
`figma_add_component_property`, `figma_arrange_component_set`, `figma_set_description`,
`figma_search_components`, `figma_audit_design_system`, `figma_audit_component_accessibility`.

## 1. Sources and inventory (before drawing anything)

- Build FROM the brand's real sources: a codebase (CSS variables, Tailwind config, theme files,
  component folders), brand guidelines, decks, logos, font files, an existing Figma file. Read them
  and list the whole inventory first: color tokens, type styles, spacing, radii, shadows, motion,
  component families, asset groups. Keep that list; you will report what is left.
- Exact values. Code beats screenshots. Never invent a value the source has, never approximate a
  logo or icon: copy the real file in (`figma_set_image_fill` for rasters, SVG through
  `figma.createNodeFromSvg` inside `figma_execute`).
- Nothing to build from: make a SMALL first system and say so: 6 to 10 colors in one theme, 5 to 7
  text styles, 4 spacing steps, 3 radii, a one-paragraph brand note, no components yet.
- The file already holds a system: extend it. Read its collections and styles first, keep names and
  ids, add rather than replace.

## 2. Structure in the file

Pages (create only the ones missing): `Cover`, `Foundations`, `Components`, `Assets`,
`Guidelines`.

Variables:
- `Primitives` collection, one mode: color ramps (`color/blue/50` ... `color/blue/900`),
  `space/1` ... (4 px grid), `radius/sm|md|lg|full`, font sizes and weights as FLOAT/STRING.
- `Semantic` collection with modes `Light` and `Dark` (more only if the source has them):
  `bg/default`, `bg/subtle`, `text/default`, `text/muted`, `border/default`, `accent/default`,
  `accent/on`, `status/success|warning|danger`... each value an alias such as `{color.blue.600}`.
- Motion tokens when the source has them: TIMING (`duration/fast` 0.15) and EASING
  (`ease/standard` cubic-bezier) types.
- `figma_setup_design_tokens` takes at most 100 tokens and 4 modes per call: primitives first, then
  semantic in a second call so aliases resolve. Every variable gets a description that says when to
  use it (`figma_batch_update_variables` or the token's `description`). Set scopes so fills offer
  only color tokens meant for fills.

Styles: text styles for the type scale (`Display/L`, `Heading/M`, `Body/M`, `Label/S`...), effect
styles for shadows, bound to variables where Figma allows.

## 3. Components

- One component set per family, variants as properties (`Type=Primary|Secondary`,
  `Size=S|M|L`, `State=Default|Hover|Pressed|Disabled|Focus`), text and boolean and instance-swap
  properties via `figma_add_component_property`. Auto-layout inside, every fill, stroke, radius
  and gap bound to a variable, text on text styles.
- Lay each set out with `figma_arrange_component_set`; describe it with `figma_set_description`:
  first sentence says what it is for, then when not to use it and what the consumer provides.
- Accessibility per component: text 4.5:1 in EVERY mode, 3:1 for borders of controls, focus rings
  and icons; touch targets 44 px or more; a visible focus state. Run
  `figma_audit_component_accessibility` on each set.

## 4. Documentation pages

- `Foundations`: swatches drawn from the variables (name, value, usage), the type scale rendered
  with real copy (Vietnamese sample too when the product is Vietnamese), spacing and radius scales,
  shadows.
- `Guidelines`: a brand book in frames: voice and content rules with real examples, visual
  foundations, iconography, do / don't pairs. Rules name tokens, not hex.
- `Assets`: logos and icons in groups, each group with a short note on usage.
- `Cover`: a 1920 x 1080 cover frame with the system's name, version and date, made LAST, after
  everything it summarizes exists.

## 5. Check and hand back

1. `figma_audit_design_system` and the accessibility audit; fix what is real.
2. `__bf.lint` on the Foundations and Guidelines frames; screenshot each page's Section at 0.25.
3. Colors that must be told apart differ in lightness, not hue alone. A source's own failing pair
   is kept but flagged in its variable description and in the reply.
4. No AI tropes: no blue-purple gradients, emoji cards or left-border cards in the docs.

Hand back: pages, collections (with token counts), styles, component sets, what was built from
which source, what you assumed, and what remains of the inventory. Then offer once to take it
further (more components, a Dark mode, publishing it as a library from Figma's Assets panel, which
the user does themselves).
