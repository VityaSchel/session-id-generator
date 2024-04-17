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

  // eslint-disable-next-line no-constant-condition
  while(true) {
    for(let i = 0; i < 1000; i++) {
      const mnemonic = await generateMnemonic()
      const keypair = await generateKeypair(mnemonic, 'english')
      
      const sessionID = ArrayBufferToHex(keypair.pubKey)
      if (doesMatch(sessionID)) {
        postMessage({ id: sessionID, mnemonic })
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}