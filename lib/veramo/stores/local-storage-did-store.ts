import { EncryptedLocalStorage } from "@/lib/encrypted-local-storage"
import { IIdentifier } from "@veramo/core"
import { AbstractDIDStore } from "@veramo/did-manager"

export interface DidStorage {
  [alias: string]: IIdentifier
}
export class LocalStorageDidStore extends EncryptedLocalStorage<DidStorage> implements AbstractDIDStore {

  async importDID(did: IIdentifier): Promise<boolean> {
    try {
      return await this.atomicOperation(async () => {
        let storage = await this.getStorage()
        if (storage === null) {
          storage = {}
        }
        storage[did.did] = did
        await this.setStorage(storage)
        return true
      })
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async getDID(args: { did: string }): Promise<IIdentifier>
  async getDID(args: { alias: string; provider: string }): Promise<IIdentifier>
  async getDID(args: any): Promise<IIdentifier> {
    let storage = await this.getStorage()
    if (storage === null) {
      storage = {}
    }
    const identifiers = Object.values(storage)

    for (const identifier of identifiers) {
      if (args.did !== undefined && identifier.did === args.did) return identifier
      if (args.alias !== undefined && args.provider !== undefined && args.alias === identifier.alias && args.provider === identifier.provider) return identifier
    }
    throw new Error(`No identifiers match ${JSON.stringify(args, undefined, 2)}`)
  }

  async deleteDID(args: { did: string }): Promise<boolean> {
    try {
      return await this.atomicOperation(async () => {
        const storage = await this.getStorage()
        if (storage === null || storage[args.did] === undefined) {
          return false
        }
        delete storage[args.did]
        await this.setStorage(storage)
        return true
      })
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async listDIDs(args: { alias?: string | undefined; provider?: string | undefined }): Promise<IIdentifier[]> {
    const storage = await this.getStorage()
    if (storage === null) {
      return []
    }
    const identifiers = Object.values(storage)
    const filteredIdentifiers = identifiers.filter((identifier) => {
      if (args.alias === undefined, args.provider === undefined) {
        return true
      }
      if (args.alias !== undefined && args.provider !== undefined) {
        if (args.alias === identifier.alias && args.provider === identifier.provider) {
          return true
        }
        else {
          return false
        }
      }
      if (args.alias !== undefined && args.alias === identifier.alias) {
        return true
      }
      if (args.provider !== undefined && args.provider === identifier.provider) {
        return true
      }
      return false
    })
    return filteredIdentifiers
  }
}
