import { getSodiumRenderer } from '@/worker/generator/sodium'
import { hex } from './generator/uint8array_to_hex'
import { mnEncode } from '@/worker/generator/manager/mnemonic-manager'

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

  const sodium = await getSodiumRenderer()

  // eslint-disable-next-line no-constant-condition
  while(true) {
    for(let i = 0; i < 4000; i++) {
      const seed = sodium.randombytes_buf(16)
      const seedForKeypair = new Uint8Array(32)
      seedForKeypair.set(seed)

      const ed25519KeyPair = sodium.crypto_sign_seed_keypair(seedForKeypair)
      const x25519PublicKey = sodium.crypto_sign_ed25519_pk_to_curve25519(ed25519KeyPair.publicKey)
      const prependedX25519PublicKey = new Uint8Array(33)
      prependedX25519PublicKey.set(x25519PublicKey, 1)
      prependedX25519PublicKey[0] = 5

      const sessionID = hex(prependedX25519PublicKey)

      if (doesMatch(sessionID)) {
        const mnemonic = mnEncode(hex(seed))
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