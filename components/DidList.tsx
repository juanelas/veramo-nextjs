'use client'

import hash from "@/lib/hash"
import { veramoAgent } from "@/lib/veramo"
import { Accordion, AccordionItem, Button } from "@nextui-org/react"
import { useState } from "react"
import AddService from "./AddService"

export default function Component() {
  const [idList, setIdlist] = useState<JSX.Element[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')

  async function deleteIdentifier(did: string) {
    if (veramoAgent !== undefined) {
      if (await veramoAgent.didManagerDelete({ did })) {
        setIdlist(await getIdentifiersList())
      } else {
        const errMsg = 'could not delete did ' + did
        console.error(new Error(errMsg))
        setErrorMessage(errMsg)
      }
    }
  }

  async function getIdentifiersList(): Promise<JSX.Element[]> {
    if (veramoAgent === undefined) {
      return []
    }
    const accounts = await veramoAgent.provider.listAccounts()
    const network = await veramoAgent.provider.getNetwork()

    return await Promise.all(
      accounts.map(async (account) => {
        const did = 'did:ethr' + (network.name !== 'mainnet' ? ':' + network.name : '') + ':' + account.address
        const id = await hash(did)
        const didDoc = await veramoAgent?.resolveDid({ didUrl: did })
        if (didDoc?.didResolutionMetadata.error) {
          throw new Error(didDoc.didResolutionMetadata.error + (didDoc.didResolutionMetadata.message ? (' : ' + didDoc.didResolutionMetadata.message) : ''))
        }
        return (
          <AccordionItem key={id} aria-label={account.address} subtitle={did} title={account.address} className="overflow-hidden">
            <code><pre>{JSON.stringify(didDoc?.didDocument ?? {}, undefined, 2)}</pre></code>
            <div className="border-solid m-5 pl-3"><AddService did={did}></AddService></div>
            <Button color="danger" onClick={() => deleteIdentifier(did)}>Delete identifier</Button>
          </AccordionItem>
        )
      })
      // const identifiers = await veramoAgent.didManagerFind()
      // return await Promise.all(
      //   identifiers.map(async (identifier) => {
      //     const title = identifier.alias ?? identifier.did
      //     const id = await hash(identifier.did)
      //     const didDoc = await veramoAgent?.resolveDid({ didUrl: identifier.did })
      //     return (
      //       <AccordionItem key={id} aria-label={title} subtitle={identifier.did} title={title} className="overflow-hidden">
      //         <code><pre>{JSON.stringify(didDoc?.didDocument ?? {}, undefined, 2)}</pre></code>
      //         <div className="border-solid m-5 pl-3"><AddService did={identifier.did}></AddService></div>
      //         <Button color="danger" onClick={() => deleteIdentifier(identifier.did)}>Delete identifier</Button>
      //       </AccordionItem>
      //     )
      //   })
      // )
    )
  }

  getIdentifiersList().then((newIdList) => {
    if (newIdList.length !== idList.length) {
      setIdlist(newIdList)
    }
  }).catch(error => {
    setErrorMessage((error as Error).message + '. ' + ((error as Error).cause ?? ''))
    console.log(error)
  })

  return (
    <>
      <Accordion variant="splitted" className="mt-3">
        {idList}
      </Accordion>
      {errorMessage && (
        <div className="text-danger p-2 border-solid border-b-2 border-danger break-words"> {errorMessage} </div>
      )}
    </>
  )
}