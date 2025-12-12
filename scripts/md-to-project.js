#!/usr/bin/env node
// Read a Markdown file and print its content for use as longDescription in myData.json.

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { pathToFileURL } from 'url'

export function readLongDescription(filePath) {
   const abs = resolve(process.cwd(), filePath)
   return readFileSync(abs, 'utf8').replace(/^\uFEFF/, '').trim()
}

function printUsage() {
   console.log(`
Usage:
  node scripts/md-to-project.js path/to/file.md

Description:
  Prints the file content so you can paste it directly as "longDescription" in myData.json.
`)
}

async function main() {
   const [filePath] = process.argv.slice(2)
   if (!filePath) {
      printUsage()
      process.exit(1)
   }
   try {
      const content = readLongDescription(filePath)
      // Output as a JSON-ready string so it can be pasted directly as longDescription.
      console.log(JSON.stringify(content))
   }
   catch (err) {
      console.error(`Failed to read "${filePath}":`, err.message)
      process.exit(1)
   }
}

const isMain = pathToFileURL(process.argv[1] || '').href === import.meta.url
if (isMain) main()
