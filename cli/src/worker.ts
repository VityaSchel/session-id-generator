import sodium from 'libsodium-wrappers-sumo'
import { encode } from '@session.js/mnemonic'
import { hex } from './utils'

declare var self: Worker;

self.addEventListener('message', async (event: MessageEvent) => {
  const filter = event.data
  if (typeof filter === 'string' && filter.length > 0) {
    generate(filter)
  }
})

async function generate(filter: string) {
  await sodium.ready

  let lastTime = performance.now()

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const batch = batchGenerate()
    await new Promise(resolve => setTimeout(resolve, 0))
    for (let i = 0; i < batch.sessionIDs.length; i++) {
      const sessionID = batch.sessionIDs[i]
      const seed = batch.seeds[i]
      if (check(sessionID, filter)) {
        const mnemonic = encode(hex(seed))
        postMessage({ type: 0, id: '05' + sessionID, mnemonic })
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }
    const now = performance.now()
    postMessage({ type: 1, delta: now - lastTime })
    lastTime = now
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

const check = (plain: string, filter: string) => {
  const m = filter.length
  const n = plain.length

  const dp = Array(m + 1).fill(false).map(() => Array(n + 1).fill(false))
  dp[0][0] = true

  for (let i = 1; i <= m; i++) {
    if (filter[i - 1] === '*') {
      dp[i][0] = dp[i - 1][0]
    }
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (filter[i - 1] === plain[j - 1] || filter[i - 1] === '?') {
        dp[i][j] = dp[i - 1][j - 1]
      } else if (filter[i - 1] === '*') {
        dp[i][j] = dp[i - 1][j] || dp[i][j - 1]
      }
    }
  }

  for (let j = 0; j <= n; j++) {
    if (dp[m][j]) {
      return true
    }
  }

  return false
}

function batchGenerate() {
  const sessionIDs = new Array<string>(4000)
  const seeds = new Array<Uint8Array>(4000)
  const seedForKeypair = new Uint8Array(32)

  for (let i = 0; i < 4000; i++) {
    const seed = sodium.randombytes_buf(16)
    seedForKeypair.set(seed)

    const ed25519KeyPair = sodium.crypto_sign_seed_keypair(seedForKeypair)
    const x25519PublicKey = sodium.crypto_sign_ed25519_pk_to_curve25519(ed25519KeyPair.publicKey)

    sessionIDs[i] = hex(x25519PublicKey)
    seeds[i] = seed
  }

  return {
    sessionIDs,
    seeds
  }
}