import React from 'react'
import '@/shared/styles/app.css'

export function App() {
  const [workers, setWorkers] = React.useState<Worker[] | null>(null)
  const [filter, setFilter] = React.useState('')
  const [generating, setGenerating] = React.useState(false)

  const spawnWorker = () => {
    const worker = new Worker('/worker.js')
    worker.addEventListener('message', (event) => {
      if (event.data && typeof event.data === 'object'
        && 'id' in event.data && 'mnemonic' in event.data
        && typeof event.data.id === 'string' && typeof event.data.mnemonic === 'string'
      ) {
        console.log('Result', event.data)
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
    } else {
      const threads = Math.ceil(navigator.hardwareConcurrency / 3)
      console.log('Spawning', threads, 'workers')
      const workers: Worker[] = []
      for (let i = 0; i < threads; i++) {
        workers.push(spawnWorker())
      }
      setWorkers(workers)
    }
    setGenerating(!generating)
  }

  const checkPerformance = () => {
    const worker = spawnWorker()
    setGenerating(true)
    setTimeout(() => {
      worker?.terminate()
      setGenerating(false)
    }, 1000)
  }

  return (
    <div style={{ display: 'flex', gap: 3  }}>
      05
      <input 
        value={filter} 
        onChange={e => setFilter(e.target.value.replaceAll(/[^0-9a-fA-F]/g, '').toLowerCase())}
        disabled={generating}
      ></input>
      <button onClick={handleSwitch}>Start/stop</button>
      <button onClick={checkPerformance} disabled={generating}>Performance</button>
    </div>
  )
}
