'use client'

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

  if (!veramoInitialized.initialized) {
    return (
      <VeramoSetup setVeramoInitialized={setVeramoInitialized}></VeramoSetup>
    )
  }
  else {
    return (
      <div>
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