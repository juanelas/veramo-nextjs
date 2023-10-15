'use client'

import { truncateObjStringProps } from "@/lib/truncate-obj-string-props"
import { veramoAgent } from "@/lib/veramo"
import { Accordion, AccordionItem, Button } from "@nextui-org/react"
import { useState } from "react"

export default function Component() {
  const [vcList, setVclist] = useState<JSX.Element[]>([])

  async function deleteVc(id: string) {
    if (veramoAgent !== undefined) {
      await veramoAgent.verifiableCredentialManager.deleteCredential(id)
      setVclist(await getVcList())
    }
  }

  async function getVcList(): Promise<JSX.Element[]> {
    if (veramoAgent === undefined) {
      return []
    }
    const vcs = await veramoAgent.verifiableCredentialManager.listCredentials()
    return await Promise.all(
      vcs.map(async (vc) => {
        const issuerId = (typeof vc.issuer === 'string') ? vc.issuer : vc.issuer.id
        const showFirstCharacters = 25
        const title = issuerId.slice(0, showFirstCharacters) + '... ⇒ ' + JSON.stringify(truncateObjStringProps(vc.credentialSubject, showFirstCharacters))
        const key = vc.id?.replace(/[^a-zA-Z0-9-]/g, '') // convert it to a valid key
        return (
          <AccordionItem key={key} aria-label={title} title={title}>
            <code><pre>{JSON.stringify(vc, undefined, 2)}</pre></code>
            <Button color="danger" onClick={() => deleteVc(vc.id)}>Delete VC</Button>
          </AccordionItem>
        )
      })
    )
  }

  getVcList().then((newIdList) => {
    if (newIdList.length !== vcList.length) {
      setVclist(newIdList)
    }
  }).catch(error => { console.log(error) })

  return (
    <Accordion variant="splitted">
      {vcList}
    </Accordion>
  )
}