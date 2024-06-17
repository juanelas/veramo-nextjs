import { DeriveKeyOpts, TypedArray } from '@/lib/encrypted-local-storage'
import { AgentCreationOpts, MyVeramoAgent, myVeramoAgent } from './agent'
import { Eip1193Provider } from 'ethers'

export let veramoAgent: MyVeramoAgent | undefined

export async function loadVeramoAgent(walletProvider: Eip1193Provider, kmsSecretKey: CryptoKey | ArrayBufferLike | TypedArray | Buffer, creationOpts?: AgentCreationOpts): Promise<MyVeramoAgent>
export async function loadVeramoAgent(walletProvider: Eip1193Provider, deriveKeyOpts: DeriveKeyOpts, creationOpts?: AgentCreationOpts): Promise<MyVeramoAgent>
export async function loadVeramoAgent(walletProvider: Eip1193Provider, kmsSecretKeyOrDeriveKeyOpts: CryptoKey | ArrayBufferLike | TypedArray | Buffer | DeriveKeyOpts, creationOpts?: AgentCreationOpts): Promise<MyVeramoAgent>
export async function loadVeramoAgent(walletProvider: Eip1193Provider, kmsSecretKeyOrDeriveKeyOpts: CryptoKey | ArrayBufferLike | TypedArray | Buffer | DeriveKeyOpts, creationOpts?: AgentCreationOpts): Promise<MyVeramoAgent> {
  veramoAgent = await myVeramoAgent(walletProvider, kmsSecretKeyOrDeriveKeyOpts, creationOpts)
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
  return localStorage.getItem('did-store') !== null || localStorage.getItem('key-store') !== null || localStorage.getItem('vc-store') !== null
}

export function clearStorage(): void {
  localStorage.removeItem('did-store')
  localStorage.removeItem('key-store')
  localStorage.removeItem('vc-store')
}