'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { api, type Skill, type SkillStats } from '@/lib/api'
import { buildSkillClasses } from '@/lib/skillClasses'
import PageHeader from '@/app/components/drn/PageHeader'
import EmptyState from '@/app/components/drn/EmptyState'
import HowToPanel from '@/app/components/drn/HowToPanel'

type SortKey = 'score' | 'usage' | 'name'

function scoreBadge(score: number) {
  return score >= 85
    ? 'bg-emerald-50 text-emerald-700'
    : score >= 70
      ? 'bg-amber-50 text-amber-700'
      : 'bg-rose-50 text-rose-700'
}

export default function SkillsPage() {
  const [query, setQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('query') ?? ''
    }
    return ''
  })
  const [sort, setSort] = useState<SortKey>('score')
  const [category, setCategory] = useState('All')

  const { data: skillsData, error: skillsError, isLoading: skillsLoading } = useSWR('drn-skills', () =>
    api.skills({ activeOnly: false, sort: 'score', limit: 500 }),
  )
  const { data: stats } = useSWR('drn-skill-stats', () => api.skillStats())

  const classes = useMemo(() => buildSkillClasses(skillsData?.items ?? []), [skillsData])

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const skillClass of classes) {
      const label = skillClass.representative.category || 'uncategorized'
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    return ['All', ...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([label]) => label)]
  }, [classes])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const base = classes.filter((skillClass) => {
      const matchesCategory = category === 'All' || (skillClass.representative.category || 'uncategorized') === category
      if (!matchesCategory) {
        return false
      }
      if (!normalized) {
        return true
      }
      const corpus = [
        skillClass.representative.name,
        skillClass.representative.skill_id,
        skillClass.representative.description,
        ...skillClass.tags,
      ].join('\n').toLowerCase()
      return corpus.includes(normalized)
    })
    return [...base].sort((left, right) => {
      if (sort === 'name') {
        return left.representative.name.localeCompare(right.representative.name)
      }
      if (sort === 'usage') {
        return right.totalSelections - left.totalSelections
      }
      return right.bestScore - left.bestScore
    })
  }, [classes, query, category, sort])

  return (
    <div className='space-y-8'>
      <div className='flex flex-wrap items-center gap-3'>
        <PageHeader
          eyebrow={`${stats?.total_skills_all ?? classes.length} skills · ${stats ? Object.keys(stats.by_origin).length : 0} sources`}
          title='Skill Library'
          description='Every skill OpenSpace knows about — synced, scored, and evolving.'
        />
        <div className='ml-auto flex flex-wrap items-center gap-2.5'>
          <label className='flex items-center gap-2 px-3 py-2 bg-white border border-line rounded-lg shadow-sm text-sm text-stone-400 w-56 focus-within:border-primary transition'>
            <Icon icon='solar:magnifer-line-duotone' width={15} />
            <Input
              type='text'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search skills…'
              className='bg-transparent border-0 shadow-none! outline-none w-full text-ink p-0 h-auto focus-visible:ring-0'
              aria-label='Search skills'
            />
          </label>
          <label className='flex items-center gap-1.5 px-3 py-2 bg-white border border-line rounded-lg shadow-sm text-sm font-medium text-stone-600 cursor-pointer hover:border-stone-300 transition'>
            <span className='text-stone-400 font-normal'>Sort:</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className='bg-transparent outline-none font-medium cursor-pointer'
              aria-label='Sort skills'>
              <option value='score'>Score</option>
              <option value='usage'>Usage</option>
              <option value='name'>Name</option>
            </select>
          </label>
        </div>
      </div>

      <div className='flex flex-wrap gap-2' role='group' aria-label='Filter by category'>
        {categories.map((cat) => {
          const on = category === cat
          const count = cat === 'All'
            ? classes.length
            : classes.filter((skillClass) => (skillClass.representative.category || 'uncategorized') === cat).length
          return (
            <button
              key={cat}
              type='button'
              aria-pressed={on}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 text-[13px] rounded-full transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 ${
                on
                  ? 'font-semibold text-white bg-forest shadow-sm'
                  : 'font-medium text-stone-600 bg-white border border-line shadow-sm hover:border-stone-300'
              }`}>
              {cat} <span className={on ? 'opacity-70 font-normal' : 'text-stone-400'}>{count}</span>
            </button>
          )
        })}
      </div>

      <p className='text-[12px] text-muted font-mono -mt-4'>
        Showing {filtered.length} of {classes.length} skill{classes.length === 1 ? '' : 's'}
        {query.trim() ? ` matching “${query.trim()}”` : ''}
      </p>

      <div className='grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start'>
        <div className='space-y-6'>
          <Card className='rounded-2xl border-line p-5 shadow-sm'>
            <p className='text-[11px] uppercase tracking-[0.14em] text-muted font-medium mb-4'>Skill origins</p>
            {!stats || Object.keys(stats.by_origin).length === 0 ? (
              <p className='text-[12px] text-stone-400'>No origins reported yet.</p>
            ) : (
              <ul className='space-y-1'>
                {Object.entries(stats.by_origin).map(([origin, count]) => (
                  <li key={origin} className='flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-stone-50 transition'>
                    <span className='font-mono text-[12px] text-stone-700 truncate'>{origin}</span>
                    <span className='ml-auto font-mono text-[11px] text-stone-400'>{count}</span>
                    <Icon icon='solar:check-circle-line-duotone' width={14} className='text-emerald-600 shrink-0' />
                  </li>
                ))}
              </ul>
            )}
            <div className='mt-4 pt-4 border-t border-line flex items-center gap-2 text-[12px] text-emerald-700'>
              <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
              {stats ? `${stats.skills_with_activity} skills with activity` : 'Awaiting first sync'}
            </div>
          </Card>

          <HowToPanel />
        </div>

        <div>
          {skillsLoading ? <div className='text-sm text-muted'>Loading skills…</div> : null}
          {skillsError ? (
            <EmptyState
              title='Skills unavailable'
              description={skillsError instanceof Error ? skillsError.message : 'Could not reach the OpenSpace API.'}
            />
          ) : null}

          {!skillsLoading && !skillsError && filtered.length === 0 ? (
            <div className='bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center'>
              <p className='text-lg font-semibold text-stone-600'>No skills match</p>
              <p className='text-[13px] text-stone-400 mt-1'>Try a different search or clear the category filter.</p>
              <button
                type='button'
                onClick={() => { setCategory('All'); setQuery('') }}
                className='mt-4 px-3.5 py-2 text-[13px] font-medium text-forest border border-line bg-white rounded-lg shadow-sm hover:border-stone-300 transition'>
                Clear filters
              </button>
            </div>
          ) : null}

          {!skillsLoading && !skillsError && filtered.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
              {filtered.map((skillClass) => {
                const skill: Skill = skillClass.representative
                return (
                  <Card key={skillClass.classId} className='rounded-2xl border-line p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition flex flex-col'>
                    <div className='flex items-start justify-between gap-2'>
                      <h3 className='font-semibold text-[15px] truncate'>{skill.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${scoreBadge(skillClass.bestScore)}`}>
                        {skillClass.bestScore.toFixed(1)}
                      </span>
                    </div>
                    <p className='text-[13px] text-muted mt-1 leading-relaxed line-clamp-2'>
                      {skill.description || 'No description.'}
                    </p>
                    <div className='flex items-center gap-2 mt-3'>
                      <span className='text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600'>
                        {skill.category || 'uncategorized'}
                      </span>
                      <span className='text-[11px] text-stone-400 font-mono'>{skillClass.totalSelections.toLocaleString()} runs</span>
                      {skillClass.versionCount > 1 ? (
                        <span className='ml-auto text-[11px] text-forest font-medium'>evolved {skillClass.versionCount}×</span>
                      ) : null}
                    </div>
                    <div className='mt-3 flex items-center gap-1.5 text-[11px] text-stone-400'>
                      <span className='font-mono'>{skill.origin || 'unknown origin'}</span>
                      <span className='ml-auto'>{skillClass.activeCount}/{skillClass.versionCount} active</span>
                    </div>
                    <div className='mt-4 pt-3 border-t border-line flex gap-1.5'>
                      <Link
                        href={`/evolution?skill=${encodeURIComponent(skill.skill_id)}`}
                        aria-label={`View lineage for ${skill.name}`}
                        title='View lineage'
                        className='w-8 h-8 grid place-items-center rounded-lg text-stone-400 hover:text-primary hover:bg-lightprimary transition'>
                        <Icon icon='solar:graph-line-duotone' width={15} />
                      </Link>
                      <Link
                        href={`/skills?query=${encodeURIComponent(skill.name)}`}
                        aria-label={`Focus ${skill.name}`}
                        title='Focus'
                        className='w-8 h-8 grid place-items-center rounded-lg text-stone-400 hover:text-primary hover:bg-lightprimary transition'>
                        <Icon icon='solar:folder-line-duotone' width={15} />
                      </Link>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
