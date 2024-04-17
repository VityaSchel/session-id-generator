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
    worker.postMessage('05' + filter)
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
        <div className='flex items-center w-full font-mono'>
          <input
            value={'05' + filter}
            onChange={e => setFilter(e.target.value.substring(2).replaceAll(/[^0-9a-fA-F]/g, '').toLowerCase())}
            disabled={generating}
            className='font-mono text-xl rounded-md border-solid border-[1px] px-4 py-2 flex-1'
          ></input>
          <span
            className='absolute ml-[42px] font-mono text-xl text-neutral-500 pointer-events-none select-none'
            style={{ display: filter.length === 0 ? 'block' : 'none' }}
          >
            67890abcdef...
          </span>
        </div>
        <button onClick={handleSwitch} className='rounded-md font-[inherit] border-solid px-4'>Start/stop</button>
      </div>
      <div className='flex justify-between'>
        <div className='flex gap-[3px]'>
          <span className='tabular-nums w-20'>{threads} thread{threads > 1 && 's'}</span>
          <input
            type='range'
            min={1}
            max={navigator.hardwareConcurrency}
            value={threads}
            onChange={e => setThreads(parseInt(e.target.value))}
            disabled={generating}
          ></input>
        </div>
        <a href="https://hloth.dev" className='text-neutral-400 text-sm'>by hloth</a>
      </div>
    </>
  )
}
