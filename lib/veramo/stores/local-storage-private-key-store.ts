import { EncryptedLocalStorage } from '@/lib/encrypted-local-storage'
import { encode as base64Encode } from '@juanelas/base64'
import type { AbstractPrivateKeyStore, ImportablePrivateKey, ManagedPrivateKey } from '@veramo/key-manager'

export interface PrivateKeyStorage {
  [alias: string]: ManagedPrivateKey
}

export class LocalStoragePrivateKeyStore extends EncryptedLocalStorage<PrivateKeyStorage> implements AbstractPrivateKeyStore {

  async importKey(key: ImportablePrivateKey): Promise<ManagedPrivateKey> {
    let managedPrivateKey: ManagedPrivateKey = {
      alias: key.alias ?? base64Encode(crypto.getRandomValues(new Uint8Array(128)), true, false),
      type: key.type,
      privateKeyHex: key.privateKeyHex
    }

    await this.atomicOperation(async () => {
      let storage = await this.getStorage()
      if (storage === null) {
        storage = {}
      }
      storage[managedPrivateKey.alias] = managedPrivateKey
      await this.setStorage(storage)
    })

    return managedPrivateKey
  }

  async getKey(key: { alias: string }): Promise<ManagedPrivateKey> {
    const storage = await this.getStorage()
    if (storage === null || storage[key.alias] === undefined) {
      throw new Error(`no key with alias ${key.alias} in storage`)
    }
    return storage[key.alias]
  }

  async deleteKey(key: { alias: string }): Promise<boolean> {
    return await this.atomicOperation(async () => {
      const storage = await this.getStorage()
      if (storage === null || storage[key.alias] === undefined) {
        return false
      }
      delete storage[key.alias]
      await this.setStorage(storage)
      return true
    })
  }

  async listKeys(args: {}): Promise<ManagedPrivateKey[]> {
    const storage = await this.getStorage()
    if (storage === null) {
      return []
    }
    return Object.values(storage)
  }
}
