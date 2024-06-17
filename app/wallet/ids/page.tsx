'use client'

import DidList from '@/components/DidList'
import VeramoSetup from "@/components/VeramoSetup"
import { veramoAgent } from "@/lib/veramo"
import { Button, CircularProgress } from "@nextui-org/react"
import { useRef, useState } from "react"

export default function Page() {
  const [veramoInitialized, setVeramoInitialized] = useState<{ initialized: boolean }>({ initialized: veramoAgent !== undefined })
  const [loading, setLoading] = useState<boolean>(false)
  const countRef = useRef(-1)

  async function createIdentifier() {
    if (veramoAgent !== undefined) {
      setLoading(true)
      const aliasPrefix = 'did-'
      if (countRef.current < 0) {
        const identifiers = await veramoAgent.didManagerFind()
        let count = 0
        for (const identifier of identifiers) {
          if (identifier.alias?.slice(0, aliasPrefix.length) === aliasPrefix) {
            const aliasNumber = Number(identifier.alias.split('-').slice(-1))
            if (aliasNumber > count) count = aliasNumber
          }
        }
        countRef.current = count + 1
      }
      await veramoAgent.didManagerCreate({ alias: aliasPrefix + String(countRef.current) })
      countRef.current = countRef.current + 1
      setLoading(false)
    }
  }

  if (!veramoInitialized.initialized) {
    return (
      <VeramoSetup setVeramoInitialized={setVeramoInitialized}></VeramoSetup>
    )
  }
  else if (loading) {
    return (
      <CircularProgress className="mx-auto scale-150 pt-5" size="lg" color="warning" aria-label="Loading..." />
    )
  } else {
    return (
      <>
        <w3m-button />
        <Button color="primary" onClick={createIdentifier}>Create new identifier</Button>
        <DidList></DidList>
      </>
    )
  }
}