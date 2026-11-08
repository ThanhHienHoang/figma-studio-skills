---
name: figma-canvas
description: Design mockups, landing pages, posters, wireframes and clickable prototypes as artboards side by side on a Figma canvas through the figma-console MCP, with variations and tweakable options. Use when the user asks to design, mock up, explore options, wireframe or prototype something in Figma that is not tied to a code project's screen spec, or names figma-canvas. Not for slide decks (figma-slides), design systems (figma-design-system), dashboards of real data (figma-dashboard), or screens of a code project that has its own dedicated screen-design skill.
---

# Figma canvas

The deliverable is artboards in Figma: frames placed side by side in one Section, optionally
wired as a prototype. No HTML or component code. Before the first Figma call read
`../_shared/figma-workflow.md` and install `../_shared/figma-snippets.js`. Extra tools for the
same ToolSearch call: `figma_get_variables`, `figma_get_text_styles`, `figma_search_components`,
`figma_instantiate_component`, `figma_set_image_fill`.

## 1. Brief

- What is it, for whom, on which surface (desktop web, phone, tablet, print, social). Ask one round
  of at most three questions only for what the request leaves open; "just make it" means decide
  and say your picks in one line.
- Design system first: the file's Variables, text styles and components (`figma_search_components`).
  Use them when present. None: make a small one for this canvas (a ground color, text and muted
  text, one or two accents of similar strength, a type pair from the subject; neutral briefs in
  Latin script: Space Grotesk headings, Inter body) as a Variables collection `Canvas`.
- Real content only. Missing facts become `[YOUR PRICE]` style placeholders, listed in the reply.

## 2. Artboard sizes

Desktop 1440 wide (height grows with content), tablet 834 x 1194, phone 390 x 844, Android
360 x 800, A4 poster 2480 x 3508 (300 dpi) or 595 x 842 (pt), square social 1080 x 1080,
story 1080 x 1920. Long pages: fixed width, height grows; never clip content to a guessed height.

## 3. Layout on the canvas

- One Section per request (`newSection`), named for it. Artboards in a row, 160 px apart, each
  with a short name: `A - Hero bold`, `B - Hero calm`, `Mobile - Signup`.
- Asked for options: two or three artboards that differ in one clear idea each (layout, tone or
  emphasis), not three tints of the same thing. Say the difference in the reply, not on the canvas.
- Tweaks the user may want to flip (accent color, density, dark mode, copy length) become
  Variables modes (`Light` / `Dark`, `Compact` / `Comfortable`) or component properties, never
  extra widgets drawn on the artboard.

## 4. Building an artboard

- One `figma_execute` per artboard. The artboard is a vertical auto-layout frame; every block
  (nav, hero, feature row, card, form, footer) is a `stack`, text with fixed width or `fillW`.
- Repeated parts (cards, list rows, buttons, inputs) are components with instances; variants for
  states (default, hover, pressed, disabled, error) when the prototype needs them.
- Accessible as drawn: name layers by role (`button/Primary`, `link/Pricing`, `input/Email`,
  `label/Email`); every input has a visible label; icon-only buttons get a layer name that says
  what they do; touch targets 44 px or more; text at least 12 px on screens, 9 pt in print.
- Contrast 4.5:1 for text, 3:1 for large text (24 px and up), control borders, focus rings and
  icons. A pair at 4.3:1 still fails: pick shades that pass.
- No fake status bars or device chrome unless the user asks for a device frame. Recreating a real
  product: only from its real source (screenshots, files); never copy another company's
  proprietary design as your own.

## 5. Prototype (when asked, or when the brief is a flow)

Wire reactions inside `figma_execute`:

```js
const a = await figma.getNodeByIdAsync(btnId);
await a.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE',
  destinationId: nextFrameId, navigation: 'NAVIGATE',
  transition: { type: 'SMART_ANIMATE', easing: { type: 'EASE_OUT' }, duration: 0.3 } }] }]);
figma.currentPage.flowStartingPoints = [{ nodeId: firstFrameId, name: 'Main flow' }];
```

Keep flows short (the happy path plus the one error state that matters). Hover and press states
use component variants with `ON_HOVER` / `ON_PRESS` and `CHANGE_TO`.

## 6. Check and hand back

Lint each artboard (`__bf.lint`), fix, screenshot at scale 0.5 (whole Section at 0.25 when there
are several). At most three rounds. Hand back the Section and artboard names with ids, what each
option tries, the tweak modes, placeholders, and how to play the prototype (Present from the flow).
