import { MessageType } from '@/shared/sw-helpers'

const resultsChannel = new BroadcastChannel('id-results')
const metricsChannel = new BroadcastChannel('metrics')

let generating = false,
    worker: Worker | undefined

self.addEventListener('message', async (event: MessageEvent) => {
  if (typeof event.data === 'object' && 'type' in event.data) {
    if(event.data.type === MessageType.StartGenerating 
      && 'filter' in event.data && typeof event.data.filter === 'object'
      && event.data.filter instanceof Uint8Array
    ) {
      if (generating) return
      generating = true
      worker = new Worker('/worker.js')
      worker.addEventListener('message', (event) => {
        if (event.data && typeof event.data === 'object'
          && 'id' in event.data && 'mnemonic' in event.data
          && typeof event.data.id === 'string' && typeof event.data.mnemonic === 'string'
        ) {
          resultsChannel.postMessage(event.data)
        }
      })
      worker.postMessage(event.data.filter)
    } else if(event.data.type === MessageType.StopGenerating) {
      generating = false
      worker?.terminate()
    }
  }
})
