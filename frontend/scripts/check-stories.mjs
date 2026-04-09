/**
 * 轻量校验：从 stories.ts 提取 id，检查数量与唯一性（不执行 TS）。
 * 运行：node scripts/check-stories.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const path = join(__dirname, '../src/lib/stories.ts')
const src = readFileSync(path, 'utf8')

const ids = [...src.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
const unique = new Set(ids)

if (ids.length === 0) {
  console.error('No story ids found.')
  process.exit(1)
}
if (ids.length !== unique.size) {
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i)
  console.error('Duplicate story ids:', [...new Set(dup)])
  process.exit(1)
}

console.log(`OK: ${ids.length} stories, unique ids.`)
ids.forEach((id) => console.log(`  - ${id}`))
process.exit(0)
