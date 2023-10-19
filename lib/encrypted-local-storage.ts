import { Ciphertext, Pbkdf2Parameters, TypedArray, aesKeyLength, decrypt, deriveKey, encrypt, importKey } from '@juanelas/aes-gcm'
import { AsyncLock } from './async-lock'

export type { TypedArray } from '@juanelas/aes-gcm'

export interface DeriveKeyOpts {
  password: string
  keyLength: aesKeyLength
  pbkdf2Params?: Pbkdf2Parameters
}
export class EncryptedLocalStorage<T> {
  name: string
  private key!: CryptoKey
  private _lock: AsyncLock
  private _atomicContext: boolean
  private _initialized: Promise<void>

  constructor(name: string, secretKey: CryptoKey | ArrayBufferLike | TypedArray | Buffer | JsonWebKey, force?: boolean)
  constructor(name: string, deriveKeyOpts: DeriveKeyOpts, force?: boolean)
  constructor(name: string, secreKeyOrDeriveKeyOpts: CryptoKey | ArrayBufferLike | TypedArray | Buffer | JsonWebKey | DeriveKeyOpts, force?: boolean)
  constructor(name: string, secreKeyOrDeriveKeyOpts: CryptoKey | ArrayBufferLike | TypedArray | Buffer | JsonWebKey | DeriveKeyOpts, force: boolean = false) {
    this.name = name
    this._lock = new AsyncLock()
    this._atomicContext = false
    this._initialized = new Promise((resolve, reject) => {
      this._init(secreKeyOrDeriveKeyOpts, force).then(() => {
        resolve()
      }).catch((reason) => {
        reject(reason)
      })
    })
  }

  private async _init(keyOrDeriveKeyOpts: CryptoKey | ArrayBufferLike | TypedArray | Buffer | JsonWebKey | DeriveKeyOpts, force: boolean) {
    this.key = await toCryptoKey(keyOrDeriveKeyOpts)
    await this._initStorage(force)
  }

  private async _initStorage(force: boolean): Promise<void> {
    try {
      await this._getStorage()
    } catch (error) {
      if (!force) throw error
      localStorage.removeItem(this.name)
    }
  }

  private async _getLock() {
    return await this._lock.acquire()
  }

  private _releaseLock() {
    this._lock.release()
  }

  private async _getStorage(): Promise<T | null> {
    let storageStr = localStorage.getItem(this.name)
    if (storageStr === null) return null

    const encryptedStorage = Ciphertext.fromJSON(storageStr)
    try {
      const decryptedBuf = await decrypt(encryptedStorage, this.key)
      const decryptedStr = (new TextDecoder()).decode(decryptedBuf)
      return JSON.parse(decryptedStr)
    } catch (error) {
      console.error(error)
      throw new Error('bad-decrypt', { cause: 'Cannot decrypt with provided key' })
    }
  }

  async getStorage(): Promise<T | null> {
    await this._initialized
    if (this._atomicContext) return await this._getStorage()

    return await this.atomicOperation(async () => {
      return await this._getStorage()
    })
  }

  private async _setStorage(jsonStringifiable: T): Promise<void> {
    const storageStr = JSON.stringify(jsonStringifiable)
    const storageBuf = (new TextEncoder()).encode(storageStr)
    const ciphertex = await encrypt(storageBuf, this.key)
    localStorage.setItem(this.name, JSON.stringify(ciphertex))
  }

  async setStorage(jsonStringifiable: T): Promise<void> {
    await this._initialized
    if (this._atomicContext) return this._setStorage(jsonStringifiable)

    return await this.atomicOperation(async () => {
      return this._setStorage(jsonStringifiable)
    })
  }

  async deleteStorage(): Promise<void> {
    await this._initialized
    localStorage.removeItem(this.name)
  }

  async atomicOperation<P>(fn: () => Promise<P>): Promise<P> {
    await this._initialized
    await this._getLock()
    this._atomicContext = true
    try {
      return await fn()
    } finally {
      this._atomicContext = false
      this._releaseLock()
    }
  }
}

export async function toCryptoKey(key: CryptoKey | ArrayBufferLike | TypedArray | Buffer | JsonWebKey | DeriveKeyOpts): Promise<CryptoKey> {
  const deriveKeyOpts = key as DeriveKeyOpts

  if (deriveKeyOpts.password !== undefined) {
    if (deriveKeyOpts.pbkdf2Params === undefined) {
      deriveKeyOpts.pbkdf2Params = { salt: new Uint8Array(16) }
    } else if (deriveKeyOpts.pbkdf2Params.salt === undefined) {
      deriveKeyOpts.pbkdf2Params.salt = new Uint8Array(16)
    }
    return (await deriveKey(deriveKeyOpts.password, deriveKeyOpts.keyLength, false, deriveKeyOpts.pbkdf2Params)).key
  } else if (key instanceof CryptoKey) {
    return key
  } else {
    const key2 = key as ArrayBufferLike | TypedArray | Buffer | JsonWebKey
    return await importKey(key2)
  }
}
