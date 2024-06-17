// context/web3modal.tsx

'use client'

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { Chain } from '@web3modal/scaffold-utils/ethers'

// 1. WalletConnect Cloud project name and ID

export const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME ?? ''
if (projectName === '') {
    throw new Error('Please set NEXT_PUBLIC_PROJECT_NAME in your .env.local file')
}
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID ?? ''
if (projectId === '') {
    throw new Error('Please set NEXT_PUBLIC_PROJECT_ID in your .env.local file')
}

// 2. Set chains
const chains: Chain[] = [
    {
        chainId: 1,
        name: 'Ethereum Mainnet',
        currency: 'ETH',
        explorerUrl: 'https://etherscan.io',
        rpcUrl: 'https://cloudflare-eth.com'
    },
    {
        chainId: 11155111,
        name: 'Sepolia TestNet',
        currency: 'ETH',
        explorerUrl: 'https://sepolia.etherscan.io',
        rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
    }
]

// 3. Create a metadata object
const metadata = {
    name: projectName,
    description: 'Web3Modal Example',
    url: 'https://web3modal.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
    /*Required*/
    metadata,

    /*Optional*/
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: false, // true by default
    //   rpcUrl: '...', // used for the Coinbase SDK
    //   defaultChainId: 1, // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
createWeb3Modal({
    ethersConfig,
    chains,
    projectId,
    enableAnalytics: false, // Optional - defaults to your Cloud configuration
    enableOnramp: false // Optional - false as default
})

export function Web3Modal<T>({ children }: { children: T }): T {
    return children
}
