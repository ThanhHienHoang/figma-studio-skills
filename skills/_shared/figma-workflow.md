# Shared Figma workflow

Every skill in this folder draws its result directly in Figma through the figma-console MCP.
No HTML, JSON decks, local editors or exported code are produced unless the user asks for a file
(a PDF, MP4 or PNG exported from Figma). Read this page once per session, before the first Figma
call. `<shared>` means the `_shared` folder next to the calling skill's folder.

## 1. Load the tools (one call)

Claude Code defers MCP tools. Load the ones you need in ONE ToolSearch call, for example:
`select:mcp__figma-console__figma_get_status,mcp__figma-console__figma_list_open_files,mcp__figma-console__figma_execute,mcp__figma-console__figma_take_screenshot`
plus the skill-specific ones its SKILL.md names. No figma-console tools at all: the MCP is not
configured; tell the user and stop.

## 2. Connect to the right file

- `figma_get_status`, then `figma_list_open_files`. Work in the file the user names, else the
  active one. Nothing listed: ask the user to open Figma Desktop, open (or create) the file and run
  the Desktop Bridge plugin, then wait.
- The user asked for a new file: `open -a Figma "https://www.figma.com/file/new"` (Design) or
  `open -a Figma "https://www.figma.com/slides/new"` (Slides) on macOS, then start the Desktop
  Bridge plugin in it (Plugins > Development > Figma Desktop Bridge; ask the user if you cannot
  click menus), `figma_list_open_files`, and `figma_navigate` to its url with `lock: true`.
- Keep the target file's tab IN FRONT in Figma Desktop. Figma throttles plugins in background
  tabs: calls stall, time out, and then keep running later, so a retry draws everything twice and
  stray layers appear. With several files open, bring the target forward before drawing
  (`open -a Figma "<file url>"` on macOS). After any timeout: list what exists, remove partial
  work, then retry.
- Several connected files: `figma_navigate` with `lock: true` decides which one tools hit; tools
  that take `fileKey` can target another file without switching.
- Check the editor type once: `figma_execute` with `return figma.editorType` (`figma` = Design
  file, `slides` = Figma Slides, `figjam` = FigJam). Each skill says which it needs.
- Survey in ONE `figma_execute`: pages, then the current page's top-level nodes as compact
  `id|type|name|x,y|wxh` strings. Never dump whole node trees: they cost a lot of tokens.

## 3. Never break existing work

- Do not edit, move or delete anything the user made unless they asked for that change.
- New work goes in a NEW Section placed below everything on the page (`newSection` in the
  snippets), one Section per deliverable, named for it ("Deck - Q3 review"). Place its children
  from (80, 80) and finish with `fitSection(section)`, which leaves the same 80 px on the right and
  bottom. Section and page colors follow the user's Figma theme (dark grey in dark mode): give
  every artboard its own background.
- Before revising, read the current state of the nodes you will touch: the user may have edited
  them by hand since your last call. Keep node names stable so later edits can find them.

## 4. Install the snippets (once per session)

Read `<shared>/figma-snippets.js` and send the whole file as one `figma_execute` (timeout 15000).
Each file runs its own plugin instance: install the snippets in every file you draw in.
It installs `globalThis.__bf` with: `hex`, `ratio`, `fonts`, `T` (text), `stack` (auto-layout
frame), `rect`, `newSection`, `fitSection`, `colorVar`, `bindFill`, `lint`. Every later call starts
with the guard `if (!globalThis.__bf) return 'NEED_INSTALL';` and then
`const { T, stack, rect, hex } = globalThis.__bf;`. The plugin can reconnect on its own (it did
right after being started, which wiped the helpers): on `NEED_INSTALL` install again and repeat
the call. Without the guard the call dies with "cannot convert to object" before drawing.

## 5. Drawing rules

- Fewer, bigger calls: build one whole slide / artboard / component per `figma_execute` and
  return the created ids. Every call re-sends the whole context. Pass `timeout: 60000` for big
  builds.
- Absolute children: `T`, `stack` and `rect` take `abs: true` (pinned inside an auto-layout
  parent), `x`, `y` and `bottom` (distance from the parent's bottom edge).
- Fonts: check availability first (`await __bf.fonts(/^(Inter|Space Grotesk)$/)`). For
  Vietnamese copy, pick families with full Vietnamese diacritics (for example Be Vietnam Pro,
  Inter, Manrope, Montserrat, Roboto, Noto Sans/Serif) and look at a screenshot of real copy.
  A missing font: say so and pick an installed one; never fake it.
- Layout: auto-layout (`stack`) for anything that flows (cards, rows, lists, buttons, columns), so
  text wraps and sizes reflow. Absolute positioning only for backdrops, decoration and pinned
  footers (`layoutPositioning = 'ABSOLUTE'` inside an auto-layout parent).
- Text boxes get a fixed width and auto height (`T(..., { width })`). Nothing shrinks to fit: when
  content does not fit, split it.
- Colors: through Variables when the file has a system or the skill creates one (`colorVar`,
  `bindFill`); raw hex only for one-off sketches the user called throwaway. A dark (or other)
  mode for one frame: `frame.setExplicitVariableModeForCollection(collection, modeId)`; `lint`
  then checks contrast in that mode.
- Icons: an installed icon font such as Material Symbols Rounded, written as ligature text
  (`T(parent, 'bedtime', { family: 'Material Symbols Rounded', size: 24 })`); check it is
  installed with `fonts(/^Material Symbols/)`. `lint` holds icon glyphs to 3:1.
- 4 px spacing grid. Text at least 12 px on screens (24 px on slides). Touch targets at least
  44 x 44 (iOS) or 48 x 48 (Android, web).
- Images: only files the user gave or files from their project. Insert with `figma_set_image_fill`
  (base64; shrink large files first with `sips -Z 2400 <file> --out <scratch file>`). Never
  draw imagery with vectors to pass it off as a photo, never emoji as icons.
- Content: no lorem ipsum, no invented statistics, quotes, logos or customer names. Missing facts
  become bracketed placeholders like `[PRICE]` and are listed in the reply.
- No AI design tropes: purple-blue gradient washes, cards with a colored left border, emoji
  bullets, glassmorphism for its own sake.

## 6. Check, then look (at most three rounds)

1. `return await globalThis.__bf.lint('<nodeId>', { minSize })` reports text contrast below 4.5:1
   (3:1 for large text), text under `minSize`, emoji, and text wider than its clipping parent.
   It composites the text through its ancestors' fills and opacities (a Disabled state at 45%
   opacity is caught), but not sibling shapes or images behind it: those need your eye on the
   screenshot. Disabled controls are exempt from WCAG contrast; keep them legible anyway and
   mention it rather than forcing full contrast. `figma_lint_design` is a second opinion when available.
2. Fix everything it reports, then `figma_take_screenshot` of the node (scale 0.5 for big frames,
   0.25 for a whole section). Judge: alignment, spacing rhythm, hierarchy, overflow, orphan words.
3. Colors that must be told apart also differ in lightness, not hue alone; prefer blue/orange to
   red/green.

## 7. Hand back

Say in a few lines: file, page, section, the main node names and ids, what you assumed, every
placeholder left, and lint findings you chose not to fix (with why). Rationale and alternatives go
in the reply, never as text on the canvas. Offer exports (PDF, PNG, MP4) only from Figma itself.
