'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'
import { api, type LineageNode } from '@/lib/api'
import PageHeader from '@/app/components/drn/PageHeader'
import EmptyState from '@/app/components/drn/EmptyState'

function scoreBadge(score: number) {
  return score >= 85
    ? 'bg-emerald-50 text-emerald-700'
    : score >= 70
      ? 'bg-amber-50 text-amber-700'
      : 'bg-rose-50 text-rose-700'
}

export default function EvolutionPage() {
  const initialSkill = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('skill') ?? ''
    : ''

  const { data: skillsData } = useSWR('drn-evolution-skills', () =>
    api.skills({ activeOnly: false, sort: 'updated', limit: 200 }),
  )
  const [selectedSkill, setSelectedSkill] = useState(initialSkill)

  const pickable = useMemo(() => {
    const items = skillsData?.items ?? []
    // Surface skills that have lineage (parents or children) first.
    const ids = new Set(items.map((skill) => skill.skill_id))
    const withLineage = items.filter(
      (skill) => skill.parent_skill_ids.some((parent) => ids.has(parent)) ||
        items.some((other) => other.parent_skill_ids.includes(skill.skill_id)),
    )
    return withLineage.length > 0 ? withLineage : items
  }, [skillsData])

  const effectiveSkill = selectedSkill || pickable[0]?.skill_id || ''

  const { data: lineage, error: lineageError, isLoading: lineageLoading } = useSWR(
    effectiveSkill ? `drn-lineage-${effectiveSkill}` : null,
    () => api.skillLineage(effectiveSkill),
  )

  const generations = useMemo(() => {
    if (!lineage || lineage.nodes.length === 0) {
      return []
    }
    const byGeneration = new Map<number, LineageNode[]>()
    for (const node of [...lineage.nodes].sort((a, b) => a.generation - b.generation || a.created_at.localeCompare(b.created_at))) {
      const list = byGeneration.get(node.generation) ?? []
      list.push(node)
      byGeneration.set(node.generation, list)
    }
    return [...byGeneration.entries()].sort((a, b) => a[0] - b[0])
  }, [lineage])

  return (
    <div className='space-y-8'>
      <PageHeader
        eyebrow='Lineage & version history'
        title='Evolution'
        description='How each skill improved over generations — scores, parents, and what changed.'
      />

      {pickable.length === 0 ? (
        <EmptyState
          title='No skills to trace yet'
          description='Once your skill store has records with lineage, pick one here to see its version graph.'
        />
      ) : (
        <div className='flex flex-wrap gap-2' role='group' aria-label='Select skill'>
          {pickable.slice(0, 24).map((skill) => {
            const on = skill.skill_id === effectiveSkill
            return (
              <button
                key={skill.skill_id}
                type='button'
                aria-pressed={on}
                onClick={() => setSelectedSkill(skill.skill_id)}
                className={`px-3.5 py-1.5 text-[13px] rounded-full transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 font-mono ${
                  on
                    ? 'font-semibold text-white bg-forest shadow-sm ring-1 ring-forest/30'
                    : 'font-medium text-stone-600 bg-white border border-line shadow-sm hover:border-stone-300'
                }`}>
                {skill.name}
                <span className={on ? 'opacity-70 font-normal' : 'text-stone-400'}> {skill.score.toFixed(0)}</span>
              </button>
            )
          })}
        </div>
      )}

      {lineageLoading ? <div className='text-sm text-muted'>Loading lineage…</div> : null}
      {lineageError ? (
        <EmptyState title='Lineage unavailable' description={lineageError instanceof Error ? lineageError.message : 'Could not load lineage.'} />
      ) : null}

      {!lineageLoading && lineage && generations.length === 0 ? (
        <EmptyState
          title='No lineage for this skill'
          description='This skill has a single generation — no parents or children recorded yet.'
        />
      ) : null}

      {!lineageLoading && lineage && generations.length > 0 ? (
        <Card className='rounded-2xl border-line p-6 sm:p-8 shadow-sm'>
          <div className='flex flex-col sm:flex-row items-stretch gap-3'>
            {generations.map(([generation, nodes], generationIndex) => (
              <div key={generation} className='flex sm:flex-row items-stretch gap-3 flex-1'>
                <div className='flex-1 min-w-[160px] bg-cream border border-line rounded-2xl p-5 text-center relative'>
                  {generationIndex === generations.length - 1 ? (
                    <span className='absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-forest text-white'>
                      current
                    </span>
                  ) : null}
                  {nodes.map((node) => (
                    <div key={node.skill_id} className={nodes.length > 1 ? 'py-2 border-b border-line last:border-0' : ''}>
                      <p className='font-mono text-[13px] font-semibold text-stone-500'>
                        {node.name} <span className='text-ink'>gen {node.generation}</span>
                      </p>
                      <p className='text-3xl font-semibold mt-1.5 tabular-nums'>{node.score.toFixed(0)}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold mt-1 ${scoreBadge(node.score)}`}>
                        {node.score.toFixed(1)}
                      </span>
                      <p className='text-[12px] text-muted mt-2 leading-relaxed truncate' title={node.description}>
                        {node.description || 'No description.'}
                      </p>
                      <p className='text-[11px] text-stone-400 font-mono mt-1'>{node.total_selections.toLocaleString()} runs</p>
                      <Link
                        href={`/skills?query=${encodeURIComponent(node.name)}`}
                        className='text-[11px] font-semibold text-primary hover:underline inline-block mt-1'>
                        View in library
                      </Link>
                    </div>
                  ))}
                </div>
                {generationIndex < generations.length - 1 ? (
                  <div className='hidden sm:flex items-center justify-center shrink-0 text-stone-400'>
                    <Icon icon='solar:arrow-right-line-duotone' width={22} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <p className='mt-6 text-[13px] text-muted text-center'>
            {lineage.total_nodes} version{lineage.total_nodes === 1 ? '' : 's'} · {lineage.edges.length} parent link{lineage.edges.length === 1 ? '' : 's'} across {generations.length} generation{generations.length === 1 ? '' : 's'}
          </p>
        </Card>
      ) : null}
    </div>
  )
}
