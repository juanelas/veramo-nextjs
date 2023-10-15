import { TypedArray } from "@juanelas/aes-gcm"
import * as base64 from '@juanelas/base64'

export default async function hash(a: string | ArrayBufferLike | TypedArray | Buffer): Promise<string> {
  const input = (typeof a === 'string') ? new TextEncoder().encode(a) : a
  return base64.encode((await crypto.subtle.digest('SHA-256', input)), true, false)
}