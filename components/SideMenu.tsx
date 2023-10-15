'use client'

import { Listbox, ListboxItem } from "@nextui-org/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export interface MenuLink {
  key?: string
  text: string
  url: string
}
export interface MenuConfig {
  links: MenuLink[]
  activeKey?: React.Key
}

function getActiveKey(links: Required<MenuLink>[]): React.Key | undefined {
  let activeKeyFound: boolean = false
  let activeKey: React.Key | undefined
  const pathname = usePathname()
  links.forEach((link) => {
    if (link.url === pathname) {
      if (activeKeyFound) { // More than one match, let us remove the active key
        activeKey = undefined
      } else {
        activeKeyFound = true
        activeKey = link.key
      }
    }
  })
  return activeKey
}

export default function SideMenu({ links, activeKey }: MenuConfig) {
  function getLinksList(props: { links: MenuLink[] }) {
    return props.links.map((link, index) => {
      const key = link.key ?? String(index)
      return (
        <ListboxItem key={key} >
          <Link href={link.url} onClick={() => { setSelectedKeys([key]) }}>{link.text}</Link>
        </ListboxItem>
      )

    })
  }

  const pageLinks = links.map<Required<MenuLink>>((link, index) => {
    const key = link.key ?? String(index)
    return {
      key,
      url: link.url,
      text: link.text
    }
  })

  const selectedKey = activeKey ?? getActiveKey(pageLinks)
  const _selectedKeys = (selectedKey !== undefined) ? [selectedKey] : []
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>(_selectedKeys)

  const linksList = getLinksList({ links })

  return (
    <div className="w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
      <Listbox aria-label="Actions" selectedKeys={selectedKeys}>
        {linksList}
      </Listbox>
    </div>
  )
}
