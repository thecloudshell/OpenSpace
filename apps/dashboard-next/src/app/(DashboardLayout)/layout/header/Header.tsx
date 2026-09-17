'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import SidebarLayout from '../sidebar/Sidebar'
import DrnLogo from '@/app/components/drn/DrnLogo'
import HowToPanel from '@/app/components/drn/HowToPanel'
import { api, type HealthPayload } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [isOpen, setIsOpen] = useState(false)
  const [addSkillOpen, setAddSkillOpen] = useState(false)

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
            <Button
              type='button'
              onClick={() => setAddSkillOpen(true)}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-signal hover:bg-signal-dark rounded-lg shadow-sm transition'>
              <Icon icon='tabler:plus' width={14} height={14} />
              Add Skill
            </Button>
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

      {/* Add Skill dialog */}
      <Dialog open={addSkillOpen} onOpenChange={setAddSkillOpen}>
        <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0'>
          <VisuallyHidden>
            <DialogTitle>How to add more skills</DialogTitle>
            <DialogDescription>
              Five ways to grow your library — drop a folder, ask your agent, or use the CLI.
            </DialogDescription>
          </VisuallyHidden>
          <HowToPanel className='rounded-none' />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Header
