'use client'

import hash from "@/lib/hash"
import { Button, Input } from "@nextui-org/react"
import { useRef, useState } from "react"
import { veramoAgent } from "@/lib/veramo"

export default function Component({ did }: { did: string}) {
  const serviceEndpointRef = useRef(null)
  const serviceDescriptionRef = useRef(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  async function addServiceToDidSubmit() {
    const serviceEndpoint = (serviceEndpointRef.current as any).value as string
    const description = (serviceDescriptionRef.current !== null) ? (serviceDescriptionRef.current as any).value as string : ''
    const id = `${did}#${await hash(serviceEndpoint + description)}`
    if (veramoAgent !== undefined) {
      await veramoAgent.didManagerAddService({did, service: {
        id, serviceEndpoint, description, type: 'LinkedDomains'
      }}).catch( (err) => {
        const errMsg = `could not add LinkedDomains service ${id} to ${did}`
        console.error(new Error(errMsg), err)
        setErrorMessage(errMsg)
      })
    }
  }

  return (
    <>
      <Input label="Endpoint" ref={serviceEndpointRef} required />
      <Input label="Description" ref={serviceDescriptionRef} />
      <Button color="primary" onClick={() => addServiceToDidSubmit()}>Add service</Button>
      {errorMessage && (
        <div className="text-danger p-2 border-solid border-b-2 border-danger break-words"> {errorMessage} </div>
      )}
    </>
  )
}