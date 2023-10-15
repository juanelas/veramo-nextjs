import { EncryptedLocalStorage } from "@/lib/encrypted-local-storage"
import { encode as base64Encode } from "@juanelas/base64"
import { IKey, ManagedKeyInfo } from "@veramo/core"
import { AbstractKeyStore } from "@veramo/key-manager"

export interface KeyStorage {
  [kid: string]: IKey
}
export class LocalStorageKeyStore extends EncryptedLocalStorage<KeyStorage> implements AbstractKeyStore {

  async importKey(key: Partial<IKey>): Promise<boolean> {
    try {
      if (key.kid === undefined) {
        key.kid = base64Encode(crypto.getRandomValues(new Uint8Array(128)), true, false)
      }
      if (key.kms === undefined) {
        throw new Error('no kms')
      }
      if (key.meta === undefined) {
        throw new Error('no meta')
      }
      if (key.privateKeyHex !== undefined) {
        throw new Error('privateKeyHex on the key!')
      }
      if (key.publicKeyHex === undefined) {
        throw new Error('no publicKeyHex')
      }
      if (key.type === undefined) {
        throw new Error('no type')
      }
    } catch (error) {
      console.error(error)
      return false
    }

    return await this.atomicOperation(async () => {
      let storage = await this.getStorage()
      if (storage === null) {
        storage = {}
      }
      storage[key.kid as string] = key as IKey
      await this.setStorage(storage)
      return true
    })
  }

  async getKey(key: { kid: string }): Promise<IKey> {
    const storage = await this.getStorage()
    if (storage === null || storage[key.kid] === undefined) {
      throw new Error(`no key with kid ${key.kid} in storage`)
    }
    return storage[key.kid]
  }

  async deleteKey(key: { kid: string }): Promise<boolean> {
    return await this.atomicOperation(async () => {
      const storage = await this.getStorage()
      if (storage === null || storage[key.kid] === undefined) {
        return false
      }
      delete storage[key.kid]
      await this.setStorage(storage)
      return true
    })
  }

  async listKeys(args: {}): Promise<ManagedKeyInfo[]> {
    const storage = await this.getStorage()
    if (storage === null) {
      return []
    }
    return Object.values(storage)
  }
}
