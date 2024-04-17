import { resolve } from 'path'
import { InjectManifest } from 'workbox-webpack-plugin'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url)) + '/'

export const entry = './src/worker.ts'
export const output = {
  filename: 'service-worker.js',
  path: resolve(__dirname, 'public', 'service-worker.js'),
}
export const module = {
  rules: [
    {
      test: /\.wasm$/,
      type: 'webassembly/sync',
    },
  ],
}
export const experiments = {
  syncWebAssembly: true,
}
export const plugins = [
  new InjectManifest({
    swSrc: './src/worker.ts',
    swDest: 'service-worker.js',
  }),
]
export const mode = 'production'
