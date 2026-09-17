'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Card } from '@/components/ui/card'

interface StatCardProps {
  icon: ReactNode
  iconClassName: string
  value: number
  decimals?: number
  suffix?: string
  label: string
  badge?: string
  sparkPoints?: number[]
  sparkColor?: string
}

function useCountUp(target: number, decimals: number, duration = 1100): string {
  const [display, setDisplay] = useState((0).toFixed(decimals))
  const rafRef = useRef(0)

  useEffect(() => {
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay((target * eased).toFixed(decimals))
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, decimals, duration])

  return display
}

export default function StatCard({ icon, iconClassName, value, decimals = 0, suffix = '', label, badge, sparkPoints, sparkColor = '#050B2E' }: StatCardProps) {
  const display = useCountUp(value, decimals)
  const sparkPath = sparkPoints && sparkPoints.length > 1
    ? 'M' + sparkPoints.map((p, i) => `${((i / (sparkPoints.length - 1)) * 100).toFixed(1)},${(26 - p).toFixed(1)}`).join(' L')
    : null

  return (
    <Card className='rounded-2xl border-line p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition'>
      <div className='flex items-start justify-between'>
        <span className={`w-9 h-9 rounded-lg grid place-items-center ${iconClassName}`}>{icon}</span>
        {badge ? (
          <span className='inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full'>{badge}</span>
        ) : null}
      </div>
      <p className='mt-4 text-2xl font-semibold tabular-nums'>{display}{suffix}</p>
      <p className='mt-1 text-[11px] uppercase tracking-[0.12em] text-muted'>{label}</p>
      {sparkPath ? (
        <svg className='mt-3 w-full h-8' viewBox='0 0 100 32' preserveAspectRatio='none'>
          <path d={sparkPath} fill='none' stroke={sparkColor} strokeWidth='2' strokeLinecap='round' />
        </svg>
      ) : null}
    </Card>
  )
}
