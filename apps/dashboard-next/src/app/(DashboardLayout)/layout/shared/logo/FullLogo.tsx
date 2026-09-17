import Link from 'next/link'
import DrnLogo from '@/app/components/drn/DrnLogo'

export default function FullLogo() {
  return (
    <Link href='/' className='flex items-center gap-2.5'>
      <DrnLogo className='h-7 w-auto' variant='navy' />
      <span className='w-px h-6 bg-border' />
      <span className='text-[11px] uppercase tracking-[0.14em] text-muted whitespace-nowrap'>
        OpenSpace
      </span>
    </Link>
  )
}
