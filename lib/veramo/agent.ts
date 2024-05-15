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
import { AbstractIdentifierProvider, DIDManager } from '@veramo/did-manager'

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
import { DeriveKeyOpts, TypedArray, toCryptoKey } from '../encrypted-local-storage'
import { LocalStorageDidStore as DidStore } from './stores/local-storage-did-store'
import { LocalStorageKeyStore as KeyStore } from './stores/local-storage-key-store'
import { LocalStoragePrivateKeyStore as PrivateKeyStore } from './stores/local-storage-private-key-store'
import { LocalStorageVcStore as VcStore } from './stores/local-storage-vc-store'
import { LocalStorageVeramoConfigStore as VeramoConfigStore } from './stores/local-storage-veramo-config'
import { VerifiableCredentialManager } from './verifiable-credential-manager'

export type VeramoAgent = TAgent<IKeyManager & IDIDManager & IResolver & ICredentialPlugin> & { context?: Record<string, any> }

export type MyVeramoAgent = VeramoAgent & { verifiableCredentialManager: VerifiableCredentialManager } & { clear: () => void } & { infuraProjectId: string } & { ethereumNetwork: string }

export interface AgentCreationOpts {
  infuraProjectId: string
  network: string
  forceOverwrite?: boolean
}

export async function myVeramoAgent(kmsSecretKeyOrDeriveKeyOpts: CryptoKey | ArrayBufferLike | TypedArray | Buffer | JsonWebKey | DeriveKeyOpts, creationOpts?: AgentCreationOpts): Promise<MyVeramoAgent> {
  const forceOverwrite: boolean = creationOpts?.forceOverwrite ?? false
  const cryptoKey: CryptoKey = await toCryptoKey(kmsSecretKeyOrDeriveKeyOpts)

  const veramoConfigStore: VeramoConfigStore = new VeramoConfigStore('veramo-config-store', cryptoKey, forceOverwrite)

  let infuraProjectId: string
  let ethereumNetwork: string
  try {
    infuraProjectId = await veramoConfigStore.getInfuraProjectId()
    ethereumNetwork = await veramoConfigStore.getEthereumNetwork()
  } catch (error) {
    if (creationOpts?.infuraProjectId !== undefined && creationOpts?.network !== undefined) {
      infuraProjectId = creationOpts.infuraProjectId
      ethereumNetwork = creationOpts.network
      await veramoConfigStore.setStorage({ infuraProjectId, ethereumNetwork })
    } else {
      throw new Error('missing infuraProjectId or Ethereum Network', { cause: 'in order to create a new agent you MUST provide an infuraProjectId and an Ethereum network' })
    }
  }

  const stores = {
    'did-store': new DidStore('did-store', cryptoKey, forceOverwrite),
    'key-store': new KeyStore('key-store', cryptoKey, forceOverwrite),
    'private-key-store': new PrivateKeyStore('private-key-store', cryptoKey, forceOverwrite),
    'vc-store': new VcStore('vc-store', cryptoKey, forceOverwrite),
    'veramo-config-store': veramoConfigStore
  }

  const defaultProvider = 'did:ethr:' + ethereumNetwork
  const providers: Record<string, AbstractIdentifierProvider> = {}
  providers[defaultProvider] = new EthrDIDProvider({
    defaultKms: 'local',
    network: ethereumNetwork,
    rpcUrl: `https://${ethereumNetwork}.infura.io/v3/${infuraProjectId}`,
    registry: ethereumNetwork === 'mainnet' ? '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b' : '0x03d5003bf0e79c5f5223588f347eba39afbc3818'
  })
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
        defaultProvider,
        providers
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
  _agent.ethereumNetwork = ethereumNetwork

  return _agent as MyVeramoAgent
}
