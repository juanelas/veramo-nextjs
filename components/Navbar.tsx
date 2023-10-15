'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export interface PageLink {
  key?: string
  text: string
  url: string
}
export interface NavbarProps {
  navBarType: 'vertical-navbar' | 'horizontal-navbar'
  links: PageLink[]
  activeKey?: string
}

interface NavBarType {
  listChild: string
  'listChild:active': string
  listParent: string
  container: string
}
interface NavBarTypes {
  [navBarType: string]: NavBarType
}

const navBarTypes: NavBarTypes = {
  'vertical-navbar': {
    listChild: 'block hover:bg-gray-100 px-4 py-2',
    'listChild:active': "bg-gray-200",
    listParent: '',
    container: 'w-full mb-7'
  },
  'horizontal-navbar': {
    listChild: 'hover:bg-gray-100 px-4 py-3',
    'listChild:active': "bg-gray-200",
    listParent: 'flex place-content-center space-x-12 border-solid border-b-2 border-gray-200',
    container: 'w-full pb-6'
  }
}

function getActiveKey(links: Required<PageLink>[]): string {
  const path = usePathname()
  const pathItems = path.split('/')

  let keyOfLinkWithLargestCommonPath: string = ''

  let maxCommonPathLength = 0

  for (const link of links) {
    const linkPathItems = link.url.split('/')
    const maxSharedItems = Math.min(pathItems.length, linkPathItems.length)
    let commonPathLength = 0

    for (let i = 0; i < maxSharedItems; i++) {
      if (pathItems[i] === linkPathItems[i]) {
        commonPathLength += 1
      } else {
        break
      }
    }

    if (commonPathLength > maxCommonPathLength) {
      maxCommonPathLength = commonPathLength
      keyOfLinkWithLargestCommonPath = link.key
    }
  }

  return keyOfLinkWithLargestCommonPath
}

export default function Navbar({ navBarType, links, activeKey }: NavbarProps) {
  type getLinksListArgs = Omit<NavbarProps, 'navBarType' | 'activeKey'> & { style?: string }

  function getLinksList(props: getLinksListArgs) {
    return props.links.map((link, index) => {
      const key = link.key ?? String(index)
      let className = props.style ?? ''
      if ((activeKeyId === '' && index === 0) || (activeKeyId !== '' && activeKeyId === key)) {
        className += ` ${navBarTypes[navBarType]["listChild:active"]}`
      }
      return (
        <Link className={className} key={key} href={link.url} onClick={() => { setActiveKeyId(key) }}>{link.text}</Link>
      )
    })
  }

  const pageLinks = links.map<Required<PageLink>>((link, index) => {
    const key = link.key ?? String(index)
    return {
      key,
      url: link.url,
      text: link.text
    }
  })


  const [activeKeyId, setActiveKeyId] = useState<string>(activeKey ?? getActiveKey(pageLinks))

  const linksList = getLinksList({ links, style: navBarTypes[navBarType].listChild })

  return (
    <nav className={navBarTypes[navBarType].container}>
      <div className={navBarTypes[navBarType].listParent}>
        {linksList}
      </div>
    </nav>
  )
};
