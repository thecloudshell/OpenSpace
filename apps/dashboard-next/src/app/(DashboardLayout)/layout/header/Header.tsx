'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import { useTheme } from 'next-themes'
import SidebarLayout from '../sidebar/Sidebar'
import DrnLogo from '@/app/components/drn/DrnLogo'
import { api, type HealthPayload } from '@/lib/api'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

const fetchHealth = async (): Promise<HealthPayload | null> => {
  try {
    return await api.health()
  } catch {
    return null
  }
}

function ApiStatusChip() {
  const { data } = useSWR('drn-health', fetchHealth, { refreshInterval: 30000 })
  const healthy = !!data && data.status === 'ok'
  return (
    <span className='hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 border border-white/15 rounded-full font-mono text-[11px] text-stone-300'>
      <span className={`w-1.5 h-1.5 rounded-full ${healthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
      API {healthy ? 'healthy' : 'offline'}
    </span>
  )
}

const Header = () => {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <>
      <header className='sticky top-0 z-2 bg-forest border-b border-white/10'>
        <nav className='h-[68px] max-w-full! flex justify-between items-center px-6'>
          {/* Mobile Toggle Icon */}
          <div
            onClick={() => {
              setIsOpen(true)
            }}
            className='px-[15px] text-stone-300 hover:text-white relative after:absolute after:w-10 after:h-10 after:rounded-full hover:after:bg-white/10 after:bg-transparent rounded-full xl:hidden flex justify-center items-center cursor-pointer'>
            <Icon icon='tabler:menu-2' height={20} width={20} />
          </div>

          <div className='flex items-center gap-3.5'>
            <Link href='/' className='flex items-center gap-3.5 group shrink-0'>
              <DrnLogo className='h-8 w-auto' variant='white' />
              <span className='w-px h-7 bg-white/20' />
              <span className='text-[12px] uppercase tracking-[0.14em] text-stone-300'>
                OpenSpace · Local Dashboard
              </span>
            </Link>
          </div>

          <div className='flex items-center gap-2.5'>
            <ApiStatusChip />
            <div
              className='hover:text-white px-2 text-stone-300 group focus:ring-0 rounded-full flex justify-center items-center cursor-pointer relative'
              onClick={toggleMode}>
              <span className='flex items-center justify-center relative after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2 group-hover:after:bg-white/10'>
                {theme === 'light' ? (
                  <Icon icon='tabler:moon' width='20' />
                ) : (
                  <Icon
                    icon='solar:sun-bold-duotone'
                    width='20'
                    className='group-hover:text-white'
                  />
                )}
              </span>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side='left' className='w-64 p-0'>
          <VisuallyHidden>
            <SheetTitle>sidebar</SheetTitle>
          </VisuallyHidden>
          <SidebarLayout onClose={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}

export default Header
