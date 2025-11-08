import { fileURLToPath } from 'node:url'
import sh from 'shelljs'

const { cd, exec, ls } = sh
const cwd = fileURLToPath(new URL('..', import.meta.url))

cd(cwd)

// order of dependencies
const deps = ['mi-signal', 'mi-html', 'mi-element'].reverse()

export const run = (cmd) => {
  const packages = [...ls('./packages')].sort(
    (a, b) => deps.indexOf(b) - deps.indexOf(a)
  )

  for (const pckage of packages) {
    cd(cwd)
    cd(`./packages/${pckage}`)
    console.log(`=== ${process.cwd()}`)
    exec(cmd)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cmd = process.argv.slice(2).join(' ')
  run(cmd)
}
