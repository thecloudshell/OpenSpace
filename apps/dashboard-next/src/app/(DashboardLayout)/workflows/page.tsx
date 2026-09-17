'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api, type WorkflowSummary } from '@/lib/api'
import PageHeader from '@/app/components/drn/PageHeader'
import EmptyState from '@/app/components/drn/EmptyState'

function scoreBadge(score: number) {
  return score >= 85
    ? 'bg-emerald-50 text-emerald-700'
    : score >= 70
      ? 'bg-amber-50 text-amber-700'
      : 'bg-rose-50 text-rose-700'
}

function formatDuration(workflow: WorkflowSummary): string {
  if (!workflow.execution_time || workflow.execution_time <= 0) {
    return '—'
  }
  const totalSeconds = Math.round(workflow.execution_time)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

function formatStart(startTime: string | null): string {
  if (!startTime) {
    return '—'
  }
  const parsed = new Date(startTime)
  return Number.isFinite(parsed.getTime()) ? parsed.toLocaleString() : '—'
}

export default function WorkflowsPage() {
  const [query, setQuery] = useState('')

  const { data, error, isLoading } = useSWR('drn-workflows', () => api.workflows())

  const filtered = useMemo(() => {
    const items = data?.items ?? []
    const normalized = query.trim().toLowerCase()
    const list = normalized
      ? items.filter((workflow) =>
          workflow.task_name.toLowerCase().includes(normalized) ||
          workflow.task_id.toLowerCase().includes(normalized) ||
          workflow.instruction.toLowerCase().includes(normalized) ||
          workflow.selected_skills.some((skill) => skill.toLowerCase().includes(normalized)))
      : [...items]
    return list.sort((a, b) => new Date(b.start_time ?? 0).getTime() - new Date(a.start_time ?? 0).getTime())
  }, [data, query])

  const items = data?.items ?? []
  const averageSuccess = items.length > 0
    ? ((items.reduce((sum, item) => sum + item.success_rate, 0) / items.length) * 100).toFixed(1)
    : '0.0'

  return (
    <div className='space-y-8'>
      <div className='flex flex-wrap items-center gap-3'>
        <PageHeader
          eyebrow={`${items.length} sessions · ${averageSuccess}% success`}
          title='Workflows'
          description='Recent OpenSpace execution sessions.'
        />
        <div className='ml-auto'>
          <label className='flex items-center gap-2 px-3 py-2 bg-white border border-line rounded-lg shadow-sm text-sm text-stone-400 w-64 focus-within:border-primary transition'>
            <Icon icon='solar:magnifer-line-duotone' width={15} />
            <Input
              type='text'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search sessions…'
              className='bg-transparent border-0 shadow-none! outline-none w-full text-ink p-0 h-auto focus-visible:ring-0'
              aria-label='Search sessions'
            />
          </label>
        </div>
      </div>

      {isLoading ? <div className='text-sm text-muted'>Loading workflows…</div> : null}
      {error ? (
        <EmptyState
          title='Workflows unavailable'
          description={error instanceof Error ? error.message : 'Could not reach the OpenSpace API.'}
        />
      ) : null}

      {!isLoading && !error && filtered.length === 0 ? (
        <EmptyState
          title={query ? 'No sessions match' : 'No workflow sessions'}
          description={query ? 'Try a different search.' : 'Recorded OpenSpace runs will appear here once workflows execute.'}
        />
      ) : null}

      {!isLoading && !error && filtered.length > 0 ? (
        <Card className='rounded-2xl border-line shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='text-[11px] uppercase tracking-[0.12em] text-stone-400'>
                  <TableHead className='font-medium'>Session</TableHead>
                  <TableHead className='font-medium'>Task</TableHead>
                  <TableHead className='font-medium'>Skills used</TableHead>
                  <TableHead className='font-medium'>Status</TableHead>
                  <TableHead className='font-medium'>Duration</TableHead>
                  <TableHead className='font-medium'>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((workflow) => {
                  const successPct = workflow.success_rate * 100
                  const succeeded = successPct >= 100
                  return (
                    <TableRow key={workflow.id} className='hover:bg-stone-50/70'>
                      <TableCell className='font-mono text-[12px] text-stone-500'>
                        <div>{workflow.task_id}</div>
                        <div className='text-[11px] text-stone-400'>{formatStart(workflow.start_time)}</div>
                      </TableCell>
                      <TableCell className='font-medium max-w-[320px]'>
                        <div className='truncate' title={workflow.task_name}>{workflow.task_name || 'Untitled session'}</div>
                        <div className='text-[11px] text-muted font-normal truncate' title={workflow.instruction}>
                          {workflow.instruction ? workflow.instruction.slice(0, 80) : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        {workflow.selected_skills.length === 0 ? (
                          <span className='text-[12px] text-stone-400'>—</span>
                        ) : (
                          <div className='flex flex-wrap gap-1'>
                            {workflow.selected_skills.slice(0, 2).map((skillId, index) => (
                              <span key={`${skillId}-${index}`} className='font-mono text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 truncate max-w-[180px]'>
                                {skillId}
                              </span>
                            ))}
                            {workflow.selected_skills.length > 2 ? (
                              <span className='text-[11px] text-stone-400'>+{workflow.selected_skills.length - 2}</span>
                            ) : null}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {succeeded ? (
                          <span className='inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full'>
                            <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                            success
                          </span>
                        ) : (
                          <span className='inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full'>
                            <span className='w-1.5 h-1.5 rounded-full bg-rose-500' />
                            partial
                          </span>
                        )}
                      </TableCell>
                      <TableCell className='font-mono text-[12px] text-stone-500'>{formatDuration(workflow)}</TableCell>
                      <TableCell>
                        <span className={`font-mono text-[12px] font-semibold px-2 py-0.5 rounded-full ${scoreBadge(successPct)}`}>
                          {successPct.toFixed(0)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
