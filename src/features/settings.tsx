import React from 'react'
import '@/shared/styles/app.css'

export function Settings({ threads, setThreads, onMetricsUpdate, onReset, onResult, generating, setGenerating }: {
  threads: number
  setThreads: (n: number) => void
  onMetricsUpdate: (n: number) => void
  onReset: () => void
  onResult: (newResult: { filter: string, id: string, mnemonic: string }) => void
  generating: boolean
  setGenerating: (b: boolean) => void
}) {
  const [workers, setWorkers] = React.useState<Worker[] | null>(null)
  const [filter, setFilter] = React.useState('')

  const spawnWorker = () => {
    const worker = new Worker('/worker.js')
    const onMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object') {
        if ('type' in event.data && typeof event.data.type === 'number') {
          if (event.data.type === 0) {
            if ('id' in event.data && 'mnemonic' in event.data
              && typeof event.data.id === 'string' && typeof event.data.mnemonic === 'string'
            ) {
              onResult({
                ...event.data,
                filter
              })
            }
          } else if (event.data.type === 1) {
            if ('delta' in event.data && typeof event.data.delta === 'number') {
              onMetricsUpdate(4000 * 1000 / event.data.delta)
            }
          }
        }
      }
    }
    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', (event) => console.error(event.message))
    worker.postMessage(filter)
    return worker
  }

  const handleSwitch = () => {
    if (generating) {
      workers?.forEach(worker => {
        console.log('Terminated', worker)
        worker?.terminate()
      })
      setWorkers(null)
      onReset()
    } else {
      console.log('Spawning', threads, 'workers')
      const workers: Worker[] = []
      for (let i = 0; i < threads; i++) {
        workers.push(spawnWorker())
      }
      setWorkers(workers)
    }
    setGenerating(!generating)
  }

  return (
    <>
      <div className='flex mt-6 gap-2'>
        <div className='flex items-center min-w-0 flex-1 font-mono'>
          <input
            value={'05' + filter}
            onChange={e => setFilter(e.target.value.substring(2).replaceAll(/[^0-9a-fA-F?*]/g, '').toLowerCase())}
            disabled={generating}
            className='font-mono text-xl rounded-md border-solid border-[1px] px-4 py-2 flex-1 w-full overflow-hidden'
          ></input>
          <span
            className='absolute ml-[42px] font-mono text-xl text-neutral-500 pointer-events-none select-none'
            style={{ display: filter.length === 0 ? 'block' : 'none' }}
          >
            <span className='hidden 290:block 360:hidden'>67890...</span>
            <span className='hidden 360:block'>67890abcdef...</span>
          </span>
        </div>
        <button onClick={handleSwitch} className='rounded-md font-[inherit] border-solid px-4'>Start/stop</button>
      </div>
      <span className='text-sm text-neutral-400'>
        <span className='font-mono bg-neutral-700 px-1'>?</span> means any character, <span className='font-mono bg-neutral-700 px-1'>*</span> means any sequence of characters
      </span>
      <div className='flex justify-between flex-col 320:flex-row'>
        <div className='flex gap-[3px]'>
          <span className='tabular-nums w-[84px]'>{threads} worker{threads > 1 && 's'}</span>
          <input
            type='range'
            min={1}
            max={navigator.hardwareConcurrency}
            value={threads}
            onChange={e => setThreads(parseInt(e.target.value))}
            disabled={generating}
          ></input>
        </div>
        <div className='flex items-center gap-1'>
          <a href="https://hloth.dev" target="_blank" rel="nofollow noreferrer" className='text-neutral-400 text-sm hover:text-neutral-200'>by hloth</a>
          •
          <a href="https://github.com/VityaSchel/session-id-generator" target="_blank" rel="nofollow noreferrer" className='text-neutral-400 text-sm hover:text-neutral-200 flex items-center'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"></path></svg>
          </a>
        </div>
      </div>
    </>
  )
}
