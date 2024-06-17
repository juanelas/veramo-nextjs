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

// Web3 key management system (metamask and Ethers)
import { Web3KeyManagementSystem } from '@veramo/kms-web3'

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
import { LocalStorageVcStore as VcStore } from './stores/local-storage-vc-store'
import { VerifiableCredentialManager } from './verifiable-credential-manager'

// Ethers
import { BrowserProvider, Eip1193Provider } from 'ethers'

export type VeramoAgent = TAgent<IKeyManager & IDIDManager & IResolver & ICredentialPlugin> & { context?: Record<string, any> }

export type MyVeramoAgent = VeramoAgent & { verifiableCredentialManager: VerifiableCredentialManager } & { clear: () => void } & { provider: BrowserProvider }

export interface AgentCreationOpts {
  forceOverwrite?: boolean
}

export async function myVeramoAgent(walletProvider: Eip1193Provider, kmsSecretKeyOrDeriveKeyOpts: CryptoKey | ArrayBufferLike | TypedArray | Buffer | JsonWebKey | DeriveKeyOpts, creationOpts?: AgentCreationOpts): Promise<MyVeramoAgent> {
  const forceOverwrite: boolean = creationOpts?.forceOverwrite ?? false
  const cryptoKey: CryptoKey = await toCryptoKey(kmsSecretKeyOrDeriveKeyOpts)

  const provider = new BrowserProvider(walletProvider)
  
  const registries = {
    mainnet: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b',
    sepolia: '0x03d5003bf0e79c5f5223588f347eba39afbc3818'
  }

  const stores = {
    'did-store': new DidStore('did-store', cryptoKey, forceOverwrite),
    'key-store': new KeyStore('key-store', cryptoKey, forceOverwrite),
    'vc-store': new VcStore('vc-store', cryptoKey, forceOverwrite)
  }
  
  const _agent = createAgent<
    IKeyManager & IDIDManager & IResolver & ICredentialPlugin
  >({
    plugins: [
      new KeyManager({
        store: stores['key-store'],
        kms: {
          eip1193: new Web3KeyManagementSystem({ eip1193: provider })
        }
      }),
      new DIDManager({
        store: stores['did-store'],
        defaultProvider: 'did:ethr',
        providers: {
          'did:ethr' : new EthrDIDProvider({
            defaultKms: 'eip1193',
            registry: registries['mainnet'],
            web3Provider: provider
          }),
          'did:ethr:sepolia' : new EthrDIDProvider({
            defaultKms: 'eip1193',
            registry: registries['sepolia'],
            web3Provider: provider
          })
        },
      }),
      new DIDResolverPlugin({
        resolver: new Resolver(getEthrDidResolver({ networks: [
          { 
            name: 'mainnet', 
            registry: registries['mainnet'],
            provider
          },
          { 
            name: 'sepolia', 
            registry: registries['sepolia'],
            provider
          }
        ] }))
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

  _agent.provider = provider

  return _agent as MyVeramoAgent
}
