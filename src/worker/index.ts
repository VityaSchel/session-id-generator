import { generateKeypair, generateMnemonic } from '@/shared/generator/manager/account-manager'
import { hex } from '@/shared/generator/utils/hex'
import { MessageType } from '@/shared/sw-helpers'

const resultsChannel = new BroadcastChannel('id-results')
const metricsChannel = new BroadcastChannel('metrics')

let generating = false,
    filter: string | undefined

self.addEventListener('message', async (event: MessageEvent) => {
  if (typeof event.data === 'object' && 'type' in event.data) {
    if(event.data.type === MessageType.StartGenerating 
      && 'filter' in event.data && typeof event.data.filter === 'string') {
      generating = true
      filter = event.data.filter
      generate()
    } else if(event.data.type === MessageType.StopGenerating) {
      generating = false
    }
  }  
})

async function generate() {
  let generated = 0
  const interval = setInterval(() => {
    metricsChannel.postMessage(generated)
    generated = 0
  }, 1000)
  while(generating) {
    const mnemonic = await generateMnemonic()
    const keypair = await generateKeypair(mnemonic, 'english')
    generated++
    // channel.postMessage({ id: hex(keypair.pubKey), mnemonic })
  }
  clearInterval(interval)
}