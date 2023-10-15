import { encode as base64encode } from "@juanelas/base64"
import { EncryptedLocalStorage } from "@/lib/encrypted-local-storage"
import { VerifiableCredential as W3CVerifiableCredential } from "@veramo/core"

export type VerifiableCredential = W3CVerifiableCredential & { id: string }
export interface VcStorage {
  [alias: string]: VerifiableCredential
}

export interface VcStoreFilter {
  issuerIds?: string[]
  subjectIds?: string[]
}

export interface VcStore {
  importVC(vc: W3CVerifiableCredential): Promise<string>
  deleteVC(args: { id: string }): Promise<boolean>
  getVC(args: { id: string }): Promise<VerifiableCredential>
  listVCs(args?: VcStoreFilter): Promise<VerifiableCredential[]>
}

export class LocalStorageVcStore extends EncryptedLocalStorage<VcStorage> implements VcStore {

  async importVC(vc: W3CVerifiableCredential): Promise<string> {
    return await this.atomicOperation(async () => {
      let storage = await this.getStorage()
      if (storage === null) {
        storage = {}
      }
      if (vc.id === undefined) {
        vc.id = base64encode(crypto.getRandomValues(new Uint8Array(16)))
      }
      storage[vc.id] = vc as VerifiableCredential
      await this.setStorage(storage)
      return vc.id
    })
  }

  async deleteVC(args: { id: string }): Promise<boolean> {
    return await this.atomicOperation(async () => {
      const storage = await this.getStorage()
      if (storage === null || storage[args.id] === undefined) {
        return false
      }
      delete storage[args.id]
      await this.setStorage(storage)
      return true
    })
  }

  async getVC(args: { id: string }): Promise<VerifiableCredential> {
    const storage = await this.getStorage()
    if (storage === null || storage[args.id] === undefined) {
      throw new Error(`No verifiable credential found with id ${args.id}`)
    }
    return storage[args.id]
  }

  async listVCs(args?: VcStoreFilter): Promise<VerifiableCredential[]> {
    const storage = await this.getStorage()
    if (storage === null) {
      return []
    }
    const vcs = Object.values(storage)
    const filteredIdentifiers = vcs.filter((vc) => {
      const vcIssuerId: string = (typeof vc.issuer === 'string') ? vc.issuer : vc.issuer.id
      const vcSubjectId: string | undefined = vc.credentialSubject.id

      if (args === undefined || (args.issuerIds === undefined && args.subjectIds === undefined)) {
        return true
      }
      if (args.subjectIds !== undefined && args.issuerIds !== undefined) {
        if (vcSubjectId !== undefined && args.subjectIds.includes(vcSubjectId) && args.issuerIds.includes(vcIssuerId)) {
          return true
        }
        return false
      }
      if (args.subjectIds !== undefined && vcSubjectId !== undefined && args.subjectIds.includes(vcSubjectId)) {
        return true
      }
      if (args.issuerIds !== undefined && args.issuerIds.includes(vcIssuerId)) {
        return true
      }
      return false
    })
    return filteredIdentifiers
  }
}