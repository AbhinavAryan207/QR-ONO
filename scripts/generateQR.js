#!/usr/bin/env node
/**
 * Onerios-Quests — Batch QR Code Generator
 * ==================================
 * Generates 50 unique QR code PNG images and saves them to ./qr-output/
 *
 * Usage:
 *   node scripts/generateQR.js
 *   # or via npm:
 *   npm run generate-qr
 *
 * Output:
 *   qr-output/qr-<n>-<token>.png   — 400×400 px PNG for each token  (50 files)
 *   qr-output/tokens.json          — manifest: { id, token, url, file }
 *
 * Each QR code encodes a URL like:
 *   https://yourapp.com/play?token=<TOKEN>
 *
 * The tokens are hardcoded so they are stable across runs.
 * When a user scans a QR code the token is recorded in Supabase `scans`
 * to prevent the same user from scanning the same code twice.
 *
 * NOTE: Questions are hardcoded in PlayPage.jsx — no Supabase inserts needed.
 *       Just print / deploy the PNGs physically and you are ready to go.
 */

import { mkdirSync, existsSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import QRCode from 'qrcode'

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Set VITE_APP_URL in your .env, or edit the fallback below.
const BASE_URL = process.env.VITE_APP_URL?.replace(/\/$/, '') || 'http://localhost:5173'
const OUTPUT_DIR = './qr-output'
const QR_SIZE = 400   // px
// ─────────────────────────────────────────────────────────────────────────────

// 50 fixed, unique tokens — stable across every run of the script.
// Each token maps to a different question via the deterministic hash in PlayPage.jsx.
const TOKENS = [
  'qrono-3f2a1b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c',
  'qrono-7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  'qrono-b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e',
  'qrono-e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b',
  'qrono-2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f',
  'qrono-5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
  'qrono-8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
  'qrono-0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
  'qrono-3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d',
  'qrono-6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a',
  'qrono-9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d',
  'qrono-c2d3e4f5-a6b7-c8d9-0e1f-2a3b4c5d6e7f',
  'qrono-f5a6b7c8-d9e0-f1a2-b3c4-d5e6f7a8b9c0',
  'qrono-1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b',
  'qrono-4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e',
  'qrono-7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b',
  'qrono-a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6',
  'qrono-d4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9',
  'qrono-0f1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
  'qrono-3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
  'qrono-6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
  'qrono-9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
  'qrono-c6d7e8f9-a0b1-c2d3-e4f5-a6b7c8d9e0f1',
  'qrono-f9a0b1c2-d3e4-f5a6-b7c8-d9e0f1a2b3c4',
  'qrono-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  'qrono-4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  'qrono-7a8b9c0d-e1f2-a3b4-c5d6-e7f8a9b0c1d2',
  'qrono-a3b4c5d6-e7f8-a9b0-c1d2-e3f4a5b6c7d8',
  'qrono-d6e7f8a9-b0c1-d2e3-f4a5-b6c7d8e9f0a1',
  'qrono-0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e',
  'qrono-3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b',
  'qrono-6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e',
  'qrono-9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
  'qrono-ca1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
  'qrono-fd2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a',
  'qrono-2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d',
  'qrono-5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a',
  'qrono-8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d',
  'qrono-bd0e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a',
  'qrono-e3f4a5b6-c7d8-e9f0-a1b2-c3d4e5f6a7b8',
  'qrono-16a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1',
  'qrono-49b0c1d2-e3f4-a5b6-c7d8-e9f0a1b2c3d4',
  'qrono-7cc1d2e3-f4a5-b6c7-d8e9-f0a1b2c3d4e5',
  'qrono-afd2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6',
  'qrono-dae3f4a5-b6c7-d8e9-f0a1-b2c3d4e5f6a7',
  'qrono-0df4a5b6-c7d8-e9f0-a1b2-c3d4e5f6a7b8',
  'qrono-30a5b6c7-d8e9-f0a1-b2c3-d4e5f6a7b8c9',
  'qrono-63b6c7d8-e9f0-a1b2-c3d4-e5f6a7b8c9d0',
  'qrono-96c7d8e9-f0a1-b2c3-d4e5-f6a7b8c9d0e1',
  'qrono-c9d8e7f6-a5b4-c3d2-e1f0-a9b8c7d6e5f4',
]

// ─── Main ─────────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = join(__dirname, '..', OUTPUT_DIR)

if (!existsSync(outputPath)) {
  mkdirSync(outputPath, { recursive: true })
}

const QR_OPTIONS = {
  type: 'png',
  width: QR_SIZE,
  margin: 2,
  color: { dark: '#000000', light: '#ffffff' },
  errorCorrectionLevel: 'H',
}

console.log(`\nOnerios-Quests — Generating ${TOKENS.length} QR codes`)
console.log(`  Base URL  : ${BASE_URL}`)
console.log(`  Output dir: ${outputPath}\n`)

const manifest = []

async function generateAll() {
  for (let i = 0; i < TOKENS.length; i++) {
    const token = TOKENS[i]
    const n = String(i + 1).padStart(2, '0')
    const fileName = `qr-${n}-${token.replace('qrono-', '')}.png`
    const url = `${BASE_URL}/play?token=${encodeURIComponent(token)}`
    const filePath = join(outputPath, fileName)

    try {
      await QRCode.toFile(filePath, url, QR_OPTIONS)
      console.log(`  [${n}/50]  ${fileName}`)
      manifest.push({ id: i + 1, token, url, file: fileName })
    } catch (err) {
      console.error(`  ERROR [${n}] ${err.message}`)
    }
  }

  // Write manifest
  const manifestPath = join(outputPath, 'tokens.json')
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')

  console.log(`\nDone! ${manifest.length} QR codes saved to ${outputPath}`)
  console.log(`Manifest  : ${manifestPath}`)
  console.log(`\nNext steps:`)
  console.log(`  1. Print the PNG files and place them at physical locations.`)
  console.log(`  2. No Supabase inserts needed — questions are hardcoded in the app.`)
  console.log(`  3. Tokens are tracked automatically in the 'scans' table on first use.\n`)
}

generateAll().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
