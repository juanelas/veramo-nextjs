'use client'

import { Card, CardBody, CardHeader, Divider, Image, Link } from "@nextui-org/react"

export default function Home() {
  return (
    <div className="flex">
      <Card className="mx-auto max-w-3xl" shadow="none">
        <CardHeader className="flex gap-3">
          <Image
            alt="veramo logo"
            height={40}
            radius="none"
            src="https://veramo.io/img/veramo.png"
            width={40}
          />
          <Image 
            alt="next logo"
            height={30}
            width={149}
            radius="none"
            src="/next.svg"
          />
          <div className="flex flex-col">
            <div className="text-lg mx-auto">In-browser Veramo SSI application using encrypted LocalStorage</div>
            <div className="mx-auto">
              <Link className="text-small text-default-500 mr-5" href="https://veramo.io" target="_blank">veramo.io</Link>
              <Link className="text-small text-default-500 ml-5" href="https://nextjs.org" target="_blank">nextjs.org</Link>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <p>An example of a simple SSI Wallet developed with <Link title="nextjs" href="https://nextjs.org">Next.js</Link> using the <Link title="Veramo Library" href="https://veramo.io/">Veramo Library</Link> for the SSI functionalities and the (encrypted) LocalStorage of the browser.</p>
        </CardBody>
      </Card>
    </div>
  )
}
