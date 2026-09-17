'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api, type OverviewResponse } from '@/lib/api'
import StatCard from '@/app/components/drn/StatCard'
import PageHeader from '@/app/components/drn/PageHeader'
import EmptyState from '@/app/components/drn/EmptyState'
import HowToPanel from '@/app/components/drn/HowToPanel'

const SPARK_SKILLS = [26, 22, 24, 16, 18, 10, 12, 4]
const SPARK_SCORE = [20, 18, 21, 14, 15, 9, 7, 7]
const SPARK_WORKFLOWS = [24, 20, 22, 15, 17, 8, 10, 10]
const SPARK_SUCCESS = [22, 19, 16, 18, 11, 12, 5, 5]

function scoreBadge(score: number) {
  return score >= 85
    ? 'bg-emerald-50 text-emerald-700'
    : score >= 70
      ? 'bg-amber-50 text-amber-700'
      : 'bg-rose-50 text-rose-700'
}

export default function DashboardPage() {
  const { data, error, mutate, isLoading } = useSWR<OverviewResponse>('drn-overview', () => api.overview())

  if (isLoading) {
    return <div className='text-sm text-muted py-10'>Loading dashboard…</div>
  }

  if (error || !data) {
    return (
      <div className='space-y-4'>
        <EmptyState
          title='Dashboard unavailable'
          description={error instanceof Error ? error.message : 'Could not reach the OpenSpace API. Is openspace-dashboard running on port 7788?'}
        />
        <Button variant='outline' onClick={() => void mutate()}>Retry</Button>
      </div>
    )
  }

  const health = data.health
  const healthy = health.status === 'ok'

  return (
    <div className='space-y-12'>
      <PageHeader
        eyebrow={`Local runtime · ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
        title='Dashboard'
        description={`${data.skills.summary.total_skills_all} skills tracked · ${data.workflows.total} workflow sessions recorded.`}
      />

      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          icon={<Icon icon='solar:layers-line-duotone' width={20} />}
          iconClassName='bg-lightprimary text-primary'
          value={data.skills.summary.total_skills_all}
          label='Total skills'
          badge={`${data.skills.summary.total_skills} active`}
          sparkPoints={SPARK_SKILLS}
          sparkColor='#050B2E'
        />
        <StatCard
          icon={<Icon icon='solar:chart-2-line-duotone' width={20} />}
          iconClassName='bg-lightprimary text-primary'
          value={data.skills.average_score}
          decimals={1}
          label='Average skill score'
          sparkPoints={SPARK_SCORE}
          sparkColor='#050B2E'
        />
        <StatCard
          icon={<Icon icon='solar:server-path-line-duotone' width={20} />}
          iconClassName='bg-amber-50 text-amber-700'
          value={data.workflows.total}
          label='Workflow sessions'
          sparkPoints={SPARK_WORKFLOWS}
          sparkColor='#d99a2b'
        />
        <StatCard
          icon={<Icon icon='solar:check-circle-line-duotone' width={20} />}
          iconClassName='bg-stone-100 text-stone-700'
          value={data.workflows.average_success_rate}
          decimals={1}
          suffix='%'
          label='Workflow success'
          sparkPoints={SPARK_SUCCESS}
          sparkColor='#57534e'
        />
      </section>

      <section className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>
        <Card className='rounded-2xl border-line p-6 shadow-sm'>
          <div className='flex items-center gap-3 mb-1'>
            <span className='relative flex w-2.5 h-2.5'>
              <span className={`absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping ${healthy ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span className={`relative inline-flex w-2.5 h-2.5 rounded-full ${healthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </span>
            <h2 className='text-xl font-semibold tracking-tight'>Runtime snapshot</h2>
            <span className={`ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
              healthy ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
            }`}>
              {healthy ? 'Healthy' : health.status}
            </span>
          </div>
          <dl className='divide-y divide-line mt-2'>
            <div className='flex items-center justify-between py-2.5'>
              <dt className='text-[13px] text-muted'>Status</dt>
              <dd className='text-[13px] font-medium flex items-center gap-1.5'>
                <span className={`w-1.5 h-1.5 rounded-full ${healthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {health.status}
              </dd>
            </div>
            <div className='flex items-center justify-between py-2.5 gap-4'>
              <dt className='text-[13px] text-muted shrink-0'>DB path</dt>
              <dd className='font-mono text-[12px] text-stone-600 truncate' title={health.db_path}>{health.db_path}</dd>
            </div>
            <div className='flex items-center justify-between py-2.5 gap-4'>
              <dt className='text-[13px] text-muted shrink-0'>Evidence DB path</dt>
              <dd className='font-mono text-[12px] text-stone-600 truncate' title={health.evidence_db_path}>{health.evidence_db_path}</dd>
            </div>
            <div className='flex items-center justify-between py-2.5'>
              <dt className='text-[13px] text-muted'>Workflow count</dt>
              <dd className='font-mono text-[12px] text-stone-600'>{health.workflow_count}</dd>
            </div>
            <div className='flex items-center justify-between py-2.5'>
              <dt className='text-[13px] text-muted'>Built frontend</dt>
              <dd className='text-[13px] font-medium flex items-center gap-1.5'>
                <span className={`w-1.5 h-1.5 rounded-full ${health.frontend_dist_exists ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {health.frontend_dist_exists ? 'yes' : 'no'}
              </dd>
            </div>
          </dl>
          <Button variant='outline' className='mt-5' onClick={() => void mutate()}>
            <Icon icon='solar:refresh-line-duotone' width={14} className='mr-1.5' />
            Re-check
          </Button>
        </Card>

        <HowToPanel />
      </section>

      <section className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>
        <Card className='rounded-2xl border-line p-6 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold tracking-tight'>Top scored skills</h2>
            <Link href='/skills' className='text-[13px] font-semibold text-primary hover:underline'>View all</Link>
          </div>
          {data.skills.top.length === 0 ? (
            <EmptyState title='No skills yet' description='Add a skill folder and OpenSpace will track it here.' />
          ) : (
            <div className='space-y-3'>
              {data.skills.top.map((skill) => (
                <div key={skill.skill_id} className='flex items-center gap-3 py-2 border-b border-line last:border-0'>
                  <div className='min-w-0 flex-1'>
                    <div className='font-semibold text-[14px] truncate'>{skill.name}</div>
                    <div className='text-[12px] text-muted truncate'>{skill.skill_id}</div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${scoreBadge(skill.score)}`}>
                    {skill.score.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className='rounded-2xl border-line p-6 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold tracking-tight'>Recent sessions</h2>
            <Link href='/workflows' className='text-[13px] font-semibold text-primary hover:underline'>View all</Link>
          </div>
          {data.workflows.recent.length === 0 ? (
            <EmptyState title='No workflow sessions' description='Recorded OpenSpace runs will appear here.' />
          ) : (
            <div className='space-y-3'>
              {data.workflows.recent.map((workflow) => (
                <div key={workflow.id} className='flex items-center gap-3 py-2 border-b border-line last:border-0'>
                  <div className='min-w-0 flex-1'>
                    <div className='font-semibold text-[14px] truncate'>{workflow.task_name || workflow.task_id}</div>
                    <div className='text-[12px] text-muted'>
                      {workflow.total_steps} steps{'\u00B7'}{workflow.agent_action_count} agent actions{' '}
                      {workflow.start_time ? ' \u00B7 ' + new Date(workflow.start_time).toLocaleString() : ''}
                    </div>
                  </div>
                  <span className={'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ' + scoreBadge(workflow.success_rate * 100)}>
                    {(workflow.success_rate * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
