import { run } from './r.js'
import sh from 'shelljs'

const { exec } = sh

const argv = process.argv.slice(2).join(' ')

exec(`npx versionn ${argv}`)
run(`npx versionn ${argv}`)
