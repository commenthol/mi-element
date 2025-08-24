import * as fs from 'node:fs'

const cwd = new URL('..', import.meta.url)

const sed = (filename, ...replacements) => {
  let content = fs.readFileSync(filename, 'utf-8')
  for (let i = 0; i < replacements.length; i += 2) {
    content = content.replace(replacements[i], replacements[i + 1])
  }
  fs.writeFileSync(filename, content, 'utf-8')
}

sed(
  new URL('./types/element.d.ts', cwd),
  /(removeController[^\n]*)\n/,
  `$1
    /**
     * properties or attributes
     */
    [index: PropertyKey]: any;\n`
)
