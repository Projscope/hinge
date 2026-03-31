/**
 * Migration runner — reads SUPABASE_DB_URL from hinge-app/.env.local
 * and runs all SQL files in supabase/migrations/ in order.
 *
 * Usage: node scripts/migrate.mjs
 */

import { createRequire } from 'module'
import { readFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(root, 'hinge-app/.env.local')
const envContent = readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => l.split('=').map((p, i) => (i === 0 ? p.trim() : l.slice(l.indexOf('=') + 1).trim())))
)

const connectionString = env.SUPABASE_DB_URL
if (!connectionString) {
  console.error('❌  SUPABASE_DB_URL not set in hinge-app/.env.local')
  process.exit(1)
}

// ── Dynamically import pg (install if missing) ───────────────────────────────
const require = createRequire(import.meta.url)
let pg
try {
  pg = require('pg')
} catch {
  console.log('Installing pg...')
  const { execSync } = await import('child_process')
  execSync('npm install pg --no-save', { cwd: resolve(root, 'hinge-app'), stdio: 'inherit' })
  pg = require(resolve(root, 'hinge-app/node_modules/pg'))
}
const { Client } = pg

// ── Run migrations ───────────────────────────────────────────────────────────
const migrationsDir = resolve(root, 'supabase/migrations')
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort()

const client = new Client({ connectionString })
await client.connect()
console.log('✓ Connected to database\n')

for (const file of files) {
  const sql = readFileSync(resolve(migrationsDir, file), 'utf8')
  console.log(`▶ Running ${file}...`)
  try {
    await client.query(sql)
    console.log(`  ✓ Done\n`)
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}\n`)
    await client.end()
    process.exit(1)
  }
}

await client.end()
console.log('✅  All migrations complete.')
