import { uniqueId } from 'lodash'

export interface ChildItem {
  id?: number | string
  name?: string
  icon?: any
  children?: ChildItem[]
  item?: any
  url?: any
  color?: string
  disabled?: boolean
  subtitle?: string
  badge?: boolean
  badgeType?: string
  isPro?: boolean
}

export interface MenuItem {
  heading?: string
  name?: string
  icon?: any
  id?: number
  to?: string
  items?: MenuItem[]
  children?: ChildItem[]
  url?: any
  disabled?: boolean
  subtitle?: string
  badgeType?: string
  badge?: boolean
  isPro?: boolean
}

const SidebarContent: MenuItem[] = [
  {
    heading: 'OpenSpace',
    children: [
      {
        name: 'Dashboard',
        icon: 'solar:widget-add-line-duotone',
        id: uniqueId(),
        url: '/',
      },
      {
        name: 'Skills',
        icon: 'solar:layers-line-duotone',
        id: uniqueId(),
        url: '/skills',
      },
      {
        name: 'Evolution',
        icon: 'solar:chart-line-duotone',
        id: uniqueId(),
        url: '/evolution',
      },
      {
        name: 'Workflows',
        icon: 'solar:playlist-line-duotone',
        id: uniqueId(),
        url: '/workflows',
      },
    ],
  },
]

export default SidebarContent
