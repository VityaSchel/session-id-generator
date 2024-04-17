import { generateKeypair, generateMnemonic } from '@/shared/generator/manager/account-manager'
import { ArrayBufferToHex } from '@/shared/generator/utils/hex'

self.addEventListener('message', async (event: MessageEvent) => {
  const filter = event.data
  if(typeof filter === 'object' && filter instanceof Uint8Array && filter.length > 1) {
    generate(filter)
  }
})

async function generate(filterView: Uint8Array) {
  const doesMatch = (key: Uint8Array) => {
    const offset = 1
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
      
      if (doesMatch(new Uint8Array(keypair.pubKey))) {
        postMessage({ id: ArrayBufferToHex(keypair.pubKey), mnemonic })
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}