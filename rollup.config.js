import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import * as glob from 'glob'
import path from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath } from 'node:url'
import commonjs from '@rollup/plugin-commonjs'

// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
	input: Object.fromEntries(
    glob.sync('src/**/*.ts').map(file => [
      path.relative(
        'src', file.slice(0, file.length - path.extname(file).length)
      ),
      fileURLToPath(new URL(file, import.meta.url))
    ])
  ),
  output: [
    {
      dir: 'lib',
      format: 'esm',
      entryFileNames: '[name].js'
    },
    {
      dir: 'lib',
      format: 'cjs',
      entryFileNames: '[name].cjs'
    }
  ],
  plugins: [
    commonjs(),
    nodeResolve(),
    typescript({
      tsconfig: 'tsconfig.json',
    }),
    visualizer()
  ],
}

export default config