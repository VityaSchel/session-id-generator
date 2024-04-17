import React from 'react'
import '@/shared/styles/app.css'
import { generateKeypair, generateMnemonic } from '@/shared/lib/manager/account-manager'
import { hex } from '@/shared/utils/hex'

export function App() {
  // const generating = React.useRef(false)

  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(new URL('/service-worker.js', import.meta.url), { type: 'module' })
          .then(reg => console.log('Service Worker registered', reg))
          .catch(err => console.error('Service Worker registration failed', err))
      })
    }
  }, [])

  const handleGenerate = async () => {
    const start = performance.now()
    const map = new Map()
    for(let i = 0; i < 3000; i++) {
    // while(generating.current) {
      const mnemonic = await generateMnemonic()
      const keypair = await generateKeypair(mnemonic, 'english')
      // console.log(mnemonic, hex(keypair.pubKey))
      map.set(hex(keypair.pubKey), mnemonic)
    }
    const end = performance.now()
    console.log(end - start + 'ms')
    console.log(map.size)
  }

  // const handleSwitch = () => {
  //   if(generating.current) {
  //     generating.current = false
  //   } else {
  //     generating.current = true
  //     handleGenerate()
  //   }
  // }

  return (
    <button onClick={handleGenerate}>test</button>
  )
}
