import { Card } from '@/components/ui/card'

export default function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Card className='rounded-2xl border-dashed border-stone-300 p-12 text-center'>
      <p className='text-lg font-semibold text-stone-600'>{title}</p>
      {description ? <p className='text-[13px] text-stone-400 mt-1'>{description}</p> : null}
    </Card>
  )
}
