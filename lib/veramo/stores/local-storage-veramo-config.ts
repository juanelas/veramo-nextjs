import { EncryptedLocalStorage } from "@/lib/encrypted-local-storage"

export interface VeramoConfigStorage {
  infuraProjectId: string
}

export interface VeramoConfigStore {
  getInfuraProjectId: () => Promise<string>
}

export class LocalStorageVeramoConfigStore extends EncryptedLocalStorage<VeramoConfigStorage> implements VeramoConfigStore {

  async getInfuraProjectId(): Promise<string> {
    const storage = await this.getStorage()
    if (storage === null) {
      throw new Error('invalid-veramo-config', { cause: 'could not load infuraProjectId from veramo config store' })
    }
    return storage.infuraProjectId
  }

  async setInfuraProjectId(id: string): Promise<void> {
    await this.setStorage({ infuraProjectId: id })
  }
}