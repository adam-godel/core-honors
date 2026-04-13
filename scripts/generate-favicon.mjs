#!/usr/bin/env node
/**
 * Generates favicon assets — rainbow blob matching the rip-background cursor effect.
 *
 * Outputs:
 *   public/favicon-assets/blob.svg
 *   public/favicon-assets/blob-{16,32,48,64,96,180,192,512}x{...}.png
 *   public/favicon.ico  (contains 16, 32, 48 px sizes)
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";

// ── Blob geometry ─────────────────────────────────────────────────────────────
// Polar blob: r(θ) = R · (1 + Σ aₙ sin(nθ + φₙ))
// Multiple harmonics give an organic "amoeba" feel with no sharp edges.
// All curves are then smoothed with Catmull-Rom → cubic Bézier conversion.

const VIEW = 512;
const PADDING = 22;

// Frozen moment — chosen to give a nice lopsided but balanced blob
const T = 1.85;

const R_BASE = (VIEW / 2 - PADDING) * 0.82; // base radius in px
const CX = VIEW / 2;
const CY = VIEW / 2;
const N = 128; // number of polygon vertices before spline conversion

function blobRadius(theta, t) {
  return (
    R_BASE *
    (1 +
      0.13 * Math.sin(2 * theta + t * 0.55 + 0.3) +
      0.09 * Math.sin(3 * theta - t * 0.8 + 1.2) +
      0.07 * Math.sin(5 * theta + t * 1.1 + 2.0) +
      0.05 * Math.sin(7 * theta - t * 0.6 + 0.7) +
      0.03 * Math.sin(11 * theta + t * 1.4 + 1.5))
  );
}

// Compute the N vertex positions
const pts = Array.from({ length: N }, (_, i) => {
  const theta = (i / N) * 2 * Math.PI;
  const r = blobRadius(theta, T);
  return [CX + r * Math.cos(theta), CY + r * Math.sin(theta)];
});

// ── Catmull-Rom → cubic Bézier (closed) ──────────────────────────────────────
// For a closed curve p[0..N-1], each segment i→(i+1) gets two control points:
//   cp1 = p[i]   + (p[(i+1)%N] - p[(i-1+N)%N]) / 6
//   cp2 = p[i+1] - (p[(i+2)%N] - p[i]) / 6

function catmullRomToBezier(pts) {
  const n = pts.length;
  const segs = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const cp1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const cp2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    segs.push({ cp1, cp2, end: p2 });
  }
  return segs;
}

const segs = catmullRomToBezier(pts);

// Build SVG path: M to first point, then C (cubic) segments
const [sx, sy] = pts[0];
const pathD =
  `M ${sx.toFixed(3)} ${sy.toFixed(3)} ` +
  segs
    .map(
      ({ cp1, cp2, end }) =>
        `C ${cp1[0].toFixed(3)} ${cp1[1].toFixed(3)}, ` +
        `${cp2[0].toFixed(3)} ${cp2[1].toFixed(3)}, ` +
        `${end[0].toFixed(3)} ${end[1].toFixed(3)}`
    )
    .join(" ") +
  " Z";

// ── Bounding box → gradient extents ──────────────────────────────────────────
const xs = pts.map((p) => p[0]);
const ys = pts.map((p) => p[1]);
const bx0 = Math.min(...xs);
const bx1 = Math.max(...xs);
const by0 = Math.min(...ys);
const by1 = Math.max(...ys);

// Diagonal gradient (upper-left to lower-right) — more dynamic than pure horizontal
const gradStops = Array.from({ length: 7 }, (_, i) => {
  const pct = ((i / 6) * 100).toFixed(1);
  const hue = Math.round((i / 6) * 360);
  return `<stop offset="${pct}%" stop-color="hsl(${hue},90%,63%)"/>`;
}).join("\n      ");

// ── Build SVG ─────────────────────────────────────────────────────────────────
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${VIEW}" height="${VIEW}" viewBox="0 0 ${VIEW} ${VIEW}">
  <defs>
    <!-- Rainbow gradient — diagonal for liveliness -->
    <linearGradient id="rainbow"
      x1="${bx0.toFixed(2)}" y1="${by0.toFixed(2)}"
      x2="${bx1.toFixed(2)}" y2="${by1.toFixed(2)}"
      gradientUnits="userSpaceOnUse">
      ${gradStops}
    </linearGradient>

    <!-- Soft outer glow matching the canvas effect -->
    <filter id="outerGlow" x="-35%" y="-35%" width="170%" height="170%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur"/>
      <feColorMatrix in="blur" type="saturate" values="2.8" result="satBlur"/>
      <feMerge>
        <feMergeNode in="satBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Subtle inner bloom for richness -->
    <filter id="innerGlow" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Diffuse halo -->
  <path d="${pathD}"
        fill="url(#rainbow)"
        opacity="0.4"
        filter="url(#outerGlow)"/>

  <!-- Main blob -->
  <path d="${pathD}"
        fill="url(#rainbow)"
        opacity="0.97"
        filter="url(#innerGlow)"/>

  <!-- Bright edge highlight -->
  <path d="${pathD}"
        fill="none"
        stroke="white"
        stroke-width="2.5"
        opacity="0.4"/>
</svg>
`;

// ── Write files ───────────────────────────────────────────────────────────────

const assetsDir = "public/favicon-assets";
fs.mkdirSync(assetsDir, { recursive: true });

// SVG
const svgPath = path.join(assetsDir, "blob.svg");
fs.writeFileSync(svgPath, svg, "utf8");
console.log(`✓  SVG  → ${svgPath}`);

// PNGs
const PNG_SIZES = [16, 32, 48, 64, 96, 180, 192, 512];
const svgBuf = Buffer.from(svg);

for (const sz of PNG_SIZES) {
  const out = path.join(assetsDir, `blob-${sz}x${sz}.png`);
  await sharp(svgBuf, { density: Math.round((sz / VIEW) * 72 * 4) })
    .resize(sz, sz, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out);
  console.log(`✓  PNG  → ${out}`);
}

// favicon.png (32×32 copy for any legacy <link rel="shortcut icon"> references)
await sharp(svgBuf, { density: Math.round((32 / VIEW) * 72 * 4) })
  .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile("public/favicon.png");
console.log("✓  PNG  → public/favicon.png");

// ICO — embeds three sizes; modern browsers read the PNG data directly
const ICO_SIZES = [16, 32, 48];
const icoPngs = await Promise.all(
  ICO_SIZES.map((sz) =>
    sharp(svgBuf, { density: Math.round((sz / VIEW) * 72 * 4) })
      .resize(sz, sz, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
  )
);

const icoPath = "public/favicon.ico";
fs.writeFileSync(icoPath, buildIco(icoPngs, ICO_SIZES));
console.log(`✓  ICO  → ${icoPath}`);

console.log("\nDone! All favicon assets generated.");

// ── ICO builder ───────────────────────────────────────────────────────────────
// ICO format: 6-byte header + 16-byte directory per image + raw PNG bytes.
// Embedding PNG data (Vista+ format) avoids having to write BMP pixel rows.

function buildIco(pngBufs, sizes) {
  const count = pngBufs.length;
  const HEADER = 6;
  const DIR_ENTRY = 16;
  const dataStart = HEADER + count * DIR_ENTRY;

  let cur = dataStart;
  const offsets = [];
  for (const buf of pngBufs) {
    offsets.push(cur);
    cur += buf.length;
  }

  const out = Buffer.alloc(cur, 0);

  // ICONDIR header
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);

  // ICONDIRENTRY × count
  for (let i = 0; i < count; i++) {
    const base = HEADER + i * DIR_ENTRY;
    const sz = sizes[i];
    out.writeUInt8(sz >= 256 ? 0 : sz, base);
    out.writeUInt8(sz >= 256 ? 0 : sz, base + 1);
    out.writeUInt8(0, base + 2);
    out.writeUInt8(0, base + 3);
    out.writeUInt16LE(1, base + 4);
    out.writeUInt16LE(32, base + 6);
    out.writeUInt32LE(pngBufs[i].length, base + 8);
    out.writeUInt32LE(offsets[i], base + 12);
  }

  for (let i = 0; i < count; i++) pngBufs[i].copy(out, offsets[i]);

  return out;
}
