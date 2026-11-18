import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')
const iconsDir = path.join(publicDir, 'icons')

await mkdir(iconsDir, { recursive: true })

const favicon = await readFile(path.join(publicDir, 'favicon.svg'))

await sharp(favicon).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'))
await sharp(favicon).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'))
await sharp(favicon).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'))

// Maskable icon: full-bleed background with the mark inside the safe zone.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0A0B0D"/>
  <circle cx="256" cy="238" r="160" fill="#34D399" fill-opacity="0.055"/>
  <circle cx="256" cy="256" r="122" stroke="#24262C" stroke-width="22"/>
  <path d="M344 182a122 122 0 1 0 20 110" stroke="#34D399" stroke-width="25" stroke-linecap="round"/>
  <path d="M357 128v64h-64" stroke="#34D399" stroke-width="25" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="256" cy="256" r="28" fill="#34D399"/>
</svg>`
await sharp(Buffer.from(maskable))
  .png()
  .toFile(path.join(iconsDir, 'maskable-512.png'))

const splashSizes = [
  [1170, 2532],
  [1290, 2796],
  [1125, 2436],
  [828, 1792],
  [1242, 2688],
]

for (const [width, height] of splashSizes) {
  const iconSize = Math.round(width * 0.24)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <radialGradient id="splashGlow" cx="50%" cy="42%" r="45%">
        <stop offset="0%" stop-color="#34D399" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="#34D399" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="#08090B"/>
    <rect width="${width}" height="${height}" fill="url(#splashGlow)"/>
    <g transform="translate(${(width - iconSize) / 2} ${height / 2 - iconSize * 0.82})">
      <rect width="${iconSize}" height="${iconSize}" rx="${iconSize * 0.23}" fill="#0A0B0D" stroke="#2A2D33"/>
      <g transform="translate(${iconSize * 0.18} ${iconSize * 0.18}) scale(${(iconSize * 0.64) / 512})">
        <circle cx="256" cy="256" r="148" stroke="#24262C" stroke-width="26"/>
        <path d="M362 166a148 148 0 1 0 24 133" stroke="#34D399" stroke-width="30" stroke-linecap="round"/>
        <path d="M378 100v78h-78" stroke="#34D399" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="256" cy="256" r="34" fill="#34D399"/>
      </g>
    </g>
    <text x="${width / 2}" y="${height / 2 + iconSize * 0.38}" text-anchor="middle" fill="#F4F5F6" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="${Math.round(width * 0.062)}" font-weight="600" letter-spacing="${Math.round(width * 0.022)}">RESET</text>
    <text x="${width / 2}" y="${height / 2 + iconSize * 0.55}" text-anchor="middle" fill="#62666F" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="${Math.round(width * 0.021)}" font-weight="500" letter-spacing="${Math.round(width * 0.006)}">58 DAY CHALLENGE</text>
  </svg>`
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(iconsDir, `splash-${width}x${height}.png`))
}

console.log('Generated app icons and splash screens.')
