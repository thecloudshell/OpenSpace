'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'

const CLI_TEXT = 'openspace-upload-skill --skill-dir /path\nopenspace-download-skill <id>'

const STEPS = [
  'Drop a folder with a SKILL.md into .openspace/skills/ (project) or ~/.openspace/skills/ (global).',
  'Or copy any existing skill folder from ~/.claude/skills or ~/.agents/skills.',
  'Ask your agent (Kimi / Claude / Codex): “search OpenSpace for a skill that does X”.',
  'Use the CLI to share to or pull from the cloud (commands below).',
  'OpenSpace auto-discovers, safety-checks and tracks it in this dashboard.',
]

export default function HowToPanel() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CLI_TEXT)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = CLI_TEXT
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className='bg-forest text-white rounded-2xl p-6 shadow-sm relative overflow-hidden'>
      <Icon
        icon='solar:layers-line-duotone'
        width={180}
        className='absolute -right-6 -bottom-8 opacity-10 text-white'
      />
      <h2 className='text-xl font-semibold tracking-tight'>How to add more skills</h2>
      <p className='text-[13px] text-stone-300 mt-1 mb-5 max-w-md'>
        Five ways to grow your library — drop a folder, ask your agent, or use the CLI to share with the cloud.
      </p>
      <ol className='space-y-2.5 text-[13px] text-stone-200'>
        {STEPS.map((step, index) => (
          <li key={index} className='flex gap-2.5'>
            <span className='font-mono text-[#ED1C24] font-semibold'>{String(index + 1).padStart(2, '0')}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className='relative mt-5 max-w-md'>
        <pre className='bg-[#1c1917] text-stone-200 font-mono text-[12px] leading-relaxed rounded-xl p-4 pr-24 overflow-x-auto'>
          <code>
            <span className='text-[#ED1C24]'>openspace-upload-skill</span> --skill-dir /path{'\n'}
            <span className='text-[#ED1C24]'>openspace-download-skill</span> &lt;id&gt;
          </code>
        </pre>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={() => void copy()}
          className='absolute top-2.5 right-2.5 h-7 text-[11px] bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white'>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}
