'use client'

import { deleteVeramoAgent, loadVeramoAgent, veramoConfigInLocalStorage } from '@/lib/veramo'
import { Button, CircularProgress, Input, Select, SelectItem } from '@nextui-org/react'
import { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from 'react'
import { useWeb3ModalProvider, useWeb3ModalAccount, useDisconnect } from '@web3modal/ethers/react'

export default function VeramoSetup({ setVeramoInitialized }: { setVeramoInitialized: Dispatch<SetStateAction<{ initialized: boolean }>> }) {
  const passwordRef = useRef(null)
  const passwordRepeatRef = useRef(null)

  const { isConnected } = useWeb3ModalAccount()
  const { disconnect } = useDisconnect()

  const [veramoConfFound, setVeramoConfFound] = useState<boolean>(false)
  const [walletConnected, setWalletConnected] = useState<boolean>(isConnected)

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error>()

  const { walletProvider } = useWeb3ModalProvider()

  async function checConfig() {
    setWalletConnected(isConnected)
    const confFound = veramoConfigInLocalStorage()
    setVeramoConfFound(confFound)
    if (loading) setLoading(false)
  }


  useEffect(() => {
    checConfig()
  }, [loading, error])

  function handleReset() {
    deleteVeramoAgent()
    disconnect()
    setWalletConnected(false)
    setVeramoConfFound(false)
    setLoading(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      const password = (passwordRef.current !== null) ? (passwordRef.current as any).value as string : ''
      const passwordRepeat = (passwordRepeatRef.current !== null) ? (passwordRepeatRef.current as any).value as string : ''

      if (password === '') {
        throw new Error('empty-password')
      }

      setLoading(true)

      if (!veramoConfFound && passwordRepeat !== password) {
        throw new Error('password-mismatch', { cause: 'passwords do not match' })
      }

      if ( walletProvider === undefined) {
        throw new Error('wallet-not-connected', { cause: 'Wallet not connected, please connect one'})
      }
      
      await loadVeramoAgent(walletProvider, { password, keyLength: 256 })

      console.info('veramo wallet succesfully initialized')

      setLoading(false)

      setVeramoInitialized({
        initialized: true
      })
    } catch (error) {
      console.error(error)
      setError(error as Error)
    }
  }

  if (loading) {
    return (
      <CircularProgress className="mx-auto scale-150 pt-5" size="lg" color="warning" aria-label="Loading..." />
    )
  } else if (!walletConnected) {
    return (
      <>
        <h2>Please connect your Web3 Wallet before proceeding:</h2>
        <w3m-connect-button />
      </>
    )
  } else if (veramoConfFound) {
    return (
      <>
        <h2>Existing wallet configuration found. Please input your password to use it</h2>
        <form onSubmit={handleSubmit}>
          <Input
            ref={passwordRef}
            isRequired
            type="password"
            label="Password for your encrypted storage"
            variant='bordered'
            id='password'
            name='password'
            className='m-3'
          />
          <Button color="primary" type='submit'>Load wallet</Button>
          <Button className="ml-4" color="danger" onClick={() => { handleReset() }}>Reset wallet</Button>
          {error && (
            <div className="text-danger p-2 border-solid border-b-2 border-danger break-words"> {`${error?.message}. ${error?.cause}`} </div>
          )}
        </form>
      </>
    )
  } else {
    return (
      <>
        <p className="text-large mb-2">Set a password for encrypt your wallet data</p>
        <form onSubmit={handleSubmit}>
          <Input
            ref={passwordRef}
            isRequired
            type="password"
            label="Password for your encrypted storage"
            variant='bordered'
            id='password'
            name='password'
            className='m-3'
          />
          <Input
            ref={passwordRepeatRef}
            isRequired
            type="password"
            label="Re-type your password"
            variant='bordered'
            id='password-repeat'
            name='password-repeat'
            className='m-3'
          />
          <Button type="submit" color="primary">Init Wallet</Button>
          {error && (
            <div className="text-danger p-2 border-solid border-b-2 border-danger break-words"> {`${error?.message}. ${error?.cause}`} </div>
          )}
        </form>
      </>
    )
  }
}

