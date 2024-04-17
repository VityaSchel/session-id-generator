import { generateKeypair, generateMnemonic } from '@/shared/generator/manager/account-manager'
import { ArrayBufferToHex } from '@/shared/generator/utils/hex'

self.addEventListener('message', async (event: MessageEvent) => {
  const filter = event.data
  if(typeof filter === 'string' && filter.length > 2) {
    generate(filter)
  }
})

async function generate(filterView: string) {
  const doesMatch = (key: string) => {
    const offset = 2
    for (let i = offset; i < filterView.length; i++) {
      if (key[i] !== filterView[i]) {
        return false
      }
    }
    return true
  }

  let lastTime = performance.now()

  // eslint-disable-next-line no-constant-condition
  while(true) {
    for(let i = 0; i < 4000; i++) {
      const mnemonic = await generateMnemonic()
      const keypair = await generateKeypair(mnemonic, 'english')
      
      const sessionID = ArrayBufferToHex(keypair.pubKey)
      if (doesMatch(sessionID)) {
        postMessage({ type: 0, id: sessionID, mnemonic })
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }
    const now = performance.now()
    postMessage({ type: 1, delta: now - lastTime })
    lastTime = now
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}