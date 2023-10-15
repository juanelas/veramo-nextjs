'use client'

import type { NavbarProps } from '@/components/Navbar'
import Navbar from '@/components/Navbar'
import { NextUIProvider } from "@nextui-org/react"

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
        url: '/wallet'
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
            <div>{children}</div>
          </main>
        </NextUIProvider>
      </body>
    </html>
  )
}
