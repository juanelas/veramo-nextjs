import type { ICredentialPlugin, TAgent, VerifiableCredential as W3cVerifiableCredential } from "@veramo/core"
import type { VcStore, VcStoreFilter, VerifiableCredential } from "./stores/local-storage-vc-store"

export class VerifiableCredentialManager {
  store: VcStore
  agent: TAgent<ICredentialPlugin>

  constructor(props: { store: VcStore, agent: TAgent<ICredentialPlugin> }) {
    this.store = props.store
    this.agent = props.agent
  }
  async verifyCredential(id: string, opts?: VcStoreFilter): Promise<void>
  async verifyCredential(vc: W3cVerifiableCredential, opts?: VcStoreFilter): Promise<void>
  async verifyCredential(idOrVc: string | W3cVerifiableCredential, opts?: VcStoreFilter): Promise<void> {
    const vc = (typeof idOrVc === 'string') ? await this.store.getVC({ id: idOrVc }) : idOrVc
    const { verified, error } = await this.agent.verifyCredential({ credential: vc }).catch((reason) => {
      throw new Error('verification-failed')
    })
    if (!verified) {
      if (error !== undefined) {
        throw new Error('verification-failed', { cause: error.message })
      } else {
        throw new Error('verification-failed')
      }
    }
    if (opts !== undefined) {
      const vcIssuerId: string = (typeof vc.issuer === 'string') ? vc.issuer : vc.issuer.id
      const vcSubjectId: string | undefined = vc.credentialSubject.id

      if (opts.issuerIds !== undefined && !opts.issuerIds.includes(vcIssuerId)) {
        throw new Error('issuer-not-expected', {
          cause: 'Issuer id in the credential does not match the expected id\n' +
            `vc issuerId: ${vcIssuerId}\n` +
            `expected issuerId is one of: ${JSON.stringify(opts.issuerIds)}`
        })
      }
      if (opts.subjectIds !== undefined && (vcSubjectId === undefined || !opts.subjectIds.includes(vcSubjectId))) {
        throw new Error('subject-not-expected', {
          cause: 'Subject id in the credential does not match the expected id\n' +
            `vc subjectId: ${vcSubjectId ?? '<empty>'}\n` +
            `expected subjectId  is one of: ${JSON.stringify(opts.subjectIds)}`
        })
      }
    }
  }

  async importCredential(vc: W3cVerifiableCredential, filter?: VcStoreFilter): Promise<string> {
    await this.verifyCredential(vc, filter)
    return await this.store.importVC(vc)
  }

  async deleteCredential(id: string): Promise<void> {
    const deleted = await this.store.deleteVC({ id })
    if (!deleted) {
      throw new Error('not-found', { cause: `Could not delete '${id}'` })
    }
  }

  async listCredentials(getById: { id: string }): Promise<VerifiableCredential>
  async listCredentials(filter?: VcStoreFilter): Promise<VerifiableCredential[]>
  async listCredentials(getByIdOrFilter?: { id: string } | VcStoreFilter): Promise<VerifiableCredential | VerifiableCredential[]> {
    const id = (getByIdOrFilter !== undefined && (getByIdOrFilter as any).id !== undefined) ? (getByIdOrFilter as any).id : undefined
    if (id !== undefined) {
      return this.store.getVC({ id })
    } else {
      const filter = getByIdOrFilter as VcStoreFilter
      return this.store.listVCs(filter)
    }
  }
}