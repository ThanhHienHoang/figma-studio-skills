// Shared helpers for the figma-studio-skills. Send this whole file as ONE figma_execute call.
// It installs globalThis.__bf; later calls destructure from it. Re-run after a plugin reload.

const hex = (h) => {
  let s = String(h).replace('#', '').trim();
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s.slice(0, 6), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
};

const lum = (c) => {
  const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
};

// WCAG contrast ratio between two {r,g,b} colors (0-1 channels).
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
};

const isVar = (c) => c && typeof c === 'object' && c.resolvedType === 'COLOR';

// A solid paint from a hex string, or a paint bound to a COLOR variable.
const paint = (c, opacity) => {
  if (isVar(c)) {
    return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', c);
  }
  const p = { type: 'SOLID', color: hex(c) };
  if (opacity !== undefined) p.opacity = opacity;
  return p;
};

const pads = (p) => {
  if (typeof p === 'number') return [p, p, p, p];
  if (p.length === 2) return [p[0], p[1], p[0], p[1]];
  return p; // [top, right, bottom, left]
};

const isAuto = (n) => n && 'layoutMode' in n && n.layoutMode !== 'NONE';

// Absolute placement: o.abs pins a child of an auto-layout parent; x, y, bottom place it.
const pin = (n, parent, o) => {
  if (o.abs && isAuto(parent)) n.layoutPositioning = 'ABSOLUTE';
  if (o.x !== undefined) n.x = o.x;
  if (o.y !== undefined) n.y = o.y;
  if (o.bottom !== undefined && parent) n.y = parent.height - o.bottom - n.height;
};

// Installed font families matching a regex: { family: [styles] }.
async function fonts(re) {
  const all = await figma.listAvailableFontsAsync();
  const out = {};
  for (const f of all) {
    if (!re.test(f.fontName.family)) continue;
    (out[f.fontName.family] = out[f.fontName.family] || []).push(f.fontName.style);
  }
  return out;
}

// Text node. o: family, style, size, color (hex or variable), width, fillW, lineHeight (%),
// letterSpacing (%), align, name, textStyleId, abs (pinned inside an auto-layout parent), x, y,
// bottom (distance from the parent's bottom edge, applied after sizing).
async function T(parent, chars, o = {}) {
  const family = o.family || 'Inter';
  const style = o.style || 'Regular';
  await figma.loadFontAsync({ family, style });
  const t = figma.createText();
  t.fontName = { family, style };
  t.fontSize = o.size || 24;
  t.characters = String(chars);
  t.name = o.name || String(chars).slice(0, 40);
  t.fills = [paint(o.color || '#1A1A1A')];
  if (o.lineHeight) t.lineHeight = { value: o.lineHeight, unit: 'PERCENT' };
  if (o.letterSpacing) t.letterSpacing = { value: o.letterSpacing, unit: 'PERCENT' };
  if (o.align) t.textAlignHorizontal = o.align;
  if (parent) parent.appendChild(t);
  if (o.width) {
    t.textAutoResize = 'HEIGHT';
    t.resize(o.width, t.height);
  }
  if (o.fillW && isAuto(parent)) {
    t.textAutoResize = 'HEIGHT';
    t.layoutSizingHorizontal = 'FILL';
  }
  if (o.textStyleId) await t.setTextStyleIdAsync(o.textStyleId);
  pin(t, parent, o);
  return t;
}

// Auto-layout frame. o: dir ('V' | 'H'), gap, pad (n | [v,h] | [t,r,b,l]), fill, stroke,
// strokeW, radius, main, cross (MIN | CENTER | MAX | SPACE_BETWEEN), w, h, fillW, grow, name, clip,
// abs, x, y, bottom (see pin).
function stack(parent, o = {}) {
  const f = figma.createFrame();
  f.name = o.name || 'stack';
  f.layoutMode = o.dir === 'H' || o.dir === 'HORIZONTAL' ? 'HORIZONTAL' : 'VERTICAL';
  f.itemSpacing = o.gap === undefined ? 16 : o.gap;
  const [pt, pr, pb, pl] = pads(o.pad === undefined ? 0 : o.pad);
  f.paddingTop = pt;
  f.paddingRight = pr;
  f.paddingBottom = pb;
  f.paddingLeft = pl;
  f.fills = o.fill ? [paint(o.fill)] : [];
  if (o.stroke) {
    f.strokes = [paint(o.stroke)];
    f.strokeWeight = o.strokeW || 1;
  }
  f.cornerRadius = o.radius || 0;
  f.primaryAxisAlignItems = o.main || 'MIN';
  f.counterAxisAlignItems = o.cross || 'MIN';
  f.clipsContent = !!o.clip;
  if (parent) parent.appendChild(f);
  f.layoutSizingHorizontal = 'HUG';
  f.layoutSizingVertical = 'HUG';
  if (o.w) {
    f.resize(o.w, Math.max(f.height, 1));
    f.layoutSizingHorizontal = 'FIXED';
  }
  if (o.h) {
    f.resize(f.width, o.h);
    f.layoutSizingVertical = 'FIXED';
  }
  if (o.fillW && isAuto(parent)) f.layoutSizingHorizontal = 'FILL';
  if (o.grow && isAuto(parent)) f.layoutGrow = 1;
  pin(f, parent, o);
  return f;
}

// Plain rectangle. o: w, h, fill, radius, name, opacity, abs, x, y, bottom (see pin).
function rect(parent, o = {}) {
  const r = figma.createRectangle();
  r.name = o.name || 'rect';
  r.resize(o.w || 100, o.h || 100);
  r.fills = o.fill ? [paint(o.fill, o.opacity)] : [];
  r.cornerRadius = o.radius || 0;
  if (parent) parent.appendChild(r);
  pin(r, parent, o);
  return r;
}

// A new Section below everything on the current page.
function newSection(name, w = 2000, h = 1200) {
  const page = figma.currentPage;
  let bottom = 0;
  for (const n of page.children) bottom = Math.max(bottom, n.y + n.height);
  const s = figma.createSection();
  s.name = name;
  s.x = 0;
  s.y = page.children.length > 1 ? bottom + 400 : 0;
  s.resizeWithoutConstraints(w, h);
  return s;
}

// Resize a Section to wrap its children. Place children from (80, 80) so the margins match.
function fitSection(s, pad = 80) {
  let w = 0;
  let h = 0;
  for (const c of s.children) {
    w = Math.max(w, c.x + c.width);
    h = Math.max(h, c.y + c.height);
  }
  s.resizeWithoutConstraints(w + pad, h + pad);
  return s;
}

// Find a local COLOR variable by exact name (optionally inside one collection).
async function colorVar(name, collectionName) {
  const vars = await figma.variables.getLocalVariablesAsync('COLOR');
  let cols = null;
  if (collectionName) {
    cols = (await figma.variables.getLocalVariableCollectionsAsync())
      .filter((c) => c.name === collectionName)
      .map((c) => c.id);
  }
  return vars.find((v) => v.name === name && (!cols || cols.includes(v.variableCollectionId))) || null;
}

function bindFill(node, variable) {
  node.fills = [paint(variable)];
  return node;
}

// Resolve a paint color. A bound variable resolves in the mode the node actually uses (a frame
// set to Dark resolves Dark values); without a node, the collection's default mode.
async function solidColor(p, node) {
  if (!p || p.type !== 'SOLID' || p.visible === false) return null;
  const bound = p.boundVariables && p.boundVariables.color;
  if (bound) {
    const v = await figma.variables.getVariableByIdAsync(bound.id);
    if (v && node) {
      const res = v.resolveForConsumer(node);
      if (res && res.value && typeof res.value === 'object' && 'r' in res.value) return res.value;
    }
    if (v) {
      const col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
      let val = v.valuesByMode[col.defaultModeId];
      while (val && val.type === 'VARIABLE_ALIAS') {
        const a = await figma.variables.getVariableByIdAsync(val.id);
        const ac = await figma.variables.getVariableCollectionByIdAsync(a.variableCollectionId);
        val = a.valuesByMode[ac.defaultModeId];
      }
      if (val && 'r' in val) return val;
    }
  }
  return p.color;
}

const topSolid = (n) => {
  if (!('fills' in n) || !Array.isArray(n.fills)) return null;
  const solids = n.fills.filter((x) => x.type === 'SOLID' && x.visible !== false);
  return solids.length ? solids[solids.length - 1] : null;
};

// "Source over" compositing of a top color (alpha ta) on a bottom color (alpha ba).
const over = (top, ta, bottom, ba) => {
  const out = ta + ba * (1 - ta);
  if (out <= 0) return { c: top, a: 0 };
  const ch = (k) => (top[k] * ta + bottom[k] * ba * (1 - ta)) / out;
  return { c: { r: ch('r'), g: ch('g'), b: ch('b') }, a: out };
};

// The color a viewer sees for a layer of color c (alpha a) painted as content of `node`,
// composited through the solid fills and opacities of its ancestors and the page background.
// Sibling shapes and images behind the node are not seen here: check those on a screenshot.
async function seen(node, c, a) {
  let cur = { c: c || { r: 0, g: 0, b: 0 }, a: c ? a : 0 };
  for (let p = node.parent; p && p.type !== 'PAGE' && p.type !== 'DOCUMENT'; p = p.parent) {
    const pf = topSolid(p);
    if (pf) {
      const fc = await solidColor(pf, p);
      cur = over(cur.c, cur.a, fc, pf.opacity === undefined ? 1 : pf.opacity);
    }
    if ('opacity' in p) cur.a *= p.opacity;
  }
  const pageBg = figma.currentPage.backgrounds.find((b) => b.type === 'SOLID');
  return over(cur.c, cur.a, pageBg ? pageBg.color : { r: 1, g: 1, b: 1 }, 1).c;
}

// Checks text contrast (opacity and variable modes included), minimum size, emoji and overflow
// past a clipping ancestor. o: minSize, largeAt, iconFont (regex of icon font families).
async function lint(rootId, o = {}) {
  const minSize = o.minSize || 12;
  const root = await figma.getNodeByIdAsync(rootId);
  if (!root) return ['node not found: ' + rootId];
  const out = [];
  const texts = root.type === 'TEXT' ? [root] : root.findAllWithCriteria({ types: ['TEXT'] });
  for (const t of texts) {
    if (!t.visible) continue;
    const size = typeof t.fontSize === 'number' ? t.fontSize : minSize;
    const label = t.id + ' "' + t.characters.slice(0, 30) + '"';
    const fill = topSolid(t);
    const fc = fill ? await solidColor(fill, t) : null;
    const fa = fill ? (fill.opacity === undefined ? 1 : fill.opacity) * t.opacity : 0;
    const fg = fc ? await seen(t, fc, fa) : null;
    const bg = await seen(t, null, 0);
    if (fg && bg) {
      const r = ratio(fg, bg);
      // Icon-font glyphs (Material Symbols, icon fonts) are non-text: 3:1 like large text.
      const isIcon = typeof t.fontName === 'object' && (o.iconFont || /Symbols|Icons/).test(t.fontName.family);
      const need = isIcon || size >= (o.largeAt || 24) ? 3 : 4.5;
      if (r < need) out.push('contrast ' + r.toFixed(2) + ' < ' + need + ': ' + label);
    }
    if (size < minSize) out.push('size ' + size + ' < ' + minSize + ': ' + label);
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(t.characters)) out.push('emoji: ' + label);
    const tb = t.absoluteBoundingBox;
    for (let p = t.parent; p && tb; p = p.parent) {
      if ('clipsContent' in p && p.clipsContent && p.absoluteBoundingBox) {
        const pb = p.absoluteBoundingBox;
        if (tb.x + tb.width > pb.x + pb.width + 1 || tb.y + tb.height > pb.y + pb.height + 1) {
          out.push('clipped by ' + p.name + ': ' + label);
        }
        break;
      }
    }
  }
  return out.length ? out : ['ok'];
}

globalThis.__bf = { hex, ratio, paint, fonts, T, stack, rect, newSection, fitSection, colorVar, bindFill, lint };
return 'installed __bf: ' + Object.keys(globalThis.__bf).join(', ');
