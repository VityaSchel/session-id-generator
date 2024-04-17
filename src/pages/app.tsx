import React from 'react'
import '@/shared/styles/app.css'
import { MessageType } from '@/shared/sw-helpers'
import { generateKeypair, generateMnemonic } from '@/shared/generator/manager/account-manager'
import { hex } from '@/shared/generator/utils/hex'

export function App() {
  const generating = React.useRef(false)
  const [serviceWorker, setServiceWorker] = React.useState<true | false | 'error'>(false)
  const registeringServiceWorker = React.useRef(false)

  React.useEffect(() => {
    if (registeringServiceWorker.current) return
    registeringServiceWorker.current = true
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(new URL('/service-worker.js', import.meta.url), { type: 'module' })
          .then(reg => {
            console.log('Service Worker registered', reg)
            setServiceWorker(true)
          })
          .catch(err => {
            console.error('Service Worker registration failed', err)
            setServiceWorker('error')
          })
      })
    } else {
      setServiceWorker('error')
    }
  }, [])

  React.useEffect(() => {
    const channel = new BroadcastChannel('id-results')
    channel.addEventListener('message', (event) => {
      console.log(event.data)
    })
    const metrics = new BroadcastChannel('metrics')
    metrics.addEventListener('message', (event) => {
      console.log(event.data + ' IDs per second')
    })
  }, [])

  const handleSwitch = () => {
    navigator.serviceWorker.ready.then(reg => {
      if(generating.current) {
        reg.active?.postMessage({ type: MessageType.StopGenerating })
      } else {
        reg.active?.postMessage({ type: MessageType.StartGenerating, filter: '44' })
      }
      generating.current = !generating.current
    })
  }

  if (serviceWorker === false) {
    return (
      <span>Loading...</span>
    )
  }

  return (
    <button onClick={handleSwitch}>Start/stop</button>
  )
}
