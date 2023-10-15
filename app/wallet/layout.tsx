import Navbar, { NavbarProps } from "@/components/Navbar"

export default function DidstLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navBarProps: NavbarProps = {
    navBarType: 'vertical-navbar',
    links: [
      {
        text: 'Identifiers',
        url: '/wallet/ids'
      },
      {
        text: 'Verifiable Credentials',
        url: '/wallet/vcs'
      }
    ]
  }
  return (
    <div className="flex flex-row flex-wrap">
      <aside className="w-full sm:w-1/4 md:w-1/4 border-solid border-r-2 border-gray-200">
        <div className="sticky top-0 w-full">
          <Navbar {...navBarProps}></Navbar>
          {/* <SideMenu {...navBarProps}></SideMenu> */}
        </div>
      </aside>
      <main role="main" className="flex-none w-full sm:w-3/4 md:w-3/4 pl-3">
        {children}
      </main>
    </div>
  )
}
