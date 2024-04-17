import React from 'react'
import '@/shared/styles/app.css'

export function App() {
  const [workers, setWorkers] = React.useState<Worker[] | null>(null)
  const [filter, setFilter] = React.useState('')
  const [generating, setGenerating] = React.useState(false)
  const metrics = React.useRef<number[]>([])
  const [threads, setThreads] = React.useState(Math.ceil(navigator.hardwareConcurrency / 3))

  const spawnWorker = () => {
    const worker = new Worker('/worker.js')
    worker.addEventListener('message', (event) => {
      if (event.data && typeof event.data === 'object') {
        if('type' in event.data && typeof event.data.type === 'number') {
          if(event.data.type === 0) {
            if('id' in event.data && 'mnemonic' in event.data
              && typeof event.data.id === 'string' && typeof event.data.mnemonic === 'string'
            ) {
              console.log('Result', event.data)
            }
          } else if(event.data.type === 1) {
            if ('delta' in event.data && typeof event.data.delta === 'number') {
              metrics.current.push(4000 * 1000 / event.data.delta)
            }
          }
        }
      }
    })
    worker.addEventListener('error', (event) => {
      console.error(event.message)
    })
    worker.postMessage('05' + filter)
    return worker
  }

  const handleSwitch = () => {
    if(generating) {
      workers?.forEach(worker => {
        console.log('Terminated', worker)
        worker?.terminate()
      })
      setWorkers(null)
      metrics.current = []
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

  React.useEffect(() => {
    if (generating && workers?.length) {
      const interval = setInterval(() => {
        document.title = Math.round(
          metrics.current.slice(-workers.length)
            .reduce((a, b) => a + b, 0)
        ) + ' IDs/s'
      }, 10)
      return () => {
        clearInterval(interval)
        document.title = 'Session ID generator'
      }
    }
  }, [generating, workers])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 3 }}>
        <div style={{ background: '#000', border: '1px solid #eee', display: 'flex', gap: 1, borderRadius: 2, paddingLeft: '4px' }}>
          05
          <input 
            value={filter} 
            onChange={e => setFilter(e.target.value.replaceAll(/[^0-9a-fA-F]/g, '').toLowerCase())}
            disabled={generating}
          ></input>
        </div>
        <button onClick={handleSwitch}>Start/stop</button>
      </div>
      <div style={{ display: 'flex', gap: 3 }}>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{threads} threads</span>
        <input 
          type='range' 
          min={1} 
          max={navigator.hardwareConcurrency} 
          value={threads} 
          onChange={e => setThreads(parseInt(e.target.value))}
          disabled={generating}
        ></input>
      </div>
    </div>
  )
}
