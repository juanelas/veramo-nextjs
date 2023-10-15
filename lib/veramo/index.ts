import { DeriveKeyOpts, TypedArray } from '@/lib/encrypted-local-storage'
import { AgentCreationOpts, MyVeramoAgent, myVeramoAgent } from './agent'

export let veramoAgent: MyVeramoAgent | undefined

export async function loadVeramoAgent(kmsSecretKey: CryptoKey | ArrayBufferLike | TypedArray | Buffer, creationOpts?: AgentCreationOpts): Promise<MyVeramoAgent>
export async function loadVeramoAgent(deriveKeyOpts: DeriveKeyOpts, creationOpts?: AgentCreationOpts): Promise<MyVeramoAgent>
export async function loadVeramoAgent(kmsSecretKeyOrDeriveKeyOpts: CryptoKey | ArrayBufferLike | TypedArray | Buffer | DeriveKeyOpts, creationOpts?: AgentCreationOpts): Promise<MyVeramoAgent>
export async function loadVeramoAgent(kmsSecretKeyOrDeriveKeyOpts: CryptoKey | ArrayBufferLike | TypedArray | Buffer | DeriveKeyOpts, creationOpts?: AgentCreationOpts): Promise<MyVeramoAgent> {
  veramoAgent = await myVeramoAgent(kmsSecretKeyOrDeriveKeyOpts, creationOpts)
  return veramoAgent
}

export function deleteVeramoAgent(): void {
  if (veramoAgent !== undefined) {
    veramoAgent.clear()
    veramoAgent = undefined
  } else {
    clearStorage()
  }
}

export function veramoConfigInLocalStorage(): boolean {
  return localStorage.getItem('veramo-config-store') !== null
}

export function clearStorage(): void {
  localStorage.removeItem('did-store')
  localStorage.removeItem('key-store')
  localStorage.removeItem('private-key-store')
  localStorage.removeItem('vc-store')
  localStorage.removeItem('veramo-config-store')
}