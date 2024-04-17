import React from 'react'
import '@/shared/styles/app.css'
import { hexToUint8Array } from '@/shared/generator/utils/hex'

export function App() {
  const generating = React.useRef(false)
  const [worker, setWorker] = React.useState<Worker | null>(null)
  const [filter, setFilter] = React.useState('')

  const handleSwitch = () => {
    if(generating.current) {
      console.log('Terminated', worker)
      worker?.terminate()
      setWorker(null)
    } else {
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
      worker.postMessage(hexToUint8Array('05' + filter))
      setWorker(worker)
    }
    generating.current = !generating.current
  }

  return (
    <div>
      05
      <input value={filter} onChange={e => setFilter(e.target.value)}></input>
      <button onClick={handleSwitch}>Start/stop</button>
    </div>
  )
}
