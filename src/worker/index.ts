import { generateKeypair, generateMnemonic } from '@/shared/generator/manager/account-manager'
import { hex } from '@/shared/generator/utils/hex'

self.addEventListener('message', async (event: MessageEvent) => {
  const filter = event.data
  if(typeof filter === 'object' && filter instanceof Uint8Array) {
    generate(event.data.filter)
  }
})

async function generate(filterView: Uint8Array) {
  const doesMatch = (key: Uint8Array) => {
    for (let i = 0; i < filterView.length; i++) {
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
        postMessage({ id: hex(keypair.pubKey), mnemonic })
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}