const byteToHex: string[] = []

for (let n = 0; n <= 0xff; ++n) {
  const hexOctet = n.toString(16).padStart(2, '0')
  byteToHex.push(hexOctet)
}

export function hex(arrayBuffer: Uint8Array): string {
  const buff = new Uint8Array(arrayBuffer)
  const hexOctets = new Array(buff.length)

  for (let i = 0; i < buff.length; ++i)
    hexOctets[i] = byteToHex[buff[i]]

  return hexOctets.join('')
}