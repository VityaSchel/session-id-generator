import fs from 'fs/promises'
import yargs from 'yargs/yargs'
import path from 'path'
import { createLogUpdate } from 'log-update'
import chalk from 'chalk'

async function main() {
  const logUpdate = createLogUpdate(process.stdout, {
    showCursor: true
  })

  const args = await yargs(process.argv.slice(2))
    .scriptName('sidgen')
    .command('$0 <filter>', 'Filter for Session ID hex. You can use `*` as a wildcard and `?` as a single character placeholder.')
    .option('out', {
      alias: 'o',
      describe: 'Path to output directory',
      default: './output',
      normalize: true,
      type: 'string'
    })
    .option('threads', {
      alias: 't',
      describe: 'Number of workers to spawn. By default, Math.ceil(navigator.hardwareConcurrency / 3)',
      type: 'number',
      number: true,
    })
    .epilogue('Usage: sidgen <filter> [-o <output>] [-t <threads>]')
    .parse()

  if(!args.out || typeof args.out !== 'string' || args.out.length === 0) {
    console.error('Invalid output directory')
    process.exit(1)
  }

  if (!args.filter) {
    console.error('Invalid filter. Usage: sidgen <filter> [-o <output>] [-t <threads]')
    process.exit(1)
  }
  let filter = String(args.filter).toLowerCase()
  if (!filter || typeof filter !== 'string' || filter.length === 0) {
    console.error('Invalid filter. Usage: sidgen <filter> [-o <output>] [-t <threads>]')
    process.exit(1)
  }
  if (filter.startsWith('05')) {
    filter = filter.slice(2)
    console.warn(chalk.yellow('[!] 05 prefix was ommited from the filter, it is not required'))
  }
  if (!filter || typeof filter !== 'string' || filter.length === 0) {
    console.error('Invalid filter. Usage: sidgen <filter> [-o <output>] [-t <threads>]')
    process.exit(1)
  }

  if(filter.length > 66-2) {
    console.error('Filter is longer than possible Session ID')
    process.exit(1)
  }
  if(!/^[a-f0-9?*]+$/.test(filter)) {
    console.error('Filter is invalid. You can only use hex: a-f, 0-9, `*` as a wildcard and `?` as a single character placeholder.')
    process.exit(1)
  }

  console.log()

  await fs.mkdir(args.out, { recursive: true })

  if (args.threads !== undefined && !Number.isSafeInteger(args.threads)) {
    console.error('Invalid number of threads')
    process.exit(1)
  }
  const threads = args.threads ?? Math.ceil(navigator.hardwareConcurrency / 3)

  const workers: Worker[] = []
  for (let i = 0; i < threads; i++) {
    const worker = new Worker("./worker.ts")
    worker.postMessage(filter)
    worker.addEventListener('error', (event) => {
      console.error('Worker error', event)
    })
    worker.addEventListener('message', (event) => {
      if (event.data && typeof event.data === 'object') {
        if ('type' in event.data && typeof event.data.type === 'number') {
          if (event.data.type === 0) {
            if ('id' in event.data && 'mnemonic' in event.data
              && typeof event.data.id === 'string' && typeof event.data.mnemonic === 'string'
            ) {
              onResult(event.data)
            }
          } else if (event.data.type === 1) {
            if ('delta' in event.data && typeof event.data.delta === 'number') {
              onMetricsUpdate(4000 * 1000 / event.data.delta)
            }
          }
        }
      }
    })
  }

  let matches = 0

  const metrics: number[] = []
  let idsPerSecond: number
  function onMetricsUpdate(n: number) {
    metrics.push(n)
    idsPerSecond = Math.round(
      metrics.slice(-threads)
        .reduce((a, b) => a + b, 0)
    )
    logMetrics()
  }

  function logMetrics() {
    logUpdate(
      '\n',
      chalk.bold(idsPerSecond + ' IDs/s'), '•', chalk.bold(threads + ' threads'),
      '\n',
      'Found: ', chalk.ansi256(240)(matches),
      '\n',
      'Filter: ', chalk.bold(chalk.ansi256(240)(filter)),
    )
  }

  function onResult({ id, mnemonic }: {
    id: string,
    mnemonic: string
  }) {
    matches++
    logUpdate.clear()
    console.log('    ' + id)
    fs.writeFile(path.resolve(args.out, id + '.txt'), mnemonic + '\n', { flag: 'w' })
    logMetrics()
  }

  process.on('SIGINT', () => {
    workers.forEach(w => w.terminate())
    process.exit(0)
  })
}

main()