'use client'

import DidList from '@/components/DidList'
import VcList from "@/components/VcList"
import VeramoSetup from "@/components/VeramoSetup"
import { veramoAgent } from "@/lib/veramo"
import { Button, Textarea } from "@nextui-org/react"
import { VerifiableCredential as W3CVerifiableCredential } from "@veramo/core"
import { useRef, useState } from "react"

export default function Page() {
  const textAreaRef = useRef(null)

  const [veramoInitialized, setVeramoInitialized] = useState<{ initialized: boolean }>({ initialized: veramoAgent !== undefined })
  const [errorMessage, setErrorMessage] = useState<string>('')

  async function importVc() {
    if (veramoAgent !== undefined) {
      try {
        const vcString = (textAreaRef.current as any).value as string
        if (vcString === '') {
          throw new Error('empty-vc')
        }
        let vc: W3CVerifiableCredential
        try {
          vc = JSON.parse(vcString)
        } catch (err) {
          throw new Error('invalid-json', { cause: 'JSON format is invalid'})
        }
        await veramoAgent.verifiableCredentialManager.importCredential(vc);
        (textAreaRef.current as any).value = ''
        setErrorMessage('')
        setVeramoInitialized({
          initialized: true
        }) // force rerendering
      } catch (error) {
        let errMsg = (error as Error).message
        if ((error as Error).cause !== undefined) errMsg += '. ' + (error as Error).cause
        setErrorMessage(errMsg)
        console.error(error)
      }
    }
  }
  async function createVc() {
    if (veramoAgent !== undefined) {
      try {
        const accounts = await veramoAgent.provider.listAccounts()
        const network = await veramoAgent.provider.getNetwork()
        if (accounts.length === 0) {
          throw new Error('No managed DIDs')
        }
        // const issuerDid = 'did:ethr' + (network.name !== 'mainnet' ? ':' + network.name : '') + ':' + accounts[0].address
        const provider = 'did:ethr' + (network.name !== 'mainnet' ? ':' + network.name : '')
        const issuerDid = provider+ ':' + accounts[0].address
        await veramoAgent.verifiableCredentialManager.issueCredential(issuerDid, {
          id: 'did:ethr:sepolia:0x034541f4895326772811828773e44d43dfca94e78a387080a7bad643c27d32ebd7',
          alumni: true
        })
        
        setErrorMessage('')
        setVeramoInitialized({
          initialized: true
        }) // force rerendering
      } catch (error) {
        let errMsg = (error as Error).message
        if ((error as Error).cause !== undefined) errMsg += '. ' + (error as Error).cause
        setErrorMessage(errMsg)
        console.error(error)
      }
    } else {
      setErrorMessage('Veramo agent not initialized')
    }
  }

  if (!veramoInitialized.initialized) {
    return (
      <VeramoSetup setVeramoInitialized={setVeramoInitialized}></VeramoSetup>
    )
  }
  else {
    return (
      <div>
        <Button color="primary" onClick={createVc}>Create a Verifiable Credential</Button>
        <Button color="primary" onClick={importVc}>Import Verifiable Credential</Button>
        {errorMessage && (
          <div className="bg-warning border-solid border-medium m-5 break-words"> {errorMessage} </div>
        )}
        <Textarea
          ref={textAreaRef}
          variant='bordered'
          placeholder="Paste your verifiable credential here"
          minRows={8}
        ></Textarea>
        <VcList></VcList>
      </div>
    )
  }
}