'use client'

import { deleteVeramoAgent, loadVeramoAgent, veramoConfigInLocalStorage } from '@/lib/veramo'
import { Button, CircularProgress, Input, Select, SelectItem } from '@nextui-org/react'
import { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from 'react'

export default function VeramoSetup({ setVeramoInitialized }: { setVeramoInitialized: Dispatch<SetStateAction<{ initialized: boolean }>> }) {
  const passwordRef = useRef(null)
  const passwordRepeatRef = useRef(null)
  const infuraProjectIdRef = useRef(null)
  const networkRef = useRef(null)

  const [veramoConfFound, setVeramoConfFound] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error>()

  async function checkForVeramoConfig() {
    const confFound = veramoConfigInLocalStorage()
    setVeramoConfFound(confFound)
    if (loading) setLoading(false)
  }

  useEffect(() => {
    checkForVeramoConfig()
  }, [loading, error])

  function handleReset() {
    deleteVeramoAgent()
    setVeramoConfFound(false)
    setLoading(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      const password = (passwordRef.current !== null) ? (passwordRef.current as any).value as string : ''
      const passwordRepeat = (passwordRepeatRef.current !== null) ? (passwordRepeatRef.current as any).value as string : ''
      const infuraProjectId = (infuraProjectIdRef.current !== null) ? (infuraProjectIdRef.current as any).value as string : ''
      const network = (networkRef.current !== null) ? (networkRef.current as any).value as string : ''

      if (password === '') {
        throw new Error('empty-password')
      }

      setLoading(true)

      if (infuraProjectId === '') {
        await loadVeramoAgent({ password, keyLength: 256 })
      } else {
        if (passwordRepeat === undefined || passwordRepeat !== password) {
          throw new Error('password-mismatch', { cause: 'passwords do not match' })
        }
        await loadVeramoAgent({ password, keyLength: 256 }, { infuraProjectId, network }).catch(err => {
          console.error(err)
          throw new Error('veramo-setup-failed')
        })
      }
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
  } else if (veramoConfFound) {
    return (
      <>
        <h2>Wallet configuration found. Please input your password to use it</h2>
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
        <p className="text-large mb-2">Initialize your wallet</p>
        <form onSubmit={handleSubmit}>
          <Select
            ref={networkRef}
            isRequired
            label="Ethereum network"
            placeholder="Ethereum network"
            defaultSelectedKeys={["mainnet"]}
            id='ethereum-network'
            name='ethereum-network'
            className="m-3"
          >
            <SelectItem key="mainnet" value="mainnet">
              mainnet
            </SelectItem>
            <SelectItem key="sepolia" value="sepolia">
              sepolia testnet
            </SelectItem>
          </Select>
          <Input
            ref={infuraProjectIdRef}
            isRequired
            type="text"
            label="INFURA Project ID"
            variant='bordered'
            id='infura-project-id'
            name='infura-project-id'
            className='m-3'
          />
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

