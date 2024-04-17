import { resolve } from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

const __dirname = dirname(fileURLToPath(import.meta.url)) + '/'

export default {
  entry: './src/worker/index.ts',
  output: {
    filename: 'worker.js',
    path: resolve(__dirname, '../../public'),
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.wasm'],
    plugins: [new TsconfigPathsPlugin({ configFile: __dirname + 'tsconfig.json'})],
    fallback: { 'crypto': false }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: __dirname + 'tsconfig.json',
            }
          }
        ]
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/sync',
      },
    ],
  },
  experiments: {
    syncWebAssembly: true,
  },
  mode: 'production'
}