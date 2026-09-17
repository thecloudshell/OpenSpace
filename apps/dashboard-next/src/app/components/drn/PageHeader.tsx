export default function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div>
      {eyebrow ? <p className='text-[11px] uppercase tracking-[0.16em] text-muted font-medium'>{eyebrow}</p> : null}
      <h1 className='font-semibold text-3xl tracking-tight mt-1'>{title}</h1>
      {description ? <p className='text-muted mt-1 text-[15px]'>{description}</p> : null}
    </div>
  )
}
