import terser from '@rollup/plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const terserOptsDeadCode = {
  compress: {
    passes: 2,
    dead_code: true,
    global_defs: {
      'process.env.NODE_ENV': 'production'
    },
    drop_console: ['debug']
  }
}

const tasks = [
  {
    input: `src/index.js`,
    output: [
      {
        dir: `./dist`,
        format: 'es',
        sourcemap: false,
        preserveModules: true
      }
    ],
    plugins: [
      terser({
        mangle: false,
        format: {
          beautify: true,
          indent_level: 2,
          semicolons: false,
          quote_style: 3
        },
        ...terserOptsDeadCode
      })
    ]
  },
  {
    input: `src/index.js`,
    output: [
      {
        file: `./dist/bundle.js`,
        format: 'es',
        sourcemap: false,
        banner: `/*!\n * SPDX-License-Identifier: MIT\n * mi-element v${process.env.npm_package_version}\n */`
      }
    ],
    plugins: [
      nodeResolve(),
      terser({
        mangle: false,
        format: {
          beautify: true,
          indent_level: 2,
          semicolons: false,
          quote_style: 3
        },
        ...terserOptsDeadCode
      })
    ]
  },
  {
    input: `src/index.js`,
    output: [
      {
        file: `./dist/bundle.min.js`,
        format: 'es',
        sourcemap: false,
        banner: `/*!\n * SPDX-License-Identifier: MIT\n * mi-element v${process.env.npm_package_version}\n */`
      }
    ],
    plugins: [
      nodeResolve(),
      terser({
        mangle: true,
        ...terserOptsDeadCode
      })
    ]
  }
]

export default tasks
