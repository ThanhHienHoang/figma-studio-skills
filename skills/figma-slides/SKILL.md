---
name: figma-slides
description: Make or revise a slide deck drawn directly in Figma through the figma-console MCP, either as real slides in a Figma Slides file or as 1920 x 1080 frames in a Figma Design file. Use when the user asks for slides, a deck, a pitch, a lesson or a presentation in Figma, or names figma-slides. Not for PowerPoint, PDF or HTML decks generated in code, and not for app screens or mockups (use figma-canvas).
---

# Figma slides

The deliverable is slides inside Figma. Do not write HTML, JSON or deck files on disk.
Before the first Figma call read `../_shared/figma-workflow.md` (the `_shared` folder next to this
skill's folder) and install `../_shared/figma-snippets.js`. Extra tools to load in the same
ToolSearch call: `figma_list_slides`, `figma_create_slide`, `figma_set_slide_background`,
`figma_set_slide_transition`, `figma_reorder_slides`, `figma_get_slide_content`.

## 1. Where the deck lives

Check `figma.editorType`:

- `slides` (a Figma Slides file): real slides. `figma_list_slides` shows what exists. Create a slide
  with `figma_create_slide` (row/col in the grid) or `figma.createSlide()` inside `figma_execute`,
  then build its whole content in ONE `figma_execute`. Background: the slide's `fills` or
  `figma_set_slide_background`; transitions with `figma_set_slide_transition` (DISSOLVE or
  SMART_ANIMATE for most decks; one style per deck); order with `figma_reorder_slides`.
  - NEVER set `layoutMode` on a SLIDE node: it shrinks to hug its content and slides cannot be
    resized back (`Cannot resize slide nodes`); the slide is then lost. Put ONE auto-layout frame
    inside instead: `stack(slide, { name: 'body', w: 1920, h: 1080, pad: [128, 128, 160, 128],
    gap: 48, x: 0, y: 0 })`, and build the content in `body`.
  - Figma Slides numbers slides itself ("1", "2"...) and overwrites names you set: identify slides
    by id and by the `body` frame's content, not by slide name.
- `figma` (a Design file): a Section "Deck - <title>" from `newSection`; each slide is a frame
  1920 x 1080 named `01 Cover`, `02 Problem`... laid out five per row with a 160 px gap.
- No file open: ask the user to open a Slides file (or any Design file) and run the Desktop
  Bridge plugin.

Speaker notes: give them in the reply unless the user wants them in Figma; do not assume the
plugin API reaches the notes panel, test once if asked.

## 2. Brief (one round, only what the request leaves open)

Ask at most three questions in one AskUserQuestion: audience and goal, length (number of slides),
and the look (the file's own system, or a new direction), plus the copy language if unclear.
Skip questions the request already answers, or when the user says "just make it".

Design system first, before any color or font: `figma_get_variables` and `figma_get_text_styles`
on the file. Found one: offer to use it. Then decide once and say it in one line: the outline (one
sentence per section), length, audience, the layouts you will repeat. No source material: write
concrete draft copy, with `[placeholders]` for figures and names the user did not give, listed in
the reply. Never invent a statistic or a quote.

## 3. The look (once per deck)

- Colors (when there is no system): one dark, one light, one or two accents; toned whites and
  blacks rather than pure #FFFFFF / #000000; two background tones and an accent slide for big
  statements. Save them as a Variables collection `Deck` (`color/bg`, `color/bg-alt`,
  `color/text`, `color/muted`, `color/accent`) with `figma_setup_design_tokens`, and bind fills
  to them.
- Type: one to three families, a scale of four or five sizes (for example 120 / 72 / 44 / 32 / 24),
  nothing under 24 px. Neutral brief in Latin script: Space Grotesk headings, Inter body. Vietnamese
  copy: a family with full diacritics (see the workflow page). Emphasis by weight, italic or color,
  never by a new size. Create text styles for the scale.
- Let the brief choose the direction (a report reads calm and dense, a pitch bold and sparse); the
  direction sets layout idioms and, without a system, the palette.

## 4. Slide craft

- Canvas 1920 x 1080, margins 128 px (content area 1664 x 824). A footer (page number, source,
  logo) is one 24 px row pinned at bottom 64; nothing else below y 920.
- Content flows in a vertical auto-layout (the slide frame itself in a Design file, the `body`
  frame inside a Slides slide) with padding 128; backdrops and the footer are absolute children
  (`T(body, '2 / 12', { size: 24, width: 1664, abs: true, x: 128, bottom: 64 })`).
- One idea per slide. A statement beats bullets; turn lists into tables, rows of cards, a big
  number or a quote. Titles introduce the topic, in one grammar across the deck; no "It's not X,
  it's Y" drama.
- Slides of one kind share structure: the title sits at the same place on every slide, never
  centered with the body on one and top-left on the next. Fill about 70% of the column, or
  distribute with SPACE_BETWEEN.
- Too much content: split the slide. Nothing shrinks below the type scale.
- Contrast: text 4.5:1 on its background (3:1 at 44 px and up). Colors that must be told apart
  differ in lightness too; blue/orange rather than red/green.
- Images: only the user's files. Photos fill the box (crop); screenshots and diagrams fit inside a
  contrasting panel.
- Diagrams: Figma shapes and auto-layout boxes, connectors as lines with arrow caps; charts follow
  the `dataviz` skill when one is available (load it first).

## 5. Build order

1. Variables and text styles in one call.
2. The cover and one content slide; lint both (`__bf.lint(id, { minSize: 24, largeAt: 44 })`) and
   screenshot at scale 0.5. Fix until clean. This sets the pattern.
3. The remaining slides in order, one `figma_execute` per slide (two or three small slides per call
   is fine). Reuse the pattern's structure; for repeated parts make a component and instances.
4. Lint every slide, then one screenshot of the whole deck (Section at scale 0.25, or each slide at
   0.25 in a Slides file). Fix, at most three rounds.

## 6. Revising

Read the slides you will change first (`figma_get_slide_content` or a compact dump): the user may
have edited them by hand. Change only the slides named, keep names stable. Adding a slide: copy the
structure of a slide of the same kind (`figma_duplicate_slide` in Slides files, `clone()` of the
frame in Design files) and replace its content.

## 7. Hand back

File, page or Section, slide names and ids, the assumptions, the placeholder list, and any lint
finding left on purpose. Presenting and exporting (PDF and others) is done from Figma's own menus.
