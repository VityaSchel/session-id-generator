import libsodiumwrappers from 'libsodium-wrappers-sumo'

export type LibSodiumWrappers = typeof libsodiumwrappers;

export async function getSodiumRenderer(): Promise<LibSodiumWrappers> {
  await libsodiumwrappers.ready
  return libsodiumwrappers
}