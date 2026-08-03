import { readdirSync, readFileSync, statSync } from 'node:fs'

const extensions = new Set(['js', 'mjs', 'css', 'html', 'json', 'md', 'yml', 'yaml'])
const ignored = new Set(['.git', 'node_modules', 'dist'])
const files = []
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue
    const file = `${directory}/${entry.name}`
    if (entry.isDirectory()) walk(file)
    else if (entry.isFile() && extensions.has(entry.name.split('.').pop()?.toLowerCase())) files.push(file.replace(/^\.\//, '').replaceAll('\\', '/'))
  }
}
walk('.')
let lines = 0
let nonBlank = 0
for (const file of files) {
  if (statSync(file).size > 8 * 1024 * 1024) continue
  const rows = readFileSync(file, 'utf8').replace(/\n$/, '').split('\n')
  lines += rows.length
  nonBlank += rows.filter((row) => row.trim()).length
}
console.log(`| Files | Lines | Non-blank |`)
console.log(`| ---: | ---: | ---: |`)
console.log(`| ${files.length} | ${lines} | ${nonBlank} |`)
console.log(`Measured at ${process.env.GITHUB_SHA || 'local checkout'}.`)
