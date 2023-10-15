// Core interfaces
import {
  ICredentialPlugin,
  IDIDManager,
  IKeyManager,
  IResolver,
  TAgent,
  createAgent
} from '@veramo/core'

// Core identity manager plugin
import { DIDManager } from '@veramo/did-manager'

// Ethr did identity provider
import { EthrDIDProvider } from '@veramo/did-provider-ethr'

// Core key manager plugin
import { KeyManager } from '@veramo/key-manager'

// Custom key management system for RN
import { KeyManagementSystem } from '@veramo/kms-local'

// W3C Verifiable Credential plugin
import { CredentialPlugin } from '@veramo/credential-w3c'

// Custom resolvers
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as getEthrDidResolver } from 'ethr-did-resolver'

// Storage plugin
import { DeriveKeyOpts, TypedArray } from '../encrypted-local-storage'
import { LocalStorageDidStore as DidStore } from './stores/local-storage-did-store'
import { LocalStorageKeyStore as KeyStore } from './stores/local-storage-key-store'
import { LocalStoragePrivateKeyStore as PrivateKeyStore } from './stores/local-storage-private-key-store'
import { LocalStorageVcStore as VcStore } from './stores/local-storage-vc-store'
import { LocalStorageVeramoConfigStore as VeramoConfigStore } from './stores/local-storage-veramo-config'
import { VerifiableCredentialManager } from './verifiable-credential-manager'

export type VeramoAgent = TAgent<IKeyManager & IDIDManager & IResolver & ICredentialPlugin> & { context?: Record<string, any> }

export type MyVeramoAgent = VeramoAgent & { verifiableCredentialManager: VerifiableCredentialManager } & { clear: () => void } & { infuraProjectId: string }

export interface AgentCreationOpts {
  infuraProjectId: string
  forceOverwrite?: boolean
}

export async function myVeramoAgent(kmsSecretKeyOrDeriveKeyOpts: CryptoKey | ArrayBufferLike | TypedArray | Buffer | JsonWebKey | DeriveKeyOpts, creationOpts?: AgentCreationOpts): Promise<MyVeramoAgent> {
  const forceOverwrite: boolean = creationOpts?.forceOverwrite ?? false

  const veramoConfigStore: VeramoConfigStore = new VeramoConfigStore('veramo-config-store', kmsSecretKeyOrDeriveKeyOpts, forceOverwrite)

  let infuraProjectId: string
  try {
    infuraProjectId = await veramoConfigStore.getInfuraProjectId()
  } catch (error) {
    if (creationOpts?.infuraProjectId !== undefined) {
      infuraProjectId = creationOpts.infuraProjectId
      await veramoConfigStore.setInfuraProjectId(infuraProjectId)
    } else {
      throw new Error('missing-infuraProjectId', { cause: 'in order to create a new agent you MUST provide an infuraProjectId' })
    }
  }

  const stores = {
    'did-store': new DidStore('did-store', veramoConfigStore.key, forceOverwrite),
    'key-store': new KeyStore('key-store', veramoConfigStore.key, forceOverwrite),
    'private-key-store': new PrivateKeyStore('private-key-store', veramoConfigStore.key, forceOverwrite),
    'vc-store': new VcStore('vc-store', veramoConfigStore.key, forceOverwrite),
    'veramo-config-store': veramoConfigStore
  }

  const _agent = createAgent<
    IKeyManager & IDIDManager & IResolver & ICredentialPlugin
  >({
    plugins: [
      new KeyManager({
        store: stores['key-store'],
        kms: {
          local: new KeyManagementSystem(stores['private-key-store'])
        }
      }),
      new DIDManager({
        store: stores['did-store'],
        defaultProvider: 'did:ethr:goerli',
        providers: {
          'did:ethr:goerli': new EthrDIDProvider({
            defaultKms: 'local',
            network: 'goerli',
            rpcUrl: 'https://goerli.infura.io/v3/' + infuraProjectId
          })
        }
      }),
      new DIDResolverPlugin({
        resolver: new Resolver(getEthrDidResolver({ infuraProjectId }))
      }),
      new CredentialPlugin()
    ]
  }) as Partial<MyVeramoAgent> & VeramoAgent

  _agent.verifiableCredentialManager = new VerifiableCredentialManager({ store: stores['vc-store'], agent: _agent })

  _agent.clear = () => {
    Object.keys(stores).forEach((storageItem) => {
      localStorage.removeItem(storageItem)
    })
  }

  _agent.infuraProjectId = infuraProjectId

  return _agent as MyVeramoAgent
}
