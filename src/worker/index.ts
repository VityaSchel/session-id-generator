import { generateKeypair, generateMnemonic } from '@/shared/generator/manager/account-manager'
import { hex } from '@/shared/generator/utils/hex'
import { MessageType } from '@/shared/sw-helpers'

const resultsChannel = new BroadcastChannel('id-results')
const metricsChannel = new BroadcastChannel('metrics')

let generating = false,
    filter: string | undefined

const controller = new AbortController()

self.addEventListener('message', async (event: MessageEvent) => {
  if (typeof event.data === 'object' && 'type' in event.data) {
    if(event.data.type === MessageType.StartGenerating 
      && 'filter' in event.data && typeof event.data.filter === 'string') {
      if (generating) return
      generating = true
      filter = event.data.filter
      generate({ abort: controller.signal })
    } else if(event.data.type === MessageType.StopGenerating) {
      generating = false
      controller.abort()
    }
  }  
})

async function generate({ abort }: {
  abort: AbortSignal
}) {
  let generated = 0
  const interval = setInterval(() => {
    metricsChannel.postMessage(generated)
    console.log('generated', generated)
    generated = 0
  }, 1000)
  
  while(!abort.aborted) {
    const mnemonic = await generateMnemonic()
    const keypair = await generateKeypair(mnemonic, 'english')
    generated++
    // if(generated % 100) {
    //   await new Promise(resolve => setTimeout(resolve, 0))
    // }
    // channel.postMessage({ id: hex(keypair.pubKey), mnemonic })
  }
  console.log(generated)
  clearInterval(interval)
}