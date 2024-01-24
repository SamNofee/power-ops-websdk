import typescript from 'rollup-plugin-typescript2'
import * as glob from 'glob'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export default {
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
      preserveModules: true,
      entryFileNames: '[name].js'
    },
    {
      dir: 'lib',
      format: 'cjs',
      preserveModules: true,
      entryFileNames: '[name].cjs'
    }
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
    }),
  ],
}