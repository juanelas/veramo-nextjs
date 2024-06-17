import type { NavbarProps } from '@/components/Navbar'
import Navbar from '@/components/Navbar'
import { NextUIProvider } from "@nextui-org/react"
import { Web3Modal } from '../context/web3modal'

export const metadata = {
  title: process.env.NEXT_PUBLIC_PROJECT_NAME,
  description: process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION ?? ''
}

import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navBarProps: NavbarProps = {
    links: [
      {
        text: 'Home',
        url: '/'
      },
      {
        text: 'Wallet',
        url: '/wallet/ids'
      }
    ],
    navBarType: 'horizontal-navbar'
  }

  return (
    <html lang="en">
      <body>
        <NextUIProvider>
          <main className="container light text-foreground bg-background mx-auto">
            <Navbar {...navBarProps}></Navbar>
            <Web3Modal>{children}</Web3Modal>
          </main>
        </NextUIProvider>
      </body>
    </html>
  )
}
