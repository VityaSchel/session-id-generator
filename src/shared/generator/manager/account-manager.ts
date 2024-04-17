// CREDIT: Oxen team, Session Desktop client

import { fromHex, toHex } from '@/shared/generator/utils/string'
import { mnDecode, mnEncode } from './mnemonic-manager'
import { getSodiumRenderer } from '../sodium'
import { SessionKeyPair } from '@/shared/generator/keypairs'

/**
 * Might throw
 */
async function sessionGenerateKeyPair(seed: ArrayBuffer): Promise<SessionKeyPair> {
  const sodium = await getSodiumRenderer()

  const ed25519KeyPair = sodium.crypto_sign_seed_keypair(new Uint8Array(seed))
  const x25519PublicKey = sodium.crypto_sign_ed25519_pk_to_curve25519(ed25519KeyPair.publicKey)
  // prepend version byte (coming from `processKeys(raw_keys)`)
  const origPub = new Uint8Array(x25519PublicKey)
  const prependedX25519PublicKey = new Uint8Array(33)
  prependedX25519PublicKey.set(origPub, 1)
  prependedX25519PublicKey[0] = 5
  const x25519SecretKey = sodium.crypto_sign_ed25519_sk_to_curve25519(ed25519KeyPair.privateKey)

  // prepend with 05 the public key
  const x25519KeyPair = {
    pubKey: prependedX25519PublicKey.buffer,
    privKey: x25519SecretKey.buffer,
    ed25519KeyPair,
  }

  return x25519KeyPair
}

export const generateKeypair = async (
  mnemonic: string,
  mnemonicLanguage: string
): Promise<SessionKeyPair> => {
  let seedHex = mnDecode(mnemonic, mnemonicLanguage)
  // handle shorter than 32 bytes seeds
  const privKeyHexLength = 32 * 2
  if (seedHex.length !== privKeyHexLength) {
    seedHex = seedHex.concat('0'.repeat(32))
    seedHex = seedHex.substring(0, privKeyHexLength)
  }
  const seed = fromHex(seedHex)
  return sessionGenerateKeyPair(seed)
}

export async function generateMnemonic() {
  // Note: 4 bytes are converted into 3 seed words, so length 12 seed words
  // (13 - 1 checksum) are generated using 12 * 4 / 3 = 16 bytes.
  const seedSize = 16
  const seed = (await getSodiumRenderer()).randombytes_buf(seedSize)
  const hex = toHex(seed)
  return mnEncode(hex)
}