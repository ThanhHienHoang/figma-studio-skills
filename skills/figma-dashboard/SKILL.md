---
name: figma-dashboard
description: Turn real data (CSV, TSV, JSON, a spreadsheet export or a query result) into a dashboard drawn directly in Figma through the figma-console MCP - KPI tiles, charts drawn as vectors, tables, and a Sources panel that traces every number to its rows. Use when the user asks for a dashboard, report page, KPI board, analytics overview or charts of their data in Figma, or names figma-dashboard. Not for a live web dashboard in code, and not for a mock dashboard with invented numbers (use figma-canvas and say the numbers are placeholders).
---

# Figma dashboard

The deliverable is a dashboard frame in Figma whose every number comes from the user's data.
Figma holds a snapshot, not a live page: say so when it matters. Before the first Figma call read
`../_shared/figma-workflow.md` and install `../_shared/figma-snippets.js`. If a `dataviz`
skill is available, load it before choosing chart forms or colors; its rules on form, color and
marks apply here.

## 1. Data first, computed outside Figma

- Find the data: the file the user gave, or data they named and you can reach with your own tools.
  Use only tables and columns that exist there. Do not read personal fields (names, addresses,
  health, anything identifying a person) the user did not ask for.
- Explore it before designing: row count, date range, gaps, units, obvious outliers. Let what you
  learn shape the page (what is the headline, what changes over time, what compares).
- Write one script in the scratchpad (Python run with `-I`, or Node) that reads the files and
  prints ONE JSON with exactly what will be drawn: each KPI (value, comparison, unit), each chart's
  series already scaled to pixel coordinates for its plot box, each table's rows, and for every
  number a `source` entry (file, filter, column, aggregation). Figma code only draws; it never
  computes.
- Never invent or smooth data. A metric the data cannot support: leave it out and say why.

## 2. Layout

- Frame 1440 wide, height grows; a vertical auto-layout with 32 px padding and 24 px gaps.
- Top: title, the period covered, "Data as of <date>", and the source files in one muted line.
- Then a row of three to five KPI tiles (label, big number, change vs the previous period with its
  sign spelled out, not only colored), then charts, then tables, then the Sources panel.
- Order by the questions a reader asks: how are we doing, what changed, why, details.
- Numbers, dates and labels in the user's language and format. Vietnamese: `1.234.567`, decimals
  with a comma, dates `08/11/2026`, large values as `1,2 tr` / `3,4 tỷ` only when the unit is
  stated once in the label.

## 3. Drawing charts in Figma

- Each chart is a `stack` card: title (says what to read, for example "Revenue grew 12% in Q3"),
  the plot frame (a plain `figma.createFrame()` of the plot box size, NO auto-layout, so children
  keep the script's x / y), and a direct label or a small legend. Axis and value labels go in the
  plot with `T(plot, text, { x, y })`; center a label under a bar after it is sized
  (`t.x = bar.x + (bar.width - t.width) / 2`).
- Bars: `rect` per value at the script's coordinates, 2 to 4 px radius on the data end only when it
  helps; zero baseline always.
- Lines: one vector per series, appended to the plot, then
  `vectorPaths = [{ windingRule: 'NONE', data: 'M x y L x y ...' }]` in the plot's own coordinates
  (Figma re-bases the vector to its bounding box and keeps it in place), `fills = []`, stroke 2 px,
  round joins and caps; mark the last point with a small ellipse and label it.
- Axes and grid: hairlines (1 px) in a muted token, few ticks, labels at least 12 px. Direct labels
  beat legends.
- Colors from the dataviz palette when available (else the file's system), bound to Variables; series that must be
  told apart differ in lightness; highlight one series, grey the rest when there are many.
- Name every node that carries data with a key (`kpi/revenue/value`, `chart/revenue/series/2025`),
  so a refresh can find and update it.

## 4. Sources panel

A frame at the bottom, `Sources`: one row per number or chart: what it shows, file, filter,
column, aggregation, row count. Readers must be able to recompute any number from it.

## 5. Check and hand back

1. Cross-check: the script asserts totals (sum of parts equals the whole, period counts) before
   printing; fix any mismatch before drawing.
2. `__bf.lint(frameId)` then a screenshot at 0.5; check overlaps of labels, clipped numbers,
   contrast. At most three rounds.
3. Hand back: the frame name and id, what it shows, assumptions, where each file's data came from,
   and that a refresh means re-running the script (keep its path in the reply) and updating the
   named nodes.

## Refreshing

Given newer data: re-run the script, then in one `figma_execute` update text and geometry of the
nodes by their data keys; change "Data as of". Do not rebuild the layout unless the shape of the
data changed.
